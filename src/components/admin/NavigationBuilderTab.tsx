import React, { useState, useEffect } from 'react';
import { NavigationItem, SiteSettings } from '../../types';
import { api } from '../../services/api';
import {
  Menu,
  Plus,
  Trash2,
  Edit2,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
  Save,
  Link2,
  RotateCcw,
  Sparkles,
  Radio,
  Users,
  Trophy,
  BarChart3,
  BookOpen,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Layers,
  ArrowRight
} from 'lucide-react';

interface NavigationBuilderTabProps {
  siteSettings: SiteSettings | null;
  onRefresh: () => Promise<void>;
  onShowNotification: (msg: string, type?: 'success' | 'error') => void;
}

export const NavigationBuilderTab: React.FC<NavigationBuilderTabProps> = ({
  siteSettings,
  onRefresh,
  onShowNotification,
}) => {
  const [navItems, setNavItems] = useState<NavigationItem[]>(() => {
    return siteSettings?.navigationItems || [
      { id: 'nav_home', label: 'Home', url: 'home', order: 1, isEnabled: true },
      { id: 'nav_contestants', label: 'Contestants', url: 'contestants', order: 2, isEnabled: true },
      { id: 'nav_ranking', label: 'Live Ranking', url: 'ranking', order: 3, isEnabled: true },
      { id: 'nav_results', label: 'Results', url: 'results', order: 4, isEnabled: true },
      { id: 'nav_about', label: 'Rules & Info', url: 'about', order: 5, isEnabled: true },
    ];
  });

  const [newLabel, setNewLabel] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [editUrl, setEditUrl] = useState('');

  useEffect(() => {
    if (siteSettings?.navigationItems && siteSettings.navigationItems.length > 0) {
      setNavItems(siteSettings.navigationItems);
    }
  }, [siteSettings]);

  const getItemIcon = (url?: string) => {
    const clean = String(url || '').replace('#/', '').replace('#', '').trim().toLowerCase();
    if (clean === 'home') return Radio;
    if (clean === 'contestants') return Users;
    if (clean === 'ranking') return Trophy;
    if (clean === 'results') return BarChart3;
    if (clean === 'about' || clean === 'rules') return BookOpen;
    return Link2;
  };

  const handleToggleItem = async (item: NavigationItem) => {
    const updated = navItems.map((n) =>
      n.id === item.id ? { ...n, isEnabled: !n.isEnabled } : n
    );
    setNavItems(updated);

    try {
      const res = await api.saveBulkNavigation(updated);
      setNavItems(res.navigation);
      const actionWord = !item.isEnabled ? 'VISIBLE' : 'HIDDEN';
      onShowNotification(`"${item.label || 'Link'}" is now ${actionWord} in the navigation menu.`);
      await onRefresh();
    } catch (err: any) {
      onShowNotification(err.message || 'Failed to update visibility', 'error');
      await onRefresh();
    }
  };

  const handleSetSpecificItemVisibility = async (urlKey: string, setVisible: boolean) => {
    const targetKey = String(urlKey || '').toLowerCase();
    const updated = navItems.map((n) => {
      const clean = String(n?.url || '').replace('#/', '').replace('#', '').trim().toLowerCase();
      if (clean === targetKey) {
        return { ...n, isEnabled: setVisible };
      }
      return n;
    });

    setNavItems(updated);
    try {
      const res = await api.saveBulkNavigation(updated);
      setNavItems(res.navigation);
      onShowNotification(`Navigation for ${urlKey} set to ${setVisible ? 'SHOW' : 'HIDE'}.`);
      await onRefresh();
    } catch (err: any) {
      onShowNotification(err.message || 'Failed to update item visibility', 'error');
    }
  };

  const handleToggleAll = async (targetVisibility: boolean) => {
    const updated = navItems.map((n) => ({ ...n, isEnabled: targetVisibility }));
    setNavItems(updated);

    try {
      const res = await api.saveBulkNavigation(updated);
      setNavItems(res.navigation);
      onShowNotification(
        targetVisibility
          ? 'All 5 navigation links are now VISIBLE!'
          : 'All navigation links are now HIDDEN from the header menu.'
      );
      await onRefresh();
    } catch (err: any) {
      onShowNotification(err.message || 'Failed to update all navigation items', 'error');
      await onRefresh();
    }
  };

  const handleMoveItem = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= navItems.length) return;

    const newArr = [...navItems];
    const temp = newArr[index];
    newArr[index] = newArr[targetIndex];
    newArr[targetIndex] = temp;

    // reassign order sequence
    const reordered = newArr.map((item, idx) => ({ ...item, order: idx + 1 }));
    setNavItems(reordered);

    try {
      const res = await api.saveBulkNavigation(reordered);
      setNavItems(res.navigation);
      onShowNotification('Navigation menu reordered successfully!');
      await onRefresh();
    } catch (err: any) {
      onShowNotification(err.message || 'Failed to save navigation order', 'error');
      await onRefresh();
    }
  };

  const handleResetDefaults = async () => {
    if (!window.confirm('Reset navigation menu to default 5 items (Home, Contestants, Live Ranking, Results, Rules & Info)?')) return;

    try {
      const res = await api.resetDefaultNavigation();
      setNavItems(res.navigation);
      onShowNotification('Navigation restored to default 5 menu links!');
      await onRefresh();
    } catch (err: any) {
      onShowNotification(err.message || 'Failed to reset navigation', 'error');
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel.trim() || !newUrl.trim()) return;

    try {
      const res = await api.createAdminNavigationItem({
        label: newLabel.trim(),
        url: newUrl.trim(),
        isEnabled: true,
      });
      setNavItems(res.navigation);
      setNewLabel('');
      setNewUrl('');
      setIsAdding(false);
      onShowNotification(`Added "${newLabel.trim()}" to navigation menu!`);
      await onRefresh();
    } catch (err: any) {
      onShowNotification(err.message || 'Failed to add menu item', 'error');
    }
  };

  const handleStartEdit = (item: NavigationItem) => {
    setEditingId(item.id);
    setEditLabel(item.label);
    setEditUrl(item.url);
  };

  const handleSaveEdit = async (item: NavigationItem) => {
    if (!editLabel.trim() || !editUrl.trim()) return;

    const updated = navItems.map((n) =>
      n.id === item.id ? { ...n, label: editLabel.trim(), url: editUrl.trim() } : n
    );
    setNavItems(updated);
    setEditingId(null);

    try {
      const res = await api.saveBulkNavigation(updated);
      setNavItems(res.navigation);
      onShowNotification(`"${editLabel.trim()}" updated successfully!`);
      await onRefresh();
    } catch (err: any) {
      onShowNotification(err.message || 'Failed to update item', 'error');
      await onRefresh();
    }
  };

  const handleDeleteItem = async (item: NavigationItem) => {
    if (!window.confirm(`Delete menu link "${item.label}"?`)) return;
    try {
      const res = await api.deleteAdminNavigationItem(item.id);
      setNavItems(res.navigation);
      onShowNotification(`"${item.label}" removed from menu.`);
      await onRefresh();
    } catch (err: any) {
      onShowNotification(err.message || 'Failed to delete menu item', 'error');
    }
  };

  // Predefined quick targets
  const primaryKeys = [
    { key: 'home', label: 'Home', defaultName: 'Home', icon: Radio },
    { key: 'contestants', label: 'Contestants', defaultName: 'Contestants', icon: Users },
    { key: 'ranking', label: 'Live Ranking', defaultName: 'Live Ranking', icon: Trophy },
    { key: 'results', label: 'Results', defaultName: 'Results', icon: BarChart3 },
    { key: 'about', label: 'Rules & Info', defaultName: 'Rules & Info', icon: BookOpen },
  ];

  const visibleItems = navItems.filter((n) => n.isEnabled);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-zinc-900/60 p-6 rounded-3xl border border-white/10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Navigation & Menu Visibility Control</span>
          </div>
          <h2 className="text-xl font-serif font-black text-white flex items-center gap-2">
            <Menu className="w-5 h-5 text-amber-400" />
            Navigation Menu Builder (HIDE / SHOW)
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Control the visibility, order, and labels for all header and mobile navigation links: 
            <strong className="text-zinc-200 ml-1">Home, Contestants, Live Ranking, Results, Rules & Info</strong>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => handleToggleAll(true)}
            className="px-3 py-2 rounded-xl text-xs font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition flex items-center gap-1.5"
            title="Make all 5 navigation links visible"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Show All</span>
          </button>

          <button
            type="button"
            onClick={() => handleToggleAll(false)}
            className="px-3 py-2 rounded-xl text-xs font-bold bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 transition flex items-center gap-1.5"
            title="Hide all navigation links from header"
          >
            <EyeOff className="w-3.5 h-3.5" />
            <span>Hide All</span>
          </button>

          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-3 py-2 rounded-xl text-xs font-bold bg-white/5 border border-white/10 text-zinc-300 hover:text-white hover:bg-white/10 transition flex items-center gap-1.5"
            title="Restore standard 5 links"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset 5 Links</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAdding(!isAdding)}
            className="py-2 px-4 rounded-xl font-black text-xs uppercase tracking-wider bg-amber-500 text-black hover:bg-amber-400 transition flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add Custom Link</span>
          </button>
        </div>
      </div>

      {/* QUICK TOGGLE DASHBOARD FOR THE 5 PRIMARY LINKS */}
      <div className="p-5 rounded-3xl bg-zinc-900/40 border border-white/10 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" />
            Quick Hide / Show Toggles for Primary 5 Links
          </span>
          <span className="text-[11px] font-mono text-zinc-500">
            {visibleItems.length} of {navItems.length} Active in Header
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {primaryKeys.map((pk) => {
            const targetKey = String(pk?.key || '').toLowerCase();
            const item = navItems.find((n) => {
              const clean = String(n?.url || '').replace('#/', '').replace('#', '').trim().toLowerCase();
              return clean === targetKey;
            });
            const isVisible = item ? item.isEnabled : false;
            const Icon = pk.icon;

            return (
              <div
                key={pk.key}
                className={`p-3.5 rounded-2xl border transition flex flex-col justify-between gap-3 ${
                  isVisible
                    ? 'bg-amber-500/5 border-amber-500/30'
                    : 'bg-zinc-950/60 border-white/5 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-amber-400">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span
                    className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-md ${
                      isVisible
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {isVisible ? 'VISIBLE' : 'HIDDEN'}
                  </span>
                </div>

                <div>
                  <div className="text-xs font-bold text-white leading-tight">
                    {item ? item.label : pk.defaultName}
                  </div>
                  <div className="text-[10px] font-mono text-zinc-500">
                    #{pk.key}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (item) {
                      handleToggleItem(item);
                    } else {
                      handleSetSpecificItemVisibility(pk.key, true);
                    }
                  }}
                  className={`w-full py-1.5 px-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1 transition ${
                    isVisible
                      ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20'
                      : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'
                  }`}
                >
                  {isVisible ? (
                    <>
                      <EyeOff className="w-3 h-3" />
                      <span>HIDE</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-3 h-3" />
                      <span>SHOW</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* LIVE NAVIGATION PREVIEW */}
      <div className="p-4 sm:p-5 rounded-3xl bg-black/60 border border-white/10 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-amber-400" />
            Live Header Navigation Preview
          </span>
          <span className="text-[11px] text-zinc-500">
            {visibleItems.length === 0 ? 'No links visible (Header empty)' : 'Preview with active links'}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-950 border border-white/10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-serif font-black text-amber-400 text-sm">
            <Sparkles className="w-4 h-4" />
            <span>{siteSettings?.branding?.websiteName || 'STAR HOUSE'}</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 bg-white/[0.04] p-1.5 rounded-full border border-white/10">
            {visibleItems.length > 0 ? (
              visibleItems.map((item, idx) => {
                const Icon = getItemIcon(item.url);
                return (
                  <span
                    key={item.id}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                      idx === 0
                        ? 'bg-amber-500 text-black font-black'
                        : 'text-zinc-300 hover:text-white bg-white/5'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    <span>{item.label}</span>
                  </span>
                );
              })
            ) : (
              <span className="text-xs text-rose-400 italic px-3 py-1">
                All navigation links are currently HIDDEN
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold text-zinc-400 px-2.5 py-1 rounded-lg border border-white/10">
              Login
            </span>
            <span className="text-[10px] uppercase font-bold text-black bg-amber-500 px-2.5 py-1 rounded-lg">
              Sign Up
            </span>
          </div>
        </div>
      </div>

      {/* Add Custom Link Form */}
      {isAdding && (
        <form
          onSubmit={handleAddItem}
          className="p-6 rounded-3xl bg-zinc-900/80 border border-amber-500/30 space-y-4 animate-fade-in"
        >
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Plus className="w-4 h-4 text-amber-400" />
            Add New Navigation Link
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-zinc-400 block mb-1 font-bold">Link Label</label>
              <input
                type="text"
                required
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="e.g. Grand Finale Special"
                className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-400 block mb-1 font-bold">Target Route / URL</label>
              <input
                type="text"
                required
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="e.g. contestants or ranking or https://..."
                className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-amber-500 text-black hover:bg-amber-400"
            >
              Save Link
            </button>
          </div>
        </form>
      )}

      {/* NAVIGATION ITEMS DETAILED ORDER & VISIBILITY TABLE */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-2">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
            Reorder & Detailed Settings ({navItems.length} Links)
          </span>
          <span className="text-[11px] text-zinc-500">
            Use arrows to reorder • Click HIDE/SHOW to toggle instantly
          </span>
        </div>

        {navItems.map((item, index) => {
          const Icon = getItemIcon(item.url);
          const isEditing = editingId === item.id;

          return (
            <div
              key={item.id}
              className={`p-4 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                item.isEnabled
                  ? 'bg-zinc-900/60 border-white/10 hover:border-amber-500/30'
                  : 'bg-zinc-950/40 border-white/5 opacity-60'
              }`}
            >
              {/* Left side: order arrows, icon, label/url */}
              <div className="flex items-center gap-3">
                {/* Reorder Up/Down */}
                <div className="flex flex-col gap-0.5">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => handleMoveItem(index, 'up')}
                    className="p-1 rounded bg-white/5 hover:bg-white/15 text-zinc-400 hover:text-amber-400 disabled:opacity-20 disabled:hover:bg-transparent"
                    title="Move Up"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={index === navItems.length - 1}
                    onClick={() => handleMoveItem(index, 'down')}
                    className="p-1 rounded bg-white/5 hover:bg-white/15 text-zinc-400 hover:text-amber-400 disabled:opacity-20 disabled:hover:bg-transparent"
                    title="Move Down"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                <span className="w-8 h-8 rounded-xl bg-black/50 border border-white/10 flex items-center justify-center text-xs font-mono font-bold text-amber-400">
                  {index + 1}
                </span>

                <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-amber-400">
                  <Icon className="w-4 h-4" />
                </div>

                {isEditing ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="text"
                      value={editLabel}
                      onChange={(e) => setEditLabel(e.target.value)}
                      className="px-3 py-1.5 bg-black/60 border border-amber-500 rounded-lg text-xs text-white"
                      placeholder="Label"
                    />
                    <input
                      type="text"
                      value={editUrl}
                      onChange={(e) => setEditUrl(e.target.value)}
                      className="px-3 py-1.5 bg-black/60 border border-amber-500 rounded-lg text-xs text-white"
                      placeholder="Route/URL"
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveEdit(item)}
                      className="px-3 py-1.5 bg-amber-500 text-black rounded-lg text-xs font-bold hover:bg-amber-400"
                    >
                      <Save className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="px-3 py-1.5 bg-white/10 text-zinc-300 rounded-lg text-xs hover:bg-white/20"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{item.label}</span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                          item.isEnabled
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-rose-500/20 text-rose-400'
                        }`}
                      >
                        {item.isEnabled ? 'VISIBLE' : 'HIDDEN'}
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-zinc-500 flex items-center gap-1 mt-0.5">
                      <Link2 className="w-3 h-3" /> #{item.url}
                    </div>
                  </div>
                )}
              </div>

              {/* Right side: HIDE/SHOW button, Edit, Delete */}
              <div className="flex items-center gap-2 self-end sm:self-center">
                {/* PROMINENT HIDE / SHOW BUTTON */}
                <button
                  type="button"
                  onClick={() => handleToggleItem(item)}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition ${
                    item.isEnabled
                      ? 'bg-rose-500/15 border border-rose-500/30 text-rose-400 hover:bg-rose-500/25'
                      : 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25'
                  }`}
                  title={item.isEnabled ? 'Hide link from menu' : 'Make link visible in menu'}
                >
                  {item.isEnabled ? (
                    <>
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>HIDE</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5" />
                      <span>SHOW</span>
                    </>
                  )}
                </button>

                {!isEditing && (
                  <button
                    type="button"
                    onClick={() => handleStartEdit(item)}
                    className="p-2 rounded-xl text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 transition"
                    title="Edit Label & Target"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleDeleteItem(item)}
                  className="p-2 rounded-xl text-zinc-400 hover:text-rose-400 bg-white/5 hover:bg-rose-500/10 transition"
                  title="Delete link"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
