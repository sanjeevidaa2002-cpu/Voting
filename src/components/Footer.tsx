import React from 'react';
import { useShow } from '../context/ShowContext';
import { useAuth } from '../context/AuthContext';
import { Crown, Mail, Phone, MapPin, Shield, Lock, Settings } from 'lucide-react';

export const Footer: React.FC = () => {
  const { siteSettings, setCurrentView } = useShow();
  const { isAdmin } = useAuth();

  const siteName = siteSettings?.siteName || 'STAR HOUSE';
  const footerContent = siteSettings?.footerContent || {
    copyright: '© 2026 StarHouse Entertainment Network. All rights reserved.',
    contactEmail: 'support@starvoter.tv',
    contactPhone: '+1 (800) 555-STAR',
    address: 'StarHouse Media Studios, Stage 4B, Film City',
    socialLinks: {
      twitter: 'https://twitter.com',
      instagram: 'https://instagram.com',
      youtube: 'https://youtube.com',
      facebook: 'https://facebook.com',
    },
  };

  const handleAdminAccess = () => {
    if (isAdmin) {
      setCurrentView('admin');
    } else {
      setCurrentView('admin-login');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="w-full border-t border-white/10 bg-[#07080a] text-zinc-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Col 1-2: Brand & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-black shadow-md shadow-amber-500/20">
                <Crown className="h-5 w-5" />
              </div>
              <span className="font-serif text-2xl font-black tracking-wider text-white">
                {siteName}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-sm">
              The official audience reality show voting platform. Free, direct, and instant voting with real-time tally updates.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href={footerContent.socialLinks.instagram}
                target="_blank"
                rel="noreferrer"
                className="h-9 w-9 rounded-full bg-white/5 flex items-center justify-center text-zinc-300 hover:text-amber-400 hover:bg-white/10 transition"
              >
                IG
              </a>
              <a
                href={footerContent.socialLinks.twitter}
                target="_blank"
                rel="noreferrer"
                className="h-9 w-9 rounded-full bg-white/5 flex items-center justify-center text-zinc-300 hover:text-amber-400 hover:bg-white/10 transition"
              >
                X
              </a>
              <a
                href={footerContent.socialLinks.youtube}
                target="_blank"
                rel="noreferrer"
                className="h-9 w-9 rounded-full bg-white/5 flex items-center justify-center text-zinc-300 hover:text-amber-400 hover:bg-white/10 transition"
              >
                YT
              </a>
            </div>
          </div>

          {/* Col 3: Navigation Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold tracking-wider text-white uppercase">
              Show Sections
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => {
                    setCurrentView('home');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-amber-400 transition"
                >
                  Live Voting Arena
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setCurrentView('home');
                    document.getElementById('contestants-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="hover:text-amber-400 transition"
                >
                  Contestants
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setCurrentView('home');
                    document.getElementById('ranking-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="hover:text-amber-400 transition"
                >
                  Live Leaderboard
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setCurrentView('home');
                    document.getElementById('rules-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="hover:text-amber-400 transition"
                >
                  Voting Rules & Guide
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Official Rules & Policies */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold tracking-wider text-white uppercase">
              Security & FAQ
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => {
                    setCurrentView('home');
                    document.getElementById('rules-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="hover:text-amber-400 transition"
                >
                  Voting Guidelines
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setCurrentView('home');
                    document.getElementById('faq-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="hover:text-amber-400 transition"
                >
                  Anti-Fraud System & FAQ
                </button>
              </li>
            </ul>
          </div>

          {/* Col 5: Production Studio */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold tracking-wider text-white uppercase">
              Production Office
            </h4>
            <div className="space-y-2 text-xs">
              <p className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-amber-400" />
                <span>{footerContent.contactEmail}</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-amber-400" />
                <span>{footerContent.contactPhone}</span>
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-amber-400" />
                <span>{footerContent.address}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Disclaimer, Copyright, & Discreet Admin Access Mark */}
        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p>{footerContent.copyright}</p>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>Direct Public Voting Active</span>
            </div>

            {/* Discreet Admin Access Link (only displayed when logged in as admin) */}
            {isAdmin && (
              <button
                id="footer-admin-trigger"
                onClick={handleAdminAccess}
                title="Admin Panel"
                aria-label="Admin Panel"
                className="flex items-center gap-1.5 text-amber-400 hover:text-amber-300 transition-colors py-1 px-2 rounded-md hover:bg-amber-500/10 border border-amber-500/20"
              >
                <Shield className="h-3 w-3 text-amber-400" />
                <span>Admin Panel</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};
