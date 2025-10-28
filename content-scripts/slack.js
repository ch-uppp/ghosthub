/**
 * Slack Content Script
 * Monitors Slack messages, detects images, and uses multimodal AI for analysis
 */

(function() {
  'use strict';

  // State management
  let imageDetector;
  let messageAnalyzer;
  let isInitialized = false;
  let observer = null;

  /**
   * Initialize the content script
   */
  async function initialize() {
    if (isInitialized) return;

    console.log('[GhostHub] Initializing Slack integration...');

    try {
      // Wait for utilities to be available
      await waitForUtilities();

      // Initialize image detector
      imageDetector = new ImageDetector('slack');

      // Initialize message analyzer
      messageAnalyzer = new MessageAnalyzer();
      await messageAnalyzer.initialize();

      // Setup message monitoring
      setupMessageMonitoring();

      // Setup UI button
      setupGhostHubButton();

      isInitialized = true;
      console.log('[GhostHub] Slack integration initialized successfully');
    } catch (error) {
      console.error('[GhostHub] Failed to initialize:', error);
    }
  }

  /**
   * Wait for utility scripts to be loaded
   */
  function waitForUtilities() {
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (typeof ImageDetector !== 'undefined' && 
            typeof MessageAnalyzer !== 'undefined') {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);

      // Timeout after 10 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        resolve();
      }, 10000);
    });
  }

  /**
   * Setup message monitoring
   */
  function setupMessageMonitoring() {
    const mainContent = document.querySelector('.p-workspace__primary_view_contents') ||
                       document.querySelector('.c-virtual_list__scroll_container') ||
                       document.body;

    if (!mainContent) {
      console.warn('[GhostHub] Could not find Slack message container');
      return;
    }

    // Observe for new messages and images
    if (imageDetector) {
      observer = imageDetector.observeImages(mainContent, handleNewImages);
    }

    console.log('[GhostHub] Message monitoring active');
  }

  /**
   * Handle new images detected in chat
   * @param {Array} images - New images detected
   */
  function handleNewImages(images) {
    console.log(`[GhostHub] Detected ${images.length} new image(s)`);
    
    // Store images for later processing
    images.forEach(img => {
      // Add visual indicator
      addImageIndicator(img.element);
    });
  }

  /**
   * Add visual indicator to processed images
   * @param {Element} imgElement - Image element
   */
  function addImageIndicator(imgElement) {
    if (!imgElement || imgElement.dataset.ghosthubProcessed) return;

    imgElement.dataset.ghosthubProcessed = 'true';
    imgElement.style.border = '2px solid rgba(67, 160, 71, 0.3)';
    imgElement.style.borderRadius = '4px';
  }

  /**
   * Setup GhostHub button in Slack UI
   */
  function setupGhostHubButton() {
    // Find Slack's message input area
    const messageInput = document.querySelector('.p-message_pane_input_footer') ||
                        document.querySelector('.c-texty_input');

    if (!messageInput) {
      console.warn('[GhostHub] Could not find message input area');
      return;
    }

    // Create button
    const button = document.createElement('button');
    button.className = 'ghosthub-create-issue-btn';
    button.innerHTML = '👻 Create GitHub Issue';
    button.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      padding: 12px 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
      z-index: 10000;
      transition: all 0.3s ease;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    `;

    // Add hover effects
    button.addEventListener('mouseenter', () => {
      button.style.transform = 'translateY(-2px)';
      button.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.3)';
    });

    button.addEventListener('mouseleave', () => {
      button.style.transform = 'translateY(0)';
      button.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
    });

    button.addEventListener('click', handleCreateIssue);

    document.body.appendChild(button);
    console.log('[GhostHub] UI button added');
  }

  /**
   * Handle create issue button click
   */
  async function handleCreateIssue() {
    try {
      console.log('[GhostHub] Creating GitHub issue...');

      // Get selected messages or recent conversation
      const messages = getRelevantMessages();
      
      if (messages.length === 0) {
        showNotification('No messages found to analyze', 'warning');
        return;
      }

      // Analyze messages including images
      const analysis = await analyzeMessages(messages);

      // Send to background script for GitHub issue creation
      chrome.runtime.sendMessage({
        type: 'CREATE_ISSUE',
        data: {
          analysis,
          source: 'slack',
          timestamp: Date.now()
        }
      }, (response) => {
        if (response && response.success) {
          showNotification('GitHub issue draft created!', 'success');
        } else {
          showNotification('Failed to create issue', 'error');
        }
      });

    } catch (error) {
      console.error('[GhostHub] Error creating issue:', error);
      showNotification('Error: ' + error.message, 'error');
    }
  }

  /**
   * Get relevant messages from the current conversation
   * @returns {Array} - Array of message objects
   */
  function getRelevantMessages() {
    const messages = [];
    const messageElements = document.querySelectorAll('.c-virtual_list__item, .c-message_kit__message');

    messageElements.forEach((msgEl, index) => {
      // Get text content
      const textElement = msgEl.querySelector('.c-message_kit__text, .p-rich_text_section');
      const text = textElement ? textElement.textContent.trim() : '';

      // Get images
      const images = imageDetector ? imageDetector.detectImagesInMessage(msgEl) : [];

      // Get metadata
      const timestamp = msgEl.querySelector('[data-ts]')?.dataset.ts || Date.now();
      const author = msgEl.querySelector('.c-message__sender_link')?.textContent || 'Unknown';

      messages.push({
        index,
        text,
        images,
        timestamp,
        author,
        element: msgEl
      });
    });

    // Return last 10 messages or messages with images
    return messages.slice(-10);
  }

  /**
   * Analyze messages with text and images
   * @param {Array} messages - Array of message objects
   * @returns {Promise<Object>} - Combined analysis
   */
  async function analyzeMessages(messages) {
    const analyses = [];

    for (const msg of messages) {
      if (messageAnalyzer) {
        const analysis = await messageAnalyzer.analyzeMessage(msg);
        analyses.push(analysis);
      }
    }

    // Combine analyses
    return combineAnalyses(analyses);
  }

  /**
   * Combine multiple message analyses
   * @param {Array} analyses - Array of analysis objects
   * @returns {Object} - Combined analysis
   */
  function combineAnalyses(analyses) {
    const combined = {
      text: '',
      images: [],
      errors: [],
      hasErrors: false,
      summary: '',
      type: 'general'
    };

    analyses.forEach(analysis => {
      if (analysis.text) {
        combined.text += analysis.text + '\n\n';
      }
      
      if (analysis.images) {
        combined.images.push(...analysis.images);
      }
      
      if (analysis.errors) {
        combined.errors.push(...analysis.errors);
      }
      
      if (analysis.hasErrors) {
        combined.hasErrors = true;
      }
    });

    // Determine overall type (prioritize bugs)
    if (analyses.some(a => a.type === 'bug')) {
      combined.type = 'bug';
    } else if (analyses.some(a => a.type === 'feature')) {
      combined.type = 'feature';
    }

    // Generate combined summary
    combined.summary = generateCombinedSummary(combined);

    return combined;
  }

  /**
   * Generate combined summary
   * @param {Object} combined - Combined analysis
   * @returns {string} - Summary text
   */
  function generateCombinedSummary(combined) {
    let summary = '## Conversation Summary\n\n';
    
    if (combined.text) {
      summary += combined.text;
    }
    
    if (combined.images.length > 0) {
      summary += '\n\n## Screenshots\n\n';
      summary += `Found ${combined.images.length} screenshot(s) with analysis:\n\n`;
      
      combined.images.forEach((img, index) => {
        if (img.context) {
          summary += `**Screenshot ${index + 1}:** ${img.context}\n\n`;
        }
        if (img.errors && img.errors.length > 0) {
          summary += 'Errors detected:\n';
          img.errors.forEach(err => summary += `- ${err}\n`);
          summary += '\n';
        }
      });
    }
    
    return summary;
  }

  /**
   * Show notification to user
   * @param {string} message - Notification message
   * @param {string} type - Notification type (success, error, warning)
   */
  function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = 'ghosthub-notification';
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 16px 24px;
      background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#ff9800'};
      color: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      z-index: 10001;
      font-size: 14px;
      font-weight: 500;
      animation: slideIn 0.3s ease;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }

  // Re-initialize on Slack SPA navigation
  let lastUrl = location.href;
  new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      console.log('[GhostHub] Slack navigation detected, re-initializing...');
      isInitialized = false;
      initialize();
    }
  }).observe(document, { subtree: true, childList: true });

})();
