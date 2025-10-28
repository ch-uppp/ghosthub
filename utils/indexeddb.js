/**
 * IndexedDB Utility Functions for GhostHub
 * 
 * Provides CRUD operations for captured messages/issues with local persistence
 * between browser sessions.
 */

const DB_NAME = 'GhostHubDB';
const DB_VERSION = 1;
const STORE_NAME = 'messages';

/**
 * Opens a connection to the IndexedDB database
 * @returns {Promise<IDBDatabase>} Database instance
 */
function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error(`Failed to open database: ${request.error}`));
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Create object store if it doesn't exist
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const objectStore = db.createObjectStore(STORE_NAME, {
          keyPath: 'id',
          autoIncrement: true
        });

        // Create indexes for efficient querying
        objectStore.createIndex('timestamp', 'timestamp', { unique: false });
        objectStore.createIndex('platform', 'platform', { unique: false });
        objectStore.createIndex('type', 'type', { unique: false });
        objectStore.createIndex('status', 'status', { unique: false });
      }
    };
  });
}

/**
 * Stores a new message/issue in the database
 * @param {Object} data - The message/issue data to store
 * @param {string} data.platform - Platform where message was captured (slack, discord, whatsapp)
 * @param {string} data.type - Type of issue (bug, feature, pr_mention)
 * @param {string} data.content - The message content
 * @param {string} data.status - Status of the issue (pending, approved, sent, ignored)
 * @param {number} [data.timestamp] - Timestamp of the message (defaults to now)
 * @param {Object} [data.metadata] - Additional metadata
 * @returns {Promise<number>} The ID of the stored item
 */
async function store(data) {
  if (!data || typeof data !== 'object') {
    throw new Error('Data must be a valid object');
  }

  if (!data.platform || !data.type || !data.content) {
    throw new Error('Missing required fields: platform, type, and content are required');
  }

  const db = await openDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    // Add timestamp if not provided
    const itemToStore = {
      ...data,
      timestamp: data.timestamp || Date.now(),
      status: data.status || 'pending'
    };

    const request = store.add(itemToStore);

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(new Error(`Failed to store data: ${request.error}`));
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
}

/**
 * Retrieves a message/issue by ID
 * @param {number} id - The ID of the item to retrieve
 * @returns {Promise<Object|null>} The retrieved item or null if not found
 */
async function retrieve(id) {
  if (!id || typeof id !== 'number') {
    throw new Error('ID must be a valid number');
  }

  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(id);

    request.onsuccess = () => {
      resolve(request.result || null);
    };

    request.onerror = () => {
      reject(new Error(`Failed to retrieve data: ${request.error}`));
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
}

/**
 * Retrieves all messages/issues with optional filtering
 * @param {Object} [filter] - Optional filter criteria
 * @param {string} [filter.platform] - Filter by platform
 * @param {string} [filter.type] - Filter by type
 * @param {string} [filter.status] - Filter by status
 * @returns {Promise<Array>} Array of matching items
 */
async function retrieveAll(filter = {}) {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      let results = request.result || [];

      // Apply filters if provided
      if (filter.platform) {
        results = results.filter(item => item.platform === filter.platform);
      }
      if (filter.type) {
        results = results.filter(item => item.type === filter.type);
      }
      if (filter.status) {
        results = results.filter(item => item.status === filter.status);
      }

      resolve(results);
    };

    request.onerror = () => {
      reject(new Error(`Failed to retrieve all data: ${request.error}`));
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
}

/**
 * Updates an existing message/issue
 * @param {number} id - The ID of the item to update
 * @param {Object} updates - The fields to update
 * @returns {Promise<number>} The ID of the updated item
 */
async function update(id, updates) {
  if (!id || typeof id !== 'number') {
    throw new Error('ID must be a valid number');
  }

  if (!updates || typeof updates !== 'object') {
    throw new Error('Updates must be a valid object');
  }

  const db = await openDatabase();

  return new Promise(async (resolve, reject) => {
    try {
      // First retrieve the existing item
      const transaction1 = db.transaction([STORE_NAME], 'readonly');
      const store1 = transaction1.objectStore(STORE_NAME);
      const getRequest = store1.get(id);

      getRequest.onsuccess = () => {
        const existingItem = getRequest.result;

        if (!existingItem) {
          db.close();
          reject(new Error(`Item with ID ${id} not found`));
          return;
        }

        // Merge updates with existing data
        const updatedItem = {
          ...existingItem,
          ...updates,
          id // Ensure ID is not overwritten
        };

        // Update the item
        const transaction2 = db.transaction([STORE_NAME], 'readwrite');
        const store2 = transaction2.objectStore(STORE_NAME);
        const putRequest = store2.put(updatedItem);

        putRequest.onsuccess = () => {
          resolve(putRequest.result);
        };

        putRequest.onerror = () => {
          reject(new Error(`Failed to update data: ${putRequest.error}`));
        };

        transaction2.oncomplete = () => {
          db.close();
        };
      };

      getRequest.onerror = () => {
        db.close();
        reject(new Error(`Failed to retrieve item for update: ${getRequest.error}`));
      };
    } catch (error) {
      db.close();
      reject(error);
    }
  });
}

/**
 * Deletes a message/issue by ID
 * @param {number} id - The ID of the item to delete
 * @returns {Promise<void>}
 */
async function deleteItem(id) {
  if (!id || typeof id !== 'number') {
    throw new Error('ID must be a valid number');
  }

  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(new Error(`Failed to delete data: ${request.error}`));
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
}

/**
 * Deletes all messages/issues from the database
 * @returns {Promise<void>}
 */
async function deleteAll() {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.clear();

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(new Error(`Failed to clear database: ${request.error}`));
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
}

/**
 * Counts the total number of messages/issues
 * @param {Object} [filter] - Optional filter criteria
 * @returns {Promise<number>} The count of items
 */
async function count(filter = {}) {
  const items = await retrieveAll(filter);
  return items.length;
}

// Export functions for use in the extension
if (typeof module !== 'undefined' && module.exports) {
  // Node.js environment (for testing)
  module.exports = {
    openDatabase,
    store,
    retrieve,
    retrieveAll,
    update,
    deleteItem,
    deleteAll,
    count
  };
}
