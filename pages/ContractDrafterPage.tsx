
import React, { useState, useEffect } from 'react';
import type { ContractTypeConfig, HistoryItem, DraftHistoryItem } from '../types';
import { draftContractStream, testApiKey } from '../services/geminiService';
import { saveHistoryItem } from '../services/historyService';
import { FreelanceIcon, RentalIcon, SaleIcon, NDAIcon, EmploymentIcon, CeaseDesistIcon } from '../components/icons';
import ErrorMessage from '../components/ErrorMessage';
import ReportView from '../components/ReportView';
import { MultiStepLoader } from '../components/ui/multi-step-loader';
import { CornerBorderContainer } from '@/components/ui/corner-border-container';
import { GradientButton } from '@/components/ui/GradientButton';
import { ArrowLeft, CheckCircle2, PenTool, Sparkles } from 'lucide-react';
import { cn } from "@/lib/utils";

const contractTypes: ContractTypeConfig[] = [
    {
        key: 'freelance-agreement',
        name: 'Freelance Agreement',
        description: 'Establish clear terms for services, payment, and IP ownership between a client and a freelancer.',
        icon: FreelanceIcon,
        fields: [
            { key: 'Client Name', label: 'Client Name', placeholder: 'Full legal name of the Client (e.g., Acme Solutions Inc.)' },
            { key: 'Freelancer Name', label: 'Freelancer Name', placeholder: 'Full legal name of the Freelancer (e.g., John Doe)' },
            { key: 'Scope of Work', label: 'Scope of Work', placeholder: 'Detailed list of deliverables (e.g., 5 blog posts, logo design, backend API integration...)', type: 'textarea' },
            { key: 'Total Payment', label: 'Total Payment', placeholder: 'Total amount and currency (e.g., $5,000 USD)' },
            { key: 'Deadline', label: 'Project Deadline', placeholder: 'Final delivery date (e.g., August 31, 2024)' },
        ],
    },
    {
        key: 'rental-lease',
        name: 'Residential Lease',
        description: 'A standard lease agreement for landlords and tenants covering rent, duration, and property use.',
        icon: RentalIcon,
        fields: [
            { key: 'Landlord Name', label: 'Landlord Name', placeholder: 'Full legal name of the Landlord' },
            { key: 'Tenant Name', label: 'Tenant Name', placeholder: 'Full legal name of the Tenant' },
            { key: 'Property Address', label: 'Property Address', placeholder: 'Complete address including unit number, city, state, and zip' },
            { key: 'Monthly Rent', label: 'Monthly Rent', placeholder: 'Rent amount (e.g., $1,200 USD)' },
            { key: 'Lease Start Date', label: 'Start Date', placeholder: 'e.g., September 1, 2024' },
            { key: 'Lease End Date', label: 'End Date', placeholder: 'e.g., August 31, 2025' },
        ],
    },
    {
        key: 'bill-of-sale',
        name: 'Bill of Sale',
        description: 'Document the transfer of ownership for items like cars, electronics, or equipment.',
        icon: SaleIcon,
        fields: [
            { key: 'Seller Name', label: 'Seller Name', placeholder: 'Full legal name of the Seller' },
            { key: 'Buyer Name', label: 'Buyer Name', placeholder: 'Full legal name of the Buyer' },
            { key: 'Item Sold', label: 'Item Description', placeholder: 'Detailed description (Make, Model, Year, Serial Number/VIN)' },
            { key: 'Sale Price', label: 'Sale Price', placeholder: 'Agreed purchase price (e.g., $10,000 USD)' },
            { key: 'Date of Sale', label: 'Date of Transaction', placeholder: 'Date the transfer takes place' },
        ],
    },
    {
        key: 'nda',
        name: 'Non-Disclosure Agreement (NDA)',
        description: 'Protect sensitive information and trade secrets when sharing with another party.',
        icon: NDAIcon,
        fields: [
            { key: 'Disclosing Party', label: 'Disclosing Party', placeholder: 'Name of the party sharing the secrets (e.g., TechStart Inc.)' },
            { key: 'Receiving Party', label: 'Receiving Party', placeholder: 'Name of the party receiving the secrets (e.g., Jane Smith)' },
            { key: 'Confidential Info', label: 'Confidential Information', placeholder: 'Describe what information is confidential (e.g., "Business plans, customer lists, and code")', type: 'textarea' },
            { key: 'Duration', label: 'Duration', placeholder: 'How long the confidentiality lasts (e.g., 2 years, 5 years, Indefinite)' },
            { key: 'Jurisdiction', label: 'Jurisdiction', placeholder: 'Governing State or Country (e.g., California, USA)' },
        ],
    },
    {
        key: 'employment-offer',
        name: 'Employment Offer Letter',
        description: 'Formal job offer outlining position, salary, start date, and key employment terms.',
        icon: EmploymentIcon,
        fields: [
            { key: 'Company Name', label: 'Company Name', placeholder: 'Full legal name of the hiring company' },
            { key: 'Candidate Name', label: 'Candidate Name', placeholder: 'Full legal name of the candidate' },
            { key: 'Job Title', label: 'Job Title', placeholder: 'e.g., Senior Software Engineer' },
            { key: 'Start Date', label: 'Start Date', placeholder: 'e.g., October 1, 2024' },
            { key: 'Salary', label: 'Salary/Compensation', placeholder: 'e.g., $120,000 per year, paid semi-monthly' },
            { key: 'Reporting To', label: 'Reporting To', placeholder: 'Title of the supervisor (e.g., Chief Technology Officer)' },
        ],
    },
    {
        key: 'cease-desist',
        name: 'Cease and Desist Letter',
        description: 'Formal demand to stop infringing activity or illegal behavior immediately.',
        icon: CeaseDesistIcon,
        fields: [
            { key: 'Sender Name', label: 'Sender Name', placeholder: 'Your full legal name' },
            { key: 'Recipient Name', label: 'Recipient Name', placeholder: 'Full name of the person/company you are warning' },
            { key: 'Infringing Activity', label: 'Infringing Activity', placeholder: 'Describe the behavior to stop (e.g., "Unauthorized use of copyrighted logo on website")', type: 'textarea' },
            { key: 'Demand Deadline', label: 'Demand Deadline', placeholder: 'Time limit to comply (e.g., "within 5 business days")' },
        ],
    },
];

