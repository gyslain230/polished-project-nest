
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
          const session = await supabase.auth.getSession();
          
          if (!mounted) return;

          setAuthState({
            user: sessionCheck.user,
            session: session.data.session,
            isAdmin: sessionCheck.isAdmin || false,
            loading: false
          });

          // Log successful session validation
          await securityService.logSecurityEvent(
            'session_validated', 
            `Admin session validated for user ${sessionCheck.user.email}`
          );
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

    // Set up auth state listener with enhanced security
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        console.log('Auth state change:', event);

        if (session?.user) {
          try {
            // Use security service to verify admin access
            const isAdmin = await securityService.verifyAdminAccess(session.user.id);
            
            if (mounted) {
              setAuthState({
                user: session.user,
                session,
                isAdmin,
                loading: false
              });

              // Log auth events for security monitoring
              if (event === 'SIGNED_IN') {
                await securityService.logSecurityEvent(
                  'user_signed_in', 
                  `Admin user signed in: ${session.user.email}`
                );
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
              await securityService.logSecurityEvent(
                'user_signed_out', 
                'Admin user signed out'
              );
            }
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
