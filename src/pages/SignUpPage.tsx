import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useShow } from '../context/ShowContext';
import { User, Mail, Lock, Eye, EyeOff, UserPlus, CheckCircle, AlertCircle, ArrowRight, ShieldCheck, Sparkles, Check, X, Vote } from 'lucide-react';

export const SignUpPage: React.FC = () => {
  const { userSignup, isUserLoggedIn } = useAuth();
  const { setCurrentView, siteSettings } = useShow();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const pendingContestantName = sessionStorage.getItem('starhouse_pending_vote_contestant_name');

  const siteName = siteSettings?.branding?.websiteName || siteSettings?.siteName || 'STAR HOUSE';

  // Password Strength Calculation
  const passwordCriteria = useMemo(() => {
    return {
      minLength: password.length >= 8,
      hasLetter: /[a-zA-Z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[^A-Za-z0-9]/.test(password),
    };
  }, [password]);

  const strengthScore = useMemo(() => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 6) score += 1;
    if (password.length >= 8) score += 1;
    if (passwordCriteria.hasNumber) score += 1;
    if (passwordCriteria.hasSpecial) score += 1;
    return score;
  }, [password, passwordCriteria]);

  const strengthLabel = useMemo(() => {
    if (strengthScore === 0) return { text: 'Empty', color: 'bg-zinc-700', textColor: 'text-zinc-500' };
    if (strengthScore <= 1) return { text: 'Weak', color: 'bg-rose-500', textColor: 'text-rose-400' };
    if (strengthScore === 2) return { text: 'Fair', color: 'bg-amber-500', textColor: 'text-amber-400' };
    if (strengthScore === 3) return { text: 'Good', color: 'bg-blue-500', textColor: 'text-blue-400' };
    return { text: 'Strong', color: 'bg-emerald-500', textColor: 'text-emerald-400' };
  }, [strengthScore]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }
    if (!agreeTerms) {
      setError('Please accept the voting rules and terms to proceed.');
      return;
    }

    try {
      setIsLoading(true);
      await userSignup(fullName.trim(), email.trim(), password);
      setSuccessMessage('Account created successfully! Welcome to Star House.');
      setTimeout(() => {
        setCurrentView('home');
      }, 800);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Email might already be registered.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isUserLoggedIn) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full text-center space-y-6 bg-zinc-900/90 border border-emerald-500/30 rounded-3xl p-8 backdrop-blur-xl shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
            <CheckCircle className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-serif font-black text-white">Your Account Is Active</h2>
            <p className="text-sm text-zinc-400">You are already registered and logged in as a verified voter.</p>
          </div>
          <button
            onClick={() => setCurrentView('home')}
            className="w-full py-3.5 px-6 rounded-xl font-black text-sm uppercase tracking-wider bg-gradient-to-r from-amber-500 to-amber-600 text-black hover:brightness-110 transition shadow-lg shadow-amber-500/20"
          >
            Explore Live Arena
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 sm:py-16 relative">
      {/* Background ambient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[32rem] h-[32rem] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-lg w-full relative z-10">
        {/* Card Container */}
        <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-[#13151f]/95 to-[#0c0d12]/95 backdrop-blur-2xl p-8 sm:p-10 shadow-2xl shadow-black/80 space-y-8">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400 text-xs font-bold tracking-widest uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              Join The Audience
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif font-black tracking-tight text-white">
              Create Your {siteName} Account
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400">
              Register in 30 seconds to lock in official voting receipts, participate in elimination rounds, and receive real-time updates.
            </p>
          </div>

          {/* Pending Vote Notice */}
          {pendingContestantName && (
            <div
              id="signup-pending-vote-alert"
              className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3.5 text-amber-300 animate-fade-in"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/30 mt-0.5">
                <Vote className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <p className="font-bold text-white text-xs sm:text-sm">
                  Create an account to vote for <span className="text-amber-400 font-serif font-black">{pendingContestantName}</span>
                </p>
                <p className="text-xs text-zinc-400">
                  Your new free viewer account will be granted 1 certified vote to confirm right after sign up.
                </p>
              </div>
            </div>
          )}

          {/* Success Banner */}
          {successMessage && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 text-emerald-400 text-sm animate-fade-in">
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-rose-400 text-sm animate-fade-in">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="signup-fullname"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Aarav Sharma"
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-amber-400/80 focus:ring-1 focus:ring-amber-400/80 transition"
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="signup-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-amber-400/80 focus:ring-1 focus:ring-amber-400/80 transition"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider">
                  Password
                </label>
                {password && (
                  <span className={`text-[11px] font-bold ${strengthLabel.textColor}`}>
                    Strength: {strengthLabel.text}
                  </span>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-10 pr-10 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-amber-400/80 focus:ring-1 focus:ring-amber-400/80 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-500 hover:text-zinc-300 transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password Strength Progress Bar */}
              {password && (
                <div className="space-y-1.5 pt-1">
                  <div className="grid grid-cols-4 gap-1.5 h-1.5">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className={`h-full rounded-full transition-all duration-300 ${
                          strengthScore >= step ? strengthLabel.color : 'bg-zinc-800'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-zinc-400 pt-1">
                    <span className="flex items-center gap-1">
                      {passwordCriteria.minLength ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <X className="w-3 h-3 text-zinc-600" />
                      )}
                      8+ chars
                    </span>
                    <span className="flex items-center gap-1">
                      {passwordCriteria.hasNumber ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <X className="w-3 h-3 text-zinc-600" />
                      )}
                      Number
                    </span>
                    <span className="flex items-center gap-1">
                      {passwordCriteria.hasSpecial ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <X className="w-3 h-3 text-zinc-600" />
                      )}
                      Special
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="signup-confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  className={`w-full pl-10 pr-4 py-3 bg-white/5 border rounded-xl text-white placeholder-zinc-500 text-sm focus:outline-none transition ${
                    confirmPassword && confirmPassword !== password
                      ? 'border-rose-500/80 focus:border-rose-500'
                      : 'border-white/10 focus:border-amber-400/80 focus:ring-1 focus:ring-amber-400/80'
                  }`}
                />
              </div>
              {confirmPassword && confirmPassword !== password && (
                <p className="text-[11px] text-rose-400">Passwords do not match.</p>
              )}
            </div>

            {/* Agree Terms Checkbox */}
            <div className="pt-2 flex items-start gap-2.5">
              <input
                id="signup-terms"
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-amber-500 focus:ring-amber-400 focus:ring-offset-zinc-900 cursor-pointer"
              />
              <label htmlFor="signup-terms" className="text-xs text-zinc-400 leading-relaxed cursor-pointer">
                I agree to the official{' '}
                <button
                  type="button"
                  onClick={() => setCurrentView('about')}
                  className="text-amber-400 hover:underline"
                >
                  Voting Rules
                </button>{' '}
                and understand that only 1 verified vote is allowed per nomination cycle.
              </label>
            </div>

            {/* Submit Button */}
            <button
              id="signup-submit"
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-6 rounded-xl font-black text-sm uppercase tracking-wider bg-gradient-to-r from-amber-500 to-amber-600 text-black hover:from-amber-400 hover:to-amber-500 transition shadow-lg shadow-amber-500/20 active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Create Free Account</span>
                </>
              )}
            </button>
          </form>

          {/* Sign In Footer */}
          <div className="pt-4 border-t border-white/10 text-center space-y-4">
            <p className="text-xs text-zinc-400">
              Already have an account?{' '}
              <button
                onClick={() => setCurrentView('login')}
                className="text-amber-400 hover:text-amber-300 font-bold underline underline-offset-4 transition inline-flex items-center gap-1"
              >
                Sign In Here <ArrowRight className="w-3 h-3" />
              </button>
            </p>

            <div className="flex items-center justify-center gap-2 text-[11px] text-zinc-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Certified SSL Encryption & Anti-Fraud Security</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
