import React, { useState, useEffect, useMemo } from 'react';
import { CustomTheme, SiteSettings } from '../../types';
import { api } from '../../services/api';
import { PREDEFINED_THEMES, ColorPaletteItem, convertPaletteToCustomTheme } from '../../data/predefinedThemes';
import { applyThemeToDocument } from '../../utils/themeUtils';
import {
  Palette,
  Sparkles,
  Save,
  CheckCircle2,
  Copy,
  Trash2,
  Sliders,
  Image as ImageIcon,
  RotateCcw,
  Plus,
  RefreshCw,
  Eye,
  Download,
  Upload,
  Layers,
  Check,
  ChevronRight,
  Monitor,
  Smartphone,
  Type,
  Maximize2,
  X,
  AlertTriangle,
  Search,
  CheckCircle,
  ArrowRight,
  ShieldCheck,
  Trophy,
  Flame,
  Radio,
  Vote
} from 'lucide-react';

interface ThemeManagerTabProps {
  siteSettings: SiteSettings | null;
  onUpdate: () => void;
}

const CATEGORIES = [
  'All',
  'Blues & Sapphires',
  'Golds & Titans',
  'Scarlets & Crimson',
  'Emeralds & Mints',
  'Purples & Violets',
  'Sunbursts & Oranges',
  'Obsidians & Monochromes',
  'Clean & Editorial Light'
];

