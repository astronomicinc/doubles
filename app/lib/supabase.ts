import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Get seats information for a volume
 * Returns remaining seats and total capacity
 */
export async function getVolumeSeats(volumeId: string) {
  try {
    // Query the volumes table for this volume
    const { data: volume, error: volumeError } = await supabase
      .from('volumes')
      .select('id, capacity')
      .eq('id', volumeId)
      .single();

    if (volumeError || !volume) {
      console.error('Error fetching volume:', volumeError);
      // Return defaults if volume not found
      return { remaining: 12, total: 30 };
    }

    // Query applications table to count accepted applications
    const { data: applications, error: appError } = await supabase
      .from('applications')
      .select('id')
      .eq('volume_id', volumeId)
      .eq('status', 'accepted');

    if (appError) {
      console.error('Error fetching applications:', appError);
      return { remaining: 12, total: 30 };
    }

    const acceptedCount = applications?.length || 0;
    const remaining = volume.capacity - acceptedCount;

    return {
      remaining: Math.max(0, remaining),
      total: volume.capacity,
    };
  } catch (err) {
    console.error('Error in getVolumeSeats:', err);
    return { remaining: 12, total: 30 };
  }
}

/**
 * Get volume details (name, date, neighborhood)
 */
export async function getVolumeDetails(volumeId: string) {
  try {
    const { data: volume, error } = await supabase
      .from('volumes')
      .select('id, name, doors_date, doors_time_start, venue_neighborhood')
      .eq('id', volumeId)
      .single();

    if (error || !volume) {
      console.error('Error fetching volume details:', error);
      return null;
    }

    return volume;
  } catch (err) {
    console.error('Error in getVolumeDetails:', err);
    return null;
  }
}
