/**
 * Cache Utility
 *
 * Provides in-memory caching with TTL support for frequently accessed data
 * This is a simple implementation - for production, consider Redis or Vercel KV
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class Cache {
  private cache: Map<string, CacheEntry<any>>;

  private maxSize: number;

  constructor(maxSize: number = 1000) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  /**
   * Get cached data
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if expired
    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Set cached data with TTL
   */
  set<T>(key: string, data: T, ttl: number = 60000): void {
    // Implement simple LRU by removing oldest entry if cache is full
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  /**
   * Delete cached data
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Clean expired entries
   */
  cleanExpired(): void {
    const now = Date.now();
    const entries = Array.from(this.cache.entries());
    entries.forEach(([key, entry]) => {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    });
  }
}

// Singleton instance
const cache = new Cache(1000);

// Clean expired entries every 5 minutes
if (typeof window === 'undefined') {
  setInterval(() => {
    cache.cleanExpired();
  }, 5 * 60 * 1000);
}

/**
 * Cache TTL constants (in milliseconds)
 */
export const CacheTTL = {
  SHORT: 60 * 1000, // 1 minute
  MEDIUM: 5 * 60 * 1000, // 5 minutes
  LONG: 30 * 60 * 1000, // 30 minutes
  HOUR: 60 * 60 * 1000, // 1 hour
  DAY: 24 * 60 * 60 * 1000, // 1 day
} as const;

/**
 * Cached function wrapper
 *
 * @param key Cache key
 * @param fn Function to execute if cache miss
 * @param ttl Time to live in milliseconds
 * @returns Cached or fresh data
 */
export async function cached<T>(
  key: string,
  fn: () => Promise<T>,
  ttl: number = CacheTTL.MEDIUM,
): Promise<T> {
  // Try to get from cache
  const cachedData = cache.get<T>(key);
  if (cachedData !== null) {
    return cachedData;
  }

  // Execute function and cache result
  const data = await fn();
  cache.set(key, data, ttl);
  return data;
}

/**
 * Invalidate cache by key or pattern
 */
export function invalidateCache(keyOrPattern: string): void {
  if (keyOrPattern.includes('*')) {
    // Pattern matching - delete all keys that match
    const pattern = keyOrPattern.replace(/\*/g, '.*');
    const regex = new RegExp(`^${pattern}$`);

    const keys = Array.from(cache['cache'].keys());
    keys.forEach((key) => {
      if (regex.test(key)) {
        cache.delete(key);
      }
    });
  } else {
    // Exact key match
    cache.delete(keyOrPattern);
  }
}

/**
 * Clear all cache
 */
export function clearCache(): void {
  cache.clear();
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  return {
    size: cache.size(),
    maxSize: 1000,
  };
}

export default cache;
