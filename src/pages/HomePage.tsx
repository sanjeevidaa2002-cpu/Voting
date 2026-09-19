import React, { useState } from 'react';
import { useShow } from '../context/ShowContext';
import { HeroBanner } from '../components/HeroBanner';
import { LiveVotingStatus } from '../components/LiveVotingStatus';
import { ContestantCard } from '../components/ContestantCard';
import { LiveRankingSection } from '../components/LiveRankingSection';
import { AdSlotContainer } from '../components/AdSlotContainer';
import {
  Vote,
  Flame,
  Zap,
  Users,
  HelpCircle,
  CheckCircle2,
  Lock,
  ShieldCheck,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { contestants, hasVoted, votedContestantName } = useShow();
  const [filter, setFilter] = useState<'all' | 'nominated' | 'safe'>('all');

  const filteredContestants = contestants.filter((c) => {
    if (filter === 'nominated') return c.status === 'nominated';
    if (filter === 'safe') return c.status === 'safe';
    return true; // all
  });

  const nominatedContestants = contestants.filter(c => c.status === 'nominated');

  return (
    <div className="min-h-screen space-y-10 sm:space-y-14 pb-20">
      {/* 1. Hero Banner Carousel (Images Only inside Code-Shaped Frame) */}
      <HeroBanner />

      {/* Banner / Secondary Ad Placement */}
      <AdSlotContainer location="banner" />

      {/* 2. Live Voting Status Section */}
      <LiveVotingStatus />

      {/* Homepage Top Ad Placement */}
      <AdSlotContainer location="homepage" />

      {/* 3. Contestant List Section: "VOTE FOR YOUR FAVORITE" */}
      <section id="contestants-section" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4 space-y-8">
        {/* Already Voted Prominent Banner */}
        {hasVoted && (
          <div
            id="already-voted-alert"
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
                  Your official certified vote is securely locked into the real-time leaderboard tally.
                </p>
              </div>
            </div>
            <span className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-emerald-300 ring-1 ring-emerald-500/40">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Official Vote Cast</span>
            </span>
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-black text-amber-400 uppercase tracking-widest mb-2">
              <Flame className="h-3.5 w-3.5 text-amber-400" />
              <span>OFFICIAL NOMINATIONS</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-black text-white uppercase tracking-tight">
              VOTE FOR YOUR FAVORITE
            </h2>
            <p className="text-sm sm:text-base text-zinc-400 mt-1">
              Select your favorite housemate to save them from eviction. One verified vote per registered voter.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 rounded-2xl bg-white/[0.04] p-1.5 ring-1 ring-white/10 self-start md:self-auto">
            <button
              id="filter-btn-all"
              onClick={() => setFilter('all')}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                filter === 'all'
                  ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              All ({contestants.length})
            </button>
            <button
              id="filter-btn-nominated"
              onClick={() => setFilter('nominated')}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                filter === 'nominated'
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Nominated ({nominatedContestants.length})
            </button>
            <button
              id="filter-btn-safe"
              onClick={() => setFilter('safe')}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                filter === 'safe'
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Safe
            </button>
          </div>
        </div>

        {/* Responsive Grid: 4 per row desktop, 2-3 per row tablet, 2 per row mobile */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredContestants.map((c) => (
            <ContestantCard key={c.id} contestant={c} priorityNominated={c.status === 'nominated'} />
          ))}
        </div>
      </section>

      {/* Between Content Ad Placement (Between Contestants and Leaderboard) */}
      <AdSlotContainer location="between_content" />

      {/* 4. Live Ranking / Leaderboard Section */}
      <LiveRankingSection />

      {/* Custom Ad Placement */}
      <AdSlotContainer location="custom" />

      {/* 5. How It Works / Verified Voting Flow */}
      <section id="rules-section" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-[#13151f] to-[#0c0d12] p-8 sm:p-12 space-y-10">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <span className="text-xs font-black tracking-widest text-amber-400 uppercase">
              Verified Voting Integrity
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl font-black text-white">
              How Official Voting Works
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400">
              Transparent, tamper-resistant audience voting requiring voter authentication.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-white/5 bg-black/40 p-6 space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/30">
                <Users className="h-6 w-6" />
              </div>
              <h4 className="font-serif text-lg font-bold text-white">
                1. Browse Housemates
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Explore the nominated contestants list, bios, background, and current live rank standings.
              </p>
            </div>

            <div className="rounded-2xl border border-white/5 bg-black/40 p-6 space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/30">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h4 className="font-serif text-lg font-bold text-white">
                2. Authenticate & Select
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Sign in or register a free viewer account. Each registered voter receives one certified ballot.
              </p>
            </div>

            <div className="rounded-2xl border border-white/5 bg-black/40 p-6 space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/30">
                <Zap className="h-6 w-6" />
              </div>
              <h4 className="font-serif text-lg font-bold text-white">
                3. Instant Certified Tally
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Confirm your vote and receive an official cryptographic receipt ID with immediate broadcast update.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Voting FAQ */}
      <section id="faq-section" className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-2">
          <h3 className="font-serif text-2xl sm:text-3xl font-black text-white">
            Frequently Asked Questions
          </h3>
          <p className="text-xs sm:text-sm text-zinc-400">
            Common questions regarding certified public audience voting
          </p>
        </div>

        <div className="space-y-3">
          <div className="rounded-2xl border border-white/10 bg-[#12141c] p-5">
            <h4 className="font-semibold text-white text-sm flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-amber-400" />
              Do I need to sign up or create an account to vote?
            </h4>
            <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
              Yes. To enforce our strict one-person-one-vote rule and protect the integrity of the show, all viewers must register a free account and sign in to cast their vote.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#12141c] p-5">
            <h4 className="font-semibold text-white text-sm flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-amber-400" />
              Can I change my vote after submitting?
            </h4>
            <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
              No. Once confirmed and submitted, your vote is officially certified in the tally and cannot be transferred or retracted.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#12141c] p-5">
            <h4 className="font-semibold text-white text-sm flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-amber-400" />
              When do voting lines officially close?
            </h4>
            <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
              Voting lines close strictly according to the countdown timer displayed at the top of the homepage before the live weekend broadcast.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#12141c] p-5">
            <h4 className="font-semibold text-white text-sm flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-amber-400" />
              Are the live vote counts updated in real-time?
            </h4>
            <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
              Yes. Every vote cast across the web immediately updates the official server database and broadcasts to all viewing screens in real time.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
