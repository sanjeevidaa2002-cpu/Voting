import {
  AppStateData,
  Contestant,
  Banner,
  VotingSettings,
  SiteSettings,
  Vote,
  VoteAuditLog,
  AdminActivityLog,
  VotingStats,
  MediaItem,
  VoterSessionInfo,
  RegisteredUser,
  NavigationItem,
  HomepageSection,
  PageContent,
  BrandingSettings,
  ThemeSettings,
  UISettings,
  GoogleServicesSettings
} from '../types';

const API_BASE = '/api';

function getAdminAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('starhouse_admin_token') || localStorage.getItem('starhouse_user_token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

function getUserAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('starhouse_user_token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

/**
 * Safe fetch helper that gracefully parses JSON and prevents
 * "Unexpected token '<', '<!doctype '... is not valid JSON" errors.
 */
async function safeFetchJson<T = any>(
  url: string,
  options?: RequestInit,
  defaultErrMsg = 'Request failed'
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, options);
  } catch (netErr: any) {
    throw new Error(netErr.message || 'Network connection error. Please try again.');
  }

  const contentType = res.headers.get('content-type') || '';
  let data: any = null;

  if (contentType.includes('application/json')) {
    try {
      data = await res.json();
    } catch {
      data = null;
    }
  } else {
    // If HTML/text response was returned
    const rawText = await res.text().catch(() => '');
    if (!res.ok) {
      throw new Error(`Server returned status ${res.status}: ${res.statusText || defaultErrMsg}`);
    }
    if (rawText && (rawText.trim().startsWith('{') || rawText.trim().startsWith('['))) {
      try {
        data = JSON.parse(rawText);
      } catch {
        data = null;
      }
    }
  }

  if (!res.ok) {
    const errorMsg = data?.error || data?.message || `Request failed with status ${res.status}`;
    const err = new Error(errorMsg);
    if (data?.cooldown) (err as any).cooldown = data.cooldown;
    if (data?.alreadyVoted !== undefined) (err as any).alreadyVoted = data.alreadyVoted;
    if (data?.votedContestantId) (err as any).votedContestantId = data.votedContestantId;
    throw err;
  }

  return (data !== null ? data : {}) as T;
}

