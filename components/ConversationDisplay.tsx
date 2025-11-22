import React, { useEffect, useRef } from 'react';
import type { Message } from '../types';
import { BrandIcon } from './icons';

interface ConversationDisplayProps {
  conversation: Message[];
  isLoading: boolean;
}

const TypingIndicator: React.FC = () => (
    <div className="flex items-center space-x-1.5">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
    </div>
);

const ConversationDisplay: React.FC<ConversationDisplayProps> = ({ conversation, isLoading }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation, isLoading]);

  const formatText = (inputText: string) => {
    const blocks = inputText.split('\n\n');
    return blocks.map((block, index) => {
      if (block.startsWith('### ')) {
        return <h3 key={index} className="text-lg font-semibold mt-4 mb-2">{block.substring(4)}</h3>;
      }
      if (block.startsWith('## ')) {
        return <h2 key={index} className="text-xl font-bold mt-6 mb-3 border-b border-gray-700 pb-2">{block.substring(3)}</h2>;
      }
      const lines = block.split('\n');
      if (lines.every(line => line.startsWith('* '))) {
        return (
          <ul key={index} className="list-disc list-inside space-y-1 my-2">
            {lines.map((line, liIndex) => <li key={liIndex}>{line.substring(2)}</li>)}
          </ul>
        );
      }
      return <p key={index} className="my-2 leading-relaxed">{block}</p>;
    });
  };

  return (
    <div className="flex-grow w-full">
        <div className="space-y-6">
            {conversation.map((msg, index) => (
                <div key={index} className={`flex gap-4 animate-fade-in-up ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.role === 'model' && (
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center">
                            <BrandIcon className="w-5 h-5 text-gray-300" />
                        </div>
                    )}
                    <div className={`max-w-xl lg:max-w-2xl rounded-2xl px-5 py-3 shadow-sm ${msg.role === 'user' ? 'bg-green-900/60 text-white rounded-br-none' : 'bg-gray-800 text-gray-200 rounded-bl-none'}`}>
                         {msg.role === 'model' ? (
                            <div className="prose prose-sm prose-invert max-w-none">
                                {formatText(msg.content)}
                            </div>
                         ) : (
                            <p>{msg.content}</p>
                         )}
                    </div>
                </div>
            ))}
            {isLoading && conversation[conversation.length - 1]?.role !== 'model' && (
                 <div className="flex gap-4 justify-start">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center">
                        <BrandIcon className="w-5 h-5 text-gray-300" />
                    </div>
                     <div className="max-w-xl lg:max-w-2xl rounded-2xl rounded-bl-none px-5 py-3 shadow-sm bg-gray-800 flex items-center space-x-3">
                        <TypingIndicator />
                     </div>
                 </div>
            )}
             <div ref={messagesEndRef} />
        </div>
    </div>
  );
};

export default ConversationDisplay;