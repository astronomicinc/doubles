import { ensureVolume1Exists } from '@/app/actions/seed';

export async function GET() {
  // Skip initialization if Supabase credentials are not available
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return Response.json(
      { success: false, error: 'Supabase credentials not configured' },
      { status: 500 }
    );
  }

  try {
    const result = await ensureVolume1Exists();

    if (result.success) {
      return Response.json({
        success: true,
        message: result.created ? 'Volume 1 created' : 'Volume 1 already exists',
        volumeId: result.volumeId,
      });
    }

    return Response.json(
      { success: false, error: result.error },
      { status: 500 }
    );
  } catch (error) {
    return Response.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
