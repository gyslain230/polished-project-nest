
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

  // Check if the user is the designated admin using the database function
  const checkAdminRole = async (user: User): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('is_admin', { user_id: user.id });
      
      if (error) {
        console.error('Error checking admin role:', error);
        return false;
      }
      
      return data || false;
    } catch (error) {
      console.error('Error calling is_admin function:', error);
      return false;
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const user = session?.user ?? null;
        let isAdmin = false;
        
        if (user) {
          isAdmin = await checkAdminRole(user);
        }

        setAuthState({
          user,
          session,
          isAdmin,
          loading: false
        });
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const user = session?.user ?? null;
      let isAdmin = false;
      
      if (user) {
        isAdmin = await checkAdminRole(user);
      }

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
