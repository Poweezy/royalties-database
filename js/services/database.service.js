/**
 * Database Service
 * Handles local data storage and offline functionality
 */

class DatabaseService {
    constructor() {
        this.dbName = 'RoyaltiesDB';
        this.version = 1;
        this.stores = {
            royalties: 'royalties',
            users: 'users',
            leases: 'leases',
            expenses: 'expenses',
            contracts: 'contracts',
            offline: 'offline',
            settings: 'settings'
        };
    }

    /**
     * Initialize database
     */
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };

            request.onupgradeneeded = event => {
                const db = event.target.result;

                // Create stores if they don't exist
                if (!db.objectStoreNames.contains(this.stores.royalties)) {
                    db.createObjectStore(this.stores.royalties, { keyPath: 'id', autoIncrement: true });
                }

                if (!db.objectStoreNames.contains(this.stores.users)) {
                    db.createObjectStore(this.stores.users, { keyPath: 'id' });
                }

                if (!db.objectStoreNames.contains(this.stores.leases)) {
                    db.createObjectStore(this.stores.leases, { keyPath: 'id' });
                }

                if (!db.objectStoreNames.contains(this.stores.expenses)) {
                    db.createObjectStore(this.stores.expenses, { keyPath: 'id' });
                }

                if (!db.objectStoreNames.contains(this.stores.contracts)) {
                    db.createObjectStore(this.stores.contracts, { keyPath: 'id' });
                }

                if (!db.objectStoreNames.contains(this.stores.offline)) {
                    db.createObjectStore(this.stores.offline, { keyPath: 'id', autoIncrement: true });
                }

                if (!db.objectStoreNames.contains(this.stores.settings)) {
                    db.createObjectStore(this.stores.settings, { keyPath: 'key' });
                }
            };
        });
    }

    /**
     * Get all items from a store
     */
    async getAll(storeName) {
        return this.executeTransaction(storeName, 'readonly', store => store.getAll());
    }

    /**
     * Get item by id
     */
    async getById(storeName, id) {
        return this.executeTransaction(storeName, 'readonly', store => store.get(id));
    }

    /**
     * Add item to store
     */
    async add(storeName, item) {
        return this.executeTransaction(storeName, 'readwrite', store => store.add(item));
    }

    /**
     * Put item in store
     */
    async put(storeName, item) {
        return this.executeTransaction(storeName, 'readwrite', store => store.put(item));
    }

    /**
     * Delete item from store
     */
    async delete(storeName, id) {
        return this.executeTransaction(storeName, 'readwrite', store => store.delete(id));
    }

    /**
     * Clear entire store
     */
    async clear(storeName) {
        return this.executeTransaction(storeName, 'readwrite', store => store.clear());
    }

    /**
     * Execute transaction
     */
    async executeTransaction(storeName, mode, callback) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(storeName, mode);
            const store = transaction.objectStore(storeName);
            const request = callback(store);

            transaction.oncomplete = () => resolve(request.result);
            transaction.onerror = () => reject(transaction.error);
        });
    }

    /**
     * Save offline data
     */
    async saveOfflineData(data) {
        try {
            // Add to offline store
            await this.add(this.stores.offline, {
                ...data,
                timestamp: new Date().toISOString()
            });

            // Request sync when online
            if ('serviceWorker' in navigator && 'SyncManager' in window) {
                const registration = await navigator.serviceWorker.ready;
                await registration.sync.register('sync-royalties');
            }

            return true;
        } catch (error) {
            console.error('Failed to save offline data:', error);
            throw error;
        }
    }

    /**
     * Get settings
     */
    async getSettings() {
        try {
            return await this.getAll(this.stores.settings);
        } catch (error) {
            console.error('Failed to get settings:', error);
            return [];
        }
    }

    /**
     * Update setting
     */
    async updateSetting(key, value) {
        try {
            await this.put(this.stores.settings, { key, value });
            return true;
        } catch (error) {
            console.error('Failed to update setting:', error);
            throw error;
        }
    }

    /**
     * Initialize default settings
     */
    async initializeDefaultSettings() {
        const defaults = {
            theme: 'light',
            language: 'en',
            notifications: true,
            autoSync: true,
            dataRetention: 30 // days
        };

        try {
            for (const [key, value] of Object.entries(defaults)) {
                await this.updateSetting(key, value);
            }
        } catch (error) {
            console.error('Failed to initialize default settings:', error);
        }
    }
}

export const dbService = new DatabaseService();
