/**
 * Storage utilities for managing GitHub credentials and settings
 * Uses Chrome's storage.sync API for cross-device synchronization
 */

const Storage = {
  /**
   * Save GitHub token
   * @param {string} token - GitHub Personal Access Token or OAuth token
   * @returns {Promise<void>}
   */
  async saveToken(token) {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.set({ githubToken: token }, () => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve();
        }
      });
    });
  },

  /**
   * Get GitHub token
   * @returns {Promise<string|null>} Token or null if not set
   */
  async getToken() {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.get(['githubToken'], (result) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(result.githubToken || null);
        }
      });
    });
  },

  /**
   * Remove GitHub token
   * @returns {Promise<void>}
   */
  async removeToken() {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.remove(['githubToken'], () => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve();
        }
      });
    });
  },

  /**
   * Save selected repository
   * @param {Object} repo - Repository info
   * @param {string} repo.owner - Repository owner
   * @param {string} repo.name - Repository name
   * @param {string} repo.fullName - Full repository name (owner/repo)
   * @returns {Promise<void>}
   */
  async saveRepository(repo) {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.set({ selectedRepository: repo }, () => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve();
        }
      });
    });
  },

  /**
   * Get selected repository
   * @returns {Promise<Object|null>} Repository info or null if not set
   */
  async getRepository() {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.get(['selectedRepository'], (result) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(result.selectedRepository || null);
        }
      });
    });
  },

  /**
   * Save default labels
   * @param {Array<string>} labels - Default labels to apply to issues
   * @returns {Promise<void>}
   */
  async saveDefaultLabels(labels) {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.set({ defaultLabels: labels }, () => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve();
        }
      });
    });
  },

  /**
   * Get default labels
   * @returns {Promise<Array<string>>} Default labels
   */
  async getDefaultLabels() {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.get(['defaultLabels'], (result) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(result.defaultLabels || []);
        }
      });
    });
  },

  /**
   * Save auto-assign Copilot setting
   * @param {boolean} enabled - Whether to auto-assign Copilot
   * @returns {Promise<void>}
   */
  async saveAutoAssignCopilot(enabled) {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.set({ autoAssignCopilot: enabled }, () => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve();
        }
      });
    });
  },

  /**
   * Get auto-assign Copilot setting
   * @returns {Promise<boolean>} Whether to auto-assign Copilot
   */
  async getAutoAssignCopilot() {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.get(['autoAssignCopilot'], (result) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(result.autoAssignCopilot || false);
        }
      });
    });
  },

  /**
   * Save all settings at once
   * @param {Object} settings - Settings object
   * @returns {Promise<void>}
   */
  async saveSettings(settings) {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.set(settings, () => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve();
        }
      });
    });
  },

  /**
   * Get all settings
   * @returns {Promise<Object>} All settings
   */
  async getAllSettings() {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.get(null, (result) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(result);
        }
      });
    });
  },

  /**
   * Clear all settings
   * @returns {Promise<void>}
   */
  async clearAll() {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.clear(() => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve();
        }
      });
    });
  }
};

// Export for use in extension
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Storage;
}
