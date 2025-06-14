
import { supabase } from "@/integrations/supabase/client";

class AdminVerificationService {
  // Enhanced admin verification with better error handling
  async verifyAdminAccess(userId: string): Promise<boolean> {
    try {
      console.log('=== ADMIN VERIFICATION START ===');
      console.log('Verifying admin access for user ID:', userId);
      
      // Get user from auth
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        console.log('Admin verification failed: No authenticated user', error?.message);
        return false;
      }
      
      console.log('Current authenticated user:', user.email, 'ID:', user.id);
      console.log('User email confirmed:', user.email_confirmed_at !== null);
      
      // Verify the user ID matches
      if (user.id !== userId) {
        console.log('Admin verification failed: User ID mismatch', 'Expected:', userId, 'Got:', user.id);
        return false;
      }
      
      // Check if email is confirmed first
      if (!user.email_confirmed_at) {
        console.log('Admin verification failed: Email not confirmed');
        return false;
      }

      // First, check if a profile exists for this user
      console.log('Checking for existing profile...');
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.log('Profile query error:', profileError);
        
        // If no profile exists, create one for the admin user
        if (profileError.code === 'PGRST116') { // No rows found
          console.log('No profile found, creating admin profile...');
          
          const { data: insertData, error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: userId,
              email: user.email,
              name: user.email.split('@')[0], // Use part before @ as default name
              role: 'Admin'
            })
            .select()
            .single();

          if (insertError) {
            console.error('Failed to create admin profile:', insertError);
            return false;
          }
          
          console.log('Admin profile created:', insertData);
          
          // Now verify admin status with the database function
          console.log('Calling is_admin database function after profile creation...');
          const { data, error: adminError } = await supabase.rpc('is_admin', { user_id: userId });
          
          if (adminError) {
            console.error('Error checking admin status after profile creation:', adminError);
            return false;
          }
          
          const isAdmin = data === true;
          console.log(`Admin verification result after profile creation for ${user.email} (${userId}):`, isAdmin);
          return isAdmin;
        } else {
          console.error('Unexpected profile query error:', profileError);
          return false;
        }
      }
      
      console.log('Profile found:', profileData);
      console.log('Profile email:', profileData.email);
      console.log('Auth user email:', user.email);
      
      // Update profile email if it doesn't match the auth email
      if (profileData.email !== user.email) {
        console.log('Updating profile email to match auth email...');
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ email: user.email })
          .eq('id', userId);
          
        if (updateError) {
          console.error('Failed to update profile email:', updateError);
        } else {
          console.log('Profile email updated successfully');
        }
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
      console.log('=== ADMIN VERIFICATION END ===');
      
      return isAdmin;
    } catch (error) {
      console.error('Error verifying admin access:', error);
      return false;
    }
  }
}

export const adminVerificationService = new AdminVerificationService();
