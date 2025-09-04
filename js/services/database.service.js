/**
 * Database Service
 * Handles local data storage and offline functionality
 */

class DatabaseService {
  constructor() {
    this.dbName = "RoyaltiesDB";
    this.version = 6; // Incremented version to trigger upgrade
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
    };
  }

  /**
   * Initialize database
   */
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = (event) => {
        console.error(`Database error: ${event.target.errorCode}`);
        reject(event.target.error);
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        const createStore = (storeName, options) => {
          if (!db.objectStoreNames.contains(storeName)) {
            return db.createObjectStore(storeName, options);
          }
          return null;
        };

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
      };
    });
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
      console.error("Failed to save offline data:", error);
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
      console.error("Failed to get settings:", error);
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
      console.error("Failed to update setting:", error);
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
      console.error("Failed to initialize default settings:", error);
    }
  }

  async getMiningConcessions() {
    // Placeholder for fetching mining concessions
    return [];
  }
}

export const dbService = new DatabaseService();
