import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useShow } from '../context/ShowContext';
import { api } from '../services/api';
import {
  Contestant,
  Banner,
  VotingSettings,
  SiteSettings,
  Vote,
  VoteAuditLog,
  MediaItem,
  AdminActivityLog,
} from '../types';
import { AnimatedCounter } from '../components/AnimatedCounter';
import { AdminSidebar, AdminTab } from '../components/admin/AdminSidebar';
import { UserManagementTab } from '../components/admin/UserManagementTab';
import { ThemeCustomizerTab } from '../components/admin/ThemeCustomizerTab';
import { ThemeManagerTab } from '../components/admin/ThemeManagerTab';
import { GlobalContentManagerTab } from '../components/admin/GlobalContentManagerTab';
import { BrandingTab } from '../components/admin/BrandingTab';
import { HomepageBuilderTab } from '../components/admin/HomepageBuilderTab';
import { NavigationBuilderTab } from '../components/admin/NavigationBuilderTab';
import { PagesManagerTab } from '../components/admin/PagesManagerTab';
import { GoogleServicesTab } from '../components/admin/GoogleServicesTab';
import { VoteManagementTab } from '../components/admin/VoteManagementTab';
import { BannerManagerTab } from '../components/admin/BannerManagerTab';
import { AdsManagementTab } from '../components/admin/AdsManagementTab';
import { MediaLibraryTab } from '../components/admin/MediaLibraryTab';

