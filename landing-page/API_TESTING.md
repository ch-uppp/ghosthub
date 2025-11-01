# API Testing & Verification

This document provides testing instructions for the GhostHub landing page API integration.

## What Was Changed

### 1. API Handler (`/api/onboard.js`)
- **Added**: Complete field transformation from camelCase to snake_case
- **Added**: Support for all fields from the specification
- **Added**: Proper error handling with success/error responses
- **Added**: Authorization header using `CODEWORDS_API_KEY` environment variable

### 2. React Form (`ConfigForm.js`)
- **Changed**: Form now calls `/api/onboard` instead of direct CodeWords API
- **Added**: `trigger_copilot` field with UI toggle
- **Fixed**: Permission handling for "only me" option
- **Added**: Proper camelCase payload construction

### 3. Standalone HTML Form
- **Added**: `public/setup.html` - Simple HTML form
- **Added**: `public/form-handler.js` - Form submission logic
- Both match the exact specification from the issue

### 4. Vercel Configuration
- **Added**: `vercel.json` for deployment configuration
- **Configured**: API routes, build settings, and environment variables

## Field Mapping Verification

### Frontend → API → CodeWords

```
User Input:
  phone: "+447401234567"
  repo: "microsoft/vscode"
  access: "only_me"
  keywords: "urgent, blocker"
  confirmations: ✓ (checked)
  copilot: ✓ (checked)

      ↓

Frontend Payload (camelCase):
{
  "phoneNumber": "+447401234567",
  "githubRepo": "microsoft/vscode",
  "allowedPhones": ["+447401234567"],
  "customKeywords": ["urgent", "blocker"],
  "enableConfirmations": true,
  "triggerCopilot": true
}

      ↓

API Transformation (snake_case):
{
  "phone_number": "+447401234567",
  "github_repo": "microsoft/vscode",
  "allowed_phone_numbers": ["+447401234567"],
  "custom_keywords": ["urgent", "blocker"],
  "enable_confirmations": true,
  "trigger_copilot": true
}
```

## Automated Tests Performed

### Test 1: API Payload Transformation
✅ **PASSED** - Verified camelCase to snake_case transformation
- Input: All fields in camelCase format
- Output: All fields correctly transformed to snake_case
- Test file: `/tmp/test-api-handler.js`

### Test 2: Default Values
✅ **PASSED** - Verified default value handling
- When optional fields omitted:
  - `allowed_phone_numbers` → `null`
  - `custom_keywords` → `[]`
  - `enable_confirmations` → `true`
  - `trigger_copilot` → `false`

### Test 3: Form Handler Logic
✅ **PASSED** - Verified form value transformation
- Access control "only_me" correctly sets `allowedPhones: [phoneNumber]`
- Access control "all" correctly sets `allowedPhones: null`
- Keywords correctly parsed from comma-separated string
- All boolean values correctly passed through
- Test file: `/tmp/test-form-handler.js`

### Test 4: Build Verification
✅ **PASSED** - React build compiles successfully
- No TypeScript/JavaScript errors
- All dependencies resolved
- Production build optimized and ready

## Manual Testing Checklist

Before deploying to production, perform these manual tests:

### React App Testing

1. **Navigate to the form**
   ```
   http://localhost:3000/configure
   ```

2. **Test Case 1: Full Form**
   - [ ] Enter phone number: `+447401234567`
   - [ ] Enter repo: `microsoft/vscode`
   - [ ] Select access: "Only me"
   - [ ] Add keywords: `urgent, blocker`
   - [ ] Enable confirmations: ✓
   - [ ] Enable Copilot: ✓
   - [ ] Submit and verify success message

3. **Test Case 2: Minimal Form**
   - [ ] Enter phone number: `+1234567890`
   - [ ] Enter repo: `user/repo`
   - [ ] Leave all optional fields default
   - [ ] Submit and verify success message

4. **Test Case 3: Validation**
   - [ ] Try invalid phone: `123` - Should show error
   - [ ] Try invalid repo: `no-slash` - Should show error
   - [ ] Fix and submit successfully

### Standalone HTML Form Testing

1. **Navigate to standalone form**
   ```
   http://localhost:3000/setup.html
   ```

2. **Repeat test cases 1-3** from React app
   - Verify behavior is identical
   - Verify error messages display correctly
   - Verify success instructions appear

### API Endpoint Testing

Test with curl (requires `CODEWORDS_API_KEY` environment variable):

```bash
curl -X POST http://localhost:3000/api/onboard \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+447401234567",
    "githubRepo": "microsoft/vscode",
    "allowedPhones": ["+447401234567"],
    "customKeywords": ["urgent"],
    "enableConfirmations": true,
    "triggerCopilot": true
  }'
```

Expected response:
```json
{
  "success": true,
  "message": "Bot configured successfully!",
  "instructions": "..."
}
```

## Vercel Deployment Testing

After deploying to Vercel:

1. **Verify environment variable**
   ```bash
   vercel env ls
   ```
   Should show: `CODEWORDS_API_KEY`

2. **Test deployed API**
   ```bash
   curl -X POST https://your-project.vercel.app/api/onboard \
     -H "Content-Type: application/json" \
     -d '{"phoneNumber":"+1234567890","githubRepo":"test/repo"}'
   ```

3. **Test both forms**
   - https://your-project.vercel.app/configure
   - https://your-project.vercel.app/setup.html

4. **Check logs**
   ```bash
   vercel logs
   ```

## Known Limitations

1. **CODEWORDS_API_KEY Required**: The API endpoint requires this environment variable to be set
2. **CORS**: API allows all origins (`*`) - consider restricting in production
3. **Rate Limiting**: No rate limiting implemented - consider adding in production
4. **Input Validation**: Basic validation in frontend, but backend should add more robust validation

## Troubleshooting

### Issue: "Missing required fields" error
**Solution**: Ensure `phoneNumber` and `githubRepo` are present in request body (camelCase)

### Issue: "Method not allowed"
**Solution**: Ensure request method is POST, not GET

### Issue: Authorization errors
**Solution**: Check that `CODEWORDS_API_KEY` environment variable is set correctly

### Issue: Build fails
**Solution**: Run `npm install` and check for dependency issues

### Issue: Form doesn't submit
**Solution**: Check browser console for JavaScript errors, verify `/api/onboard` endpoint is accessible

## Success Criteria

All following must be true before marking as complete:

- [x] API handler transforms all fields correctly
- [x] React form sends correct payload format
- [x] Standalone HTML form sends correct payload format  
- [x] Build compiles without errors
- [x] vercel.json properly configured
- [x] Documentation complete (README, DEPLOYMENT, API_TESTING)
- [ ] Manual testing completed
- [ ] Deployed to Vercel successfully
- [ ] Code review passed
