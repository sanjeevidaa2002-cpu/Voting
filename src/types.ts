export interface Contestant {
  id: string;
  name: string;
  contestantNumber: string; // e.g. "01", "02"
  photoUrl: string;
  description: string;
  age: number;
  occupation: string;
  city: string;
  voteCount: number;
  status: 'active' | 'nominated' | 'safe' | 'evicted';
  rank?: number;
  percentage?: number;
  tagline?: string;
  order: number;
  createdAt: string;
}

export interface AnonymousVote {
  id: string;
  contestantId: string;
  contestantName: string;
  contestantNumber: string;
  timestamp: string;
  seasonId: string;
  status: 'valid' | 'flagged' | 'revoked';
  clientIp?: string;
  userId?: string;
  userEmail?: string;
}

export type Vote = AnonymousVote;

export interface Banner {
  id: string;
  name?: string;
  title?: string;
  subtitle?: string;
  desktopImageUrl: string;
  tabletImageUrl?: string;
  mobileImageUrl?: string;
  ctaText?: string;
  ctaLink?: string;
  destinationUrl?: string;
  openInNewTab?: boolean;
  openTarget?: '_self' | '_blank';
  isActive: boolean;
  status?: 'active' | 'inactive';
  order: number;
  displayOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface VotingSettings {
  isVotingActive: boolean;
  seasonId: string;
  seasonName: string;
  startDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endDate: string;   // YYYY-MM-DD
  endTime: string;   // HH:mm
  voteLimitPerUser: number;
  voteCooldownSeconds: number;
  votingOpenMessage: string;
  votingClosedMessage: string;
  hideLiveResults: boolean;
  showRanking: boolean;
  showVoteCounts: boolean;
  showPercentages: boolean;
  showResultsSection: boolean;
}

export interface ThemeColors {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  cardBackgroundColor: string;
  headerBackgroundColor: string;
  footerBackgroundColor: string;
  buttonColor: string;
  buttonHoverColor: string;
  textColor: string;
  secondaryTextColor: string;
  borderColor: string;
  inputBackgroundColor: string;
  modalBackgroundColor: string;
  successColor: string;
  warningColor?: string;
  errorColor: string;
}

export interface ThemeBackgrounds {
  desktopBackground?: string;
  tabletBackground?: string;
  mobileBackground?: string;
  loginBackground?: string;
  adminBackground?: string;
  homepageBackground?: string;
  contestantSectionBackground?: string;
  resultsBackground?: string;
  footerBackground?: string;
}

export interface ThemeGradients {
  heroGradient?: string;
  headerGradient?: string;
  buttonGradient?: string;
  cardGradient?: string;
  backgroundGradient?: string;
  footerGradient?: string;
  sectionGradient?: string;
}

export interface CustomTheme extends ThemeColors {
  id: string;
  name: string;
  description?: string;
  preset: string;
  isActive: boolean;
  isCustom?: boolean;
  backgrounds: ThemeBackgrounds;
  gradients?: ThemeGradients;
  borderRadius: string; // e.g. '0.5rem', '1rem', '1.5rem', '0.25rem', '9999px'
  fontFamily: 'outfit' | 'cinzel' | 'jakarta' | 'serif' | 'sans';
  shadowLevel: 'none' | 'subtle' | 'medium' | 'glow';
  createdAt?: string;
  updatedAt?: string;
}

export interface ThemeSettings extends ThemeColors {
  preset: 'dark-gold' | 'luxury-gold' | 'neon-cyber' | 'clean-light' | 'glass-ui' | 'custom' | string;
  activeThemeId?: string;
  borderRadius: string; // e.g. '0.5rem', '1rem', '1.5rem'
  fontFamily: 'outfit' | 'cinzel' | 'jakarta' | 'serif' | 'sans';
  shadowLevel: 'none' | 'subtle' | 'medium' | 'glow';
  backgrounds?: ThemeBackgrounds;
  gradients?: ThemeGradients;
}

export interface UISettings {
  headerStyle: 'solid' | 'glass' | 'minimal';
  navigationStyle: 'pills' | 'underline' | 'bordered';
  buttonStyle: 'rounded' | 'pill' | 'sharp';
  cardStyle: 'modern' | 'glass' | 'bordered' | 'flat';
  contestantCardLayout: 'grid-3' | 'grid-4' | 'bento';
  resultsLayout: 'standard' | 'compact' | 'detailed';
}

export interface BrandingSettings {
  mainLogoUrl?: string;
  mobileLogoUrl?: string;
  faviconUrl?: string;
  headerLogoUrl?: string;
  footerLogoUrl?: string;
  adminLogoUrl?: string;
  showLogoUrl?: string;
  websiteName: string;
  showName: string;
  browserTitle: string;
  tagline: string;
  logoText: string;
  logoIcon: string;
}

export interface StatsConfig {
  liveStatus: {
    enabled: boolean;
    label: string;
    description: string;
  };
  totalVotes: {
    enabled: boolean;
    label: string;
    description: string;
  };
  contestantsCount: {
    enabled: boolean;
    label: string;
    description: string;
  };
  countdownTimer: {
    enabled: boolean;
    label: string;
    description: string;
  };
}

export interface GlobalContentSettings {
  branding: {
    siteName: string;
    showName: string;
    tagline: string;
    browserTitle: string;
    logoText: string;
  };
  header: {
    tickerAnnouncement: string;
    liveCounterLabel: string;
    showLiveCounter: boolean;
    loginButtonText: string;
    signupButtonText: string;
  };
  homepage: {
    heroBadge: string;
    heroTitle: string;
    heroSubtitle: string;
    heroPrimaryCta: string;
    heroSecondaryCta: string;
    contestantsBadge: string;
    contestantsTitle: string;
    contestantsSubtitle: string;
    rankingBadge: string;
    rankingTitle: string;
    rankingSubtitle: string;
  };
  voting: {
    sectionTitle: string;
    sectionDescription: string;
    voteButtonText: string;
    alreadyVotedMessage: string;
    voteSuccessMessage: string;
    voteErrorMessage: string;
    votingClosedMessage: string;
  };
  results: {
    sectionTitle: string;
    sectionSubtitle: string;
    leaderboardLabel: string;
  };
  about: {
    sectionTitle: string;
    sectionSubtitle: string;
    showOverviewTitle: string;
    rulesTitle: string;
    stepsTitle: string;
  };
  footer: {
    brandDescription: string;
    copyrightText: string;
    contactEmail: string;
    contactPhone: string;
    studioAddress: string;
  };
  messages: {
    systemMaintenanceNotice: string;
    winnerAnnouncement: string;
    alertBannerActive: boolean;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    metaKeywords: string;
    ogTitle: string;
    ogDescription: string;
    ogImageUrl: string;
  };
}

export interface NavigationItem {
  id: string;
  label: string;
  url: string;
  order: number;
  isEnabled: boolean;
  isExternal?: boolean;
}

export interface HomepageSection {
  id: string;
  type: 'hero_banner' | 'contestants' | 'voting_status' | 'live_ranking' | 'rules_guide' | 'faq' | 'footer';
  title: string;
  subtitle: string;
  isEnabled: boolean;
  order: number;
  ctaText?: string;
  ctaLink?: string;
}

export interface PageContent {
  slug: string;
  title: string;
  subtitle: string;
  content: string;
  sections?: { title: string; body: string }[];
  updatedAt: string;
}

export interface GoogleServicesSettings {
  googleAnalytics: {
    enabled: boolean;
    measurementId: string; // e.g. G-XXXXXXXXXX
  };
  googleAdSense: {
    enabled: boolean;
    publisherId: string; // e.g. ca-pub-XXXXXXXXXXXXXXXX
    slotId: string;
  };
  googleSearchConsole: {
    enabled: boolean;
    verificationCode: string;
  };
  googleTagManager: {
    enabled: boolean;
    containerId: string; // e.g. GTM-XXXXXXX
  };
}

export type AdLocation = 'header' | 'homepage' | 'banner' | 'between_content' | 'footer' | 'custom';

export interface AdSlotItem {
  id: string;
  name: string;
  location: AdLocation;
  code: string;
  enabled: boolean;
  desktop: boolean;
  tablet: boolean;
  mobile: boolean;
  order: number;
  previewNote?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdSlotConfig {
  enabled: boolean;
  code: string;
  slotType?: 'header' | 'footer' | 'banner' | 'homepage' | 'between_content' | 'custom';
  previewNote?: string;
  desktop?: boolean;
  tablet?: boolean;
  mobile?: boolean;
}

export interface AdsManagementConfig {
  headerAd?: AdSlotConfig;
  footerAd?: AdSlotConfig;
  bannerAd?: AdSlotConfig;
  slots?: AdSlotItem[];
}

export interface SiteSettings {
  siteName: string;
  tagline: string;
  logoText: string;
  logoIcon: string;
  logoUrl?: string;
  seasonTitle: string;
  branding: BrandingSettings;
  theme: ThemeSettings;
  themes?: CustomTheme[];
  statsConfig?: StatsConfig;
  globalContent?: GlobalContentSettings;
  adsConfig?: AdsManagementConfig;
  adSlots?: AdSlotItem[];
  uiSettings: UISettings;
  navigationItems: NavigationItem[];
  homepageSections: HomepageSection[];
  googleServices: GoogleServicesSettings;
  footerContent: {
    copyright: string;
    contactEmail: string;
    contactPhone: string;
    address: string;
    description?: string;
    socialLinks: {
      twitter: string;
      instagram: string;
      youtube: string;
      facebook: string;
    };
  };
  aboutContent: {
    showDescription: string;
    votingRules: string[];
    votingInstructions: string[];
    terms: string;
    privacyPolicy: string;
  };
}

export interface RegisteredUser {
  id: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
  createdAt: string;
  lastLogin?: string;
  isActive: boolean;
  role: 'user' | 'admin' | string;
  votedContestantId?: string | null;
  votedContestantName?: string | null;
  votedAt?: string | null;
  voteId?: string | null;
}

export interface VoteAuditLog {
  id: string;
  contestantId: string;
  contestantName: string;
  previousCount: number;
  newCount: number;
  difference?: number;
  actionType?: 'EDIT' | 'ADD' | 'REMOVE';
  reason: string;
  adjustedBy: string;
  timestamp: string;
  date?: string;
  time?: string;
}

export interface AdminActivityLog {
  id: string;
  action: string;
  admin: string;
  details: string;
  timestamp: string;
}

export interface VotingStats {
  totalVotes: number;
  votesToday: number;
  votesYesterday: number;
  votesThisWeek: number;
  votesThisMonth: number;
  totalUsers?: number;
  contestantStats: {
    contestantId: string;
    name: string;
    photoUrl: string;
    voteCount: number;
    percentage: number;
    rank: number;
    status: string;
  }[];
  hourlyActivity: { hour: string; count: number }[];
  dailyActivity: { date: string; count: number }[];
}

export interface MediaItem {
  id: string;
  name: string;
  url: string;
  type: 'contestant' | 'banner' | 'logo' | 'background' | 'branding' | 'general' | 'other';
  size?: string;
  createdAt: string;
}

export interface VoterSessionInfo {
  voterToken: string;
  hasVoted: boolean;
  votedContestantId?: string | null;
  votedContestantName?: string | null;
  voteId?: string | null;
  votedAt?: string | null;
}

export interface AppStateData {
  contestants: Contestant[];
  votingSettings: VotingSettings;
  banners: Banner[];
  siteSettings: SiteSettings;
  totalVotes: number;
  totalUsers?: number;
  lastUpdated: string;
}

export interface AdminAuthSession {
  token: string;
  adminId: string;
  username: string;
  expiresAt: string;
}

export interface UserAuthSession {
  token: string;
  user: RegisteredUser;
}
