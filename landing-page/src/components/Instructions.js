import React, { useState } from 'react';

const Instructions = ({ apiResponse }) => {
  const [isTestingExpanded, setIsTestingExpanded] = useState(false);

  const defaultInstructions = [
    {
      title: 'Add the Bot to WhatsApp',
      content: 'Save the bot number provided in the confirmation to your contacts and add it to your WhatsApp group.'
    },
    {
      title: 'Mention the Bot',
      content: 'In your WhatsApp group, mention @GhostHub or tag the bot when reporting a bug or requesting a feature.'
    },
    {
      title: 'Wait for Confirmation',
      content: 'The bot will automatically create a GitHub issue and send a confirmation message (if enabled) with the issue link.'
    },
    {
      title: 'Default Keywords',
      content: 'The bot detects keywords like "bug", "issue", "error", "feature", "request", "enhancement" and your custom keywords to create issues automatically.'
    }
  ];

  const exampleCurlCommand = `curl -X POST https://runtime.codewords.ai/run/whatsapp_github_issue_bot_multi_ef3a9abf/ \\
  -H "Content-Type: application/json" \\
  -d '{
    "phone_number": "+447401234567",
    "github_repo": "owner/repository",
    "allowed_phone_numbers": null,
    "custom_keywords": ["urgent", "critical"],
    "enable_confirmations": true
  }'`;

  return (
    <div className="space-y-8">
      {/* Setup Instructions */}
      <div data-testid="setup-instructions">
        <h2 className="text-2xl font-bold text-github-dark mb-4">Setup Instructions</h2>
        <div className="space-y-4">
          {defaultInstructions.map((instruction, index) => (
            <div key={index} className="border border-github-border rounded-md p-4">
              <h3 className="font-semibold text-github-dark mb-2">{index + 1}. {instruction.title}</h3>
              <p className="text-github-muted">{instruction.content}</p>
            </div>
          ))}
        </div>
      </div>

      {/* API Response Instructions (if available) */}
      {apiResponse && apiResponse.instructions && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4" data-testid="api-instructions">
          <h3 className="font-semibold text-github-success mb-2">Next Steps:</h3>
          <p className="text-github-dark whitespace-pre-line">{apiResponse.instructions}</p>
        </div>
      )}

      {/* Testing Section */}
      <div className="border border-github-border rounded-md" data-testid="testing-section">
        <button
          onClick={() => setIsTestingExpanded(!isTestingExpanded)}
          className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
          data-testid="testing-toggle"
        >
          <span className="font-semibold text-github-dark">Testing the API Manually</span>
          <svg
            className={`w-5 h-5 transform transition-transform ${isTestingExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {isTestingExpanded && (
          <div className="px-4 pb-4 border-t border-github-border">
            <p className="text-github-muted mb-3 mt-3">You can test the API manually using curl:</p>
            <pre className="bg-gray-900 text-green-400 p-4 rounded-md overflow-x-auto font-mono text-sm" data-testid="curl-example">
              {exampleCurlCommand}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default Instructions;
