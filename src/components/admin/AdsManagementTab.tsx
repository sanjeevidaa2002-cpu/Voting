import React, { useState, useEffect } from 'react';
import { SiteSettings, AdSlotItem, AdLocation } from '../../types';
import { api } from '../../services/api';
import { AdSlotContainer } from '../AdSlotContainer';
import {
  Radio,
  Save,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  ShieldCheck,
  Code,
  Layers,
  HelpCircle,
  RefreshCw,
  Plus,
  Trash2,
  Monitor,
  Tablet,
  Smartphone,
  ExternalLink,
  Info,
  Copy,
  LayoutGrid
} from 'lucide-react';

interface AdsManagementTabProps {
  siteSettings: SiteSettings | null;
  onRefresh: () => Promise<void>;
  onShowNotification: (msg: string, type?: 'success' | 'error') => void;
}

const DEFAULT_SLOTS: AdSlotItem[] = [
  {
    id: 'ad_slot_header',
    name: 'Header Top Leaderboard',
    location: 'header',
    code: '',
    enabled: false,
    desktop: true,
    tablet: true,
    mobile: true,
    order: 1,
    previewNote: 'Adsterra 728x90 Leaderboard or 320x50 Mobile Header banner',
  },
  {
    id: 'ad_slot_homepage',
    name: 'Homepage Top Sponsor',
    location: 'homepage',
    code: '',
    enabled: false,
    desktop: true,
    tablet: true,
    mobile: true,
    order: 2,
    previewNote: 'Adsterra Native Banner or 728x90 display above contestants',
  },
  {
    id: 'ad_slot_content',
    name: 'Between Content Sponsor',
    location: 'between_content',
    code: '',
    enabled: false,
    desktop: true,
    tablet: true,
    mobile: true,
    order: 3,
    previewNote: 'Adsterra 300x250 Medium Rectangle or 468x60 between contestants and leaderboard',
  },
  {
    id: 'ad_slot_banner',
    name: 'Below Hero Banner Slot',
    location: 'banner',
    code: '',
    enabled: false,
    desktop: true,
    tablet: true,
    mobile: true,
    order: 4,
    previewNote: 'Adsterra Social Bar or 728x90 banner right below the code-shaped frame',
  },
  {
    id: 'ad_slot_footer',
    name: 'Footer Bottom Ad',
    location: 'footer',
    code: '',
    enabled: false,
    desktop: true,
    tablet: true,
    mobile: true,
    order: 5,
    previewNote: 'Adsterra 728x90 or 300x250 Banner above public footer',
  },
  {
    id: 'ad_slot_custom',
    name: 'Custom Placement / Popunder',
    location: 'custom',
    code: '',
    enabled: false,
    desktop: true,
    tablet: true,
    mobile: true,
    order: 6,
    previewNote: 'Adsterra Popunder, Social Bar, or Custom ad script tag',
  },
];

const LOCATION_OPTIONS: { value: AdLocation; label: string; desc: string }[] = [
  { value: 'header', label: 'Header (Top Nav)', desc: 'Positioned right below the primary website navigation bar' },
  { value: 'homepage', label: 'Homepage (Top Section)', desc: 'Positioned prominently on the homepage above contestants' },
  { value: 'between_content', label: 'Content (Between Sections)', desc: 'Positioned between Contestants and Live Leaderboard' },
  { value: 'banner', label: 'Banner (Below Hero Frame)', desc: 'Positioned directly below the code-shaped banner carousel' },
  { value: 'footer', label: 'Footer (Bottom)', desc: 'Positioned cleanly above the website footer and copyright' },
  { value: 'custom', label: 'Custom Placement', desc: 'Floating social bar, popunder, or supplementary slot' },
];

