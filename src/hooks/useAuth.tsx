
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { securityService } from '@/services/securityService';
import { adminVerificationService, adminCacheService } from '@/services/adminVerificationService';
import { useInactivityTracker } from './useInactivityTracker';
import InactivityWarning from '@/components/auth/InactivityWarning';
import VerificationProgress from '@/components/auth/VerificationProgress';

interface AuthState {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  loading: boolean;
}

interface VerificationState {
  isVisible: boolean;
  status: 'verifying' | 'success' | 'error';
  message?: string;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    isAdmin: false,
    loading: true
  });

  const [verificationState, setVerificationState] = useState<VerificationState>({
    isVisible: false,
    status: 'verifying'
  });

  const {
    showWarning,
    timeLeft,
    extendSession,
    handleSignOut
  } = useInactivityTracker(!!authState.user);

  const showVerificationProgress = (status: 'verifying' | 'success' | 'error', message?: string) => {
    setVerificationState({
      isVisible: true,
      status,
      message
    });

    // Auto-hide success/error messages after 3 seconds
    if (status !== 'verifying') {
      setTimeout(() => {
        setVerificationState(prev => ({ ...prev, isVisible: false }));
      }, 3000);
    }
  };

  useEffect(() => {
    let mounted = true;
    let sessionCheckTimeout: NodeJS.Timeout;

    const checkAuthState = async () => {
      try {
        if (authState.loading && authState.user) {
          showVerificationProgress('verifying');
        }

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

          if (sessionCheck.isAdmin) {
            showVerificationProgress('success');
          }
        } else {
          setAuthState({
            user: null,
            session: null,
            isAdmin: false,
            loading: false
          });
        }
      } catch (error) {
        if (mounted) {
          setAuthState({
            user: null,
            session: null,
            isAdmin: false,
            loading: false
          });
          showVerificationProgress('error', 'Authentication check failed');
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
            showVerificationProgress('verifying');
            
            const isAdmin = await adminVerificationService.verifyAdminAccess(session.user.id);
            
            if (mounted) {
              setAuthState({
                user: session.user,
                session,
                isAdmin,
                loading: false
              });

              if (isAdmin) {
                showVerificationProgress('success');
                // Extend cache TTL for active admin users
                adminVerificationService.extendAdminCache(session.user.id);
              } else {
                showVerificationProgress('error', 'Admin access denied');
              }
            }
          } catch (error) {
            if (mounted) {
              setAuthState({
                user: session.user,
                session,
                isAdmin: false,
                loading: false
              });
              showVerificationProgress('error', 'Admin verification failed');
            }
          }
        } else {
          // Clear cache when user logs out
          adminVerificationService.clearCache();
          
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
    }, 30000); // Increased timeout to 30 seconds

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
    ),
    VerificationProgressComponent: () => (
      <VerificationProgress
        isVisible={verificationState.isVisible}
        status={verificationState.status}
        message={verificationState.message}
      />
    )
  };
};
