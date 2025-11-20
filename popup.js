/**
 * Popup UI Script
 * Handles user interactions and communication with background service worker
 */

// DOM Elements
const elements = {
  // Authentication
  notAuthenticated: document.getElementById('not-authenticated'),
  authenticated: document.getElementById('authenticated'),
  tokenInput: document.getElementById('token-input'),
  verifyBtn: document.getElementById('verify-btn'),
  disconnectBtn: document.getElementById('disconnect-btn'),
  authError: document.getElementById('auth-error'),
  userAvatar: document.getElementById('user-avatar'),
  userName: document.getElementById('user-name'),
  userLogin: document.getElementById('user-login'),
  
  // Repository
  repoSection: document.getElementById('repo-section'),
  repoSelect: document.getElementById('repo-select'),
  saveRepoBtn: document.getElementById('save-repo-btn'),
  repoSuccess: document.getElementById('repo-success'),
  repoError: document.getElementById('repo-error'),
  
  // Labels
  labelsSection: document.getElementById('labels-section'),
  labelsInput: document.getElementById('labels-input'),
  saveLabelsBtn: document.getElementById('save-labels-btn'),
  labelsSuccess: document.getElementById('labels-success'),
  
  // Issue Assignment Settings
  assigneeSection: document.getElementById('assignee-section'),
  autoAssignToggle: document.getElementById('auto-assign-toggle'),
  saveAssigneeBtn: document.getElementById('save-assignee-btn'),
  assigneeSuccess: document.getElementById('assignee-success'),
  
  // Test
  testSection: document.getElementById('test-section'),
  testTitle: document.getElementById('test-title'),
  testDescription: document.getElementById('test-description'),
  createTestIssueBtn: document.getElementById('create-test-issue-btn'),
  testSuccess: document.getElementById('test-success'),
  testError: document.getElementById('test-error')
};

// State
let currentUser = null;
let repositories = [];

/**
 * Initialize popup
 */
async function init() {
  // Load saved settings
  await loadSettings();
  
  // Setup event listeners
  setupEventListeners();
}

/**
 * Load saved settings
 */
async function loadSettings() {
  try {
    const response = await sendMessage({ action: 'getSettings' });
    
    if (response.success && response.settings.githubToken) {
      // User is authenticated, verify token
      await verifyExistingToken(response.settings.githubToken);
    }
  } catch (error) {
    console.error('Failed to load settings:', error);
  }
}

/**
 * Verify existing token
 */
async function verifyExistingToken(token) {
  try {
    const response = await sendMessage({ 
      action: 'verifyAuth', 
      token: token 
    });
    
    if (response.success) {
      showAuthenticated(response.user);
      await loadRepositories();
    } else {
      showNotAuthenticated();
    }
  } catch (error) {
    console.error('Failed to verify token:', error);
    showNotAuthenticated();
  }
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  elements.verifyBtn.addEventListener('click', handleVerifyToken);
  elements.disconnectBtn.addEventListener('click', handleDisconnect);
  elements.saveRepoBtn.addEventListener('click', handleSaveRepository);
  elements.saveLabelsBtn.addEventListener('click', handleSaveLabels);
  elements.saveAssigneeBtn.addEventListener('click', handleSaveAssignee);
  elements.createTestIssueBtn.addEventListener('click', handleCreateTestIssue);
  
  // Allow Enter key to verify token
  elements.tokenInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      handleVerifyToken();
    }
  });
}

/**
 * Handle verify token button click
 */
async function handleVerifyToken() {
  const token = elements.tokenInput.value.trim();
  
  if (!token) {
    showError(elements.authError, 'Please enter a GitHub token');
    return;
  }
  
  setLoading(elements.verifyBtn, true);
  hideMessage(elements.authError);
  
  try {
    const response = await sendMessage({ 
      action: 'verifyAuth', 
      token: token 
    });
    
    if (response.success) {
      // Save token
      await sendMessage({ action: 'saveToken', token: token });
      
      // Show authenticated state
      showAuthenticated(response.user);
      
      // Load repositories
      await loadRepositories();
      
      // Clear token input
      elements.tokenInput.value = '';
    } else {
      showError(elements.authError, response.error || 'Authentication failed');
    }
  } catch (error) {
    showError(elements.authError, error.message);
  } finally {
    setLoading(elements.verifyBtn, false);
  }
}

