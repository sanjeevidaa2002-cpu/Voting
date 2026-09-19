/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ShowProvider, useShow } from './context/ShowContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { AdSlotContainer } from './components/AdSlotContainer';
import { VoteModal } from './components/VoteModal';
import { ContestantDetailsModal } from './components/ContestantDetailsModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { UserProfileModal } from './components/UserProfileModal';

import { HomePage } from './pages/HomePage';
import { ContestantsPage } from './pages/ContestantsPage';
import { LiveRankingSection } from './components/LiveRankingSection';
import { ResultsPage } from './pages/ResultsPage';
import { AboutPage } from './pages/AboutPage';
import { LoginPage } from './pages/LoginPage';
import { SignUpPage } from './pages/SignUpPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminDashboard } from './pages/AdminDashboard';

const MainContent: React.FC = () => {
  const { currentView } = useShow();
  const { isAdmin, isAdminLoading } = useAuth();

  return (
    <main className="flex-1">
      {currentView === 'home' && <HomePage />}
      {currentView === 'contestants' && <ContestantsPage />}
      {currentView === 'ranking' && (
        <div className="pt-8">
          <LiveRankingSection />
        </div>
      )}
      {currentView === 'results' && <ResultsPage />}
      {currentView === 'about' && <AboutPage />}
      {currentView === 'login' && <LoginPage />}
      {currentView === 'signup' && <SignUpPage />}
      {currentView === 'admin-login' && <AdminLoginPage />}
      {currentView === 'admin' && (
        isAdminLoading ? (
          <div className="min-h-[70vh] flex items-center justify-center bg-[#08090d]">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mx-auto" />
              <div className="text-xs font-mono text-zinc-400 uppercase tracking-widest">
                Verifying Security Credentials...
              </div>
            </div>
          </div>
        ) : isAdmin ? (
          <AdminDashboard />
        ) : (
          <AdminLoginPage />
        )
      )}
    </main>
  );
};

const AppLayout: React.FC = () => {
  const { currentView, siteSettings } = useShow();
  const isAdminDashboard = currentView === 'admin';

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0b0f] text-zinc-100 selection:bg-amber-500 selection:text-black">
      {/* Public Header (hidden only inside the full-screen master admin dashboard) */}
      {!isAdminDashboard && <Header />}

      {/* Header Ad Slot (below header navigation) */}
      {!isAdminDashboard && (
        <AdSlotContainer
          location="header"
          slotName="header"
        />
      )}

      {/* Dynamic Content Router */}
      <MainContent />

      {/* Interactive Global Modals */}
      <VoteModal />
      <ContestantDetailsModal />
      <AdminLoginModal />
      <UserProfileModal />

      {/* Footer Ad Slot (above website footer) */}
      {!isAdminDashboard && (
        <AdSlotContainer
          location="footer"
          slotName="footer"
        />
      )}

      {/* Public Footer */}
      {!isAdminDashboard && <Footer />}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <ShowProvider>
        <AppLayout />
      </ShowProvider>
    </AuthProvider>
  );
}
