
import React, { useState, useEffect } from 'react';
import type { Chat } from '@google/genai';
import type { AnalysisResult, KeyDate, RedFlagClause, ActionableNextStep, JargonTerm, AnalysisHistoryItem, Message } from '../types';
import { suggestClauseRewrite, translateBreakdown, generateRebuttalEmail } from '../services/geminiService';
import { DateIcon, NextStepIcon, RedFlagIcon, GaugeIcon, TrendingUpIcon, SparklesIcon, LightbulbIcon, DocumentIcon, ChatBubbleIcon, DrafterIcon, DownloadIcon, SendIcon, UsersIcon } from './icons';
import CopyButton from './CopyButton';
import ScoreGauge from './ScoreGauge';
import LoadingSpinner from './LoadingSpinner';
import Tabs from './Tabs';
import EmptyState from './EmptyState';
import ConversationDisplay from './ConversationDisplay';
import { AiInput } from './AiInput';
import ReportView from './ReportView';
import { CornerBorderContainer } from './ui/corner-border-container';
import { languages } from './LanguageSelector';

interface ClauseRewriteProps {
    clause: RedFlagClause;
    clauseIndex: number;
    onAcceptAndReplace: (index: number, newText: string) => void;
    onDiscuss: (clauseText: string) => void;
}

