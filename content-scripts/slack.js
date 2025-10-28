/**
 * Slack Content Script
 * Monitors Slack messages and sends them to the background worker for processing
 */

console.log('GhostHub Slack content script loaded');

// Configuration
const PLATFORM = 'slack';
const CHECK_INTERVAL = 5000; // Check for new messages every 5 seconds
let lastProcessedTimestamp = Date.now();

/**
 * Extract message data from Slack DOM
 */
function extractMessages() {
  const messages = [];
  
  // Find all message elements (Slack's structure may vary)
  const messageElements = document.querySelectorAll('[data-qa="virtual-list-item"]');
  
  messageElements.forEach(element => {
    try {
      // Extract message text
      const textElement = element.querySelector('[data-qa="message-text"]');
      if (!textElement) return;
      
      const text = textElement.innerText.trim();
      if (!text) return;

      // Extract author
      const authorElement = element.querySelector('[data-qa="message_sender_name"]');
      const author = authorElement ? authorElement.innerText.trim() : 'Unknown';

      // Extract timestamp
      const timeElement = element.querySelector('[data-qa="message-timestamp"]');
      const timestamp = timeElement ? new Date(timeElement.getAttribute('datetime')).getTime() : Date.now();

      // Only process new messages
      if (timestamp > lastProcessedTimestamp) {
        messages.push({
          text,
          author,
          timestamp,
          platform: PLATFORM
        });
      }
    } catch (error) {
      console.error('Error extracting message:', error);
    }
  });

  return messages;
}

/**
 * Send message to background for classification
 */
async function classifyMessage(message) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      {
        type: 'CLASSIFY_MESSAGE',
        data: message
      },
      (response) => {
        if (response && response.success) {
          resolve(response.result);
        } else {
          reject(new Error(response?.error || 'Classification failed'));
        }
      }
    );
  });
}

/**
 * Group messages into threads (simplified version)
 */
function groupMessagesIntoThreads(messages) {
  // In a real implementation, this would use Slack's thread IDs
  // For now, we'll group consecutive messages from the same author
  const threads = [];
  let currentThread = null;

  messages.forEach(message => {
    if (!currentThread || currentThread.author !== message.author) {
      if (currentThread && currentThread.messages.length > 0) {
        threads.push(currentThread);
      }
      currentThread = {
        threadId: `slack_${message.timestamp}`,
        platform: PLATFORM,
        author: message.author,
        messages: []
      };
    }
    currentThread.messages.push(message);
  });

  if (currentThread && currentThread.messages.length > 0) {
    threads.push(currentThread);
  }

  return threads;
}

/**
 * Process threads with multiple messages
 */
async function processThread(thread) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      {
        type: 'PROCESS_THREAD',
        data: thread
      },
      (response) => {
        if (response && response.success) {
          resolve(response.result);
        } else {
          reject(new Error(response?.error || 'Thread processing failed'));
        }
      }
    );
  });
}

/**
 * Main message monitoring function
 */
async function monitorMessages() {
  try {
    // Extract new messages
    const messages = extractMessages();
    
    if (messages.length === 0) {
      return;
    }

    console.log(`Found ${messages.length} new messages`);

    // Check if auto-classify is enabled
    const { settings } = await chrome.storage.local.get('settings');
    if (!settings?.autoClassify) {
      return;
    }

    // Process single messages
    if (messages.length === 1) {
      const result = await classifyMessage(messages[0]);
      if (result.actionable) {
        console.log('Actionable message detected:', result);
        showNotificationBadge();
      }
    } else if (messages.length > 1 && settings?.autoSummarize) {
      // Group into threads and process
      const threads = groupMessagesIntoThreads(messages);
      
      for (const thread of threads) {
        if (thread.messages.length >= 2) {
          const result = await processThread(thread);
          if (result.actionable) {
            console.log('Actionable thread detected:', result);
            showNotificationBadge();
          }
        }
      }
    }

    // Update last processed timestamp
    if (messages.length > 0) {
      lastProcessedTimestamp = Math.max(...messages.map(m => m.timestamp));
    }

  } catch (error) {
    console.error('Error monitoring messages:', error);
  }
}

/**
 * Show notification badge
 */
function showNotificationBadge() {
  chrome.runtime.sendMessage({
    type: 'SHOW_BADGE',
    data: { text: '!' }
  });
}

/**
 * Add visual indicator for monitored messages
 */
function addVisualIndicator(element, classification) {
  const indicator = document.createElement('span');
  indicator.style.cssText = `
    display: inline-block;
    margin-left: 8px;
    padding: 2px 6px;
    font-size: 10px;
    border-radius: 3px;
    background-color: ${classification === 'bug' ? '#ff4444' : classification === 'feature' ? '#44ff44' : '#4444ff'};
    color: white;
    font-weight: bold;
  `;
  indicator.textContent = classification.toUpperCase();
  
  const messageHeader = element.querySelector('[data-qa="message-header"]');
  if (messageHeader && !messageHeader.querySelector('.ghosthub-indicator')) {
    indicator.classList.add('ghosthub-indicator');
    messageHeader.appendChild(indicator);
  }
}

/**
 * Initialize the content script
 */
async function init() {
  console.log('Initializing GhostHub Slack monitor...');

  // Check if AI APIs are available
  chrome.runtime.sendMessage(
    { type: 'CHECK_API_AVAILABILITY' },
    (response) => {
      if (response && response.success) {
        console.log('AI APIs availability:', response.availability);
        if (!response.availability.ready) {
          console.warn('Some AI APIs are not available. Extension functionality may be limited.');
        }
      }
    }
  );

  // Start monitoring
  setInterval(monitorMessages, CHECK_INTERVAL);
  
  // Run once immediately
  monitorMessages();
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
