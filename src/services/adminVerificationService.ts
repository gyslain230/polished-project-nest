
import { supabase } from "@/integrations/supabase/client";

class AdminVerificationService {
  // Enhanced admin verification with better timeout and error handling
  async verifyAdminAccess(userId: string): Promise<boolean> {
    try {
      console.log('=== ADMIN VERIFICATION START ===');
      console.log('Verifying admin access for user ID:', userId);
      
      // Add timeout to user fetch
      const userPromise = supabase.auth.getUser();
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('User fetch timeout')), 5000)
      );
      
      const { data: { user }, error } = await Promise.race([userPromise, timeoutPromise]);
      
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

      // Check for existing profile with timeout
      console.log('Checking for existing profile...');
      const profilePromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      const profileTimeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Profile check timeout')), 5000)
      );
      
      const { data: profileData, error: profileError } = await Promise.race([
        profilePromise, 
        profileTimeoutPromise
      ]);

      if (profileError) {
        console.log('Profile query error:', profileError);
        
        // If no profile exists, create one for the admin user
        if (profileError.code === 'PGRST116') { // No rows found
          console.log('No profile found, creating admin profile...');
          
          const insertPromise = supabase
            .from('profiles')
            .insert({
              id: userId,
              email: user.email,
              name: user.email.split('@')[0],
              role: 'Admin'
            })
            .select()
            .single();
            
          const insertTimeoutPromise = new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('Profile creation timeout')), 5000)
          );

          const { data: insertData, error: insertError } = await Promise.race([
            insertPromise,
            insertTimeoutPromise
          ]);

          if (insertError) {
            console.error('Failed to create admin profile:', insertError);
            return false;
          }
          
          console.log('Admin profile created:', insertData);
        } else {
          console.error('Unexpected profile query error:', profileError);
          return false;
        }
      } else {
        console.log('Profile found:', profileData);
        
        // Update profile email if it doesn't match with timeout
        if (profileData.email !== user.email) {
          console.log('Updating profile email to match auth email...');
          const updatePromise = supabase
            .from('profiles')
            .update({ email: user.email })
            .eq('id', userId);
            
          const updateTimeoutPromise = new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('Profile update timeout')), 3000)
          );
            
          try {
            await Promise.race([updatePromise, updateTimeoutPromise]);
            console.log('Profile email updated successfully');
          } catch (updateError) {
            console.error('Failed to update profile email:', updateError);
            // Don't fail admin verification for email update failure
          }
        }
      }
      
      // Use the database function to check admin status with timeout
      console.log('Calling is_admin database function...');
      const adminPromise = supabase.rpc('is_admin', { user_id: userId });
      const adminTimeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Admin RPC timeout')), 5000)
      );
      
      const { data, error: adminError } = await Promise.race([
        adminPromise,
        adminTimeoutPromise
      ]);
      
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
