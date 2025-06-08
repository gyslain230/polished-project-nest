
import { supabase } from "@/integrations/supabase/client";
import { adminVerificationService } from "./adminVerificationService";

class SecurityLoggingService {
  // Log security events for monitoring
  async logSecurityEvent(action: string, description: string): Promise<void> {
    try {
      // Only log if user is admin (since logs table requires admin access)
      const { data: { user } } = await supabase.auth.getUser();
      if (user && await adminVerificationService.verifyAdminAccess(user.id)) {
        await supabase.from('logs').insert({
          action,
          description: `${description} - ${new Date().toISOString()}`
        });
      }
    } catch (error) {
      // Silently fail for logging to not affect main functionality
      console.error('Security logging error:', error);
    }
  }
}

export const securityLoggingService = new SecurityLoggingService();
