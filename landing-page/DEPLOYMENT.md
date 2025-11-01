# Deploying to Vercel

This guide explains how to deploy GhostHub's landing page to Vercel.

## Prerequisites

- Vercel account (https://vercel.com)
- GitHub repository access
- CodeWords API key

## Deployment Steps

### 1. Connect Repository to Vercel

1. Go to https://vercel.com/new
2. Import your GitHub repository `ch-uppp/ghosthub`
3. Select the `landing-page` directory as the root

### 2. Configure Build Settings

Vercel will automatically detect the React app and configure:
- **Framework Preset**: Create React App
- **Build Command**: `npm run vercel-build` (automatically used by Vercel)
- **Output Directory**: `build`
- **Install Command**: `npm install`

Note: The `vercel-build` script is defined in `package.json` and will be used automatically by Vercel when deploying.

### 3. Set Environment Variables

In your Vercel project settings, add the following environment variable:

- **Key**: `CODEWORDS_API_KEY`
- **Value**: Your CodeWords API key
- **Scope**: Production, Preview, and Development

To add it via Vercel CLI:
```bash
vercel env add CODEWORDS_API_KEY
```

### 4. Deploy

Deploy using one of these methods:

**Via Vercel Dashboard:**
- Push to your main branch or PR branch
- Vercel will automatically deploy

**Via Vercel CLI:**
```bash
cd landing-page
vercel
```

For production:
```bash
vercel --prod
```

## Project Structure

```
landing-page/
├── api/
│   └── onboard.js          # Vercel serverless function
├── public/
│   ├── index.html          # Main React app entry
│   ├── setup.html          # Standalone form (alternative)
│   └── form-handler.js     # Standalone form handler
├── src/
│   └── components/
│       ├── ConfigForm.js   # React form component
│       └── ...
├── vercel.json             # Vercel configuration
└── package.json
```

## API Endpoints

Once deployed, your API will be available at:

```
https://your-project.vercel.app/api/onboard
```

## Data Flow

### Frontend → API → CodeWords

1. **User fills form** with:
   - Phone number
   - GitHub repository
   - Access control settings
   - Custom keywords (optional)
   - Confirmations toggle
   - Copilot toggle

2. **Frontend sends** (camelCase format):
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

3. **Vercel API transforms** to snake_case and forwards to CodeWords:
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

4. **CodeWords responds** with setup instructions

## Access Options

Your deployment will have two forms:

1. **React App**: `https://your-project.vercel.app/configure`
   - Full React application with routing
   - Modern UI with Tailwind CSS

2. **Standalone Form**: `https://your-project.vercel.app/setup.html`
   - Simple HTML form
   - No build process required
   - Vanilla JavaScript

Both forms use the same `/api/onboard` endpoint.

## Troubleshooting

### API Key Issues

If you see authentication errors:
```bash
# Check environment variables
vercel env ls

# Add missing key
vercel env add CODEWORDS_API_KEY
```

### Build Failures

Check build logs:
```bash
vercel logs
```

Common issues:
- Missing dependencies: Run `npm install` locally to verify
- Build errors: Check `npm run build` locally

### CORS Issues

The API endpoint includes CORS headers:
```javascript
res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
```

## Local Development

Test locally before deploying:

```bash
# Install dependencies
npm install

# Start development server
npm start

# Test API locally with Vercel CLI
vercel dev
```

The API will be available at `http://localhost:3000/api/onboard`

## Monitoring

Monitor your deployment:
- **Dashboard**: https://vercel.com/dashboard
- **Analytics**: View in Vercel dashboard
- **Logs**: `vercel logs [deployment-url]`

## Custom Domain

To add a custom domain:
1. Go to Project Settings → Domains
2. Add your domain
3. Configure DNS records as instructed

## Security Notes

- Never commit the `CODEWORDS_API_KEY` to the repository
- Use environment variables for all sensitive data
- The API key is only accessible server-side in `/api/onboard.js`
- Frontend code never sees the API key

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Serverless Functions](https://vercel.com/docs/concepts/functions/serverless-functions)
- [Create React App Deployment](https://create-react-app.dev/docs/deployment/)
