# 🚀 GhostHub Vercel Deployment Guide

Complete guide for deploying GhostHub landing page and API to Vercel.

## 📋 Overview

This repository includes:
- **Landing Page**: React-based SPA for bot configuration (in `/landing-page`)
- **API Endpoint**: Serverless function for onboarding (`/api/onboard.js`)
- **Vercel Configuration**: Pre-configured `vercel.json`

## 🎯 Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Connected to your Vercel account
3. **CodeWords API Key**: `cwk-c6acb71734fcc532ca384fcebad6a28c1dd5179fe1af17784f224e4dcba39b78`

## 🔧 Deployment Steps

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Import Project**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New..." → "Project"
   - Import your GitHub repository (`ch-uppp/ghosthub`)

2. **Configure Build Settings**
   - Framework Preset: **Other**
   - Build Command: `cd landing-page && npm install && npm run build`
   - Output Directory: `landing-page/build`
   - Install Command: (leave default)

3. **Set Environment Variables**
   - Go to **Settings** → **Environment Variables**
   - Add the following variables:
     
     **Required:**
     ```
     Name: CODEWORDS_API_KEY
     Value: cwk-c6acb71734fcc532ca384fcebad6a28c1dd5179fe1af17784f224e4dcba39b78
     Environments: ✅ Production, ✅ Preview, ✅ Development
     ```
     
     **Optional (Recommended for Production):**
     ```
     Name: ALLOWED_ORIGIN
     Value: https://your-project.vercel.app
     Environments: ✅ Production
     ```
   - Click **Save**

4. **Deploy**
   - Click **Deploy**
   - Wait for build to complete
   - Your site will be live at `https://your-project.vercel.app`

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Set Environment Variable**
   ```bash
   vercel env add CODEWORDS_API_KEY
   # Paste the API key when prompted
   # Select all environments (production, preview, development)
   ```

4. **Deploy to Production**
   ```bash
   vercel --prod
   ```

### Option 3: GitHub Integration (Continuous Deployment)

1. **Connect Repository**
   - In Vercel Dashboard, connect your GitHub repository
   - Vercel will automatically detect `vercel.json`

2. **Configure Environment Variables** (as in Option 1)

3. **Enable Auto-Deploy**
   - Every push to `main` branch will trigger a deployment
   - Pull requests will create preview deployments

## 📊 Deployment Structure

```
ghosthub/
├── api/
│   ├── onboard.js          # Serverless function
│   └── README.md           # API documentation
├── landing-page/
│   ├── src/                # React source code
│   ├── public/             # Static assets
│   ├── build/              # Production build (generated)
│   └── package.json        # Dependencies
├── vercel.json             # Vercel configuration
└── VERCEL_DEPLOYMENT.md    # This file
```

## 🌐 API Endpoints

After deployment, your API will be available at:

### POST /api/onboard
**URL**: `https://your-project.vercel.app/api/onboard`

**Request Body**:
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

**Response (Success - 200)**:
```json
{
  "success": true,
  "message": "Bot configured for owner/repository!",
  "config_stored": true,
  "instructions": "✅ **Your WhatsApp GitHub Issue Bot is Ready!**..."
}
```

**Response (Error - 400/500)**:
```json
{
  "error": "Error message",
  "message": "Detailed error description"
}
```

## 🔐 Environment Variables

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `CODEWORDS_API_KEY` | API key for CodeWords Multi-Client Bot | Yes | `cwk-c6acb...` |
| `ALLOWED_ORIGIN` | Restrict CORS to specific domain (security) | No | `https://your-domain.vercel.app` |

### Setting Environment Variables

**Via Vercel Dashboard:**
1. Project Settings → Environment Variables
2. Add `CODEWORDS_API_KEY`
3. Select all environments
4. Redeploy

**Via Vercel CLI:**
```bash
vercel env add CODEWORDS_API_KEY production
vercel env add CODEWORDS_API_KEY preview
vercel env add CODEWORDS_API_KEY development
```

**Via `.env` file (Local Development Only)**:
```bash
echo "CODEWORDS_API_KEY=cwk-c6acb71734fcc532ca384fcebad6a28c1dd5179fe1af17784f224e4dcba39b78" > .env
```
⚠️ Never commit `.env` files to the repository!

## 🧪 Testing Your Deployment

### 1. Test Landing Page
- Visit `https://your-project.vercel.app`
- Verify the form loads correctly
- Check that all UI components are visible

### 2. Test API Endpoint

