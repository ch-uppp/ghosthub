/**
 * WhatsApp Content Script
 * Monitors WhatsApp Web messages, detects images, and uses multimodal AI for analysis
 */

(function() {
  'use strict';

  let imageDetector;
  let messageAnalyzer;
  let isInitialized = false;

  async function initialize() {
    if (isInitialized) return;

    console.log('[GhostHub] Initializing WhatsApp integration...');

    try {
      await waitForUtilities();
      imageDetector = new ImageDetector('whatsapp');
      messageAnalyzer = new MessageAnalyzer();
      await messageAnalyzer.initialize();
      setupMessageMonitoring();
      setupGhostHubButton();
      isInitialized = true;
      console.log('[GhostHub] WhatsApp integration initialized');
    } catch (error) {
      console.error('[GhostHub] Failed to initialize:', error);
    }
  }

  function waitForUtilities() {
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (typeof ImageDetector !== 'undefined' && typeof MessageAnalyzer !== 'undefined') {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);
      setTimeout(() => { clearInterval(checkInterval); resolve(); }, 10000);
    });
  }

  function setupMessageMonitoring() {
    const chatContainer = document.querySelector('#main') || document.body;

    if (imageDetector) {
      imageDetector.observeImages(chatContainer, (images) => {
        console.log(`[GhostHub] Detected ${images.length} new image(s) in WhatsApp`);
        images.forEach(img => {
          if (img.element) {
            img.element.style.border = '2px solid rgba(67, 160, 71, 0.3)';
            img.element.style.borderRadius = '4px';
          }
        });
      });
    }
  }

  function setupGhostHubButton() {
    const button = document.createElement('button');
    button.innerHTML = '👻 Create Issue';
    button.style.cssText = `
      position: fixed;
      bottom: 80px;
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
    `;

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
  }

  async function handleCreateIssue() {
    try {
      const messages = getRelevantMessages();
      if (messages.length === 0) {
        showNotification('No messages found', 'warning');
        return;
      }

      const analysis = await analyzeMessages(messages);

      chrome.runtime.sendMessage({
        type: 'CREATE_ISSUE',
        data: {
          analysis,
          source: 'whatsapp',
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
      console.error('[GhostHub] Error:', error);
      showNotification('Error: ' + error.message, 'error');
    }
  }

  function getRelevantMessages() {
    const messages = [];
    const messageElements = document.querySelectorAll('div[data-id]');

    messageElements.forEach((msgEl, index) => {
      const textElement = msgEl.querySelector('.selectable-text');
      const text = textElement ? textElement.textContent.trim() : '';
      const images = imageDetector ? imageDetector.detectImagesInMessage(msgEl) : [];

      messages.push({
        index,
        text,
        images,
        timestamp: Date.now(),
        element: msgEl
      });
    });

    return messages.slice(-10);
  }

  async function analyzeMessages(messages) {
    const analyses = [];
    for (const msg of messages) {
      if (messageAnalyzer) {
        const analysis = await messageAnalyzer.analyzeMessage(msg);
        analyses.push(analysis);
      }
    }
    return combineAnalyses(analyses);
  }

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
      if (analysis.text) combined.text += analysis.text + '\n\n';
      if (analysis.images) combined.images.push(...analysis.images);
      if (analysis.errors) combined.errors.push(...analysis.errors);
      if (analysis.hasErrors) combined.hasErrors = true;
    });

    if (analyses.some(a => a.type === 'bug')) {
      combined.type = 'bug';
    } else if (analyses.some(a => a.type === 'feature')) {
      combined.type = 'feature';
    }

    combined.summary = generateCombinedSummary(combined);
    return combined;
  }

  function generateCombinedSummary(combined) {
    let summary = '## Conversation Summary\n\n' + combined.text;
    
    if (combined.images.length > 0) {
      summary += '\n\n## Screenshots\n\n';
      combined.images.forEach((img, index) => {
        if (img.context) summary += `**Screenshot ${index + 1}:** ${img.context}\n\n`;
        if (img.errors && img.errors.length > 0) {
          summary += 'Errors:\n';
          img.errors.forEach(err => summary += `- ${err}\n`);
        }
      });
    }
    
    return summary;
  }

  function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
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
    `;

    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }

})();
