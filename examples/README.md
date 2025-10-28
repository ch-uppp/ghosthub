# Usage Examples

This directory contains example code demonstrating how to integrate the IndexedDB utility functions into different parts of the GhostHub Chrome extension.

## Files

### 1. `background.js` - Background Script Example

Shows how to use the IndexedDB utilities in the extension's service worker/background script.

**Features:**
- Message routing between content scripts and IndexedDB
- Badge count updates based on pending messages
- Error handling and logging
- Enriching messages with sender metadata

**Key Functions:**
- `storeMessage()` - Store captured messages
- `retrieveMessage()` - Get specific message
- `retrieveAllMessages()` - Get all messages with filtering
- `updateMessage()` - Update message status
- `deleteMessage()` - Remove messages
- `updateBadge()` - Update extension badge with count

### 2. `content-script.js` - Content Script Example

Demonstrates how content scripts can capture messages and send them to the background script for storage.

**Features:**
- Platform-specific message capture (Slack, Discord, WhatsApp)
- Message type detection (bug, feature, PR mention)
- Metadata collection

**Key Functions:**
- `captureAndStoreMessage()` - Generic message capture
- `captureBugFromSlack()` - Slack-specific bug capture
- `captureFeatureFromDiscord()` - Discord-specific feature capture
- `capturePRMentionFromWhatsApp()` - WhatsApp-specific PR mention capture

### 3. `popup.js` - Popup UI Example

Shows how to display and manage stored messages in the extension's popup interface.

**Features:**
- Display pending messages
- Filter by platform, type, or status
- Approve, edit, or delete messages
- Statistics display
- Toast notifications

**Key Functions:**
- `loadMessages()` - Fetch and display messages
- `approveMessage()` - Approve pending messages
- `deleteMessage()` - Delete messages
- `applyFilter()` - Filter message list

## Integration Steps

### 1. Update `manifest.json`

Ensure your manifest includes the background script:

```json
{
  "background": {
    "service_worker": "examples/background.js"
  }
}
```

### 2. Import IndexedDB Utilities in Background Script

```javascript
importScripts('utils/indexeddb.js');
```

### 3. Send Messages from Content Scripts

```javascript
// In your content script
chrome.runtime.sendMessage({
  action: 'storeMessage',
  data: {
    platform: 'slack',
    type: 'bug',
    content: 'Error message here'
  }
});
```

### 4. Use in Popup

```html
<!-- In popup.html -->
<script src="examples/popup.js"></script>
```

## Message Flow

```
Content Script (Slack/Discord/WhatsApp)
    ↓ chrome.runtime.sendMessage()
Background Script
    ↓ store()
IndexedDB (GhostHubDB)
    ↑ retrieve()
Popup UI
```

## Message Data Structure

All messages stored should follow this structure:

```javascript
{
  id: 1,                    // Auto-generated
  platform: 'slack',        // 'slack', 'discord', or 'whatsapp'
  type: 'bug',             // 'bug', 'feature', or 'pr_mention'
  content: 'Message text', // The actual message content
  status: 'pending',       // 'pending', 'approved', 'sent', or 'ignored'
  timestamp: 1234567890,   // Unix timestamp
  metadata: {              // Optional additional data
    author: 'john.doe',
    channel: '#bugs',
    url: 'https://...'
  }
}
```

## API Usage Examples

### Store a Message

```javascript
// From background script
const id = await store({
  platform: 'discord',
  type: 'feature',
  content: 'Add dark mode',
  status: 'pending'
});
```

### Retrieve Messages

```javascript
// Get specific message
const message = await retrieve(1);

// Get all pending bugs from Slack
const messages = await retrieveAll({
  platform: 'slack',
  type: 'bug',
  status: 'pending'
});

// Get all messages
const allMessages = await retrieveAll();
```

### Update Message Status

```javascript
// Approve a message
await update(1, { status: 'approved' });

// Mark as sent
await update(1, {
  status: 'sent',
  metadata: {
    githubIssueUrl: 'https://github.com/...'
  }
});
```

### Delete Messages

```javascript
// Delete specific message
await deleteItem(1);

// Delete all messages (use with caution!)
await deleteAll();
```

### Count Messages

```javascript
// Count all messages
const total = await count();

// Count pending messages
const pending = await count({ status: 'pending' });

// Count bugs from Slack
const slackBugs = await count({
  platform: 'slack',
  type: 'bug'
});
```

## Error Handling

Always wrap database operations in try-catch blocks:

```javascript
try {
  const id = await store(messageData);
  console.log('Stored successfully:', id);
} catch (error) {
  console.error('Storage failed:', error.message);
  // Handle error appropriately
}
```

## Testing

1. Load the extension in Chrome
2. Open the test page: `test-indexeddb.html`
3. Run the tests to verify functionality
4. Check the browser console for logs
5. Use Chrome DevTools → Application → IndexedDB to inspect the database

## Notes

- All database operations are asynchronous (Promise-based)
- Database connections are automatically managed (opened and closed)
- Data persists between browser sessions
- Each operation includes input validation and error handling
- The background script acts as a bridge between content scripts and IndexedDB