const loadingStates = [
  { text: "Initializing legal engine" },
  { text: "Analyzing your requirements" },
  { text: "Structuring agreement terms" },
  { text: "Drafting clauses & provisions" },
  { text: "Refining legal language" },
  { text: "Finalizing document format" },
];

interface ContractDrafterPageProps {
    historyItem: DraftHistoryItem | null;
    onViewHistoryItem: (item: HistoryItem | null) => void;
}

const ContractDrafterPage: React.FC<ContractDrafterPageProps> = ({ historyItem, onViewHistoryItem }) => {
    const [step, setStep] = useState<'select' | 'form' | 'loading' | 'result'>('select');
    const [selectedContract, setSelectedContract] = useState<ContractTypeConfig | null>(null);
    const [formData, setFormData] = useState<Record<string, string>>({});
    const [draftedContract, setDraftedContract] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [isTestingApiKey, setIsTestingApiKey] = useState(false);

    useEffect(() => {
        if (historyItem) {
            setDraftedContract(historyItem.draftedContract);
            const contractConfig = contractTypes.find(c => c.name === historyItem.contractType);
            setSelectedContract(contractConfig || null);
            setStep('result');
        }
        return () => {
            onViewHistoryItem(null);
        };
    }, [historyItem, onViewHistoryItem]);


    const handleSelectContract = (contract: ContractTypeConfig) => {
        setSelectedContract(contract);
        const initialFormState = contract.fields.reduce((acc, field) => ({ ...acc, [field.label]: '' }), {});
        setFormData(initialFormState);
        setStep('form');
        window.scrollTo(0,0);
    };

    const handleFormChange = (key: string, value: string) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const handleRunDiagnostic = async () => {
        setIsTestingApiKey(true);
        const result = await testApiKey();
        alert(`Diagnostic Result:\n\n${result}`);
        setIsTestingApiKey(false);
    };

    const handleDraft = async () => {
        if (!selectedContract) return;

        // Simple validation
        for (const field of selectedContract.fields) {
            if (!formData[field.label]?.trim()) {
                setError(`Please fill out the "${field.label}" field to proceed.`);
                return;
            }
        }

        setStep('loading');
        setError(null);
        setDraftedContract('');
        
        let fullText = '';
        try {
            // Artificial delay to allow the loader to be seen and appreciated
            // In a real app, the stream might be fast, but the UX of "thinking" is valuable.
            const streamPromise = draftContractStream(selectedContract.name, formData);
            
            // Wait for at least 2 seconds of loading animation
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const stream = await streamPromise;
            
            for await (const chunk of stream) {
                fullText += chunk.text ?? '';
            }
            setDraftedContract(fullText);
            
            await saveHistoryItem({
                type: 'draft',
                contractType: selectedContract.name,
                draftedContract: fullText,
            });
            
            setStep('result');
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred.");
            setStep('form');
        }
    };
    
    const reset = () => {
        setStep('select');
        setSelectedContract(null);
        setFormData({});
        setDraftedContract('');
        setError(null);
        onViewHistoryItem(null);
        window.scrollTo(0,0);
    };

    const backToForm = () => {
        setStep('form');
        setError(null);
    };

    return (
        <div className="w-full max-w-6xl mx-auto relative min-h-[600px]">
             <MultiStepLoader loadingStates={loadingStates} loading={step === 'loading'} duration={1500} />
            
            {/* STEP 1: SELECTION */}
            {step === 'select' && (
                <div className="animate-fade-in-up">
                     <div className="text-center mb-10">
                        <h2 className="text-3xl font-bold text-white font-heading mb-3">What do you need to draft?</h2>
                        <p className="text-gray-400 max-w-xl mx-auto">Select a template to get started. Our AI will tailor the agreement to your specific needs.</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {contractTypes.map(contract => (
                            <CornerBorderContainer
                                key={contract.key}
                                onClick={() => handleSelectContract(contract)}
                                className="group cursor-pointer hover:bg-gray-900/80 transition-all duration-300 p-6 flex flex-col h-full"
                            >
                                <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-gray-800 text-[var(--accent-color)] mb-6 group-hover:scale-110 transition-transform duration-300">
                                    <contract.icon className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-[var(--accent-color)] transition-colors">{contract.name}</h3>
                                <p className="text-sm text-gray-400 leading-relaxed mb-4 flex-grow">{contract.description}</p>
                                <div className="flex items-center text-sm text-[var(--accent-color)] font-medium mt-auto opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                                    Start Drafting <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                                </div>
                            </CornerBorderContainer>
                        ))}
                    </div>
                </div>
            )}

            {/* STEP 2: INPUT FORM */}
            {step === 'form' && selectedContract && (
                <div className="max-w-3xl mx-auto animate-fade-in-up">
                    <button onClick={reset} className="flex items-center text-gray-400 hover:text-white mb-6 transition-colors text-sm font-medium">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Templates
                    </button>
                    
                    <CornerBorderContainer className="p-8 bg-black/60">
                        <div className="flex items-center gap-4 mb-8 border-b border-gray-800 pb-6">
                             <div className="p-3 rounded-lg bg-gray-800 text-[var(--accent-color)]">
                                <selectedContract.icon className="w-8 h-8" />
                             </div>
                             <div>
                                 <h2 className="text-2xl font-bold text-white font-heading">Customize Your {selectedContract.name}</h2>
                                 <p className="text-gray-400 text-sm">Fill in the details below to generate your document.</p>
                             </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {selectedContract.fields.map((field) => (
                                <div key={field.key} className={cn(field.type === 'textarea' ? "md:col-span-2" : "")}>
                                    <label className="block text-sm font-semibold text-gray-300 mb-2 ml-1">
                                        {field.label}
                                    </label>
                                    {field.type === 'textarea' ? (
                                        <textarea
                                            value={formData[field.label] || ''}
                                            onChange={(e) => handleFormChange(field.label, e.target.value)}
                                            placeholder={field.placeholder}
                                            rows={4}
                                            className="w-full p-3 rounded-lg bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:border-[var(--accent-color)] focus:ring-1 focus:ring-[var(--accent-color)] transition-all outline-none resize-none"
                                        />
                                    ) : (
                                        <input
                                            type="text"
                                            value={formData[field.label] || ''}
                                            onChange={(e) => handleFormChange(field.label, e.target.value)}
                                            placeholder={field.placeholder}
                                            className="w-full p-3 rounded-lg bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:border-[var(--accent-color)] focus:ring-1 focus:ring-[var(--accent-color)] transition-all outline-none"
                                        />
                                    )}
                                </div>
                            ))}
                        </div>

                        {error && <div className="mt-6"><ErrorMessage message={error} onRunDiagnostic={handleRunDiagnostic} isTesting={isTestingApiKey} /></div>}

                        <div className="mt-8 flex items-center justify-end gap-4">
                            <button 
                                onClick={reset}
                                className="px-5 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <GradientButton onClick={handleDraft} className="min-w-[160px]">
                                <Sparkles className="w-4 h-4 mr-2" />
                                GENERATE DRAFT
                            </GradientButton>
                        </div>
                    </CornerBorderContainer>
                </div>
            )}

            {/* STEP 3: RESULT */}
            {step === 'result' && (
                <div className="h-full animate-fade-in-up flex flex-col">
                     <div className="flex items-center justify-between mb-6">
                         <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-full bg-green-900/30 flex items-center justify-center text-green-400 border border-green-900/50">
                                <CheckCircle2 className="w-6 h-6" />
                             </div>
                             <div>
                                 <h2 className="text-xl font-bold text-white font-heading">Draft Generated Successfully</h2>
                                 <p className="text-sm text-gray-400">Review your {selectedContract?.name} below.</p>
                             </div>
                         </div>
                         <div className="flex gap-3">
                             <button onClick={backToForm} className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors flex items-center">
                                <PenTool className="w-4 h-4 mr-2" /> Edit Inputs
                             </button>
                             <button onClick={reset} className="px-4 py-2 text-sm font-medium text-black bg-[var(--accent-color)] rounded-lg hover:opacity-90 transition-opacity">
                                New Draft
                             </button>
                         </div>
                     </div>
                     
                     <div className="flex-grow min-h-[500px] shadow-2xl rounded-lg overflow-hidden border border-gray-800">
                         <ReportView 
                            content={draftedContract} 
                            onContentChange={setDraftedContract} 
                            highlightedClauses={[]} // No highlights for fresh drafts
                            isEditable={true}
                         />
                     </div>
                </div>
            )}
        </div>
    );
};

export default ContractDrafterPage;
