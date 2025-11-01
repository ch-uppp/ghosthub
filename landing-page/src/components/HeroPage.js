import React from 'react';
import { useNavigate } from 'react-router-dom';

const HeroPage = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/configure');
  };

  const features = [
    {
      icon: (
        <svg className="w-8 h-8 text-github-accent" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      ),
      title: 'GitHub Integration',
      description: 'Seamlessly create issues directly in your GitHub repositories'
    },
    {
      icon: (
        <svg className="w-8 h-8 text-github-accent" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
          <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
        </svg>
      ),
      title: 'WhatsApp Monitoring',
      description: 'Automatically detect bugs and feature requests from your chats'
    },
    {
      icon: (
        <svg className="w-8 h-8 text-github-accent" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
        </svg>
      ),
      title: 'Instant Tracking',
      description: 'Turn chat chaos into organized, trackable GitHub issues'
    }
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="max-w-4xl w-full text-center">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <img 
              src="https://customer-assets.emergentagent.com/job_f9e36b90-66da-4335-a14d-745edc85e7b4/artifacts/kfxgfn85_github-ghost-cutout-circle.svg" 
              alt="GhostHub Logo" 
              className="w-24 h-24 md:w-32 md:h-32"
              data-testid="hero-logo"
            />
          </div>

          {/* Title */}
          <h1 className="text-5xl md:text-6xl font-bold text-github-dark mb-6" data-testid="hero-title">
            GhostHub
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-github-muted mb-10 max-w-3xl mx-auto leading-relaxed" data-testid="hero-subtitle">
            Automatically create and track issues in GitHub, from reported bugs and feature requests in your WhatsApp groups.
          </p>

          {/* CTA Button */}
          <button
            onClick={handleGetStarted}
            className="inline-flex items-center gap-2 px-8 py-4 bg-github-accent text-white text-lg font-semibold rounded-md hover:bg-github-hover transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
            data-testid="get-started-button"
          >
            Get Started
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
      </main>

      {/* Features Section */}
      <section className="bg-gray-50 border-t border-github-border py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="bg-white p-6 rounded-lg border border-github-border hover:shadow-md transition-shadow duration-200"
                data-testid={`feature-card-${index}`}
              >
                <div className="flex justify-center mb-4 p-3 bg-blue-50 rounded-lg w-fit">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-github-dark mb-3">
                  {feature.title}
                </h3>
                <p className="text-github-muted leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Coming Soon Section */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-github-accent rounded-full mb-4">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-semibold">Coming Soon</span>
          </div>
          
          <h2 className="text-3xl font-bold text-github-dark mb-4">
            Expanding to More Platforms
          </h2>
          
          <p className="text-lg text-github-muted mb-8">
            GhostHub for <span className="font-semibold text-github-dark">Slack</span> and <span className="font-semibold text-github-dark">Discord</span> is coming soon.
          </p>
          
          <div className="flex justify-center gap-4">
            <div className="flex items-center gap-2 px-4 py-3 bg-white border border-github-border rounded-md">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/>
              </svg>
              <span className="font-semibold text-github-dark">Slack</span>
            </div>
            
            <div className="flex items-center gap-2 px-4 py-3 bg-white border border-github-border rounded-md">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#5865F2">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
              <span className="font-semibold text-github-dark">Discord</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-github-border py-8 px-6">
        <div className="max-w-6xl mx-auto">
          <p className="text-center text-github-muted text-sm">
            &copy; {new Date().getFullYear()} GhostHub. Turn chat chaos into GitHub issues.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default HeroPage;
