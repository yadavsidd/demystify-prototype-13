
import React from 'react';
import LoadingSpinner from './LoadingSpinner';

interface ErrorMessageProps {
  message: string;
  onRunDiagnostic?: () => void;
  isTesting?: boolean;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onRunDiagnostic, isTesting }) => {
  const isQuotaError = /quota|429/i.test(message);
  const isInvalidApiKeyError = /API key not valid|invalid api key/i.test(message);

  const renderDiagnosticSection = () => {
    // Only render the diagnostic button if a handler is provided
    if (!onRunDiagnostic) {
      return null;
    }

    return (
      <div className="mt-3 pt-3 border-t border-yellow-500/30">
        <button
          onClick={onRunDiagnostic}
          disabled={isTesting}
          className="inline-flex items-center px-3 py-1.5 text-xs font-bold text-black bg-gray-300 rounded-md hover:bg-white transition-colors disabled:opacity-50"
        >
          {isTesting && <LoadingSpinner className="w-4 h-4 mr-2" />}
          {isTesting ? 'Testing Key...' : 'Run Diagnostic Test'}
        </button>
      </div>
    );
  };

  if (isQuotaError) {
    return (
      <div className="p-4 mt-4 text-sm text-yellow-300 rounded-lg bg-yellow-900/30 border border-yellow-500/50" role="alert">
        <h3 className="font-bold text-yellow-200">API Usage Limit Reached</h3>
        <p className="mt-1">
          You've exceeded the free tier usage limit for the Google Gemini API. To continue using the service without interruption, please enable billing on your Google Cloud project.
        </p>
         <p className="mt-2 text-xs text-yellow-400">
          <strong>Note:</strong> If you've just changed your API key, you must <strong>STOP</strong> and <strong>RESTART</strong> your local server for the change to take effect.
        </p>
        <a 
          href="https://aistudio.google.com/app/billing" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="inline-block mt-3 px-3 py-1.5 text-xs font-bold text-black bg-yellow-400 rounded-md hover:bg-yellow-300 transition-colors"
        >
          Set Up Billing &rarr;
        </a>
        {renderDiagnosticSection()}
      </div>
    );
  }

  if (isInvalidApiKeyError) {
    return (
       <div className="p-4 mt-4 text-sm text-red-300 rounded-lg bg-red-900/30 border border-red-500/50" role="alert">
        <h3 className="font-bold text-red-200">Invalid API Key</h3>
        <p className="mt-1">
          The Google Gemini API key you've provided is not valid.
        </p>
        <p className="mt-2 text-xs text-red-400">
          <strong>Troubleshooting:</strong><br/>
          1. Ensure the key in your <code>.env</code> file is correct.<br/>
          2. You must <strong>STOP</strong> and <strong>RESTART</strong> your local server after changing the <code>.env</code> file.
        </p>
        {renderDiagnosticSection()}
      </div>
    )
  }

  return (
    <div className="p-4 mt-4 text-sm text-red-300 rounded-lg bg-red-900/30 border border-red-500/50" role="alert">
      <span className="font-medium">Error:</span> {message}
    </div>
  );
};

export default ErrorMessage;
