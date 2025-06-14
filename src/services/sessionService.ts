
import { supabase } from "@/integrations/supabase/client";
import { adminVerificationService } from "./adminVerificationService";
import { networkRetryService } from "./networkRetryService";

interface SessionValidationResult {
  valid: boolean;
  user?: any;
  isAdmin?: boolean;
}

class SessionService {
  async validateSession(): Promise<SessionValidationResult> {
    try {
      const { data: { session }, error } = await networkRetryService.executeWithRetry(
        () => supabase.auth.getSession(),
        { maxRetries: 2, baseDelay: 1000, timeoutMs: 20000 }
      );
      
      if (error || !session) {
        return { valid: false };
      }
      
      const currentTime = Date.now();
      const expiryTime = session.expires_at ? session.expires_at * 1000 : 0;
      const bufferTime = 5 * 60 * 1000;
      
      if (expiryTime > 0 && expiryTime - bufferTime < currentTime) {
        try {
          const { data: refreshData, error: refreshError } = await networkRetryService.executeWithRetry(
            () => supabase.auth.refreshSession(),
            { maxRetries: 2, baseDelay: 1500, timeoutMs: 25000 }
          );
          
          if (refreshError || !refreshData.session) {
            await supabase.auth.signOut();
            return { valid: false };
          }
          
          const refreshedSession = refreshData.session;
          const isAdmin = await adminVerificationService.verifyAdminAccess(refreshedSession.user.id);
          return { valid: true, user: refreshedSession.user, isAdmin };
        } catch (refreshError) {
          console.error('Error refreshing session:', refreshError);
          await supabase.auth.signOut();
          return { valid: false };
        }
      }
      
      const isAdmin = await adminVerificationService.verifyAdminAccess(session.user.id);
      
      return { valid: true, user: session.user, isAdmin };
    } catch (error) {
      console.error('Session validation error:', error);
      return { valid: false };
    }
  }
}

export const sessionService = new SessionService();
