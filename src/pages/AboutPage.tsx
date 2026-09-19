import React from 'react';
import { useShow } from '../context/ShowContext';
import { Info, ShieldCheck, HelpCircle, FileText, Phone, Mail, MapPin, CheckCircle } from 'lucide-react';

export const AboutPage: React.FC = () => {
  const { siteSettings } = useShow();

  const siteName = siteSettings?.siteName || 'STAR HOUSE';
  const about = siteSettings?.aboutContent || {
    showDescription: 'Star House is the nation’s premier 24/7 reality TV show where contestants are locked inside a smart arena under full camera surveillance.',
    votingRules: [
      'Each registered voter receives 5 votes per calendar day.',
      'Votes are tallied using encrypted server-side verification.',
      'Voting lines close at the designated timer expiration.',
      'Bot or automated scripts are strictly prohibited.'
    ],
    votingInstructions: [
      'Create or login to your verified voter profile.',
      'Navigate to the contestants grid.',
      'Click "VOTE NOW" and confirm your vote.',
      'Check your vote count update immediately on the live rankings.'
    ],
    terms: 'All votes are subject to audit by our independent compliance panel. Fraudulent activities will lead to disqualification of vote records.',
    privacyPolicy: 'Your account credentials and vote receipts are encrypted securely. We never sell personal data.'
  };

  const footer = siteSettings?.footerContent;

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
      {/* Page Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-black text-amber-400 uppercase tracking-widest">
          <Info className="h-3.5 w-3.5" />
          <span>ABOUT THE SHOW & VOTING</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
          Show Overview & Official Rules
        </h1>
        <p className="text-sm text-zinc-400 max-w-xl mx-auto">
          Learn how audience power shapes the destiny of housemates inside {siteName}.
        </p>
      </div>

      {/* Show Description Card */}
      <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-[#181a24] to-[#0f1118] p-8 sm:p-10 space-y-4">
        <h2 className="font-serif text-2xl font-bold text-white flex items-center gap-2">
          <FileText className="h-5 w-5 text-amber-400" />
          The Arena Phenomenon
        </h2>
        <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
          {about.showDescription}
        </p>
      </div>

      {/* Grid: Voting Rules & How to Vote */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Voting Rules */}
        <div className="rounded-3xl border border-white/10 bg-[#12141c] p-6 sm:p-8 space-y-4">
          <h3 className="font-serif text-xl font-bold text-white flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-amber-400" />
            Official Voting Rules
          </h3>
          <ul className="space-y-3 text-xs sm:text-sm text-zinc-300">
            {about.votingRules.map((rule, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <CheckCircle className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* How to Vote Instructions */}
        <div className="rounded-3xl border border-white/10 bg-[#12141c] p-6 sm:p-8 space-y-4">
          <h3 className="font-serif text-xl font-bold text-white flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-amber-400" />
            Step-by-Step Voting Guide
          </h3>
          <ol className="space-y-3 text-xs sm:text-sm text-zinc-300 list-decimal list-inside">
            {about.votingInstructions.map((inst, idx) => (
              <li key={idx} className="leading-relaxed">
                <span className="font-semibold text-white">{inst}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* Terms & Privacy */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-white/10 bg-[#0e1017] p-6 space-y-2">
          <h4 className="font-serif text-base font-bold text-white">Terms of Participation</h4>
          <p className="text-xs text-zinc-400 leading-relaxed">{about.terms}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#0e1017] p-6 space-y-2">
          <h4 className="font-serif text-base font-bold text-white">Privacy & Anti-Abuse</h4>
          <p className="text-xs text-zinc-400 leading-relaxed">{about.privacyPolicy}</p>
        </div>
      </div>

      {/* Contact Production */}
      {footer && (
        <div className="rounded-3xl border border-white/10 bg-black/40 p-8 text-center space-y-4">
          <h3 className="font-serif text-xl font-bold text-white">
            Need Help with Voting?
          </h3>
          <p className="text-xs text-zinc-400 max-w-md mx-auto">
            Contact the official StarVoter compliance and audience relations team.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-300 pt-2">
            <span className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-amber-400" />
              {footer.contactEmail}
            </span>
            <span className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-amber-400" />
              {footer.contactPhone}
            </span>
            <span className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-amber-400" />
              {footer.address}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
