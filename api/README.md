# GhostHub API - Vercel Serverless Functions

This directory contains Vercel serverless functions for the GhostHub landing page.

## Endpoints

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

**Success Response (200):**
```json
{
  "success": true,
  "message": "Bot configured for owner/repository!",
  "config_stored": true,
  "instructions": "✅ **Your WhatsApp GitHub Issue Bot is Ready!**..."
}
```

**Error Response (400/500):**
```json
{
  "error": "Error message",
  "message": "Detailed error description"
}
```

## Environment Variables

The API requires the following environment variables to be set in Vercel:

### CODEWORDS_API_KEY (Required)

The API key for authenticating with the CodeWords Multi-Client Bot.

**Setup in Vercel:**
1. Go to your Vercel project settings
2. Navigate to: **Settings → Environment Variables**
3. Add the following variable:
   - **Name:** `CODEWORDS_API_KEY`
   - **Value:** `cwk-c6acb71734fcc532ca384fcebad6a28c1dd5179fe1af17784f224e4dcba39b78`
   - **Environments:** ✅ Production, ✅ Preview, ✅ Development
4. Save and redeploy

### ALLOWED_ORIGIN (Optional)

Restricts CORS to specific domains for enhanced security.

**Setup in Vercel:**
- **Name:** `ALLOWED_ORIGIN`
- **Value:** `https://your-domain.vercel.app` (your production domain)
- **Default:** `*` (allows all origins if not set)
- **Environments:** ✅ Production (recommended), ⬜ Preview, ⬜ Development

**Note:** For production, it's recommended to set this to your actual domain to prevent unauthorized cross-origin requests.

## Testing

You can test the API endpoint locally using Vercel CLI:

```bash
# Install Vercel CLI
npm i -g vercel

# Set environment variable
echo "CODEWORDS_API_KEY=your-api-key" > .env

# Run locally
vercel dev
```

Then test with curl:

```bash
curl -X POST http://localhost:3000/api/onboard \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+447401234567",
    "githubRepo": "microsoft/vscode",
    "allowedPhones": null,
    "customKeywords": ["urgent"],
    "enableConfirmations": true,
    "triggerCopilot": true
  }'
```

## Deployment

The API is automatically deployed to Vercel when you push to the repository. Make sure to:

1. Configure the `CODEWORDS_API_KEY` environment variable in Vercel
2. Deploy using `vercel --prod` or via GitHub integration
3. Verify the endpoint is accessible at `https://your-domain.vercel.app/api/onboard`

## CORS Configuration

The API endpoint has CORS enabled. By default, it allows requests from any origin (`Access-Control-Allow-Origin: *`). 

For production environments, you can restrict this to specific domains by setting the `ALLOWED_ORIGIN` environment variable:

```bash
ALLOWED_ORIGIN=https://your-domain.vercel.app
```

This enhances security by preventing unauthorized cross-origin requests from unknown domains.

## Security

- The API key is stored securely in Vercel environment variables
- Never commit the API key to the repository
- The API validates input parameters before forwarding to CodeWords
- Rate limiting should be configured at the Vercel level if needed
