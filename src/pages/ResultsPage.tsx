import React from 'react';
import { useShow } from '../context/ShowContext';
import { AnimatedCounter } from '../components/AnimatedCounter';
import {
  Radio,
  Trophy,
  Crown,
  Clock,
  Sparkles,
  BarChart3,
  ShieldCheck,
  Award,
  Vote
} from 'lucide-react';

export const ResultsPage: React.FC = () => {
  const { contestants, votingSettings, totalVotes, isVotingLive, openVoteModal, openDetailsModal } = useShow();

  if (votingSettings?.hideLiveResults) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center space-y-6">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-500/10 text-amber-400 ring-2 ring-amber-500/30">
          <Clock className="h-10 w-10 animate-pulse" />
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-black text-white">
          Results Will Be Announced Soon
        </h1>
        <p className="text-zinc-400 text-sm max-w-md mx-auto">
          The public tally has been secured by the audit committee for the live broadcast revelation.
        </p>
      </div>
    );
  }

  const sortedContestants = [...contestants].sort((a, b) => (b.voteCount || 0) - (a.voteCount || 0));
  const top1 = sortedContestants[0];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
      {/* Header Banner */}
      <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-[#181a24] to-[#0f1118] p-8 sm:p-12 space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-black text-emerald-400 uppercase tracking-widest">
            <Radio className="h-3.5 w-3.5 animate-pulse" />
            <span>{isVotingLive ? 'LIVE VOTING RESULTS' : 'OFFICIAL TALLY RESULTS'}</span>
          </div>
          <span className="text-xs text-zinc-400">
            Last Synced: {new Date().toLocaleTimeString()}
          </span>
        </div>

        <h1 className="font-serif text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
          Public Voting Standings
        </h1>

        <p className="text-sm text-zinc-300 max-w-2xl">
          Live verified audit of all public votes cast across registered accounts in the arena.
        </p>

        {/* Aggregate Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-white/10">
          <div className="rounded-2xl bg-black/40 p-4 ring-1 ring-white/5">
            <p className="text-[10px] font-bold text-zinc-400 uppercase">Total Public Votes</p>
            <p className="font-serif text-2xl font-black text-amber-400 mt-1">
              <AnimatedCounter value={totalVotes} />
            </p>
          </div>
          <div className="rounded-2xl bg-black/40 p-4 ring-1 ring-white/5">
            <p className="text-[10px] font-bold text-zinc-400 uppercase">Top Contender</p>
            <p className="font-serif text-lg font-bold text-white truncate mt-1">
              {top1 ? top1.name : 'N/A'}
            </p>
          </div>
          <div className="rounded-2xl bg-black/40 p-4 ring-1 ring-white/5">
            <p className="text-[10px] font-bold text-zinc-400 uppercase">Leader's Share</p>
            <p className="font-serif text-2xl font-black text-emerald-400 mt-1">
              {top1 ? `${top1.percentage}%` : '0%'}
            </p>
          </div>
          <div className="rounded-2xl bg-black/40 p-4 ring-1 ring-white/5">
            <p className="text-[10px] font-bold text-zinc-400 uppercase">Arena Status</p>
            <p className="text-xs font-bold text-zinc-200 mt-2 uppercase">
              {isVotingLive ? 'Lines Open' : 'Tally Locked'}
            </p>
          </div>
        </div>
      </div>

      {/* Results Breakdown Cards */}
      <div className="space-y-4">
        <h2 className="font-serif text-2xl font-black text-white">
          Individual Contestant Breakdown
        </h2>

        <div className="space-y-3">
          {sortedContestants.map((c, index) => {
            const rank = index + 1;
            const isWinner = rank === 1;

            return (
              <div
                key={c.id}
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border p-5 transition-all ${
                  isWinner
                    ? 'border-amber-500/50 bg-gradient-to-r from-amber-500/10 via-[#181a24] to-[#0f1118] shadow-xl shadow-amber-500/10'
                    : 'border-white/10 bg-[#12141c] hover:border-white/20'
                }`}
              >
                {/* Left: Rank + Avatar + Name */}
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-serif text-base font-black ${
                      rank === 1
                        ? 'bg-amber-400 text-black shadow-md shadow-amber-400/40'
                        : rank === 2
                        ? 'bg-zinc-300 text-black'
                        : rank === 3
                        ? 'bg-amber-700 text-white'
                        : 'bg-white/5 text-zinc-400'
                    }`}
                  >
                    #{rank}
                  </div>

                  <img
                    src={c.photoUrl}
                    alt={c.name}
                    className="h-14 w-14 rounded-xl object-cover ring-1 ring-white/10"
                  />

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-amber-400">
                        #{c.contestantNumber}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase ${
                          c.status === 'nominated'
                            ? 'bg-rose-500/20 text-rose-300'
                            : c.status === 'safe'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-zinc-800 text-zinc-400'
                        }`}
                      >
                        {c.status}
                      </span>
                    </div>
                    <h3 className="font-serif text-lg font-bold text-white">
                      {c.name}
                    </h3>
                    <p className="text-xs text-zinc-400">
                      {c.occupation}
                    </p>
                  </div>
                </div>

                {/* Right: Vote Count + Progress Bar + CTA */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-8">
                  {/* Share Bar */}
                  <div className="w-full sm:w-56 space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-400">Vote Share</span>
                      <span className="font-mono font-bold text-amber-400">{c.percentage}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-300"
                        style={{ width: `${c.percentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Vote Count */}
                  <div className="text-left sm:text-right min-w-[100px]">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase">Verified Votes</span>
                    <div className="font-serif text-lg sm:text-xl font-black text-white">
                      <AnimatedCounter value={c.voteCount} />
                    </div>
                  </div>

                  {/* Button */}
                  <button
                    onClick={() => openVoteModal(c)}
                    disabled={!isVotingLive || c.status === 'evicted'}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-amber-500/10 px-4 py-2 text-xs font-black text-amber-400 ring-1 ring-amber-500/30 transition hover:bg-amber-500 hover:text-black active:scale-95 disabled:opacity-30"
                  >
                    <Vote className="h-3.5 w-3.5" />
                    <span>Vote</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
