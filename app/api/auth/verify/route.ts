import { NextRequest, NextResponse } from 'next/server';
import {
  verifyMagicToken,
  getOrCreateUser,
  createSession,
} from '@/app/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Missing token parameter' },
        { status: 400 }
      );
    }

    // Verify magic token
    const tokenResult = await verifyMagicToken(token);

    if (!tokenResult.success) {
      return NextResponse.json(
        { error: tokenResult.error || 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const email = tokenResult.email;

    // Get or create user
    const userResult = await getOrCreateUser(email);

    if (!userResult.success) {
      return NextResponse.json(
        { error: 'Failed to create user account' },
        { status: 500 }
      );
    }

    const user = userResult.user;

    // Create session (30 days)
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const sessionResult = await createSession(user.id, expiresAt);

    if (!sessionResult.success || !sessionResult.sessionToken) {
      return NextResponse.json(
        { error: 'Failed to create session' },
        { status: 500 }
      );
    }

    // Create response with session cookie
    const response = NextResponse.redirect(
      new URL('/status', request.url),
      { status: 302 }
    );

    response.cookies.set({
      name: 'auth_token',
      value: sessionResult.sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Verify token error:', error);
    return NextResponse.json(
      { error: 'An error occurred during verification' },
      { status: 500 }
    );
  }
}
