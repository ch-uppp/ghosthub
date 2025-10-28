/**
 * Message Analyzer
 * Combines text and image analysis to create comprehensive summaries
 */

class MessageAnalyzer {
  constructor() {
    this.textAnalyzer = null;
    this.multimodalAI = null;
  }

  /**
   * Initialize the analyzer with AI capabilities
   * @returns {Promise<boolean>} - Success status
   */
  async initialize() {
    try {
      // Initialize multimodal AI if available
      if (typeof MultimodalAI !== 'undefined') {
        this.multimodalAI = new MultimodalAI();
        await this.multimodalAI.initialize();
      }
      return true;
    } catch (error) {
      console.error('Failed to initialize message analyzer:', error);
      return false;
    }
  }

  /**
   * Analyze a message with text and images
   * @param {Object} messageData - Message data with text and images
   * @returns {Promise<Object>} - Analysis results
   */
  async analyzeMessage(messageData) {
    const analysis = {
      text: messageData.text || '',
      images: [],
      hasErrors: false,
      errors: [],
      summary: '',
      context: '',
      type: 'unknown' // bug, feature, pr-mention, general
    };

    // Analyze images if present
    if (messageData.images && messageData.images.length > 0 && this.multimodalAI) {
      analysis.images = await this.analyzeImages(messageData.images);
      
      // Extract errors from images
      analysis.images.forEach(img => {
        if (img.errors && img.errors.length > 0) {
          analysis.hasErrors = true;
          analysis.errors.push(...img.errors);
        }
      });
    }

    // Classify message type
    analysis.type = this.classifyMessage(analysis);

    // Generate summary combining text and image analysis
    analysis.summary = await this.generateSummary(analysis);

    return analysis;
  }

  /**
   * Analyze multiple images
   * @param {Array} images - Array of image data
   * @returns {Promise<Array>} - Analysis results for each image
   */
  async analyzeImages(images) {
    const results = [];
    
    for (const image of images) {
      try {
        const result = await this.multimodalAI.processImage(image.src || image);
        results.push({
          ...result,
          originalImage: image
        });
      } catch (error) {
        console.error('Error analyzing image:', error);
        results.push({
          error: error.message,
          text: '',
          context: '',
          errors: [],
          originalImage: image
        });
      }
    }
    
    return results;
  }

  /**
   * Classify message type based on content
   * @param {Object} analysis - Analysis object
   * @returns {string} - Message type
   */
  classifyMessage(analysis) {
    const text = analysis.text.toLowerCase();
    const hasErrors = analysis.hasErrors;
    
    // Check for bug indicators
    if (hasErrors || 
        text.includes('error') || 
        text.includes('bug') || 
        text.includes('broken') ||
        text.includes('crash') ||
        text.includes('issue') ||
        text.includes('not working')) {
      return 'bug';
    }
    
    // Check for feature request indicators
    if (text.includes('feature') ||
        text.includes('enhancement') ||
        text.includes('should add') ||
        text.includes('would be nice') ||
        text.includes('request')) {
      return 'feature';
    }
    
    // Check for PR mentions
    if (text.includes('pr') ||
        text.includes('pull request') ||
        text.includes('merge')) {
      return 'pr-mention';
    }
    
    return 'general';
  }

  /**
   * Generate comprehensive summary
   * @param {Object} analysis - Analysis object
   * @returns {Promise<string>} - Summary text
   */
  async generateSummary(analysis) {
    let summary = '';
    
    // Add text content
    if (analysis.text) {
      summary += `**Message:**\n${analysis.text}\n\n`;
    }
    
    // Add image analysis
    if (analysis.images && analysis.images.length > 0) {
      summary += `**Screenshots Analysis:**\n`;
      
      analysis.images.forEach((img, index) => {
        if (img.context) {
          summary += `\nImage ${index + 1}: ${img.context}\n`;
        }
        
        if (img.text) {
          summary += `- Visible Text: ${img.text}\n`;
        }
        
        if (img.errors && img.errors.length > 0) {
          summary += `- Errors Found:\n`;
          img.errors.forEach(err => {
            summary += `  - ${err}\n`;
          });
        }
      });
      
      summary += '\n';
    }
    
    // Add error summary if present
    if (analysis.errors.length > 0) {
      summary += `**Detected Errors:**\n`;
      analysis.errors.forEach(err => {
        summary += `- ${err}\n`;
      });
    }
    
    return summary.trim();
  }

  /**
   * Create GitHub issue data from analysis
   * @param {Object} analysis - Analysis object
   * @returns {Object} - GitHub issue structure
   */
  createIssueData(analysis) {
    const issueData = {
      title: this.generateTitle(analysis),
      body: analysis.summary,
      labels: this.suggestLabels(analysis)
    };
    
    return issueData;
  }

  /**
   * Generate issue title
   * @param {Object} analysis - Analysis object
   * @returns {string} - Title
   */
  generateTitle(analysis) {
    // Extract first line of text or use type
    let title = '';
    
    if (analysis.text) {
      const firstLine = analysis.text.split('\n')[0];
      title = firstLine.substring(0, 80);
    }
    
    // Add prefix based on type
    if (analysis.type === 'bug') {
      title = `Bug: ${title}`;
    } else if (analysis.type === 'feature') {
      title = `Feature: ${title}`;
    }
    
    // If title is empty, use generic title
    if (!title || title.trim() === '') {
      title = analysis.type === 'bug' ? 'Bug Report from Chat' : 'Issue from Chat';
    }
    
    return title;
  }

  /**
   * Suggest labels based on analysis
   * @param {Object} analysis - Analysis object
   * @returns {Array} - Label suggestions
   */
  suggestLabels(analysis) {
    const labels = [];
    
    if (analysis.type === 'bug') {
      labels.push('bug');
    } else if (analysis.type === 'feature') {
      labels.push('enhancement');
    }
    
    if (analysis.hasErrors) {
      labels.push('error');
    }
    
    if (analysis.images && analysis.images.length > 0) {
      labels.push('has-screenshot');
    }
    
    return labels;
  }

  /**
   * Clean up resources
   */
  async destroy() {
    if (this.multimodalAI) {
      await this.multimodalAI.destroy();
    }
  }
}

// Export for use in content scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MessageAnalyzer;
}
