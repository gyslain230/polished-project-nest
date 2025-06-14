
import { supabase } from "@/integrations/supabase/client";
import { adminVerificationService } from "./adminVerificationService";

interface SessionValidationResult {
  valid: boolean;
  user?: any;
  isAdmin?: boolean;
}

class SessionService {
  // More resilient admin verification with better timeout handling
  private async quickAdminVerification(userId: string, email: string): Promise<boolean> {
    try {
      if (!email) {
        console.log('Quick admin verification failed: No email');
        return false;
      }
      
      // Increased timeout and better error handling
      const timeoutPromise = new Promise<boolean>((resolve) => 
        setTimeout(() => {
          console.log('Admin verification timeout, returning false');
          resolve(false);
        }, 10000) // Increased from 5 to 10 seconds
      );
      
      const verificationPromise = adminVerificationService.verifyAdminAccess(userId);
      
      const result = await Promise.race([verificationPromise, timeoutPromise]);
      return result;
    } catch (error) {
      console.error('Quick admin verification error:', error);
      // Always return false on error to prevent auth disruption
      return false;
    }
  }

  // Enhanced session validation with better error recovery
  async validateSession(): Promise<SessionValidationResult> {
    try {
      console.log('Validating session...');
      
      // Add timeout to session check as well
      const sessionPromise = supabase.auth.getSession();
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Session check timeout')), 8000)
      );
      
      const { data: { session }, error } = await Promise.race([sessionPromise, timeoutPromise]);
      
      if (error) {
        console.log('Session validation error:', error.message);
        return { valid: false };
      }
      
      if (!session) {
        console.log('No active session');
        return { valid: false };
      }
      
      // Check if session is expired with buffer time
      const currentTime = Date.now();
      const expiryTime = session.expires_at ? session.expires_at * 1000 : 0;
      const bufferTime = 5 * 60 * 1000; // 5 minutes buffer
      
      if (expiryTime > 0 && expiryTime - bufferTime < currentTime) {
        console.log('Session near expiry or expired, refreshing...');
        try {
          const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
          if (refreshError || !refreshData.session) {
            console.log('Session refresh failed:', refreshError?.message);
            await supabase.auth.signOut();
            return { valid: false };
          }
          // Use refreshed session
          const refreshedSession = refreshData.session;
          const isAdmin = await this.quickAdminVerification(refreshedSession.user.id, refreshedSession.user.email || '');
          return { valid: true, user: refreshedSession.user, isAdmin };
        } catch (refreshError) {
          console.error('Error refreshing session:', refreshError);
          await supabase.auth.signOut();
          return { valid: false };
        }
      }
      
      // Session is valid, check admin status
      const isAdmin = await this.quickAdminVerification(session.user.id, session.user.email || '');
      console.log('Session admin verification:', isAdmin);
      
      return { valid: true, user: session.user, isAdmin };
    } catch (error) {
      console.error('Session validation error:', error);
      return { valid: false };
    }
  }
}

export const sessionService = new SessionService();
