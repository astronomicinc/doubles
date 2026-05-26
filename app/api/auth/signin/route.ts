import { NextRequest, NextResponse } from 'next/server';
import {
  generateMagicToken,
  sendMagicLinkEmail,
  storeMagicToken,
} from '@/app/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Generate magic token
    const { token, hash } = generateMagicToken();

    // Token expires in 24 hours
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Store token in database
    const storeResult = await storeMagicToken(email, hash, expiresAt);

    if (!storeResult.success) {
      return NextResponse.json(
        { error: 'Failed to create login link' },
        { status: 500 }
      );
    }

    // Send email with magic link
    const emailResult = await sendMagicLinkEmail(email, token);

    if (!emailResult.success) {
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: `Check your email at ${email} for a login link`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Sign in error:', error);
    return NextResponse.json(
      { error: 'An error occurred during sign in' },
      { status: 500 }
    );
  }
}
