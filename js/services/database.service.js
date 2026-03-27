/**
 * Database Service
 * Handles local data storage and offline functionality
 */

import { logger } from '../utils/logger.js';

class DatabaseService {
  constructor() {
    this.dbName = "RoyaltiesDB";
    this.version = 12; // Version bump for migration test
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

    // Define migrations
    this.migrations = {
      1: (db) => {
        db.createObjectStore(this.stores.royalties, { keyPath: "id", autoIncrement: true });
        db.createObjectStore(this.stores.users, { keyPath: "id" });
      },
      2: (db) => {
        db.createObjectStore(this.stores.leases, { keyPath: "id" });
        db.createObjectStore(this.stores.expenses, { keyPath: "id" });
      },
      3: (db) => {
        db.createObjectStore(this.stores.contracts, { keyPath: "id" });
        db.createObjectStore(this.stores["contract-templates"], { keyPath: "id" });
      },
      4: (db) => {
        db.createObjectStore(this.stores.documents, { keyPath: "id" });
      },
      5: (db) => {
        db.createObjectStore(this.stores.offline, { keyPath: "id", autoIncrement: true });
      },
      6: (db) => {
        db.createObjectStore(this.stores.settings, { keyPath: "key" });
      },
      7: (db) => {
        db.createObjectStore(this.stores.passwordPolicies, { keyPath: "id", autoIncrement: true });
      },
      8: (db) => {
        db.createObjectStore(this.stores.loginAttempts, { keyPath: "id", autoIncrement: true });
        db.createObjectStore(this.stores.userSessions, { keyPath: "id" });
      },
      9: (db) => {
        db.createObjectStore(this.stores.passwordHistory, { keyPath: "id", autoIncrement: true });
      },
      10: (db) => {
        db.createObjectStore(this.stores.securityNotifications, { keyPath: "id", autoIncrement: true });
      },
      11: (db) => {
        db.createObjectStore(this.stores.auditLog, { keyPath: "id", autoIncrement: true });
        db.createObjectStore(this.stores.roles, { keyPath: "id" });
      },
      12: (db, transaction) => {
        // Example of data migration or index creation in v12
        if (db.objectStoreNames.contains(this.stores.auditLog)) {
          const store = transaction.objectStore(this.stores.auditLog);
          store.createIndex("by_timestamp", "timestamp");
        }
      }
    };
  }

  runMigrations(db, transaction, oldVersion, newVersion) {
    for (let v = oldVersion + 1; v <= newVersion; v++) {
      if (this.migrations[v]) {
        logger.info(`Running migration for version ${v}`);
        this.migrations[v](db, transaction);
      }
    }
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
        const oldVersion = event.oldVersion;
        const newVersion = event.newVersion;

        logger.info(`Upgrading database from version ${oldVersion} to ${newVersion}`);

        try {
          this.runMigrations(db, transaction, oldVersion, newVersion);
        } catch (error) {
          logger.error("Database upgrade error", error);
          upgradeRejected = true;
          transaction.abort();
          reject(error);
        }
// ... rest of event handlers ...
        
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
