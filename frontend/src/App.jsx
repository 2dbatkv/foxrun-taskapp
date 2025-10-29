import React, { useEffect, useLayoutEffect, useState, useRef } from 'react';
import TileLayout from './components/TileLayout';
import TaskPlanner from './components/TaskPlanner';
import Calendar from './components/Calendar';
import Reminders from './components/Reminders';
import KnowledgeBase from './components/KnowledgeBase';
import Documents from './components/Documents';
import ChatInterface from './components/ChatInterface';
import FeedbackForm from './components/FeedbackForm';
import SearchBar from './components/SearchBar';
import SearchResults from './components/SearchResults';
import Dashboard from './components/Dashboard';
import LoginView from './components/LoginView';
import AdminPanel from './components/AdminPanel';
import { login as loginService, logout as logoutService, persistAuth, initializeAuthFromStorage } from './services/auth';

function App() {
  const [auth, setAuth] = useState({
    authenticated: false,
    label: null,
    role: null,
    expiresAt: null,
    token: null,
  });
  const [initializing, setInitializing] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState(null);
  const [searchResults, setSearchResults] = useState(null);
  const [isAISearch, setIsAISearch] = useState(false);
  const [showAdminView, setShowAdminView] = useState(false);
  const topRef = useRef(null);

  // Disable browser's automatic scroll restoration
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  useEffect(() => {
    const stored = initializeAuthFromStorage();
    if (stored) {
      setAuth({
        authenticated: true,
        label: stored.label,
        role: stored.role,
        expiresAt: stored.expires_at,
        token: stored.access_token,
      });
    }
    setInitializing(false);
  }, []);

  // Scroll to top when authenticated view renders or page refreshes
  // Use useLayoutEffect to run synchronously before browser paint
  useLayoutEffect(() => {
    if (auth.authenticated && !initializing) {
      // Force scroll to top immediately
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      window.scrollTo(0, 0);
      topRef.current?.scrollIntoView({ block: 'start', behavior: 'instant' });
    }
  }, [auth.authenticated, initializing, showAdminView]);

  // Additional scroll lock during initial render
  useLayoutEffect(() => {
    if (auth.authenticated) {
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
  });

  const handleSearchResults = (results, isAI) => {
    setSearchResults(results);
    setIsAISearch(isAI);
  };

  const clearSearch = () => {
    setSearchResults(null);
    setIsAISearch(false);
  };

  const handleLogin = async (password) => {
    setLoginLoading(true);
    setLoginError(null);
    try {
      const data = await loginService(password);
      const authData = {
        access_token: data.access_token,
        label: data.label,
        role: data.role,
        expires_at: data.expires_at,
      };
      persistAuth(authData);
      setAuth({
        authenticated: true,
        label: data.label,
        role: data.role,
        expiresAt: data.expires_at,
        token: data.access_token,
      });
    } catch (error) {
      setLoginError('Invalid password. Please try again.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    await logoutService();
    setAuth({ authenticated: false, label: null, role: null, expiresAt: null, token: null });
    setShowAdminView(false);
    setSearchResults(null);
    setIsAISearch(false);
  };

  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 text-gray-600">
        Loading workspace...
      </div>
    );
  }

  if (!auth.authenticated) {
    return <LoginView onLogin={handleLogin} loading={loginLoading} error={loginError} />;
  }

  if (showAdminView && auth.role === 'admin') {
    return <AdminPanel onBack={() => setShowAdminView(false)} onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div ref={topRef} />
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Fox Run Task Planner</h1>
            <p className="text-gray-600 mt-1">Manage your tasks, calendar, reminders, and knowledge base</p>
          </div>
          <div className="flex flex-col items-start gap-2 md:items-end">
            <div className="text-sm text-gray-600">
              Signed in as <span className="font-semibold text-gray-800">{auth.label}</span>
              {auth.role && (
                <span className="ml-2 text-xs uppercase tracking-wide px-2 py-1 bg-gray-200 rounded">
                  {auth.role}
                </span>
              )}
            </div>
            <div className="flex gap-2">
              {auth.role === 'admin' && (
                <button
                  onClick={() => setShowAdminView(true)}
                  className="bg-purple-500 text-white px-3 py-2 rounded-md hover:bg-purple-600"
                  type="button"
                >
                  Admin Dashboard
                </button>
              )}
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-3 py-2 rounded-md hover:bg-red-600"
                type="button"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <SearchBar onResults={handleSearchResults} />

        {searchResults && (
          <div className="mb-6">
            <button
              onClick={clearSearch}
              className="mb-4 text-blue-500 hover:text-blue-700 underline"
              type="button"
            >
              Clear Search Results
            </button>
            <SearchResults results={searchResults} isAI={isAISearch} />
          </div>
        )}

        <Dashboard />

        <div className="mb-6">
          <TaskPlanner />
        </div>

        <TileLayout>
          <Calendar />
          <Reminders />
          <KnowledgeBase />
          <Documents />
          <ChatInterface />
          <FeedbackForm />
        </TileLayout>
      </main>

      <footer className="bg-white shadow-md mt-8">
        <div className="max-w-7xl mx-auto px-4 py-4 text-center text-gray-600">
          <p>Powered by Claude AI | Built with React, FastAPI, and PostgreSQL</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
