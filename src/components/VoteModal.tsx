import React, { useState } from 'react';
import { useShow } from '../context/ShowContext';
import { AnimatedCounter } from './AnimatedCounter';
import confetti from 'canvas-confetti';
import {
  X,
  Vote,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ShieldCheck,
  Flame
} from 'lucide-react';

export const VoteModal: React.FC = () => {
  const { selectedContestantForVote, closeVoteModal, submitVote } = useShow();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<{
    message: string;
    voteId: string;
    timestamp: string;
    newCount: number;
  } | null>(null);

  if (!selectedContestantForVote) return null;

  const contestant = selectedContestantForVote;

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#fbbf24', '#ffffff', '#ef4444'],
      });
    } catch (e) {
      // ignore
    }
  };

  const handleConfirmVote = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await submitVote(contestant.id);
      if (res.success) {
        setSuccessResult({
          message: res.message,
          voteId: res.voteId,
          timestamp: new Date().toLocaleTimeString(),
          newCount: (contestant.voteCount || 0) + 1,
        });
        triggerConfetti();
      }
    } catch (err: any) {
      setError(err.message || 'Unable to submit vote right now. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setError(null);
    setSuccessResult(null);
    closeVoteModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        id="vote-confirmation-modal"
        className="relative w-full max-w-md overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-b from-[#181a24] to-[#0c0d12] shadow-2xl shadow-black/90 p-6 sm:p-8"
      >
        {/* Decorative Top Flare */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-600" />

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-zinc-400 transition hover:bg-white/10 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        {!successResult ? (
          /* Confirmation State */
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/30">
                <Vote className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-serif text-xl sm:text-2xl font-black text-white">
                  Confirm Your Vote
                </h3>
                <p className="text-xs text-zinc-400">
                  Official Certified Viewer Ballot
                </p>
              </div>
            </div>

            {/* Contestant Summary Preview */}
            <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-black/40 p-4">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-zinc-800 ring-1 ring-amber-500/30">
                <img
                  src={contestant.photoUrl}
                  alt={contestant.name}
                  className="h-full w-full object-cover object-top"
                />
                <span className="absolute bottom-1 right-1 rounded bg-black/80 px-1 text-[10px] font-black text-amber-400">
                  #{contestant.contestantNumber}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                    Rank #{contestant.rank || 1}
                  </span>
                  <span className="text-xs text-zinc-400">
                    {contestant.percentage}% Share
                  </span>
                </div>
                <h4 className="font-serif text-lg font-bold text-white truncate mt-1">
                  {contestant.name}
                </h4>
                <p className="text-xs text-zinc-400 truncate">
                  {contestant.occupation}
                </p>
              </div>
            </div>

            {/* Confirmation Question */}
            <div className="rounded-xl bg-amber-500/10 p-4 border border-amber-500/20 text-center space-y-1">
              <p className="text-base font-bold text-white">
                Are you sure you want to cast your vote for {contestant.name}?
              </p>
              <p className="text-xs font-semibold text-amber-400">
                Your vote is final and can only be submitted once.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 p-3 text-xs font-semibold text-rose-300">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                id="cancel-vote-btn"
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="rounded-xl border border-white/10 bg-white/5 py-3 text-xs font-bold text-zinc-300 transition hover:bg-white/10 hover:text-white"
              >
                CANCEL
              </button>

              <button
                id="confirm-vote-btn"
                type="button"
                onClick={handleConfirmVote}
                disabled={isSubmitting}
                className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 py-3 text-xs font-black tracking-wider text-black uppercase shadow-lg shadow-amber-500/20 transition hover:from-amber-300 hover:to-amber-400 active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
                    Submitting Vote...
                  </span>
                ) : (
                  <>
                    <Vote className="h-4 w-4" />
                    <span>CONFIRM VOTE</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Success State */
          <div className="py-4 text-center space-y-6 animate-in zoom-in-95 duration-300">
            {/* Success Icon */}
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 ring-4 ring-emerald-500/20">
              <CheckCircle2 className="h-10 w-10" />
            </div>

            <div className="space-y-1.5">
              <h3 className="font-serif text-2xl sm:text-3xl font-extrabold text-white">
                Vote Submitted Successfully!
              </h3>
              <p className="text-sm font-semibold text-amber-400">
                You have already used your vote.
              </p>
              <p className="text-xs text-zinc-400">
                Your vote for #{contestant.contestantNumber} {contestant.name} is securely recorded in the official tally.
              </p>
            </div>

            {/* Live Vote Counter Bump */}
            <div className="rounded-2xl border border-white/10 bg-black/50 p-4 text-center space-y-1">
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                Updated Total Votes for {contestant.name}
              </span>
              <div className="font-serif text-3xl font-black text-amber-400">
                <AnimatedCounter value={successResult.newCount} />
              </div>
            </div>

            {/* Audit Proof Stamp */}
            <div className="flex items-center justify-between rounded-xl bg-white/[0.03] px-4 py-2.5 text-xs text-zinc-400 ring-1 ring-white/5">
              <span>Receipt ID: <code className="text-amber-400 font-mono">{successResult.voteId}</code></span>
              <span>Time: {successResult.timestamp}</span>
            </div>

            <button
              id="continue-voting-btn"
              onClick={handleClose}
              className="w-full rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 py-3.5 text-xs font-black tracking-wider text-black uppercase shadow-lg shadow-amber-500/20 hover:from-amber-300 hover:to-amber-400 transition"
            >
              Back to Contestants
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
