import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { ChatPage } from './pages/ChatPage';
import { AboutPage } from './pages/AboutPage';
import { FeaturesPage } from './pages/FeaturesPage';
import { KnowledgeSourcesPage } from './pages/KnowledgeSourcesPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { ContactPage } from './pages/ContactPage';
import { AdminUser } from './types';
import { api } from './services/api';

export const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [chatInitialQuery, setChatInitialQuery] = useState<string>('');
  
  // Auth state
  const [adminToken, setAdminToken] = useState<string | null>(() => {
    return localStorage.getItem('nyay_admin_token');
  });
  const [adminUser, setAdminUser] = useState<AdminUser | null>(() => {
    const saved = localStorage.getItem('nyay_admin_user');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (adminToken && !adminUser) {
      api.getAdminProfile(adminToken)
        .then(u => {
          setAdminUser(u);
          localStorage.setItem('nyay_admin_user', JSON.stringify(u));
        })
        .catch(() => {
          handleAdminLogout();
        });
    }
  }, [adminToken]);

  const handleStartChatWithQuery = (query: string) => {
    setChatInitialQuery(query);
    setCurrentPage('chat');
  };

  const handleAdminLoginSuccess = (token: string, user: AdminUser) => {
    setAdminToken(token);
    setAdminUser(user);
    localStorage.setItem('nyay_admin_token', token);
    localStorage.setItem('nyay_admin_user', JSON.stringify(user));
    setCurrentPage('admin_dashboard');
  };

  const handleAdminLogout = () => {
    setAdminToken(null);
    setAdminUser(null);
    localStorage.removeItem('nyay_admin_token');
    localStorage.removeItem('nyay_admin_user');
    setCurrentPage('home');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors">
      <Header
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        adminLoggedIn={!!adminToken}
      />

      <main className="flex-1">
        {currentPage === 'home' && (
          <HomePage
            onStartChatWithQuery={handleStartChatWithQuery}
            setCurrentPage={setCurrentPage}
          />
        )}

        {currentPage === 'chat' && (
          <ChatPage
            initialQuery={chatInitialQuery}
            onClearInitialQuery={() => setChatInitialQuery('')}
          />
        )}

        {currentPage === 'about' && (
          <AboutPage setCurrentPage={setCurrentPage} />
        )}

        {currentPage === 'features' && (
          <FeaturesPage setCurrentPage={setCurrentPage} />
        )}

        {currentPage === 'sources' && (
          <KnowledgeSourcesPage onStartChatWithQuery={handleStartChatWithQuery} />
        )}

        {currentPage === 'privacy' && (
          <PrivacyPage setCurrentPage={setCurrentPage} />
        )}

        {currentPage === 'contact' && (
          <ContactPage setCurrentPage={setCurrentPage} />
        )}

        {currentPage === 'admin_login' && (
          <AdminLoginPage
            onLoginSuccess={handleAdminLoginSuccess}
            setCurrentPage={setCurrentPage}
          />
        )}

        {currentPage === 'admin_dashboard' && adminToken && (
          <AdminDashboardPage
            token={adminToken}
            adminUser={adminUser}
            onLogout={handleAdminLogout}
            setCurrentPage={setCurrentPage}
          />
        )}
      </main>

      {/* Show footer on all pages except chat view to maximize chat space */}
      {currentPage !== 'chat' && (
        <Footer setCurrentPage={setCurrentPage} />
      )}
    </div>
  );
};

export default App;
