'use server';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

export async function ensureVolume1Exists() {
  try {
    if (!supabase) {
      return { success: false, error: 'Supabase not initialized' };
    }

    // Check if Volume 1 already exists
    const { data: existingVolume } = await supabase
      .from('volumes')
      .select('id')
      .eq('number', 1)
      .single();

    if (existingVolume) {
      return { success: true, volumeId: existingVolume.id, created: false };
    }

    // Create Volume 1
    const { data: newVolume, error } = await supabase
      .from('volumes')
      .insert({
        number: 1,
        name: 'Vol. 01: Twin Peaks',
        status: 'announced',
        doors_date: '2026-06-21',
        doors_time_start: '18:00',
        doors_time_end: '21:00',
        venue_name: 'Twin Peaks',
        venue_address: 'San Francisco, CA',
        venue_lat: 37.7694,
        venue_lng: -122.4862,
        capacity: 30,
      })
      .select('id')
      .single();

    if (error || !newVolume) {
      console.error('Volume creation error:', error);
      return { success: false, error: 'Failed to create Volume 1' };
    }

    return { success: true, volumeId: newVolume.id, created: true };
  } catch (err) {
    console.error('Seed volume error:', err);
    return { success: false, error: String(err) };
  }
}
