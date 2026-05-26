import { headers } from 'next/headers';
import { supabase, verifySession } from './auth';

/**
 * Get current user from session token (set by middleware)
 * Only available in server components
 */
export async function getCurrentUser() {
  const headersList = await headers();
  const sessionToken = headersList.get('x-session-token');

  if (!sessionToken) {
    return null;
  }

  try {
    // Verify the session token
    const sessionResult = await verifySession(sessionToken);

    if (!sessionResult.success || !sessionResult.user) {
      return null;
    }

    return sessionResult.user;
  } catch (error) {
    console.error('Error fetching current user:', error);
    return null;
  }
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string) {
  try {
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    return user;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  userId: string,
  updates: Partial<{
    name: string;
    age: number;
    role: string;
    bio: string;
    avatar_url: string;
    phone: string;
  }>
) {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return { success: true, user };
  } catch (error) {
    console.error('Error updating user profile:', error);
    return { success: false, error: String(error) };
  }
}
