export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Accept frontend format (camelCase)
    const { 
      phoneNumber, 
      githubRepo, 
      allowedPhones, 
      customKeywords, 
      enableConfirmations, 
      triggerCopilot 
    } = req.body;

    // Validate required fields
    if (!phoneNumber || !githubRepo) {
      return res.status(400).json({ error: 'Missing required fields: phoneNumber and githubRepo are required' });
    }

    // Transform to API format (snake_case)
    const apiPayload = {
      phone_number: phoneNumber,
      github_repo: githubRepo,
      allowed_phone_numbers: allowedPhones || null,
      custom_keywords: customKeywords || [],
      enable_confirmations: enableConfirmations ?? true,
      trigger_copilot: triggerCopilot ?? false
    };

    console.log('Sending to CodeWords API:', apiPayload);

    const response = await fetch(
      'https://runtime.codewords.ai/run/whatsapp_github_issue_bot_multi_ef3a9abf/',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': process.env.CODEWORDS_API_KEY
        },
        body: JSON.stringify(apiPayload)
      }
    );

    const result = await response.json();
    
    // Return success response with proper format
    if (response.ok) {
      return res.status(200).json({
        success: true,
        message: result.message || 'Bot configured successfully!',
        instructions: result.instructions || 'Please check your WhatsApp for further instructions.',
        ...result
      });
    } else {
      return res.status(response.status).json({
        success: false,
        error: result.error || result.message || 'Configuration failed',
        ...result
      });
    }

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      success: false,
      error: error.message || 'Internal server error' 
    });
  }
}

