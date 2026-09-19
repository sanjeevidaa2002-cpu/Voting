import React from 'react';
import { useShow } from '../context/ShowContext';
import { AnimatedCounter } from './AnimatedCounter';
import { Clock, Radio, Users, CheckCircle2, AlertTriangle, ShieldCheck, Sparkles } from 'lucide-react';

export const LiveVotingStatus: React.FC = () => {
  const { totalVotes, contestants, votingSettings, isVotingLive, timeRemaining } = useShow();

  const activeContestantsCount = contestants.filter(c => c.status !== 'evicted').length;
  const nominatedCount = contestants.filter(c => c.status === 'nominated').length;

  return (
    <section className="relative -mt-8 sm:-mt-12 z-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-[#161822]/90 to-[#0e1017]/95 p-6 sm:p-8 shadow-2xl shadow-black/80 backdrop-blur-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-center">
          {/* Column 1: Live Status Indicator */}
          <div className="flex items-center gap-4 border-b md:border-b-0 md:border-r border-white/10 pb-6 md:pb-0 md:pr-6">
            <div
              className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ring-1 ${
                isVotingLive
                  ? 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/30 shadow-lg shadow-emerald-500/10'
                  : 'bg-rose-500/10 text-rose-400 ring-rose-500/30'
              }`}
            >
              <Radio className={`h-7 w-7 ${isVotingLive ? 'animate-pulse text-emerald-400' : ''}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
                  CURRENT STATUS
                </span>
                <span
                  className={`h-2 w-2 rounded-full ${
                    isVotingLive ? 'bg-emerald-400 animate-ping' : 'bg-rose-500'
                  }`}
                />
              </div>
              <p
                className={`text-xl font-black tracking-wider uppercase ${
                  isVotingLive ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {isVotingLive ? 'LIVE VOTING' : 'VOTING CLOSED'}
              </p>
              <p className="text-xs text-zinc-400 font-medium">
                {isVotingLive
                  ? 'Official verification active'
                  : 'Lines locked by Production'}
              </p>
            </div>
          </div>

          {/* Column 2: Total Votes (Animated Counter) */}
          <div className="flex items-center gap-4 border-b lg:border-b-0 lg:border-r border-white/10 pb-6 lg:pb-0 lg:pr-6">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/30 shadow-lg shadow-amber-500/10">
              <Sparkles className="h-7 w-7 text-amber-400" />
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
                TOTAL VOTES CAST
              </p>
              <p className="font-serif text-2xl sm:text-3xl font-black tracking-tight text-white">
                <AnimatedCounter value={totalVotes} />
              </p>
              <p className="text-xs text-amber-400/90 font-medium">
                Real-time Database Tally
              </p>
            </div>
          </div>

          {/* Column 3: Active Contestants */}
          <div className="flex items-center gap-4 border-b sm:border-b-0 md:border-r border-white/10 pb-6 sm:pb-0 md:pr-6">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/30">
              <Users className="h-7 w-7 text-blue-400" />
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
                CONTESTANTS IN ARENA
              </p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-black text-white">{activeContestantsCount}</p>
                <span className="text-xs font-semibold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full ring-1 ring-rose-500/20">
                  {nominatedCount} Nominated
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                {contestants.length} Total Housemates
              </p>
            </div>
          </div>

          {/* Column 4: Countdown Timer */}
          <div className="flex flex-col justify-center">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-amber-400" />
                {isVotingLive ? 'VOTING ENDS IN' : 'VOTING DEADLINE'}
              </span>
              {votingSettings && (
                <span className="text-[10px] font-semibold text-zinc-400">
                  {votingSettings.endDate} {votingSettings.endTime}
                </span>
              )}
            </div>

            {isVotingLive ? (
              <div className="grid grid-cols-4 gap-1.5 text-center">
                <div className="rounded-xl bg-black/50 p-2 ring-1 ring-white/10">
                  <span className="block text-lg font-black text-amber-400 leading-none">
                    {String(timeRemaining.days).padStart(2, '0')}
                  </span>
                  <span className="text-[9px] font-bold tracking-wider text-zinc-400 uppercase">
                    Days
                  </span>
                </div>
                <div className="rounded-xl bg-black/50 p-2 ring-1 ring-white/10">
                  <span className="block text-lg font-black text-amber-400 leading-none">
                    {String(timeRemaining.hours).padStart(2, '0')}
                  </span>
                  <span className="text-[9px] font-bold tracking-wider text-zinc-400 uppercase">
                    Hours
                  </span>
                </div>
                <div className="rounded-xl bg-black/50 p-2 ring-1 ring-white/10">
                  <span className="block text-lg font-black text-amber-400 leading-none">
                    {String(timeRemaining.minutes).padStart(2, '0')}
                  </span>
                  <span className="text-[9px] font-bold tracking-wider text-zinc-400 uppercase">
                    Mins
                  </span>
                </div>
                <div className="rounded-xl bg-black/50 p-2 ring-1 ring-white/10">
                  <span className="block text-lg font-black text-amber-400 leading-none">
                    {String(timeRemaining.seconds).padStart(2, '0')}
                  </span>
                  <span className="text-[9px] font-bold tracking-wider text-zinc-400 uppercase">
                    Secs
                  </span>
                </div>
              </div>
            ) : (
              <div className="rounded-xl bg-rose-500/10 p-3 ring-1 ring-rose-500/30 text-center">
                <span className="text-xs font-bold text-rose-300">
                  {votingSettings?.votingClosedMessage || 'Voting is currently closed for this round'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
