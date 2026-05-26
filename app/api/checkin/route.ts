import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { checkInAttendee } from '@/app/actions/applications';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * POST /api/checkin
 * Staff-only endpoint to check attendees in:
 * 1. Verify user is authenticated AND has admin role
 * 2. Parse applicationId and role (applicant/plus_one)
 * 3. Insert attendance record and update application checked_in flag
 * 4. Return success message
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { applicationId, userId, role } = body;

    if (!applicationId || !userId || !role) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: applicationId, userId, role' },
        { status: 400 }
      );
    }

    if (!['applicant', 'plus_one'].includes(role)) {
      return NextResponse.json(
        { success: false, error: 'Invalid role. Must be "applicant" or "plus_one"' },
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

    const currentUserId = userData.user.id;

    // Check if user has admin role
    const { data: adminRole, error: adminError } = await supabase
      .from('admin_roles')
      .select('user_id')
      .eq('user_id', currentUserId)
      .single();

    if (adminError || !adminRole) {
      return NextResponse.json(
        { success: false, error: 'You do not have permission to check in attendees' },
        { status: 403 }
      );
    }

    // Verify application exists
    const { data: application, error: appError } = await supabase
      .from('applications')
      .select('id')
      .eq('id', applicationId)
      .single();

    if (appError || !application) {
      return NextResponse.json(
        { success: false, error: 'Application not found' },
        { status: 404 }
      );
    }

    // Check in the attendee
    try {
      await checkInAttendee(applicationId, userId, role);
    } catch (checkInError) {
      console.error('Check-in error:', checkInError);
      const errorMessage = checkInError instanceof Error ? checkInError.message : 'Failed to check in attendee';
      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `${role === 'applicant' ? 'Applicant' : 'Plus-one'} checked in successfully`,
    });
  } catch (error) {
    console.error('POST /api/checkin error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
