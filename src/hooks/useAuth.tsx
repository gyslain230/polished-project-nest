
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthState {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  loading: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    isAdmin: false,
    loading: true
  });

  // Simple admin check - you can customize this logic
  const checkAdminRole = (user: User): boolean => {
    // For now, treat all authenticated users as admins
    // You can modify this to check specific email addresses or other criteria
    return !!user;
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const user = session?.user ?? null;
        const isAdmin = user ? checkAdminRole(user) : false;

        setAuthState({
          user,
          session,
          isAdmin,
          loading: false
        });
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      const user = session?.user ?? null;
      const isAdmin = user ? checkAdminRole(user) : false;

      setAuthState({
        user,
        session,
        isAdmin,
        loading: false
      });
    });

    return () => subscription.unsubscribe();
  }, []);

  return authState;
};
