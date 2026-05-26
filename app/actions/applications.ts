'use server';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Use service role for server-side operations (can bypass RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export interface ApplicationSubmitData {
  applicantName: string;
  applicantEmail: string;
  applicantAge: number;
  applicantGender: string;
  friendName: string;
  friendEmail: string;
  friendGender: string;
  whyVouch: string;
  paymentIntentId: string;
  volumeId: string;
}

/**
 * submitApplication: Create application record and plus_one record
 * Returns the application ID on success
 */
export async function submitApplication(data: ApplicationSubmitData): Promise<string> {
  const {
    applicantName,
    applicantEmail,
    applicantAge,
    applicantGender,
    friendName,
    friendEmail,
    friendGender,
    whyVouch,
    paymentIntentId,
    volumeId,
  } = data;

  try {
    // Step 1: Create or get applicant user via Supabase Auth API
    // First check if user exists
    const { data: existingUser } = await supabase.auth.admin.getUserByEmail(applicantEmail);

    let applicantUserId = existingUser?.id;

    if (!applicantUserId) {
      // Create new user if doesn't exist
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: applicantEmail,
        email_confirm: false, // They'll confirm via magic link
        user_metadata: {
          name: applicantName,
          age: applicantAge,
          gender: applicantGender,
        },
      });

      if (createError) {
        throw new Error(`Failed to create user: ${createError.message}`);
      }

      applicantUserId = newUser.user.id;
    }

    // Step 2: Create application record
    const { data: application, error: appError } = await supabase
      .from('applications')
      .insert({
        volume_id: volumeId,
        applicant_user_id: applicantUserId,
        applicant_payment_intent_id: paymentIntentId,
        applicant_status: 'pending',
        plus_one_status: 'invited',
      })
      .select('id')
      .single();

    if (appError) {
      throw new Error(`Failed to create application: ${appError.message}`);
    }

    const applicationId = application.id;

    // Step 3: Create plus_one record
    const { error: plusOneError } = await supabase
      .from('plus_ones')
      .insert({
        application_id: applicationId,
        email: friendEmail,
        name: friendName,
        gender: friendGender,
        why_vouch: whyVouch,
        status: 'invited',
      });

    if (plusOneError) {
      throw new Error(`Failed to create plus_one record: ${plusOneError.message}`);
    }

    // Step 4: Create payment record
    const { error: paymentError } = await supabase
      .from('payments')
      .insert({
        application_id: applicationId,
        stripe_intent_id: paymentIntentId,
        amount_cents: 14500,
        currency: 'usd',
        status: 'pending',
      });

    if (paymentError) {
      throw new Error(`Failed to create payment record: ${paymentError.message}`);
    }

    return applicationId;
  } catch (error) {
    console.error('Submit application error:', error);
    throw error;
  }
}

/**
 * getPlusOneInvitation: Fetch plus_one record by invitation ID (used for friend invite link)
 */
export async function getPlusOneInvitation(plusOneId: string) {
  const { data, error } = await supabase
    .from('plus_ones')
    .select('id, application_id, email, name, status, why_vouch')
    .eq('id', plusOneId)
    .single();

  if (error) {
    throw new Error(`Failed to fetch plus_one invitation: ${error.message}`);
  }

  return data;
}

/**
 * acceptPlusOneInvitation: Mark plus_one as accepted and link to authenticated user
 */
export async function acceptPlusOneInvitation(
  plusOneId: string,
  userId: string,
  userData?: { name?: string; gender?: string }
) {
  const updateData: any = {
    user_id: userId,
    status: 'accepted',
    responded_at: new Date().toISOString(),
  };

  if (userData?.name) {
    updateData.name = userData.name;
  }
  if (userData?.gender) {
    updateData.gender = userData.gender;
  }

  const { data, error } = await supabase
    .from('plus_ones')
    .update(updateData)
    .eq('id', plusOneId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to accept plus_one invitation: ${error.message}`);
  }

  return data;
}

/**
 * getApplicationByPaymentIntent: Look up application by Stripe payment intent ID
 * Used for admin operations (approve/reject)
 */
export async function getApplicationByPaymentIntent(paymentIntentId: string) {
  const { data, error } = await supabase
    .from('applications')
    .select('id, applicant_user_id, applicant_status, admin_decision')
    .eq('applicant_payment_intent_id', paymentIntentId)
    .single();

  if (error) {
    throw new Error(`Failed to fetch application: ${error.message}`);
  }

  return data;
}

/**
 * updateApplicationStatus: Update application admin decision and status
 */
export async function updateApplicationStatus(
  applicationId: string,
  decision: 'approved' | 'rejected',
  reason?: string
) {
  const updateData: any = {
    admin_decision: decision,
    applicant_status: decision === 'approved' ? 'confirmed' : 'cancelled',
  };

  if (reason) {
    updateData.rejection_reason = reason;
  }

  const { data, error } = await supabase
    .from('applications')
    .update(updateData)
    .eq('id', applicationId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update application status: ${error.message}`);
  }

  return data;
}

/**
 * checkInAttendee: Mark an attendee as checked in
 */
export async function checkInAttendee(applicationId: string, userId: string, role: 'applicant' | 'plus_one') {
  const { data, error } = await supabase
    .from('attendance')
    .insert({
      application_id: applicationId,
      user_id: userId,
      role,
      checked_in_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    // If already checked in, update the checked_in_at timestamp
    if (error.message?.includes('duplicate')) {
      const { data: updated, error: updateError } = await supabase
        .from('attendance')
        .update({ checked_in_at: new Date().toISOString() })
        .eq('application_id', applicationId)
        .eq('user_id', userId)
        .select()
        .single();

      if (updateError) {
        throw new Error(`Failed to check in attendee: ${updateError.message}`);
      }
      return updated;
    }

    throw new Error(`Failed to check in attendee: ${error.message}`);
  }

  // Also update the checked_in flag on the application
  const { error: appError } = await supabase
    .from('applications')
    .update({ checked_in: true, checked_in_at: new Date().toISOString() })
    .eq('id', applicationId);

  if (appError) {
    throw new Error(`Failed to update application checked_in status: ${appError.message}`);
  }

  return data;
}
