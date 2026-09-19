import React, { useState } from 'react';
import { ThemeSettings, SiteSettings } from '../../types';
import { api } from '../../services/api';
import { Palette, Sparkles, Save, RotateCcw, Check, Sliders, Type } from 'lucide-react';

interface ThemeCustomizerTabProps {
  siteSettings: SiteSettings | null;
  onRefresh: () => Promise<void>;
  onShowNotification: (msg: string, type?: 'success' | 'error') => void;
}

const PRESET_THEMES: Record<string, Partial<ThemeSettings>> = {
  'dark-gold': {
    preset: 'dark-gold',
    primaryColor: '#f59e0b',
    secondaryColor: '#181a24',
    accentColor: '#fbbf24',
    backgroundColor: '#0a0b0f',
    cardBackgroundColor: '#12141c',
    headerBackgroundColor: '#0f1015',
    footerBackgroundColor: '#090a0d',
    buttonColor: '#f59e0b',
    buttonHoverColor: '#d97706',
    textColor: '#f4f4f5',
    secondaryTextColor: '#9ca3af',
    borderColor: '#27272a',
    borderRadius: '1rem',
    fontFamily: 'outfit',
    shadowLevel: 'medium',
  },
  'luxury-gold': {
    preset: 'luxury-gold',
    primaryColor: '#eab308',
    secondaryColor: '#1a160d',
    accentColor: '#fde047',
    backgroundColor: '#0c0a06',
    cardBackgroundColor: '#18140c',
    headerBackgroundColor: '#120f09',
    footerBackgroundColor: '#080704',
    buttonColor: '#eab308',
    buttonHoverColor: '#ca8a04',
    textColor: '#fafaf9',
    secondaryTextColor: '#a8a29e',
    borderColor: '#3f311c',
    borderRadius: '1.25rem',
    fontFamily: 'cinzel',
    shadowLevel: 'glow',
  },
  'neon-cyber': {
    preset: 'neon-cyber',
    primaryColor: '#06b6d4',
    secondaryColor: '#0f172a',
    accentColor: '#38bdf8',
    backgroundColor: '#030712',
    cardBackgroundColor: '#0b1120',
    headerBackgroundColor: '#050b14',
    footerBackgroundColor: '#02050b',
    buttonColor: '#06b6d4',
    buttonHoverColor: '#0891b2',
    textColor: '#f8fafc',
    secondaryTextColor: '#94a3b8',
    borderColor: '#1e293b',
    borderRadius: '0.75rem',
    fontFamily: 'outfit',
    shadowLevel: 'glow',
  },
  'clean-light': {
    preset: 'clean-light',
    primaryColor: '#d97706',
    secondaryColor: '#f1f5f9',
    accentColor: '#b45309',
    backgroundColor: '#f8fafc',
    cardBackgroundColor: '#ffffff',
    headerBackgroundColor: '#ffffff',
    footerBackgroundColor: '#f1f5f9',
    buttonColor: '#d97706',
    buttonHoverColor: '#b45309',
    textColor: '#0f172a',
    secondaryTextColor: '#475569',
    borderColor: '#e2e8f0',
    borderRadius: '1rem',
    fontFamily: 'jakarta',
    shadowLevel: 'subtle',
  },
  'glass-ui': {
    preset: 'glass-ui',
    primaryColor: '#8b5cf6',
    secondaryColor: '#1e1b4b',
    accentColor: '#a78bfa',
    backgroundColor: '#090814',
    cardBackgroundColor: '#131127',
    headerBackgroundColor: '#0d0b1a',
    footerBackgroundColor: '#06050e',
    buttonColor: '#8b5cf6',
    buttonHoverColor: '#7c3aed',
    textColor: '#f5f3ff',
    secondaryTextColor: '#c4b5fd',
    borderColor: '#312e81',
    borderRadius: '1.5rem',
    fontFamily: 'outfit',
    shadowLevel: 'glow',
  },
};

