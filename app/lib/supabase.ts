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

/**
 * List all volumes (for /events page)
 */
export async function listVolumes() {
  try {
    const { data: volumes, error } = await supabase
      .from('volumes')
      .select('id, name, doors_date, doors_time_start, venue_neighborhood, capacity')
      .order('doors_date', { ascending: true });

    if (error) {
      console.error('Error fetching volumes:', error);
      return [];
    }

    return volumes || [];
  } catch (err) {
    console.error('Error in listVolumes:', err);
    return [];
  }
}

/**
 * List all volumes (admin view, no filtering)
 */
export async function listAllVolumes() {
  try {
    const { data: volumes, error } = await supabase
      .from('volumes')
      .select('id, name, doors_date, capacity, status')
      .order('doors_date', { ascending: false });

    if (error) {
      console.error('Error fetching all volumes:', error);
      return [];
    }

    return volumes || [];
  } catch (err) {
    console.error('Error in listAllVolumes:', err);
    return [];
  }
}

/**
 * Get next upcoming volume
 */
export async function getNextVolume() {
  try {
    const { data: volume, error } = await supabase
      .from('volumes')
      .select('id, name, doors_date')
      .gt('doors_date', new Date().toISOString())
      .order('doors_date', { ascending: true })
      .limit(1)
      .single();

    if (error || !volume) {
      return null;
    }

    return volume;
  } catch (err) {
    console.error('Error in getNextVolume:', err);
    return null;
  }
}

/**
 * Get count of pending applications
 */
export async function countPendingApplications() {
  try {
    const { count, error } = await supabase
      .from('applications')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    if (error) {
      console.error('Error counting pending applications:', error);
      return 0;
    }

    return count || 0;
  } catch (err) {
    console.error('Error in countPendingApplications:', err);
    return 0;
  }
}

/**
 * Get today's event
 */
export async function getTodaysEvent() {
  try {
    const today = new Date().toISOString().split('T')[0];
    const { data: volume, error } = await supabase
      .from('volumes')
      .select('id, name, doors_date, doors_time_start')
      .eq('doors_date', today)
      .single();

    if (error || !volume) {
      return null;
    }

    return volume;
  } catch (err) {
    console.error('Error in getTodaysEvent:', err);
    return null;
  }
}

/**
 * Get admin dashboard data
 */
export async function getAdminDashboardData() {
  try {
    const upcoming = await listUpcomingVolumes();
    const pending = await countPendingApplications();
    const today = await getTodaysEvent();

    return {
      upcoming,
      pendingCount: pending,
      todaysEvent: today,
    };
  } catch (err) {
    console.error('Error in getAdminDashboardData:', err);
    return {
      upcoming: [],
      pendingCount: 0,
      todaysEvent: null,
    };
  }
}

/**
 * List upcoming volumes (for dashboard)
 */
export async function listUpcomingVolumes() {
  try {
    const { data: volumes, error } = await supabase
      .from('volumes')
      .select('id, name, doors_date')
      .gt('doors_date', new Date().toISOString())
      .order('doors_date', { ascending: true })
      .limit(5);

    if (error) {
      console.error('Error fetching upcoming volumes:', error);
      return [];
    }

    return volumes || [];
  } catch (err) {
    console.error('Error in listUpcomingVolumes:', err);
    return [];
  }
}

/**
 * Get volume recap data
 */
export async function getVolumeRecap(volumeId: string) {
  try {
    const { data: volume, error } = await supabase
      .from('volumes')
      .select('id, name, doors_date')
      .eq('id', volumeId)
      .single();

    if (error || !volume) {
      return null;
    }

    // Get attendee count
    const { count: attendeeCount } = await supabase
      .from('applications')
      .select('*', { count: 'exact', head: true })
      .eq('volume_id', volumeId)
      .eq('status', 'accepted');

    return {
      ...volume,
      attendeeCount: attendeeCount || 0,
    };
  } catch (err) {
    console.error('Error in getVolumeRecap:', err);
    return null;
  }
}

/**
 * Get volume photos (for recap gallery)
 */
export async function getVolumePhotos(volumeId: string) {
  try {
    const { data: photos, error } = await supabase
      .from('volume_photos')
      .select('id, url, caption')
      .eq('volume_id', volumeId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching volume photos:', error);
      return [];
    }

    return photos || [];
  } catch (err) {
    console.error('Error in getVolumePhotos:', err);
    return [];
  }
}

/**
 * Get volume testimonials (for recap)
 */
export async function getVolumeTestimonials(volumeId: string) {
  try {
    const { data: testimonials, error } = await supabase
      .from('testimonials')
      .select('id, author_name, content, rating')
      .eq('volume_id', volumeId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching testimonials:', error);
      return [];
    }

    return testimonials || [];
  } catch (err) {
    console.error('Error in getVolumeTestimonials:', err);
    return [];
  }
}
