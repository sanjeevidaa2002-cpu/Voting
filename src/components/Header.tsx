import React, { useState } from 'react';
import { useShow, AppView } from '../context/ShowContext';
import { useAuth } from '../context/AuthContext';
import {
  Crown,
  Trophy,
  Users,
  BarChart3,
  BookOpen,
  Radio,
  Menu,
  X,
  LogIn,
  UserPlus,
  ShieldAlert,
  User,
  LogOut,
  Sparkles
} from 'lucide-react';

export const Header: React.FC = () => {
  const { currentView, setCurrentView, siteSettings, totalVotes } = useShow();
  const { isUserLoggedIn, currentUser, setUserProfileModalOpen, userLogout, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const siteName = siteSettings?.branding?.websiteName || siteSettings?.siteName || 'STAR HOUSE';
  const logoText = siteSettings?.branding?.logoText || siteSettings?.logoText || 'STAR HOUSE';
  const logoUrl = siteSettings?.branding?.mainLogoUrl || siteSettings?.logoUrl;
  const isVotingActive = siteSettings ? true : true;

  // Custom navigation items or defaults
  const customNav = siteSettings?.navigationItems && siteSettings.navigationItems.length > 0
    ? siteSettings.navigationItems.filter(n => n.isEnabled).sort((a, b) => a.order - b.order)
    : null;

  const defaultNavItems: Array<{ id: AppView; label: string; icon: any }> = [
    { id: 'home', label: 'Home', icon: Radio },
    { id: 'contestants', label: 'Contestants', icon: Users },
    { id: 'ranking', label: 'Live Ranking', icon: Trophy },
    { id: 'results', label: 'Results', icon: BarChart3 },
    { id: 'about', label: 'Rules & Info', icon: BookOpen },
  ];

  const handleNavClick = (view: AppView) => {
    setCurrentView(view);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#090b10]/90 border-b border-white/10 transition-all">
      {/* Top Ticker Bar */}
      <div className="bg-gradient-to-r from-amber-600/20 via-amber-500/25 to-amber-600/20 border-b border-amber-500/20 px-4 py-1.5 text-xs text-amber-300">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-[11px] font-medium">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <span className="font-bold uppercase tracking-wider text-amber-200">
              {siteSettings?.seasonTitle || 'SEASON 9 — LIVE VOTING ARENA'}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden sm:inline-block text-zinc-400">
              Total Certified Votes:{' '}
              <strong className="text-amber-400 font-mono">
                {totalVotes.toLocaleString()}
              </strong>
            </span>

            {/* Authenticated Admin quick access (hidden from public homepage) */}
            {isAdmin && (
              <button
                onClick={() => setCurrentView('admin')}
                className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1.5 transition px-2.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30"
                title="Admin Control Room"
              >
                <ShieldAlert className="w-3 h-3 text-amber-400" />
                <span>Admin Panel</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Branding */}
          <button
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 text-left focus:outline-none group"
          >
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={siteName}
                className="h-10 w-auto object-contain rounded-lg"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center text-black shadow-lg shadow-amber-500/20 group-hover:scale-105 transition">
                <Crown className="w-6 h-6" />
              </div>
            )}
            <div>
              <div className="font-serif font-black text-xl sm:text-2xl tracking-wider text-white leading-none group-hover:text-amber-400 transition">
                {logoText}
              </div>
              <div className="text-[10px] font-bold tracking-widest text-amber-400/90 uppercase mt-0.5">
                {siteSettings?.branding?.tagline || siteSettings?.tagline || 'Official Voting Platform'}
              </div>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 bg-white/[0.03] p-1.5 rounded-full border border-white/10">
            {customNav
              ? customNav.map((item) => {
                  const viewKey = item.url.replace('#/', '').replace('#', '') as AppView;
                  const isActive = currentView === viewKey;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(viewKey)}
                      className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20 font-black'
                          : 'text-zinc-300 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })
              : defaultNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentView === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20 font-black'
                          : 'text-zinc-300 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
          </nav>

          {/* Desktop Authentication Controls: [LOGIN] [SIGN UP] or User Profile */}
          <div className="hidden md:flex items-center gap-3">
            {/* Authenticated Admin Quick Link */}
            {isAdmin && (
              <button
                onClick={() => handleNavClick('admin')}
                className="px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-amber-500/15 border border-amber-500/40 text-amber-400 hover:bg-amber-500/25 transition flex items-center gap-1.5 shadow-sm"
                title="Open Admin Control Room"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Admin Panel</span>
              </button>
            )}

            {isUserLoggedIn && currentUser ? (
              <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-1.5 pl-3 rounded-full">
                <button
                  onClick={() => setUserProfileModalOpen(true)}
                  className="flex items-center gap-2 text-left hover:opacity-90 transition"
                  title="View Voter Profile"
                >
                  <img
                    src={currentUser.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.email}`}
                    alt={currentUser.fullName}
                    className="w-7 h-7 rounded-full border border-amber-500/50 object-cover"
                  />
                  <div className="text-left pr-2">
                    <div className="text-xs font-bold text-white leading-tight">
                      {currentUser.fullName.split(' ')[0]}
                    </div>
                    <div className="text-[10px] text-amber-400 font-semibold">
                      {currentUser.votedContestantId ? '✓ Voted' : 'Ready to Vote'}
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => userLogout()}
                  title="Sign Out"
                  className="p-1.5 rounded-full hover:bg-white/10 text-zinc-400 hover:text-rose-400 transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                {/* [LOGIN] Button */}
                <button
                  id="header-login-btn"
                  onClick={() => handleNavClick('login')}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all flex items-center gap-2 ${
                    currentView === 'login'
                      ? 'bg-white/15 border-amber-400 text-white'
                      : 'bg-white/5 border-white/15 text-zinc-200 hover:bg-white/10 hover:border-white/30 hover:text-white'
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5 text-amber-400" />
                  <span>Login</span>
                </button>

                {/* [SIGN UP] Button */}
                <button
                  id="header-signup-btn"
                  onClick={() => handleNavClick('signup')}
                  className="px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-gradient-to-r from-amber-500 to-amber-600 text-black hover:from-amber-400 hover:to-amber-500 transition-all shadow-md shadow-amber-500/20 active:scale-95 flex items-center gap-2"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Sign Up</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Trigger */}
          <div className="flex items-center gap-2 md:hidden">
            {isUserLoggedIn && (
              <button
                onClick={() => setUserProfileModalOpen(true)}
                className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400"
              >
                <User className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-300 hover:text-white focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Responsive Mobile / Tablet Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#090b10]/98 backdrop-blur-2xl px-4 pt-4 pb-6 space-y-4 animate-fade-in shadow-2xl">
          {/* Navigation items list */}
          <div className="grid grid-cols-1 gap-1">
            {customNav
              ? customNav.map((item) => {
                  const viewKey = item.url.replace('#/', '').replace('#', '') as AppView;
                  const isActive = currentView === viewKey;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(viewKey)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition ${
                        isActive
                          ? 'bg-amber-500 text-black font-black'
                          : 'text-zinc-300 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <span>{item.label}</span>
                    </button>
                  );
                })
              : defaultNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentView === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition ${
                        isActive
                          ? 'bg-amber-500 text-black font-black'
                          : 'text-zinc-300 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
          </div>

          {/* Mobile Authentication Section */}
          <div className="pt-4 border-t border-white/10 space-y-2.5">
            {isAdmin && (
              <button
                onClick={() => handleNavClick('admin')}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider bg-amber-500/15 border border-amber-500/40 text-amber-400 hover:bg-amber-500/25 flex items-center justify-center gap-2"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Admin Panel</span>
              </button>
            )}

            {isUserLoggedIn && currentUser ? (
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <div className="flex items-center gap-3">
                  <img
                    src={currentUser.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.email}`}
                    alt={currentUser.fullName}
                    className="w-10 h-10 rounded-xl border border-amber-500/40"
                  />
                  <div>
                    <div className="text-sm font-bold text-white">{currentUser.fullName}</div>
                    <div className="text-xs text-amber-400">
                      {currentUser.votedContestantId ? '✓ Official Vote Cast' : 'Verified Viewer'}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => {
                      setUserProfileModalOpen(true);
                      setMobileMenuOpen(false);
                    }}
                    className="py-2.5 px-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold text-center"
                  >
                    View Receipt
                  </button>
                  <button
                    onClick={() => {
                      userLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="py-2.5 px-3 rounded-xl bg-white/5 border border-white/10 text-rose-400 text-xs font-bold text-center"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2.5">
                {/* Mobile [LOGIN] */}
                <button
                  id="mobile-header-login-btn"
                  onClick={() => handleNavClick('login')}
                  className="w-full py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider bg-white/5 border border-white/15 text-zinc-200 hover:bg-white/10 flex items-center justify-center gap-2"
                >
                  <LogIn className="w-4 h-4 text-amber-400" />
                  <span>Login</span>
                </button>

                {/* Mobile [SIGN UP] */}
                <button
                  id="mobile-header-signup-btn"
                  onClick={() => handleNavClick('signup')}
                  className="w-full py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider bg-gradient-to-r from-amber-500 to-amber-600 text-black hover:from-amber-400 hover:to-amber-500 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Sign Up</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
