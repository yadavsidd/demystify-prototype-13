import React from 'react';
import LoadingSpinner from './LoadingSpinner';

interface SubmitButtonProps {
  onClick: () => void;
  isLoading: boolean;
  disabled?: boolean;
  text?: string;
  loadingText?: string;
}

const SubmitButton: React.FC<SubmitButtonProps> = ({ onClick, isLoading, disabled, text = 'Submit', loadingText = 'Submitting...' }) => {
  return (
    <button
      onClick={onClick}
      disabled={isLoading || disabled}
      className="w-full flex justify-center items-center px-6 py-3 border border-transparent text-base font-bold rounded-md shadow-sm text-black bg-[var(--accent-color)] hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-[var(--accent-color)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
    >
      {isLoading ? (
        <>
          <LoadingSpinner className="w-5 h-5 mr-3" />
          {loadingText}
        </>
      ) : (
        text
      )}
    </button>
  );
};

export default SubmitButton;