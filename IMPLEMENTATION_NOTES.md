# Implementation Notes: Vercel Integration

## Summary

This document provides a technical summary of the Vercel integration implementation for the GhostHub WhatsApp-to-GitHub bot.

## Changes Made

### 1. API Endpoint (`/api/onboard.js`)

**Location**: `/api/onboard.js`

**Purpose**: Serverless function that acts as a proxy between the landing page and the CodeWords Multi-Client Bot API.

**Key Features**:
- CORS enabled for cross-origin requests
- Accepts POST requests with bot configuration
- Validates required parameters (`phoneNumber`, `githubRepo`)
- Forwards request to CodeWords API with proper authentication
- Supports new `triggerCopilot` parameter for GitHub Copilot assignment

**Environment Variables Required**:
- `CODEWORDS_API_KEY`: Authentication key for CodeWords API

### 2. Landing Page Updates (`ConfigForm.js`)

**Location**: `/landing-page/src/components/ConfigForm.js`

**Changes**:
1. Added `trigger_copilot: false` to form state
2. Added UI toggle for "Assign issues to GitHub Copilot"
3. Updated API endpoint from direct CodeWords URL to `/api/onboard`
4. Modified payload structure to use camelCase keys:
   - `phone_number` → `phoneNumber`
   - `github_repo` → `githubRepo`
   - `allowed_phone_numbers` → `allowedPhones`
   - `custom_keywords` → `customKeywords`
   - `enable_confirmations` → `enableConfirmations`
   - Added: `triggerCopilot`

### 3. Vercel Configuration (`vercel.json`)

**Location**: `/vercel.json`

**Configuration**:
```json
{
  "buildCommand": "cd landing-page && npm install && npm run build",
  "outputDirectory": "landing-page/build",
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/api/:path*"
    }
  ]
}
```

**Purpose**: Configures Vercel to:
- Build the React landing page
- Serve static files from `landing-page/build`
- Route `/api/*` requests to serverless functions

### 4. Documentation

**Files Created**:
- `/api/README.md`: API endpoint documentation
- `/VERCEL_DEPLOYMENT.md`: Comprehensive deployment guide
- `/IMPLEMENTATION_NOTES.md`: This file

**Files Updated**:
- `/README.md`: Added WhatsApp bot integration section

### 5. Git Configuration (`.gitignore`)

**Changes**:
- Added `.vercel` directory
- Added `*.log` files
- Removed `landing-page/package-lock.json` from tracking

## API Request/Response Flow

### Request Flow

```
User Form Submission
    ↓
ConfigForm.js (React)
    ↓
POST /api/onboard
    ↓
api/onboard.js (Vercel Serverless Function)
    ↓
POST https://runtime.codewords.ai/run/whatsapp_github_issue_bot_multi_ef3a9abf/
    ↓
CodeWords Multi-Client Bot
    ↓
Response back through the chain
```

### Request Payload

**From Landing Page to `/api/onboard`**:
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

**From `/api/onboard` to CodeWords API**:
```json
{
  "phone_number": "+447401234567",
  "github_repo": "owner/repository",
  "allowed_phone_numbers": ["+447401234567"] | null,
  "custom_keywords": ["urgent", "critical"],
  "enable_confirmations": true,
  "trigger_copilot": false
}
```

### Response

**Success (200)**:
```json
{
  "success": true,
  "message": "Bot configured for owner/repository!",
  "config_stored": true,
  "instructions": "✅ **Your WhatsApp GitHub Issue Bot is Ready!**..."
}
```

**Error (400/500)**:
```json
{
  "error": "Error message",
  "message": "Detailed error description"
}
```

## Security Considerations

1. **API Key Protection**:
   - API key stored in Vercel environment variables
   - Never exposed to client-side code
   - Not committed to repository

2. **CORS Configuration**:
   - Currently set to `*` (allow all origins)
   - Can be restricted to specific domains in production

3. **Input Validation**:
   - Phone number format validation (E.164 format)
   - GitHub repository format validation (owner/repo)
   - Required field validation

4. **Environment Variables**:
   - `.env` files excluded from git
   - Environment variables set per Vercel environment (production, preview, development)

## Testing

### Local Testing (Without Vercel)

Not recommended as it requires the CodeWords API key to be available locally.

### Testing on Vercel

1. Deploy to Vercel (preview or production)
2. Set `CODEWORDS_API_KEY` environment variable
3. Test via landing page form submission
4. Test via curl:
```bash
curl -X POST https://your-project.vercel.app/api/onboard \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"+447401234567","githubRepo":"test/repo","enableConfirmations":true,"triggerCopilot":false}'
```

## Deployment Instructions

### Prerequisites
1. Vercel account
2. GitHub repository connected to Vercel
3. CodeWords API key

### Steps
1. Import project to Vercel
2. Set environment variable `CODEWORDS_API_KEY`
3. Deploy

See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) for detailed instructions.

## Known Limitations

1. **Local Development**: Requires Vercel CLI for full local testing
2. **API Key**: Single API key shared across all deployments (can be separated per environment)
3. **Rate Limiting**: No rate limiting implemented (should be handled by CodeWords API or Vercel)
4. **Error Handling**: Basic error handling (could be enhanced with more specific error codes)

## Future Enhancements

1. **Rate Limiting**: Add rate limiting to prevent abuse
2. **Logging**: Enhanced logging for debugging
3. **Monitoring**: Add monitoring/alerting for API failures
4. **Multi-tenancy**: Support for multiple API keys per client
5. **Webhook Support**: Add webhook endpoint for bot status updates
6. **Admin Dashboard**: Interface for managing bot configurations

## File Structure

```
ghosthub/
├── api/
│   ├── README.md                       # API documentation
│   └── onboard.js                      # Serverless function
├── landing-page/
│   ├── src/
│   │   ├── components/
│   │   │   └── ConfigForm.js          # Updated with Copilot toggle
│   │   └── ...
│   ├── public/
│   ├── build/                         # Generated build output
│   └── package.json
├── vercel.json                         # Vercel configuration
├── VERCEL_DEPLOYMENT.md               # Deployment guide
├── IMPLEMENTATION_NOTES.md            # This file
└── README.md                          # Updated with bot info
```

## Git Commits

1. **Initial commit**: Created API endpoint, updated ConfigForm, added vercel.json
2. **Documentation commit**: Added deployment guide and updated README

## References

- **Vercel Documentation**: https://vercel.com/docs
- **CodeWords API**: https://runtime.codewords.ai/run/whatsapp_github_issue_bot_multi_ef3a9abf/
- **React Documentation**: https://reactjs.org/docs
- **Node.js Fetch API**: https://nodejs.org/api/globals.html#fetch

---

**Implementation Date**: 2025-11-01  
**Status**: ✅ Complete  
**Testing Status**: Ready for deployment testing
