/**
 * Prompt API module for message classification
 * Uses Chrome's built-in AI Prompt API to classify messages as:
 * - bug: Bug reports
 * - feature: Feature requests
 * - pr_mention: PR mentions
 * - other: Other messages (not actionable)
 */

import dbManager from '../storage/indexeddb.js';

class PromptAPIManager {
  constructor() {
    this.session = null;
    this.isAvailable = false;
  }

  /**
   * Check if Prompt API is available in the browser
   * @returns {Promise<boolean>}
   */
  async checkAvailability() {
    try {
      if (!window.ai || !window.ai.languageModel) {
        console.warn('Prompt API not available in this browser');
        this.isAvailable = false;
        return false;
      }

      const capabilities = await window.ai.languageModel.capabilities();
      this.isAvailable = capabilities.available === 'readily';
      
      if (!this.isAvailable) {
        console.warn('Prompt API not readily available:', capabilities.available);
      }

      return this.isAvailable;
    } catch (error) {
      console.error('Error checking Prompt API availability:', error);
      this.isAvailable = false;
      return false;
    }
  }

  /**
   * Initialize the Prompt API session
   * @returns {Promise<void>}
   */
  async initialize() {
    if (this.session) {
      return; // Already initialized
    }

    const available = await this.checkAvailability();
    if (!available) {
      throw new Error('Prompt API is not available');
    }

    try {
      this.session = await window.ai.languageModel.create({
        systemPrompt: this._getSystemPrompt()
      });
      console.log('Prompt API session initialized');
    } catch (error) {
      console.error('Failed to initialize Prompt API session:', error);
      throw error;
    }
  }

  /**
   * Get the system prompt for message classification
   * @returns {string}
   */
  _getSystemPrompt() {
    return `You are a message classifier for developer communications. Your task is to classify messages into one of the following categories:

1. "bug" - Messages reporting bugs, errors, crashes, or unexpected behavior
2. "feature" - Messages requesting new features, enhancements, or improvements
3. "pr_mention" - Messages mentioning pull requests, code reviews, or merge requests
4. "other" - Any other message that doesn't fit the above categories

Respond with ONLY the category name (bug, feature, pr_mention, or other) and a brief confidence score (high, medium, low).

Format your response as: "category: [category], confidence: [confidence]"

Examples:
- "The app crashes when I click the submit button" -> "category: bug, confidence: high"
- "Can we add dark mode to the settings?" -> "category: feature, confidence: high"
- "Please review PR #123" -> "category: pr_mention, confidence: high"
- "What time is the meeting?" -> "category: other, confidence: high"`;
  }

  /**
   * Classify a single message
   * @param {Object} message - Message object with text and metadata
   * @returns {Promise<Object>} Classification result
   */
  async classifyMessage(message) {
    if (!this.session) {
      await this.initialize();
    }

    const { text, platform, author, timestamp } = message;

    try {
      const prompt = `Classify the following message:\n\n"${text}"`;
      const response = await this.session.prompt(prompt);
      
      const classification = this._parseClassificationResponse(response);
      
      const result = {
        messageText: text,
        platform: platform || 'unknown',
        author: author || 'unknown',
        messageTimestamp: timestamp || Date.now(),
        classification: classification.category,
        confidence: classification.confidence,
        rawResponse: response
      };

      // Store the classification in IndexedDB
      const id = await dbManager.storeClassification(result);
      result.id = id;

      console.log('Message classified:', result);
      return result;
    } catch (error) {
      console.error('Error classifying message:', error);
      throw error;
    }
  }

  /**
   * Classify multiple messages in batch
   * @param {Array<Object>} messages - Array of message objects
   * @returns {Promise<Array<Object>>} Array of classification results
   */
  async classifyMessages(messages) {
    const results = [];
    
    for (const message of messages) {
      try {
        const result = await this.classifyMessage(message);
        results.push(result);
      } catch (error) {
        console.error('Error classifying message:', message, error);
        results.push({
          messageText: message.text,
          classification: 'error',
          error: error.message
        });
      }
    }

    return results;
  }

  /**
   * Parse the classification response from the AI
   * @param {string} response - Raw AI response
   * @returns {Object} Parsed classification
   */
  _parseClassificationResponse(response) {
    const categoryMatch = response.match(/category:\s*(bug|feature|pr_mention|other)/i);
    const confidenceMatch = response.match(/confidence:\s*(high|medium|low)/i);

    const category = categoryMatch ? categoryMatch[1].toLowerCase() : 'other';
    const confidence = confidenceMatch ? confidenceMatch[1].toLowerCase() : 'low';

    return { category, confidence };
  }

  /**
   * Get actionable messages (bug, feature, pr_mention)
   * @param {Array<Object>} messages - Array of message objects
   * @returns {Promise<Array<Object>>} Filtered actionable messages
   */
  async getActionableMessages(messages) {
    const classifications = await this.classifyMessages(messages);
    return classifications.filter(
      c => ['bug', 'feature', 'pr_mention'].includes(c.classification)
    );
  }

  /**
   * Destroy the current session
   */
  async destroy() {
    if (this.session) {
      try {
        await this.session.destroy();
        this.session = null;
        console.log('Prompt API session destroyed');
      } catch (error) {
        console.error('Error destroying Prompt API session:', error);
      }
    }
  }
}

// Export singleton instance
const promptAPI = new PromptAPIManager();
export default promptAPI;
