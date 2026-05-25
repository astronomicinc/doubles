'use server';

import { supabase } from '@/lib/supabase-client';

export async function signUpWithEmail(email: string, name: string, phone: string) {
  try {
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        data: {
          name,
          phone,
        },
        shouldCreateUser: true,
      },
    });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Signup error:', error);
    return { success: false, error: String(error) };
  }
}

export async function verifyOtp(email: string, token: string) {
  try {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('OTP verification error:', error);
    return { success: false, error: String(error) };
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Sign out error:', error);
    return { success: false, error: String(error) };
  }
}
