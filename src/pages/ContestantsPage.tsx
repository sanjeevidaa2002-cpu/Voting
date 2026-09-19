import React, { useState } from 'react';
import { useShow } from '../context/ShowContext';
import { ContestantCard } from '../components/ContestantCard';
import { Users, Search, Filter, ArrowUpDown, Flame, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';

export const ContestantsPage: React.FC = () => {
  const { contestants, hasVoted, votedContestantName } = useShow();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'nominated' | 'safe' | 'evicted'>('all');
  const [sortBy, setSortBy] = useState<'rank' | 'votes' | 'number' | 'name'>('rank');

  const filtered = contestants
    .filter((c) => {
      if (statusFilter !== 'all' && c.status !== statusFilter) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        return (
          (c.name || '').toLowerCase().includes(q) ||
          (c.city || '').toLowerCase().includes(q) ||
          (c.occupation || '').toLowerCase().includes(q) ||
          (c.tagline || '').toLowerCase().includes(q) ||
          (c.description || '').toLowerCase().includes(q) ||
          (c.contestantNumber || '').includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'votes') return (b.voteCount || 0) - (a.voteCount || 0);
      if (sortBy === 'number') return (a.contestantNumber || '').localeCompare(b.contestantNumber || '');
      if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
      return (a.rank || 99) - (b.rank || 99); // default rank
    });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-8">
      {/* Header Banner */}
      <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-[#181a24] to-[#0f1118] p-8 sm:p-10 space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-black text-amber-400 uppercase tracking-widest">
          <Users className="h-3.5 w-3.5" />
          <span>ARENA DIRECTORY</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-black text-white uppercase tracking-tight">
          Housemates & Participants
        </h1>
        <p className="text-sm text-zinc-400 max-w-2xl">
          Discover complete profiles, vote shares, rankings, and voting statistics for all contestants inside the arena.
        </p>
      </div>

      {/* Already Voted Prominent Banner */}
      {hasVoted && (
        <div
          id="contestants-already-voted-alert"
          className="rounded-2xl border border-emerald-500/40 bg-gradient-to-r from-emerald-950/80 via-emerald-900/40 to-black/90 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl shadow-emerald-500/10 animate-fade-in"
        >
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/40">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-sm sm:text-base font-bold text-white">
                You have already voted for <span className="text-emerald-400 font-serif font-black">{votedContestantName || 'your selected contestant'}</span>. Thank you for participating!
              </h4>
              <p className="text-xs text-zinc-400 mt-0.5">
                Your official certified vote has been registered. Voting buttons are locked for this round.
              </p>
            </div>
          </div>
          <span className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-emerald-300 ring-1 ring-emerald-500/40">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Official Vote Cast</span>
          </span>
        </div>
      )}

      {/* Search, Filter & Sort Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#12141c] p-4">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search contestant by name, city, number..."
            className="w-full rounded-xl bg-black/50 border border-white/10 pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-zinc-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 rounded-xl bg-black/40 p-1 ring-1 ring-white/10">
            {(['all', 'nominated', 'safe', 'evicted'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold capitalize transition ${
                  statusFilter === st
                    ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 rounded-xl bg-black/40 px-3 py-1.5 ring-1 ring-white/10">
            <ArrowUpDown className="h-3.5 w-3.5 text-amber-400" />
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer"
            >
              <option value="rank" className="bg-[#12141c]">Sort: Rank (High to Low)</option>
              <option value="votes" className="bg-[#12141c]">Sort: Total Votes</option>
              <option value="number" className="bg-[#12141c]">Sort: Contestant Number</option>
              <option value="name" className="bg-[#12141c]">Sort: Name (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Contestants */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filtered.map((c) => (
            <ContestantCard key={c.id} contestant={c} />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-white/10 bg-[#12141c] p-12 text-center space-y-3">
          <ShieldAlert className="h-10 w-10 text-amber-400 mx-auto opacity-70" />
          <h3 className="font-serif text-lg font-bold text-white">No Contestants Found</h3>
          <p className="text-xs text-zinc-400">
            Try adjusting your search criteria or changing the filter.
          </p>
        </div>
      )}
    </div>
  );
};
