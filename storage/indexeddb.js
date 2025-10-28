/**
 * IndexedDB module for storing AI processing results
 * Stores message classifications, thread summaries, and generated issue drafts
 */

const DB_NAME = 'GhostHubDB';
const DB_VERSION = 1;
const STORES = {
  CLASSIFICATIONS: 'classifications',
  SUMMARIES: 'summaries',
  ISSUES: 'issues'
};

class IndexedDBManager {
  constructor() {
    this.db = null;
  }

  /**
   * Initialize the IndexedDB database
   * @returns {Promise<IDBDatabase>}
   */
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('IndexedDB initialization failed:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('IndexedDB initialized successfully');
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Create classifications store
        if (!db.objectStoreNames.contains(STORES.CLASSIFICATIONS)) {
          const classificationsStore = db.createObjectStore(STORES.CLASSIFICATIONS, {
            keyPath: 'id',
            autoIncrement: true
          });
          classificationsStore.createIndex('timestamp', 'timestamp', { unique: false });
          classificationsStore.createIndex('platform', 'platform', { unique: false });
          classificationsStore.createIndex('classification', 'classification', { unique: false });
        }

        // Create summaries store
        if (!db.objectStoreNames.contains(STORES.SUMMARIES)) {
          const summariesStore = db.createObjectStore(STORES.SUMMARIES, {
            keyPath: 'id',
            autoIncrement: true
          });
          summariesStore.createIndex('timestamp', 'timestamp', { unique: false });
          summariesStore.createIndex('threadId', 'threadId', { unique: false });
        }

        // Create issues store
        if (!db.objectStoreNames.contains(STORES.ISSUES)) {
          const issuesStore = db.createObjectStore(STORES.ISSUES, {
            keyPath: 'id',
            autoIncrement: true
          });
          issuesStore.createIndex('timestamp', 'timestamp', { unique: false });
          issuesStore.createIndex('status', 'status', { unique: false });
        }
      };
    });
  }

  /**
   * Store a message classification result
   * @param {Object} classification - Classification data
   * @returns {Promise<number>} - The ID of the stored record
   */
  async storeClassification(classification) {
    await this.ensureInitialized();
    return this._addRecord(STORES.CLASSIFICATIONS, {
      ...classification,
      timestamp: Date.now()
    });
  }

  /**
   * Store a thread summary result
   * @param {Object} summary - Summary data
   * @returns {Promise<number>} - The ID of the stored record
   */
  async storeSummary(summary) {
    await this.ensureInitialized();
    return this._addRecord(STORES.SUMMARIES, {
      ...summary,
      timestamp: Date.now()
    });
  }

  /**
   * Store a generated issue draft
   * @param {Object} issue - Issue data
   * @returns {Promise<number>} - The ID of the stored record
   */
  async storeIssue(issue) {
    await this.ensureInitialized();
    return this._addRecord(STORES.ISSUES, {
      ...issue,
      timestamp: Date.now(),
      status: issue.status || 'draft'
    });
  }

  /**
   * Get all classifications
   * @param {Object} filters - Optional filters (platform, classification, etc.)
   * @returns {Promise<Array>}
   */
  async getClassifications(filters = {}) {
    await this.ensureInitialized();
    const records = await this._getAllRecords(STORES.CLASSIFICATIONS);
    
    if (Object.keys(filters).length === 0) {
      return records;
    }

    return records.filter(record => {
      return Object.entries(filters).every(([key, value]) => record[key] === value);
    });
  }

  /**
   * Get all summaries
   * @param {Object} filters - Optional filters
   * @returns {Promise<Array>}
   */
  async getSummaries(filters = {}) {
    await this.ensureInitialized();
    const records = await this._getAllRecords(STORES.SUMMARIES);
    
    if (Object.keys(filters).length === 0) {
      return records;
    }

    return records.filter(record => {
      return Object.entries(filters).every(([key, value]) => record[key] === value);
    });
  }

  /**
   * Get all issues
   * @param {Object} filters - Optional filters
   * @returns {Promise<Array>}
   */
  async getIssues(filters = {}) {
    await this.ensureInitialized();
    const records = await this._getAllRecords(STORES.ISSUES);
    
    if (Object.keys(filters).length === 0) {
      return records;
    }

    return records.filter(record => {
      return Object.entries(filters).every(([key, value]) => record[key] === value);
    });
  }

  /**
   * Update an issue status
   * @param {number} id - Issue ID
   * @param {string} status - New status
   * @returns {Promise<void>}
   */
  async updateIssueStatus(id, status) {
    await this.ensureInitialized();
    const issue = await this._getRecord(STORES.ISSUES, id);
    if (issue) {
      issue.status = status;
      await this._updateRecord(STORES.ISSUES, issue);
    }
  }

  /**
   * Delete a record by ID
   * @param {string} storeName - Store name
   * @param {number} id - Record ID
   * @returns {Promise<void>}
   */
  async deleteRecord(storeName, id) {
    await this.ensureInitialized();
    return this._deleteRecord(storeName, id);
  }

  /**
   * Clear all data from a store
   * @param {string} storeName - Store name
   * @returns {Promise<void>}
   */
  async clearStore(storeName) {
    await this.ensureInitialized();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Private helper methods

  async ensureInitialized() {
    if (!this.db) {
      await this.init();
    }
  }

  _addRecord(storeName, data) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.add(data);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  _getRecord(storeName, id) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  _getAllRecords(storeName) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  _updateRecord(storeName, data) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  _deleteRecord(storeName, id) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

// Export singleton instance
const dbManager = new IndexedDBManager();
export default dbManager;
