/**
 * GhostHub Slack Content Script
 * 
 * Purpose: Detects and captures messages from Slack Web
 */

(function() {
  'use strict';

  // Ensure base ContentScript is loaded
  if (!window.GhostHubContentScript) {
    console.error('[GhostHub] Base ContentScript not loaded for Slack');
    return;
  }

  /**
   * Slack-specific implementation of ContentScript
   */
  class SlackContentScript extends window.GhostHubContentScript {
    constructor() {
      super('slack');
    }

    /**
     * Set up MutationObserver for Slack messages
     */
    setupMessageObserver() {
      // Slack message container selectors
      const messageContainerSelectors = [
        '[role="list"][data-qa="slack_kit_list"]',
        '.c-virtual_list__scroll_container',
        '.c-message_list',
        '[data-qa="slack_kit_scrollbar"]'
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
      console.log('[GhostHub] Observing Slack container:', container);

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
      const existingMessages = container.querySelectorAll('[data-qa="virtual-list-item"]');
      existingMessages.forEach(msg => this.processNode(msg));
    }

    /**
     * Process a DOM node to check if it's a message
     * 
     * @param {Element} node - The node to process
     */
    processNode(node) {
      // Slack message selectors
      const isMessage = node.matches && (
        node.matches('[data-qa="virtual-list-item"]') ||
        node.matches('.c-virtual_list__item') ||
        node.matches('.c-message_kit__message')
      );

      if (isMessage) {
        const messageData = this.extractMessageData(node);
        if (messageData) {
          this.processMessage(messageData);
        }
      }
    }

    /**
     * Extract message data from Slack message element
     * 
     * @param {Element} element - The message element
     * @returns {Object|null} Message data
     */
    extractMessageData(element) {
      try {
        // Extract message ID
        const messageId = element.getAttribute('data-item-key') || 
                         element.id || 
                         `slack-${Date.now()}-${Math.random()}`;

        // Extract timestamp
        const timeElement = element.querySelector('[data-ts], .c-timestamp, time');
        const timestamp = timeElement ? 
          (timeElement.getAttribute('data-ts') || timeElement.dateTime || Date.now()) : 
          Date.now();

        // Extract message text
        const textElement = element.querySelector(
          '.c-message_kit__blocks, .p-rich_text_section, [data-qa="message-text"]'
        );
        const text = textElement ? textElement.textContent.trim() : '';

        if (!text) return null;

        // Extract author
        const authorElement = element.querySelector(
          '.c-message__sender_button, [data-qa="message_sender_name"], .c-message__sender'
        );
        const author = authorElement ? authorElement.textContent.trim() : 'Unknown';

        // Extract channel info
        const channelName = this.getCurrentChannel();

        // Extract code snippets and images
        const codeSnippets = this.extractCodeSnippets(element);
        const images = this.extractImages(element);

        // Check if message is actionable
        const isActionable = this.isActionableMessage(text);

        return {
          id: messageId,
          platform: 'slack',
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
        console.error('[GhostHub] Error extracting Slack message:', error);
        return null;
      }
    }

    /**
     * Get the current Slack channel name
     * 
     * @returns {string} Channel name
     */
    getCurrentChannel() {
      const channelHeader = document.querySelector(
        '[data-qa="channel_name"], .p-channel_sidebar__name, .p-view_header__channel_title'
      );
      return channelHeader ? channelHeader.textContent.trim() : 'unknown-channel';
    }
  }

  // Initialize the Slack content script
  const slackScript = new SlackContentScript();
  slackScript.init();

  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    slackScript.destroy();
  });

})();
