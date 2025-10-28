# GhostHub Testing Guide

This guide provides examples and test cases for the multimodal AI integration.

## Testing Image Detection

### Test Case 1: Basic Image Detection

1. **Setup:**
   - Load the extension in Chrome
   - Navigate to Slack/Discord/WhatsApp Web
   - Open a conversation

2. **Action:**
   - Share any image in the chat (screenshot, photo, diagram)

3. **Expected Result:**
   - Image should be detected automatically
   - A green border (2px solid rgba(67, 160, 71, 0.3)) should appear around the image
   - Console should log: `[GhostHub] Detected 1 new image(s)`

### Test Case 2: Multiple Images

1. **Action:**
   - Share multiple images in a single message or across multiple messages

2. **Expected Result:**
   - All images should be detected and highlighted
   - Console should log the correct count: `[GhostHub] Detected X new image(s)`

## Testing Multimodal AI Analysis

### Test Case 3: Error Screenshot Analysis

1. **Prepare Test Image:**
   - Take a screenshot of a browser console showing an error:
     ```
     Uncaught TypeError: Cannot read property 'id' of undefined
         at app.js:123
     ```

2. **Action:**
   - Share the screenshot in chat
   - Click "👻 Create GitHub Issue"

3. **Expected Result:**
   - Draft issue should contain:
     - Error messages extracted from the screenshot
     - Context describing what the image shows
     - Labels including 'bug', 'error', and 'has-screenshot'

### Test Case 4: UI Bug Screenshot

1. **Prepare Test Image:**
   - Take a screenshot showing a visual bug (misaligned buttons, broken layout, etc.)

2. **Action:**
   - Share the screenshot with accompanying text: "Login button is broken"
   - Click "👻 Create GitHub Issue"

3. **Expected Result:**
   - Draft issue should contain:
     - Text from the message
     - Screenshot analysis describing the UI issue
     - Context about the visual problem
     - Label 'has-screenshot'

### Test Case 5: Code Snippet Screenshot

1. **Prepare Test Image:**
   - Take a screenshot of code with visible text

2. **Action:**
   - Share with message: "This function needs refactoring"
   - Click "👻 Create GitHub Issue"

3. **Expected Result:**
   - Draft issue should extract visible code text
   - Context should describe the code content
   - Combined with message text in summary

## Testing Message Analysis

### Test Case 6: Bug Report with Screenshot

1. **Action:**
   ```
   Message 1: "I'm getting an error when trying to upload files"
   Message 2: [Screenshot of error stack trace]
   Message 3: "This happens every time I select a PDF"
   ```
   - Click "👻 Create GitHub Issue"

2. **Expected Result:**
   - Title: "Bug: I'm getting an error when trying to upload files"
   - Body includes all three messages
   - Screenshot analysis with extracted error
   - Labels: ['bug', 'error', 'has-screenshot']

### Test Case 7: Feature Request with Mockup

1. **Action:**
   ```
   Message: "We should add a dark mode toggle"
   [Screenshot of UI mockup]
   ```
   - Click "👻 Create GitHub Issue"

2. **Expected Result:**
   - Title: "Feature: We should add a dark mode toggle"
   - Body includes message and mockup analysis
   - Labels: ['enhancement', 'has-screenshot']

## Testing GitHub Integration

### Test Case 8: Configuration

1. **Action:**
   - Click GhostHub extension icon
   - Enter GitHub owner: `test-user`
   - Enter repo: `test-repo`
   - Enter token: `ghp_test123...`
   - Click "Save Configuration"

2. **Expected Result:**
   - Status message: "Configuration saved successfully!"
   - Configuration persisted in chrome.storage.local
   - Background service worker receives config update

### Test Case 9: Draft Management

1. **Action:**
   - Create several draft issues from different conversations
   - Open extension popup

2. **Expected Result:**
   - All drafts listed with:
     - Title
     - Source platform (slack/discord/whatsapp)
     - Timestamp
     - Labels
   - "Publish to GitHub" button for each draft
   - Delete button (🗑️) for each draft

