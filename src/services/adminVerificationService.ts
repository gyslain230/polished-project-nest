
import { supabase } from "@/integrations/supabase/client";
import { networkRetryService } from "./networkRetryService";
import { adminCacheService } from "./adminCacheService";

class AdminVerificationService {
  async verifyAdminAccess(userId: string): Promise<boolean> {
    try {
      // Check cache first
      const cachedResult = adminCacheService.get(userId);
      if (cachedResult !== null) {
        return cachedResult;
      }

      // Verify user authentication with retry
      const user = await networkRetryService.executeWithRetry(
        async () => {
          const { data: { user }, error } = await supabase.auth.getUser();
          if (error || !user) {
            throw new Error('User authentication failed');
          }
          return user;
        },
        { maxRetries: 2, baseDelay: 1000, timeoutMs: 15000 }
      );
      
      if (user.id !== userId || !user.email_confirmed_at) {
        adminCacheService.set(userId, false, 2 * 60 * 1000); // Cache for 2 minutes
        return false;
      }

      // Check/create profile with retry
      await networkRetryService.executeWithRetry(
        async () => {
          // First, try to create admin profile using secure function
          const { error: createError } = await supabase.rpc('create_admin_profile', {
            p_user_id: userId,
            p_user_email: user.email
          });

          // If create function returns false, user is not admin
          if (createError && createError.message.includes('false')) {
            throw new Error('User is not an authorized administrator');
          }
          
          if (createError) {
            throw new Error('Failed to create/verify admin profile');
          }
        },
        { maxRetries: 2, baseDelay: 1500, timeoutMs: 20000 }
      );
      
      // Check admin status with retry
      const isAdmin = await networkRetryService.executeWithRetry(
        async () => {
          const { data, error: adminError } = await supabase.rpc('is_admin', { user_id: userId });
          
          if (adminError) {
            throw new Error('Admin status check failed');
          }
          
          return data === true;
        },
        { maxRetries: 3, baseDelay: 1000, timeoutMs: 15000 }
      );
      
      // Cache the result - longer TTL for admin users
      const cacheTtl = isAdmin ? 10 * 60 * 1000 : 2 * 60 * 1000; // 10 min for admin, 2 min for non-admin
      adminCacheService.set(userId, isAdmin, cacheTtl);
      
      return isAdmin;
    } catch (error) {
      console.error('Error verifying admin access:', error);
      
      // Check if we have any cached result as fallback
      const fallbackResult = adminCacheService.get(userId);
      if (fallbackResult !== null) {
        console.log('Using cached admin status as fallback');
        return fallbackResult;
      }
      
      return false;
    }
  }

  // Method to clear cache when user logs out
  clearCache(userId?: string): void {
    adminCacheService.clear(userId);
  }

  // Method to extend cache TTL when user is active
  extendAdminCache(userId: string): void {
    adminCacheService.extendTtl(userId);
  }
}

export const adminVerificationService = new AdminVerificationService();
export { adminCacheService };
