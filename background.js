/**
 * GhostHub Background Service Worker
 * Handles GitHub API integration and issue creation
 */

// Store configuration
let config = {
  githubToken: null,
  githubRepo: null,
  githubOwner: null
};

// Load configuration from storage
chrome.storage.local.get(['githubToken', 'githubRepo', 'githubOwner'], (result) => {
  config = { ...config, ...result };
  console.log('[GhostHub] Configuration loaded');
});

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('[GhostHub] Received message:', request.type);

  if (request.type === 'CREATE_ISSUE') {
    handleCreateIssue(request.data, sender)
      .then(result => sendResponse({ success: true, data: result }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Keep channel open for async response
  }

  if (request.type === 'SAVE_CONFIG') {
    handleSaveConfig(request.data)
      .then(() => sendResponse({ success: true }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }

  if (request.type === 'GET_CONFIG') {
    sendResponse({ success: true, data: config });
    return true;
  }
});

/**
 * Handle issue creation request
 * @param {Object} data - Issue data from content script
 * @param {Object} sender - Sender information
 * @returns {Promise<Object>} - Created issue data
 */
async function handleCreateIssue(data, sender) {
  try {
    console.log('[GhostHub] Creating GitHub issue...');

    // Validate configuration
    if (!config.githubToken || !config.githubRepo || !config.githubOwner) {
      throw new Error('GitHub configuration not set. Please configure in extension popup.');
    }

    // Prepare issue data
    const issueData = prepareIssueData(data.analysis);

    // Create draft issue (stored locally)
    const draft = {
      ...issueData,
      source: data.source,
      timestamp: data.timestamp,
      status: 'draft'
    };

    // Store draft
    await storeDraft(draft);

    // Open popup for approval
    chrome.action.openPopup();

    return draft;
  } catch (error) {
    console.error('[GhostHub] Error creating issue:', error);
    throw error;
  }
}

/**
 * Prepare issue data from analysis
 * @param {Object} analysis - Message analysis
 * @returns {Object} - GitHub issue data
 */
function prepareIssueData(analysis) {
  const title = generateTitle(analysis);
  const body = analysis.summary || analysis.text || 'No description provided';
  const labels = suggestLabels(analysis);

  return {
    title,
    body,
    labels
  };
}

/**
 * Generate issue title
 * @param {Object} analysis - Message analysis
 * @returns {string} - Issue title
 */
function generateTitle(analysis) {
  let title = '';

  // Extract first meaningful line
  if (analysis.text) {
    const lines = analysis.text.split('\n').filter(line => line.trim().length > 0);
    if (lines.length > 0) {
      title = lines[0].substring(0, 80);
    }
  }

  // Add prefix based on type
  if (analysis.type === 'bug') {
    title = title ? `Bug: ${title}` : 'Bug Report from Chat';
  } else if (analysis.type === 'feature') {
    title = title ? `Feature: ${title}` : 'Feature Request from Chat';
  } else if (!title) {
    title = 'Issue from Chat';
  }

  return title;
}

/**
 * Suggest labels based on analysis
 * @param {Object} analysis - Message analysis
 * @returns {Array<string>} - Suggested labels
 */
function suggestLabels(analysis) {
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
 * Store draft issue
 * @param {Object} draft - Draft issue data
 * @returns {Promise<void>}
 */
async function storeDraft(draft) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(['drafts'], (result) => {
      const drafts = result.drafts || [];
      drafts.push(draft);

      chrome.storage.local.set({ drafts }, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          console.log('[GhostHub] Draft stored');
          resolve();
        }
      });
    });
  });
}

/**
 * Create GitHub issue via API
 * @param {Object} issueData - Issue data
 * @returns {Promise<Object>} - Created issue
 */
async function createGitHubIssue(issueData) {
  const url = `https://api.github.com/repos/${config.githubOwner}/${config.githubRepo}/issues`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Accept': 'application/vnd.github.v3+json',
      'Authorization': `token ${config.githubToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title: issueData.title,
      body: issueData.body,
      labels: issueData.labels
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create GitHub issue');
  }

  return await response.json();
}

/**
 * Handle configuration save
 * @param {Object} data - Configuration data
 * @returns {Promise<void>}
 */
async function handleSaveConfig(data) {
  return new Promise((resolve, reject) => {
    const newConfig = {
      githubToken: data.githubToken || config.githubToken,
      githubRepo: data.githubRepo || config.githubRepo,
      githubOwner: data.githubOwner || config.githubOwner
    };

    chrome.storage.local.set(newConfig, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        config = newConfig;
        console.log('[GhostHub] Configuration saved');
        resolve();
      }
    });
  });
}

/**
 * Export function to create issue (called from popup)
 * @param {Object} draft - Draft issue
 * @returns {Promise<Object>} - Created issue
 */
async function publishIssue(draft) {
  return await createGitHubIssue(draft);
}

// Extension installation handler
chrome.runtime.onInstalled.addListener((details) => {
  console.log('[GhostHub] Extension installed:', details.reason);
  
  if (details.reason === 'install') {
    // Open options page on first install
    chrome.runtime.openOptionsPage();
  }
});

// Export for popup
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { publishIssue, createGitHubIssue };
}
