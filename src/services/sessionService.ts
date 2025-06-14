
import { supabase } from "@/integrations/supabase/client";
import { adminVerificationService } from "./adminVerificationService";

interface SessionValidationResult {
  valid: boolean;
  user?: any;
  isAdmin?: boolean;
}

class SessionService {
  private async quickAdminVerification(userId: string, email: string): Promise<boolean> {
    try {
      if (!email) {
        return false;
      }
      
      const timeoutPromise = new Promise<boolean>((resolve) => 
        setTimeout(() => {
          resolve(false);
        }, 10000)
      );
      
      const verificationPromise = adminVerificationService.verifyAdminAccess(userId);
      
      const result = await Promise.race([verificationPromise, timeoutPromise]);
      return result;
    } catch (error) {
      console.error('Admin verification error:', error);
      return false;
    }
  }

  async validateSession(): Promise<SessionValidationResult> {
    try {
      const sessionPromise = supabase.auth.getSession();
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Session check timeout')), 8000)
      );
      
      const { data: { session }, error } = await Promise.race([sessionPromise, timeoutPromise]);
      
      if (error) {
        return { valid: false };
      }
      
      if (!session) {
        return { valid: false };
      }
      
      const currentTime = Date.now();
      const expiryTime = session.expires_at ? session.expires_at * 1000 : 0;
      const bufferTime = 5 * 60 * 1000;
      
      if (expiryTime > 0 && expiryTime - bufferTime < currentTime) {
        try {
          const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
          if (refreshError || !refreshData.session) {
            await supabase.auth.signOut();
            return { valid: false };
          }
          const refreshedSession = refreshData.session;
          const isAdmin = await this.quickAdminVerification(refreshedSession.user.id, refreshedSession.user.email || '');
          return { valid: true, user: refreshedSession.user, isAdmin };
        } catch (refreshError) {
          console.error('Error refreshing session:', refreshError);
          await supabase.auth.signOut();
          return { valid: false };
        }
      }
      
      const isAdmin = await this.quickAdminVerification(session.user.id, session.user.email || '');
      
      return { valid: true, user: session.user, isAdmin };
    } catch (error) {
      console.error('Session validation error:', error);
      return { valid: false };
    }
  }
}

export const sessionService = new SessionService();
