import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Contestant, Banner, VotingSettings, SiteSettings, AppStateData } from '../types';
import { api } from '../services/api';
import { useAuth } from './AuthContext';
import { applyThemeToDocument } from '../utils/themeUtils';

export type AppView = 'home' | 'contestants' | 'ranking' | 'results' | 'about' | 'login' | 'signup' | 'admin-login' | 'admin';

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
  totalSeconds: number;
}

interface ShowContextType {
  contestants: Contestant[];
  votingSettings: VotingSettings | null;
  banners: Banner[];
  siteSettings: SiteSettings | null;
  totalVotes: number;
  totalUsers: number;
  isLoading: boolean;
  isVotingLive: boolean;
  timeRemaining: TimeRemaining;
  hasVoted: boolean;
  votedContestantId: string | null;
  votedContestantName: string | null;
  voterToken: string;
  selectedContestantForVote: Contestant | null;
  selectedContestantForDetails: Contestant | null;
  currentView: AppView;
  openVoteModal: (c: Contestant) => void;
  closeVoteModal: () => void;
  openDetailsModal: (c: Contestant) => void;
  closeDetailsModal: () => void;
  setCurrentView: (view: AppView) => void;
  submitVote: (contestantId: string) => Promise<{ success: boolean; message: string; voteId: string }>;
  fetchState: () => Promise<void>;
  checkVoterSession: () => Promise<void>;
  lastCelebration: { contestantName: string; contestantNumber: string; voteId: string } | null;
  clearLastCelebration: () => void;
  isLeaderboardVisible: boolean;
  setIsLeaderboardVisible: (visible: boolean) => void;
  toggleLeaderboard: () => void;
}

const ShowContext = createContext<ShowContextType | undefined>(undefined);

