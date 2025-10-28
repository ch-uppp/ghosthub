# GhostHub - Prompt and Summarizer API Implementation

## Overview

This implementation provides the core AI functionality for GhostHub, a Chrome extension that monitors chat applications (Slack, Discord, WhatsApp) and automatically classifies messages and summarizes threads using Chrome's built-in AI APIs.

## Features Implemented

### 1. Prompt API Integration (`api/prompt-api.js`)

The Prompt API is used to classify messages into actionable categories:

- **Bug reports** (`bug`) - Messages reporting errors, crashes, or unexpected behavior
- **Feature requests** (`feature`) - Messages requesting new features or enhancements
- **PR mentions** (`pr_mention`) - Messages mentioning pull requests or code reviews
- **Other** (`other`) - Non-actionable messages

**Key Features:**
- Availability checking for Chrome's built-in AI
- Session management with custom system prompts
- Single message and batch classification
- Confidence scoring (high, medium, low)
- Automatic storage in IndexedDB

**Usage Example:**
```javascript
import promptAPI from './api/prompt-api.js';

const message = {
  text: "The app crashes when I click submit",
  platform: "slack",
  author: "john_doe",
  timestamp: Date.now()
};

const result = await promptAPI.classifyMessage(message);
// Result: { classification: 'bug', confidence: 'high', ... }
```

### 2. Summarizer API Integration (`api/summarizer-api.js`)

The Summarizer API creates concise summaries of multi-message threads:

**Key Features:**
- Availability checking
- Thread summarization with context preservation
- Support for different summary lengths (short, medium, long)
- GitHub-formatted issue descriptions
- Streaming support (when available)
- Automatic storage in IndexedDB

**Usage Example:**
```javascript
import summarizerAPI from './api/summarizer-api.js';

const thread = {
  threadId: "thread_123",
  platform: "slack",
  messages: [
    { author: "alice", text: "I found a bug...", timestamp: Date.now() },
    { author: "bob", text: "I can reproduce it...", timestamp: Date.now() }
  ]
};

const result = await summarizerAPI.summarizeThread(thread);
// Result: { summary: "Brief summary...", messageCount: 2, ... }
```

### 3. AI Workflow Manager (`api/ai-workflow.js`)

Combines Prompt API and Summarizer API for complete message processing:

**Key Features:**
- Unified initialization of all AI APIs
- Single message processing (classify only)
- Thread processing (classify + summarize)
- Automatic issue draft creation
- Batch processing support
- Issue title and label generation

**Usage Example:**
```javascript
import aiWorkflow from './api/ai-workflow.js';

// Process a complete thread
const result = await aiWorkflow.processThread({
  threadId: "thread_123",
  platform: "slack",
  messages: [...] // Array of messages
});

// If actionable, result contains:
// - classification
// - summary
// - issueDraft (title, description, labels, status)
```

### 4. IndexedDB Storage (`storage/indexeddb.js`)

Persistent storage for all AI outputs:

**Database Structure:**
- **classifications** - Message classification results
- **summaries** - Thread summaries
- **issues** - Generated issue drafts

**Key Features:**
- Automatic database initialization
- CRUD operations for all stores
- Filtering and querying support
- Status management for issues
- Indexed fields for efficient queries

**Usage Example:**
```javascript
import dbManager from './storage/indexeddb.js';

// Get all bug classifications
const bugs = await dbManager.getClassifications({ classification: 'bug' });

// Get draft issues
const drafts = await dbManager.getIssues({ status: 'draft' });

// Update issue status
await dbManager.updateIssueStatus(issueId, 'approved');
```

### 5. Background Service Worker (`background.js`)

Handles communication between content scripts and AI APIs:

**Message Types Supported:**
- `CLASSIFY_MESSAGE` - Classify a single message
- `SUMMARIZE_THREAD` - Summarize a thread
- `PROCESS_THREAD` - Full processing (classify + summarize + create issue draft)
- `GET_CLASSIFICATIONS` - Retrieve stored classifications
- `GET_SUMMARIES` - Retrieve stored summaries
- `GET_ISSUES` - Retrieve issue drafts
- `UPDATE_ISSUE_STATUS` - Update issue status
- `CHECK_API_AVAILABILITY` - Check if AI APIs are available

**Features:**
- Automatic initialization on install
- Message routing and error handling
- Notification support for new issues
- Resource cleanup on shutdown

### 6. Content Scripts

**Slack Content Script** (`content-scripts/slack.js`):
- Monitors Slack messages in real-time
- Extracts message data from DOM
- Groups messages into threads
- Sends messages to background worker for processing
- Visual indicators for classified messages

