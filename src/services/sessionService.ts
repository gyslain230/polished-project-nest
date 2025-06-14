
import { supabase } from "@/integrations/supabase/client";
import { adminVerificationService } from "./adminVerificationService";

interface SessionValidationResult {
  valid: boolean;
  user?: any;
  isAdmin?: boolean;
}

class SessionService {
  // Optimized admin verification to prevent delays
  private async quickAdminVerification(userId: string, email: string): Promise<boolean> {
    try {
      // First check if email is confirmed
      if (!email) {
        console.log('Quick admin verification failed: No email');
        return false;
      }
      
      // Use a timeout to prevent hanging
      const timeoutPromise = new Promise<boolean>((_, reject) => 
        setTimeout(() => reject(new Error('Admin verification timeout')), 5000)
      );
      
      const verificationPromise = adminVerificationService.verifyAdminAccess(userId);
      
      const result = await Promise.race([verificationPromise, timeoutPromise]);
      return result;
    } catch (error) {
      console.error('Quick admin verification error:', error);
      // If verification times out or fails, allow login but mark as non-admin for safety
      return false;
    }
  }

  // Optimized session validation
  async validateSession(): Promise<SessionValidationResult> {
    try {
      console.log('Validating session...');
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.log('Session validation error:', error.message);
        return { valid: false };
      }
      
      if (!session) {
        console.log('No active session');
        return { valid: false };
      }
      
      // Check if session is expired
      if (session.expires_at && session.expires_at * 1000 < Date.now()) {
        console.log('Session expired');
        await supabase.auth.signOut();
        return { valid: false };
      }
      
      // Quick admin verification for existing sessions
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
