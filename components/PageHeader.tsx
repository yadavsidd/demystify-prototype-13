
import React from 'react';
import type { Page } from '../types';
import { DemystifierIcon, TranslatorIcon, DrafterIcon, GuideIcon, ScaleIcon } from './icons';
import { History } from 'lucide-react';

interface PageHeaderProps {
  currentPage: Page;
}

const pageDetails: Record<string, { title: string; description: string; icon: React.ReactNode }> = {
  demystifier: {
    title: 'Document Demystifier',
    description: 'Upload a document to get a simple summary, identify red flags, and understand key clauses.',
    icon: <DemystifierIcon className="w-10 h-10" />
  },
  translator: {
    title: 'Document Translator',
    description: 'Instantly translate your documents into various languages while preserving context.',
    icon: <TranslatorIcon className="w-10 h-10" />
  },
  drafter: {
    title: 'Contract Drafter',
    description: 'Generate basic contracts by filling out a form with your key details.',
    icon: <DrafterIcon className="w-10 h-10" />
  },
  guide: {
    title: 'Document Guide',
    description: 'Get step-by-step assistance with official procedures like passport applications or visa requirements.',
    icon: <GuideIcon className="w-10 h-10" />
  },
  history: {
    title: 'Analysis History',
    description: 'Review your past document analyses at any time.',
    icon: <History className="w-10 h-10" />
  },
  compare: {
    title: 'Document Comparison',
    description: 'Compare two documents side-by-side to identify differences, missing clauses, and risks.',
    icon: <ScaleIcon className="w-10 h-10" />
  }
};

const PageHeader: React.FC<PageHeaderProps> = ({ currentPage }) => {
  const details = pageDetails[currentPage];

  if (!details) return null;

  return (
    <div className="flex items-center space-x-4 mb-8">
        <div className="flex-shrink-0 p-3 rounded-lg bg-gray-900 text-gray-300">
            {details.icon}
        </div>
        <div>
            <h1 className="text-2xl font-bold text-white font-heading">{details.title}</h1>
            <p className="text-gray-400 mt-1">{details.description}</p>
        </div>
    </div>
  );
};

export default PageHeader;