/**
 * Handle disconnect button click
 */
async function handleDisconnect() {
  setLoading(elements.disconnectBtn, true);
  
  try {
    await sendMessage({ action: 'removeToken' });
    showNotAuthenticated();
  } catch (error) {
    showError(elements.authError, error.message);
  } finally {
    setLoading(elements.disconnectBtn, false);
  }
}

/**
 * Load repositories
 */
async function loadRepositories() {
  elements.repoSelect.innerHTML = '<option value="">Loading repositories...</option>';
  
  try {
    const response = await sendMessage({ 
      action: 'listRepositories',
      options: { per_page: 100 }
    });
    
    if (response.success) {
      repositories = response.repositories;
      populateRepositorySelect(repositories);
      
      // Load saved repository selection
      const settings = await sendMessage({ action: 'getSettings' });
      if (settings.success && settings.settings.selectedRepository) {
        elements.repoSelect.value = settings.settings.selectedRepository.fullName;
      }
      
      // Load saved labels
      if (settings.success && settings.settings.defaultLabels) {
        elements.labelsInput.value = settings.settings.defaultLabels.join(', ');
      }
      
      // Load saved auto-assign setting
      if (settings.success) {
        elements.autoAssignToggle.checked = settings.settings.autoAssignCopilot || false;
      }
    } else {
      showError(elements.repoError, response.error || 'Failed to load repositories');
    }
  } catch (error) {
    showError(elements.repoError, error.message);
  }
}

/**
 * Populate repository select dropdown
 */
function populateRepositorySelect(repos) {
  elements.repoSelect.innerHTML = '<option value="">Select a repository...</option>';
  
  repos.forEach(repo => {
    const option = document.createElement('option');
    option.value = repo.fullName;
    option.textContent = `${repo.fullName}${repo.private ? ' 🔒' : ''}`;
    option.dataset.owner = repo.owner;
    option.dataset.name = repo.name;
    elements.repoSelect.appendChild(option);
  });
}

/**
 * Handle save repository button click
 */
async function handleSaveRepository() {
  const selectedValue = elements.repoSelect.value;
  
  if (!selectedValue) {
    showError(elements.repoError, 'Please select a repository');
    return;
  }
  
  const selectedOption = elements.repoSelect.options[elements.repoSelect.selectedIndex];
  const repository = {
    fullName: selectedValue,
    owner: selectedOption.dataset.owner,
    name: selectedOption.dataset.name
  };
  
  setLoading(elements.saveRepoBtn, true);
  hideMessage(elements.repoError);
  hideMessage(elements.repoSuccess);
  
  try {
    const response = await sendMessage({ 
      action: 'saveRepository', 
      repository: repository 
    });
    
    if (response.success) {
      showSuccess(elements.repoSuccess, 'Repository saved successfully!');
    } else {
      showError(elements.repoError, response.error || 'Failed to save repository');
    }
  } catch (error) {
    showError(elements.repoError, error.message);
  } finally {
    setLoading(elements.saveRepoBtn, false);
  }
}

/**
 * Handle save labels button click
 */
async function handleSaveLabels() {
  const labelsText = elements.labelsInput.value.trim();
  const labels = labelsText ? labelsText.split(',').map(l => l.trim()).filter(l => l) : [];
  
  setLoading(elements.saveLabelsBtn, true);
  hideMessage(elements.labelsSuccess);
  
  try {
    const response = await sendMessage({ 
      action: 'saveDefaultLabels', 
      labels: labels 
    });
    
    if (response.success) {
      showSuccess(elements.labelsSuccess, 'Labels saved successfully!');
    } else {
      showError(elements.labelsSuccess, response.error || 'Failed to save labels');
    }
  } catch (error) {
    showError(elements.labelsSuccess, error.message);
  } finally {
    setLoading(elements.saveLabelsBtn, false);
  }
}

