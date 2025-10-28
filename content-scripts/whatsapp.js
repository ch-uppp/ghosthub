/**
 * GhostHub WhatsApp Content Script
 * 
 * Purpose: Detects and captures messages from WhatsApp Web
 */

(function() {
  'use strict';

  // Ensure base ContentScript is loaded
  if (!window.GhostHubContentScript) {
    console.error('[GhostHub] Base ContentScript not loaded for WhatsApp');
    return;
  }

  /**
   * WhatsApp-specific implementation of ContentScript
   */
  class WhatsAppContentScript extends window.GhostHubContentScript {
    constructor() {
      super('whatsapp');
    }

    /**
     * Set up MutationObserver for WhatsApp messages
     */
    setupMessageObserver() {
      // WhatsApp message container selectors
      const messageContainerSelectors = [
        '[data-testid="conversation-panel-messages"]',
        '#main [role="application"]',
        '.message-list',
        '[class*="copyable-area"]'
      ];

      // Find the message container
      const findContainer = () => {
        for (const selector of messageContainerSelectors) {
          const container = document.querySelector(selector);
          if (container) return container;
        }
        return null;
      };

      // Wait for container to load
      const waitForContainer = () => {
        const container = findContainer();
        if (container) {
          this.observeContainer(container);
        } else {
          setTimeout(waitForContainer, 1000);
        }
      };

      waitForContainer();
    }

    /**
     * Observe a container for new messages
     * 
     * @param {Element} container - The container to observe
     */
    observeContainer(container) {
      console.log('[GhostHub] Observing WhatsApp container:', container);

      this.observer = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              this.processNode(node);
            }
          });
        });
      });

      this.observer.observe(container, {
        childList: true,
        subtree: true
      });

      // Process existing messages
      const existingMessages = container.querySelectorAll('[data-testid="msg-container"]');
      existingMessages.forEach(msg => this.processNode(msg));
    }

    /**
     * Process a DOM node to check if it's a message
     * 
     * @param {Element} node - The node to process
     */
    processNode(node) {
      // WhatsApp message selectors
      const isMessage = node.matches && (
        node.matches('[data-testid="msg-container"]') ||
        node.matches('.message-in') ||
        node.matches('.message-out') ||
        node.matches('[class*="message-"]')
      );

      if (isMessage) {
        const messageData = this.extractMessageData(node);
        if (messageData) {
          this.processMessage(messageData);
        }
      }
    }

    /**
     * Extract message data from WhatsApp message element
     * 
     * @param {Element} element - The message element
     * @returns {Object|null} Message data
     */
    extractMessageData(element) {
      try {
        // Extract message ID
        const messageId = element.getAttribute('data-id') || 
                         element.id || 
                         `whatsapp-${Date.now()}-${Math.random()}`;

        // Extract timestamp
        const timeElement = element.querySelector('[data-testid="msg-meta"], .copyable-text, [data-pre-plain-text]');
        let timestamp = Date.now();
        
        if (timeElement) {
          const timeText = timeElement.getAttribute('data-pre-plain-text') || timeElement.textContent;
          // WhatsApp format: "[HH:MM, DD/MM/YYYY]" or just time
          const timeMatch = timeText.match(/\[?(\d{1,2}:\d{2})/);
          if (timeMatch) {
            // For simplicity, use current timestamp if we can't parse exact time
            timestamp = Date.now();
          }
        }

        // Extract message text
        const textElement = element.querySelector(
          '[data-testid="msg-text"], .selectable-text, .copyable-text > span'
        );
        const text = textElement ? textElement.textContent.trim() : '';

        if (!text) return null;

        // Extract author - check if incoming or outgoing message
        const isIncoming = element.classList.contains('message-in') || 
                          element.closest('.message-in') !== null;
        const isOutgoing = element.classList.contains('message-out') || 
                          element.closest('.message-out') !== null;
        
        let author = 'Unknown';
        if (isOutgoing) {
          author = 'You';
        } else if (isIncoming) {
          // Try to get author from group messages
          const authorElement = element.querySelector('[class*="_ao3e"], [data-testid="msg-author"]');
          author = authorElement ? authorElement.textContent.trim() : this.getCurrentChatName();
        }

        // Extract chat info
        const chatName = this.getCurrentChatName();

        // Extract code snippets and images
        const codeSnippets = this.extractCodeSnippets(element);
        const images = this.extractImages(element);

        // Check if message is actionable
        const isActionable = this.isActionableMessage(text);

        return {
          id: messageId,
          platform: 'whatsapp',
          timestamp: timestamp,
          author: author,
          text: text,
          channel: chatName,
          codeSnippets: codeSnippets,
          images: images,
          isActionable: isActionable,
          isIncoming: isIncoming,
          isOutgoing: isOutgoing,
          url: window.location.href
        };
      } catch (error) {
        console.error('[GhostHub] Error extracting WhatsApp message:', error);
        return null;
      }
    }

    /**
     * Get the current WhatsApp chat name
     * 
     * @returns {string} Chat name
     */
    getCurrentChatName() {
      const chatHeader = document.querySelector(
        '[data-testid="conversation-info-header-chat-title"], ._ao3e, header [class*="copyable-text"]'
      );
      return chatHeader ? chatHeader.textContent.trim() : 'unknown-chat';
    }

    /**
     * Extract images from WhatsApp message
     * 
     * @param {Element} element - The message element
     * @returns {Array} Array of image URLs
     */
    extractImages(element) {
      const images = [];
      
      // WhatsApp images
      const imgElements = element.querySelectorAll(
        '[data-testid="msg-media"] img, [class*="media-image"] img, img[src*="blob:"]'
      );
      
      imgElements.forEach(img => {
        const src = img.src;
        if (src) {
          images.push({
            url: src,
            alt: img.alt || '',
            type: 'image'
          });
        }
      });
      
      return images;
    }
  }

  // Initialize the WhatsApp content script
  const whatsappScript = new WhatsAppContentScript();
  whatsappScript.init();

  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    whatsappScript.destroy();
  });

})();
