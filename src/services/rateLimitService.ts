
interface LoginAttempt {
  count: number;
  lastAttempt: number;
  blocked: boolean;
}

class RateLimitService {
  public readonly MAX_LOGIN_ATTEMPTS = 5;
  private readonly LOCKOUT_DURATION = 10 * 60 * 1000; // 10 minutes
  private readonly STORAGE_KEY = 'login_attempts';

  // Get login attempts from localStorage
  getLoginAttempts(): Map<string, LoginAttempt> {
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

  // Clear security-related data
  clearSecurityData(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing security data:', error);
    }
  }
}

export const rateLimitService = new RateLimitService();
