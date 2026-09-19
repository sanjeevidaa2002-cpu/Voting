import React, { useState } from 'react';
import { GoogleServicesSettings, SiteSettings } from '../../types';
import { api } from '../../services/api';
import { Globe, Save, CheckCircle, ShieldCheck, ExternalLink } from 'lucide-react';

interface GoogleServicesTabProps {
  siteSettings: SiteSettings | null;
  onRefresh: () => Promise<void>;
  onShowNotification: (msg: string, type?: 'success' | 'error') => void;
}

export const GoogleServicesTab: React.FC<GoogleServicesTabProps> = ({
  siteSettings,
  onRefresh,
  onShowNotification,
}) => {
  const [google, setGoogle] = useState<GoogleServicesSettings>(() => {
    return (
      siteSettings?.googleServices || {
        googleAnalytics: {
          enabled: false,
          measurementId: '',
        },
        googleAdSense: {
          enabled: false,
          publisherId: '',
          slotId: '',
        },
        googleSearchConsole: {
          enabled: false,
          verificationCode: '',
        },
        googleTagManager: {
          enabled: false,
          containerId: '',
        },
      }
    );
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      await api.updateGoogleServicesSettings(google);
      onShowNotification('Google Integrations updated and applied!');
      await onRefresh();
    } catch (err: any) {
      onShowNotification(err.message || 'Failed to save Google services', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-8">
      {/* Header */}
      <div className="bg-zinc-900/60 p-6 rounded-3xl border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-black text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-amber-400" />
            Google Services & Webmaster Integrations
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Configure Google Analytics, Google AdSense, Search Console verification, and Google Tag Manager.
          </p>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="py-3 px-6 rounded-xl font-black text-xs uppercase tracking-wider bg-gradient-to-r from-amber-500 to-amber-600 text-black hover:from-amber-400 hover:to-amber-500 transition shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving...' : 'Save Google Integrations'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Google Analytics 4 */}
        <div className="p-6 rounded-3xl bg-zinc-900/40 border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Google Analytics (GA4)
            </h3>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={google.googleAnalytics.enabled}
                onChange={(e) =>
                  setGoogle({
                    ...google,
                    googleAnalytics: { ...google.googleAnalytics, enabled: e.target.checked },
                  })
                }
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-zinc-400 font-bold block mb-1">
                Measurement ID (e.g. G-XXXXXXXXXX)
              </label>
              <input
                type="text"
                value={google.googleAnalytics.measurementId}
                onChange={(e) =>
                  setGoogle({
                    ...google,
                    googleAnalytics: { ...google.googleAnalytics, measurementId: e.target.value },
                  })
                }
                placeholder="G-ABC123XYZ"
                className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>
            <p className="text-[11px] text-zinc-500">
              Tracks real-time visitor traffic, bounce rates, and voting conversion flow.
            </p>
          </div>
        </div>

        {/* Google AdSense */}
        <div className="p-6 rounded-3xl bg-zinc-900/40 border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Google AdSense
            </h3>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={google.googleAdSense.enabled}
                onChange={(e) =>
                  setGoogle({
                    ...google,
                    googleAdSense: { ...google.googleAdSense, enabled: e.target.checked },
                  })
                }
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-zinc-400 font-bold block mb-1">
                AdSense Publisher ID
              </label>
              <input
                type="text"
                value={google.googleAdSense.publisherId}
                onChange={(e) =>
                  setGoogle({
                    ...google,
                    googleAdSense: { ...google.googleAdSense, publisherId: e.target.value },
                  })
                }
                placeholder="ca-pub-1234567890123456"
                className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-400 font-bold block mb-1">
                Ad Slot ID
              </label>
              <input
                type="text"
                value={google.googleAdSense.slotId}
                onChange={(e) =>
                  setGoogle({
                    ...google,
                    googleAdSense: { ...google.googleAdSense, slotId: e.target.value },
                  })
                }
                placeholder="1234567890"
                className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Google Search Console */}
        <div className="p-6 rounded-3xl bg-zinc-900/40 border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Google Search Console
            </h3>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={google.googleSearchConsole.enabled}
                onChange={(e) =>
                  setGoogle({
                    ...google,
                    googleSearchConsole: { ...google.googleSearchConsole, enabled: e.target.checked },
                  })
                }
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-zinc-400 font-bold block mb-1">
                Site Verification Meta Tag / Token
              </label>
              <input
                type="text"
                value={google.googleSearchConsole.verificationCode}
                onChange={(e) =>
                  setGoogle({
                    ...google,
                    googleSearchConsole: { ...google.googleSearchConsole, verificationCode: e.target.value },
                  })
                }
                placeholder="google-site-verification=xxxxxxxx"
                className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Google Tag Manager */}
        <div className="p-6 rounded-3xl bg-zinc-900/40 border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Google Tag Manager (GTM)
            </h3>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={google.googleTagManager.enabled}
                onChange={(e) =>
                  setGoogle({
                    ...google,
                    googleTagManager: { ...google.googleTagManager, enabled: e.target.checked },
                  })
                }
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-zinc-400 font-bold block mb-1">
                GTM Container ID
              </label>
              <input
                type="text"
                value={google.googleTagManager.containerId}
                onChange={(e) =>
                  setGoogle({
                    ...google,
                    googleTagManager: { ...google.googleTagManager, containerId: e.target.value },
                  })
                }
                placeholder="GTM-XXXXXXX"
                className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};