export const ThemeCustomizerTab: React.FC<ThemeCustomizerTabProps> = ({
  siteSettings,
  onRefresh,
  onShowNotification,
}) => {
  const [theme, setTheme] = useState<ThemeSettings>(() => {
    return (
      siteSettings?.theme || {
        preset: 'dark-gold',
        primaryColor: '#f59e0b',
        secondaryColor: '#181a24',
        accentColor: '#fbbf24',
        backgroundColor: '#0a0b0f',
        cardBackgroundColor: '#12141c',
        headerBackgroundColor: '#0f1015',
        footerBackgroundColor: '#090a0d',
        buttonColor: '#f59e0b',
        buttonHoverColor: '#d97706',
        textColor: '#f4f4f5',
        secondaryTextColor: '#9ca3af',
        borderColor: '#27272a',
        inputBackgroundColor: '#18181b',
        modalBackgroundColor: '#12141c',
        successColor: '#10b981',
        errorColor: '#f43f5e',
        borderRadius: '1rem',
        fontFamily: 'outfit',
        shadowLevel: 'medium',
      }
    );
  });

  const [isSaving, setIsSaving] = useState(false);

  const applyPreset = (presetKey: string) => {
    const preset = PRESET_THEMES[presetKey];
    if (preset) {
      setTheme((prev) => ({
        ...prev,
        ...preset,
      }));
    }
  };

  const handleColorChange = (key: keyof ThemeSettings, val: string) => {
    setTheme((prev) => ({
      ...prev,
      [key]: val,
      preset: 'custom',
    }));
  };

  const handleSaveTheme = async () => {
    try {
      setIsSaving(true);
      await api.updateThemeSettings(theme);
      onShowNotification('Theme styling updated and saved successfully!');
      await onRefresh();
    } catch (err: any) {
      onShowNotification(err.message || 'Failed to save theme settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-zinc-900/60 p-6 rounded-3xl border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-black text-white flex items-center gap-2">
            <Palette className="w-5 h-5 text-amber-400" />
            Theme & Visual Style Customizer
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Full control over the color palette, typography, border roundness, and button styles.
          </p>
        </div>

        <button
          onClick={handleSaveTheme}
          disabled={isSaving}
          className="py-3 px-6 rounded-xl font-black text-xs uppercase tracking-wider bg-gradient-to-r from-amber-500 to-amber-600 text-black hover:from-amber-400 hover:to-amber-500 transition shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Applying Theme...' : 'Save & Publish Theme'}</span>
        </button>
      </div>

      {/* Preset Palettes */}
      <div className="space-y-3">
        <label className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">
          Preset Palettes
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {Object.entries(PRESET_THEMES).map(([key, preset]) => {
            const isSelected = theme.preset === key;
            return (
              <button
                key={key}
                onClick={() => applyPreset(key)}
                className={`p-4 rounded-2xl border text-left transition relative overflow-hidden group ${
                  isSelected
                    ? 'border-amber-400 bg-white/10 shadow-lg shadow-amber-500/10'
                    : 'border-white/10 bg-white/5 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-white capitalize">{key.replace('-', ' ')}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-amber-400" />}
                </div>
                <div className="flex gap-1 h-3 rounded-full overflow-hidden">
                  <div className="flex-1" style={{ backgroundColor: preset.primaryColor }} />
                  <div className="flex-1" style={{ backgroundColor: preset.backgroundColor }} />
                  <div className="flex-1" style={{ backgroundColor: preset.cardBackgroundColor }} />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Color Customizers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Core Colors */}
        <div className="p-6 rounded-3xl bg-zinc-900/40 border border-white/10 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" /> Brand & Accent Colors
          </h3>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-zinc-400 font-medium block mb-1">Primary Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={theme.primaryColor}
                  onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                  className="w-10 h-10 rounded-xl bg-transparent border-0 cursor-pointer"
                />
                <input
                  type="text"
                  value={theme.primaryColor}
                  onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                  className="flex-1 px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-xs font-mono text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-zinc-400 font-medium block mb-1">Accent Highlight Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={theme.accentColor}
                  onChange={(e) => handleColorChange('accentColor', e.target.value)}
                  className="w-10 h-10 rounded-xl bg-transparent border-0 cursor-pointer"
                />
                <input
                  type="text"
                  value={theme.accentColor}
                  onChange={(e) => handleColorChange('accentColor', e.target.value)}
                  className="flex-1 px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-xs font-mono text-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Surface Backgrounds */}
        <div className="p-6 rounded-3xl bg-zinc-900/40 border border-white/10 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Sliders className="w-4 h-4 text-amber-400" /> Background Surfaces
          </h3>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-zinc-400 font-medium block mb-1">Page Background</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={theme.backgroundColor}
                  onChange={(e) => handleColorChange('backgroundColor', e.target.value)}
                  className="w-10 h-10 rounded-xl bg-transparent border-0 cursor-pointer"
                />
                <input
                  type="text"
                  value={theme.backgroundColor}
                  onChange={(e) => handleColorChange('backgroundColor', e.target.value)}
                  className="flex-1 px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-xs font-mono text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-zinc-400 font-medium block mb-1">Card Container Background</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={theme.cardBackgroundColor}
                  onChange={(e) => handleColorChange('cardBackgroundColor', e.target.value)}
                  className="w-10 h-10 rounded-xl bg-transparent border-0 cursor-pointer"
                />
                <input
                  type="text"
                  value={theme.cardBackgroundColor}
                  onChange={(e) => handleColorChange('cardBackgroundColor', e.target.value)}
                  className="flex-1 px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-xs font-mono text-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Buttons & Typography */}
        <div className="p-6 rounded-3xl bg-zinc-900/40 border border-white/10 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Type className="w-4 h-4 text-amber-400" /> Typography & Shapes
          </h3>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-zinc-400 font-medium block mb-1">Font Family</label>
              <select
                value={theme.fontFamily}
                onChange={(e) => setTheme({ ...theme, fontFamily: e.target.value as any })}
                className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-white focus:outline-none"
              >
                <option value="outfit">Outfit (Modern Reality Style)</option>
                <option value="cinzel">Cinzel (Cinematic Royal)</option>
                <option value="jakarta">Plus Jakarta Sans (Sleek Clean)</option>
                <option value="serif">Playfair Display (Luxury Editorial)</option>
                <option value="sans">System Clean Sans</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-zinc-400 font-medium block mb-1">Border Radius</label>
              <select
                value={theme.borderRadius}
                onChange={(e) => setTheme({ ...theme, borderRadius: e.target.value })}
                className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-white focus:outline-none"
              >
                <option value="0.5rem">Subtle Rounded (8px)</option>
                <option value="0.75rem">Modern Rounded (12px)</option>
                <option value="1rem">Standard Luxury (16px)</option>
                <option value="1.5rem">Extra Rounded (24px)</option>
                <option value="9999px">Full Pill (Pill Style)</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
