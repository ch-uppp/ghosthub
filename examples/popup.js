/**
 * Example Popup Script for GhostHub
 * Demonstrates how to display and manage stored messages in the extension popup
 */

// Load stored messages when popup opens
document.addEventListener('DOMContentLoaded', async () => {
  await loadMessages();
  setupEventListeners();
});

/**
 * Load and display messages
 */
async function loadMessages() {
  try {
    const response = await chrome.runtime.sendMessage({
      action: 'retrieveAllMessages',
      filter: { status: 'pending' }
    });

    if (response.success) {
      displayMessages(response.messages);
      updateStats(response.messages);
    } else {
      showError('Failed to load messages');
    }
  } catch (error) {
    console.error('Error loading messages:', error);
    showError('Error loading messages');
  }
}

/**
 * Display messages in the UI
 */
function displayMessages(messages) {
  const container = document.getElementById('messages-container');
  
  if (!container) return;
  
  container.innerHTML = '';

  if (messages.length === 0) {
    container.innerHTML = '<p class="no-messages">No pending messages</p>';
    return;
  }

  messages.forEach(message => {
    const messageElement = createMessageElement(message);
    container.appendChild(messageElement);
  });
}

/**
 * Create a message element
 */
function createMessageElement(message) {
  const div = document.createElement('div');
  div.className = `message-item ${message.type}`;
  div.dataset.id = message.id;

  div.innerHTML = `
    <div class="message-header">
      <span class="platform-badge ${message.platform}">${message.platform}</span>
      <span class="type-badge ${message.type}">${message.type}</span>
    </div>
    <div class="message-content">${escapeHtml(message.content)}</div>
    <div class="message-meta">
      <small>${new Date(message.timestamp).toLocaleString()}</small>
    </div>
    <div class="message-actions">
      <button class="btn-approve" data-id="${message.id}">✓ Approve</button>
      <button class="btn-edit" data-id="${message.id}">✎ Edit</button>
      <button class="btn-delete" data-id="${message.id}">✕ Delete</button>
    </div>
  `;

  return div;
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  // Approve button
  document.addEventListener('click', async (e) => {
    if (e.target.matches('.btn-approve')) {
      const id = parseInt(e.target.dataset.id);
      await approveMessage(id);
    }
  });

  // Edit button
  document.addEventListener('click', (e) => {
    if (e.target.matches('.btn-edit')) {
      const id = parseInt(e.target.dataset.id);
      editMessage(id);
    }
  });

  // Delete button
  document.addEventListener('click', async (e) => {
    if (e.target.matches('.btn-delete')) {
      const id = parseInt(e.target.dataset.id);
      await deleteMessage(id);
    }
  });

  // Filter buttons
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const filter = e.target.dataset.filter;
      await applyFilter(filter);
    });
  });

  // Refresh button
  const refreshBtn = document.getElementById('refresh-btn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', loadMessages);
  }
}

/**
 * Approve a message
 */
async function approveMessage(id) {
  try {
    const response = await chrome.runtime.sendMessage({
      action: 'updateMessage',
      id: id,
      data: { status: 'approved' }
    });

    if (response.success) {
      showSuccess('Message approved');
      await loadMessages();
    } else {
      showError('Failed to approve message');
    }
  } catch (error) {
    console.error('Error approving message:', error);
    showError('Error approving message');
  }
}

/**
 * Edit a message (simplified example)
 */
function editMessage(id) {
  // In a real implementation, this would open an edit dialog
  console.log('Edit message:', id);
  alert('Edit functionality would open a dialog here');
}

/**
 * Delete a message
 */
async function deleteMessage(id) {
  if (!confirm('Are you sure you want to delete this message?')) {
    return;
  }

  try {
    const response = await chrome.runtime.sendMessage({
      action: 'deleteMessage',
      id: id
    });

    if (response.success) {
      showSuccess('Message deleted');
      await loadMessages();
    } else {
      showError('Failed to delete message');
    }
  } catch (error) {
    console.error('Error deleting message:', error);
    showError('Error deleting message');
  }
}

/**
 * Apply filter
 */
async function applyFilter(filter) {
  try {
    const filterObj = {};
    
    if (filter === 'all') {
      // No filter
    } else if (filter === 'pending') {
      filterObj.status = 'pending';
    } else if (filter === 'approved') {
      filterObj.status = 'approved';
    } else if (['slack', 'discord', 'whatsapp'].includes(filter)) {
      filterObj.platform = filter;
    } else if (['bug', 'feature', 'pr_mention'].includes(filter)) {
      filterObj.type = filter;
    }

    const response = await chrome.runtime.sendMessage({
      action: 'retrieveAllMessages',
      filter: filterObj
    });

    if (response.success) {
      displayMessages(response.messages);
    }
  } catch (error) {
    console.error('Error applying filter:', error);
  }
}

/**
 * Update statistics
 */
function updateStats(messages) {
  const statsContainer = document.getElementById('stats');
  if (!statsContainer) return;

  const stats = {
    total: messages.length,
    bugs: messages.filter(m => m.type === 'bug').length,
    features: messages.filter(m => m.type === 'feature').length,
    prMentions: messages.filter(m => m.type === 'pr_mention').length
  };

  statsContainer.innerHTML = `
    <div class="stat">Total: ${stats.total}</div>
    <div class="stat">Bugs: ${stats.bugs}</div>
    <div class="stat">Features: ${stats.features}</div>
    <div class="stat">PR Mentions: ${stats.prMentions}</div>
  `;
}

/**
 * Utility functions
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function showSuccess(message) {
  showToast(message, 'success');
}

function showError(message) {
  showToast(message, 'error');
}

function showToast(message, type) {
  // Simple toast notification (in real implementation, use a proper toast library)
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

console.log('GhostHub popup script loaded');
