export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { phoneNumber, githubRepo, triggerCopilot } = req.body;

    if (!phoneNumber || !githubRepo) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const response = await fetch(
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
          trigger_copilot: triggerCopilot ?? false
        })
      }
    );

    const result = await response.json();
    return res.status(response.status).json(result);

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

