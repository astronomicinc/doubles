import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { capturePaymentIntent, cancelPaymentIntent } from '@/app/actions/stripe';
import { updateApplicationStatus } from '@/app/actions/applications';
import {
  sendApprovalEmail,
  sendRejectionEmail,
  sendPlusOneInvitationEmail,
} from '@/app/actions/emails';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface AdminDecisionRequest {
  applicationId: string;
  decision: 'approved' | 'rejected';
  reason?: string;
  eventDate?: string;
  eventVenue?: string;
}

/**
 * POST /api/admin/decision
 * Admin approval/rejection of applications with payment handling and email notifications
 *
 * Flow:
 * 1. Verify admin authentication via Bearer token
 * 2. Validate request payload
 * 3. Retrieve application and payment records
 * 4. Update application status in database
 * 5. Handle Stripe payment (capture or cancel)
 * 6. Send notification emails
 * 7. Update payment record status
 * 8. Return success response
 */
export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Step 1: Extract and verify Bearer token
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // Verify token and get user
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Step 2: Verify user is admin
    const { data: adminRole, error: adminError } = await supabase
      .from('admin_roles')
      .select('user_id')
      .eq('user_id', user.id)
      .single();

    if (adminError || !adminRole) {
      return NextResponse.json(
        { success: false, error: 'User is not an admin' },
        { status: 403 }
      );
    }

    // Step 3: Parse and validate request payload
    const body: AdminDecisionRequest = await request.json();

    const { applicationId, decision, reason, eventDate, eventVenue } = body;

    if (!applicationId || !decision) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: applicationId, decision' },
        { status: 400 }
      );
    }

    if (decision !== 'approved' && decision !== 'rejected') {
      return NextResponse.json(
        { success: false, error: 'Invalid decision. Must be "approved" or "rejected"' },
        { status: 400 }
      );
    }

    if (decision === 'rejected' && !reason) {
      return NextResponse.json(
        { success: false, error: 'Rejection reason is required' },
        { status: 400 }
      );
    }

    // Step 4: Get application and related data
    const { data: application, error: appError } = await supabase
      .from('applications')
      .select('id, applicant_user_id, applicant_payment_intent_id, applicant_status, admin_decision')
      .eq('id', applicationId)
      .single();

    if (appError || !application) {
      return NextResponse.json(
        { success: false, error: 'Application not found' },
        { status: 404 }
      );
    }

    // Get payment intent ID
    const paymentIntentId = application.applicant_payment_intent_id;
    if (!paymentIntentId) {
      return NextResponse.json(
        { success: false, error: 'Application has no payment intent' },
        { status: 400 }
      );
    }

    // Get applicant email and name for notifications
    const { data: { users } } = await supabase.auth.admin.listUsers();
    const applicantUser = users?.find(u => u.id === application.applicant_user_id);
    const applicantEmail = applicantUser?.email || '';
    const applicantName = applicantUser?.user_metadata?.name || 'Applicant';

    // Get plus_one info for approval emails
    const { data: plusOne } = await supabase
      .from('plus_ones')
      .select('email, name')
      .eq('application_id', applicationId)
      .single();

    // Step 5: Update application status
    console.log(`Processing ${decision} for application ${applicationId}...`);
    await updateApplicationStatus(applicationId, decision, reason);

    // Step 6: Handle Stripe payment
    let stripeSuccess = true;
    let stripeError: string | null = null;

    try {
      if (decision === 'approved') {
        console.log(`Capturing payment intent ${paymentIntentId}...`);
        const captureResult = await capturePaymentIntent(paymentIntentId);
        if (!captureResult.success) {
          stripeError = 'Failed to capture payment';
          console.error('Payment capture failed:', captureResult);
          // Non-fatal: continue with email but log error
          stripeSuccess = false;
        }
      } else {
        // Rejected: cancel the payment intent
        console.log(`Cancelling payment intent ${paymentIntentId}...`);
        const cancelResult = await cancelPaymentIntent(paymentIntentId);
        if (!cancelResult.success) {
          stripeError = 'Failed to cancel payment';
          console.error('Payment cancellation failed:', cancelResult);
          // Non-fatal: continue with email but log error
          stripeSuccess = false;
        }
      }
    } catch (stripeErr) {
      console.error('Stripe operation error:', stripeErr);
      stripeError = stripeErr instanceof Error ? stripeErr.message : 'Unknown Stripe error';
      stripeSuccess = false;
    }

    // Step 7: Send notification emails
    try {
      if (decision === 'approved') {
        console.log(`Sending approval email to ${applicantEmail}...`);
        const approvalEventDate = eventDate || 'TBA';
        const approvalEventVenue = eventVenue || 'TBA';

        await sendApprovalEmail(applicantEmail, applicantName, approvalEventDate, approvalEventVenue);

        // Send plus-one invitation if they have an email
        if (plusOne?.email) {
          console.log(`Sending plus-one invitation to ${plusOne.email}...`);
          // Note: plusOneId should come from plus_ones table lookup
          const { data: plusOneRecord } = await supabase
            .from('plus_ones')
            .select('id')
            .eq('application_id', applicationId)
            .single();

          if (plusOneRecord) {
            await sendPlusOneInvitationEmail(
              plusOne.email,
              plusOne.name,
              applicantName,
              plusOneRecord.id
            );
          }
        }
      } else {
        // Rejection
        console.log(`Sending rejection email to ${applicantEmail}...`);
        await sendRejectionEmail(applicantEmail, applicantName, reason);
      }
    } catch (emailErr) {
      console.error('Email send error (non-fatal):', emailErr);
      // Non-fatal: don't fail the request if email fails
    }

    // Step 8: Update payment record status
    const paymentStatus = decision === 'approved' ? 'captured' : 'cancelled';
    const { error: paymentUpdateError } = await supabase
      .from('payments')
      .update({
        status: paymentStatus,
        [decision === 'approved' ? 'captured_at' : 'cancelled_at']: new Date().toISOString(),
      })
      .eq('stripe_intent_id', paymentIntentId);

    if (paymentUpdateError) {
      console.error('Payment record update error:', paymentUpdateError);
      // Non-fatal: don't fail the request
    }

    // Step 9: Return success response
    const message = decision === 'approved'
      ? `Application approved. Payment captured. Confirmation email sent to ${applicantEmail}.`
      : `Application rejected. Payment cancelled. Rejection email sent to ${applicantEmail}.`;

    return NextResponse.json({
      success: true,
      message,
      applicationId,
      decision,
      stripeSuccess,
      stripeError: stripeError || null,
    });
  } catch (error) {
    console.error('POST /api/admin/decision error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
