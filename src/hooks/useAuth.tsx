
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { securityService } from '@/services/securityService';

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

  useEffect(() => {
    let mounted = true;

    const checkAuthState = async () => {
      try {
        const sessionCheck = await securityService.validateSession();
        
        if (!mounted) return;

        if (sessionCheck.valid && sessionCheck.user) {
          const isAdmin = await securityService.verifyAdminAccess(sessionCheck.user.id);
          
          if (!mounted) return;

          setAuthState({
            user: sessionCheck.user,
            session: await supabase.auth.getSession().then(({ data }) => data.session),
            isAdmin,
            loading: false
          });
        } else {
          setAuthState({
            user: null,
            session: null,
            isAdmin: false,
            loading: false
          });
        }
      } catch (error) {
        console.error('Auth state check error:', error);
        if (mounted) {
          setAuthState({
            user: null,
            session: null,
            isAdmin: false,
            loading: false
          });
        }
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        if (session?.user) {
          try {
            const isAdmin = await securityService.verifyAdminAccess(session.user.id);
            
            if (mounted) {
              setAuthState({
                user: session.user,
                session,
                isAdmin,
                loading: false
              });
            }
          } catch (error) {
            console.error('Error checking admin status:', error);
            if (mounted) {
              setAuthState({
                user: session.user,
                session,
                isAdmin: false,
                loading: false
              });
            }
          }
        } else {
          if (mounted) {
            setAuthState({
              user: null,
              session: null,
              isAdmin: false,
              loading: false
            });
          }
        }
      }
    );

    // Initial auth check
    checkAuthState();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return authState;
};
