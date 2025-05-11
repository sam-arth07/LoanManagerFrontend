// API Cache utility for offline-first functionality
// This provides basic caching for API responses to improve user experience during connectivity issues

/**
 * Simple cache structure for API responses
 */
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiry: number; // timestamp when this entry expires
}

/**
 * API Cache service for offline/fallback support
 */
export class ApiCache {
  private static instance: ApiCache;
  private cache: Map<string, CacheEntry<any>> = new Map();
  private readonly DEFAULT_CACHE_TIME = 5 * 60 * 1000; // 5 minutes
  private readonly MAX_CACHE_ENTRIES = 100;
  private isOnline: boolean = typeof navigator !== 'undefined' ? navigator.onLine : true;

  private constructor() {
    // Initialize cache from localStorage if available
    this.loadCacheFromStorage();
    
    // Set up event listener for online/offline status
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleOnlineStatusChange(true));
      window.addEventListener('offline', () => this.handleOnlineStatusChange(false));
    }
  }
  
  /**
   * Get singleton instance
   */
  public static getInstance(): ApiCache {
    if (!ApiCache.instance) {
      ApiCache.instance = new ApiCache();
    }
    return ApiCache.instance;
  }
  
  /**
   * Set an item in the cache
   */
  public set<T>(key: string, data: T, ttlMs: number = this.DEFAULT_CACHE_TIME): void {
    // Clean expired entries first
    this.cleanExpiredEntries();
    
    // If we would exceed max size, remove oldest entry
    if (!this.cache.has(key) && this.cache.size >= this.MAX_CACHE_ENTRIES) {
      const oldestKey = this.getOldestCacheKey();
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }
    
    // Add new entry
    const now = Date.now();
    this.cache.set(key, {
      data,
      timestamp: now,
      expiry: now + ttlMs
    });
    
    // Update localStorage
    this.saveCacheToStorage();
  }
  
  /**
   * Get an item from the cache
   * @returns The cached data or null if not found or expired
   */
  public get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    // Check if entry exists and is not expired
    if (entry && entry.expiry > Date.now()) {
      return entry.data as T;
    }
    
    // Remove expired entry
    if (entry) {
      this.cache.delete(key);
      this.saveCacheToStorage();
    }
    
    return null;
  }
  
  /**
   * Check if a key exists in the cache and is not expired
   */
  public has(key: string): boolean {
    const entry = this.cache.get(key);
    return !!entry && entry.expiry > Date.now();
  }
  
  /**
   * Delete a specific key from the cache
   */
  public delete(key: string): void {
    this.cache.delete(key);
    this.saveCacheToStorage();
  }
  
  /**
   * Clear the entire cache
   */
  public clear(): void {
    this.cache.clear();
    this.saveCacheToStorage();
  }
  
  /**
   * Generate a cache key from a request
   */
  public static generateCacheKey(url: string, params?: Record<string, any>): string {
    if (!params) {
      return url;
    }
    
    // Sort params to ensure consistent keys regardless of object property order
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((acc, key) => {
        if (params[key] !== undefined && params[key] !== null) {
          acc[key] = params[key];
        }
        return acc;
      }, {} as Record<string, any>);
    
    return `${url}:${JSON.stringify(sortedParams)}`;
  }
  
  /**
   * Handle online/offline status changes
   */
  private handleOnlineStatusChange(isOnline: boolean): void {
    if (isOnline) {
      // When coming back online, we could refresh critical data
      // This is left as a placeholder for implementation
      // Potentially trigger a refresh of critical data or notify the user
      // Example: this.eventEmitter.emit('online');
    } else {
      this.handleOffline();
    }
  }

  /**
   * Handle offline status
   */
  private handleOffline(): void {
    if (this.isOnline) {
      this.isOnline = false;
      // console.log('Connection lost - working in offline mode');
      // Potentially notify the user or queue critical updates
      // Example: this.eventEmitter.emit('offline');
    }
  }
  
  /**
   * Save the current cache to localStorage
   */
  private saveCacheToStorage(): void {
    if (typeof window === 'undefined') return;
    
    try {
      // Convert Map to array of entries for serialization
      const serializable = Array.from(this.cache.entries());
      localStorage.setItem('apiCache', JSON.stringify(serializable));
    } catch (e) {
      console.warn('Failed to save cache to localStorage:', e);
    }
  }
  
  /**
   * Load the cache from localStorage
   */
  private loadCacheFromStorage(): void {
    if (typeof window === 'undefined') return;
    
    try {
      const cached = localStorage.getItem('apiCache');
      if (cached) {
        // Convert serialized array back to Map
        const entries = JSON.parse(cached) as [string, CacheEntry<any>][];
        this.cache = new Map(entries);
        
        // Clean expired entries
        this.cleanExpiredEntries();
      }
    } catch (e) {
      console.warn('Failed to load cache from localStorage:', e);
    }
  }
  
  /**
   * Clean all expired entries from the cache
   */
  private cleanExpiredEntries(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiry < now) {
        this.cache.delete(key);
      }
    }
  }
  
  /**
   * Get the oldest cache key to remove when cache is full
   */
  private getOldestCacheKey(): string | null {
    let oldestKey: string | null = null;
    let oldestTime = Date.now();
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestKey = key;
        oldestTime = entry.timestamp;
      }
    }
    
    return oldestKey;
  }
}

// Create a default instance for easy import
const apiCache = ApiCache.getInstance();
export default apiCache;
