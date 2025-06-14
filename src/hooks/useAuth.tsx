
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { securityService } from '@/services/securityService';
import { useInactivityTracker } from './useInactivityTracker';
import InactivityWarning from '@/components/auth/InactivityWarning';

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

  const {
    showWarning,
    timeLeft,
    extendSession,
    handleSignOut
  } = useInactivityTracker(!!authState.user);

  useEffect(() => {
    let mounted = true;
    let sessionCheckTimeout: NodeJS.Timeout;

    const checkAuthState = async () => {
      try {
        const timeoutPromise = new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Auth check timeout')), 15000)
        );
        
        const sessionCheckPromise = securityService.validateSession();
        
        const sessionCheck = await Promise.race([sessionCheckPromise, timeoutPromise]);
        
        if (!mounted) return;

        if (sessionCheck.valid && sessionCheck.user) {
          const session = await supabase.auth.getSession();
          
          if (!mounted) return;

          setAuthState({
            user: sessionCheck.user,
            session: session.data.session,
            isAdmin: sessionCheck.isAdmin || false,
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

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        if (sessionCheckTimeout) {
          clearTimeout(sessionCheckTimeout);
        }

        if (session?.user) {
          try {
            const timeoutPromise = new Promise<boolean>((resolve) => 
              setTimeout(() => {
                resolve(false);
              }, 12000)
            );
            
            const adminCheckPromise = securityService.verifyAdminAccess(session.user.id);
            const isAdmin = await Promise.race([adminCheckPromise, timeoutPromise]);
            
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

    sessionCheckTimeout = setTimeout(() => {
      if (mounted) {
        setAuthState(prev => ({ ...prev, loading: false }));
      }
    }, 15000);

    checkAuthState();

    return () => {
      mounted = false;
      if (sessionCheckTimeout) {
        clearTimeout(sessionCheckTimeout);
      }
      subscription.unsubscribe();
    };
  }, []);

  return {
    ...authState,
    InactivityWarningComponent: () => (
      <InactivityWarning
        isOpen={showWarning}
        timeLeft={timeLeft}
        onExtend={extendSession}
        onSignOut={handleSignOut}
      />
    )
  };
};
