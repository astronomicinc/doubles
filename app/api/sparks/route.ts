import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface SparksPickRequest {
  pickedUserId: string;
  volumeId: string;
  kind: 'date' | 'connect' | 'both';
}

/**
 * POST /api/sparks
 * Record a one-way spark pick from an attendee
 *
 * Flow:
 * 1. Verify user authentication via Bearer token
 * 2. Validate request payload
 * 3. Verify picker is confirmed attendee (checked in, same volume)
 * 4. Verify picked user exists and attended same event
 * 5. Upsert pick into sparks_picks table
 * 6. Return success with pick data
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

    // Step 2: Parse and validate request payload
    const body: SparksPickRequest = await request.json();
    const { pickedUserId, volumeId, kind } = body;

    if (!pickedUserId || !volumeId || !kind) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: pickedUserId, volumeId, kind' },
        { status: 400 }
      );
    }

    if (!['date', 'connect', 'both'].includes(kind)) {
      return NextResponse.json(
        { success: false, error: 'Invalid kind. Must be "date", "connect", or "both"' },
        { status: 400 }
      );
    }

    // Prevent picking self
    if (pickedUserId === user.id) {
      return NextResponse.json(
        { success: false, error: 'Cannot pick yourself' },
        { status: 400 }
      );
    }

    // Step 3: Verify picker is confirmed attendee (checked in)
    const { data: pickerApp, error: pickerError } = await supabase
      .from('applications')
      .select('id')
      .eq('applicant_user_id', user.id)
      .eq('volume_id', volumeId)
      .eq('applicant_status', 'confirmed')
      .eq('checked_in', true)
      .single();

    if (pickerError || !pickerApp) {
      console.log('Picker not confirmed attendee:', pickerError);
      return NextResponse.json(
        { success: false, error: 'You are not a confirmed attendee for this event' },
        { status: 403 }
      );
    }

    // Verify picked user attended same event
    // They must be either applicant or plus_one, confirmed/accepted, and checked in
    const { data: pickedApp } = await supabase
      .from('applications')
      .select('id, checked_in')
      .eq('applicant_user_id', pickedUserId)
      .eq('volume_id', volumeId)
      .eq('applicant_status', 'confirmed')
      .eq('checked_in', true)
      .single();

    const { data: pickedPlusOne } = await supabase
      .from('plus_ones')
      .select('application_id, status')
      .eq('user_id', pickedUserId)
      .eq('status', 'accepted')
      .single();

    // Check attendance for picked user (must have checked in)
    const { data: pickedAttendance } = await supabase
      .from('attendance')
      .select('id')
      .eq('user_id', pickedUserId)
      .single();

    const pickedAttendedEvent =
      (pickedApp && pickedApp.checked_in) ||
      (pickedPlusOne && pickedAttendance);

    if (!pickedAttendedEvent) {
      console.log('Picked user did not attend event');
      return NextResponse.json(
        { success: false, error: 'User did not attend this event' },
        { status: 404 }
      );
    }

    // Step 4: Upsert pick into sparks_picks table
    console.log(`Recording spark pick: ${user.id} → ${pickedUserId} (${kind}) for volume ${volumeId}`);

    const { data: pick, error: upsertError } = await supabase
      .from('sparks_picks')
      .upsert(
        {
          picker_user_id: user.id,
          picked_user_id: pickedUserId,
          volume_id: volumeId,
          kind,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'picker_user_id,picked_user_id,volume_id',
        }
      )
      .select()
      .single();

    if (upsertError) {
      console.error('Upsert error:', upsertError);
      return NextResponse.json(
        { success: false, error: `Failed to save pick: ${upsertError.message}` },
        { status: 500 }
      );
    }

    // Step 5: Return success
    return NextResponse.json({
      success: true,
      pick,
      message: `Spark pick recorded: ${kind}`,
    });
  } catch (error) {
    console.error('POST /api/sparks error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
