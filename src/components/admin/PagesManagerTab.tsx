import React, { useState, useEffect } from 'react';
import { PageContent } from '../../types';
import { api } from '../../services/api';
import { FileText, Save, Plus, Trash2, Edit3, CheckCircle2 } from 'lucide-react';

interface PagesManagerTabProps {
  onShowNotification: (msg: string, type?: 'success' | 'error') => void;
}

export const PagesManagerTab: React.FC<PagesManagerTabProps> = ({ onShowNotification }) => {
  const [pages, setPages] = useState<Record<string, PageContent>>({});
  const [selectedSlug, setSelectedSlug] = useState<string>('about');
  const [currentPage, setCurrentPage] = useState<PageContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const loadPages = async () => {
    try {
      setIsLoading(true);
      const data = await api.getAdminPages();
      setPages(data.pages || {});
      if (data.pages && data.pages[selectedSlug]) {
        setCurrentPage(data.pages[selectedSlug]);
      } else if (data.pages && Object.keys(data.pages).length > 0) {
        const firstSlug = Object.keys(data.pages)[0];
        setSelectedSlug(firstSlug);
        setCurrentPage(data.pages[firstSlug]);
      }
    } catch (err: any) {
      onShowNotification(err.message || 'Failed to fetch pages', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPages();
  }, []);

  const handleSelectPage = (slug: string) => {
    setSelectedSlug(slug);
    if (pages[slug]) {
      setCurrentPage(pages[slug]);
    }
  };

  const handleSavePage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPage) return;

    try {
      setIsSaving(true);
      const res = await api.updateAdminPage(selectedSlug, currentPage);
      setPages((prev) => ({ ...prev, [selectedSlug]: res.page }));
      onShowNotification(`Page "${res.page.title}" updated and published!`);
    } catch (err: any) {
      onShowNotification(err.message || 'Failed to update page', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddSection = () => {
    if (!currentPage) return;
    const newSection = { title: 'New Subheading', body: 'Add your paragraph text here...' };
    setCurrentPage({
      ...currentPage,
      sections: [...(currentPage.sections || []), newSection],
    });
  };

  const handleRemoveSection = (idx: number) => {
    if (!currentPage || !currentPage.sections) return;
    const updated = [...currentPage.sections];
    updated.splice(idx, 1);
    setCurrentPage({ ...currentPage, sections: updated });
  };

  const handleUpdateSection = (idx: number, field: 'title' | 'body', val: string) => {
    if (!currentPage || !currentPage.sections) return;
    const updated = [...currentPage.sections];
    updated[idx] = { ...updated[idx], [field]: val };
    setCurrentPage({ ...currentPage, sections: updated });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-zinc-900/60 p-6 rounded-3xl border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-black text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-400" />
            Website Pages & Content Manager
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Edit text, voting rules, disclaimers, FAQ items, and about sections directly.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Page Selector Sidebar */}
        <div className="lg:col-span-1 space-y-2">
          <label className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 block px-1">
            Available Pages
          </label>
          <div className="space-y-1">
            {Object.keys(pages).map((slug) => {
              const p = pages[slug];
              const isSelected = selectedSlug === slug;
              return (
                <button
                  key={slug}
                  onClick={() => handleSelectPage(slug)}
                  className={`w-full p-3.5 rounded-2xl border text-left transition flex items-center justify-between ${
                    isSelected
                      ? 'bg-amber-500 text-black font-black border-amber-400 shadow-md shadow-amber-500/20'
                      : 'bg-zinc-900/40 border-white/10 text-zinc-300 hover:bg-white/5'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold">{p.title || slug}</div>
                    <div className="text-[10px] font-mono opacity-70">/{slug}</div>
                  </div>
                  {isSelected && <CheckCircle2 className="w-4 h-4" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Page Editor Form */}
        <div className="lg:col-span-3">
          {currentPage ? (
            <form onSubmit={handleSavePage} className="p-6 rounded-3xl bg-zinc-900/50 border border-white/10 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <h3 className="text-lg font-serif font-bold text-white">
                  Editing: <span className="text-amber-400">{currentPage.title}</span>
                </h3>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="py-2.5 px-5 rounded-xl font-black text-xs uppercase tracking-wider bg-amber-500 text-black hover:bg-amber-400 transition flex items-center gap-2 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Saving...' : 'Publish Page'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-zinc-300 block mb-1">Page Title</label>
                  <input
                    type="text"
                    required
                    value={currentPage.title}
                    onChange={(e) => setCurrentPage({ ...currentPage, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-300 block mb-1">Page Subtitle</label>
                  <input
                    type="text"
                    value={currentPage.subtitle}
                    onChange={(e) => setCurrentPage({ ...currentPage, subtitle: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1">Main Introduction Content</label>
                <textarea
                  rows={4}
                  value={currentPage.content}
                  onChange={(e) => setCurrentPage({ ...currentPage, content: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 leading-relaxed"
                />
              </div>

              {/* Sub-sections / FAQ Items / Blocks */}
              <div className="space-y-4 pt-4 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">
                    Content Blocks & Accordions
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddSection}
                    className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-amber-400 text-xs font-bold hover:bg-white/10 flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Block</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {currentPage.sections?.map((sec, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3 relative">
                      <div className="flex items-center justify-between">
                        <input
                          type="text"
                          value={sec.title}
                          onChange={(e) => handleUpdateSection(idx, 'title', e.target.value)}
                          placeholder="Section Title / Question"
                          className="bg-transparent border-b border-transparent hover:border-white/20 focus:border-amber-400 text-xs font-bold text-white focus:outline-none w-3/4 px-1"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveSection(idx)}
                          className="p-1 rounded-lg text-zinc-500 hover:text-rose-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <textarea
                        rows={3}
                        value={sec.body}
                        onChange={(e) => handleUpdateSection(idx, 'body', e.target.value)}
                        placeholder="Section Body / Answer text..."
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-zinc-300 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </form>
          ) : (
            <div className="p-12 text-center text-zinc-500 bg-zinc-900/40 rounded-3xl border border-white/10">
              Select a page to edit content
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
