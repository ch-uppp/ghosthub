# GhostHub

**Turn chat chaos into GitHub issues — automatically, privately, instantly.**

GhostHub is a Chrome extension and web application that helps developers capture actionable messages from Slack, Discord, and WhatsApp Web, then convert them into structured GitHub issues. The project consists of two main components:

1. **Chrome Extension**: Monitors chat platforms and captures messages in real-time
2. **Landing Page**: A React-based onboarding interface for WhatsApp integration

---

## 🚀 Features

### Chrome Extension
- **Ambient chat monitoring:** Capture messages from Slack, Discord, and WhatsApp Web in real-time
- **Message classification:** Detect bug reports, feature requests, and PR mentions
- **Structured storage:** Store captured messages with metadata using IndexedDB
- **GitHub integration:** Push issues directly to your repositories with a one-click workflow
- **Privacy-first:** All processing happens locally in your browser
- **Token management:** Secure storage of GitHub Personal Access Tokens using Chrome's encrypted storage API

### Landing Page
- **WhatsApp bot onboarding:** Configure WhatsApp to GitHub integration
- **Permission management:** Control who can create issues from WhatsApp
- **Custom keywords:** Add your own detection keywords beyond defaults
- **GitHub-inspired design:** Clean, modern interface with real-time validation

---

## 📦 Built With

### Chrome Extension
- **Languages:** JavaScript, HTML, CSS
- **Platform:** Chrome Extension Manifest V3
- **APIs:** Chrome Extension API, GitHub REST API
- **Storage:** IndexedDB, Chrome Storage API (encrypted)
- **Architecture:** Service Workers, Content Scripts

### Landing Page
- **Framework:** React 18
- **Styling:** Tailwind CSS
- **HTTP Client:** Axios
- **Build Tools:** npm/Yarn, PostCSS

---

## 🛠 Installation

### Chrome Extension

1. Clone this repository:
   ```bash
   git clone https://github.com/ch-uppp/ghosthub.git
   cd ghosthub
   ```

2. Load the extension in Chrome:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" in the top right corner
   - Click "Load unpacked"
   - Select the `ghosthub` directory (the root directory, not the landing-page subdirectory)

