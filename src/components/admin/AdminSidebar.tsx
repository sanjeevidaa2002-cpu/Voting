import React from 'react';
import {
  LayoutDashboard,
  Users,
  Vote,
  Palette,
  Sparkles,
  Layout,
  Menu,
  FileText,
  UserCheck,
  Image as ImageIcon,
  BarChart3,
  Globe,
  History,
  ShieldCheck,
  LogOut,
  X,
  Layers,
  Award,
  Radio
} from 'lucide-react';

export type AdminTab =
  | 'overview'
  | 'vote_management'
  | 'contestants'
  | 'banners'
  | 'ads'
  | 'voting_settings'
  | 'users'
  | 'global_content'
  | 'themes_manager'
  | 'theme'
  | 'branding'
  | 'ui'
  | 'homepage'
  | 'navigation'
  | 'pages'
  | 'media'
  | 'analytics'
  | 'google'
  | 'audit_logs';

interface AdminSidebarProps {
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
  isOpen: boolean;
  onClose: () => void;
  adminUsername: string | null;
  onLogout: () => void;
  siteName: string;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpen,
  onClose,
  adminUsername,
  onLogout,
  siteName,
}) => {
  const navGroups = [
    {
      group: 'Core Operations',
      items: [
        { id: 'overview' as AdminTab, label: 'Dashboard & Metrics', icon: LayoutDashboard },
        { id: 'vote_management' as AdminTab, label: 'Vote Management & Sync', icon: Award },
        { id: 'contestants' as AdminTab, label: 'Contestants & Photos', icon: Users },
        { id: 'banners' as AdminTab, label: 'Banner Management', icon: Layers },
        { id: 'ads' as AdminTab, label: 'Ads Management (Adsterra)', icon: Radio },
        { id: 'voting_settings' as AdminTab, label: 'Voting Controls & Rules', icon: Vote },
        { id: 'users' as AdminTab, label: 'Registered Users', icon: UserCheck },
        { id: 'analytics' as AdminTab, label: 'Analytics & Traffic', icon: BarChart3 },
      ],
    },
    {
      group: 'CMS & Theme Styling',
      items: [
        { id: 'themes_manager' as AdminTab, label: 'Theme Studio & Colors', icon: Palette },
        { id: 'branding' as AdminTab, label: 'Branding & Logos', icon: Sparkles },
        { id: 'homepage' as AdminTab, label: 'Homepage Builder', icon: Layout },
        { id: 'navigation' as AdminTab, label: 'Navigation Menu', icon: Menu },
        { id: 'pages' as AdminTab, label: 'Pages Manager', icon: FileText },
        { id: 'global_content' as AdminTab, label: 'Global Content CMS', icon: FileText },
      ],
    },
    {
      group: 'Assets & Auditing',
      items: [
        { id: 'media' as AdminTab, label: 'Media Library', icon: ImageIcon },
        { id: 'google' as AdminTab, label: 'Google Services', icon: Globe },
        { id: 'audit_logs' as AdminTab, label: 'Audit & Activity Logs', icon: History },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#0d0f15] border-r border-white/10 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black font-black shadow-lg shadow-amber-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="font-serif font-black text-sm uppercase tracking-wider text-white">
                Admin Control Room
              </div>
              <div className="text-[10px] font-mono text-amber-400/90 font-bold truncate max-w-[150px]">
                {siteName}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white bg-white/5 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
          {navGroups.map((grp) => (
            <div key={grp.group} className="space-y-1.5">
              <div className="px-3 text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500">
                {grp.group}
              </div>
              <div className="space-y-1">
                {grp.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        onClose();
                      }}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                        isActive
                          ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black font-black shadow-md shadow-amber-500/20'
                          : 'text-zinc-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Admin Identity */}
        <div className="p-4 border-t border-white/10 bg-black/40 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-mono text-zinc-300 font-bold">
                {adminUsername || 'Administrator'}
              </span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
              Master Level
            </span>
          </div>

          <button
            onClick={onLogout}
            className="w-full py-2 px-3 rounded-xl bg-white/5 border border-white/10 text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30 text-xs font-bold flex items-center justify-center gap-2 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out of Console</span>
          </button>
        </div>
      </aside>
    </>
  );
};