const ClauseRewrite: React.FC<ClauseRewriteProps> = ({ clause, clauseIndex, onAcceptAndReplace, onDiscuss }) => {
    const [suggestion, setSuggestion] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [emailDraft, setEmailDraft] = useState<string | null>(null);
    const [isEmailLoading, setIsEmailLoading] = useState(false);

    const handleSuggestRewrite = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await suggestClauseRewrite(clause.clause, clause.explanation);
            setSuggestion(result);
            setEmailDraft(null); // Reset email if generating new suggestion
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to get suggestion.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDraftEmail = async (proposedText: string) => {
        setIsEmailLoading(true);
        try {
            const draft = await generateRebuttalEmail(clause.clause, proposedText, clause.explanation);
            setEmailDraft(draft);
        } catch (err) {
            setError('Failed to generate email draft.');
        } finally {
            setIsEmailLoading(false);
        }
    };
    
    if (clause.rewrittenClause) {
        return (
            <div className="mt-3 pt-3 border-t border-gray-700">
                <h4 className="text-sm font-semibold text-gray-400">Original Clause:</h4>
                <p className="text-sm text-gray-500 line-through mt-1">{clause.clause}</p>
                
                <div className="flex items-center justify-between mt-3 mb-1">
                     <h4 className="text-sm font-semibold text-[var(--accent-color)]">Accepted Rewrite:</h4>
                </div>
                
                <div className="relative mt-1 p-3 rounded-md bg-green-900/20 border border-green-700/50 text-sm text-gray-300">
                    <p className="whitespace-pre-wrap">{clause.rewrittenClause}</p>
                    <div className="absolute top-1 right-1">
                        <CopyButton textToCopy={clause.rewrittenClause} />
                    </div>
                </div>

                {!emailDraft ? (
                     <button
                        onClick={() => handleDraftEmail(clause.rewrittenClause!)}
                        disabled={isEmailLoading}
                        className="mt-3 flex items-center space-x-2 px-3 py-1.5 text-xs font-semibold rounded-md text-gray-300 bg-gray-800 hover:bg-gray-700 transition-colors"
                    >
                        {isEmailLoading ? <LoadingSpinner className="w-3 h-3" /> : <SendIcon className="w-3 h-3" />}
                        <span>Draft Rebuttal Email</span>
                    </button>
                ) : (
                    <div className="mt-3 animate-fade-in-up">
                        <h4 className="text-sm font-semibold text-blue-300 mb-1">Negotiation Email Draft:</h4>
                        <div className="relative p-3 rounded-md bg-blue-900/10 border border-blue-800 text-sm text-gray-300">
                             <p className="whitespace-pre-wrap">{emailDraft}</p>
                             <div className="absolute top-1 right-1">
                                 <CopyButton textToCopy={emailDraft} />
                             </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="mt-3 pt-3 border-t border-gray-700">
            <div className="flex flex-wrap gap-2 mb-2">
                {suggestion ? (
                     <div className="w-full animate-fade-in-up">
                        <h4 className="text-sm font-semibold text-[var(--accent-color)]">Suggested Rewrite:</h4>
                        <div className="relative mt-2 p-3 rounded-md bg-gray-800 text-sm text-gray-300 border border-gray-700">
                             <p className="whitespace-pre-wrap">{suggestion}</p>
                             <div className="absolute top-1 right-1">
                                 <CopyButton textToCopy={suggestion} />
                             </div>
                        </div>
                        
                        {/* Actions Row */}
                        <div className="flex flex-wrap items-center gap-2 mt-3">
                            <button 
                                onClick={() => onAcceptAndReplace(clauseIndex, suggestion)}
                                className="px-3 py-1.5 text-xs font-bold text-black bg-[var(--accent-color)] rounded-md hover:opacity-90 transition-colors"
                            >
                                Accept & Replace
                            </button>
                            
                            <button
                                onClick={() => handleDraftEmail(suggestion)}
                                disabled={isEmailLoading}
                                className="px-3 py-1.5 text-xs font-semibold rounded-md text-gray-300 bg-gray-700 hover:bg-gray-600 transition-colors flex items-center gap-1"
                            >
                                {isEmailLoading ? <LoadingSpinner className="w-3 h-3" /> : <SendIcon className="w-3 h-3" />}
                                Draft Email
                            </button>

                            <button 
                                onClick={() => { setSuggestion(null); setEmailDraft(null); }}
                                className="px-3 py-1.5 text-xs font-medium text-gray-400 hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                        </div>

                        {/* Email Draft Area */}
                        {emailDraft && (
                            <div className="mt-3 pt-3 border-t border-gray-700 animate-fade-in-up">
                                <h4 className="text-sm font-semibold text-blue-300 mb-1">Negotiation Email Draft:</h4>
                                <div className="relative p-3 rounded-md bg-blue-900/10 border border-blue-800 text-sm text-gray-300">
                                    <p className="whitespace-pre-wrap">{emailDraft}</p>
                                    <div className="absolute top-1 right-1">
                                        <CopyButton textToCopy={emailDraft} />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <>
                        <button
                            onClick={handleSuggestRewrite}
                            disabled={isLoading}
                            className="flex items-center space-x-2 px-3 py-1.5 text-xs font-semibold rounded-md text-[var(--accent-color)] bg-green-900/20 border border-green-900/50 hover:bg-green-900/40 transition-colors disabled:opacity-50"
                        >
                            {isLoading ? <LoadingSpinner className="w-3 h-3 text-[var(--accent-color)]" /> : <SparklesIcon className="w-3 h-3" />}
                            <span>Suggest Rewrite</span>
                        </button>
                        <button
                            onClick={() => onDiscuss(clause.clause)}
                            className="flex items-center space-x-2 px-3 py-1.5 text-xs font-semibold rounded-md text-blue-300 bg-blue-900/20 border border-blue-900/50 hover:bg-blue-900/40 transition-colors"
                        >
                            <ChatBubbleIcon className="w-3 h-3" />
                            <span>Discuss in Chat</span>
                        </button>
                    </>
                )}
            </div>
            {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
        </div>
    );
};

const PromptSuggestion: React.FC<{ text: string; onClick: () => void }> = ({ text, onClick }) => (
    <button
        onClick={onClick}
        className="text-left p-3 bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-lg transition-all text-sm text-gray-300 flex items-center space-x-2 no-print group"
    >
        <NextStepIcon className="w-4 h-4 text-gray-500 group-hover:text-[var(--accent-color)] transition-colors flex-shrink-0" />
        <span>{text}</span>
    </button>
);

interface StructuredResultDisplayProps {
    result: AnalysisResult;
    onUpdateResult: (newResult: AnalysisResult) => void;
    originalDocument: { content: string; mimeType: string; } | null;
    historyItem: AnalysisHistoryItem | null;
    onReset: () => void;
    chat: Chat | null;
    conversation: Message[];
    isChatLoading: boolean;
    userInput: string;
    onUserInput: (value: string) => void;
    onChatSubmit: (e: React.FormEvent) => Promise<void>;
    onSuggestionClick: (text: string) => void;
    chatFormRef: React.RefObject<HTMLFormElement>;
    revisedDocumentContent: string | null;
    onRevisedDocumentContentChange: (content: string) => void;
    onClauseReplacement: (original: string, replacement: string) => void;
    highlightedClauses: string[];
}

const StructuredResultDisplay: React.FC<StructuredResultDisplayProps> = (props) => {
    const { 
        result, onUpdateResult, originalDocument, historyItem, onReset, 
        chat, conversation, isChatLoading, userInput, onUserInput, onChatSubmit, onSuggestionClick, chatFormRef,
        revisedDocumentContent, onRevisedDocumentContentChange, onClauseReplacement,
        highlightedClauses
    } = props;
    const { summary, keyDates, actionableNextSteps, redFlags, jargonBuster, involvedParties, acceptanceScore, scoreJustification, potentialScore, potentialScoreJustification } = result;
    
    const [sortedKeyDates, setSortedKeyDates] = useState<KeyDate[]>([]);
    const [activeTab, setActiveTab] = useState('Overview');
    const [checkedSteps, setCheckedSteps] = useState<Set<number>>(new Set());
    const [breakdownLanguage, setBreakdownLanguage] = useState<string>('English');
    const [isTranslatingBreakdown, setIsTranslatingBreakdown] = useState(false);

    useEffect(() => {
        if (keyDates && keyDates.length > 0) {
            const sorted = [...keyDates].sort((a, b) => {
                try {
                    const dateA = new Date(a.date);
                    const dateB = new Date(b.date);
                    if (!isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) {
                        return dateA.getTime() - dateB.getTime();
                    }
                    return 0;
                } catch (e) {
                    return 0;
                }
            });
            setSortedKeyDates(sorted);
        }
    }, [keyDates]);

    const handleAcceptAndReplace = (clauseIndex: number, newText: string) => {
        const originalClauseText = result.redFlags[clauseIndex].clause;

        const updatedResult = { ...result };
        const updatedRedFlags = [...updatedResult.redFlags];
        updatedRedFlags[clauseIndex] = { ...updatedRedFlags[clauseIndex], rewrittenClause: newText };
        updatedResult.redFlags = updatedRedFlags;
        onUpdateResult(updatedResult);

        onClauseReplacement(originalClauseText, newText);
    };
    
    const handleDiscussClause = (clauseText: string) => {
        setActiveTab('Chat');
        // Small timeout to ensure tab switch happens before focus
        setTimeout(() => {
             onSuggestionClick(`Can you explain why this clause is risky or ambiguous: "${clauseText}"?`);
        }, 100);
    };

    const handleTranslateBreakdown = async () => {
        if (!result.simplifiedBreakdown) return;
        setIsTranslatingBreakdown(true);
        try {
            const newBreakdown = await translateBreakdown(result.simplifiedBreakdown, breakdownLanguage);
            onUpdateResult({
                ...result,
                simplifiedBreakdown: newBreakdown
            });
        } catch (e) {
            console.error("Translation failed:", e);
            // You might want to add a toast or error notification here
        } finally {
            setIsTranslatingBreakdown(false);
        }
    };
    
    const toggleStep = (index: number) => {
        const newChecked = new Set(checkedSteps);
        if (newChecked.has(index)) {
            newChecked.delete(index);
        } else {
            newChecked.add(index);
        }
        setCheckedSteps(newChecked);
    };

    const handleDownloadAnalysisReport = () => {
        const completed = checkedSteps.size;
        const total = actionableNextSteps.length;
        
        const report = `# DEMYSTIFY ANALYSIS REPORT
Generated on: ${new Date().toLocaleDateString()}
${result.userRole ? `Role: ${result.userRole}` : ''}
${result.jurisdiction ? `Jurisdiction: ${result.jurisdiction}` : ''}

## 📄 SUMMARY
${summary}

## 📊 SCORES
**Current Acceptance Score:** ${acceptanceScore}/100
*${scoreJustification}*

**Potential Score:** ${potentialScore}/100
*${potentialScoreJustification}*

## 📅 KEY DATES & DEADLINES
${sortedKeyDates.map(d => `- **${d.date}**: ${d.description}`).join('\n')}

## 👥 INVOLVED PARTIES
${involvedParties?.map(p => `- **${p.name}** (${p.role}): ${p.details}`).join('\n')}

## 🚩 RED FLAGS & RISKS
${redFlags.map((f, i) => `### ${i + 1}. ${f.risk} Risk
**Clause:** "${f.clause}"
**Explanation:** ${f.explanation}
`).join('\n')}

## ✅ ACTION PLAN (${completed}/${total} Completed)
${actionableNextSteps.map((s, i) => `- [${checkedSteps.has(i) ? 'x' : ' '}] **${s.category}**: ${s.step}`).join('\n')}

## 💡 KEY DEFINITIONS
${jargonBuster.map(j => `- **${j.term}**: ${j.explanation}`).join('\n')}

---
*Disclaimer: This analysis is AI-generated and for informational purposes and does not constitute legal advice.*
        `;

        const blob = new Blob([report], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Demystify_Analysis_${new Date().toISOString().split('T')[0]}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const baseTabs = ['Overview', 'People', 'Human Translation', 'Risk Analysis', 'Key Definitions', 'Action Plan'];
    let tabs = [...baseTabs];
    
    if (result) {
        tabs.push('Final Draft');
    }
    
    if (chat) {
        tabs.push('Chat');
    }
    
    // Calculate progress for Action Plan
    const progressPercentage = actionableNextSteps.length > 0 
        ? Math.round((checkedSteps.size / actionableNextSteps.length) * 100) 
        : 0;

    const renderTabContent = () => {
        switch (activeTab) {
            case 'Overview':
                return (
                    <div className="space-y-6 animate-fade-in-up">
                         {/* Context Info Card */}
                         {(result.userRole || result.jurisdiction) && (
                            <div className="flex gap-4 text-sm bg-[var(--accent-color)]/10 border border-[var(--accent-color)]/30 p-3 rounded-lg text-[var(--accent-color)]">
                                {result.userRole && <span><strong>Role:</strong> {result.userRole}</span>}
                                {result.jurisdiction && <span><strong>Jurisdiction:</strong> {result.jurisdiction}</span>}
                            </div>
                         )}
                         
                         <div className="bg-gray-900/50 p-5 rounded-xl border border-gray-800">
                             <h3 className="text-lg font-semibold text-gray-200 mb-3">Plain English Summary</h3>
                             <p className="text-gray-300 leading-relaxed">{summary}</p>
                        </div>
                        {sortedKeyDates.length > 0 && (
                             <div>
                                <h3 className="text-lg font-semibold text-gray-200 mb-4 flex items-center"><DateIcon className="w-5 h-5 mr-2 text-[var(--accent-color)]" /> Key Dates & Deadlines</h3>
                                 <div className="relative pl-4 border-l-2 border-gray-800 ml-2">
                                    <div className="space-y-6">
                                        {sortedKeyDates.map((item, index) => (
                                            <div key={index} className="relative pl-4">
                                                 <div className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-[var(--accent-color)] shadow-[0_0_10px_var(--accent-color)] z-10"></div>
                                                <p className="font-bold text-[var(--accent-color)] text-lg">{item.date}</p>
                                                <p className="text-gray-400">{item.description}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                );
            case 'People':
                return involvedParties && involvedParties.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
                        {involvedParties.map((party, index) => (
                            <CornerBorderContainer key={index} className="p-5 flex flex-col bg-gray-900/40 hover:bg-gray-900/60 transition-colors">
                                <div className="flex items-start justify-between mb-3">
                                    <div className={`p-2 rounded-lg ${party.type === 'Company' ? 'bg-blue-900/20 text-blue-400' : 'bg-purple-900/20 text-purple-400'}`}>
                                        <UsersIcon className="w-6 h-6" />
                                    </div>
                                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500 border border-gray-700 px-2 py-1 rounded-full">
                                        {party.type}
                                    </span>
                                </div>
                                <h4 className="text-lg font-bold text-white mb-1">{party.name}</h4>
                                <p className="text-[var(--accent-color)] text-sm font-medium mb-3">{party.role}</p>
                                <div className="mt-auto pt-3 border-t border-gray-800">
                                    <p className="text-sm text-gray-400 break-words">{party.details}</p>
                                </div>
                            </CornerBorderContainer>
                        ))}
                    </div>
                ) : (
                    <EmptyState 
                        icon={<UsersIcon className="w-12 h-12 mx-auto text-gray-500" />} 
                        message="No Specific Parties Found" 
                        description="We couldn't identify specific individuals or companies with detailed data in this document." 
                    />
                );
            case 'Human Translation':
                return (
                    <div className="space-y-6 animate-fade-in-up">
                        {result.simplifiedBreakdown && result.simplifiedBreakdown.length > 0 ? (
                            <CornerBorderContainer className="p-1 bg-black/50 border-gray-800">
                                <div className="p-4 border-b border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-900/50 rounded-t-lg">
                                    <h3 className="text-lg font-semibold text-white font-heading">Side-by-Side Breakdown</h3>
                                    <div className="flex items-center gap-2 w-full sm:w-auto">
                                        <select 
                                            value={breakdownLanguage}
                                            onChange={(e) => setBreakdownLanguage(e.target.value)}
                                            className="bg-gray-800 text-gray-200 text-sm rounded-md border border-gray-700 p-2 focus:outline-none focus:ring-1 focus:ring-[var(--accent-color)]"
                                            disabled={isTranslatingBreakdown}
                                        >
                                            {languages.map(lang => (
                                                <option key={lang.code} value={lang.name}>{lang.name}</option>
                                            ))}
                                        </select>
                                        <button 
                                            onClick={handleTranslateBreakdown}
                                            disabled={isTranslatingBreakdown}
                                            className="px-4 py-2 bg-[var(--accent-color)] text-black text-sm font-bold rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
                                        >
                                            {isTranslatingBreakdown ? <LoadingSpinner className="w-4 h-4 text-black" /> : <SparklesIcon className="w-4 h-4" />}
                                            {isTranslatingBreakdown ? 'Simplifying...' : 'Simplify'}
                                        </button>
                                    </div>
                                </div>

                                <div className="divide-y divide-gray-800">
                                    {/* Header Row - Visible on Desktop */}
                                    <div className="hidden md:grid grid-cols-2 bg-gray-900/80">
                                        <div className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider border-r border-gray-800">
                                            Original Text
                                        </div>
                                        <div className="p-4 text-xs font-bold text-[var(--accent-color)] uppercase tracking-wider">
                                            Human Translation ({breakdownLanguage})
                                        </div>
                                    </div>

                                    {/* Content Rows */}
                                    {result.simplifiedBreakdown.map((item, index) => (
                                        <div key={index} className="grid grid-cols-1 md:grid-cols-2 group hover:bg-white/5 transition-colors">
                                            <div className="p-6 text-sm text-gray-400 font-mono leading-relaxed border-b md:border-b-0 md:border-r border-gray-800 relative">
                                                {/* Mobile Label */}
                                                <span className="md:hidden block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Original</span>
                                                {item.original}
                                            </div>
                                            <div className="p-6 text-base text-gray-100 leading-relaxed relative">
                                                {/* Mobile Label */}
                                                <span className="md:hidden block text-xs font-bold text-[var(--accent-color)] uppercase tracking-wider mb-2">Simplified ({breakdownLanguage})</span>
                                                {item.simplified}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CornerBorderContainer>
                        ) : (
                             <EmptyState 
                                icon={<SparklesIcon className="w-12 h-12 mx-auto text-gray-500" />} 
                                message="Translation Not Available" 
                                description="We couldn't generate a side-by-side translation for this document. Try re-analyzing it." 
                             />
                         )}
                    </div>
                );
            case 'Risk Analysis':
                return redFlags.length > 0 ? (
                     <ul className="space-y-4 animate-fade-in-up">
                        {redFlags.map((item, index) => (
                            <li key={index} className="p-5 rounded-xl bg-gray-900/50 border border-gray-800 hover:border-red-900/30 transition-colors group">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 rounded bg-red-900/20 text-red-400">
                                            <RedFlagIcon className="w-5 h-5" />
                                        </div>
                                        <span className="font-semibold text-red-400">
                                            {item.rewrittenClause ? 'Risk Mitigated (Rewritten)' : `${item.risk} Risk Clause`}
                                        </span>
                                    </div>
                                    <CopyButton textToCopy={`Clause: ${item.clause}\nExplanation: ${item.explanation}\nRisk: ${item.risk}`} />
                                </div>
                                 <div className="pl-2 border-l-2 border-gray-800 my-3">
                                    <p className={`text-sm text-gray-300 italic ${item.rewrittenClause ? 'line-through opacity-50' : ''}`}>"{item.clause}"</p>
                                 </div>
                                <p className="text-sm text-gray-400 mt-3"><strong className="text-gray-200">Why it matters:</strong> {item.explanation}</p>
                                <ClauseRewrite 
                                    clause={item} 
                                    clauseIndex={index} 
                                    onAcceptAndReplace={handleAcceptAndReplace} 
                                    onDiscuss={handleDiscussClause}
                                />
                            </li>
                        ))}
                    </ul>
                ) : <EmptyState icon={<RedFlagIcon />} message="No Significant Risks Found" description="Our analysis did not identify any high-risk clauses or major red flags in your document." />;
            case 'Key Definitions':
                return jargonBuster.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in-up">
                        {jargonBuster.map((item, index) => (
                            <div key={index} className="p-4 rounded-xl bg-gray-900/50 border border-gray-800 hover:bg-gray-900 transition-colors">
                                <p className="font-bold text-[var(--accent-color)] text-lg mb-2">{item.term}</p>
                                <p className="text-sm text-gray-400 leading-relaxed">{item.explanation}</p>
                            </div>
                        ))}
                    </div>
                ) : <EmptyState icon={<LightbulbIcon />} message="No Complex Terms Detected" description="The document appears to use straightforward language without complex legal or technical terms." />;
            case 'Action Plan':
                return (
                    <div className="space-y-8 animate-fade-in-up">
                        {/* Score Overview */}
                        <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent-color)] opacity-5 blur-[60px] rounded-full pointer-events-none"></div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                                <div className="flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-gray-800 pb-6 md:pb-0">
                                    <ScoreGauge score={acceptanceScore} />
                                    <div className="text-center mt-2">
                                        <h4 className="font-bold text-white text-lg">Current Safety Score</h4>
                                        <p className="text-sm text-gray-400 mt-1 max-w-xs mx-auto">{scoreJustification}</p>
                                    </div>
                                </div>
                                
                                <div className="flex flex-col items-center justify-center">
                                    <div className="relative flex items-center justify-center w-32 h-32 mb-2">
                                         <div className="absolute inset-0 rounded-full border-4 border-gray-800 border-dashed animate-[spin_10s_linear_infinite]"></div>
                                         <div className="flex flex-col items-center">
                                            <span className="text-4xl font-bold text-[var(--accent-color)]">+{potentialScore - acceptanceScore}</span>
                                            <span className="text-xs text-gray-500 uppercase tracking-wider">Points</span>
                                         </div>
                                    </div>
                                    <div className="text-center">
                                        <h4 className="font-bold text-white text-lg">Potential Improvement</h4>
                                        <p className="text-sm text-gray-400 mt-1 max-w-xs mx-auto">{potentialScoreJustification}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Checklist */}
                        {actionableNextSteps.length > 0 && (
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-200 flex items-center">
                                        <NextStepIcon className="w-5 h-5 mr-2 text-[var(--accent-color)]" /> 
                                        Your Action Checklist
                                    </h3>
                                    <span className="text-sm text-gray-400 font-mono">
                                        {checkedSteps.size}/{actionableNextSteps.length} Completed
                                    </span>
                                </div>
                                
                                {/* Progress Bar */}
                                <div className="w-full h-2 bg-gray-800 rounded-full mb-6 overflow-hidden">
                                    <div 
                                        className="h-full bg-[var(--accent-color)] transition-all duration-500 ease-out shadow-[0_0_10px_var(--accent-color)]"
                                        style={{ width: `${progressPercentage}%` }}
                                    />
                                </div>

                                <ul className="space-y-3">
                                    {actionableNextSteps.map((item, index) => (
                                        <li 
                                            key={index} 
                                            className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer flex items-start gap-4 group ${
                                                checkedSteps.has(index) 
                                                    ? 'bg-green-900/10 border-green-900/30 opacity-60' 
                                                    : 'bg-gray-900/40 border-gray-800 hover:border-gray-600 hover:bg-gray-900/60'
                                            }`}
                                            onClick={() => toggleStep(index)}
                                        >
                                            <div className={`flex-shrink-0 mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                                                checkedSteps.has(index) 
                                                    ? 'bg-[var(--accent-color)] border-[var(--accent-color)] scale-110' 
                                                    : 'border-gray-600 bg-transparent group-hover:border-[var(--accent-color)]'
                                            }`}>
                                                {checkedSteps.has(index) && (
                                                    <svg className="w-3.5 h-3.5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                )}
                                            </div>
                                            <div className="flex-grow">
                                                <p className={`font-bold text-sm mb-0.5 uppercase tracking-wide ${checkedSteps.has(index) ? 'text-gray-500' : 'text-[var(--accent-color)]'}`}>
                                                    {item.category}
                                                </p>
                                                <p className={`text-base ${checkedSteps.has(index) ? 'text-gray-500 line-through decoration-gray-600' : 'text-gray-200'}`}>
                                                    {item.step}
                                                </p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                );
            case 'Final Draft':
                return <ReportView 
                    content={revisedDocumentContent}
                    onContentChange={onRevisedDocumentContentChange}
                    highlightedClauses={highlightedClauses}
                    isEditable={revisedDocumentContent !== null}
                />;
            case 'Chat':
                const showSuggestions = conversation.length <= 1 && !isChatLoading && chat;
                return (
                    <div className="flex flex-col h-full min-h-[70vh] animate-fade-in-up">
                        <div className="flex-grow overflow-y-auto pr-2 mb-4 bg-gray-900/50 p-4 rounded-xl border border-gray-800 shadow-inner">
                             <ConversationDisplay conversation={conversation} isLoading={isChatLoading} />
                         </div>
                        <div className="flex-shrink-0">
                            {showSuggestions && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 animate-fade-in-up">
                                    <PromptSuggestion text="What if I miss a payment?" onClick={() => onSuggestionClick("What happens if I miss a payment according to this document?")} />
                                    <PromptSuggestion text="How can I terminate this early?" onClick={() => onSuggestionClick("What are the conditions for terminating this agreement early?")} />
                                    <PromptSuggestion text="Are there any hidden fees?" onClick={() => onSuggestionClick("Does this document mention any hidden fees or unexpected costs?")} />
                                    <PromptSuggestion text="Explain the indemnity clause" onClick={() => onSuggestionClick("Can you explain the indemnity clause in simple terms?")} />
                                </div>
                            )}
                            <AiInput 
                                formRef={chatFormRef}
                                value={userInput}
                                onChange={onUserInput}
                                onSubmit={onChatSubmit}
                                isLoading={isChatLoading}
                                placeholder={chat ? "Ask Demystify about your document..." : "Chat is unavailable for history items."}
                            />
                        </div>
                    </div>
                );
            default:
                return null;
        }
    }

    return (
        <div className="flex flex-col h-full">
            <header className="flex-shrink-0 flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-gray-800 gap-4 no-print">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-gray-900 rounded-lg border border-gray-800 hidden sm:block">
                        <DocumentIcon className="w-6 h-6 text-gray-300" />
                    </div>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-xl font-bold text-white font-heading truncate max-w-md tracking-wide">
                                {historyItem ? historyItem.fileName : 'Analysis Results'}
                            </h3>
                            {historyItem && (
                                <span className="px-2 py-0.5 bg-gray-800 rounded text-[10px] font-bold uppercase tracking-wider text-gray-400 border border-gray-700">
                                    History
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-gray-400">
                            {result.userRole ? `Analyzed for: ${result.userRole} ` : ''} 
                            {result.jurisdiction ? `in ${result.jurisdiction}` : ''}
                            {!result.userRole && !result.jurisdiction && (originalDocument ? `${originalDocument.mimeType.split('/')[1].toUpperCase()} Document` : 'Saved Analysis')}
                        </p>
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                    <button 
                        onClick={handleDownloadAnalysisReport}
                        className="flex items-center px-4 py-2 text-sm font-bold rounded-lg text-gray-300 bg-gray-900 border border-gray-800 hover:bg-gray-800 hover:text-white hover:border-gray-700 transition-all"
                        title="Download Analysis Report as Markdown"
                    >
                        <DownloadIcon className="w-4 h-4 mr-2" />
                        Download Report
                    </button>
                    {historyItem && (
                        <button onClick={onReset} className="px-5 py-2 text-sm font-bold rounded-lg text-black bg-[var(--accent-color)] hover:opacity-90 transition-opacity shadow-[0_0_15px_rgba(161,161,170,0.2)]">
                            New Analysis
                        </button>
                    )}
                </div>
            </header>

            <div className="no-print mb-6">
                <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
            </div>
            
            <div className="mt-2 flex-grow">
                {renderTabContent()}
            </div>
        </div>
    );
};

export default StructuredResultDisplay;