export const ShowProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isUserLoggedIn, currentUser, refreshUserProfile } = useAuth();

  const [contestants, setContestants] = useState<Contestant[]>([]);
  const [votingSettings, setVotingSettings] = useState<VotingSettings | null>(null);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [totalVotes, setTotalVotes] = useState<number>(0);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Voter session tracking
  const [voterToken, setVoterToken] = useState<string>(() => {
    return localStorage.getItem('starhouse_voter_token') || '';
  });
  const [hasVoted, setHasVoted] = useState<boolean>(() => {
    return localStorage.getItem('starhouse_has_voted') === 'true';
  });
  const [votedContestantId, setVotedContestantId] = useState<string | null>(() => {
    return localStorage.getItem('starhouse_voted_contestant_id') || null;
  });
  const [votedContestantName, setVotedContestantName] = useState<string | null>(() => {
    return localStorage.getItem('starhouse_voted_contestant_name') || null;
  });

  // Sync voting status with authenticated user profile
  useEffect(() => {
    if (isUserLoggedIn && currentUser) {
      if (currentUser.votedContestantId) {
        setHasVoted(true);
        setVotedContestantId(currentUser.votedContestantId);
        setVotedContestantName(currentUser.votedContestantName || null);
        localStorage.setItem('starhouse_has_voted', 'true');
        localStorage.setItem('starhouse_voted_contestant_id', currentUser.votedContestantId);
        if (currentUser.votedContestantName) {
          localStorage.setItem('starhouse_voted_contestant_name', currentUser.votedContestantName);
        }
      } else {
        setHasVoted(false);
        setVotedContestantId(null);
        setVotedContestantName(null);
        localStorage.removeItem('starhouse_has_voted');
        localStorage.removeItem('starhouse_voted_contestant_id');
        localStorage.removeItem('starhouse_voted_contestant_name');
      }
    } else if (!isUserLoggedIn) {
      setHasVoted(false);
      setVotedContestantId(null);
      setVotedContestantName(null);
      localStorage.removeItem('starhouse_has_voted');
      localStorage.removeItem('starhouse_voted_contestant_id');
      localStorage.removeItem('starhouse_voted_contestant_name');
    }
  }, [isUserLoggedIn, currentUser]);

  // Return to voting: If visitor had clicked "Vote Now" before login, auto-select that contestant once authenticated
  useEffect(() => {
    if (isUserLoggedIn && currentUser && !currentUser.votedContestantId && !hasVoted) {
      const pendingContestantId = sessionStorage.getItem('starhouse_pending_vote_contestant_id');
      if (pendingContestantId && contestants.length > 0) {
        const found = contestants.find(c => c.id === pendingContestantId);
        if (found && found.status !== 'evicted') {
          setSelectedContestantForVote(found);
        }
        sessionStorage.removeItem('starhouse_pending_vote_contestant_id');
        sessionStorage.removeItem('starhouse_pending_vote_contestant_name');
      }
    }
  }, [isUserLoggedIn, currentUser, contestants, hasVoted]);

  const [selectedContestantForVote, setSelectedContestantForVote] = useState<Contestant | null>(null);
  const [selectedContestantForDetails, setSelectedContestantForDetails] = useState<Contestant | null>(null);
  const [isLeaderboardVisible, setIsLeaderboardVisible] = useState<boolean>(() => {
    const saved = localStorage.getItem('starhouse_leaderboard_visible');
    return saved !== null ? saved === 'true' : true;
  });

  const toggleLeaderboard = useCallback(() => {
    setIsLeaderboardVisible((prev) => {
      const next = !prev;
      localStorage.setItem('starhouse_leaderboard_visible', String(next));
      return next;
    });
  }, []);

  // Parse hash route or default to home
  const [currentView, setCurrentViewInternal] = useState<AppView>(() => {
    const hash = window.location.hash.replace('#/', '').replace('#', '');
    if (['home', 'contestants', 'ranking', 'results', 'about', 'login', 'signup', 'admin-login', 'admin'].includes(hash)) {
      return hash as AppView;
    }
    return 'home';
  });

  const setCurrentView = (view: AppView) => {
    setCurrentViewInternal(view);
    window.location.hash = `#/${view}`;
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#/', '').replace('#', '');
      if (['home', 'contestants', 'ranking', 'results', 'about', 'login', 'signup', 'admin-login', 'admin'].includes(hash)) {
        setCurrentViewInternal(hash as AppView);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const [lastCelebration, setLastCelebration] = useState<{ contestantName: string; contestantNumber: string; voteId: string } | null>(null);

  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
    totalSeconds: 0,
  });

  const applyStateData = (data: AppStateData) => {
    setContestants(data.contestants || []);
    setVotingSettings(data.votingSettings || null);
    setBanners(data.banners || []);
    setSiteSettings(data.siteSettings || null);
    setTotalVotes(data.totalVotes || 0);
    setTotalUsers(data.totalUsers || 0);

    // Apply dynamic CSS variables for theme customization across whole application
    if (data.siteSettings?.theme) {
       applyThemeToDocument(data.siteSettings.theme);
    }

    // Update browser title if configured
    if (data.siteSettings?.branding?.browserTitle) {
      document.title = data.siteSettings.branding.browserTitle;
    }
  };

  const checkVoterSession = useCallback(async () => {
    try {
      const existingToken = localStorage.getItem('starhouse_voter_token') || undefined;
      const session = await api.getVoterSession(existingToken);
      if (session.voterToken) {
        setVoterToken(session.voterToken);
        localStorage.setItem('starhouse_voter_token', session.voterToken);
      }
      if (session.hasVoted) {
        setHasVoted(true);
        localStorage.setItem('starhouse_has_voted', 'true');
        if (session.votedContestantId) {
          setVotedContestantId(session.votedContestantId);
          localStorage.setItem('starhouse_voted_contestant_id', session.votedContestantId);
        }
        if (session.votedContestantName) {
          setVotedContestantName(session.votedContestantName);
          localStorage.setItem('starhouse_voted_contestant_name', session.votedContestantName);
        }
      }
    } catch (err) {
      console.warn('Voter session check:', err);
    }
  }, []);

  const fetchState = useCallback(async () => {
    try {
      const data = await api.getState();
      applyStateData(data);
    } catch (err) {
      console.error('Failed to load show state:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load and SSE real-time listener
  useEffect(() => {
    fetchState();
    checkVoterSession();
    const unsubscribe = api.subscribeToEvents((updatedState) => {
      applyStateData(updatedState);
    });
    return () => unsubscribe();
  }, [fetchState, checkVoterSession]);

  // Calculate countdown
  useEffect(() => {
    const updateCountdown = () => {
      if (!votingSettings) return;

      const { endDate, endTime, isVotingActive } = votingSettings;
      if (!isVotingActive || !endDate || !endTime) {
        setTimeRemaining({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isExpired: true,
          totalSeconds: 0,
        });
        return;
      }

      const target = new Date(`${endDate}T${endTime}:00`).getTime();
      const now = Date.now();
      const diff = target - now;

      if (diff <= 0) {
        setTimeRemaining({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isExpired: true,
          totalSeconds: 0,
        });
      } else {
        const totalSeconds = Math.floor(diff / 1000);
        const days = Math.floor(totalSeconds / (3600 * 24));
        const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        setTimeRemaining({
          days,
          hours,
          minutes,
          seconds,
          isExpired: false,
          totalSeconds,
        });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [votingSettings]);

  const isVotingLive = Boolean(
    votingSettings?.isVotingActive && !timeRemaining.isExpired
  );

  const openVoteModal = (c: Contestant) => {
    if (!isUserLoggedIn) {
      sessionStorage.setItem('starhouse_pending_vote_contestant_id', c.id);
      sessionStorage.setItem('starhouse_pending_vote_contestant_name', c.name);
      setCurrentView('login');
      return;
    }
    setSelectedContestantForVote(c);
  };

  const closeVoteModal = () => {
    setSelectedContestantForVote(null);
  };

  const openDetailsModal = (c: Contestant) => {
    setSelectedContestantForDetails(c);
  };

  const closeDetailsModal = () => {
    setSelectedContestantForDetails(null);
  };

  const submitVote = async (contestantId: string) => {
    try {
      const result = await api.submitVote(contestantId, voterToken);
      if (result.success) {
        setHasVoted(true);
        setVotedContestantId(contestantId);
        setVotedContestantName(result.contestant.name);
        localStorage.setItem('starhouse_has_voted', 'true');
        localStorage.setItem('starhouse_voted_contestant_id', contestantId);
        localStorage.setItem('starhouse_voted_contestant_name', result.contestant.name);
        sessionStorage.removeItem('starhouse_pending_vote_contestant_id');
        sessionStorage.removeItem('starhouse_pending_vote_contestant_name');
        await fetchState();
        try {
          await refreshUserProfile();
        } catch {
          // ignore
        }
        setLastCelebration({
          contestantName: result.contestant.name,
          contestantNumber: result.contestant.contestantNumber,
          voteId: result.voteId,
        });
      }
      return result;
    } catch (err: any) {
      if (err.requireLogin || err.status === 401) {
        closeVoteModal();
        setCurrentView('login');
      }
      if (err.alreadyVoted) {
        setHasVoted(true);
        localStorage.setItem('starhouse_has_voted', 'true');
        if (err.votedContestantId) {
          setVotedContestantId(err.votedContestantId);
          localStorage.setItem('starhouse_voted_contestant_id', err.votedContestantId);
        }
        if (err.votedContestantName) {
          setVotedContestantName(err.votedContestantName);
          localStorage.setItem('starhouse_voted_contestant_name', err.votedContestantName);
        }
      }
      throw err;
    }
  };

  const clearLastCelebration = () => {
    setLastCelebration(null);
  };

  return (
    <ShowContext.Provider
      value={{
        contestants,
        votingSettings,
        banners,
        siteSettings,
        totalVotes,
        totalUsers,
        isLoading,
        isVotingLive,
        timeRemaining,
        hasVoted,
        votedContestantId,
        votedContestantName,
        voterToken,
        selectedContestantForVote,
        selectedContestantForDetails,
        currentView,
        openVoteModal,
        closeVoteModal,
        openDetailsModal,
        closeDetailsModal,
        setCurrentView,
        submitVote,
        fetchState,
        checkVoterSession,
        lastCelebration,
        clearLastCelebration,
        isLeaderboardVisible,
        setIsLeaderboardVisible,
        toggleLeaderboard,
      }}
    >
      {children}
    </ShowContext.Provider>
  );
};

export const useShow = () => {
  const context = useContext(ShowContext);
  if (!context) {
    throw new Error('useShow must be used within a ShowProvider');
  }
  return context;
};
