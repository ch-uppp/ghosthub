/**
 * Example Content Script for Slack
 * Demonstrates how to detect messages and create GitHub issues
 */

console.log('GhostHub: Slack content script loaded');

/**
 * Example: Detect bug reports in Slack messages
 */
function detectBugReport(messageText) {
  const bugKeywords = ['bug', 'error', 'crash', 'broken', 'not working', 'issue'];
  const lowerText = messageText.toLowerCase();
  
  return bugKeywords.some(keyword => lowerText.includes(keyword));
}

/**
 * Example: Create GitHub issue from detected message
 */
async function createIssueFromMessage(messageData) {
  try {
    const response = await chrome.runtime.sendMessage({
      action: 'createIssue',
      issueData: {
        title: `Bug reported in Slack: ${messageData.summary}`,
        body: `**Original message from Slack:**\n\n${messageData.text}\n\n**Reporter:** ${messageData.author}\n**Channel:** ${messageData.channel}\n**Time:** ${messageData.timestamp}`,
        labels: ['bug', 'from-slack']
      }
    });
    
    if (response.success) {
      console.log('Issue created:', response.issue.html_url);
      return response.issue;
    } else {
      console.error('Failed to create issue:', response.error);
      return null;
    }
  } catch (error) {
    console.error('Error creating issue:', error);
    return null;
  }
}

/**
 * Example: Monitor Slack messages
 * Note: This is a simplified example. Actual implementation would need
 * proper DOM observation and message extraction based on Slack's structure
 */
function monitorMessages() {
  // This is a placeholder for actual Slack message monitoring
  // In a real implementation, you would:
  // 1. Use MutationObserver to watch for new messages
  // 2. Extract message content, author, timestamp
  // 3. Use AI APIs to classify the message
  // 4. Show user a prompt to create an issue
  
  console.log('GhostHub: Message monitoring initialized');
}

// Example: Initialize monitoring when page is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', monitorMessages);
} else {
  monitorMessages();
}

// Example: Export functions for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    detectBugReport,
    createIssueFromMessage
  };
}
