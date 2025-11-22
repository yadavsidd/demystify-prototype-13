import React, { useMemo, useRef, useState } from 'react';
import { DrafterIcon, DownloadIcon, SendIcon } from './icons';
import { generateNegotiationEmail } from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';
import CopyButton from './CopyButton';

interface ReportViewProps {
    content: string | null;
    onContentChange: (newContent: string) => void;
    highlightedClauses: string[];
    isEditable: boolean; // Added prop to handle non-text files
}

// Helper function to highlight text safely
const createHighlightedHtml = (text: string | null | undefined, highlights: string[]): string => {
    if (!text) return '';
    
    // Escape special characters for RegExp
    const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    let processedText = text;
    
    // Create a unique set of highlights to avoid issues with duplicate clauses
    const uniqueHighlights = [...new Set(highlights)];

    uniqueHighlights.forEach(highlight => {
        if (highlight && typeof highlight === 'string' && highlight.trim() !== '') {
            try {
                // This regex ensures we only replace whole instances of the highlight
                const regex = new RegExp(escapeRegex(highlight), 'g');
                processedText = processedText.replace(regex, `<span class="highlight">${highlight}</span>`);
            } catch (e) {
                console.warn('Failed to highlight clause:', highlight);
            }
        }
    });
    
    // Replace newlines with <br> tags for HTML rendering
    return processedText.replace(/\n/g, '<br />');
};


const ReportView: React.FC<ReportViewProps> = ({ content, onContentChange, highlightedClauses, isEditable }) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const [negotiationEmail, setNegotiationEmail] = useState<string | null>(null);
    const [isGeneratingEmail, setIsGeneratingEmail] = useState(false);
    
    const highlightedHtml = useMemo(() => {
        return createHighlightedHtml(content, highlightedClauses);
    }, [content, highlightedClauses]);

    const handleInput = (event: React.FormEvent<HTMLDivElement>) => {
        const cleanText = event.currentTarget.innerText;
        onContentChange(cleanText);
    };

    const handleTxtDownload = () => {
        if (!content) return;
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'edited-document.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleGenerateNegotiationEmail = async () => {
        if (highlightedClauses.length === 0) return;
        setIsGeneratingEmail(true);
        try {
            const email = await generateNegotiationEmail(highlightedClauses);
            setNegotiationEmail(email);
        } catch (error) {
            console.error("Failed to generate negotiation email", error);
        } finally {
            setIsGeneratingEmail(false);
        }
    };

    return (
        <div className="bg-gray-900 rounded-lg border border-gray-800 h-full flex flex-col">
            <header className="flex items-center justify-between p-4 border-b border-gray-800 no-print">
                <div className="flex items-center space-x-2">
                    <DrafterIcon className="w-6 h-6 text-gray-300" />
                    <h2 className="text-xl font-bold text-white font-heading">Final Draft</h2>
                </div>
                <div className="flex items-center gap-2">
                     {highlightedClauses.length > 0 && (
                        <button
                            onClick={handleGenerateNegotiationEmail}
                            disabled={isGeneratingEmail}
                            className="flex items-center space-x-2 px-4 py-2 text-sm font-bold text-white bg-blue-600 rounded-md hover:bg-blue-500 transition-opacity disabled:opacity-50"
                        >
                            {isGeneratingEmail ? <LoadingSpinner className="w-4 h-4 text-white" /> : <SendIcon className="w-4 h-4" />}
                            <span>Draft Negotiation Email</span>
                        </button>
                    )}
                    <button
                        onClick={handleTxtDownload}
                        disabled={!content}
                        className="flex items-center space-x-2 px-4 py-2 text-sm font-bold text-black bg-[var(--accent-color)] rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                        <DownloadIcon className="w-4 h-4" />
                        <span>Download .txt</span>
                    </button>
                </div>
            </header>
            
            {negotiationEmail && (
                <div className="p-4 bg-blue-900/10 border-b border-gray-800 animate-fade-in-up">
                     <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-semibold text-blue-300">Negotiation Email Summary:</h4>
                        <button onClick={() => setNegotiationEmail(null)} className="text-xs text-gray-500 hover:text-white">Close</button>
                     </div>
                    <div className="relative p-3 rounded-md bg-black/30 border border-blue-800/30 text-sm text-gray-300 max-h-40 overflow-y-auto">
                        <p className="whitespace-pre-wrap">{negotiationEmail}</p>
                        <div className="absolute top-1 right-1">
                            <CopyButton textToCopy={negotiationEmail} />
                        </div>
                    </div>
                </div>
            )}

            <div className="p-2 flex-grow">
                <div
                    ref={editorRef}
                    onInput={handleInput}
                    contentEditable={isEditable && content !== null}
                    suppressContentEditableWarning={true}
                    className={`w-full h-full min-h-[60vh] p-4 bg-transparent text-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] font-mono text-sm whitespace-pre-wrap overflow-y-auto ${!isEditable ? 'cursor-default' : ''}`}
                    aria-placeholder="Your edited document will appear here..."
                    dangerouslySetInnerHTML={{ __html: highlightedHtml }}
                />
            </div>
        </div>
    );
};

export default ReportView;