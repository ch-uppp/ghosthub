/**
 * GhostHub Content Script Base
 * 
 * Purpose: Shared functionality for detecting and capturing messages from chat platforms
 * (Slack, Discord, WhatsApp Web). This base module provides common message detection,
 * processing, and communication with the background service worker.
 */

(function() {
  'use strict';

  /**
   * Base ContentScript class for detecting and capturing chat messages
   */
  class ContentScript {
    constructor(platform) {
      this.platform = platform;
      this.observer = null;
      this.messages = new Map();
      this.lastProcessedTimestamp = Date.now();
      
      console.log(`[GhostHub] Initializing content script for ${platform}`);
    }

    /**
     * Initialize the content script
     */
    init() {
      this.setupMessageObserver();
      this.setupCommunication();
      console.log(`[GhostHub] Content script initialized for ${this.platform}`);
    }

    /**
     * Set up MutationObserver to detect new messages
     * Should be overridden by platform-specific implementations
     */
    setupMessageObserver() {
      // To be implemented by platform-specific scripts
      console.warn('[GhostHub] setupMessageObserver should be overridden');
    }

    /**
     * Extract message data from a DOM element
     * Should be overridden by platform-specific implementations
     * 
     * @param {Element} element - The message element
     * @returns {Object|null} Message object or null if invalid
     */
    extractMessageData(element) {
      // To be implemented by platform-specific scripts
      return null;
    }

    /**
     * Process a detected message
     * 
     * @param {Object} messageData - The extracted message data
     */
    processMessage(messageData) {
      if (!messageData || !messageData.id) {
        return;
      }

      // Avoid processing duplicates
      if (this.messages.has(messageData.id)) {
        return;
      }

      this.messages.set(messageData.id, messageData);
      
      // Send message to background script for AI processing
      this.sendMessageToBackground(messageData);
      
      console.log(`[GhostHub] Processed message:`, messageData);
    }

    /**
     * Set up communication with the background service worker
     */
    setupCommunication() {
      // Listen for messages from background script
      chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        this.handleBackgroundMessage(message, sender, sendResponse);
        return true; // Keep the message channel open for async response
      });
    }

    /**
     * Handle messages from the background script
     * 
     * @param {Object} message - The message from background
     * @param {Object} sender - The sender information
     * @param {Function} sendResponse - Response callback
     */
    handleBackgroundMessage(message, sender, sendResponse) {
      switch (message.action) {
        case 'getMessages':
          sendResponse({
            success: true,
            messages: Array.from(this.messages.values())
          });
          break;
        
        case 'clearMessages':
          this.messages.clear();
          sendResponse({ success: true });
          break;
        
        case 'ping':
          sendResponse({ 
            success: true, 
            platform: this.platform,
            messageCount: this.messages.size
          });
          break;
        
        default:
          sendResponse({ success: false, error: 'Unknown action' });
      }
    }

    /**
     * Send captured message to background script
     * 
     * @param {Object} messageData - The message data to send
     */
    sendMessageToBackground(messageData) {
      chrome.runtime.sendMessage({
        action: 'messageDetected',
        platform: this.platform,
        data: messageData
      }).catch(error => {
        console.error('[GhostHub] Error sending message to background:', error);
      });
    }

    /**
     * Detect if a message contains actionable developer content
     * This is a basic filter; AI processing in background will do more sophisticated detection
     * 
     * @param {string} text - The message text
     * @returns {boolean} True if potentially actionable
     */
    isActionableMessage(text) {
      if (!text) return false;

      const keywords = [
        'bug', 'error', 'issue', 'fix', 'broken', 'crash', 'fail',
        'feature', 'request', 'enhancement', 'todo', 'implement',
        'pr', 'pull request', 'merge', 'review',
        'exception', 'stack trace', 'warning'
      ];

      const lowerText = text.toLowerCase();
      return keywords.some(keyword => lowerText.includes(keyword));
    }

    /**
     * Extract code snippets from message
     * 
     * @param {Element} element - The message element
     * @returns {Array} Array of code snippets
     */
    extractCodeSnippets(element) {
      const codeBlocks = [];
      const codeElements = element.querySelectorAll('code, pre, .code-block, .hljs');
      
      codeElements.forEach(codeEl => {
        const text = codeEl.textContent.trim();
        if (text) {
          codeBlocks.push({
            language: codeEl.className.replace(/hljs|language-/g, '').trim() || 'unknown',
            code: text
          });
        }
      });
      
      return codeBlocks;
    }

    /**
     * Detect and extract image/screenshot URLs from message
     * 
     * @param {Element} element - The message element
     * @returns {Array} Array of image URLs
     */
    extractImages(element) {
      const images = [];
      const imgElements = element.querySelectorAll('img, [style*="background-image"]');
      
      imgElements.forEach(img => {
        let src = null;
        
        if (img.tagName === 'IMG') {
          src = img.src;
        } else {
          const bgStyle = img.style.backgroundImage;
          const match = bgStyle.match(/url\(['"]?(.*?)['"]?\)/);
          if (match) {
            src = match[1];
          }
        }
        
        if (src && !src.startsWith('data:')) {
          images.push({
            url: src,
            alt: img.alt || '',
            type: 'screenshot'
          });
        }
      });
      
      return images;
    }

    /**
     * Clean up resources
     */
    destroy() {
      if (this.observer) {
        this.observer.disconnect();
        this.observer = null;
      }
      this.messages.clear();
      console.log(`[GhostHub] Content script destroyed for ${this.platform}`);
    }
  }

  // Export the ContentScript class for use by platform-specific scripts
  window.GhostHubContentScript = ContentScript;

})();