export const AdsManagementTab: React.FC<AdsManagementTabProps> = ({
  siteSettings,
  onRefresh,
  onShowNotification,
}) => {
  const [adSlots, setAdSlots] = useState<AdSlotItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [activePreviewId, setActivePreviewId] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [savingSlotId, setSavingSlotId] = useState<string | null>(null);

  // Initialize slots from siteSettings
  useEffect(() => {
    if (siteSettings?.adSlots && Array.isArray(siteSettings.adSlots) && siteSettings.adSlots.length > 0) {
      setAdSlots(siteSettings.adSlots);
    } else {
      // Build from legacy adsConfig or defaults
      const legacyHeader = siteSettings?.adsConfig?.headerAd;
      const legacyFooter = siteSettings?.adsConfig?.footerAd;
      const legacyBanner = siteSettings?.adsConfig?.bannerAd;

      const seeded = DEFAULT_SLOTS.map((slot) => {
        if (slot.location === 'header' && legacyHeader) {
          return { ...slot, enabled: legacyHeader.enabled, code: legacyHeader.code || '' };
        }
        if (slot.location === 'footer' && legacyFooter) {
          return { ...slot, enabled: legacyFooter.enabled, code: legacyFooter.code || '' };
        }
        if (slot.location === 'banner' && legacyBanner) {
          return { ...slot, enabled: legacyBanner.enabled, code: legacyBanner.code || '' };
        }
        return slot;
      });
      setAdSlots(seeded);
    }
  }, [siteSettings]);

  const handleUpdateSlot = (id: string, updates: Partial<AdSlotItem>) => {
    setAdSlots((prev) =>
      prev.map((slot) => (slot.id === id ? { ...slot, ...updates } : slot))
    );
  };

  const handleToggleSlot = (id: string) => {
    setAdSlots((prev) =>
      prev.map((slot) => (slot.id === id ? { ...slot, enabled: !slot.enabled } : slot))
    );
  };

  const handleSaveSingleSlot = async (slot: AdSlotItem) => {
    try {
      setSavingSlotId(slot.id);
      await api.updateAdSlot(slot.id, slot);
      onShowNotification(`Saved "${slot.name}" successfully!`);
      await onRefresh();
    } catch (err: any) {
      onShowNotification(err.message || 'Failed to save slot', 'error');
    } finally {
      setSavingSlotId(null);
    }
  };

  const handleSaveAll = async () => {
    try {
      setIsSaving(true);
      await api.saveBulkAdSlots(adSlots);
      onShowNotification('All Adsterra ad slots saved successfully!');
      await onRefresh();
    } catch (err: any) {
      onShowNotification(err.message || 'Failed to save ad slots', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddNewSlot = () => {
    const newId = `ad_slot_${Date.now()}`;
    const newSlot: AdSlotItem = {
      id: newId,
      name: `Ad Slot ${adSlots.length + 1}`,
      location: 'custom',
      code: '',
      enabled: false,
      desktop: true,
      tablet: true,
      mobile: true,
      order: adSlots.length + 1,
      previewNote: 'Custom Adsterra or direct publisher code',
    };
    setAdSlots((prev) => [...prev, newSlot]);
    onShowNotification('Added new ad slot. Paste your Adsterra code and save.', 'success');
  };

  const handleDeleteSlot = async (id: string) => {
    if (window.confirm('Are you sure you want to remove this ad slot?')) {
      try {
        await api.deleteAdSlot(id);
        setAdSlots((prev) => prev.filter((s) => s.id !== id));
        onShowNotification('Ad slot deleted.');
        await onRefresh();
      } catch (err: any) {
        onShowNotification(err.message || 'Failed to delete slot', 'error');
      }
    }
  };

  const filteredSlots = adSlots.filter((s) => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'enabled') return s.enabled;
    if (selectedFilter === 'disabled') return !s.enabled;
    return s.location === selectedFilter;
  });

  const enabledCount = adSlots.filter((s) => s.enabled).length;

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Top Header Card */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-6 sm:p-8 rounded-3xl bg-zinc-900/90 border border-white/10 backdrop-blur-xl shadow-2xl">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
              <Radio className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl sm:text-3xl font-serif font-black text-white">
                  Adsterra Multi-Slot System
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/10 border border-amber-500/30 text-amber-400">
                  {enabledCount} / {adSlots.length} Active
                </span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-400">
                Configure 6+ independent ad-code boxes. Paste your Adsterra ad codes safely with sandbox isolation.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end lg:self-center">
          <button
            type="button"
            onClick={handleAddNewSlot}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-white/5 border border-white/15 text-zinc-200 font-bold text-xs uppercase tracking-wider hover:bg-white/10 transition"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>Add Slot</span>
          </button>

          <button
            type="button"
            onClick={handleSaveAll}
            disabled={isSaving}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-black text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 transition shadow-lg shadow-amber-500/25 disabled:opacity-50"
          >
            {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save All Slots</span>
          </button>
        </div>
      </div>

      {/* Info & Sandboxing Reassurance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-start gap-3.5 text-xs text-blue-300">
          <ShieldCheck className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-white text-sm">Protected Sandboxed Execution</span>
            <p className="text-zinc-300 leading-relaxed">
              Every ad snippet is rendered inside a secure iframe container. External scripts will never interfere with the voting mechanics, countdown clocks, or authentication flow.
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3.5 text-xs text-amber-300">
          <Info className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-white text-sm">How to Use Adsterra Code</span>
            <p className="text-zinc-300 leading-relaxed">
              Copy your Adsterra script tag or HTML banner directly from the Adsterra Publisher Dashboard and paste it into the code box below. Then toggle <strong className="text-white">Enable</strong> and click <strong className="text-white">Save</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-white/10">
        <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider mr-2 flex items-center gap-1.5">
          <LayoutGrid className="w-4 h-4" /> Filter:
        </span>
        {[
          { key: 'all', label: `All (${adSlots.length})` },
          { key: 'enabled', label: `Active (${enabledCount})` },
          { key: 'header', label: 'Header' },
          { key: 'homepage', label: 'Homepage' },
          { key: 'between_content', label: 'Content' },
          { key: 'banner', label: 'Banner' },
          { key: 'footer', label: 'Footer' },
          { key: 'custom', label: 'Custom' },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setSelectedFilter(tab.key)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              selectedFilter === tab.key
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                : 'bg-white/5 text-zinc-400 hover:text-white border border-white/5'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Slots List (Approximately 6+ Independent Ad Boxes) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredSlots.map((slot, index) => {
          const isPreviewOpen = activePreviewId === slot.id;
          const isSavingThis = savingSlotId === slot.id;

          return (
            <div
              key={slot.id}
              className="rounded-3xl border border-white/10 bg-[#12141e] p-6 sm:p-7 space-y-5 flex flex-col justify-between shadow-xl transition hover:border-white/20"
            >
              <div className="space-y-4">
                {/* Slot Header */}
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-white/10">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-md border border-amber-500/20">
                        SLOT #{slot.order || index + 1}
                      </span>
                      <input
                        type="text"
                        value={slot.name}
                        onChange={(e) => handleUpdateSlot(slot.id, { name: e.target.value })}
                        placeholder="Slot Name"
                        className="bg-transparent border-b border-white/15 focus:border-amber-400 font-bold text-white text-sm sm:text-base outline-none px-1 py-0.5 transition"
                      />
                    </div>

                    {/* Location Selection Dropdown */}
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-[11px] font-bold text-zinc-400 uppercase">Location:</span>
                      <select
                        value={slot.location}
                        onChange={(e) => handleUpdateSlot(slot.id, { location: e.target.value as AdLocation })}
                        className="bg-zinc-900 border border-white/15 text-xs text-amber-300 rounded-lg px-2 py-1 outline-none focus:border-amber-500"
                      >
                        {LOCATION_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Enable / Disable Switch */}
                  <div className="flex flex-col items-end gap-1">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={slot.enabled}
                        onChange={() => handleToggleSlot(slot.id)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                    </label>
                    <span
                      className={`text-[10px] font-black uppercase tracking-wider ${
                        slot.enabled ? 'text-emerald-400' : 'text-zinc-500'
                      }`}
                    >
                      {slot.enabled ? 'ENABLED' : 'DISABLED'}
                    </span>
                  </div>
                </div>

                {/* Paste Ad Code Textarea */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                      <Code className="w-3.5 h-3.5 text-amber-400" />
                      <span>Adsterra Ad Code / Script</span>
                    </label>
                    {slot.code && (
                      <button
                        type="button"
                        onClick={() => handleUpdateSlot(slot.id, { code: '' })}
                        className="text-[10px] text-rose-400 hover:underline"
                      >
                        Clear Code
                      </button>
                    )}
                  </div>
                  <textarea
                    value={slot.code || ''}
                    onChange={(e) => handleUpdateSlot(slot.id, { code: e.target.value })}
                    rows={4}
                    placeholder={`<!-- Paste your Adsterra Code for ${slot.name} here (e.g., <script>...</script> or <iframe>) -->`}
                    className="w-full rounded-2xl bg-zinc-900/90 border border-white/10 px-4 py-3 text-xs font-mono text-amber-200 placeholder-zinc-600 focus:outline-none focus:border-amber-500/60 leading-relaxed shadow-inner"
                  />
                  <p className="text-[11px] text-zinc-500 italic">
                    {slot.previewNote || 'Adsterra responsive banner, 728x90, 300x250, or native banner code.'}
                  </p>
                </div>

                {/* Device Targeting Options */}
                <div className="space-y-1.5 pt-2">
                  <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                    Target Devices:
                  </span>
                  <div className="flex items-center gap-4 text-xs">
                    <label className="flex items-center gap-1.5 cursor-pointer text-zinc-300 hover:text-white">
                      <input
                        type="checkbox"
                        checked={slot.desktop !== false}
                        onChange={(e) => handleUpdateSlot(slot.id, { desktop: e.target.checked })}
                        className="rounded border-zinc-700 text-amber-500 focus:ring-amber-500 bg-zinc-800"
                      />
                      <Monitor className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Desktop</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer text-zinc-300 hover:text-white">
                      <input
                        type="checkbox"
                        checked={slot.tablet !== false}
                        onChange={(e) => handleUpdateSlot(slot.id, { tablet: e.target.checked })}
                        className="rounded border-zinc-700 text-amber-500 focus:ring-amber-500 bg-zinc-800"
                      />
                      <Tablet className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Tablet</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer text-zinc-300 hover:text-white">
                      <input
                        type="checkbox"
                        checked={slot.mobile !== false}
                        onChange={(e) => handleUpdateSlot(slot.id, { mobile: e.target.checked })}
                        className="rounded border-zinc-700 text-amber-500 focus:ring-amber-500 bg-zinc-800"
                      />
                      <Smartphone className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Mobile</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-4 border-t border-white/10 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setActivePreviewId(isPreviewOpen ? null : slot.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                        isPreviewOpen
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/10'
                      }`}
                    >
                      {isPreviewOpen ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-amber-400" />}
                      <span>{isPreviewOpen ? 'Hide Preview' : 'Preview'}</span>
                    </button>

                    {adSlots.length > 6 && (
                      <button
                        type="button"
                        onClick={() => handleDeleteSlot(slot.id)}
                        className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition"
                        title="Delete slot"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSaveSingleSlot(slot)}
                    disabled={isSavingThis}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-amber-500 text-black font-black text-xs uppercase tracking-wider hover:bg-amber-400 active:scale-95 transition disabled:opacity-50"
                  >
                    {isSavingThis ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                    <span>Save</span>
                  </button>
                </div>

                {/* Inline Live Sandboxed Preview */}
                {isPreviewOpen && (
                  <div className="p-3 rounded-2xl bg-black/60 border border-amber-500/30 space-y-2 animate-fade-in">
                    <div className="flex items-center justify-between text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                      <span>Live Isolated Frame Preview:</span>
                      <span className="text-zinc-500">Sandbox Protected</span>
                    </div>

                    {slot.code && slot.code.trim() ? (
                      <AdSlotContainer slot={slot} />
                    ) : (
                      <div className="py-6 text-center text-xs text-zinc-500 italic bg-zinc-900/40 rounded-xl border border-white/5">
                        Paste your Adsterra snippet in the box above to see the live rendering preview.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
