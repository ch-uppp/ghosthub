import React from 'react';

const Instructions = ({ apiResponse }) => {

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
    </div>
  );
};

export default Instructions;