import {
  Shield,
  Users,
  Vote as VoteIcon,
  Layers,
  Settings,
  BarChart3,
  ListOrdered,
  Plus,
  Edit2,
  Trash2,
  Clock,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  Save,
  Search,
  Download,
  Flame,
  Radio,
  Sliders,
  Palette,
  Eye,
  FileText,
  Lock,
  ArrowUpRight,
  TrendingUp,
  Image as ImageIcon,
  Copy,
  Activity,
  Globe,
  Menu as MenuIcon,
  X,
  Sparkles,
  Award,
  ChevronUp,
  ChevronDown
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { adminUsername, isAdmin, adminLogout } = useAuth();
  const { fetchState, setCurrentView } = useShow();

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Admin Data State
  const [metrics, setMetrics] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [recentVotes, setRecentVotes] = useState<Vote[]>([]);
  const [auditLogs, setAuditLogs] = useState<VoteAuditLog[]>([]);
  const [activityLogs, setActivityLogs] = useState<AdminActivityLog[]>([]);
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [contestants, setContestants] = useState<Contestant[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [votingSettings, setVotingSettings] = useState<VotingSettings | null>(null);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Media upload state
  const [newMediaName, setNewMediaName] = useState('');
  const [newMediaUrl, setNewMediaUrl] = useState('');
  const [newMediaType, setNewMediaType] = useState<'contestant' | 'banner' | 'logo' | 'background' | 'other'>('contestant');
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);

  // Contestant Form Modal state
  const [editingContestant, setEditingContestant] = useState<Partial<Contestant> | null>(null);
  const [isContestantModalOpen, setIsContestantModalOpen] = useState(false);

  // Vote Adjustment Modal state
  const [adjustingContestant, setAdjustingContestant] = useState<Contestant | null>(null);
  const [adjustNewCount, setAdjustNewCount] = useState<number>(0);
  const [adjustReason, setAdjustReason] = useState<string>('');

  // Votes Log search
  const [voteSearch, setVoteSearch] = useState('');
  const [voteContestantFilter, setVoteContestantFilter] = useState('');

  const loadAdminData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [m, an, stateData, vList, aLogs, actLogs, mList, bnrList] = await Promise.all([
        api.getAdminMetrics(),
        api.getAdminAnalytics(),
        api.getState(),
        api.getAdminVotes({ limit: 100 }),
        api.getAuditLogs(),
        api.getActivityLogs().catch(() => ({ logs: [] })),
        api.getMedia().catch(() => ({ media: [] })),
        api.getAdminBanners().catch(() => ({ banners: [] })),
      ]);

      setMetrics(m);
      setAnalytics(an);
      setContestants(stateData.contestants || []);
      setBanners(bnrList.banners && bnrList.banners.length > 0 ? bnrList.banners : (stateData.banners || []));
      setVotingSettings(stateData.votingSettings || null);
      setSiteSettings(stateData.siteSettings || null);
      setRecentVotes(vList.votes || []);
      setAuditLogs(aLogs.auditLogs || []);
      setActivityLogs(actLogs.logs || []);
      setMediaList(mList.media || []);
    } catch (err: any) {
      console.error('Error fetching admin data:', err);
      setActionMessage({ text: err.message || 'Failed to load admin data', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) {
      loadAdminData();
    }
  }, [isAdmin, loadAdminData]);

  const showNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setActionMessage({ text, type });
    setTimeout(() => setActionMessage(null), 4000);
  };

  // ==========================================
  // CONTESTANT HANDLERS
  // ==========================================
  const handleSaveContestant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingContestant) return;

    try {
      if (editingContestant.id) {
        await api.updateContestant(editingContestant.id, editingContestant);
        showNotification(`Contestant ${editingContestant.name} updated!`);
      } else {
        await api.createContestant(editingContestant);
        showNotification('New contestant registered in the arena!');
      }
      setIsContestantModalOpen(false);
      setEditingContestant(null);
      await loadAdminData();
      await fetchState();
    } catch (err: any) {
      showNotification(err.message || 'Failed to save contestant', 'error');
    }
  };

  const handleDeleteContestant = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove ${name} from the show?`)) return;
    try {
      await api.deleteContestant(id);
      showNotification(`Contestant ${name} deleted.`);
      await loadAdminData();
      await fetchState();
    } catch (err: any) {
      showNotification(err.message || 'Failed to delete contestant', 'error');
    }
  };

  const handleAdjustVotes = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingContestant) return;
    if (!adjustReason.trim()) {
      showNotification('A mandatory audit reason is required for vote changes.', 'error');
      return;
    }

    try {
      await api.adjustContestantVotes(adjustingContestant.id, Number(adjustNewCount), adjustReason.trim());
      showNotification(`Votes for ${adjustingContestant.name} updated to ${Number(adjustNewCount).toLocaleString()}`);
      setAdjustingContestant(null);
      setAdjustReason('');
      await loadAdminData();
      await fetchState();
    } catch (err: any) {
      showNotification(err.message || 'Failed to adjust votes', 'error');
    }
  };

  const handleDuplicateContestant = async (id: string) => {
    try {
      const res = await api.duplicateContestant(id);
      showNotification(`Contestant duplicated as "${res.contestant.name}"!`);
      await loadAdminData();
      await fetchState();
    } catch (err: any) {
      showNotification(err.message || 'Failed to duplicate contestant', 'error');
    }
  };

  const handleMoveContestant = async (index: number, direction: 'up' | 'down') => {
    const newContestants = [...contestants];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newContestants.length) return;

    const temp = newContestants[index];
    newContestants[index] = newContestants[targetIndex];
    newContestants[targetIndex] = temp;

    setContestants(newContestants);
    try {
      await api.reorderContestants(newContestants.map(c => c.id));
      showNotification('Contestants roster order updated!');
      await fetchState();
    } catch (err: any) {
      showNotification(err.message || 'Failed to reorder contestants', 'error');
      await loadAdminData();
    }
  };

  // ==========================================
  // VOTING SETTINGS HANDLER
  // ==========================================
  const handleSaveVotingSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!votingSettings) return;

    try {
      await api.updateVotingSettings(votingSettings);
      showNotification('Voting settings and live countdown rules saved!');
      await loadAdminData();
      await fetchState();
    } catch (err: any) {
      showNotification(err.message || 'Failed to update voting settings', 'error');
    }
  };

  // ==========================================
  // MEDIA UPLOAD HANDLER
  // ==========================================
  const handleUploadMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMediaName.trim() || !newMediaUrl.trim()) return;

    try {
      await api.createMedia({
        name: newMediaName.trim(),
        url: newMediaUrl.trim(),
        type: newMediaType,
        size: '1.2 MB',
      });
      showNotification(`Asset "${newMediaName}" added to Media Library!`);
      setNewMediaName('');
      setNewMediaUrl('');
      setIsMediaModalOpen(false);
      await loadAdminData();
    } catch (err: any) {
      showNotification(err.message || 'Failed to upload media', 'error');
    }
  };

  const handleDeleteMedia = async (id: string, name: string) => {
    if (!window.confirm(`Delete media asset "${name}"?`)) return;
    try {
      await api.deleteMedia(id);
      showNotification(`Media asset "${name}" removed.`);
      await loadAdminData();
    } catch (err: any) {
      showNotification(err.message || 'Failed to delete media', 'error');
    }
  };

  const handleAdminLogout = async () => {
    try {
      await adminLogout();
    } finally {
      setCurrentView('admin-login');
    }
  };

  const siteName = siteSettings?.branding?.websiteName || siteSettings?.siteName || 'STAR HOUSE';

  return (
    <div className="min-h-screen bg-[#08090d] text-zinc-100 flex">
      {/* Sidebar */}
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        adminUsername={adminUsername}
        onLogout={handleAdminLogout}
        siteName={siteName}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-72 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 h-16 bg-[#0c0e14]/90 backdrop-blur-xl border-b border-white/10 px-4 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-xl text-zinc-400 hover:text-white bg-white/5 lg:hidden"
            >
              <MenuIcon className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400">
                Control Console
              </span>
              <span className="text-zinc-600">/</span>
              <span className="text-xs font-bold text-zinc-200 capitalize">
                {activeTab.replace('_', ' ')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentView('home')}
              className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-zinc-300 hover:text-white hover:bg-white/10 text-xs font-bold transition flex items-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Preview Live Site</span>
            </button>
            <button
              onClick={handleAdminLogout}
              className="px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 text-xs font-bold transition flex items-center gap-1.5"
              title="Sign Out of Admin Console"
            >
              <Lock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </header>

        {/* Action Message Toast */}
        {actionMessage && (
          <div className="fixed bottom-6 right-6 z-50 animate-bounce">
            <div
              className={`p-4 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-bold border backdrop-blur-xl ${
                actionMessage.type === 'success'
                  ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-300'
                  : 'bg-rose-950/90 border-rose-500/50 text-rose-300'
              }`}
            >
              {actionMessage.type === 'success' ? (
                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              )}
              <span>{actionMessage.text}</span>
            </div>
          </div>
        )}

        {/* Main Content Container */}
        <main className="p-4 sm:p-8 max-w-7xl w-full mx-auto space-y-8">
          {/* ========================================== */}
          {/* TAB 1: OVERVIEW & LIVE METRICS            */}
          {/* ========================================== */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Stat Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-6 rounded-3xl bg-zinc-900/50 border border-white/10 relative overflow-hidden">
                  <div className="flex items-center justify-between text-zinc-400 text-xs font-bold uppercase">
                    <span>Total Certified Votes</span>
                    <VoteIcon className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-3xl font-serif font-black text-white mt-2">
                    <AnimatedCounter value={metrics?.totalVotes || 0} />
                  </div>
                  <div className="text-[11px] text-emerald-400 flex items-center gap-1 mt-2">
                    <TrendingUp className="w-3 h-3" /> Real-time Verified Tallies
                  </div>
                </div>

                <div className="p-6 rounded-3xl bg-zinc-900/50 border border-white/10 relative overflow-hidden">
                  <div className="flex items-center justify-between text-zinc-400 text-xs font-bold uppercase">
                    <span>Today's Velocity</span>
                    <Flame className="w-4 h-4 text-rose-400" />
                  </div>
                  <div className="text-3xl font-serif font-black text-white mt-2">
                    <AnimatedCounter value={metrics?.todayVotes || 0} />
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-2">Past 24 hours activity</div>
                </div>

                <div className="p-6 rounded-3xl bg-zinc-900/50 border border-white/10 relative overflow-hidden">
                  <div className="flex items-center justify-between text-zinc-400 text-xs font-bold uppercase">
                    <span>Registered Voters</span>
                    <Users className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="text-3xl font-serif font-black text-white mt-2">
                    <AnimatedCounter value={metrics?.totalUsers || 0} />
                  </div>
                  <div className="text-[11px] text-cyan-400 mt-2">Authenticated passports</div>
                </div>

                <div className="p-6 rounded-3xl bg-zinc-900/50 border border-white/10 relative overflow-hidden">
                  <div className="flex items-center justify-between text-zinc-400 text-xs font-bold uppercase">
                    <span>Voting Line Status</span>
                    <Radio className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-2xl font-serif font-black text-white mt-2 flex items-center gap-2">
                    <span
                      className={`w-3 h-3 rounded-full ${
                        votingSettings?.isVotingActive ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'
                      }`}
                    />
                    {votingSettings?.isVotingActive ? 'LIVE & OPEN' : 'CLOSED'}
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-2 font-mono">
                    Ends: {votingSettings?.endDate}
                  </div>
                </div>
              </div>

              {/* Leaderboard Table & Recent Live Votes */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Contestants Live Share */}
                <div className="lg:col-span-2 p-6 rounded-3xl bg-zinc-900/40 border border-white/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <Award className="w-4 h-4 text-amber-400" /> Current Vote Standings
                    </h3>
                    <button
                      onClick={() => setActiveTab('contestants')}
                      className="text-xs text-amber-400 hover:underline"
                    >
                      Manage Roster →
                    </button>
                  </div>

                  <div className="space-y-3">
                    {contestants.map((c, idx) => (
                      <div key={c.id} className="p-3.5 rounded-2xl bg-black/40 border border-white/5 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-400 font-mono font-bold text-xs flex items-center justify-center">
                              #{idx + 1}
                            </span>
                            <img
                              src={c.photoUrl}
                              alt={c.name}
                              className="w-8 h-8 rounded-xl object-cover border border-white/10"
                            />
                            <div>
                              <div className="text-xs font-bold text-white">{c.name}</div>
                              <div className="text-[10px] text-zinc-400">Contestant #{c.contestantNumber}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs font-mono font-black text-amber-400">
                              {c.voteCount.toLocaleString()} votes
                            </div>
                            <div className="text-[10px] text-zinc-500">{c.percentage || 0}% share</div>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full"
                            style={{ width: `${c.percentage || 0}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Real-time Vote Ledger */}
                <div className="p-6 rounded-3xl bg-zinc-900/40 border border-white/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <Activity className="w-4 h-4 text-emerald-400" /> Recent Incoming Ballots
                    </h3>
                  </div>

                  <div className="space-y-2.5 max-h-[420px] overflow-y-auto custom-scrollbar">
                    {recentVotes.slice(0, 10).map((v) => (
                      <div key={v.id} className="p-3 rounded-xl bg-black/40 border border-white/5 text-xs space-y-1">
                        <div className="flex items-center justify-between font-bold text-white">
                          <span>{v.contestantName}</span>
                          <span className="text-emerald-400 font-mono text-[10px]">Verified</span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500">
                          <span>ID: {v.id.substring(0, 12)}...</span>
                          <span>{new Date(v.timestamp).toLocaleTimeString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================== */}
          {/* TAB: VOTE MANAGEMENT & SYNC               */}
          {/* ========================================== */}
          {activeTab === 'vote_management' && (
            <VoteManagementTab
              contestants={contestants}
              onRefresh={loadAdminData}
              onShowNotification={showNotification}
              adminUsername={adminUsername}
            />
          )}

          {/* ========================================== */}
          {/* TAB 2: CONTESTANTS MANAGEMENT             */}
          {/* ========================================== */}
          {activeTab === 'contestants' && (
            <div className="space-y-6">
              <div className="bg-zinc-900/60 p-6 rounded-3xl border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-serif font-black text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-amber-400" /> Contestant Housemates
                  </h2>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Add new housemates, edit profiles, change nomination status, and manually adjust audited vote tallies.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setEditingContestant({
                      name: '',
                      contestantNumber: String(contestants.length + 1).padStart(2, '0'),
                      photoUrl: '',
                      description: '',
                      age: 25,
                      occupation: '',
                      city: '',
                      status: 'nominated',
                      tagline: '',
                      order: contestants.length + 1,
                    });
                    setIsContestantModalOpen(true);
                  }}
                  className="py-2.5 px-5 rounded-xl font-bold text-xs uppercase tracking-wider bg-amber-500 text-black hover:bg-amber-400 transition flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Register Contestant</span>
                </button>
              </div>

              {/* Contestants Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {contestants.map((c, idx) => (
                  <div
                    key={c.id}
                    className="p-5 rounded-3xl bg-zinc-900/40 border border-white/10 space-y-4 relative group hover:border-amber-500/40 transition"
                  >
                    {/* Top action row: order arrows + duplicate badge */}
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMoveContestant(idx, 'up')}
                          className="p-1 rounded-lg bg-white/5 hover:bg-amber-500/20 text-zinc-400 hover:text-amber-400 disabled:opacity-20 disabled:hover:bg-transparent"
                          title="Move Up in Roster"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === contestants.length - 1}
                          onClick={() => handleMoveContestant(idx, 'down')}
                          className="p-1 rounded-lg bg-white/5 hover:bg-amber-500/20 text-zinc-400 hover:text-amber-400 disabled:opacity-20 disabled:hover:bg-transparent"
                          title="Move Down in Roster"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                        <span className="text-[11px] font-mono text-zinc-500 font-bold ml-1">
                          Pos #{idx + 1}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDuplicateContestant(c.id)}
                        className="px-2 py-1 rounded-lg bg-white/5 hover:bg-amber-500/20 text-amber-400 hover:text-amber-300 text-[11px] font-bold flex items-center gap-1 transition"
                        title="Duplicate Contestant Profile"
                      >
                        <Copy className="w-3 h-3" />
                        <span>Duplicate</span>
                      </button>
                    </div>

                    <div className="flex items-start gap-4">
                      <img
                        src={c.photoUrl}
                        alt={c.name}
                        className="w-16 h-16 rounded-2xl object-cover border border-white/10 bg-zinc-800"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-amber-400">
                            #{c.contestantNumber}
                          </span>
                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                              c.status === 'nominated'
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                                : c.status === 'safe'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                            }`}
                          >
                            {c.status}
                          </span>
                        </div>
                        <h4 className="font-bold text-white text-sm truncate mt-0.5">{c.name}</h4>
                        <p className="text-[11px] text-zinc-400 truncate">{c.occupation}</p>
                      </div>
                    </div>

                    <div className="p-3 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-between">
                      <span className="text-xs text-zinc-400">Current Votes:</span>
                      <span className="text-sm font-mono font-black text-amber-400">
                        {c.voteCount.toLocaleString()}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-2">
                      <button
                        onClick={() => {
                          setAdjustingContestant(c);
                          setAdjustNewCount(c.voteCount);
                          setAdjustReason('');
                        }}
                        className="py-2 px-2.5 rounded-xl bg-white/5 border border-white/10 text-amber-400 text-xs font-bold hover:bg-amber-500/10 transition text-center"
                        title="Manual Vote Adjustment (Audited)"
                      >
                        Adjust Votes
                      </button>
                      <button
                        onClick={() => {
                          setEditingContestant(c);
                          setIsContestantModalOpen(true);
                        }}
                        className="py-2 px-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-300 text-xs font-bold hover:bg-white/10 transition text-center"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteContestant(c.id, c.name)}
                        className="py-2 px-2.5 rounded-xl bg-white/5 border border-white/10 text-rose-400 text-xs font-bold hover:bg-rose-500/10 transition text-center"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================== */}
          {/* TAB: BANNER MANAGEMENT                    */}
          {/* ========================================== */}
          {activeTab === 'banners' && (
            <BannerManagerTab
              banners={banners}
              onRefresh={loadAdminData}
              onShowNotification={showNotification}
            />
          )}

          {/* ========================================== */}
          {/* TAB: AD MANAGEMENT (ADSTERRA)              */}
          {/* ========================================== */}
          {activeTab === 'ads' && (
            <AdsManagementTab
              siteSettings={siteSettings}
              onRefresh={loadAdminData}
              onShowNotification={showNotification}
            />
          )}

          {/* ========================================== */}
          {/* TAB 3: VOTING CONTROLS                    */}
          {/* ========================================== */}
          {activeTab === 'voting_settings' && votingSettings && (
            <form onSubmit={handleSaveVotingSettings} className="space-y-8">
              <div className="bg-zinc-900/60 p-6 rounded-3xl border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-serif font-black text-white flex items-center gap-2">
                    <VoteIcon className="w-5 h-5 text-amber-400" /> Voting Line Engine & Rules
                  </h2>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Toggle voting line availability, set countdown deadlines, configure IP rate limiters, and edit on-screen messages.
                  </p>
                </div>

                <button
                  type="submit"
                  className="py-3 px-6 rounded-xl font-black text-xs uppercase tracking-wider bg-gradient-to-r from-amber-500 to-amber-600 text-black hover:from-amber-400 hover:to-amber-500 transition shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Voting Rules</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Live Switch & Schedule */}
                <div className="p-6 rounded-3xl bg-zinc-900/40 border border-white/10 space-y-4">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-400" /> Live Schedule & Status
                  </h3>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-black/40 border border-white/10">
                      <div>
                        <div className="text-xs font-bold text-white">Live Voting Line Master Switch</div>
                        <div className="text-[11px] text-zinc-400">Enable or disable vote submission instantly</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={votingSettings.isVotingActive}
                          onChange={(e) =>
                            setVotingSettings({ ...votingSettings, isVotingActive: e.target.checked })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                      </label>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-zinc-400 font-bold block mb-1">End Date</label>
                        <input
                          type="date"
                          value={votingSettings.endDate}
                          onChange={(e) =>
                            setVotingSettings({ ...votingSettings, endDate: e.target.value })
                          }
                          className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-zinc-400 font-bold block mb-1">End Time</label>
                        <input
                          type="time"
                          value={votingSettings.endTime}
                          onChange={(e) =>
                            setVotingSettings({ ...votingSettings, endTime: e.target.value })
                          }
                          className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Anti-Fraud & Velocity Shield */}
                <div className="p-6 rounded-3xl bg-zinc-900/40 border border-white/10 space-y-4">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Shield className="w-4 h-4 text-amber-400" /> Velocity & Rate Limiter
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="text-xs text-zinc-400 font-bold block mb-1">
                        IP Cooldown Throttle (Seconds)
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={60}
                        value={votingSettings.voteCooldownSeconds}
                        onChange={(e) =>
                          setVotingSettings({
                            ...votingSettings,
                            voteCooldownSeconds: Number(e.target.value),
                          })
                        }
                        className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-zinc-400 font-bold block mb-1">
                        Closed Line Notice Message
                      </label>
                      <textarea
                        rows={3}
                        value={votingSettings.votingClosedMessage}
                        onChange={(e) =>
                          setVotingSettings({
                            ...votingSettings,
                            votingClosedMessage: e.target.value,
                          })
                        }
                        className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </form>
          )}

          {/* ========================================== */}
          {/* TAB 4: USERS MANAGEMENT                  */}
          {/* ========================================== */}
          {activeTab === 'users' && (
            <UserManagementTab onShowNotification={showNotification} />
          )}

          {/* ========================================== */}
          {/* TAB: GLOBAL CONTENT CMS                  */}
          {/* ========================================== */}
          {activeTab === 'global_content' && (
            <GlobalContentManagerTab
              siteSettings={siteSettings}
              onUpdate={loadAdminData}
            />
          )}

          {/* ========================================== */}
          {/* TAB: THEME STUDIO & COLOR PALETTES       */}
          {/* ========================================== */}
          {activeTab === 'themes_manager' && (
            <ThemeManagerTab
              siteSettings={siteSettings}
              onUpdate={loadAdminData}
            />
          )}

          {/* ========================================== */}
          {/* TAB 5: BRANDING                          */}
          {/* ========================================== */}
          {activeTab === 'branding' && (
            <BrandingTab
              siteSettings={siteSettings}
              onRefresh={loadAdminData}
              onShowNotification={showNotification}
            />
          )}

          {/* ========================================== */}
          {/* TAB 6: THEME & VISUAL STYLING            */}
          {/* ========================================== */}
          {activeTab === 'theme' && (
            <ThemeManagerTab
              siteSettings={siteSettings}
              onUpdate={loadAdminData}
            />
          )}

          {/* ========================================== */}
          {/* TAB 7: UI CUSTOMIZER                     */}
          {/* ========================================== */}
          {activeTab === 'ui' && (
            <div className="space-y-6">
              <div className="bg-zinc-900/60 p-6 rounded-3xl border border-white/10">
                <h2 className="text-xl font-serif font-black text-white flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-amber-400" /> UI Layout Customizer
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Configure grid layouts, contestant card density, and results display mode.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-3xl bg-zinc-900/40 border border-white/10 space-y-3">
                  <h3 className="text-sm font-bold text-white">Contestants Grid Columns</h3>
                  <div className="space-y-2">
                    {['grid-3', 'grid-4', 'bento'].map((layout) => (
                      <button
                        key={layout}
                        onClick={async () => {
                          await api.updateUISettings({ contestantCardLayout: layout as any });
                          showNotification(`Grid set to ${layout}`);
                          await loadAdminData();
                        }}
                        className={`w-full p-3 rounded-xl border text-left text-xs font-bold capitalize ${
                          siteSettings?.uiSettings?.contestantCardLayout === layout
                            ? 'bg-amber-500 text-black border-amber-400'
                            : 'bg-black/40 border-white/10 text-zinc-300'
                        }`}
                      >
                        {layout.replace('-', ' ')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================== */}
          {/* TAB 8: HOMEPAGE BUILDER                  */}
          {/* ========================================== */}
          {activeTab === 'homepage' && (
            <HomepageBuilderTab
              siteSettings={siteSettings}
              onRefresh={loadAdminData}
              onShowNotification={showNotification}
            />
          )}

          {/* ========================================== */}
          {/* TAB 9: NAVIGATION BUILDER                */}
          {/* ========================================== */}
          {activeTab === 'navigation' && (
            <NavigationBuilderTab
              siteSettings={siteSettings}
              onRefresh={loadAdminData}
              onShowNotification={showNotification}
            />
          )}

          {/* ========================================== */}
          {/* TAB 10: PAGES MANAGER                    */}
          {/* ========================================== */}
          {activeTab === 'pages' && (
            <PagesManagerTab onShowNotification={showNotification} />
          )}

          {/* ========================================== */}
          {/* TAB 11: MEDIA LIBRARY                    */}
          {/* ========================================== */}
          {activeTab === 'media' && (
            <MediaLibraryTab
              mediaList={mediaList}
              onRefresh={loadAdminData}
              onShowNotification={showNotification}
            />
          )}

          {/* ========================================== */}
          {/* TAB 12: ANALYTICS & TRAFFIC               */}
          {/* ========================================== */}
          {activeTab === 'analytics' && analytics && (
            <div className="space-y-6">
              <div className="bg-zinc-900/60 p-6 rounded-3xl border border-white/10">
                <h2 className="text-xl font-serif font-black text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-amber-400" /> Voting Velocity & Analytics
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Detailed distribution of votes over time, hourly spikes, and percentage share.
                </p>
              </div>

              {/* Contestants Breakdown */}
              <div className="p-6 rounded-3xl bg-zinc-900/40 border border-white/10 space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Contestant Share Breakdown
                </h3>
                <div className="space-y-3">
                  {analytics.contestantStats?.map((c: any) => (
                    <div key={c.contestantId} className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="font-bold text-white">{c.name}</span>
                        <span className="font-mono text-amber-400">
                          {c.voteCount.toLocaleString()} ({c.percentage}%)
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full"
                          style={{ width: `${c.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================== */}
          {/* TAB 13: GOOGLE SERVICES                   */}
          {/* ========================================== */}
          {activeTab === 'google' && (
            <GoogleServicesTab
              siteSettings={siteSettings}
              onRefresh={loadAdminData}
              onShowNotification={showNotification}
            />
          )}

          {/* ========================================== */}
          {/* TAB 14: AUDIT & ACTIVITY LOGS             */}
          {/* ========================================== */}
          {activeTab === 'audit_logs' && (
            <div className="space-y-8">
              {/* Audited Vote Adjustments */}
              <div className="p-6 rounded-3xl bg-zinc-900/40 border border-white/10 space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Shield className="w-4 h-4 text-amber-400" /> Audited Manual Vote Adjustments
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-zinc-300">
                    <thead>
                      <tr className="border-b border-white/10 text-zinc-500 font-mono text-[10px] uppercase">
                        <th className="p-3">Contestant</th>
                        <th className="p-3">Old Count</th>
                        <th className="p-3">New Count</th>
                        <th className="p-3">Audit Reason</th>
                        <th className="p-3">Adjusted By</th>
                        <th className="p-3">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {auditLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-white/[0.02]">
                          <td className="p-3 font-bold text-white">{log.contestantName}</td>
                          <td className="p-3 font-mono text-zinc-400">{log.previousCount.toLocaleString()}</td>
                          <td className="p-3 font-mono text-amber-400 font-bold">
                            {log.newCount.toLocaleString()}
                          </td>
                          <td className="p-3 text-zinc-300 italic">{log.reason}</td>
                          <td className="p-3 font-mono text-cyan-400">{log.adjustedBy}</td>
                          <td className="p-3 font-mono text-[10px] text-zinc-500">
                            {new Date(log.timestamp).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ========================================== */}
      {/* MODAL: CONTESTANT REGISTRATION / EDIT      */}
      {/* ========================================== */}
      {isContestantModalOpen && editingContestant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <form
            onSubmit={handleSaveContestant}
            className="max-w-lg w-full rounded-3xl bg-[#12141c] border border-white/15 p-6 sm:p-8 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="text-lg font-serif font-black text-white">
                {editingContestant.id ? 'Edit Housemate' : 'Register New Housemate'}
              </h3>
              <button
                type="button"
                onClick={() => setIsContestantModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-zinc-400 font-bold block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editingContestant.name || ''}
                  onChange={(e) =>
                    setEditingContestant({ ...editingContestant, name: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-white"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 font-bold block mb-1">Number (e.g. 01)</label>
                <input
                  type="text"
                  required
                  value={editingContestant.contestantNumber || ''}
                  onChange={(e) =>
                    setEditingContestant({ ...editingContestant, contestantNumber: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-white"
                />
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs text-zinc-300 font-bold block">Contestant Official Photo *</label>
                <label className="cursor-pointer text-[10px] text-amber-400 hover:underline flex items-center gap-1 font-bold">
                  <span>Upload Local File</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = () => {
                        if (typeof reader.result === 'string') {
                          setEditingContestant({ ...editingContestant, photoUrl: reader.result });
                        }
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                </label>
              </div>
              <input
                type="url"
                required
                value={editingContestant.photoUrl || ''}
                onChange={(e) =>
                  setEditingContestant({ ...editingContestant, photoUrl: e.target.value })
                }
                placeholder="https://images.unsplash.com/... or upload file"
                className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
              />
              {editingContestant.photoUrl && (
                <div className="flex items-center gap-3 pt-1">
                  <img
                    src={editingContestant.photoUrl}
                    alt="Preview"
                    className="w-14 h-14 rounded-xl object-cover border border-white/10 bg-zinc-800"
                  />
                  <div className="text-[11px] text-zinc-400 flex-1">
                    <span className="text-emerald-400 font-bold block">Photo Attached</span>
                    <span className="truncate block max-w-[240px] text-zinc-500 font-mono text-[10px]">
                      {editingContestant.photoUrl.substring(0, 45)}...
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-zinc-400 font-bold block mb-1">Age</label>
                <input
                  type="number"
                  value={editingContestant.age || 25}
                  onChange={(e) =>
                    setEditingContestant({ ...editingContestant, age: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-white"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 font-bold block mb-1">City</label>
                <input
                  type="text"
                  value={editingContestant.city || ''}
                  onChange={(e) =>
                    setEditingContestant({ ...editingContestant, city: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-white"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 font-bold block mb-1">Status</label>
                <select
                  value={editingContestant.status || 'nominated'}
                  onChange={(e) =>
                    setEditingContestant({ ...editingContestant, status: e.target.value as any })
                  }
                  className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-white"
                >
                  <option value="nominated">Nominated</option>
                  <option value="safe">Safe</option>
                  <option value="evicted">Evicted</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs text-zinc-400 font-bold block mb-1">Tagline / Motto</label>
              <input
                type="text"
                placeholder="e.g. Master of Strategy"
                value={(editingContestant as any).tagline || ''}
                onChange={(e) =>
                  setEditingContestant({ ...editingContestant, tagline: e.target.value } as any)
                }
                className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-white"
              />
            </div>

            <div>
              <label className="text-xs text-zinc-400 font-bold block mb-1">Occupation</label>
              <input
                type="text"
                value={editingContestant.occupation || ''}
                onChange={(e) =>
                  setEditingContestant({ ...editingContestant, occupation: e.target.value })
                }
                className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-white"
              />
            </div>

            <div>
              <label className="text-xs text-zinc-400 font-bold block mb-1">Bio / Description</label>
              <textarea
                rows={3}
                value={editingContestant.description || ''}
                onChange={(e) =>
                  setEditingContestant({ ...editingContestant, description: e.target.value })
                }
                className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsContestantModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider bg-amber-500 text-black hover:bg-amber-400"
              >
                Save Contestant
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL: AUDITED VOTE ADJUSTMENT             */}
      {/* ========================================== */}
      {adjustingContestant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <form
            onSubmit={handleAdjustVotes}
            className="max-w-md w-full rounded-3xl bg-[#141622] border border-amber-500/40 p-6 sm:p-8 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase">
                <Shield className="w-4 h-4" /> Audited Vote Count Adjustment
              </div>
              <button
                type="button"
                onClick={() => setAdjustingContestant(null)}
                className="p-1 text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1">
              <div className="text-base font-bold text-white">{adjustingContestant.name}</div>
              <div className="text-xs text-zinc-400 font-mono">
                Current Certified Votes: {adjustingContestant.voteCount.toLocaleString()}
              </div>
            </div>

            <div>
              <label className="text-xs text-zinc-300 font-bold block mb-1">
                New Vote Tally Count
              </label>
              <input
                type="number"
                min={0}
                required
                value={adjustNewCount}
                onChange={(e) => setAdjustNewCount(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-black/50 border border-white/10 rounded-xl text-sm font-mono text-white"
              />
            </div>

            <div>
              <label className="text-xs text-zinc-300 font-bold block mb-1">
                Mandatory Audit Reason
              </label>
              <textarea
                rows={3}
                required
                placeholder="e.g. Recount audit adjustment after broadcast live check..."
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-black/50 border border-white/10 rounded-xl text-xs text-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setAdjustingContestant(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider bg-amber-500 text-black hover:bg-amber-400"
              >
                Commit Adjustment
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL: MEDIA UPLOAD                       */}
      {/* ========================================== */}
      {isMediaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <form
            onSubmit={handleUploadMedia}
            className="max-w-md w-full rounded-3xl bg-[#12141c] border border-white/15 p-6 sm:p-8 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="text-lg font-serif font-black text-white">Upload Media Asset</h3>
              <button
                type="button"
                onClick={() => setIsMediaModalOpen(false)}
                className="p-1 text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="text-xs text-zinc-400 font-bold block mb-1">Asset Name</label>
              <input
                type="text"
                required
                value={newMediaName}
                onChange={(e) => setNewMediaName(e.target.value)}
                placeholder="e.g. Promo Stage Hero Banner"
                className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white"
              />
            </div>

            <div>
              <label className="text-xs text-zinc-400 font-bold block mb-1">Image URL</label>
              <input
                type="url"
                required
                value={newMediaUrl}
                onChange={(e) => setNewMediaUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white"
              />
            </div>

            <div>
              <label className="text-xs text-zinc-400 font-bold block mb-1">Asset Category</label>
              <select
                value={newMediaType}
                onChange={(e) => setNewMediaType(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white"
              >
                <option value="contestant">Contestant Photo</option>
                <option value="banner">Promo Banner</option>
                <option value="logo">Logo & Emblem</option>
                <option value="background">Backdrop</option>
                <option value="other">Other Asset</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsMediaModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider bg-amber-500 text-black hover:bg-amber-400"
              >
                Save Asset
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
