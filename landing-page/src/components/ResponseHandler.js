import React from 'react';

const ResponseHandler = ({ type, message, onClose }) => {
  if (!type || !message) return null;

  const isSuccess = type === 'success';

  return (
    <div
      className={`fixed top-4 right-4 max-w-md p-4 rounded-md shadow-lg border animate-slide-in ${
        isSuccess
          ? 'bg-green-50 border-green-200'
          : 'bg-red-50 border-red-200'
      }`}
      data-testid={`response-${type}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          {isSuccess ? (
            <svg
              className="w-6 h-6 text-github-success flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ) : (
            <svg
              className="w-6 h-6 text-github-error flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          )}
          <div>
            <h4
              className={`font-semibold mb-1 ${
                isSuccess ? 'text-github-success' : 'text-github-error'
              }`}
            >
              {isSuccess ? 'Success!' : 'Error'}
            </h4>
            <p className="text-sm text-github-dark">{message}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          data-testid="close-response"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ResponseHandler;
