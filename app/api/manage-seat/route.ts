import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cancelPaymentIntent } from '@/app/actions/stripe';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * POST /api/manage-seat
 * Handle plus-one swap or seat cancellation:
 * 1. Verify user is authenticated
 * 2. Validate user owns the application
 * 3. If action='swap': Update plus_one record with new info
 * 4. If action='cancel': Cancel application and Stripe hold
 * 5. Return success message
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, applicationId, newFriendName, newFriendEmail, newFriendGender } = body;

    if (!action || !applicationId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: action, applicationId' },
        { status: 400 }
      );
    }

    // Verify user authentication via Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // Verify token and get user
    const { data: userData, error: authError } = await supabase.auth.getUser(token);
    if (authError || !userData.user) {
      return NextResponse.json(
        { success: false, error: 'Invalid authentication token' },
        { status: 401 }
      );
    }

    const userId = userData.user.id;

    // Verify user owns this application
    const { data: application, error: appError } = await supabase
      .from('applications')
      .select('id, applicant_user_id, applicant_payment_intent_id, applicant_status')
      .eq('id', applicationId)
      .single();

    if (appError || !application) {
      return NextResponse.json(
        { success: false, error: 'Application not found' },
        { status: 404 }
      );
    }

    if (application.applicant_user_id !== userId) {
      return NextResponse.json(
        { success: false, error: 'You do not own this application' },
        { status: 403 }
      );
    }

    // Handle different actions
    if (action === 'swap') {
      if (!newFriendName || !newFriendEmail) {
        return NextResponse.json(
          { success: false, error: 'Missing required fields for swap: newFriendName, newFriendEmail' },
          { status: 400 }
        );
      }

      // Update the plus_one record
      const { error: updateError } = await supabase
        .from('plus_ones')
        .update({
          name: newFriendName,
          email: newFriendEmail,
          gender: newFriendGender || null,
          status: 'invited',
          invited_at: new Date().toISOString(),
        })
        .eq('application_id', applicationId);

      if (updateError) {
        throw new Error(`Failed to update plus_one: ${updateError.message}`);
      }

      return NextResponse.json({
        success: true,
        message: 'Plus-one information updated successfully',
      });
    } else if (action === 'cancel') {
      // Cancel the application and the Stripe payment hold
      const { error: cancelError } = await supabase
        .from('applications')
        .update({
          applicant_status: 'cancelled',
        })
        .eq('id', applicationId);

      if (cancelError) {
        throw new Error(`Failed to cancel application: ${cancelError.message}`);
      }

      // Cancel the Stripe payment intent
      if (application.applicant_payment_intent_id) {
        try {
          await cancelPaymentIntent(application.applicant_payment_intent_id);
        } catch (stripeError) {
          console.error('Failed to cancel Stripe payment intent:', stripeError);
          // Don't fail the whole request if Stripe cancellation fails
        }
      }

      return NextResponse.json({
        success: true,
        message: 'Your seat has been cancelled and payment hold released',
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid action. Must be "swap" or "cancel"' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('POST /api/manage-seat error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
