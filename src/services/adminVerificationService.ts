
import { supabase } from "@/integrations/supabase/client";

class AdminVerificationService {
  // Enhanced admin verification with better error handling
  async verifyAdminAccess(userId: string): Promise<boolean> {
    try {
      console.log('Verifying admin access for user ID:', userId);
      
      // Get user from auth
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        console.log('Admin verification failed: No authenticated user', error?.message);
        return false;
      }
      
      console.log('Current authenticated user:', user.email, 'ID:', user.id);
      
      // Verify the user ID matches
      if (user.id !== userId) {
        console.log('Admin verification failed: User ID mismatch', 'Expected:', userId, 'Got:', user.id);
        return false;
      }
      
      // Use the database function to check admin status
      console.log('Calling is_admin database function...');
      const { data, error: adminError } = await supabase.rpc('is_admin', { user_id: userId });
      
      if (adminError) {
        console.error('Error checking admin status:', adminError);
        return false;
      }
      
      const isAdmin = data === true;
      console.log(`Admin verification result for ${user.email} (${userId}):`, isAdmin);
      console.log('User email confirmed:', user.email_confirmed_at !== null);
      
      // Check if email is confirmed
      if (!user.email_confirmed_at) {
        console.log('Admin verification failed: Email not confirmed');
        return false;
      }
      
      return isAdmin;
    } catch (error) {
      console.error('Error verifying admin access:', error);
      return false;
    }
  }
}

export const adminVerificationService = new AdminVerificationService();
