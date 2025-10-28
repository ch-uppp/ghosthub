# IndexedDB Utility Functions

This module provides a set of utility functions for managing captured messages and issues in GhostHub using IndexedDB. Data is persisted locally in the browser and remains available between sessions.

## Database Schema

- **Database Name**: `GhostHubDB`
- **Store Name**: `messages`
- **Key Path**: `id` (auto-incremented)

### Indexes

- `timestamp` - For time-based queries
- `platform` - For filtering by platform (slack, discord, whatsapp)
- `type` - For filtering by issue type (bug, feature, pr_mention)
- `status` - For filtering by status (pending, approved, sent, ignored)

## Data Structure

Each stored item should have the following structure:

```javascript
{
  id: number,              // Auto-generated unique identifier
  platform: string,        // Required: 'slack', 'discord', or 'whatsapp'
  type: string,            // Required: 'bug', 'feature', or 'pr_mention'
  content: string,         // Required: The message content
  status: string,          // Optional: 'pending', 'approved', 'sent', 'ignored' (default: 'pending')
  timestamp: number,       // Optional: Unix timestamp (default: Date.now())
  metadata: object         // Optional: Additional data (author, channel, url, etc.)
}
```

## API Reference

### `store(data)`

Stores a new message/issue in the database.

**Parameters:**
- `data` (Object): The message/issue data to store
  - `platform` (string, required): Platform where message was captured
  - `type` (string, required): Type of issue
  - `content` (string, required): The message content
  - `status` (string, optional): Status of the issue (default: 'pending')
  - `timestamp` (number, optional): Timestamp (default: Date.now())
  - `metadata` (object, optional): Additional metadata

**Returns:** `Promise<number>` - The ID of the stored item

**Example:**
```javascript
const id = await store({
  platform: 'slack',
  type: 'bug',
  content: 'Login button not working',
  status: 'pending',
  metadata: {
    author: 'john.doe',
    channel: '#bugs'
  }
});
console.log(`Stored with ID: ${id}`);
```

### `retrieve(id)`

Retrieves a specific message/issue by ID.

**Parameters:**
- `id` (number, required): The ID of the item to retrieve

**Returns:** `Promise<Object|null>` - The retrieved item or null if not found

**Example:**
```javascript
const item = await retrieve(1);
if (item) {
  console.log('Found:', item);
} else {
  console.log('Item not found');
}
```

### `retrieveAll(filter)`

Retrieves all messages/issues with optional filtering.

**Parameters:**
- `filter` (Object, optional): Filter criteria
  - `platform` (string, optional): Filter by platform
  - `type` (string, optional): Filter by type
  - `status` (string, optional): Filter by status

**Returns:** `Promise<Array>` - Array of matching items

**Examples:**
```javascript
// Get all items
const allItems = await retrieveAll();

// Get all Slack messages
const slackItems = await retrieveAll({ platform: 'slack' });

// Get all pending bugs
const pendingBugs = await retrieveAll({ type: 'bug', status: 'pending' });
```

### `update(id, updates)`

Updates an existing message/issue.

**Parameters:**
- `id` (number, required): The ID of the item to update
- `updates` (Object, required): The fields to update

**Returns:** `Promise<number>` - The ID of the updated item

**Example:**
```javascript
await update(1, {
  status: 'approved',
  metadata: { reviewer: 'admin' }
});
```

### `deleteItem(id)`

Deletes a specific message/issue by ID.

**Parameters:**
- `id` (number, required): The ID of the item to delete

**Returns:** `Promise<void>`

**Example:**
```javascript
await deleteItem(1);
console.log('Item deleted');
```

### `deleteAll()`

Deletes all messages/issues from the database.

**Returns:** `Promise<void>`

**Example:**
```javascript
await deleteAll();
console.log('Database cleared');
```

### `count(filter)`

Counts the number of messages/issues with optional filtering.

**Parameters:**
- `filter` (Object, optional): Filter criteria (same as retrieveAll)

**Returns:** `Promise<number>` - The count of matching items

**Examples:**
```javascript
// Count all items
const total = await count();

// Count pending items
const pending = await count({ status: 'pending' });
```

## Usage in Chrome Extension

### In Content Scripts

```javascript
// Store a captured message
chrome.runtime.sendMessage({
  action: 'storeMessage',
  data: {
    platform: 'slack',
    type: 'bug',
    content: 'Error message found'
  }
});
```

### In Background Script

```javascript
// Import the utility functions
importScripts('utils/indexeddb.js');

// Handle messages from content scripts
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.action === 'storeMessage') {
    try {
      const id = await store(message.data);
      sendResponse({ success: true, id });
    } catch (error) {
      sendResponse({ success: false, error: error.message });
    }
  }
  return true; // Keep the message channel open for async response
});
```

### In Popup

```html
<script src="utils/indexeddb.js"></script>
<script>
  async function loadMessages() {
    const pending = await retrieveAll({ status: 'pending' });
    // Display pending messages in UI
  }
</script>
```

## Testing

Open `test-indexeddb.html` in a browser to test all functions interactively. The test page provides buttons to:

- Run all tests
- Test individual functions
- View stored data
- Clear the database

## Error Handling

All functions return Promises and will reject with descriptive error messages if:

- Required parameters are missing or invalid
- Database operations fail
- Items are not found (for update/delete operations)

Always wrap calls in try-catch blocks:

```javascript
try {
  const id = await store(data);
  console.log('Success:', id);
} catch (error) {
  console.error('Error:', error.message);
}
```

## Browser Compatibility

IndexedDB is supported in all modern browsers including:
- Chrome 24+
- Firefox 16+
- Safari 10+
- Edge 12+

## Data Persistence

Data stored in IndexedDB persists between browser sessions and is specific to the extension's origin. Data will remain until:

- The extension is uninstalled
- The user clears browser data
- `deleteAll()` or `deleteItem()` is called

## Performance Considerations

- IndexedDB operations are asynchronous and non-blocking
- Database connections are opened and closed for each operation
- Indexes are created for efficient querying by platform, type, status, and timestamp
- Use `retrieveAll()` with filters rather than filtering in JavaScript for better performance
