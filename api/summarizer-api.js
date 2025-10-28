/**
 * Summarizer API module for thread summarization
 * Uses Chrome's built-in AI Summarizer API to create concise summaries
 * of multi-message threads for GitHub issue descriptions
 */

import dbManager from '../storage/indexeddb.js';

class SummarizerAPIManager {
  constructor() {
    this.summarizer = null;
    this.isAvailable = false;
  }

  /**
   * Check if Summarizer API is available in the browser
   * @returns {Promise<boolean>}
   */
  async checkAvailability() {
    try {
      if (!window.ai || !window.ai.summarizer) {
        console.warn('Summarizer API not available in this browser');
        this.isAvailable = false;
        return false;
      }

      const capabilities = await window.ai.summarizer.capabilities();
      this.isAvailable = capabilities.available === 'readily';
      
      if (!this.isAvailable) {
        console.warn('Summarizer API not readily available:', capabilities.available);
      }

      return this.isAvailable;
    } catch (error) {
      console.error('Error checking Summarizer API availability:', error);
      this.isAvailable = false;
      return false;
    }
  }

  /**
   * Initialize the Summarizer API
   * @param {Object} options - Summarizer options
   * @returns {Promise<void>}
   */
  async initialize(options = {}) {
    if (this.summarizer) {
      return; // Already initialized
    }

    const available = await this.checkAvailability();
    if (!available) {
      throw new Error('Summarizer API is not available');
    }

    try {
      this.summarizer = await window.ai.summarizer.create({
        type: options.type || 'tl;dr',
        format: options.format || 'markdown',
        length: options.length || 'medium'
      });
      console.log('Summarizer API initialized');
    } catch (error) {
      console.error('Failed to initialize Summarizer API:', error);
      throw error;
    }
  }

  /**
   * Summarize a thread of messages
   * @param {Object} thread - Thread object with messages
   * @returns {Promise<Object>} Summary result
   */
  async summarizeThread(thread) {
    if (!this.summarizer) {
      await this.initialize();
    }

    const { messages, threadId, platform } = thread;

    if (!messages || messages.length === 0) {
      throw new Error('Thread must contain at least one message');
    }

    try {
      // Combine messages into a single text
      const combinedText = this._formatMessagesForSummary(messages);
      
      // Generate summary
      const summary = await this.summarizer.summarize(combinedText);
      
      const result = {
        threadId: threadId || `thread_${Date.now()}`,
        platform: platform || 'unknown',
        messageCount: messages.length,
        originalMessages: messages.map(m => ({
          author: m.author,
          text: m.text,
          timestamp: m.timestamp
        })),
        summary: summary,
        summaryLength: summary.length
      };

      // Store the summary in IndexedDB
      const id = await dbManager.storeSummary(result);
      result.id = id;

      console.log('Thread summarized:', result);
      return result;
    } catch (error) {
      console.error('Error summarizing thread:', error);
      throw error;
    }
  }

  /**
   * Summarize multiple threads in batch
   * @param {Array<Object>} threads - Array of thread objects
   * @returns {Promise<Array<Object>>} Array of summary results
   */
  async summarizeThreads(threads) {
    const results = [];
    
    for (const thread of threads) {
      try {
        const result = await this.summarizeThread(thread);
        results.push(result);
      } catch (error) {
        console.error('Error summarizing thread:', thread, error);
        results.push({
          threadId: thread.threadId,
          error: error.message
        });
      }
    }

    return results;
  }

  /**
   * Format messages for summarization
   * @param {Array<Object>} messages - Array of message objects
   * @returns {string} Formatted text
   */
  _formatMessagesForSummary(messages) {
    const formatted = messages.map((msg, index) => {
      const author = msg.author || 'Unknown';
      const text = msg.text || '';
      const timestamp = msg.timestamp ? new Date(msg.timestamp).toLocaleString() : '';
      
      return `Message ${index + 1} (${author}${timestamp ? ' - ' + timestamp : ''}):\n${text}`;
    }).join('\n\n');

    return formatted;
  }

  /**
   * Create a GitHub issue description from a summary
   * @param {Object} summary - Summary object
   * @param {Object} classification - Classification object
   * @returns {string} GitHub issue description
   */
  createIssueDescription(summary, classification) {
    const { summary: summaryText, messageCount, platform } = summary;
    const { classification: type } = classification;

    let description = '## Summary\n\n';
    description += summaryText + '\n\n';
    
    description += '## Details\n\n';
    description += `- **Type**: ${type}\n`;
    description += `- **Platform**: ${platform}\n`;
    description += `- **Message Count**: ${messageCount}\n\n`;
    
    description += '## Original Messages\n\n';
    summary.originalMessages.forEach((msg, index) => {
      description += `### Message ${index + 1}\n`;
      description += `**Author**: ${msg.author}\n`;
      if (msg.timestamp) {
        description += `**Time**: ${new Date(msg.timestamp).toLocaleString()}\n`;
      }
      description += `\n${msg.text}\n\n`;
    });

    description += '---\n';
    description += '*Generated by GhostHub*';

    return description;
  }

  /**
   * Summarize with streaming (if supported)
   * @param {string} text - Text to summarize
   * @param {Function} onChunk - Callback for each chunk
   * @returns {Promise<string>} Complete summary
   */
  async summarizeStreaming(text, onChunk) {
    if (!this.summarizer) {
      await this.initialize();
    }

    try {
      let fullSummary = '';
      
      // Check if streaming is supported
      if (this.summarizer.summarizeStreaming) {
        const stream = await this.summarizer.summarizeStreaming(text);
        const reader = stream.getReader();
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          fullSummary = value;
          if (onChunk) {
            onChunk(value);
          }
        }
      } else {
        // Fallback to non-streaming
        fullSummary = await this.summarizer.summarize(text);
        if (onChunk) {
          onChunk(fullSummary);
        }
      }

      return fullSummary;
    } catch (error) {
      console.error('Error in streaming summarization:', error);
      throw error;
    }
  }

  /**
   * Destroy the current summarizer
   */
  async destroy() {
    if (this.summarizer) {
      try {
        await this.summarizer.destroy();
        this.summarizer = null;
        console.log('Summarizer API destroyed');
      } catch (error) {
        console.error('Error destroying Summarizer API:', error);
      }
    }
  }
}

// Export singleton instance
const summarizerAPI = new SummarizerAPIManager();
export default summarizerAPI;
