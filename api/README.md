# GhostHub Vercel API

This directory contains the Vercel serverless functions for the GhostHub landing page.

## Setup

### Environment Variables

Before deploying, you need to set up the following environment variable in your Vercel project:

1. Go to your Vercel Project Dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variable:

| Variable Name | Value | Environments |
|--------------|-------|--------------|
| `CODEWORDS_API_KEY` | `cwk-c6acb71734fcc532ca384fcebad6a28c1dd5179fe1af17784f224e4dcba39b78` | Production, Preview, Development |

### Deployment

This API is automatically deployed with your Vercel project. The `vercel.json` configuration in the root directory handles the routing.

## API Endpoints

### POST /api/onboard

Onboards a new client to the WhatsApp GitHub Issue Bot.

**Request Body:**

```json
{
  "phoneNumber": "+447401234567",
  "githubRepo": "owner/repository",
  "allowedPhones": ["+447401234567"] | null,
  "customKeywords": ["urgent", "critical"],
  "enableConfirmations": true,
  "triggerCopilot": false
}
```

**Required Fields:**
- `phoneNumber` (string): WhatsApp phone number in international format
- `githubRepo` (string): GitHub repository in format "owner/repo"

**Optional Fields:**
- `allowedPhones` (array|null): List of phone numbers that can trigger bot (null = all)
- `customKeywords` (array): Additional keywords to trigger issue creation
- `enableConfirmations` (boolean): Send WhatsApp confirmations when issues are created (default: true)
- `triggerCopilot` (boolean): Automatically assign issues to GitHub Copilot (default: false)

**Success Response (200):**

```json
{
  "success": true,
  "message": "Bot configured for microsoft/vscode!",
  "config_stored": true,
  "instructions": "✅ Your WhatsApp GitHub Issue Bot is Ready!\n\nRepository: microsoft/vscode\nCopilot: Enabled\nConfirmations: Enabled\n\n[Setup steps...]"
}
```

**Error Responses:**

- `400 Bad Request`: Missing required fields
- `405 Method Not Allowed`: Non-POST request
- `500 Internal Server Error`: Server or API error

## CORS

The API endpoint has CORS enabled with `Access-Control-Allow-Origin: *` to allow requests from any domain. This is suitable for a public onboarding API.

## Testing

You can test the API endpoint locally using Vercel CLI:

```bash
# Install Vercel CLI
npm i -g vercel

# Run locally
vercel dev

# Test the endpoint
curl -X POST http://localhost:3000/api/onboard \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+447401234567",
    "githubRepo": "test/repo",
    "enableConfirmations": true,
    "triggerCopilot": false
  }'
```

## Security

- The API key is stored securely as an environment variable
- Never commit the API key to the repository
- CORS is configured for public access
- Input validation is performed on required fields
