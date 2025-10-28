/**
 * GhostHub Discord Content Script
 * 
 * Purpose: Detects and captures messages from Discord Web
 */

(function() {
  'use strict';

  // Ensure base ContentScript is loaded
  if (!window.GhostHubContentScript) {
    console.error('[GhostHub] Base ContentScript not loaded for Discord');
    return;
  }

  /**
   * Discord-specific implementation of ContentScript
   */
  class DiscordContentScript extends window.GhostHubContentScript {
    constructor() {
      super('discord');
    }

    /**
     * Set up MutationObserver for Discord messages
     */
    setupMessageObserver() {
      // Discord message container selectors
      const messageContainerSelectors = [
        '[class*="messagesWrapper"]',
        '[class*="scrollerInner"]',
        '[data-list-id="chat-messages"]',
        'main [class*="chatContent"]'
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
      console.log('[GhostHub] Observing Discord container:', container);

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
      const existingMessages = container.querySelectorAll('[id^="chat-messages-"], [class*="message-"]');
      existingMessages.forEach(msg => this.processNode(msg));
    }

    /**
     * Process a DOM node to check if it's a message
     * 
     * @param {Element} node - The node to process
     */
    processNode(node) {
      // Discord message selectors - using class name patterns since Discord uses dynamic class names
      const isMessage = node.matches && (
        node.id?.startsWith('chat-messages-') ||
        node.className?.includes('message-') ||
        node.getAttribute('class')?.includes('messageListItem')
      );

      if (isMessage || this.hasMessageChild(node)) {
        const messageData = this.extractMessageData(node);
        if (messageData) {
          this.processMessage(messageData);
        }
      }
    }

    /**
     * Check if node has a message child
     * 
     * @param {Element} node - The node to check
     * @returns {boolean} True if has message child
     */
    hasMessageChild(node) {
      return node.querySelector && (
        node.querySelector('[id^="chat-messages-"]') !== null ||
        node.querySelector('[class*="message-"]') !== null
      );
    }

    /**
     * Extract message data from Discord message element
     * 
     * @param {Element} element - The message element
     * @returns {Object|null} Message data
     */
    extractMessageData(element) {
      try {
        // Find the actual message element if we're on a parent
        let messageElement = element;
        if (!element.id?.startsWith('chat-messages-')) {
          const msgEl = element.querySelector('[id^="chat-messages-"]');
          if (msgEl) messageElement = msgEl;
        }

        // Extract message ID
        const messageId = messageElement.id || `discord-${Date.now()}-${Math.random()}`;

        // Extract timestamp
        const timeElement = messageElement.querySelector('time, [class*="timestamp"]');
        const timestamp = timeElement ? 
          (timeElement.dateTime || timeElement.getAttribute('datetime') || Date.now()) : 
          Date.now();

        // Extract message text - Discord uses multiple possible selectors
        const textElement = messageElement.querySelector(
          '[class*="messageContent"], [class*="markup"]'
        );
        const text = textElement ? textElement.textContent.trim() : '';

        if (!text) return null;

        // Extract author
        const authorElement = messageElement.querySelector(
          '[class*="username"], [class*="author"]'
        );
        const author = authorElement ? authorElement.textContent.trim() : 'Unknown';

        // Extract channel info
        const channelName = this.getCurrentChannel();

        // Extract code snippets and images
        const codeSnippets = this.extractCodeSnippets(messageElement);
        const images = this.extractImages(messageElement);

        // Check if message is actionable
        const isActionable = this.isActionableMessage(text);

        return {
          id: messageId,
          platform: 'discord',
          timestamp: timestamp,
          author: author,
          text: text,
          channel: channelName,
          codeSnippets: codeSnippets,
          images: images,
          isActionable: isActionable,
          url: window.location.href
        };
      } catch (error) {
        console.error('[GhostHub] Error extracting Discord message:', error);
        return null;
      }
    }

    /**
     * Get the current Discord channel name
     * 
     * @returns {string} Channel name
     */
    getCurrentChannel() {
      const channelHeader = document.querySelector(
        '[class*="title-"][class*="channel"], [class*="channelName"], h3[class*="title"]'
      );
      return channelHeader ? channelHeader.textContent.trim() : 'unknown-channel';
    }

    /**
     * Extract code snippets from Discord message (including code blocks)
     * 
     * @param {Element} element - The message element
     * @returns {Array} Array of code snippets
     */
    extractCodeSnippets(element) {
      const codeBlocks = [];
      
      // Discord code blocks
      const codeElements = element.querySelectorAll(
        'code, pre, [class*="codeBlock"], [class*="code-"]'
      );
      
      codeElements.forEach(codeEl => {
        const text = codeEl.textContent.trim();
        if (text) {
          // Try to detect language from class name
          const className = codeEl.className || '';
          const langMatch = className.match(/language-(\w+)/);
          const language = langMatch ? langMatch[1] : 'unknown';
          
          codeBlocks.push({
            language: language,
            code: text
          });
        }
      });
      
      return codeBlocks;
    }
  }

  // Initialize the Discord content script
  const discordScript = new DiscordContentScript();
  discordScript.init();

  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    discordScript.destroy();
  });

})();
