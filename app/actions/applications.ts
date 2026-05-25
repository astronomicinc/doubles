'use server';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Service role client for server-side operations (bypasses RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export interface ApplicationData {
  email: string;
  firstName: string;
  lastName?: string;
  phone: string;
  about: string;
  why: string;
  referral: string;
  paymentIntentId: string;
  volumeId?: string; // Default to Volume 1 if not provided
}

export async function submitApplication(data: ApplicationData) {
  try {
    // Get or create user
    const { data: userData, error: userError } = await supabase
      .from('users')
      .upsert(
        {
          email: data.email,
          name: `${data.firstName}${data.lastName ? ' ' + data.lastName : ''}`,
          phone: data.phone,
        },
        { onConflict: 'email' }
      )
      .select('id')
      .single();

    if (userError || !userData) {
      console.error('User creation error:', userError);
      return { success: false, error: 'Failed to create user profile' };
    }

    const userId = userData.id;

    // Get Volume 1 (or use provided volume ID)
    let volumeId = data.volumeId;

    if (!volumeId) {
      // Look up Volume 1
      const { data: volume, error: volumeError } = await supabase
        .from('volumes')
        .select('id')
        .eq('number', 1)
        .single();

      if (volumeError || !volume) {
        console.error('Volume lookup error:', volumeError);
        return { success: false, error: 'Event not found' };
      }

      volumeId = volume.id;
    }

    // Create application
    const { data: appData, error: appError } = await supabase
      .from('applications')
      .insert({
        volume_id: volumeId,
        applicant_user_id: userId,
        applicant_payment_intent_id: data.paymentIntentId,
        status: 'payment_pending', // Application is in payment_pending status until payment captured
        admin_decision: 'pending',
        preferred_dietary: null, // Can be updated later
      })
      .select('id')
      .single();

    if (appError || !appData) {
      console.error('Application creation error:', appError);
      return { success: false, error: 'Failed to create application' };
    }

    return {
      success: true,
      applicationId: appData.id,
      userId: userId,
    };
  } catch (err) {
    console.error('Submit application error:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function getVolumeIdByNumber(volumeNumber: number) {
  try {
    const { data, error } = await supabase
      .from('volumes')
      .select('id')
      .eq('number', volumeNumber)
      .single();

    if (error || !data) {
      console.error('Volume lookup error:', error);
      return { success: false, volumeId: null };
    }

    return { success: true, volumeId: data.id };
  } catch (err) {
    console.error('Get volume error:', err);
    return { success: false, volumeId: null };
  }
}
