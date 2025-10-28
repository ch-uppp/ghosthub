# GhostHub - Development Guide

## Quick Start

### Prerequisites
- Google Chrome (version 127 or later recommended)
- Chrome's built-in AI APIs enabled (may require flags)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ch-uppp/ghosthub.git
   cd ghosthub
   ```

2. **Load the extension in Chrome:**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right corner)
   - Click "Load unpacked"
   - Select the `ghosthub` directory

3. **Verify installation:**
   - The GhostHub icon should appear in your Chrome toolbar
   - Click the icon to open the popup
   - Check the "API Status" section to verify AI APIs are available

### Enabling Chrome AI APIs

If the AI APIs show as "Not Available":

1. Check your Chrome version: `chrome://version/`
2. Enable experimental features (if needed):
   - Navigate to `chrome://flags/`
   - Search for "Prompt API for Gemini Nano" and enable it
   - Search for "Summarization API for Gemini Nano" and enable it
   - Restart Chrome

## Project Structure

```
ghosthub/
├── manifest.json              # Extension manifest (Manifest V3)
├── background.js              # Background service worker
├── popup.html/js/css          # Extension popup UI
├── test.html                  # Manual testing page
├── IMPLEMENTATION.md          # Implementation details
├── api/                       # AI API wrappers
│   ├── prompt-api.js          # Message classification
│   ├── summarizer-api.js      # Thread summarization
│   └── ai-workflow.js         # Combined workflow
├── storage/                   # Data persistence
│   └── indexeddb.js           # IndexedDB manager
└── content-scripts/           # Chat platform monitors
    ├── slack.js/css           # Slack integration
    ├── discord.js/css         # Discord integration (placeholder)
    └── whatsapp.js/css        # WhatsApp integration (placeholder)
```

## Development Workflow

### Making Changes

1. **Edit the code** in your preferred editor
2. **Reload the extension** in Chrome:
   - Go to `chrome://extensions/`
   - Click the reload icon on the GhostHub extension card
3. **Test your changes** on supported platforms (Slack, Discord, WhatsApp)

### Debugging

**Background Worker:**
- Open `chrome://extensions/`
- Click "service worker" link under GhostHub
- Use the console to see background logs

**Content Scripts:**
- Open the chat platform (Slack/Discord/WhatsApp)
- Open Chrome DevTools (F12)
- Check the Console tab for content script logs

**Popup:**
- Right-click the extension icon
- Select "Inspect popup"
- Use DevTools to debug the popup interface

### Testing

**Manual Testing with test.html:**

1. Open `test.html` in Chrome
2. Load the extension (if not already loaded)
3. Use the buttons to test:
   - Message classification
   - Thread summarization
   - Storage retrieval

**Testing on Real Platforms:**

1. Open Slack Web (`https://app.slack.com/`)
2. Send test messages:
   - Bug: "The app crashes when I click submit"
   - Feature: "Can we add dark mode?"
   - PR mention: "Please review PR #123"
3. Open the extension popup to see results

## API Usage Examples

### Classify a Single Message

```javascript
import promptAPI from './api/prompt-api.js';

const message = {
  text: "The login button doesn't work",
  platform: "slack",
  author: "jane_doe",
  timestamp: Date.now()
};

const result = await promptAPI.classifyMessage(message);
console.log(result);
// {
//   classification: 'bug',
//   confidence: 'high',
//   messageText: "The login button doesn't work",
//   ...
// }
```

### Summarize a Thread

```javascript
import summarizerAPI from './api/summarizer-api.js';

const thread = {
  threadId: "slack_thread_123",
  platform: "slack",
  messages: [
    { author: "alice", text: "Login is broken", timestamp: Date.now() },
    { author: "bob", text: "I can reproduce this", timestamp: Date.now() },
    { author: "carol", text: "It works on mobile", timestamp: Date.now() }
  ]
};

const summary = await summarizerAPI.summarizeThread(thread);
console.log(summary.summary);
```

