import React, { useState } from 'react';
import { SiteSettings, BrandingSettings } from '../../types';
import { api } from '../../services/api';
import {
  Sparkles,
  Save,
  Globe,
  Image as ImageIcon,
  Crown,
  Type,
  Smartphone,
  Layers,
  UploadCloud,
  Check,
  Eye,
  Trash2,
  ExternalLink
} from 'lucide-react';

interface BrandingTabProps {
  siteSettings: SiteSettings | null;
  onRefresh: () => Promise<void>;
  onShowNotification: (msg: string, type?: 'success' | 'error') => void;
}

export const BrandingTab: React.FC<BrandingTabProps> = ({
  siteSettings,
  onRefresh,
  onShowNotification,
}) => {
  const [branding, setBranding] = useState<BrandingSettings>(() => {
    return (
      siteSettings?.branding || {
        websiteName: siteSettings?.siteName || 'STAR HOUSE',
        showName: siteSettings?.seasonTitle || 'Season 9: Crown of Titans',
        browserTitle: 'StarVoter - Reality Show Voting Platform',
        tagline: siteSettings?.tagline || 'The Ultimate Reality TV Show',
        logoText: siteSettings?.logoText || 'STAR HOUSE',
        logoIcon: siteSettings?.logoIcon || 'Crown',
        mainLogoUrl: siteSettings?.logoUrl || '',
        mobileLogoUrl: '',
        faviconUrl: '',
        footerLogoUrl: '',
      }
    );
  });

  const [isSaving, setIsSaving] = useState(false);
  const [previewBackground, setPreviewBackground] = useState<'dark' | 'light' | 'grid'>('dark');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      await api.updateBrandingSettings(branding);
      onShowNotification('Branding, logo assets, and site identity updated!');
      await onRefresh();
    } catch (err: any) {
      onShowNotification(err.message || 'Failed to save branding', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, field: keyof BrandingSettings) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setBranding((prev) => ({
          ...prev,
          [field]: reader.result,
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  const LOGO_FIELDS: { key: keyof BrandingSettings; label: string; description: string }[] = [
    { key: 'mainLogoUrl', label: 'Main Official Logo', description: 'Primary desktop brand mark across navigation and banners' },
    { key: 'mobileLogoUrl', label: 'Mobile Responsive Logo', description: 'Optimized compact mark for smartphone top bars' },
    { key: 'footerLogoUrl', label: 'Footer Logo', description: 'Monochrome or subtle badge for the bottom legal footer' },
    { key: 'faviconUrl', label: 'Browser Favicon Icon', description: 'Small 32x32 / 64x64 icon displayed in browser tabs' },
  ];

  return (
    <form onSubmit={handleSave} className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-zinc-900/90 via-[#13151f] to-zinc-900/90 p-6 rounded-3xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Sparkles className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-serif font-black text-white">
              Logo & Visual Branding Management
            </h2>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Configure show titles, website names, custom logos (desktop, mobile, footer), favicons, and browser tab headers.
          </p>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="py-3 px-6 rounded-xl font-black text-xs uppercase tracking-wider bg-gradient-to-r from-amber-500 to-amber-600 text-black hover:from-amber-400 hover:to-amber-500 transition shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving...' : 'Save All Branding'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LOGO ASSET MANAGEMENT */}
        <div className="p-6 rounded-3xl bg-zinc-900/40 border border-white/10 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-amber-400" /> Logo Images & Media
            </h3>
            <span className="text-[10px] text-zinc-500 font-mono">PNG / SVG / WEBP</span>
          </div>

          <div className="space-y-4">
            {LOGO_FIELDS.map((slot) => {
              const currentVal = (branding[slot.key] as string) || '';

              return (
                <div key={slot.key} className="p-4 rounded-2xl bg-[#0a0b0f] border border-white/5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-zinc-300 block">{slot.label}</label>
                    <div className="flex items-center gap-3">
                      <label className="cursor-pointer text-[10px] text-amber-400 hover:underline flex items-center gap-1">
                        <UploadCloud className="w-3 h-3" />
                        <span>Upload File</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, slot.key)}
                        />
                      </label>
                      {currentVal && (
                        <button
                          type="button"
                          onClick={() => setBranding({ ...branding, [slot.key]: '' })}
                          className="text-[10px] text-rose-400 hover:underline"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>

                  <input
                    type="url"
                    value={currentVal}
                    onChange={(e) => setBranding({ ...branding, [slot.key]: e.target.value })}
                    placeholder="https://example.com/logo.png"
                    className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  />

                  {/* Visual Preview */}
                  {currentVal ? (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-black/60 border border-white/10">
                      <div className="w-14 h-14 rounded-lg bg-zinc-950 p-1 border border-white/10 flex items-center justify-center overflow-hidden">
                        <img src={currentVal} alt={slot.label} className="max-w-full max-h-full object-contain" />
                      </div>
                      <div className="flex-1 min-w-0 text-xs">
                        <div className="font-bold text-white truncate">{slot.label}</div>
                        <div className="text-[10px] text-zinc-500 truncate">{currentVal}</div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[10px] text-zinc-500">{slot.description}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* SITE IDENTITY & LIVE LOGO PREVIEW */}
        <div className="space-y-6">
          {/* Identity Fields */}
          <div className="p-6 rounded-3xl bg-zinc-900/40 border border-white/10 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Type className="w-4 h-4 text-amber-400" /> Text Identity & Metadata
            </h3>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-zinc-400 font-bold block mb-1">Website Name</label>
                <input
                  type="text"
                  value={branding.websiteName}
                  onChange={(e) => setBranding({ ...branding, websiteName: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 font-bold block mb-1">Show Season Name</label>
                <input
                  type="text"
                  value={branding.showName}
                  onChange={(e) => setBranding({ ...branding, showName: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 font-bold block mb-1">Browser Tab Title</label>
                <input
                  type="text"
                  value={branding.browserTitle}
                  onChange={(e) => setBranding({ ...branding, browserTitle: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 font-bold block mb-1">Tagline Slogan</label>
                <input
                  type="text"
                  value={branding.tagline}
                  onChange={(e) => setBranding({ ...branding, tagline: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 font-bold block mb-1">Logo Stylized Text Mark</label>
                <input
                  type="text"
                  value={branding.logoText}
                  onChange={(e) => setBranding({ ...branding, logoText: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          </div>

          {/* Logo Contrast Checker & Live Preview */}
          <div className="p-6 rounded-3xl bg-zinc-900/40 border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Eye className="w-4 h-4 text-amber-400" /> Logo Contrast Inspection
              </h3>

              <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/5">
                <button
                  type="button"
                  onClick={() => setPreviewBackground('dark')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                    previewBackground === 'dark' ? 'bg-amber-500 text-black' : 'text-zinc-400'
                  }`}
                >
                  Dark
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewBackground('light')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                    previewBackground === 'light' ? 'bg-amber-500 text-black' : 'text-zinc-400'
                  }`}
                >
                  Light
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewBackground('grid')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                    previewBackground === 'grid' ? 'bg-amber-500 text-black' : 'text-zinc-400'
                  }`}
                >
                  Checkerboard
                </button>
              </div>
            </div>

            {/* Test Stage */}
            <div
              className={`p-6 rounded-2xl border border-white/10 flex items-center justify-center min-h-[140px] transition-all ${
                previewBackground === 'dark'
                  ? 'bg-[#0a0b0f]'
                  : previewBackground === 'light'
                  ? 'bg-zinc-200'
                  : 'bg-[radial-gradient(#333_1px,transparent_1px)] [background-size:16px_16px] bg-black'
              }`}
            >
              {branding.mainLogoUrl ? (
                <img
                  src={branding.mainLogoUrl}
                  alt="Main Logo Preview"
                  className="max-h-20 max-w-full object-contain"
                />
              ) : (
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-amber-500/20 text-amber-500">
                    <Crown className="w-7 h-7" />
                  </span>
                  <span className={`text-2xl font-serif font-black tracking-widest ${previewBackground === 'light' ? 'text-black' : 'text-white'}`}>
                    {branding.logoText || branding.websiteName}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};
