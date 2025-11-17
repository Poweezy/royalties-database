/**
 * Database Service
 * Handles local data storage and offline functionality
 */

import { logger } from '../utils/logger.js';

class DatabaseService {
  constructor() {
    this.dbName = "RoyaltiesDB";
    this.version = 11; // Updated to be higher than existing version
    this.stores = {
      royalties: "royalties",
      users: "users",
      leases: "leases",
      expenses: "expenses",
      contracts: "contracts",
      "contract-templates": "contract-templates",
      documents: "documents",
      offline: "offline",
      settings: "settings",
      passwordPolicies: "passwordPolicies",
      loginAttempts: "loginAttempts",
      userSessions: "userSessions", 
      passwordHistory: "passwordHistory",
      securityNotifications: "securityNotifications",
      auditLog: "auditLog",
      roles: "roles"
    };
  }

  /**
   * Initialize database
   */
  async init() {
    return new Promise((resolve, reject) => {
      let upgradeRejected = false;
      
      // Try to detect existing database version first
      const checkRequest = indexedDB.open(this.dbName);
      
      checkRequest.onsuccess = (event) => {
        const db = event.target.result;
        const existingVersion = db.version;
        db.close();
        
        // Use the higher of existing version + 1 or our target version
        if (existingVersion >= this.version) {
          this.version = existingVersion + 1;
          logger.info(`Database version updated to ${this.version} (existing was ${existingVersion})`);
        }
        
        // Now open with the correct version
        this._openDatabase(resolve, reject, upgradeRejected);
      };
      
      checkRequest.onerror = () => {
        // If database doesn't exist, use our default version
        logger.info(`New database, using version ${this.version}`);
        this._openDatabase(resolve, reject, upgradeRejected);
      };
    });
  }
  
  /**
   * Open database with proper version handling
   */
  _openDatabase(resolve, reject, upgradeRejected) {
    const request = indexedDB.open(this.dbName, this.version);

    let timeoutId = null;
    
    request.onerror = (event) => {
      if (timeoutId) clearTimeout(timeoutId);
      const error = event.target.error;
      logger.error(`Database error: ${error?.code || 'unknown'}`, error);
      
      // Handle version error specifically - try opening with existing version
      if (error?.name === 'VersionError' || error?.message?.includes('version')) {
        logger.warn('Version error detected. Opening with existing database version...');
        const fallbackRequest = indexedDB.open(this.dbName);
        fallbackRequest.onsuccess = (e) => {
          this.db = e.target.result;
          logger.info(`Opened database with existing version: ${this.db.version}`);
          resolve(this.db);
        };
        fallbackRequest.onerror = (e) => {
          reject(e.target.error);
        };
        return;
      }
      
      reject(error);
    };

      request.onsuccess = (event) => {
        if (timeoutId) clearTimeout(timeoutId);
        this.db = event.target.result;
        logger.debug('Database opened successfully');
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        const transaction = event.target.transaction;

        const createStore = (storeName, options) => {
          if (!db.objectStoreNames.contains(storeName)) {
            return db.createObjectStore(storeName, options);
          }
          return null;
        };

        try {
          const royaltyStore = createStore(this.stores.royalties, { keyPath: "id", autoIncrement: true });
          if (royaltyStore) {
            const royaltyData = [
              { entity: "Kwalini Quarry", mineral: "Quarried Stone", volume: 1200, tariff: 15.5, royaltyPayment: 18600, paymentDate: "2025-07-15", status: "Paid" },
              { entity: "Maloma Colliery", mineral: "Coal", volume: 5000, tariff: 25.0, royaltyPayment: 125000, paymentDate: "2025-07-10", status: "Paid" },
              { entity: "Mbabane Quarry", mineral: "Gravel", volume: 800, tariff: 18.5, royaltyPayment: 14800, paymentDate: "2025-06-20", status: "Overdue" },
              { entity: "Ngwenya Mine", mineral: "Iron Ore", volume: 2500, tariff: 30.0, royaltyPayment: 75000, paymentDate: "2025-07-05", status: "Paid" },
              { entity: "Sidvokodvo Quarry", mineral: "Gravel", volume: 1500, tariff: 18.5, royaltyPayment: 27750, paymentDate: "2025-05-15", status: "Overdue" },
            ];
            royaltyData.forEach(record => royaltyStore.add(record));
          }

          createStore(this.stores.users, { keyPath: "id" });
          createStore(this.stores.leases, { keyPath: "id" });
          createStore(this.stores.expenses, { keyPath: "id" });
          createStore(this.stores.contracts, { keyPath: "id" });
          createStore(this.stores["contract-templates"], { keyPath: "id" });
          createStore(this.stores.documents, { keyPath: "id" });
          createStore(this.stores.offline, { keyPath: "id", autoIncrement: true });
          createStore(this.stores.settings, { keyPath: "key" });
          createStore(this.stores.passwordPolicies, { keyPath: "id", autoIncrement: true });
          
          // Create missing stores
          createStore(this.stores.loginAttempts, { keyPath: "id", autoIncrement: true });
          createStore(this.stores.userSessions, { keyPath: "id" });
          createStore(this.stores.passwordHistory, { keyPath: "id", autoIncrement: true });
          createStore(this.stores.securityNotifications, { keyPath: "id", autoIncrement: true });
          createStore(this.stores.auditLog, { keyPath: "id", autoIncrement: true });
          createStore(this.stores.roles, { keyPath: "id" });
        } catch (error) {
          logger.error("Database upgrade error", error);
          upgradeRejected = true;
          transaction.abort();
          reject(error);
        }
        
        transaction.onerror = (event) => {
          logger.error("Transaction error during upgrade", event.target.error);
          if (timeoutId) clearTimeout(timeoutId);
          if (!upgradeRejected) {
            upgradeRejected = true;
            reject(event.target.error);
          }
        };
        
        transaction.oncomplete = () => {
          logger.debug('Database upgrade completed');
        };
      };
      
      // Add a timeout to prevent infinite hanging
      timeoutId = setTimeout(() => {
        if (!this.db) {
          logger.error('Database initialization timeout');
          // Clear handlers to prevent double rejection
          request.onerror = null;
          request.onsuccess = null;
          request.onupgradeneeded = null;
          reject(new Error('Database initialization timed out after 10 seconds'));
        }
      }, 10000); // 10 second timeout
  }

