
import React, { useState, useCallback, useEffect } from 'react';
import LandingPage from './pages/LandingPage';
import SharedLayout from './layouts/SharedLayout';
import PrivacyPage from './pages/PrivacyPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import type { Page } from './types';
import { useAuth } from './contexts/AuthContext';
import LoadingSpinner from './components/LoadingSpinner';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const { session, loading } = useAuth();

  const navigate = useCallback((page: Page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0); // Scroll to top on page change
  }, []);
  
  // Effect to handle all redirection logic based on auth state
  useEffect(() => {
    // We wait until the initial auth check is complete to prevent flashes
    if (!loading) {
      const isAuthPage = currentPage === 'login' || currentPage === 'signup';
      const isProtectedPage = !['landing', 'privacy', 'login', 'signup'].includes(currentPage);

      if (session) {
        // USER IS LOGGED IN
        // If they are on an auth page (login, signup),
        // redirect them to the landing page.
        // Note: We allow 'landing' so users can navigate back to it from the sidebar.
        if (isAuthPage) {
          navigate('landing');
        }
      } else {
        // USER IS NOT LOGGED IN
        // If they try to access a protected page, send them to the landing page.
        if (isProtectedPage) {
          navigate('landing');
        }
      }
    }
  }, [session, currentPage, navigate, loading]);


  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <LoadingSpinner className="w-12 h-12" />
      </div>
    );
  }

  const renderCurrentPage = () => {
    // With the robust useEffect handling redirection, this render function can be simplified.
    // It just needs to render the current page state.
    switch (currentPage) {
      case 'landing':
        return <LandingPage onNavigate={navigate} />;
      case 'privacy':
        return <PrivacyPage onNavigate={navigate} />;
      case 'login':
        return <LoginPage onNavigate={navigate} />;
      case 'signup':
        return <SignupPage onNavigate={navigate} />;
      default:
        // All other pages are protected by the useEffect hook.
        // If a user is not logged in, they will be redirected away before this can render.
        return (
          <SharedLayout 
            currentPage={currentPage}
            onNavigate={navigate} 
          />
        );
    }
  }

  return (
    <>
      {renderCurrentPage()}
    </>
  );
};

export default App;