export const api = {
  // Public show state
  async getState(): Promise<AppStateData> {
    return safeFetchJson<AppStateData>(`${API_BASE}/state`, undefined, 'Failed to fetch public show state');
  },

  // Anonymous / User Voter Session Check (Strict One-Vote Enforcement)
  async getVoterSession(voterToken?: string): Promise<VoterSessionInfo> {
    const userToken = localStorage.getItem('starhouse_user_token');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (voterToken) {
      headers['x-voter-token'] = voterToken;
    }
    if (userToken) {
      headers['Authorization'] = `Bearer ${userToken}`;
    }
    const query = voterToken ? `?voterToken=${encodeURIComponent(voterToken)}` : '';
    return safeFetchJson<VoterSessionInfo>(`${API_BASE}/voter/session${query}`, { headers }, 'Failed to verify voting session');
  },

  // Public / User Vote Submission (1-Vote Per Visitor/User)
  async submitVote(contestantId: string, voterToken?: string): Promise<{
    success: boolean;
    message: string;
    voteId: string;
    timestamp: string;
    alreadyVoted?: boolean;
    votedContestantId?: string;
    contestant: Contestant;
    totalVotes: number;
  }> {
    const userToken = localStorage.getItem('starhouse_user_token');
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (voterToken) {
      headers['x-voter-token'] = voterToken;
    }
    if (userToken) {
      headers['Authorization'] = `Bearer ${userToken}`;
    }
    return safeFetchJson(`${API_BASE}/votes/submit`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ contestantId, voterToken }),
    }, 'Failed to submit vote');
  },

  // Real-time SSE subscription
  subscribeToEvents(onUpdate: (state: AppStateData) => void): () => void {
    const eventSource = new EventSource(`${API_BASE}/events`);

    eventSource.onmessage = (event) => {
      try {
        const state: AppStateData = JSON.parse(event.data);
        onUpdate(state);
      } catch (err) {
        console.error('SSE JSON parse error:', err);
      }
    };

    eventSource.onerror = () => {
      // Browsers will auto-reconnect
    };

    return () => {
      eventSource.close();
    };
  },

  // Public Page Content
  async getPage(slug: string): Promise<{ page: PageContent }> {
    return safeFetchJson<{ page: PageContent }>(`${API_BASE}/pages/${slug}`, undefined, 'Failed to fetch page content');
  },

  // ==========================================
  // USER AUTHENTICATION
  // ==========================================
  async userSignup(fullName: string, email: string, password: string): Promise<{
    success: boolean;
    message: string;
    token: string;
    user: RegisteredUser;
  }> {
    return safeFetchJson(`${API_BASE}/user/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName, email, password }),
    }, 'Registration failed');
  },

  async userLogin(email: string, password: string): Promise<{
    success: boolean;
    message: string;
    token: string;
    user: RegisteredUser;
  }> {
    return safeFetchJson(`${API_BASE}/user/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    }, 'Login failed');
  },

  async getUserProfile(): Promise<{ user: RegisteredUser }> {
    return safeFetchJson<{ user: RegisteredUser }>(`${API_BASE}/user/profile`, {
      headers: getUserAuthHeaders(),
    }, 'Failed to fetch user profile');
  },

  async userLogout(): Promise<void> {
    try {
      await fetch(`${API_BASE}/user/logout`, {
        method: 'POST',
        headers: getUserAuthHeaders(),
      });
    } catch {
      // Ignored
    }
  },

  async resetPassword(email: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    return safeFetchJson(`${API_BASE}/user/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, newPassword }),
    }, 'Password reset failed');
  },

  // ==========================================
  // ADMIN AUTHENTICATION
  // ==========================================
  async adminLogin(username: string, password: string): Promise<{
    success: boolean;
    token: string;
    admin: { username: string; role: string; loginTime: string };
    message: string;
  }> {
    return safeFetchJson(`${API_BASE}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    }, 'Invalid admin credentials');
  },

  async verifyAdminSession(): Promise<{ authenticated: boolean; username: string }> {
    return safeFetchJson<{ authenticated: boolean; username: string }>(`${API_BASE}/admin/verify`, {
      headers: getAdminAuthHeaders(),
    }, 'Admin session invalid or expired');
  },

  async adminLogout(): Promise<void> {
    try {
      await fetch(`${API_BASE}/admin/logout`, {
        method: 'POST',
        headers: getAdminAuthHeaders(),
      });
    } catch {
      // Ignored
    }
  },

  // ==========================================
  // ADMIN METRICS & ANALYTICS
  // ==========================================
  async getAdminMetrics(): Promise<any> {
    return safeFetchJson(`${API_BASE}/admin/metrics`, {
      headers: getAdminAuthHeaders(),
    }, 'Failed to fetch admin metrics');
  },

  async getAdminAnalytics(): Promise<VotingStats> {
    return safeFetchJson<VotingStats>(`${API_BASE}/admin/analytics`, {
      headers: getAdminAuthHeaders(),
    }, 'Failed to fetch analytics');
  },

  // ==========================================
  // ADMIN USERS MANAGEMENT
  // ==========================================
  async getAdminUsers(search?: string): Promise<{ users: RegisteredUser[] }> {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    return safeFetchJson<{ users: RegisteredUser[] }>(`${API_BASE}/admin/users${query}`, {
      headers: getAdminAuthHeaders(),
    }, 'Failed to fetch registered users');
  },

  async toggleAdminUserStatus(id: string, isActive: boolean): Promise<{ message: string; user: RegisteredUser }> {
    return safeFetchJson(`${API_BASE}/admin/users/${id}/status`, {
      method: 'PUT',
      headers: getAdminAuthHeaders(),
      body: JSON.stringify({ isActive }),
    }, 'Failed to update user status');
  },

  async updateAdminUserRole(id: string, role: 'user' | 'admin' | string): Promise<{ message: string; user: RegisteredUser; success?: boolean }> {
    return safeFetchJson(`${API_BASE}/admin/users/${id}/role`, {
      method: 'PUT',
      headers: getAdminAuthHeaders(),
      body: JSON.stringify({ role }),
    }, 'Failed to update user role');
  },

  async deleteAdminUser(id: string): Promise<{ message: string }> {
    return safeFetchJson(`${API_BASE}/admin/users/${id}`, {
      method: 'DELETE',
      headers: getAdminAuthHeaders(),
    }, 'Failed to delete user');
  },

  // ==========================================
  // CONTESTANTS MANAGEMENT
  // ==========================================
  async createContestant(payload: Partial<Contestant>): Promise<{ message: string; contestant: Contestant }> {
    return safeFetchJson(`${API_BASE}/admin/contestants`, {
      method: 'POST',
      headers: getAdminAuthHeaders(),
      body: JSON.stringify(payload),
    }, 'Failed to create contestant');
  },

  async updateContestant(id: string, payload: Partial<Contestant>): Promise<{ message: string; contestant: Contestant }> {
    return safeFetchJson(`${API_BASE}/admin/contestants/${id}`, {
      method: 'PUT',
      headers: getAdminAuthHeaders(),
      body: JSON.stringify(payload),
    }, 'Failed to update contestant');
  },

  async deleteContestant(id: string): Promise<{ message: string }> {
    return safeFetchJson(`${API_BASE}/admin/contestants/${id}`, {
      method: 'DELETE',
      headers: getAdminAuthHeaders(),
    }, 'Failed to delete contestant');
  },

  async adjustContestantVotes(id: string, newCount: number, reason: string, actionType?: 'EDIT' | 'ADD' | 'REMOVE'): Promise<{
    message: string;
    auditLog: VoteAuditLog;
    contestant: Contestant;
  }> {
    return safeFetchJson(`${API_BASE}/admin/contestants/${id}/adjust-votes`, {
      method: 'POST',
      headers: getAdminAuthHeaders(),
      body: JSON.stringify({ newCount, reason, actionType }),
    }, 'Failed to adjust contestant votes');
  },

  async getContestantVoteHistory(id: string): Promise<{ contestant: Contestant; history: VoteAuditLog[] }> {
    return safeFetchJson(`${API_BASE}/admin/contestants/${id}/vote-history`, {
      headers: getAdminAuthHeaders(),
    }, 'Failed to fetch contestant vote history');
  },

  async syncAndRefreshVotes(): Promise<{
    message: string;
    contestants: Contestant[];
    totalVotes: number;
    lastUpdated: string;
  }> {
    return safeFetchJson(`${API_BASE}/admin/votes/refresh-sync`, {
      method: 'POST',
      headers: getAdminAuthHeaders(),
    }, 'Failed to refresh and sync vote counts');
  },

  // ==========================================
  // BANNERS MANAGEMENT
  // ==========================================
  async getAdminBanners(): Promise<{ banners: Banner[] }> {
    return safeFetchJson(`${API_BASE}/admin/banners`, {
      headers: getAdminAuthHeaders(),
    }, 'Failed to load banners');
  },

  async createBanner(payload: Partial<Banner>): Promise<{ message: string; banner: Banner }> {
    return safeFetchJson(`${API_BASE}/admin/banners`, {
      method: 'POST',
      headers: getAdminAuthHeaders(),
      body: JSON.stringify(payload),
    }, 'Failed to create banner');
  },

  async updateBanner(id: string, payload: Partial<Banner>): Promise<{ message: string; banner: Banner }> {
    return safeFetchJson(`${API_BASE}/admin/banners/${id}`, {
      method: 'PUT',
      headers: getAdminAuthHeaders(),
      body: JSON.stringify(payload),
    }, 'Failed to update banner');
  },

  async toggleBannerStatus(id: string): Promise<{ message: string; banner: Banner }> {
    return safeFetchJson(`${API_BASE}/admin/banners/${id}/toggle`, {
      method: 'PUT',
      headers: getAdminAuthHeaders(),
    }, 'Failed to toggle banner status');
  },

  async reorderBanners(bannerIds: string[]): Promise<{ message: string; banners: Banner[] }> {
    return safeFetchJson(`${API_BASE}/admin/banners/reorder`, {
      method: 'PUT',
      headers: getAdminAuthHeaders(),
      body: JSON.stringify({ bannerIds }),
    }, 'Failed to reorder banners');
  },

  async deleteBanner(id: string): Promise<{ message: string }> {
    return safeFetchJson(`${API_BASE}/admin/banners/${id}`, {
      method: 'DELETE',
      headers: getAdminAuthHeaders(),
    }, 'Failed to delete banner');
  },

  // ==========================================
  // MEDIA LIBRARY
  // ==========================================
  async getMedia(): Promise<{ media: MediaItem[] }> {
    return safeFetchJson<{ media: MediaItem[] }>(`${API_BASE}/admin/media`, {
      headers: getAdminAuthHeaders(),
    }, 'Failed to fetch media library');
  },

  async createMedia(payload: Partial<MediaItem>): Promise<{ media: MediaItem; message: string }> {
    return safeFetchJson(`${API_BASE}/admin/media`, {
      method: 'POST',
      headers: getAdminAuthHeaders(),
      body: JSON.stringify(payload),
    }, 'Failed to upload media item');
  },

  async updateMedia(id: string, payload: Partial<MediaItem>): Promise<{ media: MediaItem; message: string }> {
    return safeFetchJson(`${API_BASE}/admin/media/${id}`, {
      method: 'PUT',
      headers: getAdminAuthHeaders(),
      body: JSON.stringify(payload),
    }, 'Failed to update media item');
  },

  async deleteMedia(id: string): Promise<{ message: string }> {
    return safeFetchJson(`${API_BASE}/admin/media/${id}`, {
      method: 'DELETE',
      headers: getAdminAuthHeaders(),
    }, 'Failed to delete media item');
  },

  // ==========================================
  // PAGES MANAGEMENT
  // ==========================================
  async getAdminPages(): Promise<{ pages: Record<string, PageContent> }> {
    return safeFetchJson<{ pages: Record<string, PageContent> }>(`${API_BASE}/admin/pages`, {
      headers: getAdminAuthHeaders(),
    }, 'Failed to fetch pages');
  },

  async updateAdminPage(slug: string, payload: Partial<PageContent>): Promise<{ message: string; page: PageContent }> {
    return safeFetchJson(`${API_BASE}/admin/pages/${slug}`, {
      method: 'PUT',
      headers: getAdminAuthHeaders(),
      body: JSON.stringify(payload),
    }, 'Failed to update page');
  },

  // ==========================================
  // NAVIGATION MANAGEMENT
  // ==========================================
  async getAdminNavigation(): Promise<{ navigation: NavigationItem[] }> {
    return safeFetchJson<{ navigation: NavigationItem[] }>(`${API_BASE}/admin/navigation`, {
      headers: getAdminAuthHeaders(),
    }, 'Failed to fetch navigation items');
  },

  async saveBulkNavigation(items: NavigationItem[]): Promise<{ message: string; navigation: NavigationItem[] }> {
    return safeFetchJson(`${API_BASE}/admin/navigation/bulk`, {
      method: 'PUT',
      headers: getAdminAuthHeaders(),
      body: JSON.stringify({ items }),
    }, 'Failed to save navigation');
  },

  async resetDefaultNavigation(): Promise<{ message: string; navigation: NavigationItem[] }> {
    return safeFetchJson(`${API_BASE}/admin/navigation/reset-defaults`, {
      method: 'POST',
      headers: getAdminAuthHeaders(),
    }, 'Failed to reset navigation to defaults');
  },

  async createAdminNavigationItem(payload: Partial<NavigationItem>): Promise<{ message: string; item: NavigationItem; navigation: NavigationItem[] }> {
    return safeFetchJson(`${API_BASE}/admin/navigation`, {
      method: 'POST',
      headers: getAdminAuthHeaders(),
      body: JSON.stringify(payload),
    }, 'Failed to add navigation item');
  },

  async updateAdminNavigationItem(id: string, payload: Partial<NavigationItem>): Promise<{ message: string; item: NavigationItem; navigation: NavigationItem[] }> {
    return safeFetchJson(`${API_BASE}/admin/navigation/${id}`, {
      method: 'PUT',
      headers: getAdminAuthHeaders(),
      body: JSON.stringify(payload),
    }, 'Failed to update navigation item');
  },

  async deleteAdminNavigationItem(id: string): Promise<{ message: string; navigation: NavigationItem[] }> {
    return safeFetchJson(`${API_BASE}/admin/navigation/${id}`, {
      method: 'DELETE',
      headers: getAdminAuthHeaders(),
    }, 'Failed to delete navigation item');
  },

  // ==========================================
  // SETTINGS UPDATES
  // ==========================================
  async updateVotingSettings(settings: Partial<VotingSettings>): Promise<{ message: string; votingSettings: VotingSettings }> {
    return safeFetchJson(`${API_BASE}/admin/settings/voting`, {
      method: 'PUT',
      headers: getAdminAuthHeaders(),
      body: JSON.stringify(settings),
    }, 'Failed to update voting settings');
  },

  async updateBrandingSettings(branding: Partial<BrandingSettings>): Promise<{ message: string; branding: BrandingSettings; siteSettings: SiteSettings }> {
    return safeFetchJson(`${API_BASE}/admin/settings/branding`, {
      method: 'PUT',
      headers: getAdminAuthHeaders(),
      body: JSON.stringify(branding),
    }, 'Failed to update branding');
  },

  async updateThemeSettings(theme: Partial<ThemeSettings>): Promise<{ message: string; theme: ThemeSettings; siteSettings: SiteSettings }> {
    return safeFetchJson(`${API_BASE}/admin/settings/theme`, {
      method: 'PUT',
      headers: getAdminAuthHeaders(),
      body: JSON.stringify(theme),
    }, 'Failed to update theme settings');
  },

  async updateUISettings(uiSettings: Partial<UISettings>): Promise<{ message: string; uiSettings: UISettings }> {
    return safeFetchJson(`${API_BASE}/admin/settings/ui`, {
      method: 'PUT',
      headers: getAdminAuthHeaders(),
      body: JSON.stringify(uiSettings),
    }, 'Failed to update UI settings');
  },

  async updateHomepageSections(sections: HomepageSection[]): Promise<{ message: string; homepageSections: HomepageSection[] }> {
    return safeFetchJson(`${API_BASE}/admin/settings/homepage`, {
      method: 'PUT',
      headers: getAdminAuthHeaders(),
      body: JSON.stringify({ sections }),
    }, 'Failed to update homepage builder');
  },

  async updateGoogleServicesSettings(googleServices: Partial<GoogleServicesSettings>): Promise<{ message: string; googleServices: GoogleServicesSettings }> {
    return safeFetchJson(`${API_BASE}/admin/settings/google`, {
      method: 'PUT',
      headers: getAdminAuthHeaders(),
      body: JSON.stringify(googleServices),
    }, 'Failed to update Google Services');
  },

  async getAdminAds(): Promise<{ adSlots: import('../types').AdSlotItem[]; adsConfig: import('../types').AdsManagementConfig }> {
    return safeFetchJson(`${API_BASE}/admin/ads`, {
      headers: getAdminAuthHeaders(),
    }, 'Failed to fetch ad slots');
  },

  async saveBulkAdSlots(slots: import('../types').AdSlotItem[]): Promise<{ message: string; adSlots: import('../types').AdSlotItem[]; adsConfig: import('../types').AdsManagementConfig; siteSettings: SiteSettings }> {
    return safeFetchJson(`${API_BASE}/admin/ads/slots`, {
      method: 'PUT',
      headers: getAdminAuthHeaders(),
      body: JSON.stringify({ slots }),
    }, 'Failed to save ad slots');
  },

  async createAdSlot(slot: Partial<import('../types').AdSlotItem>): Promise<{ message: string; slot: import('../types').AdSlotItem; adSlots: import('../types').AdSlotItem[] }> {
    return safeFetchJson(`${API_BASE}/admin/ads/slots`, {
      method: 'POST',
      headers: getAdminAuthHeaders(),
      body: JSON.stringify(slot),
    }, 'Failed to create ad slot');
  },

  async updateAdSlot(id: string, slot: Partial<import('../types').AdSlotItem>): Promise<{ message: string; slot: import('../types').AdSlotItem; adSlots: import('../types').AdSlotItem[] }> {
    return safeFetchJson(`${API_BASE}/admin/ads/slots/${id}`, {
      method: 'PUT',
      headers: getAdminAuthHeaders(),
      body: JSON.stringify(slot),
    }, 'Failed to update ad slot');
  },

  async deleteAdSlot(id: string): Promise<{ message: string; adSlots: import('../types').AdSlotItem[] }> {
    return safeFetchJson(`${API_BASE}/admin/ads/slots/${id}`, {
      method: 'DELETE',
      headers: getAdminAuthHeaders(),
    }, 'Failed to delete ad slot');
  },

  async updateAdsSettings(adsConfig: Partial<import('../types').AdsManagementConfig>): Promise<{ message: string; adsConfig: import('../types').AdsManagementConfig; adSlots?: import('../types').AdSlotItem[] }> {
    return safeFetchJson(`${API_BASE}/admin/settings/ads`, {
      method: 'PUT',
      headers: getAdminAuthHeaders(),
      body: JSON.stringify(adsConfig),
    }, 'Failed to update ads settings');
  },

  async updateSiteSettings(updates: Partial<SiteSettings>): Promise<{ message: string; siteSettings: SiteSettings }> {
    return safeFetchJson(`${API_BASE}/admin/settings/site`, {
      method: 'PUT',
      headers: getAdminAuthHeaders(),
      body: JSON.stringify(updates),
    }, 'Failed to update site settings');
  },

  // ==========================================
  // CUSTOM THEMES & CMS
  // ==========================================
  async getThemes(): Promise<{ themes: import('../types').CustomTheme[]; activeThemeId?: string }> {
    return safeFetchJson(`${API_BASE}/admin/themes`, {
      headers: getAdminAuthHeaders(),
    }, 'Failed to load themes');
  },

  async createTheme(theme: Partial<import('../types').CustomTheme>): Promise<{ message: string; theme: import('../types').CustomTheme }> {
    return safeFetchJson(`${API_BASE}/admin/themes`, {
      method: 'POST',
      headers: getAdminAuthHeaders(),
      body: JSON.stringify(theme),
    }, 'Failed to create theme');
  },

  async updateTheme(id: string, theme: Partial<import('../types').CustomTheme>): Promise<{ message: string; theme: import('../types').CustomTheme }> {
    return safeFetchJson(`${API_BASE}/admin/themes/${id}`, {
      method: 'PUT',
      headers: getAdminAuthHeaders(),
      body: JSON.stringify(theme),
    }, 'Failed to update theme');
  },

  async activateTheme(id: string): Promise<{ message: string; theme: import('../types').CustomTheme; siteSettings: SiteSettings }> {
    return safeFetchJson(`${API_BASE}/admin/themes/${id}/activate`, {
      method: 'POST',
      headers: getAdminAuthHeaders(),
    }, 'Failed to activate theme');
  },

  async duplicateTheme(id: string): Promise<{ message: string; theme: import('../types').CustomTheme }> {
    return safeFetchJson(`${API_BASE}/admin/themes/${id}/duplicate`, {
      method: 'POST',
      headers: getAdminAuthHeaders(),
    }, 'Failed to duplicate theme');
  },

  async deleteTheme(id: string): Promise<{ message: string }> {
    return safeFetchJson(`${API_BASE}/admin/themes/${id}`, {
      method: 'DELETE',
      headers: getAdminAuthHeaders(),
    }, 'Failed to delete theme');
  },

  async deactivateTheme(id: string): Promise<{ message: string; siteSettings: SiteSettings }> {
    return safeFetchJson(`${API_BASE}/admin/themes/${id}/deactivate`, {
      method: 'POST',
      headers: getAdminAuthHeaders(),
    }, 'Failed to deactivate theme');
  },

  async resetThemesToDefault(): Promise<{ message: string; themes: import('../types').CustomTheme[]; siteSettings: SiteSettings }> {
    return safeFetchJson(`${API_BASE}/admin/themes/reset-defaults`, {
      method: 'POST',
      headers: getAdminAuthHeaders(),
    }, 'Failed to reset themes to defaults');
  },

  async importTheme(themeData: any): Promise<{ message: string; theme: import('../types').CustomTheme }> {
    return safeFetchJson(`${API_BASE}/admin/themes/import`, {
      method: 'POST',
      headers: getAdminAuthHeaders(),
      body: JSON.stringify(themeData),
    }, 'Failed to import theme');
  },

  async updateGlobalContent(content: Partial<import('../types').GlobalContentSettings>): Promise<{ message: string; globalContent: import('../types').GlobalContentSettings }> {
    return safeFetchJson(`${API_BASE}/admin/settings/global-content`, {
      method: 'PUT',
      headers: getAdminAuthHeaders(),
      body: JSON.stringify(content),
    }, 'Failed to update global content');
  },

  async updateStatsConfig(config: Partial<import('../types').StatsConfig>): Promise<{ message: string; statsConfig: import('../types').StatsConfig }> {
    return safeFetchJson(`${API_BASE}/admin/settings/stats`, {
      method: 'PUT',
      headers: getAdminAuthHeaders(),
      body: JSON.stringify(config),
    }, 'Failed to update statistics config');
  },

  async duplicateContestant(id: string): Promise<{ message: string; contestant: Contestant }> {
    return safeFetchJson(`${API_BASE}/admin/contestants/${id}/duplicate`, {
      method: 'POST',
      headers: getAdminAuthHeaders(),
    }, 'Failed to duplicate contestant');
  },

  async reorderContestants(ids: string[]): Promise<{ message: string; contestants: Contestant[] }> {
    return safeFetchJson(`${API_BASE}/admin/contestants/reorder`, {
      method: 'PUT',
      headers: getAdminAuthHeaders(),
      body: JSON.stringify({ ids }),
    }, 'Failed to reorder contestants');
  },

  // ==========================================
  // LOGS & VOTES
  // ==========================================
  async getAuditLogs(): Promise<{ auditLogs: VoteAuditLog[] }> {
    return safeFetchJson(`${API_BASE}/admin/audit-logs`, {
      headers: getAdminAuthHeaders(),
    }, 'Failed to fetch audit logs');
  },

  async getActivityLogs(): Promise<{ logs: AdminActivityLog[] }> {
    return safeFetchJson(`${API_BASE}/admin/activity-logs`, {
      headers: getAdminAuthHeaders(),
    }, 'Failed to fetch activity logs');
  },

  async getAdminVotes(params?: { search?: string; contestantId?: string; status?: string; limit?: number; offset?: number }): Promise<{
    votes: Vote[];
    total: number;
    offset: number;
    limit: number;
  }> {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.contestantId) query.set('contestantId', params.contestantId);
    if (params?.status) query.set('status', params.status);
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.offset) query.set('offset', String(params.offset));

    return safeFetchJson(`${API_BASE}/admin/votes?${query.toString()}`, {
      headers: getAdminAuthHeaders(),
    }, 'Failed to fetch vote logs');
  },

  async resetData(): Promise<{ message: string; state: AppStateData }> {
    return safeFetchJson(`${API_BASE}/admin/reset-data`, {
      method: 'POST',
      headers: getAdminAuthHeaders(),
    }, 'Failed to reset database');
  }
};