3. Configure GitHub integration:
   - Click the GhostHub extension icon
   - Generate a GitHub Personal Access Token at [GitHub Settings > Tokens](https://github.com/settings/tokens)
   - Grant the token `repo` scope
   - Enter the token in GhostHub and verify
   - Select your target repository

For detailed setup instructions, see [GITHUB_API.md](./GITHUB_API.md)

### Landing Page

The landing page is a separate React application for WhatsApp integration onboarding.

1. Navigate to the landing page directory:
   ```bash
   cd landing-page
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Start the development server:
   ```bash
   npm start
   # or
   yarn start
   ```

4. Build for production:
   ```bash
   npm run build
   # or
   yarn build
   ```

For deployment instructions, see [landing-page/DEPLOYMENT_GUIDE.md](./landing-page/DEPLOYMENT_GUIDE.md)

---

## 🔧 GitHub Integration

GhostHub includes a complete GitHub REST API integration that allows you to:

- ✅ **Authenticate** via Personal Access Token or OAuth
- ✅ **Create issues** with titles, descriptions, and labels
- ✅ **Select repositories** from your accessible repos
- ✅ **Configure default labels** for automatic tagging
- ✅ **Test integration** directly from the popup UI

### Quick Start

```javascript
// Create an issue programmatically
chrome.runtime.sendMessage({
  action: 'createIssue',
  issueData: {
    title: 'Bug: Example issue',
    body: 'Detailed description...',
    labels: ['bug', 'from-chat']
  }
}, (response) => {
  if (response.success) {
    console.log('Issue created:', response.issue.html_url);
  }
});
```

See [GITHUB_API.md](./GITHUB_API.md) for complete documentation.

---

## 📁 Project Structure

```
ghosthub/
├── manifest.json              # Extension manifest (Manifest V3)
├── background.js              # Service worker for extension
├── github-api.js              # GitHub REST API client
├── storage.js                 # Chrome storage utilities
├── popup.html                 # Extension popup UI
├── popup.js                   # Popup logic
├── popup.css                  # Popup styles
├── content-scripts/           # Content scripts for chat platforms
│   ├── content.js             # Shared content script logic
│   ├── slack.js               # Slack-specific integration
│   ├── discord.js             # Discord-specific integration
│   └── whatsapp.js            # WhatsApp-specific integration
├── utils/                     # Utility modules
│   ├── indexeddb.js           # IndexedDB wrapper
│   └── README.md              # Utils documentation
├── examples/                  # Usage examples
│   ├── background.js          # Background script example
│   ├── content-script.js      # Content script example
│   └── popup.js               # Popup example
├── icons/                     # Extension icons
├── landing-page/              # React landing page
│   ├── src/                   # React source files
│   ├── public/                # Public assets
│   ├── api/                   # API integration
│   └── package.json           # Landing page dependencies
├── test-github-api.js         # GitHub API tests
├── test-indexeddb.html        # IndexedDB tests
├── README.md                  # This file
├── GITHUB_API.md              # GitHub API documentation
└── IMPLEMENTATION_SUMMARY.md  # Implementation details
```

---

## 🧪 Development & Testing

### Chrome Extension

1. **Load the extension** in Chrome (see Installation section above)

2. **View logs:**
   - **Popup:** Right-click the extension icon > "Inspect popup"
   - **Background script:** Go to `chrome://extensions/` > Click "service worker" under GhostHub
   - **Content scripts:** Open DevTools on the chat platform page (Slack, Discord, WhatsApp)

3. **Test GitHub API:**
   ```bash
   node test-github-api.js
   ```

4. **Test IndexedDB:**
   - Open `test-indexeddb.html` in Chrome
   - Open DevTools console to view test results
   - Check Application > IndexedDB in DevTools to inspect the database

5. **Debug storage:**
   - Chrome DevTools > Application > Storage > Extension Storage

### Landing Page

```bash
cd landing-page
npm install
npm start    # Development server at http://localhost:3000
npm test     # Run tests (if configured)
npm run build # Production build
```

---

## 📝 Usage Examples

### Capture a Message from a Content Script

```javascript
// In content-scripts/slack.js or similar
chrome.runtime.sendMessage({
  action: 'storeMessage',
  data: {
    platform: 'slack',
    type: 'bug',
    content: 'Login button not working on mobile',
    metadata: {
      author: 'john.doe',
      channel: '#bugs',
      timestamp: Date.now()
    }
  }
});
```

### Retrieve Messages in Popup

```javascript
// In popup.js
chrome.runtime.sendMessage({
  action: 'retrieveAllMessages',
  filters: {
    status: 'pending',
    type: 'bug'
  }
}, (response) => {
  if (response.success) {
    displayMessages(response.messages);
  }
});
```

### Create a GitHub Issue

```javascript
chrome.runtime.sendMessage({
  action: 'createIssue',
  issueData: {
    title: 'Bug: Login button not working',
    body: 'User reported that the login button is not responding on mobile devices.',
    labels: ['bug', 'mobile', 'high-priority']
  }
}, (response) => {
  if (response.success) {
    console.log('Issue created:', response.issue.html_url);
  }
});
```

See [examples/README.md](./examples/README.md) for more detailed examples.

---

## 🔒 Security & Privacy

- **Local Processing:** All message processing happens locally in your browser
- **Encrypted Storage:** GitHub tokens are stored using Chrome's encrypted storage API
- **No External Servers:** Chat data is never sent to external servers (except GitHub when creating issues)
- **HTTPS Only:** All API calls use HTTPS
- **Minimal Permissions:** Extension only requests necessary permissions
- **Content Security Policy:** Strict CSP configured in manifest

---

## 📖 Documentation

- [GITHUB_API.md](./GITHUB_API.md) - GitHub integration setup and API reference
- [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) - Implementation details
- [utils/README.md](./utils/README.md) - IndexedDB utilities documentation
- [examples/README.md](./examples/README.md) - Usage examples and integration guide
- [landing-page/README.md](./landing-page/README.md) - Landing page documentation
- [landing-page/DEPLOYMENT_GUIDE.md](./landing-page/DEPLOYMENT_GUIDE.md) - Deployment instructions

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📄 License

See the repository for license information.

---

## 👤 Author

**ch-uppp**

- GitHub: [@ch-uppp](https://github.com/ch-uppp)

---

## 🙏 Acknowledgments

- Built with Chrome Extension Manifest V3
- GitHub REST API
- React and Tailwind CSS for the landing page
