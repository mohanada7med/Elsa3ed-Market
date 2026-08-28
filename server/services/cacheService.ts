/**
 * High-Performance In-Memory Cache Service
 * Provides TTL caching and tag-based invalidation for public catalog data.
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
  tags: string[];
}

class CacheService {
  private cache = new Map<string, CacheEntry<any>>();

  constructor() {
    // Periodic garbage collection of expired keys (unreferenced so it doesn't block process exit)
    const timer = setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.cache.entries()) {
        if (now > entry.expiresAt) {
          this.cache.delete(key);
        }
      }
    }, 60 * 1000);
    if (timer && typeof timer.unref === 'function') {
      timer.unref();
    }
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.value as T;
  }

  set<T>(key: string, value: T, ttlSeconds = 300, tags: string[] = []): void {
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
      tags
    });
  }

  invalidateTag(tag: string): void {
    let deletedCount = 0;
    for (const [key, entry] of this.cache.entries()) {
      if (entry.tags.includes(tag)) {
        this.cache.delete(key);
        deletedCount++;
      }
    }
    if (deletedCount > 0) {
      console.log(`[Cache] Invalidated ${deletedCount} cache entries for tag: "${tag}"`);
    }
  }

  invalidateKey(key: string): void {
    this.cache.delete(key);
  }

  flush(): void {
    this.cache.clear();
    console.log('[Cache] Cache fully flushed');
  }

  // Convenience helpers
  invalidateProducts(productId?: string): void {
    this.invalidateTag('products');
    if (productId) {
      this.invalidateKey(`product:${productId}`);
    }
  }

  invalidateCategories(): void {
    this.invalidateTag('categories');
  }

  invalidateCraftStories(storyId?: string): void {
    this.invalidateTag('craft_stories');
    if (storyId) {
      this.invalidateKey(`craft_story:${storyId}`);
    }
  }

  invalidateSellers(sellerId?: string): void {
    this.invalidateTag('sellers');
    if (sellerId) {
      this.invalidateKey(`seller:${sellerId}`);
    }
  }

  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

export const cacheService = new CacheService();
