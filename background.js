/**
 * Background Service Worker
 * Handles message processing, AI API calls, and communication with content scripts
 */

// Import AI workflow manager
import aiWorkflow from './api/ai-workflow.js';
import dbManager from './storage/indexeddb.js';

console.log('GhostHub background service worker loaded');

// Initialize the database and AI APIs on install
chrome.runtime.onInstalled.addListener(async (details) => {
  console.log('Extension installed:', details.reason);
  
  try {
    // Initialize IndexedDB
    await dbManager.init();
    console.log('IndexedDB initialized');

    // Check AI API availability
    const availability = await aiWorkflow.initialize();
    console.log('AI APIs availability:', availability);

    if (!availability.ready) {
      console.warn('Some AI APIs are not available. Extension functionality may be limited.');
    }

    // Set default settings
    await chrome.storage.local.set({
      settings: {
        autoClassify: true,
        autoSummarize: true,
        platforms: {
          slack: true,
          discord: true,
          whatsapp: true
        }
      }
    });

  } catch (error) {
    console.error('Error during initialization:', error);
  }
});

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Message received in background:', message.type);

  // Handle async operations
  (async () => {
    try {
      switch (message.type) {
        case 'CLASSIFY_MESSAGE':
          await handleClassifyMessage(message.data, sendResponse);
          break;

        case 'SUMMARIZE_THREAD':
          await handleSummarizeThread(message.data, sendResponse);
          break;

        case 'PROCESS_THREAD':
          await handleProcessThread(message.data, sendResponse);
          break;

        case 'GET_CLASSIFICATIONS':
          await handleGetClassifications(message.filters, sendResponse);
          break;

        case 'GET_SUMMARIES':
          await handleGetSummaries(message.filters, sendResponse);
          break;

        case 'GET_ISSUES':
          await handleGetIssues(message.filters, sendResponse);
          break;

        case 'UPDATE_ISSUE_STATUS':
          await handleUpdateIssueStatus(message.data, sendResponse);
          break;

        case 'CHECK_API_AVAILABILITY':
          await handleCheckAPIAvailability(sendResponse);
          break;

        default:
          sendResponse({ error: 'Unknown message type' });
      }
    } catch (error) {
      console.error('Error handling message:', error);
      sendResponse({ error: error.message });
    }
  })();

  // Return true to indicate async response
  return true;
});

/**
 * Handle message classification request
 */
async function handleClassifyMessage(data, sendResponse) {
  try {
    const result = await aiWorkflow.processMessage(data);
    sendResponse({ success: true, result });
  } catch (error) {
    console.error('Error classifying message:', error);
    sendResponse({ success: false, error: error.message });
  }
}

/**
 * Handle thread summarization request
 */
async function handleSummarizeThread(data, sendResponse) {
  try {
    const result = await aiWorkflow.processThread(data);
    sendResponse({ success: true, result });
  } catch (error) {
    console.error('Error summarizing thread:', error);
    sendResponse({ success: false, error: error.message });
  }
}

/**
 * Handle full thread processing (classify + summarize)
 */
async function handleProcessThread(data, sendResponse) {
  try {
    const result = await aiWorkflow.processThread(data);
    
    // Send notification if actionable
    if (result.actionable && result.issueDraft) {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon128.png',
        title: 'New Issue Draft Created',
        message: result.issueDraft.title,
        priority: 2
      });
    }

    sendResponse({ success: true, result });
  } catch (error) {
    console.error('Error processing thread:', error);
    sendResponse({ success: false, error: error.message });
  }
}

/**
 * Handle get classifications request
 */
async function handleGetClassifications(filters, sendResponse) {
  try {
    const classifications = await dbManager.getClassifications(filters);
    sendResponse({ success: true, classifications });
  } catch (error) {
    console.error('Error getting classifications:', error);
    sendResponse({ success: false, error: error.message });
  }
}

/**
 * Handle get summaries request
 */
async function handleGetSummaries(filters, sendResponse) {
  try {
    const summaries = await dbManager.getSummaries(filters);
    sendResponse({ success: true, summaries });
  } catch (error) {
    console.error('Error getting summaries:', error);
    sendResponse({ success: false, error: error.message });
  }
}

/**
 * Handle get issues request
 */
async function handleGetIssues(filters, sendResponse) {
  try {
    const issues = await dbManager.getIssues(filters);
    sendResponse({ success: true, issues });
  } catch (error) {
    console.error('Error getting issues:', error);
    sendResponse({ success: false, error: error.message });
  }
}

/**
 * Handle update issue status request
 */
async function handleUpdateIssueStatus(data, sendResponse) {
  try {
    const { issueId, status } = data;
    await aiWorkflow.updateIssueStatus(issueId, status);
    sendResponse({ success: true });
  } catch (error) {
    console.error('Error updating issue status:', error);
    sendResponse({ success: false, error: error.message });
  }
}

/**
 * Handle API availability check
 */
async function handleCheckAPIAvailability(sendResponse) {
  try {
    const availability = await aiWorkflow.getAvailability();
    sendResponse({ success: true, availability });
  } catch (error) {
    console.error('Error checking API availability:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// Keep service worker alive
chrome.runtime.onConnect.addListener((port) => {
  console.log('Port connected:', port.name);
});

// Handle extension updates
chrome.runtime.onUpdateAvailable.addListener((details) => {
  console.log('Update available:', details);
});

// Clean up on shutdown
self.addEventListener('beforeunload', async () => {
  console.log('Service worker shutting down');
  await aiWorkflow.cleanup();
});
