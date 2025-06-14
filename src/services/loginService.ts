
import { supabase } from "@/integrations/supabase/client";
import { validateEmail } from "./inputSanitizer";
import { rateLimitService } from "./rateLimitService";
import { adminVerificationService } from "./adminVerificationService";

interface LoginResult {
  success: boolean;
  error?: string;
  user?: any;
}

class LoginService {
  private validateInput(email: string, password: string): { valid: boolean; error?: string } {
    if (!validateEmail(email)) {
      return { valid: false, error: "Invalid email format" };
    }
    
    if (email.includes('<') || email.includes('>') || email.includes('script')) {
      return { valid: false, error: "Invalid email format" };
    }
    
    if (!password || password.length < 6) {
      return { valid: false, error: "Password must be at least 6 characters" };
    }
    
    if (password.length > 128) {
      return { valid: false, error: "Password too long" };
    }
    
    return { valid: true };
  }

  async secureLogin(email: string, password: string): Promise<LoginResult> {
    try {
      const validation = this.validateInput(email, password);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }
      
      const emailKey = email.trim().toLowerCase();
      
      const rateLimit = rateLimitService.checkLoginRateLimit(emailKey);
      if (!rateLimit.allowed) {
        const minutes = Math.ceil((rateLimit.remainingTime || 0) / 60000);
        return { 
          success: false, 
          error: `Too many failed login attempts. Account temporarily locked. Try again in ${minutes} minute${minutes !== 1 ? 's' : ''}.` 
        };
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailKey,
        password
      });
      
      if (error) {
        rateLimitService.recordLoginAttempt(emailKey, false);
        
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
        rateLimitService.recordLoginAttempt(emailKey, false);
        return { success: false, error: "Login failed - no user data" };
      }
      
      // Use the improved admin verification
      const isAdmin = await adminVerificationService.verifyAdminAccess(data.user.id);
      
      if (!isAdmin) {
        await supabase.auth.signOut();
        rateLimitService.recordLoginAttempt(emailKey, false);
        
        return { 
          success: false, 
          error: "Access denied. This application is restricted to authorized administrators only." 
        };
      }
      
      rateLimitService.recordLoginAttempt(emailKey, true);
      
      return { success: true, user: data.user };
    } catch (error) {
      return { success: false, error: `Login system error: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
  }
}

export const loginService = new LoginService();
