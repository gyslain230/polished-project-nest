
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

  // Check if the user is the designated admin using email from auth
  const checkAdminRole = (user: User): boolean => {
    const adminEmail = 'gislainrugira@gmail.com';
    return user.email === adminEmail;
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
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
