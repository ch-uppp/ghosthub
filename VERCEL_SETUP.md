# 🚀 Vercel Deployment Guide for GhostHub

This guide walks you through deploying the GhostHub landing page and API to Vercel.

## 📋 Prerequisites

- GitHub repository with GhostHub code
- Vercel account (sign up at [vercel.com](https://vercel.com))
- CodeWords API key (provided in issue)

## 🔧 Step 1: Import Project to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **"Import Git Repository"**
3. Select your **ch-uppp/ghosthub** repository
4. Configure project settings:
   - **Framework Preset**: Other
   - **Root Directory**: `./` (leave as is)
   - **Build Command**: `cd landing-page && npm install && npm run build`
   - **Output Directory**: `landing-page/build`

## 🔐 Step 2: Add Environment Variable

**Critical:** Add the API key before deploying!

1. In the Vercel import screen, expand **"Environment Variables"**
2. Add the following variable:

   | Name | Value | Environments |
   |------|-------|--------------|
   | `CODEWORDS_API_KEY` | `<your-codewords-api-key>` | ✅ Production ✅ Preview ✅ Development |

   > **Note**: Get your API key from the issue description or your CodeWords account

3. Make sure to check all three environment checkboxes

## 🚢 Step 3: Deploy

1. Click **"Deploy"**
2. Wait for the build to complete (usually 1-2 minutes)
3. Your site will be live at: `https://your-project-name.vercel.app`

## ✅ Step 4: Verify Deployment

### Test the Landing Page
1. Visit your deployed URL
2. Navigate to `/configure` page
3. Verify all form fields are visible:
   - ✅ Phone Number input
   - ✅ GitHub Repository input
   - ✅ Permission options
   - ✅ Custom Keywords
   - ✅ WhatsApp Confirmations toggle
   - ✅ **GitHub Copilot toggle** (NEW)

### Test the API Endpoint
Use curl or Postman to test the `/api/onboard` endpoint:

```bash
curl -X POST https://your-project-name.vercel.app/api/onboard \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+447401234567",
    "githubRepo": "test/repo",
    "enableConfirmations": true,
    "triggerCopilot": false
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Bot configured for test/repo!",
  "config_stored": true,
  "instructions": "..."
}
```

## 🔄 Step 5: Configure Custom Domain (Optional)

1. Go to your Vercel project dashboard
2. Click **Settings** → **Domains**
3. Add your custom domain
4. Update DNS records as instructed by Vercel
5. Wait for DNS propagation (can take up to 48 hours)

## 📊 Project Structure

The Vercel deployment includes:

```
ghosthub/
├── api/
│   ├── onboard.js          # Serverless API endpoint
│   └── README.md           # API documentation
├── landing-page/
│   ├── src/                # React application
│   ├── public/             # Static assets
│   └── build/              # Production build (generated)
├── vercel.json             # Vercel configuration
└── VERCEL_SETUP.md         # This file
```

## 🔍 Vercel Configuration Explained

The `vercel.json` file handles:

1. **Static Build**: Builds the React landing page
2. **API Routes**: Routes `/api/*` requests to serverless functions
3. **Fallback**: Serves landing page for all other routes

```json
{
  "version": 2,
  "builds": [
    {
      "src": "landing-page/package.json",
      "use": "@vercel/static-build",
      "config": { "distDir": "build" }
    }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "/api/$1" },
    { "handle": "filesystem" },
    { "src": "/(.*)", "dest": "/landing-page/$1" }
  ]
}
```

## 🌐 API Endpoint Features

### `/api/onboard`

**Purpose**: Onboards new clients to the WhatsApp GitHub Issue Bot

**Features**:
- ✅ CORS enabled for public access
- ✅ Input validation (phone number, repo format)
- ✅ Proxy to CodeWords Multi-Client Bot
- ✅ Secure API key handling via environment variables
- ✅ **GitHub Copilot assignment** support
- ✅ WhatsApp confirmation toggles
- ✅ Custom keyword support
- ✅ Access control configuration

## 📱 Form Fields Reference

### Required Fields
1. **Phone Number**: WhatsApp number in international format (e.g., `+447401234567`)
2. **GitHub Repository**: Format `owner/repository` (e.g., `microsoft/vscode`)

### Optional Fields
3. **Who Can Trigger**: 
   - All group members (default)
   - Only me
   - Specific members (with phone list)

4. **Custom Keywords**: Additional trigger words (e.g., `urgent`, `critical`)

5. **Send WhatsApp Confirmations**: Toggle (default: ON)
   - Bot replies in WhatsApp when issue is created

6. **Assign to GitHub Copilot**: Toggle (default: OFF) ⭐ **NEW**
   - Automatically assigns created issues to Copilot

## 🧪 Local Development with Vercel

To test locally with Vercel CLI:

```bash
# Install Vercel CLI
npm i -g vercel

# Clone repository
git clone https://github.com/ch-uppp/ghosthub.git
cd ghosthub

# Install landing page dependencies
cd landing-page
npm install
cd ..

# Set environment variable (create .env file)
echo "CODEWORDS_API_KEY=<your-codewords-api-key>" > .env

# Run Vercel dev server
vercel dev

# Visit http://localhost:3000
```

## 🔐 Security Best Practices

1. **Never commit API keys**: The `.gitignore` already excludes `.env` files
2. **Use environment variables**: API key is stored securely in Vercel
3. **HTTPS only**: Vercel provides free SSL certificates
4. **CORS configured**: API accepts requests from any origin (suitable for public API)
5. **Input validation**: Both client-side and API-side validation

## 🐛 Troubleshooting

### Build Fails
**Problem**: Build fails with "npm not found" or similar
**Solution**: Ensure Root Directory is set to `./` and Build Command includes `cd landing-page`

### API Returns 500 Error
**Problem**: API endpoint returns "Server error"
**Solution**: Check that `CODEWORDS_API_KEY` environment variable is set correctly

### Form Submission Hangs
**Problem**: Form submits but never returns
**Solution**: Check browser console for CORS errors and verify API endpoint URL

### Environment Variable Not Working
**Problem**: API key not being read
**Solution**: 
1. Ensure variable is named exactly `CODEWORDS_API_KEY`
2. Check all three environment checkboxes
3. Redeploy after adding variable

## 📞 Support

For issues specific to:
- **Vercel deployment**: Check [Vercel Documentation](https://vercel.com/docs)
- **CodeWords API**: Verify API key and endpoint URL
- **Landing page bugs**: Check browser console for errors

## 🎉 Success Checklist

After deployment, verify:

- [ ] Landing page loads at your Vercel URL
- [ ] Configure page shows all form fields
- [ ] **Copilot toggle is visible** ⭐
- [ ] Form validation works (try submitting empty form)
- [ ] API endpoint responds to requests
- [ ] Copilot toggle state is included in API payload
- [ ] Environment variable is set in Vercel dashboard

## 📈 Next Steps

1. **Test the bot**: Submit the form with real WhatsApp number and GitHub repo
2. **Add bot to WhatsApp**: Follow instructions returned by API
3. **Create test issue**: Send a message in WhatsApp group
4. **Verify Copilot**: Check if issue is assigned to Copilot (if enabled)
5. **Monitor usage**: Check Vercel dashboard for API calls and errors

## 🔄 Updating After Deployment

To update the site after changes:

```bash
# Make your changes
git add .
git commit -m "Update landing page"
git push origin main

# Vercel auto-deploys on push
# Check deployment status at vercel.com/dashboard
```

---

**Current Status**: ✅ Ready for Production Deployment

**Deployment Time**: ~2 minutes

**Cost**: Free tier (includes 100GB bandwidth, unlimited API calls)
