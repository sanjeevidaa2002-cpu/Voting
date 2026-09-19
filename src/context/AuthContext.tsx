import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { RegisteredUser } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  // Admin auth
  isAdmin: boolean;
  adminUsername: string | null;
  isAdminLoading: boolean;
  adminLogin: (username: string, pass: string) => Promise<void>;
  adminLogout: () => Promise<void>;
  verifyAdminSession: () => Promise<boolean>;

  // User auth
  currentUser: RegisteredUser | null;
  isUserLoggedIn: boolean;
  isUserLoading: boolean;
  userLogin: (email: string, pass: string) => Promise<void>;
  userSignup: (name: string, email: string, pass: string) => Promise<void>;
  userLogout: () => Promise<void>;
  resetPassword: (email: string, newPass: string) => Promise<{ success: boolean; message: string }>;
  refreshUserProfile: () => Promise<void>;
  userProfileModalOpen: boolean;
  setUserProfileModalOpen: (open: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Admin State
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [adminUsername, setAdminUsername] = useState<string | null>(null);
  const [isAdminLoading, setIsAdminLoading] = useState<boolean>(true);

  // User State
  const [currentUser, setCurrentUser] = useState<RegisteredUser | null>(null);
  const [isUserLoading, setIsUserLoading] = useState<boolean>(true);
  const [userProfileModalOpen, setUserProfileModalOpen] = useState<boolean>(false);

  // 1. Verify Admin Session on mount
  const verifyAdminSession = async (): Promise<boolean> => {
    const token = localStorage.getItem('starhouse_admin_token');
    if (!token) {
      setIsAdmin(false);
      setAdminUsername(null);
      setIsAdminLoading(false);
      return false;
    }

    try {
      const data = await api.verifyAdminSession();
      if (data.authenticated) {
        setIsAdmin(true);
        setAdminUsername(data.username || 'admin');
        setIsAdminLoading(false);
        return true;
      }
    } catch (err) {
      localStorage.removeItem('starhouse_admin_token');
      setIsAdmin(false);
      setAdminUsername(null);
    } finally {
      setIsAdminLoading(false);
    }
    return false;
  };

  // 2. Load User Profile on mount
  const refreshUserProfile = async () => {
    const token = localStorage.getItem('starhouse_user_token');
    if (!token) {
      setCurrentUser(null);
      setIsUserLoading(false);
      return;
    }

    try {
      const { user } = await api.getUserProfile();
      setCurrentUser(user);
      if (user && user.role === 'admin') {
        setIsAdmin(true);
        setAdminUsername(user.fullName || user.email);
        localStorage.setItem('starhouse_admin_token', token);
      }
    } catch (err) {
      localStorage.removeItem('starhouse_user_token');
      setCurrentUser(null);
    } finally {
      setIsUserLoading(false);
    }
  };

  useEffect(() => {
    verifyAdminSession();
    refreshUserProfile();
  }, []);

  // Admin Methods
  const adminLogin = async (username: string, pass: string) => {
    const data = await api.adminLogin(username, pass);
    if (data.token) {
      localStorage.setItem('starhouse_admin_token', data.token);
      setIsAdmin(true);
      setAdminUsername(data.admin.username);
    }
  };

  const adminLogout = async () => {
    try {
      await api.adminLogout();
    } catch (e) {
      // ignore
    } finally {
      localStorage.removeItem('starhouse_admin_token');
      setIsAdmin(false);
      setAdminUsername(null);
    }
  };

  // User Methods
  const userLogin = async (email: string, pass: string) => {
    const data = await api.userLogin(email, pass);
    if (data.token && data.user) {
      localStorage.setItem('starhouse_user_token', data.token);
      setCurrentUser(data.user);

      // Check if user has administrator privileges
      if (data.user.role === 'admin') {
        localStorage.setItem('starhouse_admin_token', data.token);
        setIsAdmin(true);
        setAdminUsername(data.user.fullName || data.user.email);
      }

      // Sync voting session if user had voted
      if (data.user.votedContestantId) {
        localStorage.setItem('starhouse_has_voted', 'true');
        localStorage.setItem('starhouse_voted_contestant_id', data.user.votedContestantId);
        if (data.user.votedContestantName) {
          localStorage.setItem('starhouse_voted_contestant_name', data.user.votedContestantName);
        }
      }
    }
  };

  const userSignup = async (name: string, email: string, pass: string) => {
    const data = await api.userSignup(name, email, pass);
    if (data.token && data.user) {
      localStorage.setItem('starhouse_user_token', data.token);
      setCurrentUser(data.user);
      if (data.user.role === 'admin') {
        localStorage.setItem('starhouse_admin_token', data.token);
        setIsAdmin(true);
        setAdminUsername(data.user.fullName || data.user.email);
      }
    }
  };

  const userLogout = async () => {
    try {
      await api.userLogout();
    } catch (e) {
      // ignore
    } finally {
      localStorage.removeItem('starhouse_user_token');
      localStorage.removeItem('starhouse_admin_token');
      setCurrentUser(null);
      setIsAdmin(false);
      setAdminUsername(null);
    }
  };

  const resetPassword = async (email: string, newPass: string) => {
    return await api.resetPassword(email, newPass);
  };

  return (
    <AuthContext.Provider
      value={{
        isAdmin,
        adminUsername,
        isAdminLoading,
        adminLogin,
        adminLogout,
        verifyAdminSession,
        currentUser,
        isUserLoggedIn: Boolean(currentUser),
        isUserLoading,
        userLogin,
        userSignup,
        userLogout,
        resetPassword,
        refreshUserProfile,
        userProfileModalOpen,
        setUserProfileModalOpen,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
