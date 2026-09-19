import React, { useState } from 'react';
import { MediaItem } from '../../types';
import { api } from '../../services/api';
import {
  Image as ImageIcon,
  Plus,
  Trash2,
  Copy,
  Check,
  Search,
  ExternalLink,
  Eye,
  Filter,
  UploadCloud,
  Edit2,
  X,
  FileImage,
  Sparkles
} from 'lucide-react';

interface MediaLibraryTabProps {
  mediaList: MediaItem[];
  onRefresh: () => Promise<void>;
  onShowNotification: (msg: string, type?: 'success' | 'error') => void;
}

export const MediaLibraryTab: React.FC<MediaLibraryTabProps> = ({
  mediaList,
  onRefresh,
  onShowNotification,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Upload Form
  const [newMediaName, setNewMediaName] = useState('');
  const [newMediaUrl, setNewMediaUrl] = useState('');
  const [newMediaType, setNewMediaType] = useState<'contestant' | 'banner' | 'background' | 'branding' | 'general'>('contestant');
  const [isUploading, setIsUploading] = useState(false);

  // Edit Modal
  const [editingMedia, setEditingMedia] = useState<MediaItem | null>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Full Screen Preview Modal
  const [previewMedia, setPreviewMedia] = useState<MediaItem | null>(null);

  const filteredMedia = mediaList.filter((m) => {
    const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) || m.url.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || m.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleCopyUrl = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    onShowNotification('Image URL copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'new' | 'edit') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        if (target === 'new') {
          setNewMediaUrl(reader.result);
          if (!newMediaName) setNewMediaName(file.name.replace(/\.[^/.]+$/, ''));
        } else if (editingMedia) {
          setEditingMedia({ ...editingMedia, url: reader.result });
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCreateMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMediaName.trim() || !newMediaUrl.trim()) return;

    try {
      setIsUploading(true);
      await api.createMedia({
        name: newMediaName.trim(),
        url: newMediaUrl.trim(),
        type: newMediaType,
        size: '1.2 MB',
      });
      onShowNotification('Media asset uploaded successfully!');
      setIsUploadModalOpen(false);
      setNewMediaName('');
      setNewMediaUrl('');
      await onRefresh();
    } catch (err: any) {
      onShowNotification(err.message || 'Failed to upload media', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMedia) return;

    try {
      setIsSavingEdit(true);
      await api.updateMedia(editingMedia.id, {
        name: editingMedia.name,
        url: editingMedia.url,
        type: editingMedia.type,
      });
      onShowNotification('Media asset updated!');
      setEditingMedia(null);
      await onRefresh();
    } catch (err: any) {
      onShowNotification(err.message || 'Failed to update media', 'error');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete media asset "${name}"?`)) return;
    try {
      await api.deleteMedia(id);
      onShowNotification('Media asset deleted.');
      await onRefresh();
    } catch (err: any) {
      onShowNotification(err.message || 'Failed to delete media', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-zinc-900/90 via-[#13151f] to-zinc-900/90 p-6 rounded-3xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <ImageIcon className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-serif font-black text-white">
              Media Asset Library & File Storage
            </h2>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Central repository for contestant portraits, promo banners, background wallpapers, and official show logos.
          </p>
        </div>

        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="py-2.5 px-5 rounded-xl font-black text-xs uppercase tracking-wider bg-gradient-to-r from-amber-500 to-amber-600 text-black hover:from-amber-400 hover:to-amber-500 transition shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload New Asset</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-zinc-900/40 p-4 rounded-2xl border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search media by name or URL..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 flex-wrap overflow-x-auto w-full sm:w-auto">
          {[
            { id: 'all', label: 'All Files' },
            { id: 'contestant', label: 'Contestants' },
            { id: 'banner', label: 'Banners' },
            { id: 'background', label: 'Wallpapers' },
            { id: 'branding', label: 'Logos' },
            { id: 'general', label: 'General' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterType(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                filterType === cat.id
                  ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                  : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Media Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filteredMedia.map((m) => {
          const isCopied = copiedId === m.id;

          return (
            <div
              key={m.id}
              className="p-3 rounded-2xl bg-[#0f1118] border border-white/10 hover:border-amber-500/40 transition group relative overflow-hidden flex flex-col justify-between"
            >
              {/* Image Preview Container */}
              <div className="aspect-square rounded-xl overflow-hidden bg-black/60 relative">
                <img
                  src={m.url}
                  alt={m.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />

                {/* Badge */}
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-[9px] font-mono font-bold text-amber-400 uppercase border border-white/10">
                  {m.type}
                </span>

                {/* Hover Quick Actions Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                  <button
                    onClick={() => setPreviewMedia(m)}
                    className="p-2 rounded-xl bg-black/80 text-white hover:text-amber-400 transition"
                    title="Full View"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleCopyUrl(m.id, m.url)}
                    className="p-2 rounded-xl bg-black/80 text-white hover:text-amber-400 transition"
                    title="Copy URL"
                  >
                    {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Info & Footer */}
              <div className="pt-2.5 space-y-1.5">
                <div className="text-xs font-bold text-white truncate" title={m.name}>
                  {m.name}
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500">
                  <span>{m.size || 'Asset'}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditingMedia(m)}
                      className="p-1 hover:text-amber-400 transition"
                      title="Edit Media Info"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleDelete(m.id, m.name)}
                      className="p-1 hover:text-rose-400 transition"
                      title="Delete Media"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filteredMedia.length === 0 && (
          <div className="col-span-full py-16 text-center text-zinc-500 text-xs bg-zinc-900/20 rounded-3xl border border-white/5 space-y-2">
            <FileImage className="w-8 h-8 text-zinc-600 mx-auto" />
            <div>No media assets matching your filter criteria.</div>
          </div>
        )}
      </div>

      {/* MODAL: UPLOAD ASSET */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#12141c] border border-white/10 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 relative">
            <button
              onClick={() => setIsUploadModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-xl bg-white/5 text-zinc-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider">
                Media Ingestion
              </span>
              <h3 className="text-lg font-serif font-black text-white mt-0.5">Upload Asset to Library</h3>
            </div>

            <form onSubmit={handleCreateMedia} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300 block">Asset Name *</label>
                <input
                  type="text"
                  required
                  value={newMediaName}
                  onChange={(e) => setNewMediaName(e.target.value)}
                  placeholder="e.g. Elena Vance Official Portrait"
                  className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300 block">Category *</label>
                <select
                  value={newMediaType}
                  onChange={(e) => setNewMediaType(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="contestant">Contestant Photo</option>
                  <option value="banner">Promotional Banner</option>
                  <option value="background">Theme Background Wallpaper</option>
                  <option value="branding">Logo / Brand Mark</option>
                  <option value="general">General Asset</option>
                </select>
              </div>

              {/* Upload or URL */}
              <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-3">
                <label className="text-xs font-bold text-white flex items-center justify-between">
                  <span>Image Source (URL or File) *</span>
                  <label className="cursor-pointer text-[10px] text-amber-400 hover:underline">
                    <span>Browse Local File</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, 'new')}
                    />
                  </label>
                </label>
                <input
                  type="url"
                  required
                  value={newMediaUrl}
                  onChange={(e) => setNewMediaUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/... or data:image/..."
                  className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                />
                {newMediaUrl && (
                  <div className="relative aspect-video rounded-xl overflow-hidden border border-white/10 max-h-36">
                    <img src={newMediaUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-6 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-amber-500 text-black hover:bg-amber-400 transition shadow-lg shadow-amber-500/20 disabled:opacity-50"
                >
                  {isUploading ? 'Uploading...' : 'Save to Library'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT ASSET */}
      {editingMedia && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#12141c] border border-white/10 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 relative">
            <button
              onClick={() => setEditingMedia(null)}
              className="absolute top-5 right-5 p-1.5 rounded-xl bg-white/5 text-zinc-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider">
                Asset Metadata
              </span>
              <h3 className="text-lg font-serif font-black text-white mt-0.5">Edit Media Details</h3>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300 block">Asset Name</label>
                <input
                  type="text"
                  required
                  value={editingMedia.name}
                  onChange={(e) => setEditingMedia({ ...editingMedia, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300 block">Category</label>
                <select
                  value={editingMedia.type}
                  onChange={(e) => setEditingMedia({ ...editingMedia, type: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="contestant">Contestant Photo</option>
                  <option value="banner">Promotional Banner</option>
                  <option value="background">Theme Background Wallpaper</option>
                  <option value="branding">Logo / Brand Mark</option>
                  <option value="general">General Asset</option>
                </select>
              </div>

              <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-3">
                <label className="text-xs font-bold text-white flex items-center justify-between">
                  <span>Image URL</span>
                  <label className="cursor-pointer text-[10px] text-amber-400 hover:underline">
                    <span>Replace with File</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, 'edit')}
                    />
                  </label>
                </label>
                <input
                  type="url"
                  required
                  value={editingMedia.url}
                  onChange={(e) => setEditingMedia({ ...editingMedia, url: e.target.value })}
                  className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                />
                <div className="relative aspect-video rounded-xl overflow-hidden border border-white/10 max-h-36">
                  <img src={editingMedia.url} alt="Preview" className="w-full h-full object-cover" />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingMedia(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="px-6 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-amber-500 text-black hover:bg-amber-400 transition shadow-lg shadow-amber-500/20 disabled:opacity-50"
                >
                  {isSavingEdit ? 'Saving...' : 'Update Asset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: FULL PREVIEW */}
      {previewMedia && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#12141c] border border-white/10 rounded-3xl max-w-3xl w-full p-6 shadow-2xl space-y-4 relative">
            <button
              onClick={() => setPreviewMedia(null)}
              className="absolute top-5 right-5 p-1.5 rounded-xl bg-white/5 text-zinc-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider">
                  {previewMedia.type} Asset
                </span>
                <h3 className="text-base font-bold text-white">{previewMedia.name}</h3>
              </div>
              <button
                onClick={() => handleCopyUrl(previewMedia.id, previewMedia.url)}
                className="px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 hover:bg-amber-500 hover:text-black transition"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy URL</span>
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden bg-black/80 border border-white/10 flex items-center justify-center max-h-[65vh]">
              <img src={previewMedia.url} alt={previewMedia.name} className="max-h-[65vh] w-auto object-contain" />
            </div>

            <div className="flex items-center justify-between text-xs font-mono text-zinc-400 pt-2 border-t border-white/10">
              <span className="truncate max-w-md">{previewMedia.url}</span>
              <span>ID: {previewMedia.id}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
