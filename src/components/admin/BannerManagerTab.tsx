import React, { useState, useRef } from 'react';
import { Banner } from '../../types';
import { api } from '../../services/api';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  ChevronUp,
  ChevronDown,
  Eye,
  CheckCircle2,
  XCircle,
  Image as ImageIcon,
  Smartphone,
  Monitor,
  ExternalLink,
  X,
  Sparkles,
  Link as LinkIcon,
  Upload,
  RefreshCw,
  AlertTriangle,
  Check
} from 'lucide-react';

interface BannerManagerTabProps {
  banners: Banner[];
  onRefresh: () => Promise<void>;
  onShowNotification: (msg: string, type?: 'success' | 'error') => void;
}

export const BannerManagerTab: React.FC<BannerManagerTabProps> = ({
  banners,
  onRefresh,
  onShowNotification,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Partial<Banner> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [previewBanner, setPreviewBanner] = useState<Banner | null>(null);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [bannerToDelete, setBannerToDelete] = useState<Banner | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [zoomedImage, setZoomedImage] = useState<{ url: string; title: string } | null>(null);

  const desktopFileInputRef = useRef<HTMLInputElement>(null);
  const mobileFileInputRef = useRef<HTMLInputElement>(null);

  // All banners sorted strictly by displayOrder / order
  const sortedBanners = [...banners].sort((a, b) => (a.order || a.displayOrder || 0) - (b.order || b.displayOrder || 0));

  // URL Validation helper
  const validateUrl = (url?: string): boolean => {
    if (!url || !url.trim()) return true;
    const trimmed = url.trim();
    const lower = trimmed.toLowerCase();

    // Reject dangerous executable schemes
    if (
      lower.startsWith('javascript:') ||
      lower.startsWith('data:') ||
      lower.startsWith('vbscript:') ||
      lower.startsWith('file:')
    ) {
      return false;
    }

    // Allow http://, https://, internal # anchor, or / path
    if (
      lower.startsWith('http://') ||
      lower.startsWith('https://') ||
      trimmed.startsWith('#') ||
      trimmed.startsWith('/')
    ) {
      return true;
    }

    return false;
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setUrlError(null);
    setEditingBanner({
      name: `Home Banner ${String(banners.length + 1).padStart(2, '0')}`,
      desktopImageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1920&auto=format&fit=crop&q=85',
      mobileImageUrl: '',
      destinationUrl: 'https://',
      openInNewTab: false,
      openTarget: '_self',
      isActive: true,
      status: 'active',
      order: banners.length + 1,
      displayOrder: banners.length + 1,
    });
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (banner: Banner) => {
    setUrlError(null);
    setEditingBanner({
      ...banner,
      name: banner.name || banner.title || `Banner ${banner.order || 1}`,
      openTarget: banner.openTarget || (banner.openInNewTab ? '_blank' : '_self'),
      status: banner.status || (banner.isActive ? 'active' : 'inactive'),
      order: banner.order || banner.displayOrder || 1,
      displayOrder: banner.displayOrder || banner.order || 1,
    });
    setIsModalOpen(true);
  };

  // Save Banner (Create or Update)
  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBanner) return;

    if (!editingBanner.desktopImageUrl || !editingBanner.desktopImageUrl.trim()) {
      onShowNotification('Desktop banner image is required', 'error');
      return;
    }

    const destUrl = (editingBanner.destinationUrl || '').trim();
    if (destUrl && !validateUrl(destUrl)) {
      setUrlError('Please enter a valid URL (must start with https://, http://, # or /)');
      onShowNotification('Please enter a valid URL.', 'error');
      return;
    }
    setUrlError(null);

    try {
      setIsSaving(true);
      const payload: Partial<Banner> = {
        name: (editingBanner.name || `Banner ${editingBanner.order || 1}`).trim(),
        title: (editingBanner.name || `Banner ${editingBanner.order || 1}`).trim(),
        desktopImageUrl: editingBanner.desktopImageUrl.trim(),
        mobileImageUrl: (editingBanner.mobileImageUrl || '').trim(),
        destinationUrl: destUrl,
        ctaLink: destUrl,
        openInNewTab: editingBanner.openTarget === '_blank' || Boolean(editingBanner.openInNewTab),
        openTarget: editingBanner.openTarget === '_blank' ? '_blank' : '_self',
        isActive: editingBanner.status === 'active' || editingBanner.isActive === true,
        status: editingBanner.status || (editingBanner.isActive ? 'active' : 'inactive'),
        order: Number(editingBanner.displayOrder || editingBanner.order || 1),
        displayOrder: Number(editingBanner.displayOrder || editingBanner.order || 1),
      };

      if (editingBanner.id) {
        await api.updateBanner(editingBanner.id, payload);
        onShowNotification('Banner updated successfully!');
      } else {
        await api.createBanner(payload);
        onShowNotification('New banner added successfully!');
      }
      setIsModalOpen(false);
      setEditingBanner(null);
      await onRefresh();
    } catch (err: any) {
      onShowNotification(err.message || 'Failed to save banner', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle Active/Inactive Status
  const handleToggleActive = async (banner: Banner) => {
    try {
      await api.toggleBannerStatus(banner.id);
      const newStatus = !banner.isActive ? 'Active' : 'Disabled';
      onShowNotification(`Banner "${banner.name || banner.title || banner.id}" is now ${newStatus}.`);
      await onRefresh();
    } catch (err: any) {
      onShowNotification(err.message || 'Failed to toggle banner status', 'error');
    }
  };

  // Reorder Banner: Move Up / Move Down
  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sortedBanners.length) return;

    const reordered = [...sortedBanners];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    const bannerIds = reordered.map(b => b.id);
    try {
      await api.reorderBanners(bannerIds);
      onShowNotification('Banner order updated successfully!');
      await onRefresh();
    } catch (err: any) {
      onShowNotification(err.message || 'Failed to reorder banners', 'error');
    }
  };

  // Confirm Delete Action
  const handleConfirmDelete = async () => {
    if (!bannerToDelete) return;
    try {
      setIsDeleting(true);
      await api.deleteBanner(bannerToDelete.id);
      onShowNotification(`Banner "${bannerToDelete.name || bannerToDelete.title || bannerToDelete.id}" deleted.`);
      setBannerToDelete(null);
      await onRefresh();
    } catch (err: any) {
      onShowNotification(err.message || 'Failed to delete banner', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // File Upload Helper (JPG, JPEG, PNG, WEBP)
  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    targetField: 'desktopImageUrl' | 'mobileImageUrl'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      onShowNotification('Please upload a JPG, JPEG, PNG, or WEBP image.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string' && editingBanner) {
        setEditingBanner({
          ...editingBanner,
          [targetField]: reader.result,
        });
        onShowNotification(`${targetField === 'desktopImageUrl' ? 'Desktop' : 'Mobile'} image loaded successfully!`);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* SECTION HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-7 rounded-3xl bg-zinc-900/80 border border-white/10 backdrop-blur-xl shadow-xl">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl font-serif font-black text-white tracking-wide">
                BANNER MANAGEMENT
              </h2>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl">
            Control the homepage multi-slide image carousel. Add unlimited slides with custom destination URLs, responsive desktop/mobile artwork, and tab targets.
          </p>
          <div className="flex items-center gap-3 pt-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
              Total: {sortedBanners.length}
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Active: {sortedBanners.filter(b => b.isActive).length}
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-zinc-800 text-zinc-400 border border-zinc-700">
              Inactive: {sortedBanners.filter(b => !b.isActive).length}
            </span>
          </div>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-black text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 transition shadow-lg shadow-amber-500/20 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>+ ADD NEW BANNER</span>
        </button>
      </div>

      {/* BANNER SPECIFICATION BANNER NOTICE */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3.5 text-xs text-amber-300 shadow-sm">
        <Sparkles className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-white text-sm">Image-Only Public Presentation:</span>
          <p className="leading-relaxed text-zinc-300">
            The homepage slider displays <strong>ONLY the uploaded image</strong> with zero text overlays, subtitles, or vote buttons on top of it. Each slide has its own independent destination URL and click behavior.
          </p>
        </div>
      </div>

      {/* BANNER LIST */}
      <div className="space-y-4">
        {sortedBanners.map((banner, index) => {
          const bannerName = banner.name || banner.title || `Banner ${String(index + 1).padStart(2, '0')}`;
          const destUrl = banner.destinationUrl || banner.ctaLink || '';
          const isOpenNewTab = banner.openTarget === '_blank' || banner.openInNewTab;
          const isActive = banner.isActive !== false && (banner.status === undefined || banner.status === 'active');

          return (
            <div
              key={banner.id}
              className={`flex flex-col lg:flex-row lg:items-center justify-between gap-5 p-5 sm:p-6 rounded-3xl border transition-all duration-300 shadow-xl ${
                isActive
                  ? 'border-white/10 bg-[#12141e] hover:border-amber-500/40'
                  : 'border-white/5 bg-[#0f1118]/70 opacity-80'
              }`}
            >
              {/* Left Column: Reorder Controls + Thumbnails + Info */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-5 flex-1 min-w-0">
                {/* Reorder Buttons */}
                <div className="flex sm:flex-col items-center justify-center gap-1.5 p-1.5 rounded-2xl bg-black/40 border border-white/5 flex-shrink-0">
                  <button
                    disabled={index === 0}
                    onClick={() => handleMoveOrder(index, 'up')}
                    className="p-1.5 rounded-xl bg-white/5 hover:bg-white/15 disabled:opacity-20 disabled:pointer-events-none text-zinc-400 hover:text-white transition"
                    title="Move Up"
                    aria-label="Move Banner Up"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <div className="px-2 py-0.5 text-center">
                    <span className="text-[10px] uppercase font-mono text-zinc-400 block">Order</span>
                    <span className="text-sm font-mono font-black text-amber-400">
                      {banner.displayOrder || banner.order || index + 1}
                    </span>
                  </div>
                  <button
                    disabled={index === sortedBanners.length - 1}
                    onClick={() => handleMoveOrder(index, 'down')}
                    className="p-1.5 rounded-xl bg-white/5 hover:bg-white/15 disabled:opacity-20 disabled:pointer-events-none text-zinc-400 hover:text-white transition"
                    title="Move Down"
                    aria-label="Move Banner Down"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>

                {/* Banner Thumbnail (Desktop) */}
                <div className="relative w-44 sm:w-56 aspect-[21/9] rounded-2xl overflow-hidden border border-white/15 bg-zinc-950 flex-shrink-0 shadow-md group/thumb">
                  <img
                    src={banner.desktopImageUrl}
                    alt={bannerName}
                    className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded-md bg-black/80 text-[10px] font-mono text-zinc-200 border border-white/10 flex items-center gap-1">
                    <Monitor className="w-3 h-3 text-amber-400" />
                    <span>Desktop</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setZoomedImage({ url: banner.desktopImageUrl, title: `${bannerName} (Desktop)` })}
                    className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-bold gap-1"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View Image</span>
                  </button>
                </div>

                {/* Optional Mobile Thumbnail */}
                {banner.mobileImageUrl ? (
                  <div className="hidden sm:block relative w-16 aspect-[9/16] rounded-xl overflow-hidden border border-white/15 bg-zinc-950 flex-shrink-0 shadow-md group/mobile">
                    <img
                      src={banner.mobileImageUrl}
                      alt={`${bannerName} Mobile`}
                      className="w-full h-full object-cover group-hover/mobile:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 px-1 py-0.5 rounded bg-black/80 text-[8px] font-mono text-zinc-300 border border-white/10">
                      Mobile
                    </span>
                    <button
                      type="button"
                      onClick={() => setZoomedImage({ url: banner.mobileImageUrl!, title: `${bannerName} (Mobile)` })}
                      className="absolute inset-0 bg-black/40 opacity-0 group-hover/mobile:opacity-100 flex items-center justify-center transition-opacity text-white"
                      title="View Mobile Image"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="hidden sm:flex flex-col items-center justify-center w-16 aspect-[9/16] rounded-xl border border-dashed border-white/10 bg-black/20 text-zinc-500 text-[9px] text-center p-1">
                    <Smartphone className="w-3.5 h-3.5 mb-1 opacity-50" />
                    <span>Auto Fallback</span>
                  </div>
                )}

                {/* Text & Meta Details */}
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h3 className="text-base sm:text-lg font-bold text-white truncate">
                      {bannerName}
                    </h3>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                        isActive
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                      }`}
                    >
                      {isActive ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" />
                          <span>ACTIVE</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3" />
                          <span>INACTIVE</span>
                        </>
                      )}
                    </span>
                  </div>

                  {/* Destination URL */}
                  <div className="flex items-center gap-2 text-xs text-zinc-400">
                    <LinkIcon className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                    <span className="font-mono text-zinc-300 truncate max-w-xs sm:max-w-md">
                      {destUrl || <span className="text-zinc-500 italic">No destination URL (Not Clickable)</span>}
                    </span>
                    {destUrl && (
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-md font-mono font-bold uppercase ${
                          isOpenNewTab
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-zinc-800 text-zinc-400'
                        }`}
                      >
                        {isOpenNewTab ? 'New Tab' : 'Same Tab'}
                      </span>
                    )}
                  </div>

                  {/* Device support tag */}
                  <div className="flex items-center gap-2 text-[11px] text-zinc-500">
                    <span className="flex items-center gap-1">
                      <Monitor className="w-3 h-3 text-zinc-400" />
                      Desktop Ready
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Smartphone className="w-3 h-3 text-zinc-400" />
                      {banner.mobileImageUrl ? 'Custom Mobile Art' : 'Desktop Responsive Fit'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-white/5 self-end lg:self-center">
                {/* PREVIEW BUTTON */}
                <button
                  type="button"
                  onClick={() => {
                    setPreviewBanner(banner);
                    setPreviewMode('desktop');
                  }}
                  className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white text-xs font-bold transition flex items-center gap-1.5 border border-white/10"
                >
                  <Eye className="w-3.5 h-3.5 text-amber-400" />
                  <span>PREVIEW</span>
                </button>

                {/* ENABLE / DISABLE BUTTON */}
                <button
                  type="button"
                  onClick={() => handleToggleActive(banner)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
                    isActive
                      ? 'bg-zinc-800/90 text-zinc-300 border-zinc-700 hover:bg-zinc-700 hover:text-rose-300'
                      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                  }`}
                >
                  {isActive ? (
                    <>
                      <XCircle className="w-3.5 h-3.5 text-rose-400" />
                      <span>DISABLE</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>ENABLE</span>
                    </>
                  )}
                </button>

                {/* EDIT BUTTON */}
                <button
                  type="button"
                  onClick={() => handleOpenEdit(banner)}
                  className="px-4 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500 hover:text-black text-amber-400 border border-amber-500/30 text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>EDIT</span>
                </button>

                {/* DELETE BUTTON */}
                <button
                  type="button"
                  onClick={() => setBannerToDelete(banner)}
                  className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 hover:border-rose-500/40 transition"
                  title="Delete Banner"
                  aria-label="Delete Banner"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}

        {/* EMPTY STATE */}
        {sortedBanners.length === 0 && (
          <div className="p-12 sm:p-16 text-center bg-zinc-900/40 rounded-3xl border border-white/5 space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mx-auto">
              <Layers className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h4 className="text-white text-base font-bold">No Hero Banners Configured</h4>
              <p className="text-zinc-400 text-xs max-w-sm mx-auto">
                The homepage slider is currently dormant. Click the button below to add your first high-definition banner.
              </p>
            </div>
            <button
              onClick={handleOpenCreate}
              className="px-6 py-2.5 rounded-xl bg-amber-500 text-black text-xs font-black uppercase tracking-wider hover:bg-amber-400 transition shadow-lg shadow-amber-500/20 inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>+ ADD FIRST BANNER</span>
            </button>
          </div>
        )}
      </div>

      {/* ==================================================== */}
      {/* MODAL: ADD / EDIT BANNER                             */}
      {/* ==================================================== */}
      {isModalOpen && editingBanner && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#12141d] border border-white/15 rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl space-y-6 relative max-h-[92vh] overflow-y-auto custom-scrollbar">
            {/* Modal Close Button */}
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-white/5 text-zinc-400 hover:text-white transition"
              aria-label="Close Modal"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Header */}
            <div>
              <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider">
                {editingBanner.id ? 'Modify Banner' : 'New Slide Creation'}
              </span>
              <h3 className="text-2xl font-serif font-black text-white mt-1">
                {editingBanner.id ? 'EDIT BANNER' : '+ ADD NEW BANNER'}
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Configure image media, individual destination URL, opening behavior, and sequence position.
              </p>
            </div>

            <form onSubmit={handleSaveBanner} className="space-y-6">
              {/* FIELD 1: BANNER NAME */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-white block">
                  Banner Name <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editingBanner.name || ''}
                  onChange={e => setEditingBanner({ ...editingBanner, name: e.target.value })}
                  placeholder="e.g. Home Banner 01, Finale Voting Announcement, Grand Finale Sponsor"
                  className="w-full px-4 py-3 bg-black/60 border border-white/10 rounded-2xl text-sm text-white focus:outline-none focus:border-amber-400 transition"
                />
              </div>

              {/* FIELD 2: DESKTOP BANNER IMAGE */}
              <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Monitor className="w-4 h-4 text-amber-400" />
                      <span>Desktop Banner Image <span className="text-amber-400">*</span></span>
                    </label>
                    <span className="text-[11px] text-zinc-400 block">
                      Recommended: 1920x820px or 21:9 aspect ratio (JPG, PNG, WEBP)
                    </span>
                  </div>

                  {/* Media Action Buttons: UPLOAD / REPLACE / DELETE / PREVIEW */}
                  <div className="flex items-center gap-2">
                    <input
                      ref={desktopFileInputRef}
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp"
                      className="hidden"
                      onChange={e => handleFileUpload(e, 'desktopImageUrl')}
                    />

                    <button
                      type="button"
                      onClick={() => desktopFileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{editingBanner.desktopImageUrl ? 'REPLACE' : 'UPLOAD'}</span>
                    </button>

                    {editingBanner.desktopImageUrl && (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            setZoomedImage({
                              url: editingBanner.desktopImageUrl!,
                              title: 'Desktop Banner Image Preview',
                            })
                          }
                          className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-bold transition flex items-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>PREVIEW</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setEditingBanner({ ...editingBanner, desktopImageUrl: '' })}
                          className="px-2.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-bold transition"
                          title="Clear Desktop Image"
                        >
                          DELETE
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* URL Input */}
                <input
                  type="text"
                  required
                  value={editingBanner.desktopImageUrl || ''}
                  onChange={e => setEditingBanner({ ...editingBanner, desktopImageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/... or click UPLOAD above"
                  className="w-full px-3.5 py-2.5 bg-black/60 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                />

                {/* Live Preview Box */}
                {editingBanner.desktopImageUrl ? (
                  <div className="relative aspect-[21/9] rounded-xl overflow-hidden border border-white/15 bg-zinc-950 shadow-inner">
                    <img
                      src={editingBanner.desktopImageUrl}
                      alt="Desktop Preview"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/80 text-[10px] font-mono text-zinc-300 border border-white/10">
                      Live Preview (Desktop)
                    </span>
                  </div>
                ) : (
                  <div className="aspect-[21/9] rounded-xl border border-dashed border-white/15 flex flex-col items-center justify-center text-zinc-500 gap-2 bg-black/20">
                    <ImageIcon className="w-6 h-6 opacity-40" />
                    <span className="text-xs">No desktop image selected yet</span>
                  </div>
                )}
              </div>

              {/* FIELD 3: MOBILE BANNER IMAGE (OPTIONAL) */}
              <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Smartphone className="w-4 h-4 text-amber-400" />
                      <span>Mobile Banner Image (Optional)</span>
                    </label>
                    <span className="text-[11px] text-zinc-400 block">
                      Recommended: 800x800px or 4:3 / 9:16 portrait. If empty, Desktop image is used.
                    </span>
                  </div>

                  {/* Media Action Buttons: UPLOAD / REPLACE / DELETE / PREVIEW */}
                  <div className="flex items-center gap-2">
                    <input
                      ref={mobileFileInputRef}
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp"
                      className="hidden"
                      onChange={e => handleFileUpload(e, 'mobileImageUrl')}
                    />

                    <button
                      type="button"
                      onClick={() => mobileFileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{editingBanner.mobileImageUrl ? 'REPLACE' : 'UPLOAD'}</span>
                    </button>

                    {editingBanner.mobileImageUrl && (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            setZoomedImage({
                              url: editingBanner.mobileImageUrl!,
                              title: 'Mobile Banner Image Preview',
                            })
                          }
                          className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-bold transition flex items-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>PREVIEW</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setEditingBanner({ ...editingBanner, mobileImageUrl: '' })}
                          className="px-2.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-bold transition"
                          title="Clear Mobile Image"
                        >
                          DELETE
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* URL Input */}
                <input
                  type="text"
                  value={editingBanner.mobileImageUrl || ''}
                  onChange={e => setEditingBanner({ ...editingBanner, mobileImageUrl: e.target.value })}
                  placeholder="Optional: https://... or click UPLOAD above"
                  className="w-full px-3.5 py-2.5 bg-black/60 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                />

                {/* Mobile Preview Box */}
                {editingBanner.mobileImageUrl ? (
                  <div className="relative aspect-[4/3] max-w-[240px] rounded-xl overflow-hidden border border-white/15 bg-zinc-950 shadow-inner">
                    <img
                      src={editingBanner.mobileImageUrl}
                      alt="Mobile Preview"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/80 text-[10px] font-mono text-zinc-300 border border-white/10">
                      Mobile Preview
                    </span>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-white/5 border border-dashed border-white/10 text-zinc-400 text-xs flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-zinc-500 flex-shrink-0" />
                    <span>No separate mobile image provided. Mobile devices will automatically display the desktop image.</span>
                  </div>
                )}
              </div>

              {/* FIELD 4: DESTINATION URL */}
              <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white flex items-center gap-1.5">
                    <LinkIcon className="w-4 h-4 text-amber-400" />
                    <span>Destination URL (Per-Banner Click Link)</span>
                  </label>
                  <span className="text-[11px] text-zinc-400 font-mono">
                    Any valid http:// or https:// URL
                  </span>
                </div>

                <input
                  type="text"
                  value={editingBanner.destinationUrl || ''}
                  onChange={e => {
                    setEditingBanner({ ...editingBanner, destinationUrl: e.target.value });
                    setUrlError(null);
                  }}
                  placeholder="https://example.com/..., https://youtube.com/..., or #contestants-section"
                  className={`w-full px-4 py-3 bg-black/60 border rounded-2xl text-xs sm:text-sm text-white focus:outline-none font-mono transition ${
                    urlError ? 'border-rose-500 focus:border-rose-400' : 'border-white/10 focus:border-amber-400'
                  }`}
                />

                {urlError && (
                  <div className="flex items-center gap-1.5 text-xs text-rose-400 font-medium">
                    <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{urlError}</span>
                  </div>
                )}

                <div className="text-[11px] text-zinc-400 flex items-center gap-2 pt-1">
                  <span>Quick Presets:</span>
                  <button
                    type="button"
                    onClick={() => setEditingBanner({ ...editingBanner, destinationUrl: '#contestants-section' })}
                    className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-amber-400 hover:underline font-mono"
                  >
                    #contestants-section
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingBanner({ ...editingBanner, destinationUrl: '#ranking-section' })}
                    className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-amber-400 hover:underline font-mono"
                  >
                    #ranking-section
                  </button>
                </div>
              </div>

              {/* FIELD 5: OPEN LINK IN (SAME TAB / NEW TAB) */}
              <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-3">
                <label className="text-xs font-bold text-white block">
                  Open Link In:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label
                    className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition ${
                      editingBanner.openTarget !== '_blank'
                        ? 'bg-amber-500/10 border-amber-500/40 text-white'
                        : 'bg-black/40 border-white/10 text-zinc-400 hover:border-white/20'
                    }`}
                  >
                    <input
                      type="radio"
                      name="openTarget"
                      value="_self"
                      checked={editingBanner.openTarget !== '_blank'}
                      onChange={() => setEditingBanner({ ...editingBanner, openTarget: '_self', openInNewTab: false })}
                      className="text-amber-500 focus:ring-0"
                    />
                    <div>
                      <span className="text-xs font-bold block">Same Tab (Default)</span>
                      <span className="text-[11px] text-zinc-400">Navigate within current browser window</span>
                    </div>
                  </label>

                  <label
                    className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition ${
                      editingBanner.openTarget === '_blank'
                        ? 'bg-amber-500/10 border-amber-500/40 text-white'
                        : 'bg-black/40 border-white/10 text-zinc-400 hover:border-white/20'
                    }`}
                  >
                    <input
                      type="radio"
                      name="openTarget"
                      value="_blank"
                      checked={editingBanner.openTarget === '_blank'}
                      onChange={() => setEditingBanner({ ...editingBanner, openTarget: '_blank', openInNewTab: true })}
                      className="text-amber-500 focus:ring-0"
                    />
                    <div>
                      <span className="text-xs font-bold block">New Tab</span>
                      <span className="text-[11px] text-zinc-400">Open safely in a new browser window/tab</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* FIELD 6 & 7: DISPLAY ORDER & STATUS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-1.5">
                  <label className="text-xs font-bold text-white block">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={editingBanner.displayOrder || editingBanner.order || 1}
                    onChange={e =>
                      setEditingBanner({
                        ...editingBanner,
                        displayOrder: Number(e.target.value),
                        order: Number(e.target.value),
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-black/60 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                  />
                  <span className="text-[11px] text-zinc-500 block">
                    Lower numbers display earlier in the carousel sequence
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-1.5">
                  <label className="text-xs font-bold text-white block">
                    Status
                  </label>
                  <select
                    value={editingBanner.status || (editingBanner.isActive ? 'active' : 'inactive')}
                    onChange={e =>
                      setEditingBanner({
                        ...editingBanner,
                        status: e.target.value as 'active' | 'inactive',
                        isActive: e.target.value === 'active',
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-black/60 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="active">Active (Visible on Homepage)</option>
                    <option value="inactive">Inactive (Hidden from Public)</option>
                  </select>
                  <span className="text-[11px] text-zinc-500 block">
                    Only active banners appear in the homepage slider
                  </span>
                </div>
              </div>

              {/* MODAL ACTION BUTTONS */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-bold transition"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-black text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 transition shadow-lg shadow-amber-500/20 disabled:opacity-50 flex items-center gap-2"
                >
                  {isSaving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingBanner.id ? 'SAVE CHANGES' : 'ADD BANNER'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL: DELETE CONFIRMATION                           */}
      {/* ==================================================== */}
      {bannerToDelete && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#141622] border border-white/15 rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-bold text-white">
                Are you sure you want to delete this banner?
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                This will permanently remove{' '}
                <strong className="text-white">"{bannerToDelete.name || bannerToDelete.title}"</strong> (Order #{bannerToDelete.order || 1}) from the homepage carousel slider.
              </p>
            </div>

            {/* Banner preview thumbnail in delete modal */}
            <div className="aspect-[21/9] rounded-xl overflow-hidden border border-white/10 bg-black/60">
              <img
                src={bannerToDelete.desktopImageUrl}
                alt="Banner to delete"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setBannerToDelete(null)}
                className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-bold transition"
              >
                CANCEL
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold uppercase tracking-wider transition shadow-lg shadow-rose-600/20 flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {isDeleting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>DELETE</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL: LIVE BANNER PREVIEW                           */}
      {/* ==================================================== */}
      {previewBanner && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#12141c] border border-white/15 rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl space-y-5 relative max-h-[90vh] overflow-y-auto custom-scrollbar">
            <button
              onClick={() => setPreviewBanner(null)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-white/5 text-zinc-400 hover:text-white transition"
              aria-label="Close Preview"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pr-10">
              <div>
                <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider font-bold">
                  Live Public Simulation
                </span>
                <h3 className="text-xl font-serif font-black text-white mt-0.5">
                  {previewBanner.name || previewBanner.title}
                </h3>
              </div>

              {/* Toggle Desktop / Mobile View */}
              <div className="flex items-center gap-1 p-1 bg-black/40 rounded-xl border border-white/10 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setPreviewMode('desktop')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    previewMode === 'desktop' ? 'bg-amber-500 text-black' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span>Desktop (1920px)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode('mobile')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    previewMode === 'mobile' ? 'bg-amber-500 text-black' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Mobile (390px)</span>
                </button>
              </div>
            </div>

            {/* Simulated Banner Container (Image-Only, Zero Text Overlays) */}
            <div className="flex justify-center p-4 sm:p-6 bg-black/60 rounded-2xl border border-white/10">
              <div
                className={`transition-all duration-300 overflow-hidden rounded-2xl border border-white/15 shadow-2xl ${
                  previewMode === 'desktop' ? 'w-full aspect-[21/9]' : 'w-72 aspect-[9/16]'
                }`}
              >
                <img
                  src={
                    previewMode === 'mobile' && previewBanner.mobileImageUrl
                      ? previewBanner.mobileImageUrl
                      : previewBanner.desktopImageUrl
                  }
                  alt="Slide preview"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Click & Metadata Inspection */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-zinc-400 pt-3 border-t border-white/10">
              <div className="flex items-center gap-2 truncate">
                <LinkIcon className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                <span>
                  Destination URL:{' '}
                  {previewBanner.destinationUrl || previewBanner.ctaLink ? (
                    <a
                      href={previewBanner.destinationUrl || previewBanner.ctaLink}
                      target={previewBanner.openTarget === '_blank' || previewBanner.openInNewTab ? '_blank' : '_self'}
                      rel="noopener noreferrer"
                      className="text-amber-400 hover:underline font-mono"
                    >
                      {previewBanner.destinationUrl || previewBanner.ctaLink}
                    </a>
                  ) : (
                    <span className="text-zinc-500 italic">None (Not Clickable)</span>
                  )}
                </span>
              </div>

              <div className="flex items-center gap-3 font-mono text-[11px]">
                <span>
                  Open Target:{' '}
                  <strong className="text-zinc-200">
                    {previewBanner.openTarget === '_blank' || previewBanner.openInNewTab ? 'New Tab (_blank)' : 'Same Tab (_self)'}
                  </strong>
                </span>
                <span>•</span>
                <span>
                  Status:{' '}
                  <strong className={previewBanner.isActive ? 'text-emerald-400' : 'text-zinc-500'}>
                    {previewBanner.isActive ? 'ACTIVE' : 'INACTIVE'}
                  </strong>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL: IMAGE ZOOM PREVIEW                            */}
      {/* ==================================================== */}
      {zoomedImage && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-5xl w-full space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">{zoomedImage.title}</span>
              <button
                type="button"
                onClick={() => setZoomedImage(null)}
                className="p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="rounded-2xl overflow-hidden border border-white/20 bg-zinc-950 max-h-[80vh] flex items-center justify-center">
              <img
                src={zoomedImage.url}
                alt={zoomedImage.title}
                className="w-full h-auto max-h-[80vh] object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
