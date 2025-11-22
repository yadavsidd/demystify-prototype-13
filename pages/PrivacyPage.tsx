
import React from 'react';
import type { Page } from '../types';
import { ShieldCheckIcon } from '../components/icons';
import { CornerBorderContainer } from '@/components/ui/corner-border-container';

interface PrivacyPageProps {
  onNavigate: (page: Page) => void;
}

const PrivacyPage: React.FC<PrivacyPageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
      <CornerBorderContainer className="w-full max-w-3xl mx-auto p-8">
        <div className="text-center mb-8">
          <ShieldCheckIcon className="w-16 h-16 mx-auto text-[var(--accent-color)]" />
          <h1 className="mt-4 text-3xl font-extrabold text-white font-heading tracking-tight">
            Privacy & Security
          </h1>
          <p className="mt-2 text-lg text-gray-400">
            Your trust and data privacy are our top priority.
          </p>
        </div>

        <div className="space-y-6 text-gray-300 leading-relaxed prose prose-invert max-w-none">
          <section>
            <h2 className="text-xl font-semibold text-gray-200">1. Ephemeral Processing: We Don't Store Your Documents</h2>
            <p>
              When you upload a document to Demystify, it is processed in memory for the sole purpose of analysis, translation, or drafting. <strong>Your files and their contents are never stored on our servers or written to disk.</strong> Once the AI processing is complete and the result is sent back to you, the original document data is discarded.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-200">2. Secure Communication with AI Provider</h2>
            <p>
              We use Google's Gemini API to power our features. All communication between your browser, our system, and the Google API is encrypted using industry-standard protocols (HTTPS/TLS).
            </p>
            <p>
              Crucially, Google has a strong privacy policy for its API services, which states that **they do not use data from API calls to train their models.** This means the content of your documents is not used to improve their AI, further protecting your confidentiality.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-200">3. Analysis History</h2>
            <p>
              The "History" feature saves the AI-generated *analysis results* (like the summary, red flags, etc.) to your browser's local storage. This data stays on your device and is not sent to our servers. Your original document content is never saved as part of this history.
            </p>
          </section>

           <section>
            <h2 className="text-xl font-semibold text-gray-200">4. No Sale of Data</h2>
            <p>
              We are committed to protecting your privacy. We will never sell, rent, or share your personal data or the contents of your documents with any third parties for marketing or any other purposes.
            </p>
          </section>
        </div>

        <div className="mt-10 text-center">
          <button
            onClick={() => onNavigate('landing')}
            className="px-6 py-2 text-sm font-semibold rounded-md text-black bg-[var(--accent-color)] hover:opacity-90"
          >
            &larr; Back to Home
          </button>
        </div>
      </CornerBorderContainer>
    </div>
  );
};

export default PrivacyPage;
