
import { supabase } from "@/integrations/supabase/client";
import { validateEmail } from "./inputSanitizer";
import { rateLimitService } from "./rateLimitService";
import { adminVerificationService } from "./adminVerificationService";
import { securityLoggingService } from "./securityLoggingService";

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
    
    // Enhanced password validation
    if (!password || password.length < 6) {
      return { valid: false, error: "Password must be at least 6 characters" };
    }
    
    if (password.length > 128) {
      return { valid: false, error: "Password too long" };
    }
    
    return { valid: true };
  }

  // Secure login with enhanced validation and error handling
  async secureLogin(email: string, password: string): Promise<LoginResult> {
    try {
      // Enhanced input validation
      const validation = this.validateInput(email, password);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }
      
      const emailKey = email.trim().toLowerCase();
      
      // Check rate limiting
      const rateLimit = rateLimitService.checkLoginRateLimit(emailKey);
      if (!rateLimit.allowed) {
        const minutes = Math.ceil((rateLimit.remainingTime || 0) / 60000);
        return { 
          success: false, 
          error: `Too many failed login attempts. Account temporarily locked. Try again in ${minutes} minute${minutes !== 1 ? 's' : ''}.` 
        };
      }
      
      console.log(`Login attempt for ${emailKey}, attempts: ${rateLimitService.getLoginAttempts().get(emailKey)?.count || 0}/${rateLimitService.MAX_LOGIN_ATTEMPTS}`);
      
      // Attempt login
      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailKey,
        password
      });
      
      if (error) {
        console.log('Supabase auth error:', error.message);
        rateLimitService.recordLoginAttempt(emailKey, false);
        
        const remainingAttempts = rateLimitService.getRemainingAttempts(emailKey);
        if (remainingAttempts > 0) {
          return { 
            success: false, 
            error: `Invalid credentials. ${remainingAttempts} attempt${remainingAttempts !== 1 ? 's' : ''} remaining before temporary lockout.` 
          };
        } else {
          return { 
            success: false, 
            error: "Too many failed login attempts. Account temporarily locked for 10 minutes." 
          };
        }
      }
      
      if (!data.user) {
        rateLimitService.recordLoginAttempt(emailKey, false);
        return { success: false, error: "Login failed" };
      }
      
      // Verify admin access for this application
      const isAdmin = await adminVerificationService.verifyAdminAccess(data.user.id);
      if (!isAdmin) {
        // Sign out the user since they're not authorized for admin access
        await supabase.auth.signOut();
        rateLimitService.recordLoginAttempt(emailKey, false);
        return { success: false, error: "Access denied. This application is restricted to authorized administrators only." };
      }
      
      // Record successful attempt
      rateLimitService.recordLoginAttempt(emailKey, true);
      console.log(`Successful admin login for ${emailKey}`);
      
      return { success: true, user: data.user };
    } catch (error) {
      console.error('Secure login error:', error);
      return { success: false, error: "Login system error" };
    }
  }

  // Enhanced session validation
  async validateSession(): Promise<SessionValidationResult> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        return { valid: false };
      }
      
      // Check if session is expired
      if (session.expires_at && session.expires_at * 1000 < Date.now()) {
        await supabase.auth.signOut();
        return { valid: false };
      }
      
      // Verify admin access for ongoing session
      const isAdmin = await adminVerificationService.verifyAdminAccess(session.user.id);
      if (!isAdmin) {
        // Sign out if admin access has been revoked
        await supabase.auth.signOut();
        return { valid: false };
      }
      
      return { valid: true, user: session.user, isAdmin };
    } catch (error) {
      console.error('Session validation error:', error);
      return { valid: false };
    }
  }

  // Secure logout with cleanup
  async secureLogout(): Promise<void> {
    try {
      await supabase.auth.signOut();
      // Clear any sensitive data from localStorage
      this.clearSecurityData();
    } catch (error) {
      console.error('Logout error:', error);
      // Force local session clear even if remote logout fails
      localStorage.removeItem('supabase.auth.token');
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
