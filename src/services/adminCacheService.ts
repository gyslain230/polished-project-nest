
interface CacheEntry {
  value: boolean;
  timestamp: number;
  ttl: number;
}

class AdminCacheService {
  private cache = new Map<string, CacheEntry>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  set(userId: string, isAdmin: boolean, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(userId, {
      value: isAdmin,
      timestamp: Date.now(),
      ttl
    });
  }

  get(userId: string): boolean | null {
    const entry = this.cache.get(userId);
    
    if (!entry) {
      return null;
    }

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(userId);
      return null;
    }

    return entry.value;
  }

  clear(userId?: string): void {
    if (userId) {
      this.cache.delete(userId);
    } else {
      this.cache.clear();
    }
  }

  extendTtl(userId: string, additionalTime: number = this.DEFAULT_TTL): void {
    const entry = this.cache.get(userId);
    if (entry) {
      entry.ttl += additionalTime;
    }
  }
}

export const adminCacheService = new AdminCacheService();
