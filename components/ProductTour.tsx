import React, { useState } from 'react';
import { DemystifierIcon, TranslatorIcon, DrafterIcon, GuideIcon, CloseIcon } from './icons';

// Define tour steps
const tourSteps = [
    {
        icon: <DemystifierIcon className="w-16 h-16 text-[var(--accent-color)]" />,
        title: 'Document Demystifier',
        description: 'First, upload any document. Our AI will give you a simple summary, highlight red flags, and explain key clauses.'
    },
    {
        icon: <TranslatorIcon className="w-16 h-16 text-[var(--accent-color)]" />,
        title: 'Document Translator',
        description: 'Need to understand a document in another language? Instantly translate files while preserving their context.'
    },
    {
        icon: <DrafterIcon className="w-16 h-16 text-[var(--accent-color)]" />,
        title: 'Contract Drafter',
        description: 'Generate basic agreements like freelance contracts or bills of sale by simply filling out a form.'
    },
    {
        icon: <GuideIcon className="w-16 h-16 text-[var(--accent-color)]" />,
        title: 'Document Guide',
        description: 'Have questions about official procedures? Ask our AI guide for step-by-step help on passports, visas, and more.'
    }
];

interface ProductTourProps {
    onClose: () => void;
}

const ProductTour: React.FC<ProductTourProps> = ({ onClose }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const totalSteps = tourSteps.length;

    const nextStep = () => {
        if (currentStep < totalSteps - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            onClose(); // Finish on the last step
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const { icon, title, description } = tourSteps[currentStep];

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in-up">
            <div className="relative w-full max-w-lg bg-black border border-gray-800 rounded-2xl shadow-xl p-8 text-center transform transition-all duration-300">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors z-10">
                    <CloseIcon className="w-6 h-6" />
                </button>
                
                <div className="mb-6">{icon}</div>

                <h2 className="text-3xl font-bold text-white font-heading">{title}</h2>
                <p className="text-gray-400 mt-4 leading-relaxed">{description}</p>
                
                <div className="mt-8 flex items-center justify-between">
                    <button onClick={onClose} className="text-sm text-gray-500 hover:text-white transition-colors">
                        Skip Tour
                    </button>

                    <div className="flex items-center space-x-2">
                        {Array.from({ length: totalSteps }).map((_, index) => (
                            <div key={index} className={`w-2 h-2 rounded-full transition-colors ${currentStep === index ? 'bg-[var(--accent-color)]' : 'bg-gray-700'}`}></div>
                        ))}
                    </div>

                    <div className="flex items-center space-x-2">
                        {currentStep > 0 && (
                             <button onClick={prevStep} className="px-5 py-2.5 text-sm font-medium text-gray-300 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition-colors">
                                Previous
                            </button>
                        )}
                        <button onClick={nextStep} className="px-5 py-2.5 text-sm font-bold text-black bg-[var(--accent-color)] rounded-lg hover:opacity-90 transition-opacity">
                            {currentStep === totalSteps - 1 ? 'Finish' : 'Next'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductTour;