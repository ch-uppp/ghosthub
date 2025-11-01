import React, { useState } from 'react';
import Header from './Header';
import ConfigForm from './ConfigForm';
import Instructions from './Instructions';
import ResponseHandler from './ResponseHandler';

const ConfigPage = () => {
  const [response, setResponse] = useState(null);
  const [apiResponseData, setApiResponseData] = useState(null);

  const handleSuccess = (data) => {
    setApiResponseData(data);
    setResponse({
      type: 'success',
      message: data.message || 'Bot configured successfully! Check the instructions below for next steps.'
    });
    // Auto-hide after 5 seconds
    setTimeout(() => setResponse(null), 5000);
  };

  const handleError = (errorMessage) => {
    setResponse({
      type: 'error',
      message: errorMessage
    });
    // Auto-hide after 5 seconds
    setTimeout(() => setResponse(null), 5000);
  };

  const closeResponse = () => {
    setResponse(null);
  };

  return (
    <div className="min-h-screen bg-white" data-testid="config-page">
      <Header />
      
      {/* Response Handler */}
      {response && (
        <ResponseHandler
          type={response.type}
          message={response.message}
          onClose={closeResponse}
        />
      )}

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Form Section */}
          <div>
            <h2 className="text-2xl font-bold text-github-dark mb-6" data-testid="form-section-title">
              Configure Your Bot
            </h2>
            <ConfigForm onSuccess={handleSuccess} onError={handleError} />
          </div>

          {/* Instructions Section */}
          <div>
            <Instructions apiResponse={apiResponseData} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-github-border mt-16">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <p className="text-center text-github-muted text-sm">
            &copy; {new Date().getFullYear()} GhostHub. Turn chat chaos into GitHub issues.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default ConfigPage;
