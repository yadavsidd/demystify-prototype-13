
import type { HistoryItem, HistoryItemForCreation } from '../types';
import { supabase } from './supabaseClient';

/**
 * Retrieves the analysis history for the current user from Supabase.
 * @returns An array of HistoryItem, sorted with the most recent first.
 */
export const getHistory = async (): Promise<HistoryItem[]> => {
  try {
    const { data: userResponse } = await supabase.auth.getUser();
    if (!userResponse.user) {
        console.log("No user logged in, returning empty history.");
        return [];
    }

    const { data, error } = await supabase
        .from('history')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    // Map the flat database structure back to the app's discriminated union types
    const historyItems: HistoryItem[] = data.map((item: any) => {
        const base = {
            id: item.id,
            created_at: item.created_at,
            type: item.type,
        };
        switch (item.type) {
            case 'analysis':
                return { 
                    ...base, 
                    fileName: item.title, 
                    analysisResult: item.data.analysisResult, 
                    revisedDocumentContent: item.data.revisedDocumentContent ?? null,
                    // FIX: Conditionally add optional properties to match the type definition
                    // This ensures the inferred type from the object literal is compatible with HistoryItem,
                    // which resolves the type predicate error in the .filter() method.
                    ...(item.data.userRole != null && { userRole: item.data.userRole }),
                    ...(item.data.jurisdiction != null && { jurisdiction: item.data.jurisdiction }),
                };
            case 'translation':
                return { ...base, fileName: item.title, targetLanguage: item.data.targetLanguage, translatedText: item.data.translatedText };
            case 'draft':
                return { ...base, contractType: item.title, draftedContract: item.data.draftedContract };
            case 'guide':
                return { ...base, title: item.title, conversation: item.data.conversation };
            default:
                // This should not happen if data is consistent
                return null;
        }
    }).filter((item): item is HistoryItem => item !== null); // Filter out any nulls from unknown types

    return historyItems;

  } catch (error) {
    console.error("Failed to fetch history from Supabase", error);
    return [];
  }
};

/**
 * Saves a new item to the user's history in Supabase.
 * @param item The history item to save.
 */
export const saveHistoryItem = async (item: HistoryItemForCreation): Promise<void> => {
  try {
    const { data: userResponse } = await supabase.auth.getUser();
    if (!userResponse.user) {
        console.error("Cannot save history, no user is logged in.");
        return;
    }
    
    // Deconstruct the app-specific type into the flat database structure
    let dbRow: { type: string; title: string; data: any; user_id?: string } | null = null;
    
    switch (item.type) {
        case 'analysis':
            dbRow = { 
                type: 'analysis', 
                title: item.fileName, 
                data: { 
                    analysisResult: item.analysisResult, 
                    revisedDocumentContent: item.revisedDocumentContent,
                    userRole: item.userRole,
                    jurisdiction: item.jurisdiction
                } 
            };
            break;
        case 'translation':
            dbRow = { type: 'translation', title: item.fileName, data: { targetLanguage: item.targetLanguage, translatedText: item.translatedText } };
            break;
        case 'draft':
            dbRow = { type: 'draft', title: item.contractType, data: { draftedContract: item.draftedContract } };
            break;
        case 'guide':
            dbRow = { type: 'guide', title: item.title, data: { conversation: item.conversation } };
            break;
    }

    if (dbRow) {
      // The user_id is set automatically by the database's default value (auth.uid())
      const { error } = await supabase.from('history').insert(dbRow);
      if (error) {
        throw error;
      }
    }
  } catch (error) {
    console.error("Failed to save history item to Supabase", error);
  }
};

/**
 * Deletes a history item from Supabase.
 * @param id The ID of the history item to delete.
 */
export const deleteHistoryItem = async (id: number): Promise<void> => {
  try {
    const { error } = await supabase
      .from('history')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error("Failed to delete history item from Supabase", error);
    throw error;
  }
};
