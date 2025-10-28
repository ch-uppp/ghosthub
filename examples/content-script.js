/**
 * Example Content Script for GhostHub
 * Demonstrates how to send messages to background script for storage
 */

/**
 * Send a message to background script for storage
 */
async function captureAndStoreMessage(messageData) {
  try {
    const response = await chrome.runtime.sendMessage({
      action: 'storeMessage',
      data: messageData
    });

    if (response.success) {
      console.log('Message stored successfully with ID:', response.id);
      return response.id;
    } else {
      console.error('Failed to store message:', response.error);
      return null;
    }
  } catch (error) {
    console.error('Error sending message to background:', error);
    return null;
  }
}

/**
 * Example: Capture a bug report from Slack
 */
async function captureBugFromSlack(element) {
  const messageData = {
    platform: 'slack',
    type: 'bug',
    content: element.textContent.trim(),
    status: 'pending',
    metadata: {
      channel: getCurrentChannel(),
      author: getAuthor(element),
      timestamp: Date.now(),
      url: window.location.href
    }
  };

  return await captureAndStoreMessage(messageData);
}

/**
 * Example: Capture a feature request from Discord
 */
async function captureFeatureFromDiscord(element) {
  const messageData = {
    platform: 'discord',
    type: 'feature',
    content: element.textContent.trim(),
    status: 'pending',
    metadata: {
      server: getCurrentServer(),
      channel: getCurrentChannel(),
      author: getAuthor(element),
      timestamp: Date.now(),
      url: window.location.href
    }
  };

  return await captureAndStoreMessage(messageData);
}

/**
 * Example: Capture a PR mention from WhatsApp
 */
async function capturePRMentionFromWhatsApp(element) {
  const messageData = {
    platform: 'whatsapp',
    type: 'pr_mention',
    content: element.textContent.trim(),
    status: 'pending',
    metadata: {
      chat: getCurrentChat(),
      author: getAuthor(element),
      timestamp: Date.now(),
      url: window.location.href
    }
  };

  return await captureAndStoreMessage(messageData);
}

/**
 * Helper functions (platform-specific implementations would go here)
 */
function getCurrentChannel() {
  // Platform-specific implementation
  return 'example-channel';
}

function getCurrentServer() {
  // Platform-specific implementation
  return 'example-server';
}

function getCurrentChat() {
  // Platform-specific implementation
  return 'example-chat';
}

function getAuthor(element) {
  // Platform-specific implementation
  return 'example-author';
}

// Example: Listen for specific messages and capture them
function initializeMessageListener() {
  // This is a simplified example - actual implementation would use
  // MutationObserver or platform-specific APIs to detect new messages
  
  console.log('Message listener initialized');
  
  // Example of detecting and capturing a message
  // In real implementation, this would be triggered by actual message detection
  /*
  document.addEventListener('click', async (e) => {
    if (e.target.matches('.capture-button')) {
      const messageElement = e.target.closest('.message');
      await captureBugFromSlack(messageElement);
    }
  });
  */
}

// Initialize when content script loads
initializeMessageListener();

console.log('GhostHub content script loaded');
