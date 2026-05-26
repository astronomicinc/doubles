import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Generate a secure magic link token
 */
export function generateMagicToken(): { token: string; hash: string } {
  const token = crypto.randomBytes(32).toString('hex');
  const hash = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  return { token, hash };
}

/**
 * Send magic link email to user
 */
export async function sendMagicLinkEmail(email: string, token: string) {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'hello@doubles.singles',
        to: email,
        subject: 'Your Doubles login link',
        html: `
          <h2>Welcome to Doubles</h2>
          <p>Click the link below to log in to your account:</p>
          <a href="https://doubles.singles/auth/verify?token=${token}" style="padding: 12px 24px; background: #1B5A6B; color: white; text-decoration: none; border-radius: 4px; display: inline-block;">
            Sign in to Doubles
          </a>
          <p style="color: #999; font-size: 12px; margin-top: 20px;">
            This link expires in 24 hours. If you didn't request this email, you can safely ignore it.
          </p>
        `,
      }),
    });

    if (!response.ok) {
      throw new Error(`Resend API error: ${response.statusText}`);
    }

    return { success: true };
  } catch (error) {
    console.error('Error sending magic link email:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Store magic token in database
 */
export async function storeMagicToken(
  email: string,
  tokenHash: string,
  expiresAt: Date
) {
  try {
    const { error } = await supabase
      .from('magic_tokens')
      .insert({
        email,
        token_hash: tokenHash,
        expires_at: expiresAt.toISOString(),
        created_at: new Date().toISOString(),
      });

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error('Error storing magic token:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Verify magic token
 */
export async function verifyMagicToken(token: string) {
  try {
    const tokenHash = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Get token from database
    const { data: magicToken, error: queryError } = await supabase
      .from('magic_tokens')
      .select('*')
      .eq('token_hash', tokenHash)
      .single();

    if (queryError || !magicToken) {
      return { success: false, error: 'Token not found' };
    }

    // Check expiry
    if (new Date(magicToken.expires_at) < new Date()) {
      return { success: false, error: 'Token expired' };
    }

    // Mark token as used
    await supabase
      .from('magic_tokens')
      .update({ used_at: new Date().toISOString() })
      .eq('id', magicToken.id);

    return { success: true, email: magicToken.email };
  } catch (error) {
    console.error('Error verifying magic token:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Get or create user from email
 */
export async function getOrCreateUser(email: string) {
  try {
    // Try to find existing user
    let { data: user, error: findError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    // If user doesn't exist, create them
    if (findError && findError.code === 'PGRST116') {
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          email,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (createError) {
        throw createError;
      }

      user = newUser;
    } else if (findError) {
      throw findError;
    }

    return { success: true, user };
  } catch (error) {
    console.error('Error getting or creating user:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Create session for user
 */
export async function createSession(userId: string, expiresAt: Date) {
  try {
    const sessionToken = crypto.randomBytes(32).toString('hex');

    const { error } = await supabase
      .from('auth_sessions')
      .insert({
        user_id: userId,
        session_token: sessionToken,
        expires_at: expiresAt.toISOString(),
        created_at: new Date().toISOString(),
      });

    if (error) {
      throw error;
    }

    return { success: true, sessionToken };
  } catch (error) {
    console.error('Error creating session:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Verify session token
 */
export async function verifySession(sessionToken: string) {
  try {
    const { data: session, error } = await supabase
      .from('auth_sessions')
      .select('*, users(*)')
      .eq('session_token', sessionToken)
      .single();

    if (error || !session) {
      return { success: false, user: null };
    }

    // Check expiry
    if (new Date(session.expires_at) < new Date()) {
      return { success: false, user: null };
    }

    return { success: true, user: session.users };
  } catch (error) {
    console.error('Error verifying session:', error);
    return { success: false, user: null };
  }
}
