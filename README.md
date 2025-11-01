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

1. Clone this repository:  
   ```bash
   git clone https://github.com/ch-uppp/ghosthub.git
   cd ghosthub
   ```

2. Load the extension in Chrome:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" in the top right corner
   - Click "Load unpacked"
   - Select the `ghosthub` directory

3. Configure GitHub integration:
   - Click the GhostHub extension icon
   - Generate a GitHub Personal Access Token at [GitHub Settings > Tokens](https://github.com/settings/tokens)
   - Grant the token `repo` scope
   - Enter the token in GhostHub and verify
   - Select your target repository

For detailed setup instructions, see [GITHUB_API.md](./GITHUB_API.md)

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

## 🌐 Landing Page & Vercel Integration

GhostHub includes a production-ready landing page with Vercel serverless API integration for WhatsApp bot onboarding.

### Features

- **Self-Service Onboarding**: Users can configure their own WhatsApp GitHub bot
- **GitHub Copilot Integration**: Option to auto-assign issues to Copilot
- **Multi-Client Support**: Each user gets their own bot configuration
- **Serverless API**: Vercel-hosted API endpoint at `/api/onboard`
- **Real-time Configuration**: Instant bot setup with WhatsApp instructions

### Quick Deploy to Vercel

```bash
# 1. Import to Vercel
vercel import ch-uppp/ghosthub

# 2. Set environment variable in Vercel dashboard
CODEWORDS_API_KEY=your-api-key

# 3. Deploy!
```

See [VERCEL_SETUP.md](./VERCEL_SETUP.md) for detailed deployment instructions.

### Landing Page Structure

- `/` - Hero page with project information
- `/configure` - Bot configuration form with:
  - WhatsApp phone number input
  - GitHub repository selector
  - Access control settings
  - Custom keyword configuration
  - WhatsApp confirmation toggle
  - **GitHub Copilot assignment toggle**

---