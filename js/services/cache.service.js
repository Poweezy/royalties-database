/**
 * Cache Service
 * Provides standardized caching mechanism using localStorage and sessionStorage
 */
import { logger } from "../utils/logger.js";

class CacheService {
    constructor() {
        this.prefix = "royalties_cache_";
        this.defaultTTL = 3600000; // 1 hour in milliseconds
    }

    /**
     * Set a value in cache
     */
    set(key, value, ttl = this.defaultTTL, storage = localStorage) {
        try {
            const item = {
                value,
                expiry: Date.now() + ttl,
            };
            storage.setItem(`${this.prefix}${key}`, JSON.stringify(item));
            return true;
        } catch (error) {
            logger.error(`Failed to set cache for key: ${key}`, error);
            return false;
        }
    }

    /**
     * Get a value from cache
     */
    get(key, storage = localStorage) {
        try {
            const itemStr = storage.getItem(`${this.prefix}${key}`);
            if (!itemStr) return null;

            const item = JSON.parse(itemStr);
            if (Date.now() > item.expiry) {
                storage.removeItem(`${this.prefix}${key}`);
                return null;
            }
            return item.value;
        } catch (error) {
            logger.error(`Failed to get cache for key: ${key}`, error);
            return null;
        }
    }

    /**
     * Remove a value from cache
     */
    remove(key, storage = localStorage) {
        storage.removeItem(`${this.prefix}${key}`);
    }

    /**
     * Clear all cached items
     */
    clear(storage = localStorage) {
        Object.keys(storage).forEach((key) => {
            if (key.startsWith(this.prefix)) {
                storage.removeItem(key);
            }
        });
    }

    /**
     * Get or set cache (convenience method)
     */
    async getOrSet(key, fetchFn, ttl = this.defaultTTL) {
        const cachedValue = this.get(key);
        if (cachedValue !== null) return cachedValue;

        const FreshValue = await fetchFn();
        this.set(key, FreshValue, ttl);
        return FreshValue;
    }
}

export const cacheService = new CacheService();
