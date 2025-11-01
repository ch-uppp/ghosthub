import React from 'react';

const Header = () => {
  return (
    <header className="bg-white border-b border-github-border">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center gap-4 mb-4">
          <img 
            src="https://customer-assets.emergentagent.com/job_f9e36b90-66da-4335-a14d-745edc85e7b4/artifacts/kfxgfn85_github-ghost-cutout-circle.svg" 
            alt="GhostHub Logo" 
            className="w-16 h-16"
            data-testid="ghosthub-logo"
          />
          <h1 className="text-4xl font-bold text-github-dark" data-testid="product-name">
            GhostHub
          </h1>
        </div>
        <p className="text-xl text-github-muted max-w-3xl" data-testid="tagline">
          Automatically create and track issues in GitHub, from reported bugs and feature requests in your WhatsApp groups.
        </p>
      </div>
    </header>
  );
};

export default Header;
