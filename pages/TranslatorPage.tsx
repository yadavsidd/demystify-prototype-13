
import React, { useState, useCallback, useEffect } from 'react';
import { translateDocument, testApiKey } from '../services/geminiService';
import { saveHistoryItem } from '../services/historyService';
import type { HistoryItem, TranslationHistoryItem } from '../types';
import { FileUpload } from '../components/ui/file-upload';
import LanguageSelector from '../components/LanguageSelector';
import { MagicButton } from '../components/ui/magic-button';
import ErrorMessage from '../components/ErrorMessage';
import CopyButton from '../components/CopyButton';
import DynamicText from '../components/DynamicText';

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

interface TranslatorPageProps {
    historyItem: TranslationHistoryItem | null;
    onViewHistoryItem: (item: HistoryItem | null) => void;
}

const TranslatorPage: React.FC<TranslatorPageProps> = ({ historyItem, onViewHistoryItem }) => {
    const [view, setView] = useState<'upload' | 'loading' | 'result'>('upload');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [fileContent, setFileContent] = useState<{ content: string; mimeType: string; } | null>(null);
    const [targetLanguage, setTargetLanguage] = useState<string>('English');
    const [translatedText, setTranslatedText] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [isTestingApiKey, setIsTestingApiKey] = useState(false);

    useEffect(() => {
        if (historyItem) {
            setTargetLanguage(historyItem.targetLanguage);
            setTranslatedText(historyItem.translatedText);
            setSelectedFile(new File([], historyItem.fileName));
            setView('result');
        }
        return () => {
            onViewHistoryItem(null);
        }
    }, [historyItem, onViewHistoryItem]);


    const handleFileSelect = useCallback(async (file: File | null) => {
        setError(null);
        if (file) {
             // Validation Logic moved from FileInput
            const allowedMimeTypes = ['text/plain', 'text/markdown', 'application/pdf', 'image/jpeg'];
            const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
            const allowedExtensions = ['txt', 'md', 'pdf', 'jpg', 'jpeg'];
            
            if (!allowedMimeTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
                setError(`Unsupported file type. Please upload a TXT, MD, PDF, or JPG file.`);
                setSelectedFile(null);
                setFileContent(null);
                return;
            }

            setSelectedFile(file);
            try {
                const mimeType = file.type;
                let content: string;
                 if (mimeType.startsWith('text/')) {
                    content = await file.text();
                } else {
                    content = await readFileAsBase64(file);
                }
                setFileContent({ content, mimeType });
            } catch(err) {
                 setError('Failed to read the selected file.');
                 setFileContent(null);
            }
        } else {
            setSelectedFile(null);
            setFileContent(null);
        }
    }, []);

    const handleFileUpload = (files: File[]) => {
        if (files.length > 0) {
            handleFileSelect(files[0]);
        } else {
            handleFileSelect(null);
        }
    };

    const handleRunDiagnostic = async () => {
        setIsTestingApiKey(true);
        const result = await testApiKey();
        alert(`Diagnostic Result:\n\n${result}`);
        setIsTestingApiKey(false);
    };

    const handleTranslate = async () => {
        if (!fileContent || !selectedFile) {
            setError('Please select a valid file first.');
            return;
        }

        setView('loading');
        setError(null);
        setTranslatedText('');

        try {
            const result = await translateDocument(fileContent.content, fileContent.mimeType, targetLanguage);
            setTranslatedText(result);
            await saveHistoryItem({
                type: 'translation',
                fileName: selectedFile.name,
                targetLanguage,
                translatedText: result,
            });
            setView('result');
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(errorMessage);
            setView('upload');
        }
    };

    const reset = () => {
        setView('upload');
        setSelectedFile(null);
        setFileContent(null);
        setTranslatedText('');
        setError(null);
        onViewHistoryItem(null);
    };
    
    if (view === 'loading') {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <DynamicText />
            </div>
        );
    }

    if (view === 'result') {
        return (
            <div className="bg-transparent h-full flex flex-col">
                <header className="flex items-center justify-between p-4 border-b border-gray-800">
                    <div>
                         <h3 className="text-lg font-semibold text-gray-200">Translation to {targetLanguage} {historyItem ? 'Result' : 'Complete'}</h3>
                         <p className="text-sm text-gray-400">From: {selectedFile?.name}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <CopyButton textToCopy={translatedText} />
                        <button onClick={reset} className="px-4 py-2 text-sm font-medium rounded-md text-gray-300 bg-gray-800 hover:bg-gray-700">
                            {historyItem ? 'Start New Translation' : 'Translate Another'}
                        </button>
                    </div>
                </header>
                <div className="p-6 overflow-y-auto flex-grow">
                    <pre className="whitespace-pre-wrap text-sm text-gray-300 font-sans">{translatedText}</pre>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-xl mx-auto flex flex-col items-center justify-center text-center">
            <FileUpload onChange={handleFileUpload} />
            
            <div className="w-full mt-4">
                <LanguageSelector value={targetLanguage} onChange={setTargetLanguage} disabled={false} />
            </div>
            
            {error && <ErrorMessage message={error} onRunDiagnostic={handleRunDiagnostic} isTesting={isTestingApiKey} />}
            <div className="w-full mt-6">
                 <MagicButton 
                    onClick={handleTranslate} 
                    disabled={!selectedFile}
                >
                    Translate to {targetLanguage}
                </MagicButton>
            </div>
            <p className="text-xs text-gray-500 mt-4 px-6">
                Translations are AI-generated and may not be 100% accurate. Always verify critical information.
            </p>
        </div>
    );
};

export default TranslatorPage;
