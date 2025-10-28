/**
 * Popup script for GhostHub
 * Displays stored classifications, summaries, and issue drafts
 */

// Check API availability
async function checkAPIStatus() {
  try {
    const response = await chrome.runtime.sendMessage({
      type: 'CHECK_API_AVAILABILITY'
    });

    if (response && response.success) {
      const { availability } = response;
      
      document.getElementById('prompt-status').textContent = availability.promptAPI ? '✓ Available' : '✗ Not Available';
      document.getElementById('prompt-status').className = availability.promptAPI ? 'status-value success' : 'status-value error';
      
      document.getElementById('summarizer-status').textContent = availability.summarizerAPI ? '✓ Available' : '✗ Not Available';
      document.getElementById('summarizer-status').className = availability.summarizerAPI ? 'status-value success' : 'status-value error';
    }
  } catch (error) {
    console.error('Error checking API status:', error);
  }
}

// Load issues
async function loadIssues(filter = 'all') {
  const listContainer = document.getElementById('issues-list');
  listContainer.innerHTML = '<p class="loading">Loading issues...</p>';

  try {
    const filters = filter !== 'all' ? { status: filter } : {};
    const response = await chrome.runtime.sendMessage({
      type: 'GET_ISSUES',
      filters
    });

    if (response && response.success) {
      const issues = response.issues;
      
      if (issues.length === 0) {
        listContainer.innerHTML = '<p class="empty">No issues found</p>';
        return;
      }

      listContainer.innerHTML = '';
      issues.forEach(issue => {
        const item = createIssueItem(issue);
        listContainer.appendChild(item);
      });
    }
  } catch (error) {
    console.error('Error loading issues:', error);
    listContainer.innerHTML = '<p class="error">Error loading issues</p>';
  }
}

// Create issue item element
function createIssueItem(issue) {
  const div = document.createElement('div');
  div.className = 'list-item';
  
  const typeEmoji = issue.type === 'bug' ? '🐛' : issue.type === 'feature' ? '✨' : '🔀';
  const statusClass = issue.status === 'draft' ? 'status-draft' : issue.status === 'approved' ? 'status-approved' : 'status-rejected';
  
  div.innerHTML = `
    <div class="item-header">
      <span class="item-title">${typeEmoji} ${issue.title}</span>
      <span class="item-badge ${statusClass}">${issue.status}</span>
    </div>
    <div class="item-meta">
      <span>Platform: ${issue.platform}</span>
      <span>Messages: ${issue.messageCount}</span>
      <span>${new Date(issue.createdAt).toLocaleString()}</span>
    </div>
    <div class="item-description">${truncateText(issue.description, 150)}</div>
    <div class="item-actions">
      ${issue.status === 'draft' ? `
        <button class="btn btn-approve" data-id="${issue.id}">Approve</button>
        <button class="btn btn-reject" data-id="${issue.id}">Reject</button>
      ` : ''}
      <button class="btn btn-view" data-id="${issue.id}">View Full</button>
    </div>
  `;

  // Add event listeners
  const approveBtn = div.querySelector('.btn-approve');
  const rejectBtn = div.querySelector('.btn-reject');
  const viewBtn = div.querySelector('.btn-view');

  if (approveBtn) {
    approveBtn.addEventListener('click', () => updateIssueStatus(issue.id, 'approved'));
  }
  if (rejectBtn) {
    rejectBtn.addEventListener('click', () => updateIssueStatus(issue.id, 'rejected'));
  }
  if (viewBtn) {
    viewBtn.addEventListener('click', () => showIssueDetails(issue));
  }

  return div;
}

// Load classifications
async function loadClassifications(filter = 'all') {
  const listContainer = document.getElementById('classifications-list');
  listContainer.innerHTML = '<p class="loading">Loading classifications...</p>';

  try {
    const filters = filter !== 'all' ? { classification: filter } : {};
    const response = await chrome.runtime.sendMessage({
      type: 'GET_CLASSIFICATIONS',
      filters
    });

    if (response && response.success) {
      const classifications = response.classifications;
      
      if (classifications.length === 0) {
        listContainer.innerHTML = '<p class="empty">No classifications found</p>';
        return;
      }

      listContainer.innerHTML = '';
      classifications.forEach(classification => {
        const item = createClassificationItem(classification);
        listContainer.appendChild(item);
      });
    }
  } catch (error) {
    console.error('Error loading classifications:', error);
    listContainer.innerHTML = '<p class="error">Error loading classifications</p>';
  }
}

