export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      phoneNumber,
      githubRepo,
      allowedPhones,
      customKeywords,
      enableConfirmations,
      triggerCopilot // Copilot assignment toggle
    } = req.body;

    // Validate inputs
    if (!phoneNumber || !githubRepo) {
      return res.status(400).json({ 
        error: 'phoneNumber and githubRepo required' 
      });
    }

    // Call CodeWords Multi-Client Bot
    const codewordsResponse = await fetch(
      'https://runtime.codewords.ai/run/whatsapp_github_issue_bot_multi_ef3a9abf/',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': process.env.CODEWORDS_API_KEY
        },
        body: JSON.stringify({
          phone_number: phoneNumber,
          github_repo: githubRepo,
          allowed_phone_numbers: allowedPhones || null,
          custom_keywords: customKeywords || [],
          enable_confirmations: enableConfirmations ?? true,
          trigger_copilot: triggerCopilot ?? false
        })
      }
    );

    const result = await codewordsResponse.json();
    return res.status(codewordsResponse.status).json(result);
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      error: 'Server error',
      message: error.message
    });
  }
}
