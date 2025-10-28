/**
 * Background Service Worker
 * Handles GitHub API calls and manages extension state
 */

// Import GitHub API (in service worker context)
importScripts('github-api.js', 'storage.js');

const githubAPI = new GitHubAPI();

// Initialize token when service worker starts
(async () => {
  try {
    const token = await Storage.getToken();
    if (token) {
      githubAPI.setToken(token);
    }
  } catch (error) {
    console.error('Failed to initialize GitHub token:', error);
  }
})();

/**
 * Message handlers for communication with popup and content scripts
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Handle async responses
  handleMessage(message, sender).then(sendResponse).catch((error) => {
    sendResponse({ success: false, error: error.message });
  });
  
  // Return true to indicate async response
  return true;
});

/**
 * Handle incoming messages
 * @param {Object} message - Message object
 * @param {Object} sender - Message sender
 * @returns {Promise<Object>} Response object
 */
async function handleMessage(message, sender) {
  switch (message.action) {
    case 'verifyAuth':
      return await verifyAuth(message.token);
    
    case 'saveToken':
      return await saveToken(message.token);
    
    case 'removeToken':
      return await removeToken();
    
    case 'listRepositories':
      return await listRepositories(message.options);
    
    case 'saveRepository':
      return await saveRepository(message.repository);
    
    case 'getSettings':
      return await getSettings();
    
    case 'createIssue':
      return await createIssue(message.issueData);
    
    case 'getLabels':
      return await getLabels(message.owner, message.repo);
    
    case 'saveDefaultLabels':
      return await saveDefaultLabels(message.labels);
    
    default:
      throw new Error(`Unknown action: ${message.action}`);
  }
}

/**
 * Verify GitHub authentication
 * @param {string} token - GitHub token
 * @returns {Promise<Object>} Verification result
 */
async function verifyAuth(token) {
  try {
    githubAPI.setToken(token);
    const user = await githubAPI.verifyAuth();
    return {
      success: true,
      user: {
        login: user.login,
        name: user.name,
        avatar_url: user.avatar_url,
        html_url: user.html_url
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Save GitHub token
 * @param {string} token - GitHub token
 * @returns {Promise<Object>} Save result
 */
async function saveToken(token) {
  try {
    await Storage.saveToken(token);
    githubAPI.setToken(token);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Remove GitHub token
 * @returns {Promise<Object>} Remove result
 */
async function removeToken() {
  try {
    await Storage.removeToken();
    githubAPI.setToken(null);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * List accessible repositories
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Repositories list
 */
async function listRepositories(options = {}) {
  try {
    const repos = await githubAPI.listRepositories(options);
    return {
      success: true,
      repositories: repos.map(repo => ({
        id: repo.id,
        name: repo.name,
        fullName: repo.full_name,
        owner: repo.owner.login,
        private: repo.private,
        description: repo.description,
        html_url: repo.html_url
      }))
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Save selected repository
 * @param {Object} repository - Repository info
 * @returns {Promise<Object>} Save result
 */
async function saveRepository(repository) {
  try {
    await Storage.saveRepository(repository);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get all settings
 * @returns {Promise<Object>} Settings
 */
async function getSettings() {
  try {
    const settings = await Storage.getAllSettings();
    return {
      success: true,
      settings: settings
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Create a GitHub issue
 * @param {Object} issueData - Issue data
 * @returns {Promise<Object>} Created issue
 */
async function createIssue(issueData) {
  try {
    // Get repository from settings if not provided
    let owner = issueData.owner;
    let repo = issueData.repo;
    
    if (!owner || !repo) {
      const repository = await Storage.getRepository();
      if (!repository) {
        throw new Error('No repository selected. Please configure a repository first.');
      }
      owner = repository.owner;
      repo = repository.name;
    }
    
    // Get default labels if not provided
    if (!issueData.labels || issueData.labels.length === 0) {
      issueData.labels = await Storage.getDefaultLabels();
    }
    
    const issue = await githubAPI.createIssue(owner, repo, issueData);
    
    return {
      success: true,
      issue: {
        id: issue.id,
        number: issue.number,
        title: issue.title,
        body: issue.body,
        state: issue.state,
        html_url: issue.html_url,
        labels: issue.labels,
        created_at: issue.created_at
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get repository labels
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @returns {Promise<Object>} Labels list
 */
async function getLabels(owner, repo) {
  try {
    const labels = await githubAPI.getLabels(owner, repo);
    return {
      success: true,
      labels: labels.map(label => ({
        id: label.id,
        name: label.name,
        color: label.color,
        description: label.description
      }))
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Save default labels
 * @param {Array<string>} labels - Default labels
 * @returns {Promise<Object>} Save result
 */
async function saveDefaultLabels(labels) {
  try {
    await Storage.saveDefaultLabels(labels);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// Log when service worker is activated
console.log('GhostHub background service worker activated');
