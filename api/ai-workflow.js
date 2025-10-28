/**
 * AI Workflow module
 * Combines Prompt API and Summarizer API to process messages and create issue drafts
 */

import promptAPI from './prompt-api.js';
import summarizerAPI from './summarizer-api.js';
import dbManager from '../storage/indexeddb.js';

class AIWorkflowManager {
  constructor() {
    this.initialized = false;
  }

  /**
   * Initialize all AI APIs
   * @returns {Promise<Object>} Availability status
   */
  async initialize() {
    if (this.initialized) {
      return this.getAvailability();
    }

    console.log('Initializing AI Workflow...');

    const [promptAvailable, summarizerAvailable] = await Promise.all([
      promptAPI.checkAvailability(),
      summarizerAPI.checkAvailability()
    ]);

    this.initialized = true;

    return {
      promptAPI: promptAvailable,
      summarizerAPI: summarizerAvailable,
      ready: promptAvailable && summarizerAvailable
    };
  }

  /**
   * Get availability status of AI APIs
   * @returns {Promise<Object>}
   */
  async getAvailability() {
    return {
      promptAPI: promptAPI.isAvailable,
      summarizerAPI: summarizerAPI.isAvailable,
      ready: promptAPI.isAvailable && summarizerAPI.isAvailable
    };
  }

  /**
   * Process a single message: classify and optionally summarize
   * @param {Object} message - Message object
   * @returns {Promise<Object>} Processing result
   */
  async processMessage(message) {
    await this.initialize();

    try {
      // Step 1: Classify the message
      const classification = await promptAPI.classifyMessage(message);

      // Only process actionable messages
      if (!['bug', 'feature', 'pr_mention'].includes(classification.classification)) {
        console.log('Message is not actionable:', classification.classification);
        return {
          classification,
          actionable: false
        };
      }

      return {
        classification,
        actionable: true
      };
    } catch (error) {
      console.error('Error processing message:', error);
      throw error;
    }
  }

  /**
   * Process a thread: classify first message and summarize all messages
   * @param {Object} thread - Thread object with multiple messages
   * @returns {Promise<Object>} Processing result with issue draft
   */
  async processThread(thread) {
    await this.initialize();

    const { messages, threadId, platform } = thread;

    if (!messages || messages.length === 0) {
      throw new Error('Thread must contain at least one message');
    }

    try {
      // Step 1: Classify the first message to determine thread type
      const firstMessage = messages[0];
      const classification = await promptAPI.classifyMessage({
        ...firstMessage,
        platform,
        timestamp: firstMessage.timestamp || Date.now()
      });

      // Only process actionable threads
      if (!['bug', 'feature', 'pr_mention'].includes(classification.classification)) {
        console.log('Thread is not actionable:', classification.classification);
        return {
          classification,
          actionable: false
        };
      }

      // Step 2: Summarize the thread
      const summary = await summarizerAPI.summarizeThread({
        messages,
        threadId,
        platform
      });

      // Step 3: Create issue draft
      const issueDraft = this._createIssueDraft(classification, summary);

      // Step 4: Store the issue draft
      const issueId = await dbManager.storeIssue(issueDraft);

      return {
        classification,
        summary,
        issueDraft: {
          ...issueDraft,
          id: issueId
        },
        actionable: true
      };
    } catch (error) {
      console.error('Error processing thread:', error);
      throw error;
    }
  }

  /**
   * Process multiple threads in batch
   * @param {Array<Object>} threads - Array of thread objects
   * @returns {Promise<Array<Object>>} Array of processing results
   */
  async processThreads(threads) {
    const results = [];
    
    for (const thread of threads) {
      try {
        const result = await this.processThread(thread);
        results.push(result);
      } catch (error) {
        console.error('Error processing thread:', thread, error);
        results.push({
          threadId: thread.threadId,
          error: error.message,
          actionable: false
        });
      }
    }

    return results;
  }

  /**
   * Create an issue draft from classification and summary
   * @param {Object} classification - Classification result
   * @param {Object} summary - Summary result
   * @returns {Object} Issue draft
   */
  _createIssueDraft(classification, summary) {
    const { classification: type } = classification;
    const { summary: summaryText, messageCount, platform, originalMessages } = summary;

    // Generate issue title
    const title = this._generateIssueTitle(type, summaryText);

    // Generate issue description
    const description = summarizerAPI.createIssueDescription(summary, classification);

    // Generate labels
    const labels = this._generateIssueLabels(type, platform);

    return {
      title,
      description,
      labels,
      type,
      platform,
      messageCount,
      classificationId: classification.id,
      summaryId: summary.id,
      status: 'draft',
      createdAt: Date.now(),
      originalMessages
    };
  }

  /**
   * Generate issue title from type and summary
   * @param {string} type - Issue type (bug, feature, pr_mention)
   * @param {string} summary - Summary text
   * @returns {string} Issue title
   */
  _generateIssueTitle(type, summary) {
    // Extract first sentence or first 80 characters
    const firstSentence = summary.split(/[.!?]\s/)[0];
    const truncated = firstSentence.length > 80 
      ? firstSentence.substring(0, 77) + '...'
      : firstSentence;

    const prefix = type === 'bug' ? '🐛' : type === 'feature' ? '✨' : '🔀';
    
    return `${prefix} ${truncated}`;
  }

  /**
   * Generate issue labels
   * @param {string} type - Issue type
   * @param {string} platform - Platform name
   * @returns {Array<string>} Labels
   */
  _generateIssueLabels(type, platform) {
    const labels = [];
    
    if (type === 'bug') {
      labels.push('bug');
    } else if (type === 'feature') {
      labels.push('enhancement');
    } else if (type === 'pr_mention') {
      labels.push('pr-related');
    }

    labels.push('ghosthub');
    
    if (platform) {
      labels.push(platform.toLowerCase());
    }

    return labels;
  }

  /**
   * Get all actionable messages from storage
   * @returns {Promise<Array<Object>>}
   */
  async getActionableClassifications() {
    const classifications = await dbManager.getClassifications();
    return classifications.filter(c => 
      ['bug', 'feature', 'pr_mention'].includes(c.classification)
    );
  }

  /**
   * Get all issue drafts
   * @param {string} status - Optional status filter
   * @returns {Promise<Array<Object>>}
   */
  async getIssueDrafts(status = null) {
    if (status) {
      return dbManager.getIssues({ status });
    }
    return dbManager.getIssues();
  }

  /**
   * Update issue draft status
   * @param {number} issueId - Issue ID
   * @param {string} status - New status
   * @returns {Promise<void>}
   */
  async updateIssueStatus(issueId, status) {
    await dbManager.updateIssueStatus(issueId, status);
  }

  /**
   * Clean up resources
   */
  async cleanup() {
    await Promise.all([
      promptAPI.destroy(),
      summarizerAPI.destroy()
    ]);
    this.initialized = false;
  }
}

// Export singleton instance
const aiWorkflow = new AIWorkflowManager();
export default aiWorkflow;
