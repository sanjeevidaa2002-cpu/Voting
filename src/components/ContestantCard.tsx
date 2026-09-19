import React from 'react';
import { Contestant } from '../types';
import { useShow } from '../context/ShowContext';
import { AnimatedCounter } from './AnimatedCounter';
import { Vote, Info, Trophy, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';

interface ContestantCardProps {
  contestant: Contestant;
  priorityNominated?: boolean;
}

export const ContestantCard: React.FC<ContestantCardProps> = ({ contestant, priorityNominated }) => {
  const { openVoteModal, openDetailsModal, isVotingLive, hasVoted, votedContestantId } = useShow();

  const isEvicted = contestant.status === 'evicted';
  const isNominated = contestant.status === 'nominated';
  const isSafe = contestant.status === 'safe';
  const isTop3 = (contestant.rank || 99) <= 3;
  const isThisContestantVoted = hasVoted && votedContestantId === contestant.id;

  const canVote = isVotingLive && !isEvicted && !hasVoted;

  return (
    <div
      className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border transition-all duration-300 hover:-translate-y-1.5 ${
        isThisContestantVoted
          ? 'border-emerald-500/60 bg-gradient-to-b from-[#18241d] to-[#0f1813] shadow-xl shadow-emerald-500/10 ring-2 ring-emerald-500/30'
          : isNominated
          ? 'border-amber-500/40 bg-gradient-to-b from-[#181a24] to-[#0f1118] shadow-xl shadow-amber-500/5 hover:border-amber-400 hover:shadow-amber-500/20'
          : isEvicted
          ? 'border-white/5 bg-[#121318]/60 opacity-70 grayscale hover:grayscale-0'
          : 'border-white/10 bg-gradient-to-b from-[#151720] to-[#0e1017] hover:border-white/20'
      }`}
    >
      {/* Top Banner Accent for Top Ranks */}
      {isTop3 && !isEvicted && (
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-600 z-10" />
      )}

      {/* Image Container with Badges */}
      <div className="relative aspect-[4/5] sm:aspect-[3/4] w-full overflow-hidden bg-zinc-900">
        <img
          src={contestant.photoUrl}
          alt={contestant.name}
          className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f1118] via-transparent to-black/40" />

        {/* Top Left: Contestant Number Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-black/75 px-3 py-1 text-xs font-black tracking-wider text-amber-400 backdrop-blur-md ring-1 ring-amber-500/30">
          <span>#{contestant.contestantNumber}</span>
        </div>

        {/* Top Right: Status Badge */}
        <div className="absolute top-3 right-3 flex items-center gap-1">
          {isThisContestantVoted && (
            <span className="rounded-full bg-emerald-500 px-2.5 py-0.5 text-[10px] font-black tracking-widest text-black uppercase shadow-md backdrop-blur-md ring-1 ring-emerald-300 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              YOUR VOTE
            </span>
          )}
          {!isThisContestantVoted && isNominated && (
            <span className="rounded-full bg-rose-500/90 px-2.5 py-0.5 text-[10px] font-black tracking-widest text-white uppercase shadow-md backdrop-blur-md ring-1 ring-rose-300/40">
              NOMINATED
            </span>
          )}
          {!isThisContestantVoted && isSafe && (
            <span className="rounded-full bg-emerald-500/80 px-2.5 py-0.5 text-[10px] font-black tracking-widest text-white uppercase backdrop-blur-md">
              SAFE
            </span>
          )}
          {isEvicted && (
            <span className="rounded-full bg-zinc-700 px-2.5 py-0.5 text-[10px] font-black tracking-widest text-zinc-300 uppercase backdrop-blur-md">
              EVICTED
            </span>
          )}
        </div>

        {/* Bottom Floating Rank & Vote Share on Image */}
        <div className="absolute bottom-3 inset-x-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5 rounded-lg bg-black/80 px-2.5 py-1 text-xs font-bold text-white backdrop-blur-md ring-1 ring-white/10">
            <Trophy className={`h-3.5 w-3.5 ${isTop3 ? 'text-amber-400' : 'text-zinc-400'}`} />
            <span>Rank #{contestant.rank || '-'}</span>
          </div>

          <div className="rounded-lg bg-amber-500/20 px-2.5 py-1 text-xs font-extrabold text-amber-300 backdrop-blur-md ring-1 ring-amber-500/40">
            {contestant.percentage !== undefined ? `${contestant.percentage}%` : '0%'}
          </div>
        </div>
      </div>

      {/* Card Info Body */}
      <div className="flex flex-1 flex-col justify-between p-4 sm:p-5 space-y-4">
        {/* Name & Subtitle */}
        <div>
          <h3 className="font-serif text-lg sm:text-xl font-extrabold text-white truncate group-hover:text-amber-300 transition-colors">
            {contestant.name}
          </h3>
          <p className="text-xs text-zinc-400 truncate mt-0.5">
            {contestant.occupation} • {contestant.city}
          </p>
        </div>

        {/* Live Vote Count & Progress Bar */}
        <div className="space-y-1.5 rounded-xl bg-black/40 p-3 ring-1 ring-white/5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
              Votes Received
            </span>
            <span className="font-serif font-black text-amber-400 text-sm">
              <AnimatedCounter value={contestant.voteCount || 0} />
            </span>
          </div>

          {/* Progress bar */}
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300 transition-all duration-700 ease-out"
              style={{ width: `${Math.min(100, Math.max(2, contestant.percentage || 0))}%` }}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={() => openDetailsModal(contestant)}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 py-2.5 px-2 text-xs font-bold text-zinc-200 transition hover:bg-white/10 hover:text-white"
          >
            <Info className="h-3.5 w-3.5 text-zinc-400" />
            <span>Details</span>
          </button>

          <button
            onClick={() => openVoteModal(contestant)}
            disabled={!canVote}
            className={`flex items-center justify-center gap-1.5 rounded-xl py-2.5 px-3 text-xs font-black uppercase tracking-wider transition-all shadow-md ${
              isThisContestantVoted
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 cursor-default'
                : canVote
                ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-black hover:from-amber-300 hover:to-amber-400 shadow-amber-500/20 active:scale-95'
                : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-white/5'
            }`}
          >
            {isThisContestantVoted ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Voted ✓</span>
              </>
            ) : (
              <>
                <Vote className="h-3.5 w-3.5" />
                <span>
                  {isEvicted
                    ? 'Evicted'
                    : hasVoted
                    ? 'Vote Used'
                    : isVotingLive
                    ? 'Vote Now'
                    : 'Closed'}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
