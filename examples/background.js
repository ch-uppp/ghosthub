/**
 * Example Background Script for GhostHub
 * Demonstrates how to use IndexedDB utility functions in a Chrome extension
 */

// Import the IndexedDB utility functions
importScripts('utils/indexeddb.js');

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleMessage(message, sender)
    .then(response => sendResponse(response))
    .catch(error => sendResponse({ success: false, error: error.message }));
  
  // Return true to indicate we'll send response asynchronously
  return true;
});

/**
 * Handle incoming messages
 */
async function handleMessage(message, sender) {
  const { action, data, id, filter } = message;

  switch (action) {
    case 'storeMessage':
      return await storeMessage(data, sender);
    
    case 'retrieveMessage':
      return await retrieveMessage(id);
    
    case 'retrieveAllMessages':
      return await retrieveAllMessages(filter);
    
    case 'updateMessage':
      return await updateMessage(id, data);
    
    case 'deleteMessage':
      return await deleteMessage(id);
    
    case 'getMessageCount':
      return await getMessageCount(filter);
    
    default:
      throw new Error(`Unknown action: ${action}`);
  }
}

/**
 * Store a new message/issue
 */
async function storeMessage(data, sender) {
  try {
    // Add sender information if available
    const enrichedData = {
      ...data,
      metadata: {
        ...data.metadata,
        sourceUrl: sender.url,
        sourceTab: sender.tab?.id
      }
    };

    const id = await store(enrichedData);
    
    console.log(`Stored message with ID: ${id}`, enrichedData);
    
    // Show notification badge
    await updateBadge();
    
    return { success: true, id };
  } catch (error) {
    console.error('Error storing message:', error);
    throw error;
  }
}

/**
 * Retrieve a specific message
 */
async function retrieveMessage(id) {
  try {
    const message = await retrieve(id);
    return { success: true, message };
  } catch (error) {
    console.error('Error retrieving message:', error);
    throw error;
  }
}

/**
 * Retrieve all messages with optional filter
 */
async function retrieveAllMessages(filter = {}) {
  try {
    const messages = await retrieveAll(filter);
    return { success: true, messages, count: messages.length };
  } catch (error) {
    console.error('Error retrieving messages:', error);
    throw error;
  }
}

/**
 * Update a message
 */
async function updateMessage(id, updates) {
  try {
    await update(id, updates);
    
    console.log(`Updated message ${id}`, updates);
    
    // Update badge if status changed
    if (updates.status) {
      await updateBadge();
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error updating message:', error);
    throw error;
  }
}

/**
 * Delete a message
 */
async function deleteMessage(id) {
  try {
    await deleteItem(id);
    
    console.log(`Deleted message ${id}`);
    
    // Update badge
    await updateBadge();
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting message:', error);
    throw error;
  }
}

/**
 * Get message count
 */
async function getMessageCount(filter = {}) {
  try {
    const totalCount = await count(filter);
    return { success: true, count: totalCount };
  } catch (error) {
    console.error('Error counting messages:', error);
    throw error;
  }
}

/**
 * Update the extension badge with pending message count
 */
async function updateBadge() {
  try {
    const pendingCount = await count({ status: 'pending' });
    
    if (pendingCount > 0) {
      await chrome.action.setBadgeText({ text: pendingCount.toString() });
      await chrome.action.setBadgeBackgroundColor({ color: '#4CAF50' });
    } else {
      await chrome.action.setBadgeText({ text: '' });
    }
  } catch (error) {
    console.error('Error updating badge:', error);
  }
}

// Initialize badge on startup
chrome.runtime.onStartup.addListener(() => {
  updateBadge();
});

// Update badge when extension is installed/updated
chrome.runtime.onInstalled.addListener(() => {
  updateBadge();
});

console.log('GhostHub background script initialized');
