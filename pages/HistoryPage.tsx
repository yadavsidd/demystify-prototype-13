
import React, { useState, useEffect } from 'react';
import { getHistory, deleteHistoryItem } from '../services/historyService';
import type { HistoryItem } from '../types';
import { DemystifierIcon, TranslatorIcon, DrafterIcon, GuideIcon } from '../components/icons';
import { History, Trash2 } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

interface HistoryPageProps {
  onViewHistoryItem: (item: HistoryItem) => void;
}

const HistoryItemCard: React.FC<{ item: HistoryItem, onView: (item: HistoryItem) => void, onDelete: (id: number) => Promise<void> }> = ({ item, onView, onDelete }) => {
    const [isDeleting, setIsDeleting] = useState(false);
    
    const getIcon = () => {
        switch(item.type) {
            case 'analysis': return <DemystifierIcon className="w-8 h-8 text-blue-400 flex-shrink-0" />;
            case 'translation': return <TranslatorIcon className="w-8 h-8 text-purple-400 flex-shrink-0" />;
            case 'draft': return <DrafterIcon className="w-8 h-8 text-amber-400 flex-shrink-0" />;
            case 'guide': return <GuideIcon className="w-8 h-8 text-green-400 flex-shrink-0" />;
            default: return <History className="w-8 h-8 text-gray-400 flex-shrink-0" />;
        }
    };

    const getTitle = () => {
        switch(item.type) {
            case 'analysis': return item.fileName;
            case 'translation': return `${item.fileName} -> ${item.targetLanguage}`;
            case 'draft': return item.contractType;
            case 'guide': return item.title;
            default: return "History Item";
        }
    };

    const getDescription = () => {
        const date = new Date(item.created_at).toLocaleString();
        switch(item.type) {
            case 'analysis': return `Analyzed on: ${date}`;
            case 'translation': return `Translated on: ${date}`;
            case 'draft': return `Drafted on: ${date}`;
            case 'guide': return `Conversation from: ${date}`;
            default: return `Created on: ${date}`;
        }
    }

    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation(); 
        e.preventDefault();
        
        if (window.confirm('Are you sure you want to delete this history item? This cannot be undone.')) {
            setIsDeleting(true);
            try {
                await onDelete(item.id);
            } catch (error) {
                console.error("Error deleting item", error);
                setIsDeleting(false);
            }
        }
    };

    return (
        <div className="flex items-center p-4 rounded-lg bg-gray-900 border border-gray-800 hover:bg-gray-800/50 transition-all duration-200 group">
            {/* Main Clickable Area (View) */}
            <div 
                onClick={() => onView(item)}
                className="flex items-center flex-grow min-w-0 cursor-pointer mr-4"
            >
                {getIcon()}
                <div className="ml-4 min-w-0">
                    <p className="font-semibold text-gray-200 truncate">{getTitle()}</p>
                    <p className="text-sm text-gray-400 truncate">{getDescription()}</p>
                </div>
            </div>
            
            {/* Separate Action Area (Delete) */}
            <div className="flex items-center gap-3 shrink-0 relative z-10">
                <button 
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-all focus:outline-none cursor-pointer"
                    title="Delete"
                    type="button"
                >
                    {isDeleting ? (
                        <LoadingSpinner className="w-5 h-5 text-red-500" />
                    ) : (
                        <Trash2 className="w-5 h-5" />
                    )}
                </button>
                <div className="pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </div>
            </div>
        </div>
    );
}


const HistoryPage: React.FC<HistoryPageProps> = ({ onViewHistoryItem }) => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
        setLoading(true);
        const historyData = await getHistory();
        setHistory(historyData);
        setLoading(false);
    };

    fetchHistory();
  }, []);

  const handleDeleteItem = async (id: number) => {
      try {
          await deleteHistoryItem(id);
          setHistory(prev => prev.filter(item => item.id !== id));
      } catch (error) {
          console.error("Failed to delete item:", error);
          alert("Failed to delete history item. Please try again.");
          throw error;
      }
  };

  if (loading) {
    return (
        <div className="flex justify-center items-center h-full">
            <LoadingSpinner className="w-10 h-10" />
        </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white font-heading">History</h2>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-16 px-6 rounded-lg border-2 border-dashed border-gray-700">
          <History className="w-12 h-12 mx-auto text-gray-500" />
          <h2 className="text-xl font-semibold text-gray-300 mt-4">No History Yet</h2>
          <p className="text-gray-400 mt-2">
            Your activities like document analyses, translations, and drafts will be saved to your account and will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((item) => (
            <HistoryItemCard 
                key={item.id} 
                item={item} 
                onView={onViewHistoryItem} 
                onDelete={handleDeleteItem}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
