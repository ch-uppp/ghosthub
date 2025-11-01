document.getElementById('setup-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const submitBtn = document.getElementById('submit-btn');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Setting up...';

  // ========================================
  // STEP 1: Collect form values
  // ========================================
  const phoneNumber = document.getElementById('phone').value;
  const githubRepo = document.getElementById('repo').value;
  const accessControl = document.getElementById('access').value;
  const keywordsInput = document.getElementById('keywords').value;
  const enableConfirmations = document.getElementById('confirmations').checked;
  const triggerCopilot = document.getElementById('copilot').checked;

  // ========================================
  // STEP 2: Transform access control
  // ========================================
  let allowedPhones = null;  // Default: all members
  if (accessControl === 'only_me') {
    allowedPhones = [phoneNumber];  // Only the client
  }

  // ========================================
  // STEP 3: Parse custom keywords
  // ========================================
  const customKeywords = keywordsInput
    ? keywordsInput.split(',').map(k => k.trim()).filter(k => k)
    : [];

  // ========================================
  // STEP 4: Build API payload
  // ========================================
  const payload = {
    phoneNumber: phoneNumber,
    githubRepo: githubRepo,
    allowedPhones: allowedPhones,
    customKeywords: customKeywords,
    enableConfirmations: enableConfirmations,
    triggerCopilot: triggerCopilot
  };

  console.log('Sending payload:', payload);

  // ========================================
  // STEP 5: Call YOUR Vercel function
  // ========================================
  try {
    const response = await fetch('/api/onboard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (response.ok && result.success) {
      // ========================================
      // SUCCESS: Show instructions
      // ========================================
      document.getElementById('result').innerHTML = `
        <div class="success">
          <h2>✅ ${result.message}</h2>
          <div class="instructions">
            <pre>${result.instructions}</pre>
          </div>
        </div>
      `;
    } else {
      // Error
      document.getElementById('result').innerHTML = `
        <div class="error">
          <h3>❌ Setup Failed</h3>
          <p>${result.error || result.message || 'Unknown error'}</p>
        </div>
      `;
    }
  } catch (error) {
    document.getElementById('result').innerHTML = `
      <div class="error">
        <h3>❌ Connection Error</h3>
        <p>${error.message}</p>
      </div>
    `;
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Complete Setup';
  }
});