**Discord and WhatsApp Scripts**: Placeholder implementations ready for expansion

### 7. Popup Interface

**HTML/CSS/JS** (`popup.html`, `popup.css`, `popup.js`):
- Displays AI API availability status
- Three tabs: Issue Drafts, Classifications, Summaries
- Filtering options for each data type
- Actions to approve/reject issue drafts
- Real-time updates from IndexedDB

## Data Flow

```
1. Content Script → Extracts messages from chat platform
2. Content Script → Sends to Background Worker
3. Background Worker → Calls Prompt API (classification)
4. Background Worker → Calls Summarizer API (summarization)
5. Background Worker → Creates issue draft
6. Background Worker → Stores in IndexedDB
7. Popup → Displays stored data
8. User → Reviews and approves/rejects issues
```

## API Availability

The implementation gracefully handles cases where Chrome's built-in AI APIs are not available:

- Checks availability on initialization
- Provides clear status indicators in the popup
- Logs warnings but doesn't break functionality
- Can be extended to fallback to external APIs if needed

## Storage Schema

### Classifications Table
```javascript
{
  id: number,              // Auto-increment
  messageText: string,     // Original message
  platform: string,        // slack/discord/whatsapp
  author: string,          // Message author
  messageTimestamp: number,
  classification: string,  // bug/feature/pr_mention/other
  confidence: string,      // high/medium/low
  rawResponse: string,     // Raw AI response
  timestamp: number        // Classification timestamp
}
```

### Summaries Table
```javascript
{
  id: number,              // Auto-increment
  threadId: string,        // Thread identifier
  platform: string,
  messageCount: number,
  originalMessages: array, // Array of message objects
  summary: string,         // AI-generated summary
  summaryLength: number,
  timestamp: number
}
```

### Issues Table
```javascript
{
  id: number,              // Auto-increment
  title: string,           // Generated issue title
  description: string,     // Full issue description
  labels: array,           // Array of label strings
  type: string,            // bug/feature/pr_mention
  platform: string,
  messageCount: number,
  classificationId: number,
  summaryId: number,
  status: string,          // draft/approved/rejected
  createdAt: number,
  originalMessages: array,
  timestamp: number
}
```

## Extension Structure

```
ghosthub/
├── manifest.json           # Extension manifest
├── background.js           # Background service worker
├── popup.html              # Popup UI
├── popup.js                # Popup logic
├── popup.css               # Popup styles
├── api/
│   ├── prompt-api.js       # Prompt API wrapper
│   ├── summarizer-api.js   # Summarizer API wrapper
│   └── ai-workflow.js      # Combined workflow
├── storage/
│   └── indexeddb.js        # IndexedDB manager
├── content-scripts/
│   ├── slack.js            # Slack monitor
│   ├── slack.css
│   ├── discord.js          # Discord monitor (placeholder)
│   ├── discord.css
│   ├── whatsapp.js         # WhatsApp monitor (placeholder)
│   └── whatsapp.css
└── icons/                  # Extension icons
```

## Security & Privacy

- **All AI processing happens on-device** - No data sent to external servers
- **IndexedDB storage is local** - Data stays in the browser
- **Content Security Policy** - Strict CSP to prevent XSS
- **Manifest V3** - Latest Chrome extension standards
- **No external dependencies** - Pure JavaScript implementation

## Future Enhancements

1. **Writer API Integration** - Polish issue descriptions
2. **Proofreader API Integration** - Check grammar and spelling
3. **Multimodal Support** - Extract text from screenshots
4. **GitHub API Integration** - Automatically create issues
5. **Advanced Thread Detection** - Better message grouping
6. **Custom Classification Rules** - User-defined categories
7. **Export Functionality** - Export issues as JSON/Markdown

## Testing

The implementation can be tested by:

1. Loading the extension in Chrome (chrome://extensions)
2. Enabling "Developer mode"
3. Opening Slack/Discord/WhatsApp Web
4. Sending test messages
5. Opening the popup to view results
6. Checking the browser console for logs

## Browser Requirements

- Chrome 127+ (for Prompt API)
- Chrome 127+ (for Summarizer API)
- Enabled "Experimental Web Platform features" flag (if needed)
- Sufficient storage for IndexedDB

## Notes

- The Prompt API and Summarizer API are experimental Chrome features
- Availability may vary by Chrome version and device
- Some features may require specific Chrome flags to be enabled
- The implementation uses ES6 modules (type="module" in manifest)
