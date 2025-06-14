
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
        // Increase timeout to prevent premature failures
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

          console.log('Session validated successfully');
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

    // Enhanced auth state listener with better error handling
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        console.log('Auth state change:', event);

        // Clear any existing timeout
        if (sessionCheckTimeout) {
          clearTimeout(sessionCheckTimeout);
        }

        if (session?.user) {
          try {
            // Significantly increase timeout and add graceful fallback
            const timeoutPromise = new Promise<boolean>((resolve) => 
              setTimeout(() => {
                console.log('Admin verification timeout, defaulting to false');
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

              if (event === 'SIGNED_IN') {
                console.log('User signed in successfully');
              }
            }
          } catch (error) {
            console.error('Error checking admin status:', error);
            // Don't fail the entire auth process due to admin check failure
            if (mounted) {
              setAuthState({
                user: session.user,
                session,
                isAdmin: false, // Default to false on error
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

            if (event === 'SIGNED_OUT') {
              console.log('User signed out successfully');
            }
          }
        }
      }
    );

    // Increased timeout for initial auth check
    sessionCheckTimeout = setTimeout(() => {
      if (mounted) {
        console.log('Auth check timeout, setting loading to false');
        setAuthState(prev => ({ ...prev, loading: false }));
      }
    }, 15000); // Increased from 10 to 15 seconds

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
