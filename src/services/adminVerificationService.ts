
import { supabase } from "@/integrations/supabase/client";

class AdminVerificationService {
  async verifyAdminAccess(userId: string): Promise<boolean> {
    try {
      const userPromise = supabase.auth.getUser();
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('User fetch timeout')), 5000)
      );
      
      const { data: { user }, error } = await Promise.race([userPromise, timeoutPromise]);
      
      if (error || !user) {
        return false;
      }
      
      if (user.id !== userId) {
        return false;
      }
      
      if (!user.email_confirmed_at) {
        return false;
      }

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
        if (profileError.code === 'PGRST116') {
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

          const { error: insertError } = await Promise.race([
            insertPromise,
            insertTimeoutPromise
          ]);

          if (insertError) {
            console.error('Failed to create admin profile:', insertError);
            return false;
          }
        } else {
          console.error('Profile query error:', profileError);
          return false;
        }
      } else {
        if (profileData.email !== user.email) {
          const updatePromise = supabase
            .from('profiles')
            .update({ email: user.email })
            .eq('id', userId);
            
          const updateTimeoutPromise = new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('Profile update timeout')), 3000)
          );
            
          try {
            await Promise.race([updatePromise, updateTimeoutPromise]);
          } catch (updateError) {
            console.error('Failed to update profile email:', updateError);
          }
        }
      }
      
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
      
      return isAdmin;
    } catch (error) {
      console.error('Error verifying admin access:', error);
      return false;
    }
  }
}

export const adminVerificationService = new AdminVerificationService();
