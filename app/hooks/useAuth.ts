'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

interface AuthSession {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at?: number;
  token_type: string;
  type: string;
}

interface AuthUser {
  id: string;
  email?: string;
  user_metadata?: Record<string, any>;
  app_metadata?: Record<string, any>;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function getAuth() {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseKey) {
          setError('Supabase configuration missing');
          setLoading(false);
          return;
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        // Get current session
        const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          setError(sessionError.message);
          setLoading(false);
          return;
        }

        if (currentSession?.user) {
          setUser({
            id: currentSession.user.id,
            email: currentSession.user.email,
            user_metadata: currentSession.user.user_metadata,
            app_metadata: currentSession.user.app_metadata,
          });

          setSession({
            access_token: currentSession.access_token,
            refresh_token: currentSession.refresh_token || '',
            expires_in: currentSession.expires_in || 0,
            expires_at: currentSession.expires_at,
            token_type: currentSession.token_type || 'Bearer',
            type: 'session',
          });
        }

        setLoading(false);
      } catch (err) {
        console.error('Auth hook error:', err);
        setError(err instanceof Error ? err.message : 'Failed to get auth');
        setLoading(false);
      }
    }

    let subscription: any = null;

    getAuth();

    // Listen for auth state changes
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);

      const {
        data: { subscription: authSubscription },
      } = supabase.auth.onAuthStateChange((_event, currentSession) => {
        if (currentSession?.user) {
          setUser({
            id: currentSession.user.id,
            email: currentSession.user.email,
            user_metadata: currentSession.user.user_metadata,
            app_metadata: currentSession.user.app_metadata,
          });

          setSession({
            access_token: currentSession.access_token,
            refresh_token: currentSession.refresh_token || '',
            expires_in: currentSession.expires_in || 0,
            expires_at: currentSession.expires_at,
            token_type: currentSession.token_type || 'Bearer',
            type: 'session',
          });
        } else {
          setUser(null);
          setSession(null);
        }
      });

      subscription = authSubscription;
    }

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  return {
    user,
    session,
    loading,
    error,
    isAuthenticated: !!user,
  };
}
