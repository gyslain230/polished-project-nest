
import { supabase } from "@/integrations/supabase/client";
import { rateLimitService } from "./rateLimitService";

class LogoutService {
  // Clear security-related data
  private clearSecurityData(): void {
    try {
      // Only clear login attempts data, not other app data
      rateLimitService.clearSecurityData();
    } catch (error) {
      console.error('Error clearing security data:', error);
    }
  }

  // Enhanced secure logout with proper cleanup
  async secureLogout(): Promise<void> {
    try {
      console.log('Performing secure logout...');
      
      // Clear auth state immediately to prevent UI delays
      await supabase.auth.signOut({ scope: 'local' });
      
      // Clear any sensitive data from localStorage
      this.clearSecurityData();
      
      console.log('Logout completed successfully');
    } catch (error) {
      console.error('Logout error:', error);
      // Force local session clear even if remote logout fails
      try {
        await supabase.auth.signOut({ scope: 'local' });
      } catch (localError) {
        console.error('Local logout error:', localError);
      }
      this.clearSecurityData();
    }
  }
}

export const logoutService = new LogoutService();
