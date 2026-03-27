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
     * Set an encrypted value in cache
     */
    async setEncrypted(key, value, ttl = this.defaultTTL) {
        try {
            const data = JSON.stringify({ value, expiry: Date.now() + ttl });
            const encryptedData = await this.encrypt(data);
            localStorage.setItem(`${this.prefix}${key}_enc`, encryptedData);
            return true;
        } catch (error) {
            logger.error(`Failed to set encrypted cache for key: ${key}`, error);
            return false;
        }
    }

    /**
     * Get an encrypted value from cache
     */
    async getEncrypted(key) {
        try {
            const encryptedData = localStorage.getItem(`${this.prefix}${key}_enc`);
            if (!encryptedData) return null;

            const decryptedData = await this.decrypt(encryptedData);
            const item = JSON.parse(decryptedData);

            if (Date.now() > item.expiry) {
                localStorage.removeItem(`${this.prefix}${key}_enc`);
                return null;
            }
            return item.value;
        } catch (error) {
            logger.error(`Failed to get encrypted cache for key: ${key}`, error);
            return null;
        }
    }

    // Helper for encryption (AES-GCM)
    async encrypt(text) {
        const key = await this.getEncryptionKey();
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const encoded = new TextEncoder().encode(text);
        
        const ciphertext = await crypto.subtle.encrypt(
            { name: "AES-GCM", iv },
            key,
            encoded
        );

        // Combine IV and Ciphertext for storage
        const combined = new Uint8Array(iv.length + ciphertext.byteLength);
        combined.set(iv);
        combined.set(new Uint8Array(ciphertext), iv.length);
        
        return btoa(String.fromCharCode(...combined));
    }

    // Helper for decryption
    async decrypt(encodedCombined) {
        const key = await this.getEncryptionKey();
        const combined = new Uint8Array(atob(encodedCombined).split("").map(c => c.charCodeAt(0)));
        
        const iv = combined.slice(0, 12);
        const ciphertext = combined.slice(12);

        const decrypted = await crypto.subtle.decrypt(
            { name: "AES-GCM", iv },
            key,
            ciphertext
        );

        return new TextDecoder().decode(decrypted);
    }

    async getEncryptionKey() {
        if (this.cachedKey) return this.cachedKey;
        
        // In a real app, this would be derived from user session or a hardware key.
        // For this demo, we'll use a stable seed.
        const seed = "royalties-secure-cache-salt";
        const encoder = new TextEncoder();
        const keyMaterial = await crypto.subtle.importKey(
            "raw", 
            encoder.encode(seed), 
            { name: "PBKDF2" }, 
            false, 
            ["deriveKey"]
        );

        this.cachedKey = await crypto.subtle.deriveKey(
            {
                name: "PBKDF2",
                salt: encoder.encode("static-salt"),
                iterations: 100000,
                hash: "SHA-256"
            },
            keyMaterial,
            { name: "AES-GCM", length: 256 },
            true,
            ["encrypt", "decrypt"]
        );
        
        return this.cachedKey;
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
