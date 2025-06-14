
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
    let sessionCheckTimeout: NodeJS.Timeout;

    const checkAuthState = async () => {
      try {
        // Add timeout to prevent infinite loading
        const timeoutPromise = new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Auth check timeout')), 8000)
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

          // Log successful session validation
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

    // Set up auth state listener with enhanced security and timeout protection
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
            // Set a reasonable timeout for admin verification
            const timeoutPromise = new Promise<boolean>((_, reject) => 
              setTimeout(() => reject(new Error('Admin verification timeout')), 5000)
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

              // Log auth events for security monitoring
              if (event === 'SIGNED_IN') {
                console.log('User signed in successfully');
              }
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

            if (event === 'SIGNED_OUT') {
              console.log('User signed out successfully');
            }
          }
        }
      }
    );

    // Initial auth check with timeout protection
    sessionCheckTimeout = setTimeout(() => {
      if (mounted) {
        console.log('Auth check timeout, setting loading to false');
        setAuthState(prev => ({ ...prev, loading: false }));
      }
    }, 10000); // 10 second maximum loading time

    checkAuthState();

    return () => {
      mounted = false;
      if (sessionCheckTimeout) {
        clearTimeout(sessionCheckTimeout);
      }
      subscription.unsubscribe();
    };
  }, []);

  return authState;
};