### Test Case 10: Publishing to GitHub

1. **Prerequisites:**
   - Valid GitHub configuration
   - At least one draft issue

2. **Action:**
   - Click "Publish to GitHub" on a draft

3. **Expected Result:**
   - Status: "Publishing issue to GitHub..."
   - Issue created in GitHub repository
   - Status: "Issue #X created successfully!"
   - Draft removed from list
   - New tab opened with GitHub issue

### Test Case 11: Delete Draft

1. **Action:**
   - Click 🗑️ button on a draft

2. **Expected Result:**
   - Status: "Draft deleted"
   - Draft removed from list
   - Draft removed from storage

## Testing Edge Cases

### Test Case 12: No Images in Conversation

1. **Action:**
   - Send text messages without images
   - Click "👻 Create GitHub Issue"

2. **Expected Result:**
   - Issue created successfully with only text analysis
   - No screenshot section in summary
   - No 'has-screenshot' label

### Test Case 13: Images Only, No Text

1. **Action:**
   - Share only images without text messages
   - Click "👻 Create GitHub Issue"

2. **Expected Result:**
   - Issue created with screenshot analysis
   - Summary contains only screenshot section
   - Labels include 'has-screenshot'

### Test Case 14: Multimodal API Unavailable

1. **Setup:**
   - Test with Chrome version without AI APIs or flags disabled

2. **Expected Result:**
   - Extension still functions
   - Image detection works (visual indicators)
   - Image analysis gracefully fails
   - Console warning: "Chrome Multimodal API not available"
   - Issues created with text-only analysis

### Test Case 15: Invalid GitHub Configuration

1. **Action:**
   - Configure with invalid token or repo
   - Try to publish a draft

2. **Expected Result:**
   - Error message displayed
   - Draft not deleted
   - User can fix configuration and retry

### Test Case 16: CORS/Image Load Errors

1. **Action:**
   - Share image from external source with CORS restrictions

2. **Expected Result:**
   - Image detected and highlighted
   - Attempt to analyze image
   - Fallback to canvas extraction if direct fetch fails
   - Error logged but doesn't crash extension

## Performance Testing

### Test Case 17: Large Conversations

1. **Action:**
   - Create issue from conversation with 50+ messages

2. **Expected Result:**
   - Only last 10 messages analyzed (as per implementation)
   - Reasonable processing time (< 5 seconds)
   - No browser freezing or lag

### Test Case 18: Multiple Large Images

1. **Action:**
   - Share 5+ high-resolution screenshots
   - Create issue

2. **Expected Result:**
   - All images processed sequentially
   - Progress visible in console logs
   - Draft created successfully

## Manual Verification Checklist

- [ ] Images detected and highlighted in Slack
- [ ] Images detected and highlighted in Discord  
- [ ] Images detected and highlighted in WhatsApp
- [ ] Error messages extracted from screenshots
- [ ] UI issues described in screenshot analysis
- [ ] Text visible in screenshots extracted
- [ ] Context generated for screenshots
- [ ] Text and image analysis combined properly
- [ ] Draft issues created and stored
- [ ] GitHub configuration saved and loaded
- [ ] Issues published to GitHub successfully
- [ ] Drafts deleted successfully
- [ ] Extension works without multimodal API (graceful degradation)
- [ ] UI button appears and works on all platforms
- [ ] Notifications display correctly
- [ ] No console errors in normal operation

## Debugging Tips

1. **Check Console Logs:**
   - Look for `[GhostHub]` prefixed messages
   - Check for initialization messages
   - Verify image detection logs

2. **Verify Chrome AI APIs:**
   ```javascript
   // In browser console
   await window.ai.languageModel.capabilities()
   ```

3. **Check Storage:**
   ```javascript
   // In browser console
   chrome.storage.local.get(null, console.log)
   ```

4. **Inspect Elements:**
   - Check for `data-ghosthub-processed="true"` on images
   - Verify button injection in DOM
   - Check for style attribute with green border

5. **Network Tab:**
   - Monitor GitHub API calls
   - Check for image fetch requests
   - Verify authentication headers
