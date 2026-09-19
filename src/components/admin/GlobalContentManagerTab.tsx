import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { GlobalContentSettings, SiteSettings } from '../../types';
import {
  FileText,
  Save,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Layout,
  Vote,
  Trophy,
  Info,
  Shield,
  Search,
  MessageSquare,
  Globe
} from 'lucide-react';

interface GlobalContentManagerTabProps {
  siteSettings: SiteSettings | null;
  onUpdate: () => void;
}

export const GlobalContentManagerTab: React.FC<GlobalContentManagerTabProps> = ({
  siteSettings,
  onUpdate
}) => {
  const [activeSection, setActiveSection] = useState<
    'branding' | 'header' | 'homepage' | 'voting' | 'results' | 'about' | 'footer' | 'messages' | 'seo'
  >('homepage');

  const [content, setContent] = useState<GlobalContentSettings>({
    branding: {
      siteName: siteSettings?.globalContent?.branding?.siteName || siteSettings?.siteName || 'STAR HOUSE',
      showName: siteSettings?.globalContent?.branding?.showName || siteSettings?.seasonTitle || 'Season 9: Crown of Titans',
      tagline: siteSettings?.globalContent?.branding?.tagline || siteSettings?.tagline || 'The Ultimate Reality TV Show',
      browserTitle: siteSettings?.globalContent?.branding?.browserTitle || siteSettings?.branding?.browserTitle || 'StarVoter - Reality Show Voting Platform',
      logoText: siteSettings?.globalContent?.branding?.logoText || siteSettings?.logoText || 'STAR HOUSE',
    },
    header: {
      tickerAnnouncement: siteSettings?.globalContent?.header?.tickerAnnouncement || 'SEASON 9 — LIVE VOTING ARENA',
      liveCounterLabel: siteSettings?.globalContent?.header?.liveCounterLabel || 'Total Certified Votes:',
      showLiveCounter: siteSettings?.globalContent?.header?.showLiveCounter ?? true,
      loginButtonText: siteSettings?.globalContent?.header?.loginButtonText || 'Login',
      signupButtonText: siteSettings?.globalContent?.header?.signupButtonText || 'Sign Up',
    },
    homepage: {
      heroBadge: siteSettings?.globalContent?.homepage?.heroBadge || 'OFFICIAL LIVE PUBLIC VOTING',
      heroTitle: siteSettings?.globalContent?.homepage?.heroTitle || 'VOTE FOR YOUR FAVORITE',
      heroSubtitle: siteSettings?.globalContent?.homepage?.heroSubtitle || 'Grand Finale Elimination Week — Every Vote Counts!',
      heroPrimaryCta: siteSettings?.globalContent?.homepage?.heroPrimaryCta || 'VOTE NOW',
      heroSecondaryCta: siteSettings?.globalContent?.homepage?.heroSecondaryCta || 'Live Leaderboard',
      contestantsBadge: siteSettings?.globalContent?.homepage?.contestantsBadge || 'NOMINATED CONTESTANTS',
      contestantsTitle: siteSettings?.globalContent?.homepage?.contestantsTitle || 'Choose Who Stays In The House',
      contestantsSubtitle: siteSettings?.globalContent?.homepage?.contestantsSubtitle || 'Click Vote on your chosen housemate. One vote per viewer.',
      rankingBadge: siteSettings?.globalContent?.homepage?.rankingBadge || 'LIVE VOTE LEADERBOARD',
      rankingTitle: siteSettings?.globalContent?.homepage?.rankingTitle || 'Real-Time Percentage Standings',
      rankingSubtitle: siteSettings?.globalContent?.homepage?.rankingSubtitle || 'Watch the momentum swing live as millions of viewers vote across the world.',
    },
    voting: {
      sectionTitle: siteSettings?.globalContent?.voting?.sectionTitle || 'Cast Your Official Vote',
      sectionDescription: siteSettings?.globalContent?.voting?.sectionDescription || 'Select your preferred contestant and verify your vote instantly.',
      voteButtonText: siteSettings?.globalContent?.voting?.voteButtonText || 'VOTE NOW',
      alreadyVotedMessage: siteSettings?.globalContent?.voting?.alreadyVotedMessage || 'You have already cast your official vote for this round.',
      voteSuccessMessage: siteSettings?.globalContent?.voting?.voteSuccessMessage || 'Your official vote has been certified and recorded!',
      voteErrorMessage: siteSettings?.globalContent?.voting?.voteErrorMessage || 'Unable to submit vote. Please try again.',
      votingClosedMessage: siteSettings?.globalContent?.voting?.votingClosedMessage || 'Official voting is currently CLOSED. Results will be announced live on the broadcast.',
    },
    results: {
      sectionTitle: siteSettings?.globalContent?.results?.sectionTitle || 'Official Live Results & Leaderboard',
      sectionSubtitle: siteSettings?.globalContent?.results?.sectionSubtitle || 'Certified percentage standing of all active and nominated housemates.',
      leaderboardLabel: siteSettings?.globalContent?.results?.leaderboardLabel || 'Current Standings',
    },
    about: {
      sectionTitle: siteSettings?.globalContent?.about?.sectionTitle || 'About The Show & Voting Rules',
      sectionSubtitle: siteSettings?.globalContent?.about?.sectionSubtitle || 'Everything you need to know about Star House broadcast and rules.',
      showOverviewTitle: siteSettings?.globalContent?.about?.showOverviewTitle || 'The 24/7 Reality Arena That Captivated The Nation',
      rulesTitle: siteSettings?.globalContent?.about?.rulesTitle || 'Fair Play, Velocity Security & Verification Standards',
      stepsTitle: siteSettings?.globalContent?.about?.stepsTitle || 'Simple 3-Step Guide to Saving Your Favorite Contestant',
    },
    footer: {
      brandDescription: siteSettings?.globalContent?.footer?.brandDescription || 'Star House is the official voting and interactive fan platform for the Star House reality television broadcast.',
      copyrightText: siteSettings?.globalContent?.footer?.copyrightText || '© 2026 StarHouse Entertainment Network. All rights reserved.',
      contactEmail: siteSettings?.globalContent?.footer?.contactEmail || 'support@starvoter.tv',
      contactPhone: siteSettings?.globalContent?.footer?.contactPhone || '+1 (800) 555-STAR',
      studioAddress: siteSettings?.globalContent?.footer?.studioAddress || 'StarHouse Media Studios, Stage 4B, Film City',
    },
    messages: {
      systemMaintenanceNotice: siteSettings?.globalContent?.messages?.systemMaintenanceNotice || 'System running normally with 99.99% voting uptime.',
      winnerAnnouncement: siteSettings?.globalContent?.messages?.winnerAnnouncement || 'Grand Finale Voting in Progress!',
      alertBannerActive: siteSettings?.globalContent?.messages?.alertBannerActive ?? false,
    },
    seo: {
      metaTitle: siteSettings?.globalContent?.seo?.metaTitle || 'Star House Reality Show - Official Voting Platform',
      metaDescription: siteSettings?.globalContent?.seo?.metaDescription || 'Vote for your favorite contestants in the Star House reality television arena. 100% free, real-time certified voting.',
      metaKeywords: siteSettings?.globalContent?.seo?.metaKeywords || 'reality tv voting, star house, vote contestants, live ranking, reality show',
      ogTitle: siteSettings?.globalContent?.seo?.ogTitle || 'Star House Reality TV - Live Public Voting',
      ogDescription: siteSettings?.globalContent?.seo?.ogDescription || 'Cast your official vote to save your favorite contestants in the Star House arena.',
      ogImageUrl: siteSettings?.globalContent?.seo?.ogImageUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&auto=format&fit=crop&q=85',
    }
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (siteSettings?.globalContent) {
      setContent(prev => ({
        ...prev,
        ...siteSettings.globalContent
      }));
    }
  }, [siteSettings]);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await api.updateGlobalContent(content);
      setSaveSuccess(true);
      onUpdate();
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to save global content settings');
    } finally {
      setIsSaving(false);
    }
  };

  const sectionsList = [
    { id: 'homepage', label: 'Homepage & Hero', icon: Layout },
    { id: 'header', label: 'Header & Topbar', icon: Globe },
    { id: 'voting', label: 'Voting Module', icon: Vote },
    { id: 'results', label: 'Results & Ranking', icon: Trophy },
    { id: 'about', label: 'About & Rules', icon: Info },
    { id: 'footer', label: 'Footer & Contact', icon: Shield },
    { id: 'branding', label: 'Site Identity', icon: Sparkles },
    { id: 'messages', label: 'Alerts & Messages', icon: MessageSquare },
    { id: 'seo', label: 'SEO & Metadata', icon: Search },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-[#12141c] border border-white/10 rounded-2xl shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white uppercase tracking-wider font-serif">
              Global CMS Content Manager
            </h2>
            <p className="text-xs text-zinc-400">
              Customize every headline, button label, message, and rule without touching code
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {saveSuccess && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold animate-pulse">
              <CheckCircle2 className="w-4 h-4" />
              <span>Changes Saved & Live!</span>
            </div>
          )}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-95 transition disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Publishing...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save All Content</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Navigation Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {sectionsList.map(sec => {
          const Icon = sec.icon;
          const isCurrent = activeSection === sec.id;
          return (
            <button
              key={sec.id}
              onClick={() => setActiveSection(sec.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                isCurrent
                  ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                  : 'bg-[#12141c] text-zinc-400 hover:text-white border border-white/5 hover:border-white/10'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{sec.label}</span>
            </button>
          );
        })}
      </div>

      {/* Editor Content Box */}
      <div className="bg-[#12141c] border border-white/10 rounded-2xl p-6 shadow-xl space-y-6">
        {/* HOMEPAGE */}
        {activeSection === 'homepage' && (
          <div className="space-y-6">
            <h3 className="text-sm font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <Layout className="w-4 h-4" />
              <span>Hero & Homepage Headlines</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1.5">Hero Top Badge</label>
                <input
                  type="text"
                  value={content.homepage.heroBadge}
                  onChange={e => setContent({ ...content, homepage: { ...content.homepage, heroBadge: e.target.value } })}
                  className="w-full px-4 py-2.5 bg-[#0a0b0f] border border-white/10 rounded-xl text-sm text-white focus:border-amber-500 focus:outline-none"
                  placeholder="e.g. OFFICIAL LIVE PUBLIC VOTING"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1.5">Hero Main Title (H1)</label>
                <input
                  type="text"
                  value={content.homepage.heroTitle}
                  onChange={e => setContent({ ...content, homepage: { ...content.homepage, heroTitle: e.target.value } })}
                  className="w-full px-4 py-2.5 bg-[#0a0b0f] border border-white/10 rounded-xl text-sm text-white focus:border-amber-500 focus:outline-none"
                  placeholder="e.g. VOTE FOR YOUR FAVORITE"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-zinc-400 mb-1.5">Hero Subtitle</label>
                <textarea
                  rows={2}
                  value={content.homepage.heroSubtitle}
                  onChange={e => setContent({ ...content, homepage: { ...content.homepage, heroSubtitle: e.target.value } })}
                  className="w-full px-4 py-2.5 bg-[#0a0b0f] border border-white/10 rounded-xl text-sm text-white focus:border-amber-500 focus:outline-none resize-none"
                  placeholder="e.g. Grand Finale Elimination Week — Every Single Vote Matters!"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1.5">Primary CTA Button</label>
                <input
                  type="text"
                  value={content.homepage.heroPrimaryCta}
                  onChange={e => setContent({ ...content, homepage: { ...content.homepage, heroPrimaryCta: e.target.value } })}
                  className="w-full px-4 py-2.5 bg-[#0a0b0f] border border-white/10 rounded-xl text-sm text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1.5">Secondary CTA Button</label>
                <input
                  type="text"
                  value={content.homepage.heroSecondaryCta}
                  onChange={e => setContent({ ...content, homepage: { ...content.homepage, heroSecondaryCta: e.target.value } })}
                  className="w-full px-4 py-2.5 bg-[#0a0b0f] border border-white/10 rounded-xl text-sm text-white focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1.5">Contestants Section Title</label>
                <input
                  type="text"
                  value={content.homepage.contestantsTitle}
                  onChange={e => setContent({ ...content, homepage: { ...content.homepage, contestantsTitle: e.target.value } })}
                  className="w-full px-4 py-2.5 bg-[#0a0b0f] border border-white/10 rounded-xl text-sm text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1.5">Contestants Section Subtitle</label>
                <input
                  type="text"
                  value={content.homepage.contestantsSubtitle}
                  onChange={e => setContent({ ...content, homepage: { ...content.homepage, contestantsSubtitle: e.target.value } })}
                  className="w-full px-4 py-2.5 bg-[#0a0b0f] border border-white/10 rounded-xl text-sm text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1.5">Leaderboard Section Title</label>
                <input
                  type="text"
                  value={content.homepage.rankingTitle}
                  onChange={e => setContent({ ...content, homepage: { ...content.homepage, rankingTitle: e.target.value } })}
                  className="w-full px-4 py-2.5 bg-[#0a0b0f] border border-white/10 rounded-xl text-sm text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1.5">Leaderboard Section Subtitle</label>
                <input
                  type="text"
                  value={content.homepage.rankingSubtitle}
                  onChange={e => setContent({ ...content, homepage: { ...content.homepage, rankingSubtitle: e.target.value } })}
                  className="w-full px-4 py-2.5 bg-[#0a0b0f] border border-white/10 rounded-xl text-sm text-white focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* HEADER */}
        {activeSection === 'header' && (
          <div className="space-y-4">
            <h3 className="text-sm font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <Globe className="w-4 h-4" />
              <span>Public Header & Top Navigation Bar</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1.5">Top Ticker / Announcement</label>
                <input
                  type="text"
                  value={content.header.tickerAnnouncement}
                  onChange={e => setContent({ ...content, header: { ...content.header, tickerAnnouncement: e.target.value } })}
                  className="w-full px-4 py-2.5 bg-[#0a0b0f] border border-white/10 rounded-xl text-sm text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1.5">Live Certified Vote Counter Label</label>
                <input
                  type="text"
                  value={content.header.liveCounterLabel}
                  onChange={e => setContent({ ...content, header: { ...content.header, liveCounterLabel: e.target.value } })}
                  className="w-full px-4 py-2.5 bg-[#0a0b0f] border border-white/10 rounded-xl text-sm text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1.5">Login Button Text</label>
                <input
                  type="text"
                  value={content.header.loginButtonText}
                  onChange={e => setContent({ ...content, header: { ...content.header, loginButtonText: e.target.value } })}
                  className="w-full px-4 py-2.5 bg-[#0a0b0f] border border-white/10 rounded-xl text-sm text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1.5">Sign Up Button Text</label>
                <input
                  type="text"
                  value={content.header.signupButtonText}
                  onChange={e => setContent({ ...content, header: { ...content.header, signupButtonText: e.target.value } })}
                  className="w-full px-4 py-2.5 bg-[#0a0b0f] border border-white/10 rounded-xl text-sm text-white focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* VOTING */}
        {activeSection === 'voting' && (
          <div className="space-y-4">
            <h3 className="text-sm font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <Vote className="w-4 h-4" />
              <span>Voting Engine Copy & Alerts</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1.5">Vote Button Label</label>
                <input
                  type="text"
                  value={content.voting.voteButtonText}
                  onChange={e => setContent({ ...content, voting: { ...content.voting, voteButtonText: e.target.value } })}
                  className="w-full px-4 py-2.5 bg-[#0a0b0f] border border-white/10 rounded-xl text-sm text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1.5">Vote Success Confirmation Message</label>
                <input
                  type="text"
                  value={content.voting.voteSuccessMessage}
                  onChange={e => setContent({ ...content, voting: { ...content.voting, voteSuccessMessage: e.target.value } })}
                  className="w-full px-4 py-2.5 bg-[#0a0b0f] border border-white/10 rounded-xl text-sm text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-zinc-400 mb-1.5">Already Voted Lockout Message</label>
                <input
                  type="text"
                  value={content.voting.alreadyVotedMessage}
                  onChange={e => setContent({ ...content, voting: { ...content.voting, alreadyVotedMessage: e.target.value } })}
                  className="w-full px-4 py-2.5 bg-[#0a0b0f] border border-white/10 rounded-xl text-sm text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-zinc-400 mb-1.5">Voting Closed Notice</label>
                <textarea
                  rows={2}
                  value={content.voting.votingClosedMessage}
                  onChange={e => setContent({ ...content, voting: { ...content.voting, votingClosedMessage: e.target.value } })}
                  className="w-full px-4 py-2.5 bg-[#0a0b0f] border border-white/10 rounded-xl text-sm text-white focus:border-amber-500 focus:outline-none resize-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* RESULTS & RANKING */}
        {activeSection === 'results' && (
          <div className="space-y-4">
            <h3 className="text-sm font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              <span>Results & Leaderboard Headings</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1.5">Results Page Main Title</label>
                <input
                  type="text"
                  value={content.results.sectionTitle}
                  onChange={e => setContent({ ...content, results: { ...content.results, sectionTitle: e.target.value } })}
                  className="w-full px-4 py-2.5 bg-[#0a0b0f] border border-white/10 rounded-xl text-sm text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1.5">Results Subtitle</label>
                <input
                  type="text"
                  value={content.results.sectionSubtitle}
                  onChange={e => setContent({ ...content, results: { ...content.results, sectionSubtitle: e.target.value } })}
                  className="w-full px-4 py-2.5 bg-[#0a0b0f] border border-white/10 rounded-xl text-sm text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1.5">Leaderboard Badge Label</label>
                <input
                  type="text"
                  value={content.results.leaderboardLabel}
                  onChange={e => setContent({ ...content, results: { ...content.results, leaderboardLabel: e.target.value } })}
                  className="w-full px-4 py-2.5 bg-[#0a0b0f] border border-white/10 rounded-xl text-sm text-white focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* ABOUT & RULES */}
        {activeSection === 'about' && (
          <div className="space-y-4">
            <h3 className="text-sm font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <Info className="w-4 h-4" />
              <span>About & Rules Section Headlines</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1.5">Main Rules & Info Title</label>
                <input
                  type="text"
                  value={content.about.sectionTitle}
                  onChange={e => setContent({ ...content, about: { ...content.about, sectionTitle: e.target.value } })}
                  className="w-full px-4 py-2.5 bg-[#0a0b0f] border border-white/10 rounded-xl text-sm text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1.5">Rules Subtitle</label>
                <input
                  type="text"
                  value={content.about.sectionSubtitle}
                  onChange={e => setContent({ ...content, about: { ...content.about, sectionSubtitle: e.target.value } })}
                  className="w-full px-4 py-2.5 bg-[#0a0b0f] border border-white/10 rounded-xl text-sm text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1.5">Show Overview Block Title</label>
                <input
                  type="text"
                  value={content.about.showOverviewTitle}
                  onChange={e => setContent({ ...content, about: { ...content.about, showOverviewTitle: e.target.value } })}
                  className="w-full px-4 py-2.5 bg-[#0a0b0f] border border-white/10 rounded-xl text-sm text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1.5">Security & Fair Play Block Title</label>
                <input
                  type="text"
                  value={content.about.rulesTitle}
                  onChange={e => setContent({ ...content, about: { ...content.about, rulesTitle: e.target.value } })}
                  className="w-full px-4 py-2.5 bg-[#0a0b0f] border border-white/10 rounded-xl text-sm text-white focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* FOOTER */}
        {activeSection === 'footer' && (
          <div className="space-y-4">
            <h3 className="text-sm font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>Footer Content & Corporate Identity</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-zinc-400 mb-1.5">Brand Bio / Summary</label>
                <textarea
                  rows={2}
                  value={content.footer.brandDescription}
                  onChange={e => setContent({ ...content, footer: { ...content.footer, brandDescription: e.target.value } })}
                  className="w-full px-4 py-2.5 bg-[#0a0b0f] border border-white/10 rounded-xl text-sm text-white focus:border-amber-500 focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1.5">Copyright Statement</label>
                <input
                  type="text"
                  value={content.footer.copyrightText}
                  onChange={e => setContent({ ...content, footer: { ...content.footer, copyrightText: e.target.value } })}
                  className="w-full px-4 py-2.5 bg-[#0a0b0f] border border-white/10 rounded-xl text-sm text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1.5">Studio / Production Address</label>
                <input
                  type="text"
                  value={content.footer.studioAddress}
                  onChange={e => setContent({ ...content, footer: { ...content.footer, studioAddress: e.target.value } })}
                  className="w-full px-4 py-2.5 bg-[#0a0b0f] border border-white/10 rounded-xl text-sm text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1.5">Official Support Email</label>
                <input
                  type="email"
                  value={content.footer.contactEmail}
                  onChange={e => setContent({ ...content, footer: { ...content.footer, contactEmail: e.target.value } })}
                  className="w-full px-4 py-2.5 bg-[#0a0b0f] border border-white/10 rounded-xl text-sm text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1.5">Production Hotline Phone</label>
                <input
                  type="text"
                  value={content.footer.contactPhone}
                  onChange={e => setContent({ ...content, footer: { ...content.footer, contactPhone: e.target.value } })}
                  className="w-full px-4 py-2.5 bg-[#0a0b0f] border border-white/10 rounded-xl text-sm text-white focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* BRANDING */}
        {activeSection === 'branding' && (
          <div className="space-y-4">
            <h3 className="text-sm font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>Show Identity & Name Settings</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1.5">Website Name</label>
                <input
                  type="text"
                  value={content.branding.siteName}
                  onChange={e => setContent({ ...content, branding: { ...content.branding, siteName: e.target.value } })}
                  className="w-full px-4 py-2.5 bg-[#0a0b0f] border border-white/10 rounded-xl text-sm text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1.5">Show / Season Title</label>
                <input
                  type="text"
                  value={content.branding.showName}
                  onChange={e => setContent({ ...content, branding: { ...content.branding, showName: e.target.value } })}
                  className="w-full px-4 py-2.5 bg-[#0a0b0f] border border-white/10 rounded-xl text-sm text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1.5">Tagline / Slogan</label>
                <input
                  type="text"
                  value={content.branding.tagline}
                  onChange={e => setContent({ ...content, branding: { ...content.branding, tagline: e.target.value } })}
                  className="w-full px-4 py-2.5 bg-[#0a0b0f] border border-white/10 rounded-xl text-sm text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1.5">Browser Tab Title</label>
                <input
                  type="text"
                  value={content.branding.browserTitle}
                  onChange={e => setContent({ ...content, branding: { ...content.branding, browserTitle: e.target.value } })}
                  className="w-full px-4 py-2.5 bg-[#0a0b0f] border border-white/10 rounded-xl text-sm text-white focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* MESSAGES & ALERTS */}
        {activeSection === 'messages' && (
          <div className="space-y-4">
            <h3 className="text-sm font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              <span>Broadcast Messages & System Notices</span>
            </h3>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1.5">Winner / Highlight Announcement</label>
                <input
                  type="text"
                  value={content.messages.winnerAnnouncement}
                  onChange={e => setContent({ ...content, messages: { ...content.messages, winnerAnnouncement: e.target.value } })}
                  className="w-full px-4 py-2.5 bg-[#0a0b0f] border border-white/10 rounded-xl text-sm text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1.5">System Status / Maintenance Notice</label>
                <input
                  type="text"
                  value={content.messages.systemMaintenanceNotice}
                  onChange={e => setContent({ ...content, messages: { ...content.messages, systemMaintenanceNotice: e.target.value } })}
                  className="w-full px-4 py-2.5 bg-[#0a0b0f] border border-white/10 rounded-xl text-sm text-white focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* SEO & METADATA */}
        {activeSection === 'seo' && (
          <div className="space-y-4">
            <h3 className="text-sm font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <Search className="w-4 h-4" />
              <span>Search Engine Optimization & Social Sharing (OpenGraph)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1.5">Meta Title</label>
                <input
                  type="text"
                  value={content.seo.metaTitle}
                  onChange={e => setContent({ ...content, seo: { ...content.seo, metaTitle: e.target.value } })}
                  className="w-full px-4 py-2.5 bg-[#0a0b0f] border border-white/10 rounded-xl text-sm text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1.5">Meta Keywords (comma separated)</label>
                <input
                  type="text"
                  value={content.seo.metaKeywords}
                  onChange={e => setContent({ ...content, seo: { ...content.seo, metaKeywords: e.target.value } })}
                  className="w-full px-4 py-2.5 bg-[#0a0b0f] border border-white/10 rounded-xl text-sm text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-zinc-400 mb-1.5">Meta Description</label>
                <textarea
                  rows={2}
                  value={content.seo.metaDescription}
                  onChange={e => setContent({ ...content, seo: { ...content.seo, metaDescription: e.target.value } })}
                  className="w-full px-4 py-2.5 bg-[#0a0b0f] border border-white/10 rounded-xl text-sm text-white focus:border-amber-500 focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1.5">Social Share Card Image URL (OpenGraph)</label>
                <input
                  type="text"
                  value={content.seo.ogImageUrl}
                  onChange={e => setContent({ ...content, seo: { ...content.seo, ogImageUrl: e.target.value } })}
                  className="w-full px-4 py-2.5 bg-[#0a0b0f] border border-white/10 rounded-xl text-sm text-white focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
