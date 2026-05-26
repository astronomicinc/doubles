import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { triggerSendIntrosForVolume } from '@/app/inngest/send-intros';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST /api/admin/intros/send?volumeId=[id]
 *
 * Admin endpoint to trigger intro sending for a specific volume
 *
 * Flow:
 * 1. Verify admin authentication via Bearer token
 * 2. Validate volumeId query parameter
 * 3. Trigger Inngest job for computing mutuals and sending intros
 * 4. Return success with job trigger result
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
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (adminError || !adminRole) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: admin role required' },
        { status: 403 }
      );
    }

    // Step 3: Get and validate volumeId from query params
    const { searchParams } = new URL(request.url);
    const volumeId = searchParams.get('volumeId');

    if (!volumeId) {
      return NextResponse.json(
        { success: false, error: 'Missing required query parameter: volumeId' },
        { status: 400 }
      );
    }

    // Verify volume exists
    const { data: volume, error: volumeError } = await supabase
      .from('volumes')
      .select('id, name')
      .eq('id', volumeId)
      .single();

    if (volumeError || !volume) {
      return NextResponse.json(
        { success: false, error: 'Volume not found' },
        { status: 404 }
      );
    }

    // Step 4: Trigger Inngest job
    console.log(`Admin ${user.id} triggering intro sending for volume ${volumeId} (${volume.name})`);

    const jobResult = await triggerSendIntrosForVolume(volumeId);

    // Step 5: Return success
    return NextResponse.json({
      success: true,
      message: `Intro sending job triggered for volume ${volume.name}`,
      volumeId,
      volume: { id: volume.id, name: volume.name },
      jobResult,
    });
  } catch (error) {
    console.error('POST /api/admin/intros/send error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
