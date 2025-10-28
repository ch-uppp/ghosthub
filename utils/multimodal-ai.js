/**
 * Multimodal AI Utility
 * Handles image processing using Chrome's built-in Multimodal API
 * Extracts text, errors, and contextual information from screenshots
 */

class MultimodalAI {
  constructor() {
    this.session = null;
  }

  /**
   * Initialize the multimodal AI session
   * @returns {Promise<boolean>} - True if initialized successfully
   */
  async initialize() {
    try {
      // Check if the Multimodal API is available
      if (!window.ai || !window.ai.languageModel) {
        console.warn('Chrome Multimodal API not available');
        return false;
      }

      const capabilities = await window.ai.languageModel.capabilities();
      
      if (capabilities.available === 'no') {
        console.warn('Multimodal AI not available');
        return false;
      }

      // Create a session with multimodal capabilities
      this.session = await window.ai.languageModel.create({
        systemPrompt: `You are an expert at analyzing screenshots and images from developer chats.
Your task is to extract:
1. Any error messages, stack traces, or error codes
2. UI/UX issues visible in the screenshot
3. Code snippets or technical content
4. Any text that provides context for bug reports or feature requests

Format your response as:
ERROR: [list any errors found]
TEXT: [list any visible text]
CONTEXT: [describe what the image shows and its relevance]

Be concise and focus on actionable technical details.`
      });

      return true;
    } catch (error) {
      console.error('Failed to initialize Multimodal AI:', error);
      return false;
    }
  }

  /**
   * Process an image and extract text/errors
   * @param {string|Blob|File} imageSource - Image URL, Blob, or File object
   * @returns {Promise<Object>} - Extracted information
   */
  async processImage(imageSource) {
    try {
      if (!this.session) {
        const initialized = await this.initialize();
        if (!initialized) {
          return {
            error: 'Multimodal AI not available',
            text: '',
            context: '',
            errors: []
          };
        }
      }

      // Convert image to data URL if needed
      let imageData;
      if (typeof imageSource === 'string') {
        // If it's already a URL, fetch it
        imageData = await this.fetchImageAsDataURL(imageSource);
      } else if (imageSource instanceof Blob || imageSource instanceof File) {
        imageData = await this.blobToDataURL(imageSource);
      } else {
        throw new Error('Invalid image source type');
      }

      // Send image to multimodal API for analysis
      const response = await this.session.prompt(
        `Analyze this screenshot from a developer chat. Extract any errors, text content, and context that would be useful for creating a GitHub issue.`,
        { image: imageData }
      );

      // Parse the response
      return this.parseMultimodalResponse(response);
    } catch (error) {
      console.error('Error processing image:', error);
      return {
        error: error.message,
        text: '',
        context: '',
        errors: []
      };
    }
  }

  /**
   * Process multiple images
   * @param {Array} images - Array of image sources
   * @returns {Promise<Array>} - Array of extracted information
   */
  async processImages(images) {
    const results = [];
    for (const image of images) {
      const result = await this.processImage(image);
      results.push(result);
    }
    return results;
  }

  /**
   * Parse the multimodal API response
   * @param {string} response - Raw response from API
   * @returns {Object} - Structured data
   */
  parseMultimodalResponse(response) {
    const result = {
      text: '',
      context: '',
      errors: [],
      rawResponse: response
    };

    // Extract errors
    const errorMatch = response.match(/ERROR:\s*(.+?)(?=TEXT:|CONTEXT:|$)/s);
    if (errorMatch) {
      const errorText = errorMatch[1].trim();
      if (errorText && errorText !== '[]' && errorText.toLowerCase() !== 'none') {
        result.errors = errorText.split('\n')
          .map(e => e.trim())
          .filter(e => e && e !== '-');
      }
    }

    // Extract text content
    const textMatch = response.match(/TEXT:\s*(.+?)(?=CONTEXT:|ERROR:|$)/s);
    if (textMatch) {
      result.text = textMatch[1].trim();
    }

    // Extract context
    const contextMatch = response.match(/CONTEXT:\s*(.+?)$/s);
    if (contextMatch) {
      result.context = contextMatch[1].trim();
    }

    return result;
  }

  /**
   * Fetch image from URL and convert to data URL
   * @param {string} url - Image URL
   * @returns {Promise<string>} - Data URL
   */
  async fetchImageAsDataURL(url) {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return await this.blobToDataURL(blob);
    } catch (error) {
      console.error('Error fetching image:', error);
      throw error;
    }
  }

  /**
   * Convert Blob to data URL
   * @param {Blob} blob - Image blob
   * @returns {Promise<string>} - Data URL
   */
  blobToDataURL(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Destroy the session
   */
  async destroy() {
    if (this.session) {
      await this.session.destroy();
      this.session = null;
    }
  }
}

// Export for use in content scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MultimodalAI;
}
