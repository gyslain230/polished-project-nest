
import { supabase } from "@/integrations/supabase/client";
import { validateEmail } from "./inputSanitizer";

interface LoginAttempt {
  count: number;
  lastAttempt: number;
  blocked: boolean;
}

class SecurityService {
  private readonly MAX_LOGIN_ATTEMPTS = 5;
  private readonly LOCKOUT_DURATION = 10 * 60 * 1000; // 10 minutes
  private readonly STORAGE_KEY = 'login_attempts';

  // Get login attempts from localStorage
  private getLoginAttempts(): Map<string, LoginAttempt> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        return new Map(Object.entries(data));
      }
    } catch (error) {
      console.error('Error reading login attempts from localStorage:', error);
    }
    return new Map();
  }

  // Save login attempts to localStorage
  private saveLoginAttempts(attempts: Map<string, LoginAttempt>): void {
    try {
      const data = Object.fromEntries(attempts);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving login attempts to localStorage:', error);
    }
  }

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

  // Rate limiting for login attempts
  checkLoginRateLimit(identifier: string): { allowed: boolean; remainingTime?: number } {
    const loginAttempts = this.getLoginAttempts();
    const attempt = loginAttempts.get(identifier);
    const now = Date.now();
    
    if (!attempt) {
      return { allowed: true };
    }
    
    // Reset if lockout period has expired
    if (attempt.blocked && now - attempt.lastAttempt > this.LOCKOUT_DURATION) {
      loginAttempts.delete(identifier);
      this.saveLoginAttempts(loginAttempts);
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
    const loginAttempts = this.getLoginAttempts();
    const now = Date.now();
    const attempt = loginAttempts.get(identifier) || { count: 0, lastAttempt: now, blocked: false };
    
    if (success) {
      // Reset on successful login
      loginAttempts.delete(identifier);
      this.saveLoginAttempts(loginAttempts);
      return;
    }
    
    attempt.count++;
    attempt.lastAttempt = now;
    
    if (attempt.count >= this.MAX_LOGIN_ATTEMPTS) {
      attempt.blocked = true;
      console.log(`User ${identifier} blocked after ${attempt.count} failed attempts`);
    }
    
    loginAttempts.set(identifier, attempt);
    this.saveLoginAttempts(loginAttempts);
  }

  // Get remaining attempts before lockout
  getRemainingAttempts(identifier: string): number {
    const loginAttempts = this.getLoginAttempts();
    const attempt = loginAttempts.get(identifier);
    if (!attempt || attempt.blocked) {
      return 0;
    }
    return this.MAX_LOGIN_ATTEMPTS - attempt.count;
  }

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
  async secureLogin(email: string, password: string): Promise<{ success: boolean; error?: string; user?: any }> {
    try {
      // Enhanced input validation
      const validation = this.validateInput(email, password);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }
      
      const emailKey = email.trim().toLowerCase();
      
      // Check rate limiting
      const rateLimit = this.checkLoginRateLimit(emailKey);
      if (!rateLimit.allowed) {
        const minutes = Math.ceil((rateLimit.remainingTime || 0) / 60000);
        return { 
          success: false, 
          error: `Too many failed login attempts. Account temporarily locked. Try again in ${minutes} minute${minutes !== 1 ? 's' : ''}.` 
        };
      }
      
      console.log(`Login attempt for ${emailKey}, attempts: ${this.getLoginAttempts().get(emailKey)?.count || 0}/${this.MAX_LOGIN_ATTEMPTS}`);
      
      // Attempt login
      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailKey,
        password
      });
      
      if (error) {
        console.log('Supabase auth error:', error.message);
        this.recordLoginAttempt(emailKey, false);
        
        const remainingAttempts = this.getRemainingAttempts(emailKey);
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
        this.recordLoginAttempt(emailKey, false);
        return { success: false, error: "Login failed" };
      }
      
      // Verify admin access for this application
      const isAdmin = await this.verifyAdminAccess(data.user.id);
      if (!isAdmin) {
        // Sign out the user since they're not authorized for admin access
        await supabase.auth.signOut();
        this.recordLoginAttempt(emailKey, false);
        return { success: false, error: "Access denied. This application is restricted to authorized administrators only." };
      }
      
      // Record successful attempt
      this.recordLoginAttempt(emailKey, true);
      console.log(`Successful admin login for ${emailKey}`);
      
      return { success: true, user: data.user };
    } catch (error) {
      console.error('Secure login error:', error);
      return { success: false, error: "Login system error" };
    }
  }

  // Enhanced session validation
  async validateSession(): Promise<{ valid: boolean; user?: any; isAdmin?: boolean }> {
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
      const isAdmin = await this.verifyAdminAccess(session.user.id);
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
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing security data:', error);
    }
  }

  // Log security events for monitoring
  async logSecurityEvent(action: string, description: string): Promise<void> {
    try {
      // Only log if user is admin (since logs table requires admin access)
      const { data: { user } } = await supabase.auth.getUser();
      if (user && await this.verifyAdminAccess(user.id)) {
        await supabase.from('logs').insert({
          action,
          description: `${description} - ${new Date().toISOString()}`
        });
      }
    } catch (error) {
      // Silently fail for logging to not affect main functionality
      console.error('Security logging error:', error);
    }
  }
}

export const securityService = new SecurityService();