// Create classification item element
function createClassificationItem(classification) {
  const div = document.createElement('div');
  div.className = 'list-item';
  
  const typeEmoji = classification.classification === 'bug' ? '🐛' : 
                    classification.classification === 'feature' ? '✨' : 
                    classification.classification === 'pr_mention' ? '🔀' : '📝';
  
  div.innerHTML = `
    <div class="item-header">
      <span class="item-title">${typeEmoji} ${classification.classification}</span>
      <span class="item-badge confidence-${classification.confidence}">${classification.confidence} confidence</span>
    </div>
    <div class="item-meta">
      <span>Platform: ${classification.platform}</span>
      <span>Author: ${classification.author}</span>
      <span>${new Date(classification.timestamp).toLocaleString()}</span>
    </div>
    <div class="item-description">${truncateText(classification.messageText, 150)}</div>
  `;

  return div;
}

// Load summaries
async function loadSummaries() {
  const listContainer = document.getElementById('summaries-list');
  listContainer.innerHTML = '<p class="loading">Loading summaries...</p>';

  try {
    const response = await chrome.runtime.sendMessage({
      type: 'GET_SUMMARIES',
      filters: {}
    });

    if (response && response.success) {
      const summaries = response.summaries;
      
      if (summaries.length === 0) {
        listContainer.innerHTML = '<p class="empty">No summaries found</p>';
        return;
      }

      listContainer.innerHTML = '';
      summaries.forEach(summary => {
        const item = createSummaryItem(summary);
        listContainer.appendChild(item);
      });
    }
  } catch (error) {
    console.error('Error loading summaries:', error);
    listContainer.innerHTML = '<p class="error">Error loading summaries</p>';
  }
}

// Create summary item element
function createSummaryItem(summary) {
  const div = document.createElement('div');
  div.className = 'list-item';
  
  div.innerHTML = `
    <div class="item-header">
      <span class="item-title">Thread Summary</span>
    </div>
    <div class="item-meta">
      <span>Platform: ${summary.platform}</span>
      <span>Messages: ${summary.messageCount}</span>
      <span>${new Date(summary.timestamp).toLocaleString()}</span>
    </div>
    <div class="item-description">${truncateText(summary.summary, 200)}</div>
  `;

  return div;
}

// Update issue status
async function updateIssueStatus(issueId, status) {
  try {
    const response = await chrome.runtime.sendMessage({
      type: 'UPDATE_ISSUE_STATUS',
      data: { issueId, status }
    });

    if (response && response.success) {
      // Reload issues
      const filter = document.getElementById('issue-filter').value;
      loadIssues(filter);
    }
  } catch (error) {
    console.error('Error updating issue status:', error);
  }
}

// Show issue details (placeholder)
function showIssueDetails(issue) {
  alert(`Issue Details:\n\nTitle: ${issue.title}\n\nDescription:\n${issue.description}`);
}

// Utility function to truncate text
function truncateText(text, maxLength) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

// Tab switching
document.querySelectorAll('.tab-button').forEach(button => {
  button.addEventListener('click', () => {
    const tabName = button.dataset.tab;
    
    // Update active states
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    button.classList.add('active');
    document.getElementById(`${tabName}-tab`).classList.add('active');
    
    // Load appropriate data
    if (tabName === 'issues') {
      loadIssues();
    } else if (tabName === 'classifications') {
      loadClassifications();
    } else if (tabName === 'summaries') {
      loadSummaries();
    }
  });
});

// Filter handling
document.getElementById('issue-filter').addEventListener('change', (e) => {
  loadIssues(e.target.value);
});

document.getElementById('classification-filter').addEventListener('change', (e) => {
  loadClassifications(e.target.value);
});

// Initialize popup
document.addEventListener('DOMContentLoaded', () => {
  checkAPIStatus();
  loadIssues();
});
