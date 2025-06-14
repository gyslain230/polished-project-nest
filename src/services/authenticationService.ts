
import { supabase } from "@/integrations/supabase/client";
import { validateEmail } from "./inputSanitizer";
import { rateLimitService } from "./rateLimitService";
import { adminVerificationService } from "./adminVerificationService";

interface LoginResult {
  success: boolean;
  error?: string;
  user?: any;
}

interface SessionValidationResult {
  valid: boolean;
  user?: any;
  isAdmin?: boolean;
}

class AuthenticationService {
  // Enhanced input validation with additional security checks
  private validateInput(email: string, password: string): { valid: boolean; error?: string } {
    // Enhanced email validation
    if (!validateEmail(email)) {
      return { valid: false, error: "Invalid email format" };
    }
    
    // Check for suspicious patterns
    if (email.includes('<') || email.includes('>') || email.includes('script')) {
      return { valid: false, error: "Invalid email format" };
    }
    
    // Enhanced password validation - simplified to match frontend
    if (!password || password.length < 6) {
      return { valid: false, error: "Password must be at least 6 characters" };
    }
    
    if (password.length > 128) {
      return { valid: false, error: "Password too long" };
    }
    
    return { valid: true };
  }

  // Optimized secure login with faster verification
  async secureLogin(email: string, password: string): Promise<LoginResult> {
    try {
      console.log('=== AUTHENTICATION SERVICE LOGIN START ===');
      console.log('Starting secure login for:', email);
      
      // Enhanced input validation
      const validation = this.validateInput(email, password);
      if (!validation.valid) {
        console.log('Input validation failed:', validation.error);
        return { success: false, error: validation.error };
      }
      
      const emailKey = email.trim().toLowerCase();
      
      // Check rate limiting
      const rateLimit = rateLimitService.checkLoginRateLimit(emailKey);
      if (!rateLimit.allowed) {
        const minutes = Math.ceil((rateLimit.remainingTime || 0) / 60000);
        console.log('Rate limit exceeded for:', emailKey);
        return { 
          success: false, 
          error: `Too many failed login attempts. Account temporarily locked. Try again in ${minutes} minute${minutes !== 1 ? 's' : ''}.` 
        };
      }
      
      console.log(`Login attempt for ${emailKey}, attempts: ${rateLimitService.getLoginAttempts().get(emailKey)?.count || 0}/${rateLimitService.MAX_LOGIN_ATTEMPTS}`);
      
      // Attempt login with Supabase
      console.log('Attempting Supabase authentication...');
      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailKey,
        password
      });
      
      if (error) {
        console.log('Supabase auth error:', error.message);
        rateLimitService.recordLoginAttempt(emailKey, false);
        
        // Provide more specific error messages
        let errorMessage = "Invalid credentials";
        if (error.message.includes("Invalid login credentials")) {
          errorMessage = "The email or password you entered is incorrect";
        } else if (error.message.includes("Email not confirmed")) {
          errorMessage = "Please check your email and confirm your account before logging in";
        } else if (error.message.includes("Too many requests")) {
          errorMessage = "Too many login attempts. Please wait before trying again";
        }
        
        const remainingAttempts = rateLimitService.getRemainingAttempts(emailKey);
        if (remainingAttempts > 0) {
          return { 
            success: false, 
            error: `${errorMessage}. ${remainingAttempts} attempt${remainingAttempts !== 1 ? 's' : ''} remaining before temporary lockout.` 
          };
        } else {
          return { 
            success: false, 
            error: "Too many failed login attempts. Account temporarily locked for 10 minutes." 
          };
        }
      }
      
      if (!data.user) {
        console.log('No user returned from Supabase');
        rateLimitService.recordLoginAttempt(emailKey, false);
        return { success: false, error: "Login failed - no user data" };
      }
      
      console.log('Supabase authentication successful for:', data.user.email);
      console.log('User ID:', data.user.id);
      console.log('Email confirmed:', data.user.email_confirmed_at !== null);
      
      // Quick admin verification - optimized to prevent long delays
      console.log('Starting optimized admin verification...');
      const isAdmin = await this.quickAdminVerification(data.user.id, data.user.email);
      console.log('Admin verification result:', isAdmin);
      
      if (!isAdmin) {
        // Sign out the user since they're not authorized for admin access
        console.log('User is not admin, signing out...');
        await supabase.auth.signOut();
        rateLimitService.recordLoginAttempt(emailKey, false);
        
        return { 
          success: false, 
          error: "Access denied. This application is restricted to authorized administrators only." 
        };
      }
      
      // Record successful attempt
      rateLimitService.recordLoginAttempt(emailKey, true);
      console.log(`Successful admin login for ${emailKey}`);
      console.log('=== AUTHENTICATION SERVICE LOGIN END ===');
      
      return { success: true, user: data.user };
    } catch (error) {
      console.error('Secure login error:', error);
      return { success: false, error: `Login system error: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
  }

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

  // Clear security-related data
  private clearSecurityData(): void {
    try {
      // Only clear login attempts data, not other app data
      rateLimitService.clearSecurityData();
    } catch (error) {
      console.error('Error clearing security data:', error);
    }
  }
}

export const authenticationService = new AuthenticationService();