/**
 * Handle save assignee button click
 */
async function handleSaveAssignee() {
  const autoAssign = elements.autoAssignToggle.checked;
  
  setLoading(elements.saveAssigneeBtn, true);
  hideMessage(elements.assigneeSuccess);
  
  try {
    const response = await sendMessage({ 
      action: 'saveAutoAssignCopilot', 
      enabled: autoAssign 
    });
    
    if (response.success) {
      showSuccess(elements.assigneeSuccess, 'Assignment setting saved successfully!');
    } else {
      showError(elements.assigneeSuccess, response.error || 'Failed to save assignment setting');
    }
  } catch (error) {
    showError(elements.assigneeSuccess, error.message);
  } finally {
    setLoading(elements.saveAssigneeBtn, false);
  }
}

/**
 * Handle create test issue button click
 */
async function handleCreateTestIssue() {
  const title = elements.testTitle.value.trim();
  const body = elements.testDescription.value.trim();
  
  if (!title) {
    showError(elements.testError, 'Please enter an issue title');
    return;
  }
  
  setLoading(elements.createTestIssueBtn, true);
  hideMessage(elements.testError);
  hideMessage(elements.testSuccess);
  
  try {
    const response = await sendMessage({ 
      action: 'createIssue',
      issueData: {
        title: title,
        body: body
      }
    });
    
    if (response.success) {
      const issue = response.issue;
      const message = `Issue created successfully! <a href="${issue.html_url}" target="_blank">#${issue.number}</a>`;
      elements.testSuccess.innerHTML = message;
      elements.testSuccess.style.display = 'block';
    } else {
      showError(elements.testError, response.error || 'Failed to create issue');
    }
  } catch (error) {
    showError(elements.testError, error.message);
  } finally {
    setLoading(elements.createTestIssueBtn, false);
  }
}

/**
 * Show authenticated state
 */
function showAuthenticated(user) {
  currentUser = user;
  
  elements.notAuthenticated.style.display = 'none';
  elements.authenticated.style.display = 'block';
  elements.repoSection.style.display = 'block';
  elements.labelsSection.style.display = 'block';
  elements.assigneeSection.style.display = 'block';
  elements.testSection.style.display = 'block';
  
  elements.userAvatar.src = user.avatar_url;
  elements.userName.textContent = user.name || user.login;
  elements.userLogin.textContent = `@${user.login}`;
}

/**
 * Show not authenticated state
 */
function showNotAuthenticated() {
  currentUser = null;
  
  elements.notAuthenticated.style.display = 'block';
  elements.authenticated.style.display = 'none';
  elements.repoSection.style.display = 'none';
  elements.labelsSection.style.display = 'none';
  elements.assigneeSection.style.display = 'none';
  elements.testSection.style.display = 'none';
}

/**
 * Send message to background script
 */
function sendMessage(message) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, (response) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve(response);
      }
    });
  });
}

/**
 * Show error message
 */
function showError(element, message) {
  element.textContent = message;
  element.style.display = 'block';
}

/**
 * Show success message
 */
function showSuccess(element, message) {
  element.textContent = message;
  element.style.display = 'block';
  
  // Auto-hide after 3 seconds
  setTimeout(() => {
    element.style.display = 'none';
  }, 3000);
}

/**
 * Hide message
 */
function hideMessage(element) {
  element.style.display = 'none';
}

/**
 * Set loading state for button
 */
function setLoading(button, loading) {
  if (loading) {
    button.disabled = true;
    button.dataset.originalText = button.textContent;
    button.textContent = 'Loading...';
  } else {
    button.disabled = false;
    button.textContent = button.dataset.originalText || button.textContent;
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
