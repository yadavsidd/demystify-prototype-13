
import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { Chat } from '@google/genai';
import { analyzeDocument, createDocumentAnalysisChat, testApiKey } from '../services/geminiService';
import { saveHistoryItem } from '../services/historyService';
import type { Message, AnalysisResult, HistoryItem, AnalysisHistoryItem } from '../types';
import { FileUpload } from '../components/ui/file-upload';
import ErrorMessage from '../components/ErrorMessage';
import AnalysisLoader from '../components/AnalysisLoader';
import StructuredResultDisplay from '../components/StructuredResultDisplay';
import { CornerBorderContainer } from '@/components/ui/corner-border-container';
import { GradientButton } from '@/components/ui/GradientButton';

const readFileAsBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const parts = result.split(',');
      if (parts.length < 2 || !parts[1]) {
        reject(new Error("Could not parse file content as a valid base64 data URL."));
        return;
      }
      resolve(parts[1]);
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

interface DemystifierPageProps {
  historyItem: AnalysisHistoryItem | null;
  onViewHistoryItem: (item: HistoryItem | null) => void;
}

const DemystifierPage: React.FC<DemystifierPageProps> = ({ historyItem, onViewHistoryItem }) => {
    const [view, setView] = useState<'upload' | 'configure' | 'loading' | 'result'>('upload');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [fileContent, setFileContent] = useState<{ content: string; mimeType: string; } | null>(null);
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    
    const [revisedDocumentContent, setRevisedDocumentContent] = useState<string | null>(null);
    const [highlightedClauses, setHighlightedClauses] = useState<string[]>([]);
    
    const [chat, setChat] = useState<Chat | null>(null);
    const [conversation, setConversation] = useState<Message[]>([]);
    const [isChatLoading, setIsChatLoading] = useState(false);
    const [userInput, setUserInput] = useState('');
    const [error, setError] = useState<string | null>(null);
    
    // Configuration State
    const [userRole, setUserRole] = useState('');
    const [jurisdiction, setJurisdiction] = useState('');
    const [isTestingApiKey, setIsTestingApiKey] = useState(false);
    
    const chatFormRef = useRef<HTMLFormElement>(null);

    const reset = useCallback(() => {
        setView('upload');
        setSelectedFile(null);
        setFileContent(null);
        setAnalysisResult(null);
        setRevisedDocumentContent(null);
        setHighlightedClauses([]);
        setChat(null);
        setConversation([]);
        setError(null);
        setUserRole('');
        setJurisdiction('');
        onViewHistoryItem(null);
    }, [onViewHistoryItem]);

    useEffect(() => {
        if (historyItem) {
            setAnalysisResult(historyItem.analysisResult);
            setFileContent(null); 
            setRevisedDocumentContent(historyItem.revisedDocumentContent);
            const highlights = historyItem.analysisResult.redFlags
                .map(flag => flag.rewrittenClause)
                .filter((clause): clause is string => !!clause);
            setHighlightedClauses(highlights);
            setView('result');
            setConversation([{ role: 'model', content: "This is an analysis from your history. The original document is not stored for privacy, so the chat is unavailable." }]);
        }
        return () => {
            onViewHistoryItem(null);
        };
    }, [historyItem, onViewHistoryItem]);

    const handleFileUpload = async (files: File[]) => {
        if (files.length === 0) return;
        const file = files[0];

        // Validation
        const allowedMimeTypes = ['text/plain', 'text/markdown', 'application/pdf', 'image/jpeg'];
        const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
        const allowedExtensions = ['txt', 'md', 'pdf', 'jpg', 'jpeg'];
        
        if (!allowedMimeTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
            setError(`Unsupported file type. Please upload a TXT, MD, PDF, or JPG file.`);
            return;
        }

        setSelectedFile(file);
        setError(null);
        
        // Read file immediately but go to configure step first
        try {
            const mimeType = file.type;
            let content: string;

            if (mimeType.startsWith('text/')) {
                content = await file.text();
            } else {
                content = await readFileAsBase64(file);
            }

            setFileContent({ content, mimeType });
            setView('configure');
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred while reading the file.';
            setError(errorMessage);
        }
    };

    const startAnalysis = async () => {
        if (!fileContent || !selectedFile) return;
        
        setView('loading');
        setError(null);
        
        try {
            const result = await analyzeDocument(fileContent.content, fileContent.mimeType, userRole, jurisdiction);
            setAnalysisResult(result);
            setRevisedDocumentContent(result.fullExtractedText);
            setHighlightedClauses([]);

            await saveHistoryItem({ 
                type: 'analysis', 
                fileName: selectedFile.name, 
                analysisResult: result,
                revisedDocumentContent: result.fullExtractedText,
                userRole,
                jurisdiction
            });
            
            const newChat = createDocumentAnalysisChat(result.fullExtractedText, 'text/plain', result);
            setChat(newChat);
            setConversation([{ role: 'model', content: "I've analyzed your document. You can see the structured summary below. Feel free to ask me any questions about it in the 'Chat' tab!" }]);

            setView('result');
        } catch (err) {
             const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(errorMessage);
            setView('configure');
        }
    };

    const handleRunDiagnostic = async () => {
        setIsTestingApiKey(true);
        const result = await testApiKey();
        alert(`Diagnostic Result:\n\n${result}`);
        setIsTestingApiKey(false);
    };
    
    const handleChatSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userInput.trim() || !chat || isChatLoading) return;

        const userMessage: Message = { role: 'user', content: userInput };
        setConversation(prev => [...prev, userMessage]);
        const currentInput = userInput;
        setUserInput('');
        setIsChatLoading(true);
        setError(null);

        try {
            const responseStream = await chat.sendMessageStream({ message: currentInput });
            
            let modelResponse = '';
            setConversation(prev => [...prev, { role: 'model', content: '' }]);

            for await (const chunk of responseStream) {
                modelResponse += chunk.text ?? '';
                setConversation(prev => {
                    const newConversation = [...prev];
                    const lastMessage = newConversation[newConversation.length - 1];
                    if (lastMessage && lastMessage.role === 'model') {
                        lastMessage.content = modelResponse;
                    }
                    return newConversation;
                });
            }
        } catch (err) {
            setError("Sorry, I encountered an error during the chat. Please try again.");
            setConversation(prev => prev.slice(0, -2)); 
        } finally {
            setIsChatLoading(false);
        }
    };

    const handleSuggestionClick = (text: string) => {
        setUserInput(text);
        setTimeout(() => {
            chatFormRef.current?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
        }, 0);
    };
    
    const handleClauseReplacement = (originalClause: string, newClause: string) => {
        setRevisedDocumentContent(currentContent => {
            if (currentContent === null) return null;
            return currentContent.replace(originalClause, newClause);
        });
        setHighlightedClauses(prev => [...prev, newClause]);
    };

    return (
        <div className="h-full w-full">
            <AnalysisLoader file={selectedFile} loading={view === 'loading'} />
            
            {view === 'result' && analysisResult ? (
                <div className="flex flex-col h-full">
                    <StructuredResultDisplay 
                        result={analysisResult}
                        onUpdateResult={setAnalysisResult}
                        originalDocument={fileContent}
                        historyItem={historyItem}
                        onReset={reset}
                        chat={chat}
                        conversation={conversation}
                        isChatLoading={isChatLoading}
                        userInput={userInput}
                        onUserInput={setUserInput}
                        onChatSubmit={handleChatSubmit}
                        onSuggestionClick={handleSuggestionClick}
                        chatFormRef={chatFormRef}
                        revisedDocumentContent={revisedDocumentContent}
                        onRevisedDocumentContentChange={setRevisedDocumentContent}
                        onClauseReplacement={handleClauseReplacement}
                        highlightedClauses={highlightedClauses}
                    />
                </div>
            ) : view === 'configure' ? (
                <div className="w-full max-w-xl mx-auto flex flex-col items-center justify-center h-full">
                    <CornerBorderContainer className="w-full p-8 rounded-xl bg-black/60">
                         <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-white font-heading mb-2">Tailor Your Analysis</h2>
                            <p className="text-gray-400">Tell us a bit more to get better results.</p>
                         </div>
                         
                         <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">What is your role?</label>
                                <input 
                                    type="text" 
                                    value={userRole}
                                    onChange={(e) => setUserRole(e.target.value)}
                                    placeholder="e.g., Tenant, Freelancer, Buyer"
                                    className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-[var(--accent-color)] focus:ring-1 focus:ring-[var(--accent-color)] transition-colors"
                                />
                                <p className="text-xs text-gray-500 mt-1">We'll highlight risks specific to you.</p>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Jurisdiction (Optional)</label>
                                <input 
                                    type="text" 
                                    value={jurisdiction}
                                    onChange={(e) => setJurisdiction(e.target.value)}
                                    placeholder="e.g., California, USA, UK"
                                    className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-[var(--accent-color)] focus:ring-1 focus:ring-[var(--accent-color)] transition-colors"
                                />
                                <p className="text-xs text-gray-500 mt-1">Laws vary by location. Helping us helps you.</p>
                            </div>

                            {error && <ErrorMessage message={error} onRunDiagnostic={handleRunDiagnostic} isTesting={isTestingApiKey} />}

                            <div className="pt-4 flex gap-3">
                                <button 
                                    onClick={() => { setSelectedFile(null); setView('upload'); setError(null); }}
                                    className="flex-1 py-3 px-4 bg-gray-800 text-gray-300 font-bold rounded-lg hover:bg-gray-700 transition-colors"
                                >
                                    Back
                                </button>
                                <GradientButton onClick={startAnalysis} className="flex-1">
                                    START ANALYSIS
                                </GradientButton>
                            </div>
                         </div>
                    </CornerBorderContainer>
                </div>
            ) : (
                <div className="w-full max-w-xl mx-auto flex flex-col items-center justify-center text-center h-full">
                    <FileUpload onChange={handleFileUpload} />
                    {error && <ErrorMessage message={error} onRunDiagnostic={handleRunDiagnostic} isTesting={isTestingApiKey} />}
                    <p className="text-xs text-gray-500 mt-4 px-6">
                        Your document is processed securely and is never stored on our servers.
                    </p>
                </div>
            )}
        </div>
    );
};

export default DemystifierPage;