**Using curl:**
```bash
curl -X POST https://your-project.vercel.app/api/onboard \
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

**Using the Landing Page:**
1. Fill in the form fields
2. Click "Configure Bot"
3. Verify success message appears
4. Check browser console for any errors

### 3. Verify Environment Variables
```bash
vercel env ls
```

## 📱 Custom Domain Setup

### Add Custom Domain

1. Go to **Project Settings** → **Domains**
2. Click **Add Domain**
3. Enter your domain (e.g., `ghosthub.example.com`)
4. Follow DNS configuration instructions

### DNS Configuration

**For Root Domain** (`example.com`):
```
Type: A
Name: @
Value: 76.76.21.21
```

**For Subdomain** (`ghosthub.example.com`):
```
Type: CNAME
Name: ghosthub
Value: cname.vercel-dns.com
```

## 🔍 Monitoring and Logs

### View Deployment Logs
1. Vercel Dashboard → Your Project
2. Click on a deployment
3. View build logs and runtime logs

### View Function Logs
1. Go to **Functions** tab
2. Click on `/api/onboard`
3. View invocation logs

### Monitor Performance
- Vercel Analytics: Auto-enabled for all deployments
- View metrics in **Analytics** tab

## 🚨 Troubleshooting

### Issue: Build Failed
**Solution**: Check build logs
- Ensure `landing-page/package.json` has correct dependencies
- Verify `npm run build` works locally
- Check for TypeScript or ESLint errors

### Issue: API Returns 500 Error
**Solution**: Check environment variables
```bash
vercel env ls
```
- Verify `CODEWORDS_API_KEY` is set
- Redeploy after adding environment variables

### Issue: CORS Errors
**Solution**: API already has CORS enabled
- Check browser console for specific error
- Verify API endpoint URL is correct
- Ensure using HTTPS in production

### Issue: 404 on Page Refresh
**Solution**: Already handled in `vercel.json`
- Vercel automatically handles SPA routing
- No additional configuration needed

### Issue: Build Artifacts Too Large
**Solution**: Optimize build
```bash
cd landing-page
npm run build -- --stats
```
- Check bundle size
- Remove unused dependencies
- Use code splitting if needed

## 🔄 Continuous Deployment

### Automatic Deployments

**Production Deployments:**
- Triggered by: Push to `main` branch
- URL: `https://your-project.vercel.app`

**Preview Deployments:**
- Triggered by: Pull requests
- URL: `https://your-project-<hash>.vercel.app`

### Configure Deployment Branch

In `vercel.json` or Vercel Dashboard:
```json
{
  "git": {
    "deploymentEnabled": {
      "main": true,
      "dev": false
    }
  }
}
```

## 🎯 Performance Optimization

### Enable Vercel Speed Insights
```bash
npm install @vercel/speed-insights --save
```

Add to `landing-page/src/index.js`:
```javascript
import { injectSpeedInsights } from '@vercel/speed-insights';
injectSpeedInsights();
```

### Enable Vercel Analytics
```bash
npm install @vercel/analytics --save
```

Add to `landing-page/src/index.js`:
```javascript
import { Analytics } from '@vercel/analytics/react';

// In your root component
<Analytics />
```

## 📋 Checklist

Before going live, verify:

- [ ] Environment variable `CODEWORDS_API_KEY` is set in Vercel
- [ ] Landing page loads at root URL
- [ ] API endpoint accessible at `/api/onboard`
- [ ] Form validation works correctly
- [ ] API calls complete successfully
- [ ] Error messages display properly
- [ ] Mobile responsive design works
- [ ] HTTPS is enabled (automatic on Vercel)
- [ ] Custom domain configured (optional)
- [ ] Analytics enabled (optional)

## 🆘 Support Resources

- **Vercel Documentation**: https://vercel.com/docs
- **Vercel Support**: https://vercel.com/support
- **API Documentation**: See `/api/README.md`
- **Landing Page Guide**: See `/landing-page/DEPLOYMENT_GUIDE.md`

## 📞 Quick Commands Reference

```bash
# Deploy to production
vercel --prod

# Deploy to preview
vercel

# View logs
vercel logs

# List environment variables
vercel env ls

# Add environment variable
vercel env add VARIABLE_NAME

# Remove environment variable
vercel env rm VARIABLE_NAME

# Pull environment variables to local
vercel env pull

# View domains
vercel domains ls

# Add domain
vercel domains add example.com
```

## ✅ Post-Deployment Verification

1. **Test Landing Page**
   - Open `https://your-project.vercel.app`
   - Fill form with test data
   - Submit and verify success

2. **Test API Directly**
   ```bash
   curl -X POST https://your-project.vercel.app/api/onboard \
     -H "Content-Type: application/json" \
     -d '{"phoneNumber":"+447401234567","githubRepo":"test/repo"}'
   ```

3. **Check Logs**
   ```bash
   vercel logs --follow
   ```

4. **Verify Environment Variables**
   ```bash
   vercel env ls
   ```

---

## 🎉 Success!

Your GhostHub landing page and API are now live on Vercel!

**Next Steps:**
1. Share the URL with your users
2. Monitor usage in Vercel Analytics
3. Set up custom domain (optional)
4. Enable monitoring and alerts

---

**Current Status**: ✅ Ready for Production Deployment

**Deployment Time**: ~5 minutes

**Estimated Cost**: Free (Hobby plan) or $20/month (Pro plan)
