
import type React from 'react';
import type { User, Session } from '@supabase/supabase-js';

export type Page = 'landing' | 'demystifier' | 'history' | 'drafter' | 'guide' | 'translator' | 'compare' | 'privacy' | 'login' | 'signup';

export type { User, Session };

export interface KeyDate {
    date: string;
    description: string;
}

export interface RedFlagClause {
    clause: string;
    explanation: string;
    risk: string;
    rewrittenClause?: string; // To store the user-accepted rewrite
}

export interface ActionableNextStep {
    category: string;
    step: string;
}

export interface JargonTerm {
    term: string;
    explanation: string;
}

export interface SimplifiedClause {
    original: string;
    simplified: string;
}

export interface InvolvedParty {
    name: string;
    role: string;
    details: string;
    type: 'Individual' | 'Company' | 'Other';
}

export interface AnalysisResult {
    summary: string;
    keyDates: KeyDate[];
    redFlags: RedFlagClause[];
    actionableNextSteps: ActionableNextStep[];
    jargonBuster: JargonTerm[];
    simplifiedBreakdown: SimplifiedClause[];
    involvedParties: InvolvedParty[];
    acceptanceScore: number;
    scoreJustification: string;
    potentialScore: number;
    potentialScoreJustification: string;
    fullExtractedText: string; 
    userRole?: string; // Added context
    jurisdiction?: string; // Added context
}

export interface ComparisonResult {
    summary: string;
    differences: {
        category: string;
        doc1: string;
        doc2: string;
        significance: 'High' | 'Medium' | 'Low';
        explanation: string;
    }[];
    commonClauses: string[];
    missingInDoc2: string[];
    riskAssessment: string;
    betterOption: 'Document 1' | 'Document 2' | 'Neutral';
}

export interface Message {
    role: 'user' | 'model';
    content: string;
}

export type HistoryItemType = 'analysis' | 'translation' | 'draft' | 'guide';

interface BaseHistoryItem {
    id: number;
    created_at: string; // From database
    type: HistoryItemType;
}

export interface AnalysisHistoryItem extends BaseHistoryItem {
    type: 'analysis';
    fileName: string;
    analysisResult: AnalysisResult;
    revisedDocumentContent: string | null; 
    userRole?: string;
    jurisdiction?: string;
}

export interface TranslationHistoryItem extends BaseHistoryItem {
    type: 'translation';
    fileName: string;
    targetLanguage: string;
    translatedText: string;
}

export interface DraftHistoryItem extends BaseHistoryItem {
    type: 'draft';
    contractType: string;
    draftedContract: string;
}

export interface GuideHistoryItem extends BaseHistoryItem {
    type: 'guide';
    title: string;
    conversation: Message[];
}

export type HistoryItem = AnalysisHistoryItem | TranslationHistoryItem | DraftHistoryItem | GuideHistoryItem;

export type HistoryItemForCreation = 
    | Omit<AnalysisHistoryItem, 'id' | 'created_at'>
    | Omit<TranslationHistoryItem, 'id' | 'created_at'>
    | Omit<DraftHistoryItem, 'id' | 'created_at'>
    | Omit<GuideHistoryItem, 'id' | 'created_at'>;


export interface FormField {
    key: string;
    label: string;
    placeholder: string;
    type?: 'text' | 'textarea' | 'password' | 'email';
}

export interface ContractTypeConfig {
    key: string;
    name: string;
    description: string;
    icon: React.FC<React.SVGProps<SVGSVGElement>>;
    fields: FormField[];
}

export interface AuthContextType {
    session: Session | null;
    user: User | null;
    loading: boolean;
    signOut: () => Promise<any>;
    signIn: (email: string, password: string) => Promise<any>;
    signUp: (name: string, email: string, password: string) => Promise<any>;
}
