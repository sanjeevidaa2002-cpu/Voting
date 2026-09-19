import React from 'react';
import { useShow } from '../context/ShowContext';
import { AnimatedCounter } from './AnimatedCounter';
import {
  X,
  Vote,
  Trophy,
  MapPin,
  Briefcase,
  Calendar,
  Sparkles,
  Flame,
  Award,
  Share2
} from 'lucide-react';

export const ContestantDetailsModal: React.FC = () => {
  const { selectedContestantForDetails, closeDetailsModal, openVoteModal, isVotingLive } = useShow();

  if (!selectedContestantForDetails) return null;

  const contestant = selectedContestantForDetails;
  const isEvicted = contestant.status === 'evicted';
  const canVote = isVotingLive && !isEvicted;

  const handleVoteFromDetails = () => {
    closeDetailsModal();
    openVoteModal(contestant);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl border border-amber-500/30 bg-gradient-to-b from-[#181a24] to-[#0c0d12] shadow-2xl shadow-black/90 p-6 sm:p-8 custom-scrollbar">
        {/* Top Gold Accent */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-600" />

        {/* Close Button */}
        <button
          onClick={closeDetailsModal}
          className="absolute top-4 right-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-zinc-400 backdrop-blur-md transition hover:bg-white/10 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-start">
          {/* Left Column: Portrait Photo & Rank Badge */}
          <div className="md:col-span-5 space-y-4">
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-zinc-900 ring-2 ring-amber-500/30 shadow-xl">
              <img
                src={contestant.photoUrl}
                alt={contestant.name}
                className="h-full w-full object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

              {/* Number Badge */}
              <div className="absolute top-3 left-3 rounded-full bg-black/80 px-3 py-1 text-xs font-black text-amber-400 backdrop-blur-md ring-1 ring-amber-500/40">
                #{contestant.contestantNumber}
              </div>

              {/* Status Badge */}
              <div className="absolute top-3 right-3">
                <span
                  className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider backdrop-blur-md ${
                    contestant.status === 'nominated'
                      ? 'bg-rose-500/90 text-white'
                      : contestant.status === 'safe'
                      ? 'bg-emerald-500/90 text-white'
                      : 'bg-zinc-700 text-zinc-300'
                  }`}
                >
                  {contestant.status}
                </span>
              </div>

              {/* Rank Spotlight */}
              <div className="absolute bottom-3 inset-x-3 flex items-center justify-between rounded-xl bg-black/70 p-2.5 backdrop-blur-md ring-1 ring-white/10">
                <div className="flex items-center gap-2 text-white text-xs font-bold">
                  <Trophy className="h-4 w-4 text-amber-400" />
                  <span>Leaderboard Position</span>
                </div>
                <span className="font-serif text-base font-black text-amber-400">
                  Rank #{contestant.rank || 1}
                </span>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <div className="rounded-xl bg-black/40 p-3 ring-1 ring-white/10">
                <p className="text-[10px] font-bold text-zinc-400 uppercase">Age</p>
                <p className="text-sm font-extrabold text-white mt-0.5">{contestant.age} Years</p>
              </div>
              <div className="rounded-xl bg-black/40 p-3 ring-1 ring-white/10">
                <p className="text-[10px] font-bold text-zinc-400 uppercase">City</p>
                <p className="text-sm font-extrabold text-white mt-0.5">{contestant.city}</p>
              </div>
            </div>
          </div>

          {/* Right Column: Bio, Voting Progress & CTA */}
          <div className="md:col-span-7 space-y-6">
            {/* Header info */}
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-400 ring-1 ring-amber-500/20 mb-2">
                <Sparkles className="h-3 w-3" />
                <span>OFFICIAL ARENA CONTESTANT</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-black text-white">
                {contestant.name}
              </h2>
              <p className="text-sm font-semibold text-amber-400/90 mt-1">
                {contestant.occupation}
              </p>
              {contestant.tagline && (
                <p className="text-xs text-zinc-400 italic mt-1">
                  "{contestant.tagline}"
                </p>
              )}
            </div>

            {/* Biography */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold tracking-wider text-zinc-400 uppercase">
                Housemate Biography
              </h4>
              <p className="text-xs sm:text-sm leading-relaxed text-zinc-300 bg-white/[0.03] p-4 rounded-2xl ring-1 ring-white/5">
                {contestant.description}
              </p>
            </div>

            {/* Voting Share & Statistics Bar */}
            <div className="space-y-3 rounded-2xl border border-white/10 bg-black/50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold tracking-wider text-zinc-400 uppercase">
                    Total Live Votes
                  </span>
                  <div className="font-serif text-2xl font-black text-white">
                    <AnimatedCounter value={contestant.voteCount} />
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] font-bold tracking-wider text-zinc-400 uppercase">
                    Vote Share
                  </span>
                  <div className="font-serif text-2xl font-black text-amber-400">
                    {contestant.percentage}%
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="relative h-3 w-full overflow-hidden rounded-full bg-zinc-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300 transition-all duration-700"
                    style={{ width: `${Math.min(100, Math.max(2, contestant.percentage || 0))}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-zinc-400">
                  <span>Audience Popularity Index</span>
                  <span>Rank #{contestant.rank || 1} of Show</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleVoteFromDetails}
                disabled={!canVote}
                className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-4 text-xs font-black uppercase tracking-wider transition-all shadow-xl ${
                  canVote
                    ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-black hover:scale-[1.02] shadow-amber-500/25 active:scale-95'
                    : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                }`}
              >
                <Vote className="h-4 w-4" />
                <span>{isEvicted ? 'Contestant Evicted' : isVotingLive ? `VOTE FOR ${contestant.name.toUpperCase()}` : 'Voting Closed'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