### Full Workflow (Classify + Summarize)

```javascript
import aiWorkflow from './api/ai-workflow.js';

const thread = {
  threadId: "thread_456",
  platform: "discord",
  messages: [/* ... */]
};

const result = await aiWorkflow.processThread(thread);

if (result.actionable) {
  console.log('Issue draft created:', result.issueDraft);
  // {
  //   title: "🐛 Login button doesn't work",
  //   description: "Full markdown description...",
  //   labels: ['bug', 'ghosthub', 'discord'],
  //   status: 'draft'
  // }
}
```

### Access Storage

```javascript
import dbManager from './storage/indexeddb.js';

// Get all bug classifications
const bugs = await dbManager.getClassifications({ 
  classification: 'bug' 
});

// Get all draft issues
const drafts = await dbManager.getIssues({ 
  status: 'draft' 
});

// Update issue status
await dbManager.updateIssueStatus(issueId, 'approved');
```

## Content Script Integration

### Adding a New Platform

To add support for a new chat platform:

1. **Create content script:** `content-scripts/newplatform.js`
2. **Create styles:** `content-scripts/newplatform.css`
3. **Update manifest.json:**
   ```json
   {
     "matches": ["https://newplatform.com/*"],
     "js": ["content-scripts/newplatform.js"],
     "css": ["content-scripts/newplatform.css"]
   }
   ```
4. **Implement message extraction:**
   ```javascript
   function extractMessages() {
     // Platform-specific DOM parsing
     const messages = [];
     // ... extract message data
     return messages;
   }
   ```

### Message Format

Content scripts should send messages in this format:

```javascript
{
  text: string,        // Message content
  author: string,      // Author username
  timestamp: number,   // Unix timestamp
  platform: string     // Platform name
}
```

## Background Service Worker

### Message Types

Send messages to the background worker:

```javascript
chrome.runtime.sendMessage({
  type: 'CLASSIFY_MESSAGE',
  data: { text, author, timestamp, platform }
}, (response) => {
  if (response.success) {
    console.log('Classification:', response.result);
  }
});
```

Available message types:
- `CLASSIFY_MESSAGE` - Classify a single message
- `SUMMARIZE_THREAD` - Summarize a thread
- `PROCESS_THREAD` - Full processing
- `GET_CLASSIFICATIONS` - Retrieve classifications
- `GET_SUMMARIES` - Retrieve summaries
- `GET_ISSUES` - Retrieve issues
- `UPDATE_ISSUE_STATUS` - Update issue status
- `CHECK_API_AVAILABILITY` - Check AI API availability

## Best Practices

### Performance
- Batch process messages when possible
- Use throttling for message monitoring
- Clean up AI sessions when not needed

### Error Handling
- Always check API availability before use
- Handle gracefully when APIs are unavailable
- Log errors for debugging

### Privacy
- All processing happens on-device
- No data sent to external servers
- IndexedDB data stays local

### Code Quality
- Use ES6 modules
- Add JSDoc comments
- Follow existing code style
- Test on multiple platforms

## Troubleshooting

### "Prompt API not available"
- Check Chrome version (127+)
- Enable required flags in `chrome://flags/`
- Restart Chrome after enabling flags

### "Extension doesn't detect messages"
- Check browser console for errors
- Verify content script is loaded
- Inspect DOM selectors for changes

### "Storage errors"
- Clear IndexedDB: DevTools → Application → IndexedDB
- Reload extension
- Check storage permissions

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Resources

- [Chrome Extension Docs](https://developer.chrome.com/docs/extensions/)
- [Chrome Built-in AI](https://developer.chrome.com/docs/ai/)
- [Manifest V3](https://developer.chrome.com/docs/extensions/mv3/)
- [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)

## License

[Your License Here]

## Support

For issues and questions, please open an issue on GitHub.
