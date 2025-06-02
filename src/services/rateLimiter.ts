
interface RateLimitEntry {
  count: number;
  lastReset: number;
}

class RateLimiter {
  private attempts: Map<string, RateLimitEntry> = new Map();
  private maxAttempts: number;
  private windowMs: number;

  constructor(maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }

  canMakeRequest(identifier: string): boolean {
    const now = Date.now();
    const entry = this.attempts.get(identifier);

    if (!entry) {
      this.attempts.set(identifier, { count: 1, lastReset: now });
      return true;
    }

    // Reset if window has passed
    if (now - entry.lastReset > this.windowMs) {
      this.attempts.set(identifier, { count: 1, lastReset: now });
      return true;
    }

    // Check if under limit
    if (entry.count < this.maxAttempts) {
      entry.count++;
      return true;
    }

    return false;
  }

  getRemainingTime(identifier: string): number {
    const entry = this.attempts.get(identifier);
    if (!entry) return 0;

    const now = Date.now();
    const timeLeft = this.windowMs - (now - entry.lastReset);
    return Math.max(0, timeLeft);
  }
}

export const contactFormLimiter = new RateLimiter(3, 10 * 60 * 1000); // 3 attempts per 10 minutes
export const loginLimiter = new RateLimiter(5, 15 * 60 * 1000); // 5 attempts per 15 minutes
