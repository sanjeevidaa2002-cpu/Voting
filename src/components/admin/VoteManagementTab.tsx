import React, { useState, useEffect } from 'react';
import { Contestant, VoteAuditLog } from '../../types';
import { api } from '../../services/api';
import {
  Award,
  RefreshCw,
  Plus,
  Minus,
  Edit3,
  History,
  CheckCircle2,
  AlertTriangle,
  Search,
  ArrowUpDown,
  X,
  TrendingUp,
  UserCheck,
  ShieldAlert,
  Clock,
  ExternalLink
} from 'lucide-react';

interface VoteManagementTabProps {
  contestants: Contestant[];
  onRefresh: () => Promise<void>;
  onShowNotification: (msg: string, type?: 'success' | 'error') => void;
  adminUsername: string | null;
}

export const VoteManagementTab: React.FC<VoteManagementTabProps> = ({
  contestants,
  onRefresh,
  onShowNotification,
  adminUsername,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'rank' | 'votes' | 'name'>('rank');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Edit / Adjust Modal State
  const [selectedContestant, setSelectedContestant] = useState<Contestant | null>(null);
  const [modalMode, setModalMode] = useState<'direct' | 'add' | 'remove'>('direct');
  const [customVoteInput, setCustomVoteInput] = useState<number>(0);
  const [quickAmount, setQuickAmount] = useState<number>(50);
  const [adjustmentReason, setAdjustmentReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reasonError, setReasonError] = useState('');

  // History Modal State
  const [historyContestant, setHistoryContestant] = useState<Contestant | null>(null);
  const [contestantHistory, setContestantHistory] = useState<VoteAuditLog[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Live Total Calculations
  const totalVotes = contestants.reduce((sum, c) => sum + (c.voteCount || 0), 0);

  // Calculate percentages and rankings
  const processedContestants = [...contestants].map((c) => {
    const count = c.voteCount || 0;
    const percentage = totalVotes > 0 ? ((count / totalVotes) * 100).toFixed(1) : '0.0';
    return {
      ...c,
      calculatedPercentage: percentage,
    };
  });

  // Sort according to user preference
  const sortedContestants = [...processedContestants].sort((a, b) => {
    if (sortBy === 'votes') {
      return sortOrder === 'desc' ? b.voteCount - a.voteCount : a.voteCount - b.voteCount;
    }
    if (sortBy === 'name') {
      return sortOrder === 'desc' ? b.name.localeCompare(a.name) : a.name.localeCompare(b.name);
    }
    // Default: by rank (high votes first)
    return b.voteCount - a.voteCount;
  });

  const filteredContestants = sortedContestants.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.contestantNumber.includes(searchTerm) ||
      c.occupation?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Refresh Vote Counts button handler
  const handleRefreshVotes = async () => {
    try {
      setIsRefreshing(true);
      const res = await api.syncAndRefreshVotes();
      await onRefresh();
      onShowNotification(res.message || 'Vote counts, rankings and percentages refreshed from database!');
    } catch (err: any) {
      onShowNotification(err.message || 'Failed to refresh vote counts', 'error');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Sync Votes button handler
  const handleSyncVotes = async () => {
    try {
      setIsSyncing(true);
      const res = await api.syncAndRefreshVotes();
      await onRefresh();
      onShowNotification(`Certified database sync complete! Total certified votes: ${res.totalVotes.toLocaleString()}`);
    } catch (err: any) {
      onShowNotification(err.message || 'Sync failed', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (c: Contestant, mode: 'direct' | 'add' | 'remove') => {
    setSelectedContestant(c);
    setModalMode(mode);
    setCustomVoteInput(c.voteCount || 0);
    setQuickAmount(mode === 'remove' ? 20 : 50);
    setAdjustmentReason('');
    setReasonError('');
  };

  // Submit Vote Adjustment
  const handleSubmitAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContestant) return;

    if (!adjustmentReason.trim()) {
      setReasonError('A valid audit reason is required for any vote tally modification.');
      return;
    }

    let calculatedNewCount = selectedContestant.voteCount;
    let actionType: 'EDIT' | 'ADD' | 'REMOVE' = 'EDIT';

    if (modalMode === 'direct') {
      calculatedNewCount = Math.max(0, Math.floor(Number(customVoteInput)));
      actionType = calculatedNewCount > selectedContestant.voteCount ? 'ADD' : calculatedNewCount < selectedContestant.voteCount ? 'REMOVE' : 'EDIT';
    } else if (modalMode === 'add') {
      calculatedNewCount = selectedContestant.voteCount + Math.max(1, Math.floor(Number(quickAmount)));
      actionType = 'ADD';
    } else if (modalMode === 'remove') {
      calculatedNewCount = Math.max(0, selectedContestant.voteCount - Math.max(1, Math.floor(Number(quickAmount))));
      actionType = 'REMOVE';
    }

    try {
      setIsSubmitting(true);
      const res = await api.adjustContestantVotes(
        selectedContestant.id,
        calculatedNewCount,
        adjustmentReason.trim(),
        actionType
      );

      onShowNotification(res.message);
      setSelectedContestant(null);
      await onRefresh();
    } catch (err: any) {
      onShowNotification(err.message || 'Failed to adjust votes', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open History Modal
  const handleOpenHistory = async (c: Contestant) => {
    setHistoryContestant(c);
    setIsLoadingHistory(true);
    try {
      const res = await api.getContestantVoteHistory(c.id);
      setContestantHistory(res.history || []);
    } catch (err: any) {
      onShowNotification(err.message || 'Failed to fetch vote history', 'error');
    } finally {
      setIsLoadingHistory(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-zinc-900/90 via-[#13151f] to-zinc-900/90 p-6 rounded-3xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Award className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-serif font-black text-white">
              Vote Count Management & Synchronization
            </h2>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Certified real-time vote metrics, manual tally adjustments with mandatory audit trail, and instant rank recalculation.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleRefreshVotes}
            disabled={isRefreshing}
            className="py-2.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-amber-500/40 transition flex items-center gap-2 disabled:opacity-50"
            title="Recalculate tallies, percentages, and rankings from database"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh Vote Counts'}</span>
          </button>

          <button
            onClick={handleSyncVotes}
            disabled={isSyncing}
            className="py-2.5 px-5 rounded-xl font-black text-xs uppercase tracking-wider bg-gradient-to-r from-amber-500 to-amber-600 text-black hover:from-amber-400 hover:to-amber-500 transition shadow-lg shadow-amber-500/20 flex items-center gap-2 disabled:opacity-50"
            title="Synchronize and re-verify certified database state"
          >
            <TrendingUp className={`w-4 h-4 ${isSyncing ? 'animate-bounce' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync Votes'}</span>
          </button>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-zinc-900/40 border border-white/10 space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold">Total Votes Cast</span>
          <div className="text-2xl font-mono font-black text-white">{totalVotes.toLocaleString()}</div>
          <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Live Certified
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900/40 border border-white/10 space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold">Active Contestants</span>
          <div className="text-2xl font-mono font-black text-amber-400">{contestants.length}</div>
          <span className="text-[10px] text-zinc-400">All registered housemates</span>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900/40 border border-white/10 space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold">Current Leader</span>
          <div className="text-sm font-bold text-white truncate">
            {sortedContestants[0]?.name || 'N/A'}
          </div>
          <span className="text-[10px] font-mono text-amber-400 font-bold">
            {sortedContestants[0]?.voteCount.toLocaleString()} votes ({sortedContestants[0]?.calculatedPercentage}%)
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900/40 border border-white/10 space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold">Security Status</span>
          <div className="text-sm font-bold text-emerald-400 flex items-center gap-1">
            <ShieldAlert className="w-4 h-4" /> Enforced
          </div>
          <span className="text-[10px] text-zinc-400">1 vote/device rule active</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-zinc-900/40 p-4 rounded-2xl border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search contestant by name, # number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <span className="text-xs text-zinc-400 font-bold">Sort By:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
          >
            <option value="rank">Ranking (#1 to Last)</option>
            <option value="votes">Total Vote Count</option>
            <option value="name">Contestant Name</option>
          </select>

          <button
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-zinc-300 hover:text-white hover:bg-white/10 transition"
            title="Toggle Sort Order"
          >
            <ArrowUpDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Contestants Vote Table / Cards */}
      <div className="space-y-3">
        {filteredContestants.map((c, index) => {
          const rank = index + 1;
          const percentageNum = parseFloat(c.calculatedPercentage);

          return (
            <div
              key={c.id}
              className="p-4 rounded-2xl bg-[#0f1118] border border-white/10 hover:border-amber-500/30 transition flex flex-col lg:flex-row lg:items-center justify-between gap-4"
            >
              {/* Contestant Info & Rank */}
              <div className="flex items-center gap-3 min-w-[240px]">
                {/* Rank Badge */}
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono font-black text-xs flex-shrink-0 shadow-md ${
                    rank === 1
                      ? 'bg-amber-400 text-black border border-amber-300'
                      : rank === 2
                      ? 'bg-zinc-300 text-black border border-zinc-200'
                      : rank === 3
                      ? 'bg-amber-700 text-amber-100 border border-amber-600'
                      : 'bg-white/5 text-zinc-400 border border-white/10'
                  }`}
                >
                  #{rank}
                </div>

                {/* Photo */}
                <div className="relative group">
                  <img
                    src={c.photoUrl}
                    alt={c.name}
                    className="w-12 h-12 rounded-xl object-cover border border-white/10 bg-zinc-800"
                  />
                  <span className="absolute -bottom-1 -right-1 px-1 py-0.2 text-[9px] font-mono font-bold rounded bg-black/80 text-amber-400 border border-white/10">
                    #{c.contestantNumber}
                  </span>
                </div>

                {/* Name & Status */}
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-white text-sm">{c.name}</h4>
                    <span
                      className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
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
                  <p className="text-[11px] text-zinc-400">{c.occupation || 'Contestant Housemate'}</p>
                </div>
              </div>

              {/* Progress & Percentage */}
              <div className="flex-1 max-w-xs space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-400 font-bold">Vote Share:</span>
                  <span className="font-mono font-black text-amber-400">{c.calculatedPercentage}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-black/50 border border-white/5 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(0, percentageNum))}%` }}
                  />
                </div>
              </div>

              {/* Vote Count Metric */}
              <div className="flex items-center gap-6 min-w-[150px]">
                <div>
                  <div className="text-[10px] font-mono text-zinc-400 uppercase">Current Votes</div>
                  <div className="text-base font-mono font-black text-white">
                    {c.voteCount.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={() => openEditModal(c, 'direct')}
                  className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500 hover:text-black text-amber-400 border border-amber-500/30 text-xs font-bold transition flex items-center gap-1"
                  title="Manual Vote Count Edit"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Votes</span>
                </button>

                <button
                  onClick={() => openEditModal(c, 'add')}
                  className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500 hover:text-black text-emerald-400 border border-emerald-500/30 text-xs font-bold transition flex items-center gap-1"
                  title="Quick Add Votes"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>

                <button
                  onClick={() => openEditModal(c, 'remove')}
                  className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-400 border border-rose-500/30 text-xs font-bold transition flex items-center gap-1"
                  title="Quick Remove Votes"
                >
                  <Minus className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>

                <button
                  onClick={() => handleOpenHistory(c)}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white border border-white/5 text-xs transition"
                  title="View Audit History for this contestant"
                >
                  <History className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}

        {filteredContestants.length === 0 && (
          <div className="p-8 text-center bg-zinc-900/30 rounded-2xl border border-white/5 text-zinc-500 text-xs">
            No contestants matching "{searchTerm}".
          </div>
        )}
      </div>

      {/* MODAL: MANUAL VOTE COUNT EDIT / ADJUSTMENT */}
      {selectedContestant && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#12141c] border border-white/10 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-6 relative animate-in fade-in zoom-in duration-200">
            {/* Close Button */}
            <button
              onClick={() => setSelectedContestant(null)}
              className="absolute top-5 right-5 p-1.5 rounded-xl bg-white/5 text-zinc-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div>
              <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider">
                Audited Vote Modification
              </span>
              <h3 className="text-lg font-serif font-black text-white mt-0.5">
                Adjust Votes for {selectedContestant.name}
              </h3>
            </div>

            {/* Contestant Profile Strip */}
            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 flex items-center gap-3">
              <img
                src={selectedContestant.photoUrl}
                alt={selectedContestant.name}
                className="w-12 h-12 rounded-xl object-cover border border-white/10"
              />
              <div className="flex-1">
                <div className="font-bold text-white text-xs">
                  #{selectedContestant.contestantNumber} - {selectedContestant.name}
                </div>
                <div className="text-[11px] text-zinc-400">
                  Current Certified Count: <strong className="text-amber-400 font-mono">{selectedContestant.voteCount.toLocaleString()}</strong>
                </div>
              </div>
            </div>

            {/* Adjustment Mode Selector */}
            <div className="grid grid-cols-3 gap-2 bg-black/40 p-1 rounded-xl border border-white/5">
              <button
                type="button"
                onClick={() => setModalMode('direct')}
                className={`py-1.5 rounded-lg text-xs font-bold transition ${
                  modalMode === 'direct' ? 'bg-amber-500 text-black' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Direct Edit
              </button>
              <button
                type="button"
                onClick={() => setModalMode('add')}
                className={`py-1.5 rounded-lg text-xs font-bold transition ${
                  modalMode === 'add' ? 'bg-emerald-500 text-black' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Add Votes (+)
              </button>
              <button
                type="button"
                onClick={() => setModalMode('remove')}
                className={`py-1.5 rounded-lg text-xs font-bold transition ${
                  modalMode === 'remove' ? 'bg-rose-500 text-white' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Remove Votes (-)
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitAdjustment} className="space-y-4">
              {modalMode === 'direct' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300 block">New Total Vote Count</label>
                  <input
                    type="number"
                    min="0"
                    value={customVoteInput}
                    onChange={(e) => setCustomVoteInput(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-base font-mono font-bold text-white focus:outline-none focus:border-amber-400"
                  />
                  <div className="text-[11px] font-mono text-zinc-400">
                    Difference:{' '}
                    <span
                      className={`font-bold ${
                        customVoteInput - selectedContestant.voteCount >= 0
                          ? 'text-emerald-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {customVoteInput - selectedContestant.voteCount >= 0 ? '+' : ''}
                      {(customVoteInput - selectedContestant.voteCount).toLocaleString()} votes
                    </span>
                  </div>
                </div>
              )}

              {modalMode === 'add' && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-300 block">Select Votes to Add (+)</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[10, 50, 100, 500].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setQuickAmount(amt)}
                        className={`py-2 rounded-xl font-mono text-xs font-bold border transition ${
                          quickAmount === amt
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                            : 'bg-white/5 text-zinc-400 border-white/5 hover:bg-white/10'
                        }`}
                      >
                        +{amt}
                      </button>
                    ))}
                  </div>
                  <div className="pt-2">
                    <label className="text-[11px] text-zinc-400 font-bold block mb-1">Custom Add Amount</label>
                    <input
                      type="number"
                      min="1"
                      value={quickAmount}
                      onChange={(e) => setQuickAmount(Math.max(1, parseInt(e.target.value) || 0))}
                      className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-xs font-mono font-bold text-white focus:outline-none focus:border-emerald-400"
                    />
                  </div>
                  <div className="text-[11px] font-mono text-emerald-400 font-bold">
                    Resulting Count: {(selectedContestant.voteCount + quickAmount).toLocaleString()} votes
                  </div>
                </div>
              )}

              {modalMode === 'remove' && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-300 block">Select Votes to Remove (-)</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[5, 20, 50, 100].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setQuickAmount(amt)}
                        className={`py-2 rounded-xl font-mono text-xs font-bold border transition ${
                          quickAmount === amt
                            ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                            : 'bg-white/5 text-zinc-400 border-white/5 hover:bg-white/10'
                        }`}
                      >
                        -{amt}
                      </button>
                    ))}
                  </div>
                  <div className="pt-2">
                    <label className="text-[11px] text-zinc-400 font-bold block mb-1">Custom Remove Amount</label>
                    <input
                      type="number"
                      min="1"
                      max={selectedContestant.voteCount}
                      value={quickAmount}
                      onChange={(e) => setQuickAmount(Math.max(1, parseInt(e.target.value) || 0))}
                      className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-xs font-mono font-bold text-white focus:outline-none focus:border-rose-400"
                    />
                  </div>
                  <div className="text-[11px] font-mono text-rose-400 font-bold">
                    Resulting Count: {Math.max(0, selectedContestant.voteCount - quickAmount).toLocaleString()} votes
                  </div>
                </div>
              )}

              {/* Mandatory Reason */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-amber-400 flex items-center justify-between">
                  <span>Mandatory Reason for Adjustment *</span>
                  <span className="text-[10px] text-zinc-500 font-normal">Audit Trail Requirement</span>
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g., Correction of official SMS auditor batch reconciliation..."
                  value={adjustmentReason}
                  onChange={(e) => {
                    setAdjustmentReason(e.target.value);
                    if (e.target.value.trim()) setReasonError('');
                  }}
                  className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                />
                {reasonError && (
                  <p className="text-[11px] text-rose-400 flex items-center gap-1 font-bold">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {reasonError}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setSelectedContestant(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-amber-500 text-black hover:bg-amber-400 transition shadow-lg shadow-amber-500/20 disabled:opacity-50"
                >
                  {isSubmitting ? 'Recording Audit...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CONTESTANT AUDIT HISTORY */}
      {historyContestant && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#12141c] border border-white/10 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 relative max-h-[85vh] flex flex-col">
            {/* Close Button */}
            <button
              onClick={() => setHistoryContestant(null)}
              className="absolute top-5 right-5 p-1.5 rounded-xl bg-white/5 text-zinc-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider">
                Audited Vote Log
              </span>
              <h3 className="text-lg font-serif font-black text-white">
                Tally Modification History: {historyContestant.name}
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Complete cryptographic log of all manual and administrative interventions for this contestant.
              </p>
            </div>

            {/* History Table */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {isLoadingHistory ? (
                <div className="py-12 text-center text-zinc-400 text-xs flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-amber-400" /> Loading audit history...
                </div>
              ) : contestantHistory.length > 0 ? (
                contestantHistory.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-2 hover:border-white/10 transition text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-bold font-mono px-2 py-0.5 rounded text-[10px] ${
                            item.newCount > item.previousCount
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : item.newCount < item.previousCount
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}
                        >
                          {item.newCount > item.previousCount
                            ? `+${(item.newCount - item.previousCount).toLocaleString()}`
                            : `${(item.newCount - item.previousCount).toLocaleString()}`}
                        </span>
                        <span className="font-mono text-zinc-400 text-[11px]">
                          {item.previousCount.toLocaleString()} → <strong className="text-white">{item.newCount.toLocaleString()}</strong>
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500">
                        <Clock className="w-3 h-3" />
                        <span>{item.date || new Date(item.timestamp).toLocaleDateString()} {item.time || new Date(item.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </div>

                    <div className="text-[11px] text-zinc-300">
                      <strong>Reason:</strong> {item.reason}
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 pt-1 border-t border-white/5">
                      <span>Adjusted by: <strong className="text-amber-400">{item.adjustedBy}</strong></span>
                      <span>ID: {item.id}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-zinc-500 text-xs">
                  No manual modifications recorded for this contestant. All counts reflect organic certified public votes.
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-white/10 flex justify-end">
              <button
                onClick={() => setHistoryContestant(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10"
              >
                Close History
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
