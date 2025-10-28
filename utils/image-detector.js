/**
 * Image Detector Utility
 * Detects and extracts images from chat messages across different platforms
 */

class ImageDetector {
  constructor(platform) {
    this.platform = platform;
    this.selectors = this.getSelectors();
  }

  /**
   * Get platform-specific selectors for images
   * @returns {Object} - Selectors for the platform
   */
  getSelectors() {
    const selectors = {
      slack: {
        images: 'img.c-image__image, img[data-qa="image"], a.c-link[href*="/files/"]',
        messageContainer: '.c-virtual_list__item, .c-message_kit__message',
        attachments: '.c-message_attachment',
        imageLinks: 'a[href*="/files/"]'
      },
      discord: {
        images: 'img[class*="imageWrapper"], a[class*="originalLink"]',
        messageContainer: 'li[id*="chat-messages"]',
        attachments: 'div[class*="messageAttachment"]',
        imageLinks: 'a[class*="imageWrapper"]'
      },
      whatsapp: {
        images: 'img[src*="blob:"], img[class*="message-image"]',
        messageContainer: 'div[data-id]',
        attachments: 'div[class*="media-viewer"]',
        imageLinks: 'a[href*="blob:"]'
      }
    };

    return selectors[this.platform] || selectors.slack;
  }

  /**
   * Detect images in a message element
   * @param {Element} messageElement - The message DOM element
   * @returns {Array} - Array of image objects with src and metadata
   */
  detectImagesInMessage(messageElement) {
    const images = [];
    
    // Find all image elements
    const imageElements = messageElement.querySelectorAll(this.selectors.images);
    
    imageElements.forEach((img, index) => {
      const imageData = this.extractImageData(img, index);
      if (imageData) {
        images.push(imageData);
      }
    });

    return images;
  }

  /**
   * Extract image data from an element
   * @param {Element} element - Image or link element
   * @param {number} index - Index of the image
   * @returns {Object|null} - Image data or null
   */
  extractImageData(element, index) {
    try {
      let src = null;
      let alt = '';
      let type = 'unknown';

      if (element.tagName === 'IMG') {
        src = element.src || element.dataset.src;
        alt = element.alt || '';
        type = 'image';
      } else if (element.tagName === 'A') {
        src = element.href;
        alt = element.textContent || '';
        type = 'link';
      }

      if (!src || src === 'about:blank') {
        return null;
      }

      return {
        src,
        alt,
        type,
        index,
        platform: this.platform,
        timestamp: Date.now(),
        element: element
      };
    } catch (error) {
      console.error('Error extracting image data:', error);
      return null;
    }
  }

  /**
   * Detect images in all messages within a container
   * @param {Element} container - Container element with messages
   * @returns {Array} - Array of all detected images
   */
  detectImagesInContainer(container) {
    const allImages = [];
    const messages = container.querySelectorAll(this.selectors.messageContainer);
    
    messages.forEach((message, msgIndex) => {
      const images = this.detectImagesInMessage(message);
      images.forEach(img => {
        img.messageIndex = msgIndex;
        allImages.push(img);
      });
    });

    return allImages;
  }

  /**
   * Monitor for new images being added to the DOM
   * @param {Element} container - Container to monitor
   * @param {Function} callback - Callback when new images are detected
   * @returns {MutationObserver} - The observer instance
   */
  observeImages(container, callback) {
    const observer = new MutationObserver((mutations) => {
      const newImages = [];
      
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            // Check if the node itself is an image
            if (node.matches && node.matches(this.selectors.images)) {
              const imageData = this.extractImageData(node, 0);
              if (imageData) {
                newImages.push(imageData);
              }
            }
            
            // Check for images within the node
            const images = node.querySelectorAll && 
                          node.querySelectorAll(this.selectors.images);
            if (images && images.length > 0) {
              images.forEach((img, index) => {
                const imageData = this.extractImageData(img, index);
                if (imageData) {
                  newImages.push(imageData);
                }
              });
            }
          }
        });
      });

      if (newImages.length > 0) {
        callback(newImages);
      }
    });

    observer.observe(container, {
      childList: true,
      subtree: true
    });

    return observer;
  }

  /**
   * Download image from URL or extract from DOM
   * @param {Object} imageData - Image data object
   * @returns {Promise<Blob>} - Image as Blob
   */
  async downloadImage(imageData) {
    try {
      // If it's a blob URL, fetch directly
      if (imageData.src.startsWith('blob:')) {
        const response = await fetch(imageData.src);
        return await response.blob();
      }

      // For http/https URLs
      if (imageData.src.startsWith('http')) {
        const response = await fetch(imageData.src, {
          mode: 'cors',
          credentials: 'include'
        });
        return await response.blob();
      }

      // For data URLs
      if (imageData.src.startsWith('data:')) {
        const response = await fetch(imageData.src);
        return await response.blob();
      }

      throw new Error('Unsupported image source type');
    } catch (error) {
      console.error('Error downloading image:', error);
      
      // Fallback: try to get from canvas if element is available
      if (imageData.element && imageData.element.tagName === 'IMG') {
        return this.imageElementToBlob(imageData.element);
      }
      
      throw error;
    }
  }

  /**
   * Convert image element to Blob using canvas
   * @param {HTMLImageElement} img - Image element
   * @returns {Promise<Blob>} - Image as Blob
   */
  imageElementToBlob(img) {
    return new Promise((resolve, reject) => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to convert image to blob'));
          }
        }, 'image/png');
      } catch (error) {
        reject(error);
      }
    });
  }
}

// Export for use in content scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ImageDetector;
}
