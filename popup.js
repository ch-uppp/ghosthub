/**
 * GhostHub Popup Script
 * Handles UI interactions for configuration and draft management
 */

document.addEventListener('DOMContentLoaded', async () => {
  console.log('[GhostHub] Popup loaded');

  // Load configuration
  await loadConfiguration();

  // Load drafts
  await loadDrafts();

  // Setup event listeners
  setupEventListeners();
});

/**
 * Setup event listeners
 */
function setupEventListeners() {
  document.getElementById('saveConfig').addEventListener('click', saveConfiguration);
  
  // Auto-save configuration on input change
  ['githubOwner', 'githubRepo', 'githubToken'].forEach(id => {
    document.getElementById(id).addEventListener('change', saveConfiguration);
  });
}

/**
 * Load configuration from storage
 */
async function loadConfiguration() {
  try {
    const result = await chrome.storage.local.get(['githubOwner', 'githubRepo', 'githubToken']);
    
    if (result.githubOwner) {
      document.getElementById('githubOwner').value = result.githubOwner;
    }
    if (result.githubRepo) {
      document.getElementById('githubRepo').value = result.githubRepo;
    }
    if (result.githubToken) {
      document.getElementById('githubToken').value = result.githubToken;
    }

    console.log('[GhostHub] Configuration loaded');
  } catch (error) {
    console.error('[GhostHub] Error loading configuration:', error);
    showStatus('Error loading configuration', 'error');
  }
}

/**
 * Save configuration to storage
 */
async function saveConfiguration() {
  try {
    const config = {
      githubOwner: document.getElementById('githubOwner').value.trim(),
      githubRepo: document.getElementById('githubRepo').value.trim(),
      githubToken: document.getElementById('githubToken').value.trim()
    };

    // Validate
    if (!config.githubOwner || !config.githubRepo || !config.githubToken) {
      showStatus('Please fill in all fields', 'error');
      return;
    }

    // Save to storage
    await chrome.storage.local.set(config);

    // Notify background script
    chrome.runtime.sendMessage({
      type: 'SAVE_CONFIG',
      data: config
    });

    showStatus('Configuration saved successfully!', 'success');
    console.log('[GhostHub] Configuration saved');
  } catch (error) {
    console.error('[GhostHub] Error saving configuration:', error);
    showStatus('Error saving configuration', 'error');
  }
}

/**
 * Load draft issues from storage
 */
async function loadDrafts() {
  try {
    const result = await chrome.storage.local.get(['drafts']);
    const drafts = result.drafts || [];

    const draftList = document.getElementById('draftList');
    
    if (drafts.length === 0) {
      draftList.innerHTML = `
        <div class="empty-state">
          <p>No draft issues yet</p>
          <p>Monitor chats and click "Create Issue" to get started</p>
        </div>
      `;
      return;
    }

    // Clear and populate
    draftList.innerHTML = '';
    
    drafts.forEach((draft, index) => {
      const draftElement = createDraftElement(draft, index);
      draftList.appendChild(draftElement);
    });

    console.log(`[GhostHub] Loaded ${drafts.length} draft(s)`);
  } catch (error) {
    console.error('[GhostHub] Error loading drafts:', error);
    showStatus('Error loading drafts', 'error');
  }
}

/**
 * Create draft element
 * @param {Object} draft - Draft issue data
 * @param {number} index - Draft index
 * @returns {HTMLElement} - Draft element
 */
function createDraftElement(draft, index) {
  const div = document.createElement('div');
  div.className = 'draft-item';
  div.dataset.index = index;

  // Title
  const title = document.createElement('h3');
  title.textContent = draft.title;
  div.appendChild(title);

  // Source and timestamp
  const meta = document.createElement('p');
  const date = new Date(draft.timestamp).toLocaleString();
  meta.textContent = `From ${draft.source} • ${date}`;
  div.appendChild(meta);

  // Labels
  if (draft.labels && draft.labels.length > 0) {
    const labelsDiv = document.createElement('div');
    labelsDiv.className = 'labels';
    
    draft.labels.forEach(label => {
      const labelSpan = document.createElement('span');
      labelSpan.className = 'label';
      labelSpan.textContent = label;
      labelsDiv.appendChild(labelSpan);
    });
    
    div.appendChild(labelsDiv);
  }

  // Add buttons
  const buttonsDiv = document.createElement('div');
  buttonsDiv.style.marginTop = '10px';
  buttonsDiv.style.display = 'flex';
  buttonsDiv.style.gap = '10px';

  const publishBtn = document.createElement('button');
  publishBtn.textContent = 'Publish to GitHub';
  publishBtn.style.width = 'auto';
  publishBtn.style.flex = '1';
  publishBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    publishDraft(index);
  });

  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = '🗑️';
  deleteBtn.className = 'secondary';
  deleteBtn.style.width = '40px';
  deleteBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    deleteDraft(index);
  });

  buttonsDiv.appendChild(publishBtn);
  buttonsDiv.appendChild(deleteBtn);
  div.appendChild(buttonsDiv);

  return div;
}

/**
 * Publish draft to GitHub
 * @param {number} index - Draft index
 */
async function publishDraft(index) {
  try {
    showStatus('Publishing issue to GitHub...', 'info');

    const result = await chrome.storage.local.get(['drafts', 'githubOwner', 'githubRepo', 'githubToken']);
    const drafts = result.drafts || [];
    const draft = drafts[index];

    if (!draft) {
      throw new Error('Draft not found');
    }

    // Validate configuration
    if (!result.githubOwner || !result.githubRepo || !result.githubToken) {
      throw new Error('GitHub configuration not set');
    }

    // Create issue via GitHub API
    const url = `https://api.github.com/repos/${result.githubOwner}/${result.githubRepo}/issues`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `token ${result.githubToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: draft.title,
        body: draft.body,
        labels: draft.labels
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create GitHub issue');
    }

    const issue = await response.json();

    // Remove draft from storage
    drafts.splice(index, 1);
    await chrome.storage.local.set({ drafts });

    // Show success
    showStatus(`Issue #${issue.number} created successfully!`, 'success');

    // Reload drafts
    setTimeout(() => loadDrafts(), 1000);

    // Open issue in new tab
    chrome.tabs.create({ url: issue.html_url });

  } catch (error) {
    console.error('[GhostHub] Error publishing draft:', error);
    showStatus(`Error: ${error.message}`, 'error');
  }
}

/**
 * Delete draft
 * @param {number} index - Draft index
 */
async function deleteDraft(index) {
  try {
    const result = await chrome.storage.local.get(['drafts']);
    const drafts = result.drafts || [];

    drafts.splice(index, 1);
    await chrome.storage.local.set({ drafts });

    showStatus('Draft deleted', 'info');
    await loadDrafts();
  } catch (error) {
    console.error('[GhostHub] Error deleting draft:', error);
    showStatus('Error deleting draft', 'error');
  }
}

/**
 * Show status message
 * @param {string} message - Status message
 * @param {string} type - Status type (success, error, info)
 */
function showStatus(message, type = 'info') {
  const statusDiv = document.getElementById('status');
  statusDiv.textContent = message;
  statusDiv.className = `status ${type}`;
  statusDiv.classList.remove('hidden');

  setTimeout(() => {
    statusDiv.classList.add('hidden');
  }, 5000);
}
