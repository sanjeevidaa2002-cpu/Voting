import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useShow } from '../context/ShowContext';
import { Contestant } from '../types';
import { X, User, Mail, Calendar, CheckCircle2, Award, ShieldCheck, LogOut } from 'lucide-react';

export const UserProfileModal: React.FC = () => {
  const { currentUser, isUserLoggedIn, userLogout, userProfileModalOpen, setUserProfileModalOpen } = useAuth();
  const { contestants, setCurrentView } = useShow();

  if (!userProfileModalOpen || !isUserLoggedIn || !currentUser) return null;

  const votedContestant: Contestant | undefined = currentUser.votedContestantId
    ? contestants.find(c => c.id === currentUser.votedContestantId)
    : undefined;

  const handleLogout = async () => {
    await userLogout();
    setUserProfileModalOpen(false);
    setCurrentView('home');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="max-w-lg w-full rounded-3xl bg-[#11131c] border border-white/15 p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Decorative Top Gradient */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-500 via-amber-300 to-amber-600" />

        {/* Close Button */}
        <button
          onClick={() => setUserProfileModalOpen(false)}
          className="absolute top-5 right-5 p-2 rounded-xl text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* User Card Header */}
        <div className="flex items-center gap-4">
          <img
            src={currentUser.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.email}`}
            alt={currentUser.fullName}
            className="w-16 h-16 rounded-2xl border-2 border-amber-500/40 bg-zinc-900 object-cover"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-serif font-black text-white">{currentUser.fullName}</h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                Verified Voter
              </span>
            </div>
            <p className="text-xs text-zinc-400 flex items-center gap-1.5 mt-0.5">
              <Mail className="w-3.5 h-3.5" /> {currentUser.email}
            </p>
            <p className="text-[11px] text-zinc-500 flex items-center gap-1 mt-1">
              <Calendar className="w-3 h-3" /> Member since {new Date(currentUser.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Official Voting Receipt Card */}
        <div className="p-5 rounded-2xl bg-zinc-900/90 border border-amber-500/30 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
              <Award className="w-4 h-4" /> Official Voting Receipt
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
              Season 9
            </span>
          </div>

          {currentUser.votedContestantId ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                {votedContestant?.photoUrl ? (
                  <img
                    src={votedContestant.photoUrl}
                    alt={votedContestant.name}
                    className="w-12 h-12 rounded-xl object-cover border border-amber-500/40"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 font-black">
                    #{votedContestant?.contestantNumber || '01'}
                  </div>
                )}
                <div>
                  <div className="text-[11px] text-zinc-400 uppercase tracking-wider font-bold">Voted Contestant</div>
                  <div className="text-sm font-bold text-white">
                    {currentUser.votedContestantName || votedContestant?.name || 'Nominee'}
                  </div>
                  {votedContestant && (
                    <div className="text-[11px] text-amber-400 font-mono">
                      Contestant #{votedContestant.contestantNumber}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                  <div className="text-[10px] text-zinc-400 uppercase">Ballot Status</div>
                  <div className="font-bold text-emerald-400 flex items-center gap-1 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Certified & Counted
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                  <div className="text-[10px] text-zinc-400 uppercase">Timestamp</div>
                  <div className="font-bold text-zinc-200 mt-0.5 text-[11px]">
                    {currentUser.votedAt ? new Date(currentUser.votedAt).toLocaleString() : 'Recent'}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 space-y-2">
              <p className="text-xs text-zinc-400">
                You have not cast your ballot for the active elimination round yet.
              </p>
              <button
                onClick={() => {
                  setUserProfileModalOpen(false);
                  setCurrentView('contestants');
                }}
                className="px-4 py-2 rounded-xl bg-amber-500 text-black font-black text-xs uppercase tracking-wider hover:bg-amber-400 transition"
              >
                Browse Contestants & Vote
              </button>
            </div>
          )}
        </div>

        {/* Security & Sign Out Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
          <div className="flex items-center gap-1.5 text-zinc-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Audited cryptographic passport</span>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 font-bold transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
