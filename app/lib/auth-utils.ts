import { headers } from 'next/headers';
import { supabase } from './auth';

/**
 * Get current user from request headers (set by middleware)
 * Only available in server components
 */
export async function getCurrentUser() {
  const headersList = await headers();
  const userId = headersList.get('x-user-id');
  const userEmail = headersList.get('x-user-email');

  if (!userId) {
    return null;
  }

  try {
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    return user;
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
