import { NextRequest, NextResponse } from 'next/server';
import { createPaymentIntent } from '@/app/actions/stripe';
import { submitApplication, ApplicationSubmitData } from '@/app/actions/applications';
import {
  sendApplicationConfirmationEmail,
  sendPlusOneInvitationEmail,
} from '@/app/actions/emails';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST /api/apply
 * Handle application form submission:
 * 1. Validate form data
 * 2. Create Stripe payment intent (hold $145)
 * 3. Create application + plus_one records
 * 4. Send confirmation emails
 * 5. Return success with redirect URL
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const {
      applicantName,
      applicantEmail,
      applicantAge,
      applicantGender,
      friendName,
      friendEmail,
      friendGender,
      whyVouch,
      volumeId,
    } = body;

    if (
      !applicantName ||
      !applicantEmail ||
      !applicantAge ||
      !applicantGender ||
      !friendName ||
      !friendEmail ||
      !friendGender ||
      !whyVouch ||
      !volumeId
    ) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(applicantEmail) || !emailRegex.test(friendEmail)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Step 1: Create Stripe payment intent ($145)
    console.log('Creating Stripe payment intent...');
    const paymentIntentResult = await createPaymentIntent(145, applicantEmail); // Amount in dollars, email

    if (!paymentIntentResult.success || !paymentIntentResult.intentId) {
      throw new Error('Failed to create Stripe payment intent');
    }

    const paymentIntentId = paymentIntentResult.intentId;

    // Step 2: Create application + plus_one records
    console.log('Creating application record...');
    const applicationData: ApplicationSubmitData = {
      applicantName,
      applicantEmail,
      applicantAge: parseInt(applicantAge),
      applicantGender,
      friendName,
      friendEmail,
      friendGender,
      whyVouch,
      paymentIntentId,
      volumeId,
    };

    const applicationId = await submitApplication(applicationData);

    // Step 3: Send confirmation emails
    console.log('Sending confirmation emails...');
    try {
      await sendApplicationConfirmationEmail(applicantEmail, applicantName, friendName, applicationId);
      await sendPlusOneInvitationEmail(friendEmail, friendName, applicantName, body.plusOneId || '');
    } catch (emailError) {
      console.error('Email send error (non-fatal):', emailError);
      // Don't fail the whole request if emails fail
    }

    return NextResponse.json({
      success: true,
      applicationId,
      paymentIntentId,
      nextUrl: '/application-submitted',
    });
  } catch (error) {
    console.error('POST /api/apply error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
