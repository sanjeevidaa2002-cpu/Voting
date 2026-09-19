import React from 'react';
import { useShow } from '../context/ShowContext';
import { AnimatedCounter } from './AnimatedCounter';
import {
  Trophy,
  Crown,
  Medal,
  Vote,
  TrendingUp,
  Sparkles,
  Info,
  ShieldCheck,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export const LiveRankingSection: React.FC = () => {
  const { contestants, openVoteModal, openDetailsModal, isVotingLive, votingSettings, isLeaderboardVisible, toggleLeaderboard } = useShow();

  if (votingSettings?.hideLiveResults) {
    return (
      <section id="ranking-section" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="rounded-3xl border border-white/10 bg-[#14161f] p-12 text-center space-y-4">
          <Trophy className="h-12 w-12 text-amber-400 mx-auto" />
          <h2 className="font-serif text-2xl sm:text-3xl font-black text-white">
            LIVE VOTING RANKING
          </h2>
          <p className="text-zinc-400 max-w-md mx-auto">
            Results will be announced live on stage during the weekend elimination broadcast.
          </p>
        </div>
      </section>
    );
  }

  const sortedContestants = [...contestants].sort((a, b) => (b.voteCount || 0) - (a.voteCount || 0));
  const top3 = sortedContestants.slice(0, 3);
  const remaining = sortedContestants.slice(3);

  // If collapsed/hidden by user toggle
  if (!isLeaderboardVisible) {
    return (
      <section id="ranking-section" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 transition-all">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-[#12141c] via-[#161824] to-[#12141c] p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/30 shrink-0">
              <Trophy className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-serif text-lg sm:text-xl font-black text-white flex items-center gap-2 justify-center sm:justify-start">
                Live Leaderboard Hidden
                <span className="text-xs font-normal text-zinc-400">({sortedContestants.length} Housemates)</span>
              </h3>
              <p className="text-xs text-zinc-400">
                Leaderboard display is currently hidden. Click show to reveal real-time rankings.
              </p>
            </div>
          </div>
          <button
            onClick={toggleLeaderboard}
            className="flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 px-6 py-3 text-xs sm:text-sm font-black text-black uppercase tracking-wider shadow-lg shadow-amber-500/20 hover:scale-105 active:scale-95 transition"
          >
            <Eye className="h-4 w-4" />
            <span>Show Live Leaderboard</span>
          </button>
        </div>
      </section>
    );
  }

  // Podium positioning: 2nd place on left, 1st place in center (tallest), 3rd place on right
  const podium = [
    { contestant: top3[1], rank: 2, title: '2nd Place', color: 'from-zinc-300 to-zinc-500', border: 'border-zinc-400/40', badgeBg: 'bg-zinc-400/20 text-zinc-300', height: 'md:translate-y-4' },
    { contestant: top3[0], rank: 1, title: 'Leader (1st)', color: 'from-amber-300 via-amber-400 to-amber-600', border: 'border-amber-400/80 shadow-2xl shadow-amber-500/20', badgeBg: 'bg-amber-400/20 text-amber-300', height: 'md:translate-y-0 scale-105' },
    { contestant: top3[2], rank: 3, title: '3rd Place', color: 'from-amber-700 to-amber-900', border: 'border-amber-700/40', badgeBg: 'bg-amber-700/20 text-amber-400', height: 'md:translate-y-8' },
  ];

  return (
    <section id="ranking-section" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24 space-y-12">
      {/* Section Header with HIDE button */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-6">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1 text-xs font-black text-amber-400 uppercase tracking-widest">
            <Trophy className="h-3.5 w-3.5" />
            <span>REAL-TIME AUDIENCE LEADERBOARD</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-black text-white uppercase tracking-tight">
            LIVE VOTING RANKING
          </h2>
          <p className="text-sm sm:text-base text-zinc-400 max-w-xl">
            Position is calculated dynamically based on encrypted database vote tallies.
          </p>
        </div>

        {/* HIDE Action Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleLeaderboard}
            className="group flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.06] px-5 py-2.5 text-xs sm:text-sm font-bold text-zinc-300 hover:text-white hover:bg-white/[0.12] hover:border-amber-400/50 transition-all backdrop-blur-md active:scale-95"
            title="Hide Live Leaderboard"
          >
            <EyeOff className="h-4 w-4 text-zinc-400 group-hover:text-amber-400 transition" />
            <span className="uppercase tracking-wider">HIDE</span>
          </button>
        </div>
      </div>

      {/* Top 3 Visual Podium (Desktop/Tablet) */}
      {top3.length >= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 pb-4 items-end">
          {podium.map(({ contestant, rank, title, color, border, badgeBg, height }) => {
            if (!contestant) return null;
            const isWinner = rank === 1;

            return (
              <div
                key={contestant.id}
                className={`relative flex flex-col justify-between overflow-hidden rounded-3xl border bg-gradient-to-b from-[#191b26] to-[#0d0e14] p-6 transition-all duration-300 ${border} ${height}`}
              >
                {/* Top Rank Badge */}
                <div className="flex items-center justify-between mb-4">
                  <div className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black uppercase ${badgeBg}`}>
                    {isWinner ? <Crown className="h-4 w-4 text-amber-400" /> : <Medal className="h-4 w-4" />}
                    <span>{title}</span>
                  </div>
                  <span className="text-xs font-bold text-zinc-400">
                    #{contestant.contestantNumber}
                  </span>
                </div>

                {/* Avatar with Glow Ring */}
                <div className="relative mx-auto h-32 w-32 sm:h-36 sm:w-36 overflow-hidden rounded-full p-1 bg-gradient-to-br ring-4 ring-white/10 my-2">
                  <img
                    src={contestant.photoUrl}
                    alt={contestant.name}
                    className="h-full w-full rounded-full object-cover object-top"
                  />
                  {isWinner && (
                    <div className="absolute -top-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full bg-amber-400 text-black shadow-lg shadow-amber-500/50">
                      <Crown className="h-5 w-5" strokeWidth={2.5} />
                    </div>
                  )}
                </div>

                {/* Name & Vote Counts */}
                <div className="text-center space-y-2 mt-4">
                  <h3 className="font-serif text-xl font-black text-white truncate">
                    {contestant.name}
                  </h3>
                  <p className="text-xs text-zinc-400 truncate">
                    {contestant.occupation}
                  </p>

                  <div className="rounded-2xl bg-black/60 p-3 ring-1 ring-white/10 space-y-1">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                      Live Tally
                    </span>
                    <p className="font-serif text-xl sm:text-2xl font-black text-amber-400">
                      <AnimatedCounter value={contestant.voteCount} />
                    </p>
                    <p className="text-xs font-semibold text-zinc-300">
                      {contestant.percentage}% of total share
                    </p>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <button
                    onClick={() => openDetailsModal(contestant)}
                    className="rounded-xl border border-white/10 bg-white/5 py-2.5 text-xs font-bold text-zinc-300 hover:bg-white/10 hover:text-white"
                  >
                    Details
                  </button>
                  <button
                    onClick={() => openVoteModal(contestant)}
                    disabled={!isVotingLive || contestant.status === 'evicted'}
                    className="rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 py-2.5 text-xs font-black text-black uppercase tracking-wider hover:from-amber-300 hover:to-amber-400 active:scale-95 disabled:opacity-40"
                  >
                    Vote
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full Leaderboard Table */}
      <div className="rounded-3xl border border-white/10 bg-[#12141c]/90 overflow-hidden shadow-2xl backdrop-blur-xl">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div>
            <h3 className="font-serif text-lg sm:text-xl font-bold text-white">
              Complete Arena Standings
            </h3>
            <p className="text-xs text-zinc-400">
              Rankings refresh automatically upon each validated vote
            </p>
          </div>
          <span className="text-xs font-semibold text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-full ring-1 ring-amber-500/20">
            {sortedContestants.length} Contestants Tracked
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-black/40 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                <th className="py-3.5 px-4 sm:px-6">Rank</th>
                <th className="py-3.5 px-4 sm:px-6">Contestant</th>
                <th className="py-3.5 px-4 sm:px-6">Status</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Votes</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Share %</th>
                <th className="py-3.5 px-4 sm:px-6 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {sortedContestants.map((c, index) => {
                const rank = index + 1;
                const isTop3 = rank <= 3;
                return (
                  <tr
                    key={c.id}
                    className="transition hover:bg-white/[0.03] group"
                  >
                    {/* Rank */}
                    <td className="py-4 px-4 sm:px-6 font-serif font-black">
                      <div className="flex items-center gap-2">
                        <span
                          className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-black ${
                            rank === 1
                              ? 'bg-amber-400 text-black shadow-md shadow-amber-400/30'
                              : rank === 2
                              ? 'bg-zinc-300 text-black'
                              : rank === 3
                              ? 'bg-amber-700 text-white'
                              : 'bg-white/5 text-zinc-400'
                          }`}
                        >
                          #{rank}
                        </span>
                      </div>
                    </td>

                    {/* Contestant Info */}
                    <td className="py-4 px-4 sm:px-6">
                      <div
                        onClick={() => openDetailsModal(c)}
                        className="flex items-center gap-3 cursor-pointer"
                      >
                        <img
                          src={c.photoUrl}
                          alt={c.name}
                          className="h-10 w-10 sm:h-12 sm:w-12 rounded-full object-cover ring-1 ring-white/10 group-hover:ring-amber-400 transition"
                        />
                        <div>
                          <p className="font-serif font-bold text-white group-hover:text-amber-300 transition">
                            {c.name}
                          </p>
                          <p className="text-xs text-zinc-400">
                            #{c.contestantNumber} • {c.city}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4 sm:px-6">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${
                          c.status === 'nominated'
                            ? 'bg-rose-500/20 text-rose-300 ring-1 ring-rose-500/30'
                            : c.status === 'safe'
                            ? 'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/30'
                            : 'bg-zinc-800 text-zinc-400'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>

                    {/* Votes Count */}
                    <td className="py-4 px-4 sm:px-6 text-right font-serif font-bold text-white">
                      <AnimatedCounter value={c.voteCount} />
                    </td>

                    {/* Vote Share % & Mini Bar */}
                    <td className="py-4 px-4 sm:px-6 text-right">
                      <div className="inline-flex flex-col items-end gap-1">
                        <span className="font-mono font-bold text-amber-400">
                          {c.percentage}%
                        </span>
                        <div className="w-16 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                          <div
                            className="h-full bg-amber-400"
                            style={{ width: `${c.percentage}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Quick Vote Action */}
                    <td className="py-4 px-4 sm:px-6 text-center">
                      <button
                        onClick={() => openVoteModal(c)}
                        disabled={!isVotingLive || c.status === 'evicted'}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500/10 px-3.5 py-1.5 text-xs font-bold text-amber-400 ring-1 ring-amber-500/30 transition hover:bg-amber-500 hover:text-black active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
                      >
                        <Vote className="h-3.5 w-3.5" />
                        <span>Vote</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
