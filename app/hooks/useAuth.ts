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
            access_token: currentSession.session.access_token,
            refresh_token: currentSession.session.refresh_token,
            expires_in: currentSession.session.expires_in || 0,
            expires_at: currentSession.session.expires_at,
            token_type: currentSession.session.token_type,
            type: currentSession.session.type,
          });
        }

        setLoading(false);
      } catch (err) {
        console.error('Auth hook error:', err);
        setError(err instanceof Error ? err.message : 'Failed to get auth');
        setLoading(false);
      }
    }

    getAuth();

    // Listen for auth state changes
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((event, currentSession) => {
        if (currentSession?.user) {
          setUser({
            id: currentSession.user.id,
            email: currentSession.user.email,
            user_metadata: currentSession.user.user_metadata,
            app_metadata: currentSession.user.app_metadata,
          });

          setSession({
            access_token: currentSession.session.access_token,
            refresh_token: currentSession.session.refresh_token,
            expires_in: currentSession.session.expires_in || 0,
            expires_at: currentSession.session.expires_at,
            token_type: currentSession.session.token_type,
            type: currentSession.session.type,
          });
        } else {
          setUser(null);
          setSession(null);
        }
      });

      return () => {
        subscription?.unsubscribe();
      };
    }
  }, []);

  return {
    user,
    session,
    loading,
    error,
    isAuthenticated: !!user,
  };
}
