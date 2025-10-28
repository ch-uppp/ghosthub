# GhostHub

**Turn chat chaos into GitHub issues — automatically, privately, instantly.**

GhostHub is a Chrome extension that listens to Slack, Discord, and WhatsApp Web messages, detects actionable developer messages (bugs, feature requests, PR mentions), and drafts structured GitHub issues — all locally and powered by Chrome’s built-in AI APIs. Multimodal support lets GhostHub also read screenshots and code snippets.

---

## 🚀 Features

- **Ambient chat monitoring:** Detect messages in Slack, Discord, WhatsApp Web in real-time.  
- **AI-powered classification:** Uses **Prompt API** to detect bug reports, feature requests, and PR mentions.  
- **Thread summarization:** Combines multiple messages into concise GitHub issue descriptions using **Summarizer API**.  
- **Polished issue drafting:** Titles, descriptions, and labels generated with **Writer** and **Proofreader APIs**.  
- **Multimodal AI:** Extracts error messages or UI issues from screenshots with **Multimodal Prompt API**.  
- **Privacy-first:** All AI processing runs on-device. No chat data is sent to external servers.  
- **GitHub integration:** Push issues directly to your repositories with a one-click approval workflow.

---

## 📦 Built With

- **Languages:** JavaScript, TypeScript, HTML, CSS  
- **Frameworks / Libraries:** React, Chrome Extension API, Manifest V3  
- **Platforms:** Google Chrome, Slack Web, Discord Web, WhatsApp Web  
- **APIs:** Chrome Built-in AI Prompt API, Summarizer API, Writer API, Proofreader API, Multimodal API, GitHub REST API  
- **Databases / Storage:** IndexedDB, Web Crypto API  
- **Other Technologies:** Service Workers, OCR library, CSP, npm, Yarn, Jest, Puppeteer, Markdown, Swagger, OpenAPI  

---

## 🛠 Installation

### Requirements
- Google Chrome 127 or later
- Chrome's built-in AI APIs (Prompt API and Summarizer API)

### Setup

1. Clone this repository:  
   ```bash
   git clone https://github.com/ch-uppp/ghosthub.git
   cd ghosthub
   ```

2. Load the extension in Chrome:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in the top-right corner)
   - Click "Load unpacked"
   - Select the `ghosthub` directory

3. Verify the extension is working:
   - Click the GhostHub icon in your Chrome toolbar
   - Check the "API Status" section
   - Both APIs should show "✓ Available"

4. If APIs are not available:
   - Navigate to `chrome://flags/`
   - Search for "Prompt API for Gemini Nano" and enable it
   - Search for "Summarization API for Gemini Nano" and enable it
   - Restart Chrome

### Testing

Open `test.html` in your browser to test the functionality manually, or visit Slack/Discord/WhatsApp Web to see the extension in action.

For detailed development instructions, see [DEVELOPMENT.md](DEVELOPMENT.md).

---

## 📚 Documentation

- **[IMPLEMENTATION.md](IMPLEMENTATION.md)** - Technical implementation details and API usage
- **[DEVELOPMENT.md](DEVELOPMENT.md)** - Developer guide and setup instructions
- **[SUMMARY.md](SUMMARY.md)** - Complete implementation summary

---

## ✨ Current Implementation Status

### ✅ Implemented Features

- **Prompt API Integration** - Message classification (bug, feature, PR mention)
- **Summarizer API Integration** - Multi-message thread summarization
- **IndexedDB Storage** - Persistent storage for all AI outputs
- **Background Service Worker** - Message processing and routing
- **Content Scripts** - Slack monitoring (Discord/WhatsApp placeholders ready)
- **Popup Interface** - View and manage classifications, summaries, and issue drafts
- **Privacy-First Architecture** - All processing happens on-device

### 🚧 Planned Features

- Writer API integration for polishing descriptions
- Proofreader API for grammar checking
- Multimodal API for screenshot analysis
- Direct GitHub API integration for issue creation
- Enhanced Discord and WhatsApp support

---

