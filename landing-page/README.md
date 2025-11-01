# GhostHub Landing Page

A modern, GitHub-inspired landing page for GhostHub - a WhatsApp to GitHub Issues bot.

## Features

- **Clean Design**: GitHub-inspired light theme with monospace fonts
- **Form Validation**: Real-time validation for phone numbers and repository names
- **Permission Management**: Configure who can create issues (all members, only you, or specific members)
- **Custom Keywords**: Add additional keywords beyond the defaults
- **API Integration**: Direct POST to the bot configuration endpoint
- **Responsive Design**: Mobile-friendly layout
- **Success/Error Handling**: Visual feedback for form submissions

## Tech Stack

- React 18
- Tailwind CSS
- Axios for API calls

## Getting Started

1. Install dependencies:
   ```bash
   cd /app/landing-page
   yarn install
   ```

2. Start the development server:
   ```bash
   yarn start
   ```

3. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Build for Production

```bash
yarn build
```

This builds the app for production to the `build` folder.

## Form Fields

- **WhatsApp Phone Number** (required): International format with country code
- **GitHub Repository** (required): owner/repository format
- **Permissions**: Choose who can create issues
- **Custom Keywords** (optional): Add tags for detection
- **WhatsApp Confirmations**: Toggle for confirmation messages

## API Endpoint

The form submits to:
```
POST https://runtime.codewords.ai/run/whatsapp_github_issue_bot_multi_ef3a9abf/
```

### Payload Format

```json
{
  "phone_number": "+447401234567",
  "github_repo": "owner/repository",
  "allowed_phone_numbers": null,
  "custom_keywords": ["urgent", "critical"],
  "enable_confirmations": true
}
```
