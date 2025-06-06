
import { supabase } from "@/integrations/supabase/client";
import { validateEmail } from "./inputSanitizer";

interface LoginAttempt {
  count: number;
  lastAttempt: number;
  blocked: boolean;
}

class SecurityService {
  private loginAttempts: Map<string, LoginAttempt> = new Map();
  private readonly MAX_LOGIN_ATTEMPTS = 5;
  private readonly LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

  // Enhanced admin verification
  async verifyAdminAccess(userId: string): Promise<boolean> {
    try {
      // Get user from auth
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        return false;
      }
      
      // Verify the user ID matches
      if (user.id !== userId) {
        return false;
      }
      
      // Check if user email is the designated admin
      const adminEmail = 'gislainrugira@gmail.com';
      return user.email === adminEmail && user.email_confirmed_at !== null;
    } catch (error) {
      console.error('Error verifying admin access:', error);
      return false;
    }
  }

  // Rate limiting for login attempts
  checkLoginRateLimit(identifier: string): { allowed: boolean; remainingTime?: number } {
    const attempt = this.loginAttempts.get(identifier);
    const now = Date.now();
    
    if (!attempt) {
      return { allowed: true };
    }
    
    // Reset if lockout period has expired
    if (attempt.blocked && now - attempt.lastAttempt > this.LOCKOUT_DURATION) {
      this.loginAttempts.delete(identifier);
      return { allowed: true };
    }
    
    if (attempt.blocked) {
      const remainingTime = this.LOCKOUT_DURATION - (now - attempt.lastAttempt);
      return { allowed: false, remainingTime };
    }
    
    return { allowed: attempt.count < this.MAX_LOGIN_ATTEMPTS };
  }

  // Record login attempt
  recordLoginAttempt(identifier: string, success: boolean): void {
    const now = Date.now();
    const attempt = this.loginAttempts.get(identifier) || { count: 0, lastAttempt: now, blocked: false };
    
    if (success) {
      // Reset on successful login
      this.loginAttempts.delete(identifier);
      return;
    }
    
    attempt.count++;
    attempt.lastAttempt = now;
    
    if (attempt.count >= this.MAX_LOGIN_ATTEMPTS) {
      attempt.blocked = true;
    }
    
    this.loginAttempts.set(identifier, attempt);
  }

  // Secure login with enhanced validation
  async secureLogin(email: string, password: string): Promise<{ success: boolean; error?: string; user?: any }> {
    try {
      // Validate input format
      if (!validateEmail(email)) {
        return { success: false, error: "Invalid email format" };
      }
      
      if (!password || password.length < 6) {
        return { success: false, error: "Invalid password" };
      }
      
      // Check rate limiting
      const rateLimit = this.checkLoginRateLimit(email);
      if (!rateLimit.allowed) {
        const minutes = Math.ceil((rateLimit.remainingTime || 0) / 60000);
        return { 
          success: false, 
          error: `Too many failed attempts. Try again in ${minutes} minutes.` 
        };
      }
      
      // Attempt login
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password
      });
      
      if (error) {
        this.recordLoginAttempt(email, false);
        return { success: false, error: "Invalid credentials" };
      }
      
      if (!data.user) {
        this.recordLoginAttempt(email, false);
        return { success: false, error: "Login failed" };
      }
      
      // Record successful attempt
      this.recordLoginAttempt(email, true);
      
      return { success: true, user: data.user };
    } catch (error) {
      console.error('Secure login error:', error);
      return { success: false, error: "Login system error" };
    }
  }

  // Session validation
  async validateSession(): Promise<{ valid: boolean; user?: any }> {
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
      
      return { valid: true, user: session.user };
    } catch (error) {
      console.error('Session validation error:', error);
      return { valid: false };
    }
  }

  // Secure logout
  async secureLogout(): Promise<void> {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Logout error:', error);
      // Force local session clear even if remote logout fails
      localStorage.removeItem('supabase.auth.token');
    }
  }
}

export const securityService = new SecurityService();
