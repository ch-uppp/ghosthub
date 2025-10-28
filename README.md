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

### Prerequisites

- Google Chrome (version 121 or later) with Chrome AI APIs enabled
- A GitHub account and Personal Access Token with `repo` scope

### Setup

1. Clone this repository:  
   ```bash
   git clone https://github.com/ch-uppp/ghosthub.git
   cd ghosthub
   ```

2. Load the extension in Chrome:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right corner)
   - Click "Load unpacked"
   - Select the `ghosthub` directory

3. Configure GitHub integration:
   - Click the GhostHub extension icon in your toolbar
   - Enter your GitHub repository owner (username or organization)
   - Enter your repository name
   - Enter your GitHub Personal Access Token
   - Click "Save Configuration"

4. Enable Chrome AI APIs:
   - Navigate to `chrome://flags/#optimization-guide-on-device-model`
   - Set to "Enabled BypassPerfRequirement"
   - Navigate to `chrome://flags/#prompt-api-for-gemini-nano`
   - Set to "Enabled"
   - Restart Chrome

---

## 🎯 Usage

### Monitoring Chat Messages

1. **Open a supported chat platform:**
   - Slack: `https://app.slack.com/`
   - Discord: `https://discord.com/`
   - WhatsApp Web: `https://web.whatsapp.com/`

2. **Look for the GhostHub button:**
   - A purple "👻 Create GitHub Issue" button appears in the bottom-right corner

3. **Chat with screenshots:**
   - Share error screenshots, UI bugs, or code snippets in your chat
   - GhostHub automatically detects images and applies visual indicators (green border)

4. **Create GitHub issues:**
   - Click the "👻 Create GitHub Issue" button
   - GhostHub analyzes the recent conversation and any screenshots
   - A draft issue is created with extracted text, errors, and context

5. **Review and publish:**
   - Open the GhostHub popup (click the extension icon)
   - Review the draft issues in the "Draft Issues" section
   - Click "Publish to GitHub" to create the issue in your repository
   - Or click 🗑️ to delete unwanted drafts

---

## 🤖 Multimodal AI Integration

GhostHub uses Chrome's built-in Multimodal AI API to analyze screenshots and extract valuable information:

### Image Detection

- **Automatic detection:** GhostHub monitors chat DOM for image attachments
- **Platform support:** Works across Slack, Discord, and WhatsApp Web
- **Visual feedback:** Detected images are highlighted with a green border

### Screenshot Analysis

The multimodal AI extracts:

1. **Error messages:** Stack traces, exception messages, error codes
2. **Visible text:** Any text visible in the screenshot
3. **Context:** Description of what the image shows and its relevance to the conversation
4. **UI/UX issues:** Visual problems or inconsistencies

### Integration with Text Analysis

- Screenshot analysis is merged with text message content
- Combined summaries provide comprehensive context for GitHub issues
- Automatic labeling: Issues with screenshots get the `has-screenshot` label
- Error detection: Issues with detected errors get the `error` label

### Example Output

When analyzing a screenshot with an error message:

```markdown
## Conversation Summary

User reported: "Getting this error when trying to login"

## Screenshots

Found 1 screenshot(s) with analysis:

**Screenshot 1:** Browser console showing JavaScript error in authentication flow

- Visible Text: TypeError: Cannot read property 'token' of undefined at login.js:45
- Errors Found:
  - TypeError: Cannot read property 'token' of undefined
  - Location: login.js:45
```

---

## 🏗️ Architecture

### Core Components

1. **Content Scripts** (`content-scripts/`)
   - `slack.js`, `discord.js`, `whatsapp.js` - Platform-specific message monitoring
   - Inject UI buttons and monitor DOM for messages and images

2. **Utilities** (`utils/`)
   - `multimodal-ai.js` - Interfaces with Chrome's Multimodal API for image analysis
   - `image-detector.js` - Detects and extracts images from chat messages
   - `message-analyzer.js` - Combines text and image analysis

3. **Background Service Worker** (`background.js`)
   - Handles GitHub API integration
   - Manages configuration storage
   - Coordinates issue creation workflow

4. **Popup UI** (`popup.html`, `popup.js`)
   - Configuration interface for GitHub credentials
   - Draft issue management and approval
   - One-click publishing to GitHub

### Data Flow

```
Chat Message + Screenshots
         ↓
  Image Detector
         ↓
  Multimodal AI Analysis
         ↓
  Message Analyzer (combines text + images)
         ↓
  Background Service Worker
         ↓
  Draft Storage
         ↓
  User Approval (Popup)
         ↓
  GitHub API
```

---

## 🔒 Privacy & Security

- **On-device processing:** All AI analysis runs locally using Chrome's built-in APIs
- **No external servers:** Chat data never leaves your browser
- **Secure storage:** GitHub tokens stored locally using Chrome's storage API
- **User approval:** All issues require manual approval before publishing
- **Permissions:** Only requests necessary permissions for supported platforms

---

## 🧪 Development

### Project Structure

```
ghosthub/
├── manifest.json           # Extension manifest (Manifest V3)
├── background.js           # Service worker for GitHub integration
├── popup.html              # Extension popup UI
├── popup.js                # Popup logic
├── content-scripts/        # Platform-specific content scripts
│   ├── slack.js
│   ├── discord.js
│   ├── whatsapp.js
│   └── *.css
├── utils/                  # Shared utilities
│   ├── multimodal-ai.js    # Multimodal AI interface
│   ├── image-detector.js   # Image detection logic
│   └── message-analyzer.js # Message + image analysis
└── icons/                  # Extension icons
```

### Testing Multimodal AI

To test the multimodal AI functionality:

1. Load the extension in Chrome with AI flags enabled
2. Navigate to a supported chat platform
3. Share a screenshot with visible text or error messages
4. Observe the green border around detected images
5. Click "Create GitHub Issue" to see the analysis results

### Known Limitations

- Chrome AI APIs require Chrome 121+ and may not be available on all systems
- Multimodal API has rate limits and may require internet for model downloads
- Image analysis quality depends on screenshot clarity and content
- CORS restrictions may prevent loading some external images

---

## 📝 License

This project is open source. See LICENSE file for details.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

---

## 📧 Contact

For questions or feedback, please open an issue on GitHub

