// IndexedDB configuration
const DB_NAME = 'GhostHubDB';
const DB_VERSION = 1;
const STORE_NAME = 'messages';

/**
 * Open IndexedDB connection
 * @returns {Promise<IDBDatabase>}
 */
function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
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
      }
    };
  });
}

/**
 * Fetch all messages from IndexedDB
 * @returns {Promise<Array>}
 */
async function fetchMessages() {
  try {
    const db = await openDatabase();
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const objectStore = transaction.objectStore(STORE_NAME);
    
    return new Promise((resolve, reject) => {
      const request = objectStore.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
}

/**
 * Clear all messages from IndexedDB
 * @returns {Promise<void>}
 */
async function clearAllMessages() {
  try {
    const db = await openDatabase();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const objectStore = transaction.objectStore(STORE_NAME);
    
    return new Promise((resolve, reject) => {
      const request = objectStore.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error clearing messages:', error);
    throw error;
  }
}

/**
 * Format timestamp for display
 * @param {number} timestamp
 * @returns {string}
 */
function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString();
}

/**
 * Get platform icon/emoji
 * @param {string} platform
 * @returns {string}
 */
function getPlatformIcon(platform) {
  const icons = {
    'slack': '💬',
    'discord': '🎮',
    'whatsapp': '📱',
    'default': '💭'
  };
  return icons[platform?.toLowerCase()] || icons.default;
}

/**
 * Create message element
 * @param {Object} message
 * @returns {HTMLElement}
 */
function createMessageElement(message) {
  const messageDiv = document.createElement('div');
  messageDiv.className = 'message-item';
  messageDiv.dataset.id = message.id;
  
  const platform = message.platform || 'unknown';
  const timestamp = message.timestamp || Date.now();
  const content = message.content || message.text || 'No content';
  const author = message.author || 'Unknown';
  const type = message.type || 'message';
  
  messageDiv.innerHTML = `
    <div class="message-header">
      <span class="platform-icon" title="${platform}">${getPlatformIcon(platform)}</span>
      <span class="message-author">${author}</span>
      <span class="message-time">${formatTimestamp(timestamp)}</span>
    </div>
    <div class="message-content">${content}</div>
    ${type !== 'message' ? `<div class="message-type">${type}</div>` : ''}
  `;
  
  return messageDiv;
}

/**
 * Render messages in the list
 * @param {Array} messages
 */
function renderMessages(messages) {
  const messageList = document.getElementById('message-list');
  const emptyState = document.getElementById('empty-state');
  
  // Clear loading state
  messageList.innerHTML = '';
  
  if (!messages || messages.length === 0) {
    messageList.style.display = 'none';
    emptyState.style.display = 'block';
    return;
  }
  
  messageList.style.display = 'block';
  emptyState.style.display = 'none';
  
  // Sort messages by timestamp (newest first)
  const sortedMessages = [...messages].sort((a, b) => 
    (b.timestamp || 0) - (a.timestamp || 0)
  );
  
  // Render each message
  sortedMessages.forEach(message => {
    const messageElement = createMessageElement(message);
    messageList.appendChild(messageElement);
  });
}

/**
 * Load and display messages
 */
async function loadMessages() {
  try {
    const messages = await fetchMessages();
    renderMessages(messages);
  } catch (error) {
    console.error('Error loading messages:', error);
    const messageList = document.getElementById('message-list');
    messageList.innerHTML = '<div class="error">Failed to load messages. Please try again.</div>';
  }
}

/**
 * Handle refresh button click
 */
async function handleRefresh() {
  const refreshBtn = document.getElementById('refresh-btn');
  refreshBtn.disabled = true;
  refreshBtn.textContent = 'Refreshing...';
  
  await loadMessages();
  
  refreshBtn.disabled = false;
  refreshBtn.textContent = 'Refresh';
}

/**
 * Handle clear all button click
 */
async function handleClearAll() {
  if (!confirm('Are you sure you want to clear all captured messages?')) {
    return;
  }
  
  const clearBtn = document.getElementById('clear-btn');
  clearBtn.disabled = true;
  clearBtn.textContent = 'Clearing...';
  
  try {
    await clearAllMessages();
    await loadMessages();
  } catch (error) {
    console.error('Error clearing messages:', error);
    alert('Failed to clear messages. Please try again.');
  } finally {
    clearBtn.disabled = false;
    clearBtn.textContent = 'Clear All';
  }
}

/**
 * Initialize popup
 */
document.addEventListener('DOMContentLoaded', () => {
  // Load messages on popup open
  loadMessages();
  
  // Set up event listeners
  const refreshBtn = document.getElementById('refresh-btn');
  const clearBtn = document.getElementById('clear-btn');
  
  if (refreshBtn) {
    refreshBtn.addEventListener('click', handleRefresh);
  }
  
  if (clearBtn) {
    clearBtn.addEventListener('click', handleClearAll);
  }
});
