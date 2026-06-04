import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Chat } from '@google/genai';
import { createDocumentGuideChat } from '../services/geminiService';
import { saveHistoryItem } from '../services/historyService';
import type { Message, HistoryItem, GuideHistoryItem } from '../types';
import ConversationDisplay from '../components/ConversationDisplay';
import { AiInput } from '../components/AiInput';
import ErrorMessage from '../components/ErrorMessage';

interface DocumentGuidePageProps {
    historyItem: GuideHistoryItem | null;
    onViewHistoryItem: (item: HistoryItem | null) => void;
}

const DocumentGuidePage: React.FC<DocumentGuidePageProps> = ({ historyItem, onViewHistoryItem }) => {
    const [chat, setChat] = useState<Chat | null>(null);
    const [conversation, setConversation] = useState<Message[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Use a ref to store the latest conversation for saving on unmount
    const conversationRef = useRef(conversation);
    useEffect(() => {
        conversationRef.current = conversation;
    }, [conversation]);

    const reset = useCallback(() => {
        setConversation([
            { role: 'model', content: "Hello! I'm Demystify's Document Guide. How can I help you today? \n\nFor example, you can ask 'How do I get a passport?' or 'What do I need to apply for a visa?'" }
        ]);
        setChat(createDocumentGuideChat());
        setUserInput('');
        setIsLoading(false);
        setError(null);
        onViewHistoryItem(null);
    }, [onViewHistoryItem]);


    useEffect(() => {
        if (historyItem) {
            setConversation(historyItem.conversation);
            setChat(null); // Disable chat for history items
        } else {
            setChat(createDocumentGuideChat());
            setConversation([
                { role: 'model', content: "Hello! I'm Demystify's Document Guide. How can I help you today? \n\nFor example, you can ask 'How do I get a passport?' or 'What do I need to apply for a visa?'" }
            ]);
        }

        // Cleanup function to save history
        return () => {
            if (!historyItem) { // Only save if it's a new session
                const finalConversation = conversationRef.current;
                // Save if there's more than the initial prompt
                if (finalConversation.length > 1) {
                    const firstUserMessage = finalConversation.find(m => m.role === 'user');
                    if (firstUserMessage) {
                        const title = firstUserMessage.content.substring(0, 50) + (firstUserMessage.content.length > 50 ? '...' : '');
                        // Wrap async call in a self-invoking function for useEffect cleanup
                        (async () => {
                            await saveHistoryItem({
                                type: 'guide',
                                title,
                                conversation: finalConversation,
                            });
                        })();
                    }
                }
            }
            onViewHistoryItem(null); // Clear history item on unmount
        };
    }, [historyItem, onViewHistoryItem]);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userInput.trim() || !chat || isLoading) return;

        const userMessage: Message = { role: 'user', content: userInput };
        setConversation(prev => [...prev, userMessage]);
        const currentInput = userInput;
        setUserInput('');
        setIsLoading(true);
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
            setError("Sorry, I encountered an error. Please try again.");
            console.error("Error in chat stream:", err);
            setConversation(prev => prev.filter((msg, index) => !(index === prev.length -1 && msg.content === '')))
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full">
            {historyItem && (
                <header className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Viewing History: {historyItem.title}</h3>
                    <button onClick={reset} className="px-4 py-2 text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">
                        Start New Guide Session
                    </button>
                </header>
            )}
            <div className="flex-grow p-4 overflow-y-auto">
                <ConversationDisplay conversation={conversation} isLoading={isLoading} />
                 {error && <div className="mt-4"><ErrorMessage message={error} /></div>}
            </div>
            <div className="p-4 flex-shrink-0">
                <AiInput 
                    value={userInput}
                    onChange={setUserInput}
                    onSubmit={handleSubmit}
                    isLoading={isLoading}
                    placeholder={chat ? "Ask for guidance on any official document..." : "Chat is unavailable for history items."}
                />
            </div>
        </div>
    );
};

export default DocumentGuidePage;