  /**
   * Get all items from a store
   */
  async getAll(storeName) {
    return this.executeTransaction(storeName, "readonly", (store) =>
      store.getAll(),
    );
  }

  /**
   * Get item by id
   */
  async getById(storeName, id) {
    return this.executeTransaction(storeName, "readonly", (store) =>
      store.get(id),
    );
  }

  /**
   * Add item to store
   */
  async add(storeName, item) {
    return this.executeTransaction(storeName, "readwrite", (store) =>
      store.add(item),
    );
  }

  /**
   * Put item in store
   */
  async put(storeName, item) {
    return this.executeTransaction(storeName, "readwrite", (store) =>
      store.put(item),
    );
  }

  /**
   * Delete item from store
   */
  async delete(storeName, id) {
    return this.executeTransaction(storeName, "readwrite", (store) =>
      store.delete(id),
    );
  }

  /**
   * Clear entire store
   */
  async clear(storeName) {
    return this.executeTransaction(storeName, "readwrite", (store) =>
      store.clear(),
    );
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
        timestamp: new Date().toISOString(),
      });

      // Request sync when online
      if ("serviceWorker" in navigator && "SyncManager" in window) {
        const registration = await navigator.serviceWorker.ready;
        await registration.sync.register("sync-royalties");
      }

      return true;
    } catch (error) {
      logger.error("Failed to save offline data", error);
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
      logger.error("Failed to get settings", error);
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
      logger.error("Failed to update setting", error);
      throw error;
    }
  }

  /**
   * Initialize default settings
   */
  async initializeDefaultSettings() {
    const defaults = {
      theme: "light",
      language: "en",
      notifications: true,
      autoSync: true,
      dataRetention: 30, // days
    };

    try {
      for (const [key, value] of Object.entries(defaults)) {
        await this.updateSetting(key, value);
      }
    } catch (error) {
      logger.error("Failed to initialize default settings", error);
    }
  }
}

export const dbService = new DatabaseService();