export const ThemeManagerTab: React.FC<ThemeManagerTabProps> = ({
  siteSettings,
  onUpdate,
}) => {
  const [themes, setThemes] = useState<CustomTheme[]>([]);
  const [activeThemeId, setActiveThemeId] = useState<string>('');
  const [selectedTheme, setSelectedTheme] = useState<CustomTheme | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Studio Sub-tabs: 'palettes' | 'colors' | 'gradients' | 'backgrounds' | 'typography'
  const [viewMode, setViewMode] = useState<'palettes' | 'colors' | 'gradients' | 'backgrounds' | 'typography'>('palettes');

  // Active Target Slot for 1-Click Color Preset Apply
  const [targetColorSlot, setTargetColorSlot] = useState<keyof CustomTheme>('primaryColor');

  // Reset Confirmation Modal
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  // Import / Export JSON State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');

  // Gradient Builder Local State
  const [gradientType, setGradientType] = useState<'linear' | 'radial'>('linear');
  const [gradColor1, setGradColor1] = useState('#f59e0b');
  const [gradColor2, setGradColor2] = useState('#b45309');
  const [gradColor3, setGradColor3] = useState('');
  const [gradAngle, setGradAngle] = useState(135);
  const [gradTarget, setGradTarget] = useState<'heroGradient' | 'headerGradient' | 'buttonGradient' | 'cardGradient' | 'backgroundGradient' | 'footerGradient'>('buttonGradient');

  const fetchThemes = async () => {
    setIsLoading(true);
    try {
      const res = await api.getThemes();
      const loadedThemes: CustomTheme[] = res.themes || [];
      const currentActiveId = res.activeThemeId || (siteSettings?.theme?.activeThemeId) || loadedThemes[0]?.id || 'thm_luxury_gold';
      setThemes(loadedThemes);
      setActiveThemeId(currentActiveId);

      // Default selected theme to currently active theme or first
      const current = loadedThemes.find((t: CustomTheme) => t.id === currentActiveId) || loadedThemes[0];
      if (current) {
        const fullTheme = ensureCompleteTheme(current);
        setSelectedTheme(fullTheme);
        // Apply to document for live preview in admin panel
        applyThemeToDocument(fullTheme);
      }
    } catch (err: any) {
      console.error('Failed to load themes:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchThemes();
  }, []);

  const ensureCompleteTheme = (thm: CustomTheme): CustomTheme => ({
    ...thm,
    warningColor: thm.warningColor || '#f59e0b',
    backgrounds: thm.backgrounds || {
      desktopBackground: '',
      tabletBackground: '',
      mobileBackground: '',
      loginBackground: '',
      adminBackground: '',
      homepageBackground: '',
      contestantSectionBackground: '',
      resultsBackground: '',
      footerBackground: '',
    },
    gradients: thm.gradients || {
      heroGradient: '',
      headerGradient: '',
      buttonGradient: '',
      cardGradient: '',
      backgroundGradient: '',
      footerGradient: '',
      sectionGradient: '',
    },
  });

  const showNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setActionMessage({ text, type });
    setTimeout(() => setActionMessage(null), 4500);
  };

  // 1-Click Select Combination (Live Preview only, does not persist to DB until Save)
  const handleSelectCombination = (palette: ColorPaletteItem) => {
    // Find matching custom theme in loaded list or convert palette
    const existing = themes.find((t) => t.id === palette.id || t.preset === palette.preset);
    let themeToSelect: CustomTheme;
    if (existing) {
      themeToSelect = ensureCompleteTheme(existing);
    } else {
      themeToSelect = ensureCompleteTheme(convertPaletteToCustomTheme(palette, false));
    }

    setSelectedTheme(themeToSelect);
    // Real-time live preview update
    applyThemeToDocument(themeToSelect);
  };

  // Save & Apply Selected Theme to Firebase / Database
  const handleSaveAndApplyTheme = async () => {
    if (!selectedTheme) return;
    setIsSaving(true);
    try {
      // 1. Check if theme already exists in themes collection
      const themeExists = themes.some((t) => t.id === selectedTheme.id);
      if (themeExists) {
        await api.updateTheme(selectedTheme.id, selectedTheme);
      } else {
        await api.createTheme(selectedTheme);
      }

      // 2. Activate the theme globally
      await api.activateTheme(selectedTheme.id);
      setActiveThemeId(selectedTheme.id);

      // 3. Directly update siteSettings.theme for instant global synchronization
      await api.updateSiteSettings({
        theme: {
          ...selectedTheme,
          activeThemeId: selectedTheme.id,
        }
      });

      // 4. Update live document CSS variables
      applyThemeToDocument(selectedTheme);

      showNotification(`Theme "${selectedTheme.name}" saved & activated across entire website!`);
      onUpdate();
      await fetchThemes();
    } catch (err: any) {
      console.error('Failed to save theme:', err);
      showNotification(err.message || 'Failed to save theme', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Reset Preview back to Currently Saved Active Theme
  const handleResetPreview = () => {
    const active = themes.find((t) => t.id === activeThemeId) || themes[0];
    if (active) {
      const full = ensureCompleteTheme(active);
      setSelectedTheme(full);
      applyThemeToDocument(full);
      showNotification('Preview reverted back to active saved theme.');
    }
  };

  // Reset all themes to certified official presets
  const handleResetToDefaults = async () => {
    try {
      setIsLoading(true);
      await api.resetThemesToDefault();
      setIsResetModalOpen(false);
      showNotification('All 44 themes reset to factory certified presets!');
      onUpdate();
      await fetchThemes();
    } catch (err: any) {
      showNotification(err.message || 'Failed to reset themes', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Color Change Handler for custom editing
  const handleColorChange = (key: keyof CustomTheme, val: string) => {
    if (!selectedTheme) return;
    const updated = {
      ...selectedTheme,
      [key]: val,
    };
    setSelectedTheme(updated);
    applyThemeToDocument(updated);
  };

  // Export Theme JSON
  const handleExportJson = () => {
    if (!selectedTheme) return;
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(selectedTheme, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${selectedTheme.name.toLowerCase().replace(/\s+/g, '_')}_theme.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showNotification(`Exported "${selectedTheme.name}" configuration file!`);
  };

  // Import Theme JSON
  const handleImportJson = async () => {
    try {
      const parsed = JSON.parse(importJsonText);
      const res = await api.importTheme(parsed);
      setIsImportModalOpen(false);
      setImportJsonText('');
      showNotification('Custom theme configuration imported successfully!');
      await fetchThemes();
      if (res.theme) {
        setSelectedTheme(ensureCompleteTheme(res.theme));
        applyThemeToDocument(res.theme);
      }
    } catch (err: any) {
      showNotification('Invalid theme JSON structure.', 'error');
    }
  };

  // Filtered 44 Predefined Color Combinations
  const filteredPalettes = useMemo(() => {
    return PREDEFINED_THEMES.filter((item) => {
      const matchesCategory =
        selectedCategory === 'All' || item.category.toLowerCase().includes(selectedCategory.toLowerCase()) ||
        (selectedCategory === 'Clean & Editorial Light' && (item.category.includes('Light') || item.category.includes('Clean')));

      const matchesSearch =
        searchQuery.trim() === '' ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.colors.primary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.colors.secondary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.colors.accent.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.colors.background.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const isCurrentSelectionActive = selectedTheme?.id === activeThemeId;

  const COLOR_SLOTS: { key: keyof CustomTheme; label: string; description: string }[] = [
    { key: 'primaryColor', label: 'Primary Brand Color', description: 'Main accent, buttons, rank badges, active elements' },
    { key: 'secondaryColor', label: 'Secondary UI Color', description: 'Subtle container fills and deep accents' },
    { key: 'accentColor', label: 'Accent & Glow Color', description: 'Spotlights, highlights, and glowing borders' },
    { key: 'backgroundColor', label: 'Main Canvas Background', description: 'Overall page background' },
    { key: 'cardBackgroundColor', label: 'Card & Surface Color', description: 'Contestant cards, dialogs, widgets' },
    { key: 'headerBackgroundColor', label: 'Header & Navigation Bar', description: 'Top site navigation surface' },
    { key: 'footerBackgroundColor', label: 'Footer Background', description: 'Bottom legal & footer surface' },
    { key: 'buttonColor', label: 'Voting Button Fill', description: 'Primary action CTA buttons' },
    { key: 'buttonHoverColor', label: 'Button Hover Fill', description: 'Cursor hover state background' },
    { key: 'textColor', label: 'Primary Text Color', description: 'Headings, contestant names, numbers' },
    { key: 'secondaryTextColor', label: 'Secondary / Subtitle Text', description: 'Descriptions, taglines, muted labels' },
    { key: 'borderColor', label: 'Divider & Border Color', description: 'Outlines, structural dividers' },
    { key: 'inputBackgroundColor', label: 'Input Field Background', description: 'Search and form controls' },
    { key: 'modalBackgroundColor', label: 'Modal Dialog Surface', description: 'Vote confirmation popups' },
    { key: 'successColor', label: 'Success / Safe Color', description: 'Safe status tags and verified icons' },
    { key: 'warningColor', label: 'Warning / Nominated Color', description: 'Eviction warnings and alerts' },
    { key: 'errorColor', label: 'Error / Evicted Color', description: 'Danger states and evicted housemate tags' },
  ];

  return (
    <div className="space-y-8 pb-12" id="admin-theme-studio">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-zinc-900/90 via-[#13151f] to-zinc-900/90 p-6 rounded-3xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xl">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-inner">
              <Palette className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">
                Global Theme & Color Studio
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                44 broadcast color combinations with instant live preview, custom palette editing, and persistent global application.
              </p>
            </div>
          </div>
        </div>

        {/* Top Global Utility Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="py-2 px-3 rounded-xl font-bold text-xs bg-white/5 border border-white/10 text-zinc-300 hover:text-white hover:bg-white/10 transition flex items-center gap-1.5"
            title="Import Theme from JSON"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import</span>
          </button>

          <button
            onClick={handleExportJson}
            className="py-2 px-3 rounded-xl font-bold text-xs bg-white/5 border border-white/10 text-zinc-300 hover:text-white hover:bg-white/10 transition flex items-center gap-1.5"
            title="Export Selected Theme to JSON"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>

          <button
            onClick={() => setIsResetModalOpen(true)}
            className="py-2 px-3 rounded-xl font-bold text-xs bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 transition flex items-center gap-1.5"
            title="Reset All Themes to Default Presets"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All</span>
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {actionMessage && (
        <div
          className={`p-4 rounded-2xl border text-xs font-bold flex items-center justify-between shadow-xl transition-all animate-fadeIn ${
            actionMessage.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{actionMessage.text}</span>
          </div>
          <button onClick={() => setActionMessage(null)}>
            <X className="w-4 h-4 text-zinc-400 hover:text-white" />
          </button>
        </div>
      )}

      {/* Sticky / Prominent Selected Theme Action Bar */}
      {selectedTheme && (
        <div className="sticky top-20 z-30 bg-[#12141c]/95 backdrop-blur-xl border border-amber-500/30 rounded-3xl p-5 shadow-2xl transition-all">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Left: Selected Theme Summary */}
            <div className="flex items-center gap-4 flex-wrap sm:flex-nowrap">
              <div className="p-3 rounded-2xl bg-black/60 border border-white/10 flex items-center gap-1.5 shadow-inner">
                <div
                  className="w-5 h-5 rounded-full border border-white/20 shadow-md"
                  style={{ backgroundColor: selectedTheme.primaryColor }}
                  title={`Primary: ${selectedTheme.primaryColor}`}
                />
                <div
                  className="w-5 h-5 rounded-full border border-white/20 shadow-md"
                  style={{ backgroundColor: selectedTheme.secondaryColor }}
                  title={`Secondary: ${selectedTheme.secondaryColor}`}
                />
                <div
                  className="w-5 h-5 rounded-full border border-white/20 shadow-md"
                  style={{ backgroundColor: selectedTheme.accentColor }}
                  title={`Accent: ${selectedTheme.accentColor}`}
                />
                <div
                  className="w-5 h-5 rounded-full border border-white/20 shadow-md"
                  style={{ backgroundColor: selectedTheme.backgroundColor }}
                  title={`Background: ${selectedTheme.backgroundColor}`}
                />
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold">
                    Selected Theme
                  </span>
                  {isCurrentSelectionActive ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black tracking-wider uppercase flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Saved & Active
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-black tracking-wider uppercase flex items-center gap-1 animate-pulse">
                      <Eye className="w-3 h-3" />
                      Live Previewing (Unsaved)
                    </span>
                  )}
                </div>
                <h3 className="text-base font-extrabold text-white mt-0.5">
                  {selectedTheme.name}
                </h3>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2.5 flex-wrap">
              {!isCurrentSelectionActive && (
                <button
                  onClick={handleResetPreview}
                  className="py-2.5 px-4 rounded-xl font-bold text-xs bg-white/5 border border-white/10 text-zinc-300 hover:text-white hover:bg-white/10 transition"
                  title="Revert preview back to saved active theme"
                >
                  Cancel Preview
                </button>
              )}

              <button
                onClick={handleSaveAndApplyTheme}
                disabled={isSaving}
                className="py-3 px-6 rounded-2xl font-black text-xs uppercase tracking-wider bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-black hover:from-amber-400 hover:to-amber-300 transition-all shadow-xl shadow-amber-500/25 flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                id="save-theme-button"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Saving Theme...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Real-time Interactive Live Preview Container */}
      {selectedTheme && (
        <div className="bg-[#0b0c12] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
                <Monitor className="w-4 h-4" />
              </span>
              <h4 className="text-sm font-extrabold text-white">
                Live Broadcast Interface Preview
              </h4>
            </div>
            <span className="text-[11px] font-mono text-zinc-400">
              Interactive test preview of primary colors, cards, buttons & text
            </span>
          </div>

          {/* Interactive Preview Canvas with Selected Theme */}
          <div
            className="rounded-2xl p-6 border transition-all duration-300 space-y-6"
            style={{
              backgroundColor: selectedTheme.backgroundColor,
              borderColor: selectedTheme.borderColor,
              color: selectedTheme.textColor,
            }}
          >
            {/* Mock Header */}
            <div
              className="p-4 rounded-xl border flex items-center justify-between"
              style={{
                backgroundColor: selectedTheme.headerBackgroundColor,
                borderColor: selectedTheme.borderColor,
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs shadow-md"
                  style={{
                    backgroundColor: selectedTheme.primaryColor,
                    color: '#000000',
                  }}
                >
                  ★
                </div>
                <span className="font-extrabold text-sm tracking-wider" style={{ color: selectedTheme.textColor }}>
                  STAR HOUSE ARENA
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs font-semibold">
                <span className="border-b-2 font-bold pb-0.5" style={{ borderColor: selectedTheme.primaryColor, color: selectedTheme.primaryColor }}>
                  Home
                </span>
                <span style={{ color: selectedTheme.secondaryTextColor }}>Contestants</span>
                <span style={{ color: selectedTheme.secondaryTextColor }}>Live Leaderboard</span>
              </div>
            </div>

            {/* Mock Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Contestant Card Preview */}
              <div
                className="p-4 rounded-2xl border flex flex-col justify-between space-y-4 shadow-lg transition-all"
                style={{
                  backgroundColor: selectedTheme.cardBackgroundColor,
                  borderColor: selectedTheme.borderColor,
                }}
              >
                <div className="flex items-center justify-between">
                  <span
                    className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase"
                    style={{
                      backgroundColor: `${selectedTheme.primaryColor}25`,
                      color: selectedTheme.primaryColor,
                      border: `1px solid ${selectedTheme.primaryColor}50`,
                    }}
                  >
                    Rank #1
                  </span>
                  <span
                    className="px-2 py-0.5 rounded text-[10px] font-bold"
                    style={{
                      backgroundColor: `${selectedTheme.accentColor}20`,
                      color: selectedTheme.accentColor,
                    }}
                  >
                    38.4% Votes
                  </span>
                </div>

                <div>
                  <h4 className="font-extrabold text-base" style={{ color: selectedTheme.textColor }}>
                    Marcus Sterling
                  </h4>
                  <p className="text-xs mt-1" style={{ color: selectedTheme.secondaryTextColor }}>
                    Fan Favorite • Stage 4 Champion
                  </p>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    className="flex-1 py-2 px-3 rounded-xl font-black text-xs uppercase tracking-wider transition shadow-md flex items-center justify-center gap-1.5"
                    style={{
                      backgroundColor: selectedTheme.buttonColor,
                      color: '#000000',
                    }}
                  >
                    <Vote className="w-3.5 h-3.5" />
                    <span>Vote Now</span>
                  </button>
                  <button
                    className="py-2 px-3 rounded-xl font-bold text-xs border transition"
                    style={{
                      backgroundColor: `${selectedTheme.secondaryColor}`,
                      borderColor: selectedTheme.borderColor,
                      color: selectedTheme.textColor,
                    }}
                  >
                    Profile
                  </button>
                </div>
              </div>

              {/* Status & Stats Preview */}
              <div
                className="p-4 rounded-2xl border flex flex-col justify-between space-y-4 shadow-lg"
                style={{
                  backgroundColor: selectedTheme.cardBackgroundColor,
                  borderColor: selectedTheme.borderColor,
                }}
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: selectedTheme.primaryColor }} />
                  <span className="text-[11px] font-mono font-bold uppercase" style={{ color: selectedTheme.accentColor }}>
                    Certified Voting Live
                  </span>
                </div>

                <div>
                  <span className="text-[11px]" style={{ color: selectedTheme.secondaryTextColor }}>
                    Total Certified Votes
                  </span>
                  <div className="text-2xl font-black font-mono tracking-tight" style={{ color: selectedTheme.primaryColor }}>
                    1,849,204
                  </div>
                </div>

                <div
                  className="p-2.5 rounded-xl border text-xs"
                  style={{
                    backgroundColor: `${selectedTheme.secondaryColor}`,
                    borderColor: selectedTheme.borderColor,
                    color: selectedTheme.secondaryTextColor,
                  }}
                >
                  Countdown Ends: <strong style={{ color: selectedTheme.textColor }}>04h 22m 10s</strong>
                </div>
              </div>

              {/* Form & Input Field Preview */}
              <div
                className="p-4 rounded-2xl border flex flex-col justify-between space-y-4 shadow-lg"
                style={{
                  backgroundColor: selectedTheme.cardBackgroundColor,
                  borderColor: selectedTheme.borderColor,
                }}
              >
                <div className="text-xs font-bold uppercase tracking-wider" style={{ color: selectedTheme.textColor }}>
                  Interactive UI Elements
                </div>

                <div className="space-y-2">
                  <input
                    type="text"
                    readOnly
                    value="Search contestants..."
                    className="w-full px-3 py-2 rounded-xl text-xs border focus:outline-none"
                    style={{
                      backgroundColor: selectedTheme.inputBackgroundColor,
                      borderColor: selectedTheme.borderColor,
                      color: selectedTheme.textColor,
                    }}
                  />
                  <div className="flex items-center gap-2">
                    <span
                      className="px-2.5 py-1 rounded-lg text-[10px] font-black"
                      style={{
                        backgroundColor: `${selectedTheme.successColor}25`,
                        color: selectedTheme.successColor,
                        border: `1px solid ${selectedTheme.successColor}40`,
                      }}
                    >
                      SAFE
                    </span>
                    <span
                      className="px-2.5 py-1 rounded-lg text-[10px] font-black"
                      style={{
                        backgroundColor: `${selectedTheme.warningColor}25`,
                        color: selectedTheme.warningColor,
                        border: `1px solid ${selectedTheme.warningColor}40`,
                      }}
                    >
                      NOMINATED
                    </span>
                    <span
                      className="px-2.5 py-1 rounded-lg text-[10px] font-black"
                      style={{
                        backgroundColor: `${selectedTheme.errorColor}25`,
                        color: selectedTheme.errorColor,
                        border: `1px solid ${selectedTheme.errorColor}40`,
                      }}
                    >
                      EVICTED
                    </span>
                  </div>
                </div>

                <div className="text-[11px] truncate" style={{ color: selectedTheme.secondaryTextColor }}>
                  Hex Palette: {selectedTheme.primaryColor} • {selectedTheme.secondaryColor} • {selectedTheme.accentColor}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mode Switcher Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2 overflow-x-auto custom-scrollbar">
        <button
          onClick={() => setViewMode('palettes')}
          className={`py-2.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition flex items-center gap-2 whitespace-nowrap ${
            viewMode === 'palettes'
              ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
              : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10'
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>44 Predefined Palettes</span>
        </button>

        <button
          onClick={() => setViewMode('colors')}
          className={`py-2.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition flex items-center gap-2 whitespace-nowrap ${
            viewMode === 'colors'
              ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
              : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Custom Color Editor</span>
        </button>

        <button
          onClick={() => setViewMode('gradients')}
          className={`py-2.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition flex items-center gap-2 whitespace-nowrap ${
            viewMode === 'gradients'
              ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
              : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Gradient Builder</span>
        </button>

        <button
          onClick={() => setViewMode('backgrounds')}
          className={`py-2.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition flex items-center gap-2 whitespace-nowrap ${
            viewMode === 'backgrounds'
              ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
              : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>Wallpapers & Assets</span>
        </button>

        <button
          onClick={() => setViewMode('typography')}
          className={`py-2.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition flex items-center gap-2 whitespace-nowrap ${
            viewMode === 'typography'
              ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
              : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10'
          }`}
        >
          <Type className="w-4 h-4" />
          <span>Typography & Radii</span>
        </button>
      </div>

      {/* VIEW MODE 1: 44 PREDEFINED COLOR COMBINATIONS */}
      {viewMode === 'palettes' && (
        <div className="space-y-6">
          {/* Search & Category Filter Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`py-1.5 px-3 rounded-xl font-bold text-xs transition ${
                    selectedCategory === cat
                      ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                      : 'bg-[#12141c] text-zinc-400 hover:text-white hover:bg-white/10 border border-white/5'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-64">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search palettes or hex..."
                className="w-full bg-[#12141c] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Color Palettes Grid (44 Combinations) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredPalettes.map((palette) => {
              const isSelected = selectedTheme?.id === palette.id || selectedTheme?.preset === palette.preset;
              const isSavedActive = activeThemeId === palette.id || (siteSettings?.theme?.preset === palette.preset);

              return (
                <div
                  key={palette.id}
                  onClick={() => handleSelectCombination(palette)}
                  className={`group p-5 rounded-2xl cursor-pointer transition-all duration-200 border flex flex-col justify-between space-y-4 relative ${
                    isSelected
                      ? 'bg-[#161a26] border-amber-500 ring-2 ring-amber-500/40 shadow-xl shadow-amber-500/10 -translate-y-1'
                      : 'bg-[#0f1118] border-white/10 hover:border-white/30 hover:bg-[#141620]'
                  }`}
                >
                  {/* Selected / Active Status Badges */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">
                      {palette.category}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {isSavedActive && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-black uppercase tracking-wider">
                          Active
                        </span>
                      )}

                      {isSelected && (
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-black font-mono font-black text-[9px] tracking-wider uppercase shadow-md flex items-center gap-1">
                          <Check className="w-3 h-3 stroke-[3]" />
                          Selected
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Combination Name & Description */}
                  <div>
                    <h4 className="font-extrabold text-white text-base group-hover:text-amber-300 transition-colors">
                      {palette.name}
                    </h4>
                    <p className="text-xs text-zinc-400 line-clamp-1 mt-0.5">
                      {palette.description}
                    </p>
                  </div>

                  {/* 4 Main Colors Palette Swatches */}
                  <div className="space-y-1.5">
                    <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest flex items-center justify-between">
                      <span>Palette Colors</span>
                      <span className="text-[9px] opacity-70">4 Tones</span>
                    </div>

                    <div className="grid grid-cols-4 gap-1.5 p-2 rounded-xl bg-black/60 border border-white/5">
                      {/* Primary */}
                      <div className="flex flex-col items-center gap-1">
                        <div
                          className="w-full h-7 rounded-lg border border-white/15 shadow-inner"
                          style={{ backgroundColor: palette.colors.primary }}
                          title={`Primary: ${palette.colors.primary}`}
                        />
                        <span className="text-[9px] font-mono text-zinc-400 font-bold truncate max-w-full">
                          Pri
                        </span>
                      </div>

                      {/* Secondary */}
                      <div className="flex flex-col items-center gap-1">
                        <div
                          className="w-full h-7 rounded-lg border border-white/15 shadow-inner"
                          style={{ backgroundColor: palette.colors.secondary }}
                          title={`Secondary: ${palette.colors.secondary}`}
                        />
                        <span className="text-[9px] font-mono text-zinc-400 font-bold truncate max-w-full">
                          Sec
                        </span>
                      </div>

                      {/* Accent */}
                      <div className="flex flex-col items-center gap-1">
                        <div
                          className="w-full h-7 rounded-lg border border-white/15 shadow-inner"
                          style={{ backgroundColor: palette.colors.accent }}
                          title={`Accent: ${palette.colors.accent}`}
                        />
                        <span className="text-[9px] font-mono text-zinc-400 font-bold truncate max-w-full">
                          Acc
                        </span>
                      </div>

                      {/* Background */}
                      <div className="flex flex-col items-center gap-1">
                        <div
                          className="w-full h-7 rounded-lg border border-white/15 shadow-inner"
                          style={{ backgroundColor: palette.colors.background }}
                          title={`Background: ${palette.colors.background}`}
                        />
                        <span className="text-[9px] font-mono text-zinc-400 font-bold truncate max-w-full">
                          Bg
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom: Click to select action note */}
                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                    <span className="text-[11px] font-mono text-zinc-400">
                      {palette.colors.primary}
                    </span>
                    <span
                      className={`text-[11px] font-bold transition ${
                        isSelected ? 'text-amber-400' : 'text-zinc-500 group-hover:text-zinc-300'
                      }`}
                    >
                      {isSelected ? 'Previewing' : 'Click to preview →'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW MODE 2: CUSTOM COLOR EDITOR (17 Detailed Slots) */}
      {viewMode === 'colors' && selectedTheme && (
        <div className="bg-[#12141c] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h3 className="text-base font-extrabold text-white">
                Detailed Color Slots Editor
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Fine-tune individual UI surfaces, typography, buttons, and status indicator colors.
              </p>
            </div>

            <button
              onClick={handleSaveAndApplyTheme}
              disabled={isSaving}
              className="py-2 px-4 rounded-xl font-bold text-xs uppercase bg-amber-500 text-black hover:bg-amber-400 transition flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Palette</span>
            </button>
          </div>

          {/* Color Slots Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {COLOR_SLOTS.map((slot) => {
              const val = (selectedTheme[slot.key] as string) || '#000000';

              return (
                <div
                  key={slot.key}
                  className="p-4 rounded-2xl bg-[#0a0b0f] border border-white/10 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-white text-xs">{slot.label}</h4>
                      <p className="text-[10px] text-zinc-400 line-clamp-1 mt-0.5">{slot.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <input
                      type="color"
                      value={val}
                      onChange={(e) => handleColorChange(slot.key, e.target.value)}
                      className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0 p-0"
                    />
                    <input
                      type="text"
                      value={val}
                      onChange={(e) => handleColorChange(slot.key, e.target.value)}
                      className="flex-1 bg-[#181a24] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW MODE 3: GRADIENT BUILDER */}
      {viewMode === 'gradients' && selectedTheme && (
        <div className="bg-[#12141c] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h3 className="text-base font-extrabold text-white">
                Multi-Stop Gradient Generator
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Generate smooth linear and radial broadcast gradients for buttons, headers, and hero containers.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="text-xs font-bold text-zinc-300">Type:</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setGradientType('linear')}
                    className={`py-1.5 px-3 rounded-lg text-xs font-bold ${
                      gradientType === 'linear' ? 'bg-amber-500 text-black' : 'bg-white/5 text-zinc-400'
                    }`}
                  >
                    Linear
                  </button>
                  <button
                    onClick={() => setGradientType('radial')}
                    className={`py-1.5 px-3 rounded-lg text-xs font-bold ${
                      gradientType === 'radial' ? 'bg-amber-500 text-black' : 'bg-white/5 text-zinc-400'
                    }`}
                  >
                    Radial
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">Color 1</label>
                  <input
                    type="color"
                    value={gradColor1}
                    onChange={(e) => setGradColor1(e.target.value)}
                    className="w-full h-10 rounded-xl cursor-pointer bg-transparent border border-white/10"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">Color 2</label>
                  <input
                    type="color"
                    value={gradColor2}
                    onChange={(e) => setGradColor2(e.target.value)}
                    className="w-full h-10 rounded-xl cursor-pointer bg-transparent border border-white/10"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">Color 3 (Optional)</label>
                  <input
                    type="color"
                    value={gradColor3 || '#000000'}
                    onChange={(e) => setGradColor3(e.target.value)}
                    className="w-full h-10 rounded-xl cursor-pointer bg-transparent border border-white/10"
                  />
                </div>
              </div>

              {gradientType === 'linear' && (
                <div>
                  <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                    <span>Angle</span>
                    <span className="font-mono">{gradAngle}°</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={gradAngle}
                    onChange={(e) => setGradAngle(Number(e.target.value))}
                    className="w-full accent-amber-500"
                  />
                </div>
              )}
            </div>

            {/* Gradient Preview Box */}
            <div className="flex flex-col justify-between p-6 rounded-2xl border border-white/10 relative overflow-hidden"
                 style={{
                   background: gradientType === 'linear'
                     ? `linear-gradient(${gradAngle}deg, ${gradColor1}, ${gradColor2}${gradColor3 ? `, ${gradColor3}` : ''})`
                     : `radial-gradient(circle at center, ${gradColor1}, ${gradColor2}${gradColor3 ? `, ${gradColor3}` : ''})`
                 }}>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-black bg-white/80 px-2.5 py-1 rounded-md backdrop-blur-md self-start">
                Live Gradient Output
              </span>
              <div className="text-xs font-mono bg-black/70 p-2.5 rounded-xl text-white backdrop-blur-md">
                {gradientType === 'linear'
                  ? `linear-gradient(${gradAngle}deg, ${gradColor1}, ${gradColor2})`
                  : `radial-gradient(circle, ${gradColor1}, ${gradColor2})`}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODE 4: BACKGROUND WALLPAPERS */}
      {viewMode === 'backgrounds' && selectedTheme && (
        <div className="bg-[#12141c] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-6">
          <div className="border-b border-white/10 pb-4">
            <h3 className="text-base font-extrabold text-white">
              Device Background Wallpapers & Textures
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Set custom stage wallpapers for desktop, tablet, and mobile viewers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['desktopBackground', 'tabletBackground', 'mobileBackground'].map((bgKey) => (
              <div key={bgKey} className="p-4 rounded-2xl bg-[#0a0b0f] border border-white/10 space-y-3">
                <h4 className="font-bold text-white text-xs uppercase tracking-wider">{bgKey}</h4>
                <input
                  type="text"
                  value={(selectedTheme.backgrounds as any)?.[bgKey] || ''}
                  onChange={(e) => {
                    const updated = {
                      ...selectedTheme,
                      backgrounds: {
                        ...selectedTheme.backgrounds,
                        [bgKey]: e.target.value,
                      }
                    };
                    setSelectedTheme(updated);
                  }}
                  placeholder="https://example.com/wallpaper.jpg"
                  className="w-full bg-[#181a24] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW MODE 5: TYPOGRAPHY & RADII */}
      {viewMode === 'typography' && selectedTheme && (
        <div className="bg-[#12141c] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-6">
          <div className="border-b border-white/10 pb-4">
            <h3 className="text-base font-extrabold text-white">
              Typography & Interface Geometry
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Configure global font pairings and card border radii across the application.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-xs font-bold text-zinc-300">Border Radius: {selectedTheme.borderRadius || '1rem'}</label>
              <div className="flex items-center gap-2">
                {['0rem', '0.5rem', '0.75rem', '1rem', '1.5rem'].map((rad) => (
                  <button
                    key={rad}
                    onClick={() => handleColorChange('borderRadius', rad)}
                    className={`py-2 px-3 rounded-xl font-mono text-xs font-bold transition ${
                      selectedTheme.borderRadius === rad ? 'bg-amber-500 text-black' : 'bg-white/5 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {rad}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-zinc-300">Shadow / Glow Intensity</label>
              <div className="flex items-center gap-2">
                {['subtle', 'medium', 'glow'].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => handleColorChange('shadowLevel', lvl)}
                    className={`py-2 px-3 rounded-xl uppercase text-xs font-bold transition ${
                      selectedTheme.shadowLevel === lvl ? 'bg-amber-500 text-black' : 'bg-white/5 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RESET CONFIRMATION MODAL */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#12141c] border border-rose-500/30 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertTriangle className="w-6 h-6 flex-shrink-0" />
              <h3 className="font-extrabold text-white text-base">
                Reset All Themes to Official Presets?
              </h3>
            </div>
            <p className="text-xs text-zinc-400">
              This will restore all 44 predefined color combinations and reset any custom edits back to factory defaults.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsResetModalOpen(false)}
                className="py-2 px-4 rounded-xl text-xs font-bold text-zinc-400 hover:text-white bg-white/5 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleResetToDefaults}
                className="py-2 px-4 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 transition"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* IMPORT JSON MODAL */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#12141c] border border-white/10 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-extrabold text-white text-base">Import Theme JSON</h3>
              <button onClick={() => setIsImportModalOpen(false)}>
                <X className="w-4 h-4 text-zinc-400 hover:text-white" />
              </button>
            </div>
            <textarea
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              placeholder="Paste theme JSON configuration here..."
              rows={8}
              className="w-full bg-[#0a0b0f] border border-white/10 rounded-xl p-3 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="py-2 px-4 rounded-xl text-xs font-bold text-zinc-400 hover:text-white bg-white/5 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleImportJson}
                className="py-2 px-4 rounded-xl text-xs font-bold text-black bg-amber-500 hover:bg-amber-400 transition"
              >
                Import Theme
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
