import React, { useState } from 'react';
import { HomepageSection, SiteSettings } from '../../types';
import { api } from '../../services/api';
import { LayoutDashboard, ArrowUp, ArrowDown, Eye, EyeOff, Save, Edit3 } from 'lucide-react';

interface HomepageBuilderTabProps {
  siteSettings: SiteSettings | null;
  onRefresh: () => Promise<void>;
  onShowNotification: (msg: string, type?: 'success' | 'error') => void;
}

export const HomepageBuilderTab: React.FC<HomepageBuilderTabProps> = ({
  siteSettings,
  onRefresh,
  onShowNotification,
}) => {
  const [sections, setSections] = useState<HomepageSection[]>(() => {
    return (
      siteSettings?.homepageSections || [
        { id: 'sec_hero', type: 'hero_banner', title: 'Grand Finale Showcase', subtitle: 'Live Broadcast Carousel', isEnabled: true, order: 1 },
        { id: 'sec_status', type: 'voting_status', title: 'Live Elimination Voting', subtitle: 'Real-Time Arena Status', isEnabled: true, order: 2 },
        { id: 'sec_contestants', type: 'contestants', title: 'Nominated Contestants', subtitle: 'Cast Your Free Vote Below', isEnabled: true, order: 3, ctaText: 'Vote Now', ctaLink: '#contestants-section' },
        { id: 'sec_ranking', type: 'live_ranking', title: 'Live Vote Leaderboard', subtitle: 'Real-Time Percentage Standings', isEnabled: true, order: 4 },
        { id: 'sec_rules', type: 'rules_guide', title: 'How It Works', subtitle: 'Safe, Anonymous & Certified', isEnabled: true, order: 5 },
        { id: 'sec_faq', type: 'faq', title: 'Frequently Asked Questions', subtitle: 'Viewer Guide & Support', isEnabled: true, order: 6 },
      ]
    );
  });

  const [isSaving, setIsSaving] = useState(false);

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    const updated = [...sections];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    // re-assign order
    const ordered = updated.map((sec, i) => ({ ...sec, order: i + 1 }));
    setSections(ordered);
  };

  const toggleSection = (id: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isEnabled: !s.isEnabled } : s))
    );
  };

  const handleUpdateField = (id: string, field: keyof HomepageSection, val: any) => {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: val } : s))
    );
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await api.updateHomepageSections(sections);
      onShowNotification('Homepage layout and sections saved!');
      await onRefresh();
    } catch (err: any) {
      onShowNotification(err.message || 'Failed to update homepage builder', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-zinc-900/60 p-6 rounded-3xl border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-black text-white flex items-center gap-2">
            <LayoutDashboard className="w-5 h-5 text-amber-400" />
            Homepage Section Builder
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Organize, enable/disable, and reorder public homepage blocks in real-time.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="py-3 px-6 rounded-xl font-black text-xs uppercase tracking-wider bg-gradient-to-r from-amber-500 to-amber-600 text-black hover:from-amber-400 hover:to-amber-500 transition shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving Layout...' : 'Save Homepage Layout'}</span>
        </button>
      </div>

      {/* Sections List */}
      <div className="space-y-3">
        {sections.map((section, index) => (
          <div
            key={section.id}
            className={`p-5 rounded-2xl border transition ${
              section.isEnabled
                ? 'bg-zinc-900/50 border-white/10'
                : 'bg-zinc-950/40 border-white/5 opacity-60'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center text-xs font-mono font-bold text-amber-400">
                  {index + 1}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={section.title}
                      onChange={(e) => handleUpdateField(section.id, 'title', e.target.value)}
                      className="bg-transparent border-b border-transparent hover:border-white/20 focus:border-amber-400 text-sm font-bold text-white focus:outline-none px-1"
                    />
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-zinc-400 capitalize">
                      {section.type.replace('_', ' ')}
                    </span>
                  </div>
                  <input
                    type="text"
                    value={section.subtitle}
                    onChange={(e) => handleUpdateField(section.id, 'subtitle', e.target.value)}
                    placeholder="Subtitle..."
                    className="bg-transparent border-b border-transparent hover:border-white/20 focus:border-amber-400 text-xs text-zinc-400 focus:outline-none px-1 mt-0.5 w-full"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Reorder Buttons */}
                <button
                  type="button"
                  onClick={() => moveSection(index, 'up')}
                  disabled={index === 0}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 disabled:opacity-25"
                  title="Move Up"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => moveSection(index, 'down')}
                  disabled={index === sections.length - 1}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 disabled:opacity-25"
                  title="Move Down"
                >
                  <ArrowDown className="w-4 h-4" />
                </button>

                {/* Enable / Disable */}
                <button
                  type="button"
                  onClick={() => toggleSection(section.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                    section.isEnabled
                      ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                      : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {section.isEnabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  <span>{section.isEnabled ? 'Visible' : 'Hidden'}</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
