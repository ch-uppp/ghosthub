// background.js - Service worker for GhostHub Chrome Extension
// Handles extension lifecycle, message communication, and background tasks

// Extension lifecycle event listeners
chrome.runtime.onInstalled.addListener((details) => {
  console.log('GhostHub extension installed/updated:', details.reason);
  
  if (details.reason === 'install') {
    console.log('First time installation');
  } else if (details.reason === 'update') {
    console.log('Extension updated to version:', chrome.runtime.getManifest().version);
  }
});

// Message listener for communication with content scripts and popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Message received in background script:', {
    message: message,
    sender: {
      tab: sender.tab ? {
        id: sender.tab.id,
        url: sender.tab.url,
        title: sender.tab.title
      } : undefined,
      frameId: sender.frameId,
      url: sender.url
    },
    timestamp: new Date().toISOString()
  });

  // Send acknowledgment response
  sendResponse({ received: true, timestamp: Date.now() });

  // Return true to indicate we will send a response asynchronously if needed
  return true;
});

console.log('GhostHub background script initialized');
