# GhostHub - GitHub API Integration

## Installation & Setup

### 1. Load Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right corner
3. Click "Load unpacked"
4. Select the `ghosthub` directory

### 2. Configure GitHub Authentication

1. Click the GhostHub extension icon in your browser toolbar
2. Generate a GitHub Personal Access Token:
   - Go to [GitHub Settings > Tokens](https://github.com/settings/tokens)
   - Click "Generate new token (classic)"
   - Give it a descriptive name (e.g., "GhostHub Extension")
   - Select the `repo` scope (required for creating issues)
   - Click "Generate token"
   - Copy the token (you won't be able to see it again!)
3. Paste the token into the GhostHub popup and click "Verify & Save Token"
4. Once verified, you'll see your GitHub profile information

### 3. Select Repository

1. From the dropdown, select the repository where you want to create issues
2. Click "Save Repository"

### 4. Configure Default Labels (Optional)

1. Enter comma-separated labels (e.g., "bug, needs-triage, from-chat")
2. Click "Save Labels"
3. These labels will be automatically applied to new issues

### 5. Test the Integration

1. Enter a test issue title and description
2. Click "Create Test Issue"
3. If successful, you'll see a link to the created issue on GitHub

## API Features

### GitHub API Module (`github-api.js`)

The core module that handles all GitHub REST API interactions:

#### Authentication
- Supports Personal Access Tokens (PAT)
- Supports OAuth tokens
- Automatic header management
- Token verification

#### Issue Creation
- Create issues with title, description, and labels
- Optional assignees and milestones
- Full error handling and validation

#### Repository Management
- List user's accessible repositories
- Filter by type (owner, member, all)
- Sort by various criteria

#### Labels
- Fetch repository labels
- Apply multiple labels to issues

### Storage Module (`storage.js`)

Manages extension settings using Chrome's `storage.sync` API:

- Token storage (synced across devices)
- Repository selection persistence
- Default labels configuration
- Complete settings management

### Background Service Worker (`background.js`)

Handles message passing between popup and API:

- Async message handling
- Centralized error handling
- Token initialization on startup
- API call orchestration

### Popup UI (`popup.html`, `popup.js`, `popup.css`)

User-friendly configuration interface:

- Token verification with immediate feedback
- Repository selection dropdown
- Label configuration
- Test issue creation
- Real-time error and success messages

## API Usage Examples

### Creating an Issue Programmatically

```javascript
// Send message to background script
chrome.runtime.sendMessage({
  action: 'createIssue',
  issueData: {
    title: 'Bug: Login page not loading',
    body: 'Detailed description of the bug...',
    labels: ['bug', 'high-priority']
  }
}, (response) => {
  if (response.success) {
    console.log('Issue created:', response.issue.html_url);
  } else {
    console.error('Error:', response.error);
  }
});
```

### Listing Repositories

```javascript
chrome.runtime.sendMessage({
  action: 'listRepositories',
  options: {
    type: 'owner',
    sort: 'updated',
    per_page: 50
  }
}, (response) => {
  if (response.success) {
    console.log('Repositories:', response.repositories);
  }
});
```

### Verifying Authentication

```javascript
chrome.runtime.sendMessage({
  action: 'verifyAuth',
  token: 'ghp_yourtoken'
}, (response) => {
  if (response.success) {
    console.log('Authenticated as:', response.user.login);
  }
});
```

## Security Considerations

- **Token Storage**: Tokens are stored using Chrome's `storage.sync` API, which is encrypted
- **HTTPS Only**: All API calls use HTTPS
- **No Token Logging**: Tokens are never logged to console
- **Token Scopes**: Only request the minimum required scopes (`repo` for issue creation)
- **CSP**: Content Security Policy is configured in manifest.json

## Troubleshooting

### "Authentication failed"
- Verify your token is correct
- Ensure the token has `repo` scope
- Check if the token is expired

### "Failed to create issue"
- Verify you've selected a repository
- Ensure you have write access to the repository
- Check if the repository name is correct

### "No repository selected"
- Go to the popup and select a repository from the dropdown
- Click "Save Repository"

### Extension not loading
- Check Chrome DevTools console for errors
- Verify all files are present in the extension directory
- Try reloading the extension from `chrome://extensions/`

## File Structure

```
ghosthub/
├── manifest.json           # Extension manifest
├── background.js          # Service worker
├── github-api.js          # GitHub REST API client
├── storage.js             # Chrome storage utilities
├── popup.html             # Settings UI
├── popup.js               # UI logic
├── popup.css              # UI styles
├── test-github-api.js     # Basic tests
├── GITHUB_API.md         # This file
├── README.md              # Project README
├── content-scripts/       # Content scripts for chat platforms
│   ├── slack.js
│   ├── slack.css
│   ├── discord.js
│   ├── discord.css
│   ├── whatsapp.js
│   └── whatsapp.css
└── icons/                 # Extension icons
    ├── icon16.png
    ├── icon32.png
    ├── icon48.png
    └── icon128.png
```

## Development

### Testing

Run the basic tests:
```bash
node test-github-api.js
```

### Debugging

1. Open Chrome DevTools for the popup: Right-click extension icon > Inspect popup
2. View background script logs: Go to `chrome://extensions/` > Click "service worker"
3. Check storage: Chrome DevTools > Application > Storage > Extension Storage

## API Reference

See [GitHub REST API Documentation](https://docs.github.com/en/rest) for full API details.

### Endpoints Used

- `GET /user` - Verify authentication
- `GET /user/repos` - List repositories
- `GET /repos/{owner}/{repo}/labels` - Get labels
- `POST /repos/{owner}/{repo}/issues` - Create issue

## Future Enhancements

- OAuth flow implementation
- Issue templates support
- Batch issue creation
- Comment on existing issues
- Custom label creation
- Repository search
- Organization repository support
