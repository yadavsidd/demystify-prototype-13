
import React, { useState } from 'react';
import type { Page, HistoryItem } from '../types';
import PageHeader from '../components/PageHeader';
import DemystifierPage from '../pages/DemystifierPage';
import HistoryPage from '../pages/HistoryPage';
import ContractDrafterPage from '../pages/ContractDrafterPage';
import DocumentGuidePage from '../pages/DocumentGuidePage';
import TranslatorPage from '../pages/TranslatorPage';
import ComparePage from '../pages/ComparePage';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../contexts/AuthContext';
import { ShootingStars } from '../components/ui/shooting-stars';
import { CornerBorderContainer } from '../components/ui/corner-border-container';

interface SharedLayoutProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const SharedLayout: React.FC<SharedLayoutProps> = ({ currentPage, onNavigate }) => {
  const [historyItemToView, setHistoryItemToView] = useState<HistoryItem | null>(null);
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    onNavigate('login');
  };

  const handleViewHistoryItem = (item: HistoryItem) => {
    setHistoryItemToView(item);
    // Navigate to the correct page based on the item type
    switch (item.type) {
      case 'analysis':
        onNavigate('demystifier');
        break;
      case 'translation':
        onNavigate('translator');
        break;
      case 'draft':
        onNavigate('drafter');
        break;
      case 'guide':
        onNavigate('guide');
        break;
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'demystifier':
        return <DemystifierPage 
            key={historyItemToView?.id || 'new'} 
            historyItem={historyItemToView?.type === 'analysis' ? historyItemToView : null} 
            onViewHistoryItem={setHistoryItemToView} 
        />;
      case 'history':
        return <HistoryPage onViewHistoryItem={handleViewHistoryItem} />;
      case 'drafter':
        return <ContractDrafterPage 
            key={historyItemToView?.id || 'new'}
            historyItem={historyItemToView?.type === 'draft' ? historyItemToView : null}
            onViewHistoryItem={setHistoryItemToView}
        />;
      case 'guide':
        return <DocumentGuidePage 
            key={historyItemToView?.id || 'new'}
            historyItem={historyItemToView?.type === 'guide' ? historyItemToView : null}
            onViewHistoryItem={setHistoryItemToView}
        />;
      case 'translator':
        return <TranslatorPage 
            key={historyItemToView?.id || 'new'}
            historyItem={historyItemToView?.type === 'translation' ? historyItemToView : null}
            onViewHistoryItem={setHistoryItemToView}
        />;
      case 'compare':
        return <ComparePage />;
      default:
        return null;
    }
  };

  return (
    <div className="relative flex h-screen w-full overflow-hidden bg-black text-gray-100">
        {/* Grid Background Pattern */}
        <div 
            className="absolute inset-0 z-0 pointer-events-none"
            style={{
                backgroundImage: `
                    linear-gradient(to right, rgba(255, 255, 255, 0.15) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(255, 255, 255, 0.15) 1px, transparent 1px)
                `,
                backgroundSize: '40px 40px'
            }}
        />

        {/* Shooting Stars Animation */}
        <ShootingStars 
            starColor="#FFFFFF"
            trailColor="#ffffff"
            minSpeed={4}
            maxSpeed={10}
            minDelay={500}
            maxDelay={1500}
            starWidth={25}
            starHeight={3}
            className="absolute inset-0 z-0 pointer-events-none"
        />

        <div className="relative z-10 no-print h-full">
            <Sidebar 
              currentPage={currentPage} 
              onNavigate={onNavigate} 
              user={user} 
              onSignOut={handleSignOut} 
            />
        </div>

        <div className="relative z-10 flex-1 flex flex-col overflow-y-auto">
            <div className="flex-grow flex flex-col">
                <main className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 flex-grow flex flex-col w-full">
                    <div className="no-print">
                        <PageHeader currentPage={currentPage} />
                    </div>
                    <CornerBorderContainer className="rounded-lg p-6 sm:p-8 flex-grow flex flex-col print-container shadow-2xl">
                        {renderPage()}
                    </CornerBorderContainer>
                </main>
            </div>
        </div>
    </div>
  );
};

export default SharedLayout;
