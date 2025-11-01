# GhostHub Landing Page

A modern, GitHub-inspired landing page for GhostHub - a WhatsApp to GitHub Issues bot.

## Features

- **Clean Design**: GitHub-inspired light theme with monospace fonts
- **Form Validation**: Real-time validation for phone numbers and repository names
- **Permission Management**: Configure who can create issues (all members, only you, or specific members)
- **Custom Keywords**: Add additional keywords beyond the defaults
- **Copilot Integration**: Option to automatically assign issues to GitHub Copilot
- **API Integration**: Vercel serverless function proxies requests to CodeWords API
- **Responsive Design**: Mobile-friendly layout
- **Success/Error Handling**: Visual feedback for form submissions
- **Dual Form Options**: React app or standalone HTML form

## Tech Stack

- React 18
- Tailwind CSS
- Axios for API calls
- Vercel Serverless Functions

## Getting Started

1. Install dependencies:
   ```bash
   cd landing-page
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

3. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Build for Production

```bash
npm run build
```

This builds the app for production to the `build` folder.

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete Vercel deployment instructions.

Quick deploy:
```bash
vercel
```

## Form Options

### 1. React App (Main)
Access at: `/configure`
- Modern React-based UI
- Routing with react-router-dom
- Component-based architecture

### 2. Standalone HTML Form
Access at: `/setup.html`
- Simple HTML + vanilla JavaScript
- No build required
- Direct form submission

Both forms use the same API endpoint.

## Form Fields

- **WhatsApp Phone Number** (required): International format with country code
- **GitHub Repository** (required): owner/repository format
- **Permissions**: Choose who can create issues (all members, only me, or specific members)
- **Custom Keywords** (optional): Add tags for detection
- **WhatsApp Confirmations**: Toggle for confirmation messages
- **GitHub Copilot**: Toggle to automatically assign issues to Copilot

## API Architecture

### Data Flow

```
Frontend Form → /api/onboard → CodeWords API
```

### Field Mapping

**Frontend sends (camelCase):**
```json
{
  "phoneNumber": "+447401234567",
  "githubRepo": "microsoft/vscode",
  "allowedPhones": ["+447401234567"],
  "customKeywords": ["urgent", "blocker"],
  "enableConfirmations": true,
  "triggerCopilot": true
}
```

**API transforms to (snake_case):**
```json
{
  "phone_number": "+447401234567",
  "github_repo": "microsoft/vscode",
  "allowed_phone_numbers": ["+447401234567"],
  "custom_keywords": ["urgent", "blocker"],
  "enable_confirmations": true,
  "trigger_copilot": true
}
```

### API Endpoint

**Path**: `/api/onboard`

**Method**: `POST`

**Request Body** (camelCase):
- `phoneNumber` (string, required): Phone number in international format
- `githubRepo` (string, required): Repository in owner/repo format
- `allowedPhones` (array|null, optional): Array of phone numbers or null for all
- `customKeywords` (array, optional): Custom keywords for issue detection
- `enableConfirmations` (boolean, optional): Send WhatsApp confirmations (default: true)
- `triggerCopilot` (boolean, optional): Assign to Copilot (default: false)

**Response** (success):
```json
{
  "success": true,
  "message": "Bot configured successfully!",
  "instructions": "Setup instructions here..."
}
```

**Response** (error):
```json
{
  "success": false,
  "error": "Error message here"
}
```

## Environment Variables

Set in Vercel:
- `CODEWORDS_API_KEY`: Your CodeWords API key (required)

## Local Development with Vercel

Test the serverless API locally:

```bash
npm install -g vercel
vercel dev
```

This starts both the React dev server and API functions.

## Project Structure

```
landing-page/
├── api/
│   └── onboard.js          # Vercel serverless function
├── public/
│   ├── index.html          # React app entry
│   ├── setup.html          # Standalone HTML form
│   └── form-handler.js     # Standalone form logic
├── src/
│   ├── components/
│   │   ├── ConfigForm.js   # Main form component
│   │   ├── ConfigPage.js   # Configuration page
│   │   └── ...
│   └── App.js              # React app root
├── vercel.json             # Vercel configuration
├── package.json
└── DEPLOYMENT.md           # Deployment guide
```
