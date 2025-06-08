
import { supabase } from "@/integrations/supabase/client";

class AdminVerificationService {
  // Enhanced admin verification with better error handling
  async verifyAdminAccess(userId: string): Promise<boolean> {
    try {
      // Get user from auth
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        console.log('Admin verification failed: No authenticated user');
        return false;
      }
      
      // Verify the user ID matches
      if (user.id !== userId) {
        console.log('Admin verification failed: User ID mismatch');
        return false;
      }
      
      // Use the database function to check admin status
      const { data, error: adminError } = await supabase.rpc('is_admin', { user_id: userId });
      
      if (adminError) {
        console.error('Error checking admin status:', adminError);
        return false;
      }
      
      const isAdmin = data === true;
      console.log(`Admin verification for ${user.email}: ${isAdmin}`);
      
      return isAdmin && user.email_confirmed_at !== null;
    } catch (error) {
      console.error('Error verifying admin access:', error);
      return false;
    }
  }
}

export const adminVerificationService = new AdminVerificationService();
