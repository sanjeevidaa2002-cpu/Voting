import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import { PREDEFINED_THEMES, convertPaletteToCustomTheme } from './src/data/predefinedThemes';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Database storage file path
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Interface for DB
interface DatabaseSchema {
  adminSessionToken?: string;
  users: Array<{
    id: string;
    fullName: string;
    email: string;
    passwordHash: string;
    avatarUrl?: string;
    createdAt: string;
    lastLogin?: string;
    isActive: boolean;
    role: 'user' | 'admin' | string;
    votedContestantId?: string | null;
    votedContestantName?: string | null;
    votedAt?: string | null;
    voteId?: string | null;
  }>;
  contestants: Array<{
    id: string;
    name: string;
    contestantNumber: string;
    photoUrl: string;
    description: string;
    age: number;
    occupation: string;
    city: string;
    voteCount: number;
    status: 'active' | 'nominated' | 'safe' | 'evicted';
    tagline?: string;
    order: number;
    createdAt: string;
  }>;
  votes: Array<{
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
  }>;
  voters: Array<{
    id: string;
    voterToken: string;
    ipHash: string;
    userId?: string;
    contestantId: string;
    contestantName: string;
    timestamp: string;
  }>;
  media: Array<{
    id: string;
    name: string;
    url: string;
    type: 'contestant' | 'banner' | 'logo' | 'background' | 'other';
    size?: string;
    createdAt: string;
  }>;
  banners: Array<{
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
  }>;
  pages: Record<string, {
    slug: string;
    title: string;
    subtitle: string;
    content: string;
    sections?: { title: string; body: string }[];
    updatedAt: string;
  }>;
  votingSettings: {
    isVotingActive: boolean;
    seasonId: string;
    seasonName: string;
    startDate: string;
    startTime: string;
    endDate: string;
    endTime: string;
    voteLimitPerUser: number;
    voteCooldownSeconds: number;
    votingOpenMessage: string;
    votingClosedMessage: string;
    hideLiveResults: boolean;
    showRanking: boolean;
    showVoteCounts: boolean;
    showPercentages: boolean;
    showResultsSection: boolean;
  };
  themes?: Array<{
    id: string;
    name: string;
    description?: string;
    preset: string;
    isActive: boolean;
    isCustom?: boolean;
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
    errorColor: string;
    borderRadius: string;
    fontFamily: 'outfit' | 'cinzel' | 'jakarta' | 'serif' | 'sans';
    shadowLevel: 'none' | 'subtle' | 'medium' | 'glow';
    backgrounds: {
      desktopBackground?: string;
      tabletBackground?: string;
      mobileBackground?: string;
      loginBackground?: string;
      adminBackground?: string;
      homepageBackground?: string;
      contestantSectionBackground?: string;
      footerBackground?: string;
    };
    createdAt?: string;
    updatedAt?: string;
  }>;
  siteSettings: {
    siteName: string;
    tagline: string;
    logoText: string;
    logoIcon: string;
    logoUrl?: string;
    seasonTitle: string;
    branding: {
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
    };
    theme: {
      preset: string;
      activeThemeId?: string;
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
      errorColor: string;
      borderRadius: string;
      fontFamily: 'outfit' | 'cinzel' | 'jakarta' | 'serif' | 'sans';
      shadowLevel: 'none' | 'subtle' | 'medium' | 'glow';
      backgrounds?: {
        desktopBackground?: string;
        tabletBackground?: string;
        mobileBackground?: string;
        loginBackground?: string;
        adminBackground?: string;
        homepageBackground?: string;
        contestantSectionBackground?: string;
        footerBackground?: string;
      };
    };
    statsConfig?: {
      liveStatus: { enabled: boolean; label: string; description: string };
      totalVotes: { enabled: boolean; label: string; description: string };
      contestantsCount: { enabled: boolean; label: string; description: string };
      countdownTimer: { enabled: boolean; label: string; description: string };
    };
    globalContent?: {
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
    };
    uiSettings: {
      headerStyle: 'solid' | 'glass' | 'minimal';
      navigationStyle: 'pills' | 'underline' | 'bordered';
      buttonStyle: 'rounded' | 'pill' | 'sharp';
      cardStyle: 'modern' | 'glass' | 'bordered' | 'flat';
      contestantCardLayout: 'grid-3' | 'grid-4' | 'bento';
      resultsLayout: 'standard' | 'compact' | 'detailed';
    };
    navigationItems: Array<{
      id: string;
      label: string;
      url: string;
      order: number;
      isEnabled: boolean;
      isExternal?: boolean;
    }>;
    homepageSections: Array<{
      id: string;
      type: 'hero_banner' | 'contestants' | 'voting_status' | 'live_ranking' | 'rules_guide' | 'faq' | 'footer';
      title: string;
      subtitle: string;
      isEnabled: boolean;
      order: number;
      ctaText?: string;
      ctaLink?: string;
    }>;
    googleServices: {
      googleAnalytics: {
        enabled: boolean;
        measurementId: string;
      };
      googleAdSense: {
        enabled: boolean;
        publisherId: string;
        slotId: string;
      };
      googleSearchConsole: {
        enabled: boolean;
        verificationCode: string;
      };
      googleTagManager: {
        enabled: boolean;
        containerId: string;
      };
    };
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
    adsConfig?: {
      headerAd?: {
        enabled: boolean;
        code: string;
        slotType: 'header';
        previewNote?: string;
        desktop?: boolean;
        tablet?: boolean;
        mobile?: boolean;
      };
      footerAd?: {
        enabled: boolean;
        code: string;
        slotType: 'footer';
        previewNote?: string;
        desktop?: boolean;
        tablet?: boolean;
        mobile?: boolean;
      };
      bannerAd?: {
        enabled: boolean;
        code: string;
        slotType: string;
        previewNote?: string;
        desktop?: boolean;
        tablet?: boolean;
        mobile?: boolean;
      };
      customPlacements?: Array<{
        id: string;
        name: string;
        slotType: string;
        code: string;
        enabled: boolean;
      }>;
      [key: string]: any;
    };
    adSlots?: Array<{
      id: string;
      name: string;
      location: 'header' | 'homepage' | 'between_content' | 'banner' | 'footer' | 'custom';
      code: string;
      enabled: boolean;
      desktop?: boolean;
      tablet?: boolean;
      mobile?: boolean;
      order?: number;
      previewNote?: string;
      createdAt?: string;
      updatedAt?: string;
    }>;
  };
  auditLogs: Array<{
    id: string;
    contestantId: string;
    contestantName: string;
    previousCount: number;
    newCount: number;
    reason: string;
    adjustedBy: string;
    timestamp: string;
  }>;
  adminLogs: Array<{
    id: string;
    action: string;
    admin: string;
    details: string;
    timestamp: string;
  }>;
}

// Initial default seed data
function getDefaultSeedData(): DatabaseSchema {
  const now = new Date();
  const futureDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
  const startDateStr = now.toISOString().split('T')[0];
  const endDateStr = futureDate.toISOString().split('T')[0];

  return {
    users: [
      {
        id: 'usr_demo_01',
        fullName: 'Aarav Sharma',
        email: 'voter@example.com',
        passwordHash: hashPassword('password123'),
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
        createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
        lastLogin: new Date().toISOString(),
        isActive: true,
        role: 'user'
      }
    ],
    contestants: [
      {
        id: 'cnt_01',
        name: 'Devika Singhania',
        contestantNumber: '01',
        photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
        description: 'Dynamic theatre artist, classical dancer, and charismatic social influencer known for her fearless vocal presence in the house.',
        age: 26,
        occupation: 'Theatre Artist & Creator',
        city: 'Mumbai',
        voteCount: 348920,
        status: 'nominated',
        tagline: 'Fearless, Unfiltered & Graceful',
        order: 1,
        createdAt: new Date(Date.now() - 20 * 86400000).toISOString()
      },
      {
        id: 'cnt_02',
        name: 'Kabir Raichand',
        contestantNumber: '02',
        photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80',
        description: 'Fitness icon, MMA trainer, and strategic powerhouse who leads every physical arena task with unyielding focus.',
        age: 29,
        occupation: 'MMA Fighter & Fitness Coach',
        city: 'Delhi',
        voteCount: 312450,
        status: 'nominated',
        tagline: 'Discipline Over Everything',
        order: 2,
        createdAt: new Date(Date.now() - 20 * 86400000).toISOString()
      },
      {
        id: 'cnt_03',
        name: 'Ananya Roy',
        contestantNumber: '03',
        photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop&q=80',
        description: 'Acclaimed playback singer and songwriter bringing harmony, wit, and emotional intelligence into the high-stakes house.',
        age: 24,
        occupation: 'Playback Singer & Musician',
        city: 'Kolkata',
        voteCount: 284190,
        status: 'nominated',
        tagline: 'Melody with a Fighting Spirit',
        order: 3,
        createdAt: new Date(Date.now() - 20 * 86400000).toISOString()
      },
      {
        id: 'cnt_04',
        name: 'Vikramjit "VJ" Gill',
        contestantNumber: '04',
        photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&auto=format&fit=crop&q=80',
        description: 'Stand-up comedian, talk-show host, and crowd favorite bringing non-stop laughter and sharp observational humour.',
        age: 31,
        occupation: 'Standup Comedian & Host',
        city: 'Chandigarh',
        voteCount: 241830,
        status: 'nominated',
        tagline: 'Laughter is the Ultimate Shield',
        order: 4,
        createdAt: new Date(Date.now() - 20 * 86400000).toISOString()
      },
      {
        id: 'cnt_05',
        name: 'Meera Nambiar',
        contestantNumber: '05',
        photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=80',
        description: 'Corporate lawyer turned investigative journalist known for exposing alliances and masterminding boardroom debates.',
        age: 28,
        occupation: 'Investigative Journalist',
        city: 'Bengaluru',
        voteCount: 198740,
        status: 'nominated',
        tagline: 'Facts, Logic & Unshakable Truth',
        order: 5,
        createdAt: new Date(Date.now() - 20 * 86400000).toISOString()
      },
      {
        id: 'cnt_06',
        name: 'Samir Khan',
        contestantNumber: '06',
        photoUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=800&auto=format&fit=crop&q=80',
        description: 'Celebrity fashion stylist and luxury runway designer with an eye for dramatic flair and unshakeable loyalty.',
        age: 27,
        occupation: 'Fashion Stylist & Creative Director',
        city: 'Hyderabad',
        voteCount: 165210,
        status: 'safe',
        tagline: 'Style, Swagger & Sincerity',
        order: 6,
        createdAt: new Date(Date.now() - 20 * 86400000).toISOString()
      },
      {
        id: 'cnt_07',
        name: 'Rohan Deshmukh',
        contestantNumber: '07',
        photoUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=800&auto=format&fit=crop&q=80',
        description: 'Tech entrepreneur and esports grandmaster playing a calculated psychological long-game inside the arena.',
        age: 25,
        occupation: 'Tech Founder & Gamer',
        city: 'Pune',
        voteCount: 142380,
        status: 'safe',
        tagline: 'Strategy Before Emotion',
        order: 7,
        createdAt: new Date(Date.now() - 20 * 86400000).toISOString()
      },
      {
        id: 'cnt_08',
        name: 'Tara Kapoor',
        contestantNumber: '08',
        photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&auto=format&fit=crop&q=80',
        description: 'Wildlife photographer, environmentalist, and survivalist who stays calm under high-voltage kitchen arguments.',
        age: 30,
        occupation: 'Wildlife Photojournalist',
        city: 'Dehradun',
        voteCount: 98450,
        status: 'evicted',
        tagline: 'Silent Observer, Deep Thinker',
        order: 8,
        createdAt: new Date(Date.now() - 20 * 86400000).toISOString()
      }
    ],
    votes: [],
    voters: [],
    media: [
      {
        id: 'med_01',
        name: 'Devika Singhania Official Portrait',
        url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
        type: 'contestant',
        size: '1.2 MB',
        createdAt: new Date(Date.now() - 15 * 86400000).toISOString()
      },
      {
        id: 'med_02',
        name: 'Kabir Raichand Action Headshot',
        url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80',
        type: 'contestant',
        size: '1.4 MB',
        createdAt: new Date(Date.now() - 15 * 86400000).toISOString()
      },
      {
        id: 'med_03',
        name: 'Ananya Roy Studio Shot',
        url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop&q=80',
        type: 'contestant',
        size: '1.1 MB',
        createdAt: new Date(Date.now() - 15 * 86400000).toISOString()
      },
      {
        id: 'med_04',
        name: 'Vikramjit Gill Promo Picture',
        url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&auto=format&fit=crop&q=80',
        type: 'contestant',
        size: '1.3 MB',
        createdAt: new Date(Date.now() - 15 * 86400000).toISOString()
      },
      {
        id: 'med_05',
        name: 'Grand Finale Gold Stage Banner',
        url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1920&auto=format&fit=crop&q=85',
        type: 'banner',
        size: '3.4 MB',
        createdAt: new Date(Date.now() - 10 * 86400000).toISOString()
      },
      {
        id: 'med_06',
        name: 'Clash of Titans Promo Backdrop',
        url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1920&auto=format&fit=crop&q=85',
        type: 'banner',
        size: '2.8 MB',
        createdAt: new Date(Date.now() - 10 * 86400000).toISOString()
      },
      {
        id: 'med_07',
        name: 'Star House Golden Emblem',
        url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&auto=format&fit=crop&q=80',
        type: 'logo',
        size: '640 KB',
        createdAt: new Date(Date.now() - 20 * 86400000).toISOString()
      }
    ],
    banners: [
      {
        id: 'bnr_01',
        name: 'Grand Finale Elimination Week',
        title: 'Grand Finale Elimination Week',
        subtitle: '',
        desktopImageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1920&auto=format&fit=crop&q=85',
        tabletImageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&auto=format&fit=crop&q=85',
        mobileImageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=85',
        destinationUrl: '#contestants-section',
        ctaLink: '#contestants-section',
        openInNewTab: false,
        openTarget: '_self',
        isActive: true,
        status: 'active',
        order: 1,
        displayOrder: 1
      },
      {
        id: 'bnr_02',
        name: 'Live 24/7 Broadcast Arena',
        title: 'Live 24/7 Broadcast Arena',
        subtitle: '',
        desktopImageUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1920&auto=format&fit=crop&q=85',
        tabletImageUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&auto=format&fit=crop&q=85',
        mobileImageUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop&q=85',
        destinationUrl: 'https://youtube.com',
        ctaLink: 'https://youtube.com',
        openInNewTab: true,
        openTarget: '_blank',
        isActive: true,
        status: 'active',
        order: 2,
        displayOrder: 2
      },
      {
        id: 'bnr_03',
        name: 'Official Leaderboard & Top Rankings',
        title: 'Official Leaderboard & Top Rankings',
        subtitle: '',
        desktopImageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1920&auto=format&fit=crop&q=85',
        tabletImageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&auto=format&fit=crop&q=85',
        mobileImageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=85',
        destinationUrl: '#ranking-section',
        ctaLink: '#ranking-section',
        openInNewTab: false,
        openTarget: '_self',
        isActive: true,
        status: 'active',
        order: 3,
        displayOrder: 3
      },
      {
        id: 'bnr_04',
        name: 'Star House Global Community',
        title: 'Star House Global Community',
        subtitle: '',
        desktopImageUrl: 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=1920&auto=format&fit=crop&q=85',
        tabletImageUrl: 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=1200&auto=format&fit=crop&q=85',
        mobileImageUrl: 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=800&auto=format&fit=crop&q=85',
        destinationUrl: 'https://twitter.com',
        ctaLink: 'https://twitter.com',
        openInNewTab: true,
        openTarget: '_blank',
        isActive: true,
        status: 'active',
        order: 4,
        displayOrder: 4
      },
      {
        id: 'bnr_05',
        name: 'VIP Backstage Access & Exclusive Moments',
        title: 'VIP Backstage Access & Exclusive Moments',
        subtitle: '',
        desktopImageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1920&auto=format&fit=crop&q=85',
        tabletImageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200&auto=format&fit=crop&q=85',
        mobileImageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&auto=format&fit=crop&q=85',
        destinationUrl: 'https://instagram.com',
        ctaLink: 'https://instagram.com',
        openInNewTab: true,
        openTarget: '_blank',
        isActive: true,
        status: 'active',
        order: 5,
        displayOrder: 5
      },
      {
        id: 'bnr_06',
        name: 'Crown of Titans Trophy Showdown',
        title: 'Crown of Titans Trophy Showdown',
        subtitle: '',
        desktopImageUrl: 'https://images.unsplash.com/photo-1469488865564-c2de10f69f96?w=1920&auto=format&fit=crop&q=85',
        tabletImageUrl: 'https://images.unsplash.com/photo-1469488865564-c2de10f69f96?w=1200&auto=format&fit=crop&q=85',
        mobileImageUrl: 'https://images.unsplash.com/photo-1469488865564-c2de10f69f96?w=800&auto=format&fit=crop&q=85',
        destinationUrl: '#contestants-section',
        ctaLink: '#contestants-section',
        openInNewTab: false,
        openTarget: '_self',
        isActive: true,
        status: 'active',
        order: 6,
        displayOrder: 6
      }
    ],
    pages: {
      about: {
        slug: 'about',
        title: 'About The Show',
        subtitle: 'The 24/7 Reality Arena That Captivated The Nation',
        content: 'Star House is the nation’s most watched 24/7 reality entertainment phenomenon where celebrity contestants are locked inside a purpose-built smart arena under full camera surveillance with zero outside contact. Every week, housemates face nominations and the public holds the absolute power to decide who stays and who gets evicted.',
        sections: [
          {
            title: '24/7 Live Broadcast & House Dynamics',
            body: 'Inside Star House, high-intensity luxury meets psychological survival. From daily captaincy tasks and luxury budget showdowns to late-night strategy sessions, every second is broadcast live to millions of passionate viewers across all digital and television channels.'
          },
          {
            title: 'The People’s Power',
            body: 'No jury, no judge — only the public votes decide the ultimate winner of the Crown of Titans and the grand cash prize of $1,000,000.'
          }
        ],
        updatedAt: new Date().toISOString()
      },
      rules: {
        slug: 'rules',
        title: 'Official Voting Rules',
        subtitle: 'Fair Play, Velocity Security & Verification Standards',
        content: 'To maintain integrity and fairness, Star House utilizes server-authoritative anti-fraud verification and strict rate limiting on every vote submitted.',
        sections: [
          {
            title: '1. One Vote Per Visitor / Account Rule',
            body: 'Each unique visitor or logged-in account is allocated exactly one official vote per nomination round. Once your ballot is cast, your voting status is permanently recorded in the database.'
          },
          {
            title: '2. Free Public Access',
            body: 'Voting is 100% free of charge. You may vote anonymously as a guest or sign up for an account to maintain your official voting receipt.'
          },
          {
            title: '3. Anti-Bot & Velocity Shield',
            body: 'Automated scripts, headless bots, and proxy manipulation attempts are automatically intercepted and disqualified by our real-time security shield.'
          }
        ],
        updatedAt: new Date().toISOString()
      },
      'how-to-vote': {
        slug: 'how-to-vote',
        title: 'How To Vote',
        subtitle: 'Simple 3-Step Guide to Saving Your Favorite Contestant',
        content: 'Voting is quick, simple, and instant. Follow these steps:',
        sections: [
          {
            title: 'Step 1: Choose Your Contestant',
            body: 'Browse the official contestant roster on the homepage or contestants directory. Review stats, photos, and nomination status.'
          },
          {
            title: 'Step 2: Click "VOTE NOW"',
            body: 'Click the Vote button on your chosen nominee’s card to trigger the vote confirmation window.'
          },
          {
            title: 'Step 3: Confirm & Celebrate',
            body: 'Confirm your choice to submit your official vote directly to the secure audit ledger.'
          }
        ],
        updatedAt: new Date().toISOString()
      },
      terms: {
        slug: 'terms',
        title: 'Terms & Conditions',
        subtitle: 'Official Viewer Participation & Voting Terms',
        content: 'By participating in the Star House voting platform, you agree to adhere to all broadcast rules and integrity guidelines.',
        sections: [
          {
            title: 'Eligibility',
            body: 'Public voting is open worldwide to all viewers. Standard data rates may apply depending on your internet service provider.'
          },
          {
            title: 'Results Finality',
            body: 'All tallies compiled at the official voting deadline are certified by an independent auditor and are conclusive.'
          }
        ],
        updatedAt: new Date().toISOString()
      },
      privacy: {
        slug: 'privacy',
        title: 'Privacy Policy',
        subtitle: 'How We Protect Your Information & Session Privacy',
        content: 'We take privacy seriously. Guest voters are tracked using anonymized cryptographic tokens, and registered users have full control over their profile data.',
        sections: [
          {
            title: 'Data Collection & Anonymization',
            body: 'IP addresses are hashed with cryptographic salt to prevent duplicate voting while ensuring zero personally identifiable logging for guest voters.'
          }
        ],
        updatedAt: new Date().toISOString()
      },
      contact: {
        slug: 'contact',
        title: 'Contact Production',
        subtitle: 'Reach Out to Star House Broadcast & Viewer Support',
        content: 'Have questions about voting, show broadcasts, or media accreditation? Contact our dedicated support team.',
        sections: [
          {
            title: 'Studio Headquarters',
            body: 'Star House Media Studios, Stage 4B, Film City, Studio Boulevard'
          },
          {
            title: 'Direct Helpline',
            body: 'Phone: +1 (800) 555-STAR | Email: support@starvoter.tv'
          }
        ],
        updatedAt: new Date().toISOString()
      },
      faq: {
        slug: 'faq',
        title: 'Frequently Asked Questions',
        subtitle: 'Everything You Need to Know About Voting & Rules',
        content: 'Common questions and answers regarding live voting, eliminations, and account features.',
        sections: [
          {
            title: 'Is voting completely free?',
            body: 'Yes, 100% free! You will never be asked for payment details or credit cards to vote.'
          },
          {
            title: 'Can I change my vote after submitting?',
            body: 'To protect broadcast integrity, all submitted votes are final and cannot be modified.'
          },
          {
            title: 'Do I need an account to vote?',
            body: 'No! You can vote immediately as a public guest. Signing up gives you an account receipt and voting profile.'
          }
        ],
        updatedAt: new Date().toISOString()
      }
    },
    votingSettings: {
      isVotingActive: true,
      seasonId: 'season_09',
      seasonName: 'Season 9: Crown of Titans',
      startDate: startDateStr,
      startTime: '00:00',
      endDate: endDateStr,
      endTime: '23:59',
      voteLimitPerUser: 1,
      voteCooldownSeconds: 3,
      votingOpenMessage: 'Official voting line is LIVE! Cast your vote now to save your favorite contestants.',
      votingClosedMessage: 'Official voting is currently CLOSED. Results will be announced live on the broadcast.',
      hideLiveResults: false,
      showRanking: true,
      showVoteCounts: true,
      showPercentages: true,
      showResultsSection: true
    },
    themes: PREDEFINED_THEMES.map((p, idx) => convertPaletteToCustomTheme(p, idx === 0)) as any,
    siteSettings: {
      siteName: 'STAR HOUSE',
      tagline: 'The Ultimate Reality TV Show',
      logoText: 'STAR HOUSE',
      logoIcon: 'Crown',
      logoUrl: '',
      seasonTitle: 'SEASON 9 — LIVE VOTING ARENA',
      branding: {
        websiteName: 'STAR HOUSE',
        showName: 'Season 9: Crown of Titans',
        browserTitle: 'StarVoter - Reality Show Voting Platform',
        tagline: 'The Ultimate Reality TV Show',
        logoText: 'STAR HOUSE',
        logoIcon: 'Crown',
        mainLogoUrl: '',
        mobileLogoUrl: '',
        faviconUrl: '',
        headerLogoUrl: '',
        footerLogoUrl: '',
        adminLogoUrl: '',
        showLogoUrl: ''
      },
      theme: {
        preset: 'luxury-gold',
        activeThemeId: 'thm_luxury_gold',
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
        backgrounds: {
          desktopBackground: '',
          tabletBackground: '',
          mobileBackground: '',
          loginBackground: '',
          adminBackground: '',
          homepageBackground: '',
          contestantSectionBackground: '',
          footerBackground: ''
        }
      },
      statsConfig: {
        liveStatus: {
          enabled: true,
          label: 'CURRENT STATUS',
          description: 'Official verification active'
        },
        totalVotes: {
          enabled: true,
          label: 'TOTAL VOTES CAST',
          description: 'Real-time Database Tally'
        },
        contestantsCount: {
          enabled: true,
          label: 'CONTESTANTS IN ARENA',
          description: 'Total Housemates'
        },
        countdownTimer: {
          enabled: true,
          label: 'VOTING ENDS IN',
          description: 'Official Deadline'
        }
      },
      globalContent: {
        branding: {
          siteName: 'STAR HOUSE',
          showName: 'Season 9: Crown of Titans',
          tagline: 'The Ultimate Reality TV Show',
          browserTitle: 'StarVoter - Reality Show Voting Platform',
          logoText: 'STAR HOUSE'
        },
        header: {
          tickerAnnouncement: 'SEASON 9 — LIVE VOTING ARENA',
          liveCounterLabel: 'Total Certified Votes:',
          showLiveCounter: true,
          loginButtonText: 'Login',
          signupButtonText: 'Sign Up'
        },
        homepage: {
          heroBadge: 'OFFICIAL LIVE PUBLIC VOTING',
          heroTitle: 'VOTE FOR YOUR FAVORITE',
          heroSubtitle: 'Grand Finale Elimination Week — Every Vote Counts!',
          heroPrimaryCta: 'VOTE NOW',
          heroSecondaryCta: 'Live Leaderboard',
          contestantsBadge: 'NOMINATED CONTESTANTS',
          contestantsTitle: 'Choose Who Stays In The House',
          contestantsSubtitle: 'Click Vote on your chosen housemate. One vote per viewer.',
          rankingBadge: 'LIVE VOTE LEADERBOARD',
          rankingTitle: 'Real-Time Percentage Standings',
          rankingSubtitle: 'Watch the momentum swing live as millions of viewers vote across the world.'
        },
        voting: {
          sectionTitle: 'Cast Your Official Vote',
          sectionDescription: 'Select your preferred contestant and verify your vote instantly.',
          voteButtonText: 'VOTE NOW',
          alreadyVotedMessage: 'You have already cast your official vote for this round.',
          voteSuccessMessage: 'Your official vote has been certified and recorded!',
          voteErrorMessage: 'Unable to submit vote. Please try again.',
          votingClosedMessage: 'Official voting is currently CLOSED. Results will be announced live on the broadcast.'
        },
        results: {
          sectionTitle: 'Official Live Results & Leaderboard',
          sectionSubtitle: 'Certified percentage standing of all active and nominated housemates.',
          leaderboardLabel: 'Current Standings'
        },
        about: {
          sectionTitle: 'About The Show & Voting Rules',
          sectionSubtitle: 'Everything you need to know about Star House broadcast and rules.',
          showOverviewTitle: 'The 24/7 Reality Arena That Captivated The Nation',
          rulesTitle: 'Fair Play, Velocity Security & Verification Standards',
          stepsTitle: 'Simple 3-Step Guide to Saving Your Favorite Contestant'
        },
        footer: {
          brandDescription: 'Star House is the official voting and interactive fan platform for the Star House reality television broadcast.',
          copyrightText: '© 2026 StarHouse Entertainment Network. All rights reserved.',
          contactEmail: 'support@starvoter.tv',
          contactPhone: '+1 (800) 555-STAR',
          studioAddress: 'StarHouse Media Studios, Stage 4B, Film City'
        },
        messages: {
          systemMaintenanceNotice: 'System running normally with 99.99% voting uptime.',
          winnerAnnouncement: 'Grand Finale Voting in Progress!',
          alertBannerActive: false
        },
        seo: {
          metaTitle: 'Star House Reality Show - Official Voting Platform',
          metaDescription: 'Vote for your favorite contestants in the Star House reality television arena. 100% free, real-time certified voting.',
          metaKeywords: 'reality tv voting, star house, vote contestants, live ranking, reality show',
          ogTitle: 'Star House Reality TV - Live Public Voting',
          ogDescription: 'Cast your official vote to save your favorite contestants in the Star House arena.',
          ogImageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&auto=format&fit=crop&q=85'
        }
      },
      uiSettings: {
        headerStyle: 'glass',
        navigationStyle: 'pills',
        buttonStyle: 'rounded',
        cardStyle: 'modern',
        contestantCardLayout: 'grid-4',
        resultsLayout: 'standard'
      },
      navigationItems: [
        { id: 'nav_home', label: 'Home', url: 'home', order: 1, isEnabled: true },
        { id: 'nav_contestants', label: 'Contestants', url: 'contestants', order: 2, isEnabled: true },
        { id: 'nav_ranking', label: 'Live Ranking', url: 'ranking', order: 3, isEnabled: true },
        { id: 'nav_results', label: 'Results', url: 'results', order: 4, isEnabled: true },
        { id: 'nav_about', label: 'Rules & Info', url: 'about', order: 5, isEnabled: true }
      ],
      homepageSections: [
        { id: 'sec_hero', type: 'hero_banner', title: 'Grand Finale Showcase', subtitle: 'Live Broadcast Carousel', isEnabled: true, order: 1 },
        { id: 'sec_status', type: 'voting_status', title: 'Live Elimination Voting', subtitle: 'Real-Time Arena Status', isEnabled: true, order: 2 },
        { id: 'sec_contestants', type: 'contestants', title: 'Nominated Contestants', subtitle: 'Cast Your Free Vote Below', isEnabled: true, order: 3, ctaText: 'Vote Now', ctaLink: '#contestants-section' },
        { id: 'sec_ranking', type: 'live_ranking', title: 'Live Vote Leaderboard', subtitle: 'Real-Time Percentage Standings', isEnabled: true, order: 4 },
        { id: 'sec_rules', type: 'rules_guide', title: 'How It Works', subtitle: 'Safe, Anonymous & Certified', isEnabled: true, order: 5 },
        { id: 'sec_faq', type: 'faq', title: 'Frequently Asked Questions', subtitle: 'Viewer Guide & Support', isEnabled: true, order: 6 }
      ],
      googleServices: {
        googleAnalytics: {
          enabled: false,
          measurementId: 'G-STARVOTE99'
        },
        googleAdSense: {
          enabled: false,
          publisherId: 'ca-pub-1234567890123456',
          slotId: '1234567890'
        },
        googleSearchConsole: {
          enabled: false,
          verificationCode: 'starhouse-verification-token'
        },
        googleTagManager: {
          enabled: false,
          containerId: 'GTM-STARHOUSE'
        }
      },
      adsConfig: {
        headerAd: {
          enabled: false,
          code: '',
          slotType: 'header',
          previewNote: 'Adsterra 728x90 or responsive top banner'
        },
        footerAd: {
          enabled: false,
          code: '',
          slotType: 'footer',
          previewNote: 'Adsterra 728x90 or 300x250 footer banner'
        },
        bannerAd: {
          enabled: false,
          code: '',
          slotType: 'banner',
          previewNote: 'Mid-page promotional banner'
        }
      },
      adSlots: [
        {
          id: 'ad_slot_header',
          name: 'Header Ad',
          location: 'header',
          code: '',
          enabled: false,
          desktop: true,
          tablet: true,
          mobile: true,
          order: 1,
          previewNote: 'Adsterra 728x90, 468x60, or responsive header ad'
        },
        {
          id: 'ad_slot_homepage',
          name: 'Homepage Top Ad',
          location: 'homepage',
          code: '',
          enabled: false,
          desktop: true,
          tablet: true,
          mobile: true,
          order: 2,
          previewNote: 'Dedicated homepage ad slot below header / ticker'
        },
        {
          id: 'ad_slot_banner',
          name: 'Banner / Secondary Ad',
          location: 'banner',
          code: '',
          enabled: false,
          desktop: true,
          tablet: true,
          mobile: true,
          order: 3,
          previewNote: 'Dedicated ad container positioned near the hero banner showcase'
        },
        {
          id: 'ad_slot_between_content',
          name: 'Between Content Ad',
          location: 'between_content',
          code: '',
          enabled: false,
          desktop: true,
          tablet: true,
          mobile: true,
          order: 4,
          previewNote: 'Prominent ad placement between contestants and leaderboard'
        },
        {
          id: 'ad_slot_footer',
          name: 'Footer Ad',
          location: 'footer',
          code: '',
          enabled: false,
          desktop: true,
          tablet: true,
          mobile: true,
          order: 5,
          previewNote: 'Adsterra 728x90, 300x250, or responsive footer ad unit'
        },
        {
          id: 'ad_slot_custom',
          name: 'Custom Ad',
          location: 'custom',
          code: '',
          enabled: false,
          desktop: true,
          tablet: true,
          mobile: true,
          order: 6,
          previewNote: 'Configurable custom Adsterra ad slot for flexible placement'
        }
      ],
      footerContent: {
        copyright: '© 2026 StarHouse Entertainment Network. All rights reserved.',
        contactEmail: 'support@starvoter.tv',
        contactPhone: '+1 (800) 555-STAR',
        address: 'StarHouse Media Studios, Stage 4B, Film City',
        description: 'Star House is the official voting and interactive fan platform for the Star House reality television broadcast.',
        socialLinks: {
          twitter: 'https://twitter.com',
          instagram: 'https://instagram.com',
          youtube: 'https://youtube.com',
          facebook: 'https://facebook.com'
        }
      },
      aboutContent: {
        showDescription: 'Star House is the nation’s most watched 24/7 reality entertainment phenomenon where celebrity contestants are locked inside a purpose-built smart arena under full camera surveillance with zero outside contact. Every week, housemates face nominations and the public holds the absolute power to decide who stays and who gets evicted.',
        votingRules: [
          'Voting is 100% free and open directly to the public.',
          'One visitor / account = exactly one official vote per round.',
          'Votes are recorded and verified directly on secure audit servers.',
          'Voting lines close promptly at the broadcast countdown deadline.',
          'Nominated contestants are eligible for public vote counts.'
        ],
        votingInstructions: [
          'Browse the contestants list on the homepage or contestants directory.',
          'Click the "VOTE NOW" button on your preferred housemate’s card.',
          'Confirm your choice in the vote confirmation dialog.',
          'Your vote is tallied instantly and your browser locks into verified state.'
        ],
        terms: 'All votes cast are final. Automated script manipulation is disqualified.',
        privacyPolicy: 'Visitor IPs are cryptographically hashed to ensure integrity and privacy.'
      }
    },
    auditLogs: [],
    adminLogs: [
      {
        id: 'log_seed_01',
        action: 'System Initialized',
        admin: 'System',
        details: 'Reality Show Voting Engine & Admin Control Room initialized',
        timestamp: new Date(Date.now() - 10 * 86400000).toISOString()
      }
    ]
  };
}

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(`${password}_starhouse_user_salt`).digest('hex');
}

// Seed historical votes for realistic charts
function seedHistoricalVotes(database: DatabaseSchema) {
  if (database.votes.length > 0) return;

  const now = Date.now();
  const sampleIps = ['192.168.1.10', '10.0.0.5', '172.16.0.4', '203.0.113.19', '198.51.100.42'];
  const activeNominees = database.contestants.filter(c => c.status !== 'evicted');

  for (let i = 0; i < 400; i++) {
    const randomHoursAgo = Math.random() * 144; // up to 6 days
    const voteTime = new Date(now - randomHoursAgo * 3600000).toISOString();
    const contestant = activeNominees[Math.floor(Math.random() * activeNominees.length)];
    const ip = sampleIps[i % sampleIps.length];

    database.votes.push({
      id: `vt_seed_${i}_${Math.random().toString(36).substring(2, 6)}`,
      contestantId: contestant.id,
      contestantName: contestant.name,
      contestantNumber: contestant.contestantNumber,
      timestamp: voteTime,
      seasonId: 'season_09',
      status: 'valid',
      clientIp: ip.replace(/\.\d+$/, '.xxx')
    });
  }
}

function loadDatabase(): DatabaseSchema {
  if (!fs.existsSync(DB_FILE)) {
    const initialData = getDefaultSeedData();
    seedHistoricalVotes(initialData);
    saveDatabase(initialData);
    return initialData;
  }

  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    const defaults = getDefaultSeedData();

    if (!parsed.users) parsed.users = defaults.users;
    if (!parsed.voters) parsed.voters = [];
    if (!parsed.pages) parsed.pages = defaults.pages;
    if (!parsed.media || parsed.media.length === 0) parsed.media = defaults.media;
    if (!parsed.themes || parsed.themes.length < PREDEFINED_THEMES.length) {
      const existingCustom = (parsed.themes || []).filter((t: any) => t.isCustom);
      const activeId = parsed.siteSettings?.theme?.activeThemeId || (parsed.themes && parsed.themes.find((t: any) => t.isActive)?.id) || PREDEFINED_THEMES[0].id;
      const predefinedThemesList = PREDEFINED_THEMES.map((p) =>
        convertPaletteToCustomTheme(p, p.id === activeId)
      );
      parsed.themes = [...predefinedThemesList, ...existingCustom];
    }
    if (!parsed.adminLogs) parsed.adminLogs = defaults.adminLogs;
    if (!parsed.siteSettings) parsed.siteSettings = defaults.siteSettings;
    if (!parsed.siteSettings.branding) parsed.siteSettings.branding = defaults.siteSettings.branding;
    if (!parsed.siteSettings.theme) parsed.siteSettings.theme = defaults.siteSettings.theme;
    if (!parsed.siteSettings.theme.backgrounds) parsed.siteSettings.theme.backgrounds = defaults.siteSettings.theme.backgrounds;
    if (!parsed.siteSettings.statsConfig) parsed.siteSettings.statsConfig = defaults.siteSettings.statsConfig;
    if (!parsed.siteSettings.globalContent) parsed.siteSettings.globalContent = defaults.siteSettings.globalContent;
    if (!parsed.siteSettings.adsConfig) parsed.siteSettings.adsConfig = defaults.siteSettings.adsConfig;
    if (!parsed.siteSettings.adSlots || !Array.isArray(parsed.siteSettings.adSlots) || parsed.siteSettings.adSlots.length === 0) {
      parsed.siteSettings.adSlots = defaults.siteSettings.adSlots;
    } else {
      // Ensure all 6 standard slots exist if user hasn't added them yet
      const existingIds = new Set(parsed.siteSettings.adSlots.map((s: any) => s.id));
      (defaults.siteSettings.adSlots || []).forEach((defSlot: any) => {
        if (!existingIds.has(defSlot.id)) {
          parsed.siteSettings.adSlots.push(defSlot);
        }
      });
    }
    if (!parsed.siteSettings.uiSettings) parsed.siteSettings.uiSettings = defaults.siteSettings.uiSettings;
    if (!parsed.siteSettings.navigationItems) parsed.siteSettings.navigationItems = defaults.siteSettings.navigationItems;
    if (!parsed.siteSettings.homepageSections) parsed.siteSettings.homepageSections = defaults.siteSettings.homepageSections;
    if (!parsed.votingSettings) parsed.votingSettings = defaults.votingSettings;

    return parsed;
  } catch (err) {
    console.error('Error reading db.json, generating fallback', err);
    const initialData = getDefaultSeedData();
    seedHistoricalVotes(initialData);
    return initialData;
  }
}

function saveDatabase(data: DatabaseSchema) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving db.json:', err);
  }
}

let db = loadDatabase();

// Admin Authentication Config (Read securely from environment variables)
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'CHANGE_THIS_PASSWORD';

// In-memory active tokens
const activeAdminTokens = new Set<string>();
const activeUserTokens = new Map<string, string>(); // token -> userId

// Rate limiting in-memory map: IP -> timestamp of last vote
const lastVoteByIp = new Map<string, number>();

// Server-Sent Events clients manager
type SSEClient = { id: string; res: Response };
let sseClients: SSEClient[] = [];

function broadcastStateUpdate() {
  const payload = getPublicState();
  const message = `data: ${JSON.stringify(payload)}\n\n`;
  sseClients.forEach(client => {
    try {
      client.res.write(message);
    } catch (e) {
      // client disconnected
    }
  });
}

function getProcessedContestants() {
  const total = db.contestants.reduce((sum, c) => sum + (c.voteCount || 0), 0);
  const sorted = [...db.contestants].sort((a, b) => {
    if (a.status === 'evicted' && b.status !== 'evicted') return 1;
    if (b.status === 'evicted' && a.status !== 'evicted') return -1;
    return (b.voteCount || 0) - (a.voteCount || 0);
  });

  return sorted.map((c, index) => {
    const percentage = total > 0 ? Number(((c.voteCount / total) * 100).toFixed(1)) : 0;
    return {
      ...c,
      rank: index + 1,
      percentage
    };
  });
}

function getPublicState() {
  const processedContestants = getProcessedContestants();
  const totalVotes = processedContestants.reduce((sum, c) => sum + (c.voteCount || 0), 0);
  const totalUsers = db.users ? db.users.length : 0;

  return {
    contestants: processedContestants,
    votingSettings: db.votingSettings,
    banners: (db.banners || [])
      .filter(b => b.isActive !== false && (b.status === undefined || b.status === 'active'))
      .sort((a, b) => (a.order || a.displayOrder || 0) - (b.order || b.displayOrder || 0)),
    siteSettings: db.siteSettings,
    totalVotes,
    totalUsers,
    lastUpdated: new Date().toISOString()
  };
}

// Log admin action helper
function logAdminAction(action: string, admin: string, details: string) {
  const newLog = {
    id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    action,
    admin,
    details,
    timestamp: new Date().toISOString()
  };
  db.adminLogs.unshift(newLog);
  if (db.adminLogs.length > 300) db.adminLogs.pop();
  saveDatabase(db);
}

// Admin Auth Middleware
interface AdminRequest extends Request {
  adminUser?: string;
}

function adminAuthMiddleware(req: AdminRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Admin authorization token required.' });
  }

  const token = authHeader.split(' ')[1];

  // Check 1: Active token in activeAdminTokens
  if (activeAdminTokens.has(token)) {
    // Determine if it was tied to a specific user or master admin
    const userId = activeUserTokens.get(token);
    if (userId) {
      const user = db.users.find(u => u.id === userId && u.isActive);
      if (user && user.role === 'admin') {
        req.adminUser = user.fullName || user.email;
        return next();
      }
    }
    req.adminUser = ADMIN_USERNAME;
    return next();
  }

  // Check 2: Active token in activeUserTokens where user has role === 'admin'
  const userId = activeUserTokens.get(token);
  if (userId) {
    const user = db.users.find(u => u.id === userId && u.isActive);
    if (user && user.role === 'admin') {
      req.adminUser = user.fullName || user.email;
      return next();
    }
  }

  return res.status(401).json({ error: 'Invalid or expired admin session. Please login again.' });
}

// User Auth Middleware
interface UserRequest extends Request {
  userId?: string;
  userEmail?: string;
}

function userAuthMiddleware(req: UserRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'User authorization token required.' });
  }

  const token = authHeader.split(' ')[1];
  const userId = activeUserTokens.get(token);
  if (!userId) {
    return res.status(401).json({ error: 'Invalid or expired user session.' });
  }

  const user = db.users.find(u => u.id === userId && u.isActive);
  if (!user) {
    return res.status(401).json({ error: 'User account disabled or not found.' });
  }

  req.userId = user.id;
  req.userEmail = user.email;
  next();
}

// ==========================================
// 1. PUBLIC STATE & EVENTS API
// ==========================================

// GET /api/state
app.get('/api/state', (req: Request, res: Response) => {
  res.json(getPublicState());
});

// GET /api/events - Real-time SSE stream
app.get('/api/events', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const clientId = `client_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const newClient: SSEClient = { id: clientId, res };
  sseClients.push(newClient);

  res.write(`data: ${JSON.stringify(getPublicState())}\n\n`);

  req.on('close', () => {
    sseClients = sseClients.filter(c => c.id !== clientId);
  });
});

// GET /api/pages/:slug - Public page content
app.get('/api/pages/:slug', (req: Request, res: Response) => {
  const { slug } = req.params;
  const page = db.pages?.[slug];
  if (!page) {
    return res.status(404).json({ error: 'Page not found' });
  }
  res.json({ page });
});

// GET /api/voter/session - Voter session check (Strict One-Vote Verification)
app.get('/api/voter/session', (req: Request, res: Response) => {
  const incomingToken = (req.headers['x-voter-token'] as string) || (req.query.voterToken as string);
  const userAuthHeader = req.headers.authorization;
  let loggedInUserId: string | undefined;

  if (userAuthHeader && userAuthHeader.startsWith('Bearer ')) {
    const userToken = userAuthHeader.split(' ')[1];
    loggedInUserId = activeUserTokens.get(userToken);
  }

  const clientIp = req.headers['x-forwarded-for']?.toString().split(',')[0].trim() || req.ip || '127.0.0.1';
  const ipHash = crypto.createHash('sha256').update(`${clientIp}_starhouse_salt`).digest('hex').substring(0, 16);

  if (loggedInUserId) {
    const loggedInUser = db.users.find(u => u.id === loggedInUserId);
    if (loggedInUser && loggedInUser.votedContestantId) {
      return res.json({
        authenticated: true,
        user: {
          id: loggedInUser.id,
          fullName: loggedInUser.fullName,
          email: loggedInUser.email,
          votedContestantId: loggedInUser.votedContestantId,
          votedContestantName: loggedInUser.votedContestantName,
          votedAt: loggedInUser.votedAt,
          voteId: loggedInUser.voteId
        },
        hasVoted: true,
        votedContestantId: loggedInUser.votedContestantId,
        votedContestantName: loggedInUser.votedContestantName,
        voteId: loggedInUser.voteId,
        votedAt: loggedInUser.votedAt
      });
    }

    const userVote = db.votes.find(v => v.userId === loggedInUserId);
    if (userVote) {
      return res.json({
        authenticated: true,
        user: loggedInUser ? {
          id: loggedInUser.id,
          fullName: loggedInUser.fullName,
          email: loggedInUser.email
        } : undefined,
        hasVoted: true,
        votedContestantId: userVote.contestantId,
        votedContestantName: userVote.contestantName,
        voteId: userVote.id,
        votedAt: userVote.timestamp
      });
    }

    return res.json({
      authenticated: true,
      hasVoted: false,
      user: loggedInUser ? {
        id: loggedInUser.id,
        fullName: loggedInUser.fullName,
        email: loggedInUser.email
      } : undefined
    });
  }

  // Not authenticated
  res.json({
    authenticated: false,
    hasVoted: false
  });
});

// ==========================================
// 2. USER AUTHENTICATION (PUBLIC)
// ==========================================

// POST /api/user/signup - User registration
app.post('/api/user/signup', (req: Request, res: Response) => {
  const { fullName, email, password } = req.body;

  if (!fullName || !fullName.trim()) {
    return res.status(400).json({ error: 'Full Name is required.' });
  }
  if (!email || !email.trim()) {
    return res.status(400).json({ error: 'Valid email address is required.' });
  }
  if (!password || password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
  }

  const normalizedEmail = email ? email.trim().toLowerCase() : '';
  const existingUser = db.users.find(u => String(u.email || '').toLowerCase() === normalizedEmail);
  if (existingUser) {
    return res.status(409).json({ error: 'An account with this email already exists. Please login.' });
  }

  const newUser = {
    id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    fullName: fullName.trim(),
    email: normalizedEmail,
    passwordHash: hashPassword(password),
    avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(normalizedEmail)}`,
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
    isActive: true,
    role: 'user' as const
  };

  db.users.push(newUser);
  saveDatabase(db);

  // Generate session token
  const token = `usr_tok_${crypto.randomBytes(24).toString('hex')}`;
  activeUserTokens.set(token, newUser.id);

  res.status(201).json({
    success: true,
    message: 'Account created successfully!',
    token,
    user: {
      id: newUser.id,
      fullName: newUser.fullName,
      email: newUser.email,
      avatarUrl: newUser.avatarUrl,
      createdAt: newUser.createdAt,
      isActive: newUser.isActive,
      role: newUser.role
    }
  });
});

// POST /api/user/login - User login
app.post('/api/user/login', (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const normalizedInput = String(email || '').trim().toLowerCase();
  const user = db.users.find(u => String(u.email || '').toLowerCase() === normalizedInput || String(u.fullName || '').toLowerCase() === normalizedInput);

  if (!user || user.passwordHash !== hashPassword(password)) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  if (!user.isActive) {
    return res.status(403).json({ error: 'Your account has been deactivated. Please contact support.' });
  }

  user.lastLogin = new Date().toISOString();
  saveDatabase(db);

  const token = `usr_tok_${crypto.randomBytes(24).toString('hex')}`;
  activeUserTokens.set(token, user.id);

  if (user.role === 'admin') {
    activeAdminTokens.add(token);
  }

  res.json({
    success: true,
    message: `Welcome back, ${user.fullName}!`,
    token,
    adminToken: user.role === 'admin' ? token : undefined,
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
      isActive: user.isActive,
      role: user.role,
      votedContestantId: user.votedContestantId,
      votedContestantName: user.votedContestantName,
      votedAt: user.votedAt,
      voteId: user.voteId
    }
  });
});

// GET /api/user/profile - Logged-in user profile
app.get('/api/user/profile', userAuthMiddleware, (req: UserRequest, res: Response) => {
  const user = db.users.find(u => u.id === req.userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
      isActive: user.isActive,
      role: user.role,
      votedContestantId: user.votedContestantId,
      votedContestantName: user.votedContestantName,
      votedAt: user.votedAt,
      voteId: user.voteId
    }
  });
});

// POST /api/user/logout
app.post('/api/user/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    activeUserTokens.delete(token);
  }
  res.json({ success: true, message: 'Logged out successfully.' });
});

// POST /api/user/reset-password
app.post('/api/user/reset-password', (req: Request, res: Response) => {
  const { email, newPassword } = req.body;
  if (!email || !newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'Valid email and new password (min 6 chars) required.' });
  }

  const targetEmail = String(email || '').trim().toLowerCase();
  const user = db.users.find(u => String(u.email || '').toLowerCase() === targetEmail);
  if (!user) {
    return res.status(404).json({ error: 'No account registered with this email address.' });
  }

  user.passwordHash = hashPassword(newPassword);
  saveDatabase(db);

  res.json({ success: true, message: 'Password reset successfully. You can now log in.' });
});

// ==========================================
// 3. VOTING ENGINE (ONE VOTE PER VISITOR/USER)
// ==========================================

// POST /api/votes/submit
app.post('/api/votes/submit', (req: Request, res: Response) => {
  const { contestantId, voterToken } = req.body;

  if (!contestantId) {
    return res.status(400).json({ error: 'Contestant selection is required.' });
  }

  // 1. Check Voting Status
  const settings = db.votingSettings;
  if (!settings.isVotingActive) {
    return res.status(403).json({
      error: settings.votingClosedMessage || 'Official voting is currently closed.'
    });
  }

  // 2. Check Time Window
  const now = new Date();
  if (settings.startDate && settings.startTime) {
    const startDateTime = new Date(`${settings.startDate}T${settings.startTime}:00`);
    if (now < startDateTime) {
      return res.status(403).json({ error: 'Voting has not opened yet for this round.' });
    }
  }

  if (settings.endDate && settings.endTime) {
    const endDateTime = new Date(`${settings.endDate}T${settings.endTime}:00`);
    if (now > endDateTime) {
      return res.status(403).json({ error: 'Voting deadline has expired.' });
    }
  }

  // 3. User Authentication Check (LOGIN REQUIRED FOR VOTING)
  let loggedInUser: any = null;
  const userAuthHeader = req.headers.authorization;
  if (userAuthHeader && userAuthHeader.startsWith('Bearer ')) {
    const userToken = userAuthHeader.split(' ')[1];
    const uId = activeUserTokens.get(userToken);
    if (uId) {
      loggedInUser = db.users.find(u => u.id === uId);
    }
  }

  // Enforce mandatory authentication: anonymous voting disabled
  if (!loggedInUser) {
    return res.status(401).json({
      error: 'Authentication required to vote. Please log in or register.',
      requireLogin: true
    });
  }

  // 4. STRICT ONE-VOTE PER REGISTERED USER ENFORCEMENT
  const userHasAlreadyVoted = Boolean(
    loggedInUser.votedContestantId ||
    db.votes.some(v => v.userId === loggedInUser.id) ||
    db.voters.some(v => v.userId === loggedInUser.id)
  );

  if (userHasAlreadyVoted) {
    const existingVote = db.votes.find(v => v.userId === loggedInUser.id);
    const votedName = loggedInUser.votedContestantName || existingVote?.contestantName || 'your selected contestant';
    const votedId = loggedInUser.votedContestantId || existingVote?.contestantId;

    return res.status(400).json({
      error: 'You have already cast your vote.',
      alreadyVoted: true,
      votedContestantId: votedId,
      votedContestantName: votedName
    });
  }

  const clientIp = req.headers['x-forwarded-for']?.toString().split(',')[0].trim() || req.ip || '127.0.0.1';
  const ipHash = crypto.createHash('sha256').update(`${clientIp}_starhouse_salt`).digest('hex').substring(0, 16);
  const effectiveVoterToken = voterToken || req.headers['x-voter-token']?.toString() || `vtr_${crypto.randomBytes(12).toString('hex')}`;

  // 5. Rate Limit Cooldown per IP
  const cooldownMs = (settings.voteCooldownSeconds || 3) * 1000;
  const lastVoteTime = lastVoteByIp.get(clientIp);
  if (lastVoteTime && Date.now() - lastVoteTime < cooldownMs) {
    const remainingSecs = Math.ceil((cooldownMs - (Date.now() - lastVoteTime)) / 1000);
    return res.status(429).json({
      error: `Please wait ${remainingSecs}s before casting vote.`,
      cooldown: true
    });
  }

  // 6. Validate Contestant
  const contestant = db.contestants.find(c => c.id === contestantId);
  if (!contestant) {
    return res.status(404).json({ error: 'Selected contestant was not found.' });
  }
  if (contestant.status === 'evicted') {
    return res.status(400).json({ error: 'This contestant has been evicted and cannot receive further votes.' });
  }

  // Record Vote
  lastVoteByIp.set(clientIp, Date.now());

  const newVote = {
    id: `vt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    contestantId: contestant.id,
    contestantName: contestant.name,
    contestantNumber: contestant.contestantNumber,
    timestamp: new Date().toISOString(),
    seasonId: settings.seasonId || 'season_09',
    status: 'valid' as const,
    clientIp: clientIp.replace(/\.\d+$/, '.xxx'),
    userId: loggedInUser ? loggedInUser.id : undefined,
    userEmail: loggedInUser ? loggedInUser.email : undefined
  };

  db.voters.push({
    id: newVote.id,
    voterToken: effectiveVoterToken,
    ipHash,
    userId: loggedInUser ? loggedInUser.id : undefined,
    contestantId: contestant.id,
    contestantName: contestant.name,
    timestamp: newVote.timestamp
  });

  if (loggedInUser) {
    loggedInUser.votedContestantId = contestant.id;
    loggedInUser.votedContestantName = contestant.name;
    loggedInUser.votedAt = newVote.timestamp;
    loggedInUser.voteId = newVote.id;
  }

  db.votes.push(newVote);
  contestant.voteCount = (contestant.voteCount || 0) + 1;
  saveDatabase(db);

  broadcastStateUpdate();

  const processed = getProcessedContestants();
  const updatedContestant = processed.find(c => c.id === contestant.id);
  const totalVotes = processed.reduce((sum, c) => sum + (c.voteCount || 0), 0);

  res.status(201).json({
    success: true,
    message: `Vote Submitted Successfully! You voted for #${contestant.contestantNumber} ${contestant.name}.`,
    voteId: newVote.id,
    timestamp: newVote.timestamp,
    alreadyVoted: true,
    votedContestantId: contestant.id,
    contestant: updatedContestant,
    totalVotes
  });
});

// ==========================================
// 4. SEPARATE ADMIN AUTHENTICATION
// ==========================================

// POST /api/admin/login
app.post('/api/admin/login', (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Admin ID / Email and password are required.' });
  }

  const rawInput = String(username).trim();
  const normalizedInput = rawInput.toLowerCase();

  // 1. Check Master Executive Admin Credentials
  if (rawInput === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    const token = `adm_tok_${crypto.randomBytes(24).toString('hex')}`;
    activeAdminTokens.add(token);

    logAdminAction('Admin Login', ADMIN_USERNAME, 'Successful executive master login');

    return res.json({
      success: true,
      message: 'Welcome to the Executive Admin Control Room',
      token,
      admin: {
        username: ADMIN_USERNAME,
        role: 'admin',
        loginTime: new Date().toISOString()
      }
    });
  }

  // 2. Check Registered Users with role 'admin'
  const user = db.users.find(u =>
    (String(u.email || '').toLowerCase() === normalizedInput ||
     String(u.fullName || '').toLowerCase() === normalizedInput ||
     u.id === rawInput) &&
    u.role === 'admin'
  );

  if (user && user.passwordHash === hashPassword(password)) {
    if (!user.isActive) {
      return res.status(403).json({ error: 'This administrator account is currently deactivated.' });
    }

    user.lastLogin = new Date().toISOString();
    saveDatabase(db);

    const token = `adm_tok_${crypto.randomBytes(24).toString('hex')}`;
    activeAdminTokens.add(token);
    activeUserTokens.set(token, user.id);

    logAdminAction('Admin Login', user.fullName || user.email, `Administrator login: ${user.email}`);

    return res.json({
      success: true,
      message: `Welcome back, Administrator ${user.fullName}!`,
      token,
      admin: {
        username: user.fullName || user.email,
        role: 'admin',
        email: user.email,
        id: user.id,
        loginTime: new Date().toISOString()
      }
    });
  }

  res.status(401).json({ error: 'Invalid executive administrator credentials.' });
});

// GET /api/admin/verify
app.get('/api/admin/verify', adminAuthMiddleware, (req: AdminRequest, res: Response) => {
  res.json({
    authenticated: true,
    username: req.adminUser,
    role: 'admin'
  });
});

// POST /api/admin/logout
app.post('/api/admin/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    activeAdminTokens.delete(token);
  }
  logAdminAction('Admin Logout', 'Admin', 'Admin logged out successfully; session invalidated.');
  res.setHeader('Clear-Site-Data', '"cache", "cookies", "storage"');
  res.json({ success: true, message: 'Admin logged out successfully and session terminated.' });
});

// ==========================================
// 5. ADMIN METRICS & ANALYTICS
// ==========================================

// GET /api/admin/metrics
app.get('/api/admin/metrics', adminAuthMiddleware, (req: AdminRequest, res: Response) => {
  const totalContestants = db.contestants.length;
  const totalVotes = db.contestants.reduce((sum, c) => sum + (c.voteCount || 0), 0);
  const totalUsers = db.users ? db.users.length : 0;

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayVotes = db.votes.filter(v => new Date(v.timestamp) >= todayStart).length;

  const processed = getProcessedContestants();
  const topContestant = processed[0] || null;

  const recentVotes = [...db.votes]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 15);

  res.json({
    totalContestants,
    totalVotes,
    todayVotes,
    totalUsers,
    isVotingActive: db.votingSettings.isVotingActive,
    votingEndTime: `${db.votingSettings.endDate} ${db.votingSettings.endTime}`,
    topContestant,
    recentVotes,
    votingSettings: db.votingSettings
  });
});

// GET /api/admin/analytics
app.get('/api/admin/analytics', adminAuthMiddleware, (req: AdminRequest, res: Response) => {
  const processed = getProcessedContestants();
  const totalVotes = processed.reduce((sum, c) => sum + (c.voteCount || 0), 0);
  const totalUsers = db.users ? db.users.length : 0;

  const now = new Date();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const yesterdayStart = new Date(todayStart.getTime() - 86400000);
  const weekStart = new Date(now.getTime() - 7 * 86400000);
  const monthStart = new Date(now.getTime() - 30 * 86400000);

  const votesToday = db.votes.filter(v => new Date(v.timestamp) >= todayStart).length;
  const votesYesterday = db.votes.filter(v => {
    const t = new Date(v.timestamp);
    return t >= yesterdayStart && t < todayStart;
  }).length;
  const votesThisWeek = db.votes.filter(v => new Date(v.timestamp) >= weekStart).length;
  const votesThisMonth = db.votes.filter(v => new Date(v.timestamp) >= monthStart).length;

  // Hourly Activity (past 24h)
  const hourlyMap = new Map<string, number>();
  for (let i = 23; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 3600000);
    const label = `${d.getHours().toString().padStart(2, '0')}:00`;
    hourlyMap.set(label, 0);
  }

  db.votes.forEach(v => {
    const vt = new Date(v.timestamp);
    if (now.getTime() - vt.getTime() <= 24 * 3600000) {
      const label = `${vt.getHours().toString().padStart(2, '0')}:00`;
      if (hourlyMap.has(label)) {
        hourlyMap.set(label, (hourlyMap.get(label) || 0) + 1);
      }
    }
  });

  const hourlyActivity = Array.from(hourlyMap.entries()).map(([hour, count]) => ({ hour, count }));

  // Daily Activity (past 7 days)
  const dailyMap = new Map<string, number>();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 86400000);
    const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    dailyMap.set(label, 0);
  }

  db.votes.forEach(v => {
    const vt = new Date(v.timestamp);
    const label = vt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (dailyMap.has(label)) {
      dailyMap.set(label, (dailyMap.get(label) || 0) + 1);
    }
  });

  const dailyActivity = Array.from(dailyMap.entries()).map(([date, count]) => ({ date, count }));

  res.json({
    totalVotes,
    votesToday,
    votesYesterday,
    votesThisWeek,
    votesThisMonth,
    totalUsers,
    contestantStats: processed.map(c => ({
      contestantId: c.id,
      name: c.name,
      photoUrl: c.photoUrl,
      voteCount: c.voteCount,
      percentage: c.percentage || 0,
      rank: c.rank || 1,
      status: c.status
    })),
    hourlyActivity,
    dailyActivity
  });
});

// ==========================================
// 6. ADMIN USER MANAGEMENT
// ==========================================

// GET /api/admin/users
app.get('/api/admin/users', adminAuthMiddleware, (req: AdminRequest, res: Response) => {
  const { search } = req.query;
  let list = db.users || [];

  if (search) {
    const q = String(search).trim().toLowerCase();
    list = list.filter(u => String(u.fullName || '').toLowerCase().includes(q) || String(u.email || '').toLowerCase().includes(q));
  }

  const safeUsers = list.map(u => ({
    id: u.id,
    fullName: u.fullName,
    email: u.email,
    avatarUrl: u.avatarUrl,
    createdAt: u.createdAt,
    lastLogin: u.lastLogin,
    isActive: u.isActive,
    role: u.role,
    votedContestantId: u.votedContestantId,
    votedContestantName: u.votedContestantName,
    votedAt: u.votedAt,
    voteId: u.voteId
  }));

  res.json({ users: safeUsers });
});

// PUT /api/admin/users/:id/role - Change user role (USER <-> ADMIN)
app.put('/api/admin/users/:id/role', adminAuthMiddleware, (req: AdminRequest, res: Response) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!role || (role !== 'user' && role !== 'admin' && role !== 'moderator')) {
    return res.status(400).json({ error: 'Valid role is required (user, admin).' });
  }

  const user = db.users.find(u => u.id === id);
  if (!user) {
    return res.status(404).json({ error: 'User account not found.' });
  }

  // Safety Check: Prevent demoting the last remaining active admin
  if (user.role === 'admin' && role !== 'admin') {
    const remainingAdminUsers = db.users.filter(u => u.role === 'admin' && u.isActive && u.id !== id).length;
    // Check if there are no other active admin users
    if (remainingAdminUsers === 0 && ADMIN_USERNAME !== 'admin') {
      return res.status(400).json({ error: 'At least one administrator account must remain active.' });
    }
  }

  const oldRole = user.role || 'user';
  user.role = role as any;
  saveDatabase(db);
  broadcastStateUpdate();

  logAdminAction(
    'User Role Changed',
    req.adminUser || 'Admin',
    `Role changed for user ${user.email} (${user.fullName}) from ${String(oldRole).toUpperCase()} to ${String(role).toUpperCase()}`
  );

  res.json({
    success: true,
    message: `Role updated successfully to ${String(role).toUpperCase()}`,
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
      isActive: user.isActive,
      role: user.role,
      votedContestantId: user.votedContestantId,
      votedContestantName: user.votedContestantName,
      votedAt: user.votedAt,
      voteId: user.voteId
    }
  });
});

// PUT /api/admin/users/:id/status
app.put('/api/admin/users/:id/status', adminAuthMiddleware, (req: AdminRequest, res: Response) => {
  const { id } = req.params;
  const { isActive } = req.body;
  const user = db.users.find(u => u.id === id);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Safety Check: Prevent deactivating the last active admin
  if (user.role === 'admin' && !isActive) {
    const remainingActiveAdmins = db.users.filter(u => u.role === 'admin' && u.isActive && u.id !== id).length;
    if (remainingActiveAdmins === 0 && ADMIN_USERNAME !== 'admin') {
      return res.status(400).json({ error: 'At least one administrator account must remain active.' });
    }
  }

  user.isActive = Boolean(isActive);
  saveDatabase(db);

  logAdminAction(
    'User Status Changed',
    req.adminUser || 'Admin',
    `User ${user.email} status changed to ${user.isActive ? 'Active' : 'Disabled'}`
  );

  res.json({ message: `User ${user.email} is now ${user.isActive ? 'Active' : 'Disabled'}`, user });
});

// DELETE /api/admin/users/:id
app.delete('/api/admin/users/:id', adminAuthMiddleware, (req: AdminRequest, res: Response) => {
  const { id } = req.params;

  const targetUser = db.users.find(u => u.id === id);
  if (!targetUser) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Safety Check: Prevent deleting the last active admin
  if (targetUser.role === 'admin') {
    const remainingActiveAdmins = db.users.filter(u => u.role === 'admin' && u.isActive && u.id !== id).length;
    if (remainingActiveAdmins === 0 && ADMIN_USERNAME !== 'admin') {
      return res.status(400).json({ error: 'At least one administrator account must remain active.' });
    }
  }

  const index = db.users.findIndex(u => u.id === id);
  const removed = db.users.splice(index, 1)[0];
  saveDatabase(db);

  logAdminAction('User Deleted', req.adminUser || 'Admin', `Deleted user ${removed.email}`);

  res.json({ message: `User ${removed.email} deleted successfully.` });
});

// ==========================================
// 7. ADMIN CONTESTANTS CRUD
// ==========================================

app.post('/api/admin/contestants', adminAuthMiddleware, (req: AdminRequest, res: Response) => {
  const { name, contestantNumber, photoUrl, description, age, occupation, city, status, tagline, order } = req.body;

  if (!name || !contestantNumber) {
    return res.status(400).json({ error: 'Contestant name and number are required.' });
  }

  const newContestant = {
    id: `cnt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    name: name.trim(),
    contestantNumber: contestantNumber.trim(),
    photoUrl: photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
    description: description || '',
    age: Number(age) || 25,
    occupation: occupation || 'Contestant',
    city: city || 'City',
    voteCount: 0,
    status: (status as any) || 'nominated',
    tagline: tagline || '',
    order: Number(order) || db.contestants.length + 1,
    createdAt: new Date().toISOString()
  };

  db.contestants.push(newContestant);
  saveDatabase(db);
  broadcastStateUpdate();

  logAdminAction('Contestant Added', req.adminUser!, `Added #${newContestant.contestantNumber} ${newContestant.name}`);

  res.status(201).json({ message: 'Contestant added successfully!', contestant: newContestant });
});

app.put('/api/admin/contestants/:id', adminAuthMiddleware, (req: AdminRequest, res: Response) => {
  const { id } = req.params;
  const contestant = db.contestants.find(c => c.id === id);

  if (!contestant) {
    return res.status(404).json({ error: 'Contestant not found.' });
  }

  const { name, contestantNumber, photoUrl, description, age, occupation, city, status, tagline, order } = req.body;

  if (name !== undefined) contestant.name = name.trim();
  if (contestantNumber !== undefined) contestant.contestantNumber = contestantNumber.trim();
  if (photoUrl !== undefined) contestant.photoUrl = photoUrl;
  if (description !== undefined) contestant.description = description;
  if (age !== undefined) contestant.age = Number(age);
  if (occupation !== undefined) contestant.occupation = occupation;
  if (city !== undefined) contestant.city = city;
  if (status !== undefined) contestant.status = status;
  if (tagline !== undefined) contestant.tagline = tagline;
  if (order !== undefined) contestant.order = Number(order);

  saveDatabase(db);
  broadcastStateUpdate();

  logAdminAction('Contestant Updated', req.adminUser!, `Updated #${contestant.contestantNumber} ${contestant.name}`);

  res.json({ message: 'Contestant updated successfully!', contestant });
});

app.delete('/api/admin/contestants/:id', adminAuthMiddleware, (req: AdminRequest, res: Response) => {
  const { id } = req.params;
  const index = db.contestants.findIndex(c => c.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Contestant not found.' });
  }

  const removed = db.contestants.splice(index, 1)[0];
  saveDatabase(db);
  broadcastStateUpdate();

  logAdminAction('Contestant Deleted', req.adminUser!, `Deleted #${removed.contestantNumber} ${removed.name}`);

  res.json({ message: `Contestant ${removed.name} deleted.` });
});

// Manual Vote Count Adjustment (Audited)
app.post('/api/admin/contestants/:id/adjust-votes', adminAuthMiddleware, (req: AdminRequest, res: Response) => {
  const { id } = req.params;
  const { newCount, reason, actionType } = req.body;

  const contestant = db.contestants.find(c => c.id === id);
  if (!contestant) {
    return res.status(404).json({ error: 'Contestant not found.' });
  }

  if (typeof newCount !== 'number' || newCount < 0) {
    return res.status(400).json({ error: 'Valid positive number required for vote adjustment.' });
  }

  if (!reason || !reason.trim()) {
    return res.status(400).json({ error: 'A mandatory audit reason is required for manual vote adjustments.' });
  }

  const prevCount = contestant.voteCount;
  contestant.voteCount = newCount;
  const diff = newCount - prevCount;
  const resolvedActionType = actionType || (diff > 0 ? 'ADD' : diff < 0 ? 'REMOVE' : 'EDIT');
  const now = new Date();

  const auditLog = {
    id: `audit_${Date.now()}`,
    contestantId: contestant.id,
    contestantName: contestant.name,
    previousCount: prevCount,
    newCount: newCount,
    difference: diff,
    actionType: resolvedActionType as 'EDIT' | 'ADD' | 'REMOVE',
    reason: reason.trim(),
    adjustedBy: req.adminUser!,
    timestamp: now.toISOString(),
    date: now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    time: now.toLocaleTimeString()
  };

  db.auditLogs.unshift(auditLog);
  saveDatabase(db);
  broadcastStateUpdate();

  logAdminAction(
    'Vote Count Adjusted',
    req.adminUser!,
    `Adjusted votes for ${contestant.name} from ${prevCount} to ${newCount} (${diff >= 0 ? '+' : ''}${diff}). Reason: ${reason.trim()}`
  );

  res.json({
    message: `Vote count for ${contestant.name} adjusted from ${prevCount} to ${newCount}.`,
    auditLog,
    contestant
  });
});

// Contestant Specific Vote History
app.get('/api/admin/contestants/:id/vote-history', adminAuthMiddleware, (req: AdminRequest, res: Response) => {
  const { id } = req.params;
  const contestant = db.contestants.find(c => c.id === id);
  if (!contestant) {
    return res.status(404).json({ error: 'Contestant not found.' });
  }

  const history = (db.auditLogs || [])
    .filter(log => log.contestantId === id)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  res.json({
    contestant,
    history
  });
});

// Refresh & Sync Vote Counts (Recalculate totals, rankings, and percentages)
app.post('/api/admin/votes/refresh-sync', adminAuthMiddleware, (req: AdminRequest, res: Response) => {
  const processed = getProcessedContestants();
  const totalVotes = processed.reduce((sum, c) => sum + (c.voteCount || 0), 0);
  
  saveDatabase(db);
  broadcastStateUpdate();

  logAdminAction('Votes Synchronized', req.adminUser!, `Recalculated rankings and percentages for ${processed.length} contestants across ${totalVotes} certified votes.`);

  res.json({
    message: 'Vote counts, rankings, and share percentages synchronized successfully!',
    contestants: processed,
    totalVotes,
    lastUpdated: new Date().toISOString()
  });
});

// Duplicate Contestant
app.post('/api/admin/contestants/:id/duplicate', adminAuthMiddleware, (req: AdminRequest, res: Response) => {
  const { id } = req.params;
  const original = db.contestants.find(c => c.id === id);

  if (!original) {
    return res.status(404).json({ error: 'Contestant not found.' });
  }

  const nextNumber = String(db.contestants.length + 1).padStart(2, '0');
  const duplicated = {
    ...original,
    id: `cnt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    name: `${original.name} (Copy)`,
    contestantNumber: nextNumber,
    voteCount: 0,
    order: db.contestants.length + 1,
    createdAt: new Date().toISOString()
  };

  db.contestants.push(duplicated);
  saveDatabase(db);
  broadcastStateUpdate();

  logAdminAction('Contestant Duplicated', req.adminUser!, `Duplicated contestant #${original.contestantNumber} ${original.name} as #${duplicated.contestantNumber} ${duplicated.name}`);

  res.status(201).json({ message: `Contestant "${original.name}" duplicated successfully!`, contestant: duplicated });
});

// Reorder Contestants
app.put('/api/admin/contestants/reorder', adminAuthMiddleware, (req: AdminRequest, res: Response) => {
  const { ids } = req.body;
  if (!Array.isArray(ids)) {
    return res.status(400).json({ error: 'Array of contestant IDs is required.' });
  }

  const idMap = new Map(ids.map((id, index) => [id, index + 1]));
  db.contestants.forEach(c => {
    if (idMap.has(c.id)) {
      c.order = idMap.get(c.id)!;
    }
  });

  db.contestants.sort((a, b) => a.order - b.order);
  saveDatabase(db);
  broadcastStateUpdate();

  logAdminAction('Contestants Reordered', req.adminUser!, 'Updated custom ordering of contestant roster');

  res.json({ message: 'Contestants reordered successfully!', contestants: db.contestants });
});

// ==========================================
// 8. ADMIN BANNERS CRUD
// ==========================================

function isValidDestinationUrl(url?: string): boolean {
  if (!url || !url.trim()) return true; // Optional URL is valid
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

  // Allow http://, https://, internal section anchors (#), or relative paths (/)
  if (
    lower.startsWith('http://') ||
    lower.startsWith('https://') ||
    trimmed.startsWith('#') ||
    trimmed.startsWith('/')
  ) {
    return true;
  }

  return false;
}

// GET ALL BANNERS (Admin - both active and inactive)
app.get('/api/admin/banners', adminAuthMiddleware, (req: AdminRequest, res: Response) => {
  const allBanners = (db.banners || []).slice().sort((a, b) => (a.order || 0) - (b.order || 0));
  res.json({ banners: allBanners });
});

// CREATE BANNER
app.post('/api/admin/banners', adminAuthMiddleware, (req: AdminRequest, res: Response) => {
  const {
    name,
    title,
    subtitle,
    desktopImageUrl,
    tabletImageUrl,
    mobileImageUrl,
    ctaText,
    ctaLink,
    destinationUrl,
    openInNewTab,
    openTarget,
    isActive,
    status,
    order,
    displayOrder
  } = req.body;

  if (!desktopImageUrl || !desktopImageUrl.trim()) {
    return res.status(400).json({ error: 'Desktop banner image is required.' });
  }

  const effectiveUrl = (destinationUrl !== undefined ? destinationUrl : ctaLink || '').trim();
  if (effectiveUrl && !isValidDestinationUrl(effectiveUrl)) {
    return res.status(400).json({ error: 'Please enter a valid URL. Only http://, https://, internal # or / paths are supported.' });
  }

  const targetOrder = Number(displayOrder !== undefined ? displayOrder : order) || (db.banners.length + 1);
  const activeStatus = status !== undefined ? status === 'active' : (isActive !== undefined ? Boolean(isActive) : true);
  const willOpenNewTab = openTarget !== undefined ? openTarget === '_blank' : Boolean(openInNewTab);

  const bannerName = (name || title || `Banner ${String(targetOrder).padStart(2, '0')}`).trim();

  const newBanner = {
    id: `bnr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    name: bannerName,
    title: bannerName,
    subtitle: subtitle || '',
    desktopImageUrl: desktopImageUrl.trim(),
    tabletImageUrl: (tabletImageUrl || desktopImageUrl).trim(),
    mobileImageUrl: (mobileImageUrl || '').trim(),
    ctaText: ctaText || '',
    ctaLink: effectiveUrl,
    destinationUrl: effectiveUrl,
    openInNewTab: willOpenNewTab,
    openTarget: willOpenNewTab ? '_blank' as const : '_self' as const,
    isActive: activeStatus,
    status: activeStatus ? 'active' as const : 'inactive' as const,
    order: targetOrder,
    displayOrder: targetOrder,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.banners.push(newBanner);
  saveDatabase(db);
  broadcastStateUpdate();

  logAdminAction('Banner Added', req.adminUser!, `Added banner "${newBanner.name}" (Order #${newBanner.order})`);

  res.status(201).json({ message: 'Banner slide created successfully!', banner: newBanner });
});

// REORDER BANNERS BATCH
app.put('/api/admin/banners/reorder', adminAuthMiddleware, (req: AdminRequest, res: Response) => {
  const { bannerIds } = req.body; // Array of banner IDs in desired order
  if (!Array.isArray(bannerIds)) {
    return res.status(400).json({ error: 'bannerIds array is required for reordering.' });
  }

  bannerIds.forEach((id: string, idx: number) => {
    const banner = db.banners.find(b => b.id === id);
    if (banner) {
      banner.order = idx + 1;
      banner.displayOrder = idx + 1;
      banner.updatedAt = new Date().toISOString();
    }
  });

  saveDatabase(db);
  broadcastStateUpdate();

  logAdminAction('Banners Reordered', req.adminUser!, `Reordered ${bannerIds.length} banners`);

  const updatedBanners = db.banners.slice().sort((a, b) => a.order - b.order);
  res.json({ message: 'Banners reordered successfully!', banners: updatedBanners });
});

// UPDATE BANNER
app.put('/api/admin/banners/:id', adminAuthMiddleware, (req: AdminRequest, res: Response) => {
  const { id } = req.params;
  const banner = db.banners.find(b => b.id === id);

  if (!banner) {
    return res.status(404).json({ error: 'Banner not found.' });
  }

  const {
    name,
    title,
    subtitle,
    desktopImageUrl,
    tabletImageUrl,
    mobileImageUrl,
    ctaText,
    ctaLink,
    destinationUrl,
    openInNewTab,
    openTarget,
    isActive,
    status,
    order,
    displayOrder
  } = req.body;

  if (desktopImageUrl !== undefined && !desktopImageUrl.trim()) {
    return res.status(400).json({ error: 'Desktop banner image cannot be empty.' });
  }

  const newUrl = destinationUrl !== undefined ? destinationUrl : ctaLink;
  if (newUrl !== undefined && newUrl.trim()) {
    if (!isValidDestinationUrl(newUrl.trim())) {
      return res.status(400).json({ error: 'Please enter a valid URL. Only http://, https://, internal # or / paths are supported.' });
    }
  }

  if (name !== undefined) {
    banner.name = name.trim();
    banner.title = name.trim();
  } else if (title !== undefined) {
    banner.name = title.trim();
    banner.title = title.trim();
  }

  if (subtitle !== undefined) banner.subtitle = subtitle;
  if (desktopImageUrl !== undefined) banner.desktopImageUrl = desktopImageUrl.trim();
  if (tabletImageUrl !== undefined) banner.tabletImageUrl = tabletImageUrl.trim();
  if (mobileImageUrl !== undefined) banner.mobileImageUrl = mobileImageUrl.trim();
  if (ctaText !== undefined) banner.ctaText = ctaText;

  if (newUrl !== undefined) {
    banner.destinationUrl = newUrl.trim();
    banner.ctaLink = newUrl.trim();
  }

  if (openTarget !== undefined) {
    banner.openTarget = openTarget;
    banner.openInNewTab = openTarget === '_blank';
  } else if (openInNewTab !== undefined) {
    banner.openInNewTab = Boolean(openInNewTab);
    banner.openTarget = banner.openInNewTab ? '_blank' : '_self';
  }

  if (status !== undefined) {
    banner.status = status;
    banner.isActive = status === 'active';
  } else if (isActive !== undefined) {
    banner.isActive = Boolean(isActive);
    banner.status = banner.isActive ? 'active' : 'inactive';
  }

  if (displayOrder !== undefined) {
    banner.order = Number(displayOrder);
    banner.displayOrder = Number(displayOrder);
  } else if (order !== undefined) {
    banner.order = Number(order);
    banner.displayOrder = Number(order);
  }

  banner.updatedAt = new Date().toISOString();

  saveDatabase(db);
  broadcastStateUpdate();

  logAdminAction('Banner Updated', req.adminUser!, `Updated banner "${banner.name || banner.title || banner.id}"`);

  res.json({ message: 'Banner updated successfully!', banner });
});

// TOGGLE BANNER STATUS
app.put('/api/admin/banners/:id/toggle', adminAuthMiddleware, (req: AdminRequest, res: Response) => {
  const { id } = req.params;
  const banner = db.banners.find(b => b.id === id);

  if (!banner) {
    return res.status(404).json({ error: 'Banner not found.' });
  }

  banner.isActive = !banner.isActive;
  banner.status = banner.isActive ? 'active' : 'inactive';
  banner.updatedAt = new Date().toISOString();

  saveDatabase(db);
  broadcastStateUpdate();

  logAdminAction('Banner Toggled', req.adminUser!, `Banner "${banner.name || banner.title}" set to ${banner.isActive ? 'ACTIVE' : 'INACTIVE'}`);

  res.json({ message: `Banner is now ${banner.isActive ? 'Active' : 'Inactive'}.`, banner });
});

// DELETE BANNER
app.delete('/api/admin/banners/:id', adminAuthMiddleware, (req: AdminRequest, res: Response) => {
  const { id } = req.params;
  const index = db.banners.findIndex(b => b.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Banner not found.' });
  }

  const removed = db.banners.splice(index, 1)[0];
  saveDatabase(db);
  broadcastStateUpdate();

  logAdminAction('Banner Deleted', req.adminUser!, `Deleted banner "${removed.name || removed.title || removed.id}"`);

  res.json({ message: 'Banner slide deleted.' });
});

// ==========================================
// 9. ADMIN MEDIA LIBRARY
// ==========================================

app.get('/api/admin/media', adminAuthMiddleware, (req: AdminRequest, res: Response) => {
  res.json({ media: db.media || [] });
});

app.post('/api/admin/media', adminAuthMiddleware, (req: AdminRequest, res: Response) => {
  const { name, url, type, size } = req.body;
  if (!name || !url) {
    return res.status(400).json({ error: 'Media name and URL/image data are required.' });
  }

  const newMedia = {
    id: `med_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    name: name.trim(),
    url: url.trim(),
    type: (type as any) || 'contestant',
    size: size || '1.0 MB',
    createdAt: new Date().toISOString()
  };

  if (!db.media) db.media = [];
  db.media.unshift(newMedia);
  saveDatabase(db);

  logAdminAction('Media Uploaded', req.adminUser!, `Added image "${newMedia.name}"`);

  res.status(201).json({ message: 'Media asset uploaded successfully!', media: newMedia });
});

app.put('/api/admin/media/:id', adminAuthMiddleware, (req: AdminRequest, res: Response) => {
  const { id } = req.params;
  if (!db.media) db.media = [];
  const item = db.media.find(m => m.id === id);

  if (!item) {
    return res.status(404).json({ error: 'Media item not found.' });
  }

  const { name, url, type, size } = req.body;
  if (name !== undefined) item.name = name.trim();
  if (url !== undefined) item.url = url.trim();
  if (type !== undefined) item.type = type;
  if (size !== undefined) item.size = size;

  saveDatabase(db);
  logAdminAction('Media Updated', req.adminUser!, `Updated media asset "${item.name}"`);

  res.json({ message: 'Media asset updated successfully!', media: item });
});

app.delete('/api/admin/media/:id', adminAuthMiddleware, (req: AdminRequest, res: Response) => {
  const { id } = req.params;
  if (!db.media) db.media = [];
  const index = db.media.findIndex(m => m.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Media item not found.' });
  }

  const removed = db.media.splice(index, 1)[0];
  saveDatabase(db);

  logAdminAction('Media Deleted', req.adminUser!, `Deleted asset "${removed.name}"`);

  res.json({ message: 'Media asset removed from gallery.' });
});

// ==========================================
// 10. ADMIN PAGES MANAGEMENT
// ==========================================

app.get('/api/admin/pages', adminAuthMiddleware, (req: AdminRequest, res: Response) => {
  res.json({ pages: db.pages || {} });
});

app.put('/api/admin/pages/:slug', adminAuthMiddleware, (req: AdminRequest, res: Response) => {
  const { slug } = req.params;
  const updates = req.body;

  if (!db.pages) db.pages = {};
  db.pages[slug] = {
    slug,
    title: updates.title || slug,
    subtitle: updates.subtitle || '',
    content: updates.content || '',
    sections: updates.sections || [],
    updatedAt: new Date().toISOString()
  };

  saveDatabase(db);
  logAdminAction('Page Updated', req.adminUser!, `Updated page content for "${slug}"`);

  res.json({ message: `Page "${slug}" updated successfully!`, page: db.pages[slug] });
});

// ==========================================
// 11. ADMIN NAVIGATION MANAGEMENT
// ==========================================

app.get('/api/admin/navigation', adminAuthMiddleware, (req: AdminRequest, res: Response) => {
  res.json({ navigation: db.siteSettings.navigationItems || [] });
});

app.put('/api/admin/navigation/bulk', adminAuthMiddleware, (req: AdminRequest, res: Response) => {
  const { items } = req.body;
  if (!Array.isArray(items)) {
    return res.status(400).json({ error: 'Items array is required.' });
  }

  db.siteSettings.navigationItems = items.map((item, idx) => ({
    id: item.id || `nav_${Date.now()}_${idx}`,
    label: String(item.label || '').trim(),
    url: String(item.url || '').trim(),
    order: typeof item.order === 'number' ? item.order : idx + 1,
    isEnabled: item.isEnabled !== undefined ? Boolean(item.isEnabled) : true,
    isExternal: Boolean(item.isExternal)
  }));

  saveDatabase(db);
  broadcastStateUpdate();

  logAdminAction('Navigation Bulk Updated', req.adminUser!, `Updated ${items.length} navigation items`);

  res.json({ message: 'Navigation updated successfully!', navigation: db.siteSettings.navigationItems });
});

app.post('/api/admin/navigation/reset-defaults', adminAuthMiddleware, (req: AdminRequest, res: Response) => {
  db.siteSettings.navigationItems = [
    { id: 'nav_home', label: 'Home', url: 'home', order: 1, isEnabled: true },
    { id: 'nav_contestants', label: 'Contestants', url: 'contestants', order: 2, isEnabled: true },
    { id: 'nav_ranking', label: 'Live Ranking', url: 'ranking', order: 3, isEnabled: true },
    { id: 'nav_results', label: 'Results', url: 'results', order: 4, isEnabled: true },
    { id: 'nav_about', label: 'Rules & Info', url: 'about', order: 5, isEnabled: true }
  ];

  saveDatabase(db);
  broadcastStateUpdate();

  logAdminAction('Navigation Reset', req.adminUser!, 'Reset navigation items to standard default links');

  res.json({ message: 'Navigation reset to default 5 items!', navigation: db.siteSettings.navigationItems });
});

app.post('/api/admin/navigation', adminAuthMiddleware, (req: AdminRequest, res: Response) => {
  const { label, url, isEnabled, isExternal } = req.body;
  if (!label || !url) {
    return res.status(400).json({ error: 'Label and URL are required.' });
  }

  const newItem = {
    id: `nav_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
    label: label.trim(),
    url: url.trim(),
    order: db.siteSettings.navigationItems.length + 1,
    isEnabled: isEnabled !== undefined ? Boolean(isEnabled) : true,
    isExternal: Boolean(isExternal)
  };

  db.siteSettings.navigationItems.push(newItem);
  saveDatabase(db);
  broadcastStateUpdate();

  logAdminAction('Navigation Item Added', req.adminUser!, `Added menu link "${newItem.label}"`);

  res.status(201).json({ message: 'Menu item added!', item: newItem, navigation: db.siteSettings.navigationItems });
});

app.put('/api/admin/navigation/:id', adminAuthMiddleware, (req: AdminRequest, res: Response) => {
  const { id } = req.params;
  const item = db.siteSettings.navigationItems.find(n => n.id === id);

  if (!item) {
    return res.status(404).json({ error: 'Navigation item not found' });
  }

  const { label, url, order, isEnabled, isExternal } = req.body;
  if (label !== undefined) item.label = label.trim();
  if (url !== undefined) item.url = url.trim();
  if (order !== undefined) item.order = Number(order);
  if (isEnabled !== undefined) item.isEnabled = Boolean(isEnabled);
  if (isExternal !== undefined) item.isExternal = Boolean(isExternal);

  saveDatabase(db);
  broadcastStateUpdate();

  logAdminAction('Navigation Updated', req.adminUser!, `Updated menu link "${item.label}"`);

  res.json({ message: 'Menu item updated!', item, navigation: db.siteSettings.navigationItems });
});

app.delete('/api/admin/navigation/:id', adminAuthMiddleware, (req: AdminRequest, res: Response) => {
  const { id } = req.params;
  const index = db.siteSettings.navigationItems.findIndex(n => n.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Navigation item not found' });
  }

  const removed = db.siteSettings.navigationItems.splice(index, 1)[0];
  saveDatabase(db);
  broadcastStateUpdate();

  logAdminAction('Navigation Deleted', req.adminUser!, `Deleted menu link "${removed.label}"`);

  res.json({ message: 'Menu item deleted.', navigation: db.siteSettings.navigationItems });
});

// ==========================================
// 12. ADMIN SETTINGS: SITE, THEME, BRANDING, HOMEPAGE, VOTING, GOOGLE
// ==========================================

app.put('/api/admin/settings/site', adminAuthMiddleware, (req: AdminRequest, res: Response) => {
  const updates = req.body;
  db.siteSettings = {
    ...db.siteSettings,
    ...updates
  };

  saveDatabase(db);
  broadcastStateUpdate();

  logAdminAction('Site Settings Updated', req.adminUser!, 'Updated global site settings');

  res.json({ message: 'Site settings updated!', siteSettings: db.siteSettings });
});

app.put('/api/admin/settings/branding', adminAuthMiddleware, (req: AdminRequest, res: Response) => {
  const updates = req.body;
  db.siteSettings.branding = {
    ...db.siteSettings.branding,
    ...updates
  };
  if (updates.websiteName) db.siteSettings.siteName = updates.websiteName;
  if (updates.showName) db.siteSettings.seasonTitle = updates.showName;
  if (updates.tagline) db.siteSettings.tagline = updates.tagline;
  if (updates.logoText) db.siteSettings.logoText = updates.logoText;
  if (updates.mainLogoUrl !== undefined) db.siteSettings.logoUrl = updates.mainLogoUrl;

  saveDatabase(db);
  broadcastStateUpdate();

  logAdminAction('Branding Updated', req.adminUser!, `Updated logo & branding (${db.siteSettings.branding.websiteName})`);

  res.json({ message: 'Branding updated!', branding: db.siteSettings.branding, siteSettings: db.siteSettings });
});

app.put('/api/admin/settings/theme', adminAuthMiddleware, (req: AdminRequest, res: Response) => {
  const updates = req.body;
  db.siteSettings.theme = {
    ...db.siteSettings.theme,
    ...updates
  };

  saveDatabase(db);
  broadcastStateUpdate();

  logAdminAction('Theme Saved', req.adminUser!, `Applied theme preset "${db.siteSettings.theme.preset}" and customized color palette`);

  res.json({ message: 'Theme updated!', theme: db.siteSettings.theme, siteSettings: db.siteSettings });
});

// ==========================================
// 12.1 CUSTOM THEMES MANAGER CRUD
// ==========================================

// GET /api/admin/themes
app.get('/api/admin/themes', adminAuthMiddleware, (req: AdminRequest, res: Response) => {
  res.json({
    themes: db.themes || [],
    activeThemeId: db.siteSettings.theme.activeThemeId || (db.themes && db.themes[0]?.id)
  });
});

// POST /api/admin/themes (Create Theme)
app.post('/api/admin/themes', adminAuthMiddleware, (req: AdminRequest, res: Response) => {
  const newTheme = {
    id: `thm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    name: req.body.name || 'Custom Theme',
    description: req.body.description || 'Custom user-created reality arena theme',
    preset: req.body.preset || 'custom',
    isActive: false,
    isCustom: true,
    primaryColor: req.body.primaryColor || '#f59e0b',
    secondaryColor: req.body.secondaryColor || '#181a24',
    accentColor: req.body.accentColor || '#fbbf24',
    backgroundColor: req.body.backgroundColor || '#0a0b0f',
    cardBackgroundColor: req.body.cardBackgroundColor || '#12141c',
    headerBackgroundColor: req.body.headerBackgroundColor || '#0f1015',
    footerBackgroundColor: req.body.footerBackgroundColor || '#090a0d',
    buttonColor: req.body.buttonColor || '#f59e0b',
    buttonHoverColor: req.body.buttonHoverColor || '#d97706',
    textColor: req.body.textColor || '#f4f4f5',
    secondaryTextColor: req.body.secondaryTextColor || '#9ca3af',
    borderColor: req.body.borderColor || '#27272a',
    inputBackgroundColor: req.body.inputBackgroundColor || '#18181b',
    modalBackgroundColor: req.body.modalBackgroundColor || '#12141c',
    successColor: req.body.successColor || '#10b981',
    errorColor: req.body.errorColor || '#f43f5e',
    borderRadius: req.body.borderRadius || '1rem',
    fontFamily: req.body.fontFamily || 'outfit',
    shadowLevel: req.body.shadowLevel || 'medium',
    backgrounds: req.body.backgrounds || {
      desktopBackground: '',
      tabletBackground: '',
      mobileBackground: '',
      loginBackground: '',
      adminBackground: '',
      homepageBackground: '',
      contestantSectionBackground: '',
      footerBackground: ''
    },
    createdAt: new Date().toISOString()
  };

  if (!db.themes) db.themes = [];
  db.themes.push(newTheme);
  saveDatabase(db);

  logAdminAction('Theme Created', req.adminUser!, `Created new custom theme "${newTheme.name}"`);

  res.status(201).json({ message: `Theme "${newTheme.name}" created!`, theme: newTheme });
});

// PUT /api/admin/themes/:id (Update Theme)
app.put('/api/admin/themes/:id', adminAuthMiddleware, (req: AdminRequest, res: Response) => {
  const { id } = req.params;
  const theme = (db.themes || []).find(t => t.id === id);

  if (!theme) {
    return res.status(404).json({ error: 'Theme not found.' });
  }

  Object.assign(theme, req.body, { updatedAt: new Date().toISOString() });

  // If this theme is currently active, sync it with db.siteSettings.theme
  if (db.siteSettings.theme.activeThemeId === id || theme.isActive) {
    db.siteSettings.theme = {
      ...db.siteSettings.theme,
      ...theme,
      activeThemeId: id,
      preset: theme.preset
    };
    broadcastStateUpdate();
  }

  saveDatabase(db);
  logAdminAction('Theme Updated', req.adminUser!, `Updated custom theme palette for "${theme.name}"`);

  res.json({ message: `Theme "${theme.name}" updated!`, theme });
});

// POST /api/admin/themes/:id/activate (Activate Theme)
app.post('/api/admin/themes/:id/activate', adminAuthMiddleware, (req: AdminRequest, res: Response) => {
  const { id } = req.params;
  const theme = (db.themes || []).find(t => t.id === id);

  if (!theme) {
    return res.status(404).json({ error: 'Theme not found.' });
  }

  // Set all other themes to inactive
  (db.themes || []).forEach(t => {
    t.isActive = t.id === id;
  });

  // Apply to siteSettings
  db.siteSettings.theme = {
    ...db.siteSettings.theme,
    preset: theme.preset,
    activeThemeId: id,
    primaryColor: theme.primaryColor,
    secondaryColor: theme.secondaryColor,
    accentColor: theme.accentColor,
    backgroundColor: theme.backgroundColor,
    cardBackgroundColor: theme.cardBackgroundColor,
    headerBackgroundColor: theme.headerBackgroundColor,
    footerBackgroundColor: theme.footerBackgroundColor,
    buttonColor: theme.buttonColor,
    buttonHoverColor: theme.buttonHoverColor,
    textColor: theme.textColor,
    secondaryTextColor: theme.secondaryTextColor,
    borderColor: theme.borderColor,
    inputBackgroundColor: theme.inputBackgroundColor,
    modalBackgroundColor: theme.modalBackgroundColor,
    successColor: theme.successColor,
    errorColor: theme.errorColor,
    borderRadius: theme.borderRadius,
    fontFamily: theme.fontFamily,
    shadowLevel: theme.shadowLevel,
    backgrounds: theme.backgrounds || {
      desktopBackground: '',
      tabletBackground: '',
      mobileBackground: '',
      loginBackground: '',
      adminBackground: '',
      homepageBackground: '',
      contestantSectionBackground: '',
      footerBackground: ''
    }
  };

  saveDatabase(db);
  broadcastStateUpdate();

  logAdminAction('Theme Activated', req.adminUser!, `Activated theme "${theme.name}" across entire public broadcast`);

  res.json({ message: `Theme "${theme.name}" is now live!`, theme, siteSettings: db.siteSettings });
});

// POST /api/admin/themes/:id/duplicate (Duplicate Theme)
app.post('/api/admin/themes/:id/duplicate', adminAuthMiddleware, (req: AdminRequest, res: Response) => {
  const { id } = req.params;
  const original = (db.themes || []).find(t => t.id === id);

  if (!original) {
    return res.status(404).json({ error: 'Theme not found.' });
  }

  const duplicated = {
    ...original,
    id: `thm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    name: `${original.name} (Copy)`,
    isActive: false,
    isCustom: true,
    createdAt: new Date().toISOString()
  };

  if (!db.themes) db.themes = [];
  db.themes.push(duplicated);
  saveDatabase(db);

  logAdminAction('Theme Duplicated', req.adminUser!, `Duplicated theme "${original.name}"`);

  res.status(201).json({ message: `Theme "${original.name}" duplicated successfully!`, theme: duplicated });
});

// DELETE /api/admin/themes/:id (Delete Theme)
app.delete('/api/admin/themes/:id', adminAuthMiddleware, (req: AdminRequest, res: Response) => {
  const { id } = req.params;
  if (!db.themes) db.themes = [];
  const index = db.themes.findIndex(t => t.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Theme not found.' });
  }

  const removed = db.themes.splice(index, 1)[0];
  saveDatabase(db);

  logAdminAction('Theme Deleted', req.adminUser!, `Deleted theme "${removed.name}"`);

  res.json({ message: `Theme "${removed.name}" removed.` });
});

// POST /api/admin/themes/:id/deactivate (Deactivate Theme)
app.post('/api/admin/themes/:id/deactivate', adminAuthMiddleware, (req: AdminRequest, res: Response) => {
  const { id } = req.params;
  const theme = (db.themes || []).find(t => t.id === id);

  if (theme) {
    theme.isActive = false;
  }

  // Fallback to default theme
  const defaultTheme = (db.themes || []).find(t => t.preset === 'dark-gold') || (db.themes || [])[0];
  if (defaultTheme) {
    defaultTheme.isActive = true;
    db.siteSettings.theme = {
      ...db.siteSettings.theme,
      ...defaultTheme,
      activeThemeId: defaultTheme.id
    };
  }

  saveDatabase(db);
  broadcastStateUpdate();

  logAdminAction('Theme Deactivated', req.adminUser!, `Deactivated theme "${theme ? theme.name : id}". Restored default palette.`);

  res.json({ message: `Theme deactivated. Restored default theme.`, siteSettings: db.siteSettings });
});

// POST /api/admin/themes/reset-defaults (Reset Theme to Defaults)
app.post('/api/admin/themes/reset-defaults', adminAuthMiddleware, (req: AdminRequest, res: Response) => {
  const defaultThemes = PREDEFINED_THEMES.map((p, idx) => convertPaletteToCustomTheme(p, idx === 0));

  db.themes = defaultThemes as any;
  const activeDef = defaultThemes[0];
  db.siteSettings.theme = {
    ...db.siteSettings.theme,
    ...activeDef,
    activeThemeId: activeDef.id
  } as any;

  saveDatabase(db);
  broadcastStateUpdate();

  logAdminAction('Themes Reset', req.adminUser!, 'Reset all themes and palettes to default official presets');

  res.json({ message: 'All themes reset to default official presets!', themes: db.themes, siteSettings: db.siteSettings });
});

// POST /api/admin/themes/import (Import Theme JSON)
app.post('/api/admin/themes/import', adminAuthMiddleware, (req: AdminRequest, res: Response) => {
  const importedTheme = req.body;

  if (!importedTheme || !importedTheme.name || !importedTheme.primaryColor) {
    return res.status(400).json({ error: 'Invalid theme JSON structure. Must contain at least name and primaryColor.' });
  }

  const safeTheme = {
    ...importedTheme,
    id: `thm_import_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    name: `${importedTheme.name} (Imported)`,
    isActive: false,
    isCustom: true,
    createdAt: new Date().toISOString()
  };

  if (!db.themes) db.themes = [];
  db.themes.push(safeTheme);
  saveDatabase(db);

  logAdminAction('Theme Imported', req.adminUser!, `Imported custom theme "${safeTheme.name}" from JSON`);

  res.status(201).json({ message: `Theme "${safeTheme.name}" imported successfully!`, theme: safeTheme });
});

// ==========================================
// 12.2 GLOBAL CONTENT & STATS SETTINGS
// ==========================================

app.put('/api/admin/settings/global-content', adminAuthMiddleware, (req: AdminRequest, res: Response) => {
  const updates = req.body;
  db.siteSettings.globalContent = {
    ...db.siteSettings.globalContent,
    ...updates
  };

  saveDatabase(db);
  broadcastStateUpdate();

  logAdminAction('Global Content Updated', req.adminUser!, 'Updated CMS labels, hero copy, and broadcast messaging');

  res.json({ message: 'Global website copy updated!', globalContent: db.siteSettings.globalContent, siteSettings: db.siteSettings });
});

app.put('/api/admin/settings/stats', adminAuthMiddleware, (req: AdminRequest, res: Response) => {
  const updates = req.body;
  db.siteSettings.statsConfig = {
    ...db.siteSettings.statsConfig,
    ...updates
  };

  saveDatabase(db);
  broadcastStateUpdate();

  logAdminAction('Statistics Config Updated', req.adminUser!, 'Updated live voting stats labels and visibility toggles');

  res.json({ message: 'Live statistics configuration saved!', statsConfig: db.siteSettings.statsConfig, siteSettings: db.siteSettings });
});

app.put('/api/admin/settings/ui', adminAuthMiddleware, (req: AdminRequest, res: Response) => {
  const updates = req.body;
  db.siteSettings.uiSettings = {
    ...db.siteSettings.uiSettings,
    ...updates
  };

  saveDatabase(db);
  broadcastStateUpdate();

  logAdminAction('UI Customizer Updated', req.adminUser!, 'Updated UI layout and card styles');

  res.json({ message: 'UI settings updated!', uiSettings: db.siteSettings.uiSettings });
});

app.put('/api/admin/settings/homepage', adminAuthMiddleware, (req: AdminRequest, res: Response) => {
  const { sections } = req.body;
  if (Array.isArray(sections)) {
    db.siteSettings.homepageSections = sections;
  }

  saveDatabase(db);
  broadcastStateUpdate();

  logAdminAction('Homepage Builder Updated', req.adminUser!, 'Reordered and configured homepage sections');

  res.json({ message: 'Homepage builder settings saved!', homepageSections: db.siteSettings.homepageSections });
});

app.put('/api/admin/settings/voting', adminAuthMiddleware, (req: AdminRequest, res: Response) => {
  const updates = req.body;
  db.votingSettings = {
    ...db.votingSettings,
    ...updates
  };

  saveDatabase(db);
  broadcastStateUpdate();

  logAdminAction('Voting Rules Updated', req.adminUser!, `Live Status: ${db.votingSettings.isVotingActive ? 'ON' : 'OFF'}`);

  res.json({ message: 'Voting rules updated!', votingSettings: db.votingSettings });
});

app.put('/api/admin/settings/google', adminAuthMiddleware, (req: AdminRequest, res: Response) => {
  const updates = req.body;
  db.siteSettings.googleServices = {
    ...db.siteSettings.googleServices,
    ...updates
  };

  saveDatabase(db);
  broadcastStateUpdate();

  logAdminAction('Google Services Updated', req.adminUser!, 'Updated Google Analytics, AdSense, Tag Manager & Console settings');

  res.json({ message: 'Google Services updated!', googleServices: db.siteSettings.googleServices });
});

// ==========================================
// 14. ADSTERRA & ADS MANAGEMENT API
// ==========================================

// GET /api/admin/ads (Get all ad slots and configurations)
app.get('/api/admin/ads', adminAuthMiddleware, (req: AdminRequest, res: Response) => {
  res.json({
    adSlots: db.siteSettings.adSlots || [],
    adsConfig: db.siteSettings.adsConfig || {}
  });
});

// PUT /api/admin/ads/slots (Bulk update all ad slots)
app.put('/api/admin/ads/slots', adminAuthMiddleware, (req: AdminRequest, res: Response) => {
  const { slots } = req.body;
  if (!Array.isArray(slots)) {
    return res.status(400).json({ error: 'Slots must be an array of ad slot objects.' });
  }

  if (!db.siteSettings.adsConfig) {
    db.siteSettings.adsConfig = {};
  }

  db.siteSettings.adSlots = slots.map((s: any, idx: number) => ({
    id: s.id || `ad_slot_${Date.now()}_${idx}`,
    name: s.name || `Ad Slot #${idx + 1}`,
    location: s.location || 'custom',
    code: s.code || '',
    enabled: Boolean(s.enabled),
    desktop: s.desktop !== undefined ? Boolean(s.desktop) : true,
    tablet: s.tablet !== undefined ? Boolean(s.tablet) : true,
    mobile: s.mobile !== undefined ? Boolean(s.mobile) : true,
    order: typeof s.order === 'number' ? s.order : idx + 1,
    previewNote: s.previewNote || '',
    updatedAt: new Date().toISOString()
  }));

  // Sync backward compatibility for headerAd and footerAd
  const currentSlots = db.siteSettings.adSlots || [];
  const headerSlot = currentSlots.find((s: any) => s.location === 'header');
  const footerSlot = currentSlots.find((s: any) => s.location === 'footer');
  const bannerSlot = currentSlots.find((s: any) => s.location === 'banner' || s.location === 'homepage');

  if (headerSlot && db.siteSettings.adsConfig) {
    db.siteSettings.adsConfig.headerAd = {
      enabled: headerSlot.enabled,
      code: headerSlot.code,
      slotType: 'header',
      desktop: headerSlot.desktop,
      tablet: headerSlot.tablet,
      mobile: headerSlot.mobile
    };
  }
  if (footerSlot && db.siteSettings.adsConfig) {
    db.siteSettings.adsConfig.footerAd = {
      enabled: footerSlot.enabled,
      code: footerSlot.code,
      slotType: 'footer',
      desktop: footerSlot.desktop,
      tablet: footerSlot.tablet,
      mobile: footerSlot.mobile
    };
  }
  if (bannerSlot && db.siteSettings.adsConfig) {
    db.siteSettings.adsConfig.bannerAd = {
      enabled: bannerSlot.enabled,
      code: bannerSlot.code,
      slotType: 'banner',
      desktop: bannerSlot.desktop,
      tablet: bannerSlot.tablet,
      mobile: bannerSlot.mobile
    };
  }

  saveDatabase(db);
  broadcastStateUpdate();

  const enabledCount = (db.siteSettings.adSlots || []).filter((s: any) => s.enabled).length;
  logAdminAction('Adsterra Slots Updated', req.adminUser!, `Saved ${(db.siteSettings.adSlots || []).length} ad slots (${enabledCount} enabled)`);

  res.json({
    message: 'Ad slots updated successfully!',
    adSlots: db.siteSettings.adSlots,
    adsConfig: db.siteSettings.adsConfig,
    siteSettings: db.siteSettings
  });
});

// POST /api/admin/ads/slots (Add new ad slot)
app.post('/api/admin/ads/slots', adminAuthMiddleware, (req: AdminRequest, res: Response) => {
  const { name, location, code, enabled, desktop, tablet, mobile, order, previewNote } = req.body;
  if (!name || !location) {
    return res.status(400).json({ error: 'Name and Location are required for an ad slot.' });
  }

  const newSlot = {
    id: `ad_slot_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    name: String(name).trim(),
    location: location || 'custom',
    code: code || '',
    enabled: Boolean(enabled),
    desktop: desktop !== undefined ? Boolean(desktop) : true,
    tablet: tablet !== undefined ? Boolean(tablet) : true,
    mobile: mobile !== undefined ? Boolean(mobile) : true,
    order: typeof order === 'number' ? order : (db.siteSettings.adSlots?.length || 0) + 1,
    previewNote: previewNote || '',
    createdAt: new Date().toISOString()
  };

  if (!db.siteSettings.adSlots) db.siteSettings.adSlots = [];
  db.siteSettings.adSlots.push(newSlot);

  saveDatabase(db);
  broadcastStateUpdate();

  logAdminAction('Ad Slot Added', req.adminUser!, `Added ad slot "${newSlot.name}" at location ${newSlot.location}`);

  res.status(201).json({ message: `Ad slot "${newSlot.name}" created!`, slot: newSlot, adSlots: db.siteSettings.adSlots });
});

// PUT /api/admin/ads/slots/:id (Update single ad slot)
app.put('/api/admin/ads/slots/:id', adminAuthMiddleware, (req: AdminRequest, res: Response) => {
  const { id } = req.params;
  const slot = (db.siteSettings.adSlots || []).find((s: any) => s.id === id);

  if (!slot) {
    return res.status(404).json({ error: 'Ad slot not found.' });
  }

  Object.assign(slot, req.body, { updatedAt: new Date().toISOString() });

  saveDatabase(db);
  broadcastStateUpdate();

  logAdminAction('Ad Slot Updated', req.adminUser!, `Updated ad slot "${slot.name}" (${slot.enabled ? 'ENABLED' : 'DISABLED'})`);

  res.json({ message: `Ad slot "${slot.name}" updated!`, slot, adSlots: db.siteSettings.adSlots });
});

// DELETE /api/admin/ads/slots/:id (Delete/Clear ad slot)
app.delete('/api/admin/ads/slots/:id', adminAuthMiddleware, (req: AdminRequest, res: Response) => {
  const { id } = req.params;
  const index = (db.siteSettings.adSlots || []).findIndex((s: any) => s.id === id);

  if (index === -1 || !db.siteSettings.adSlots) {
    return res.status(404).json({ error: 'Ad slot not found.' });
  }

  const removed = db.siteSettings.adSlots.splice(index, 1)[0];

  saveDatabase(db);
  broadcastStateUpdate();

  logAdminAction('Ad Slot Deleted', req.adminUser!, `Deleted ad slot "${removed.name}"`);

  res.json({ message: `Ad slot "${removed.name}" removed!`, adSlots: db.siteSettings.adSlots });
});

app.put('/api/admin/settings/ads', adminAuthMiddleware, (req: AdminRequest, res: Response) => {
  const updates = req.body;
  if (updates.slots && Array.isArray(updates.slots)) {
    db.siteSettings.adSlots = updates.slots;
  }
  db.siteSettings.adsConfig = {
    ...db.siteSettings.adsConfig,
    ...updates
  };

  saveDatabase(db);
  broadcastStateUpdate();

  const enabledSlotsCount = (db.siteSettings.adSlots || []).filter((s: any) => s.enabled).length;
  logAdminAction('Ads Configuration Updated', req.adminUser!, `Updated Adsterra & Ads slots (${enabledSlotsCount} active slots)`);

  res.json({ message: 'Ads configuration updated successfully!', adsConfig: db.siteSettings.adsConfig, adSlots: db.siteSettings.adSlots });
});

// Logs
app.get('/api/admin/audit-logs', adminAuthMiddleware, (req: AdminRequest, res: Response) => {
  const logs = [...db.auditLogs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  res.json({ auditLogs: logs });
});

app.get('/api/admin/activity-logs', adminAuthMiddleware, (req: AdminRequest, res: Response) => {
  res.json({ logs: db.adminLogs });
});

// GET /api/admin/votes (Paginated vote transactions)
app.get('/api/admin/votes', adminAuthMiddleware, (req: AdminRequest, res: Response) => {
  const { search, contestantId, status, limit = '100', offset = '0' } = req.query;
  let filtered = [...db.votes];

  if (contestantId) {
    filtered = filtered.filter(v => v.contestantId === contestantId);
  }
  if (status) {
    filtered = filtered.filter(v => v.status === status);
  }
  if (search) {
    const q = String(search).trim().toLowerCase();
    filtered = filtered.filter(v =>
      String(v.id || '').toLowerCase().includes(q) ||
      String(v.contestantName || '').toLowerCase().includes(q) ||
      String(v.contestantNumber || '').includes(q)
    );
  }

  filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const total = filtered.length;
  const paginated = filtered.slice(Number(offset), Number(offset) + Number(limit));

  res.json({
    votes: paginated,
    total,
    offset: Number(offset),
    limit: Number(limit)
  });
});

// Reset Demo Data
app.post('/api/admin/reset-data', adminAuthMiddleware, (req: AdminRequest, res: Response) => {
  db = getDefaultSeedData();
  seedHistoricalVotes(db);
  saveDatabase(db);
  broadcastStateUpdate();

  logAdminAction('Database Reset', req.adminUser!, 'Reset all show data to clean showcase state');

  res.json({ message: 'Database reset to clean reality show state!', state: getPublicState() });
});

// ==========================================
// API 404 & ERROR HANDLER (ENSURES ALL /api/* RETURN JSON)
// ==========================================

app.all('/api/*', (req: Request, res: Response) => {
  res.status(404).json({ error: `API endpoint not found: ${req.method} ${req.originalUrl || req.url}` });
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (req.url?.startsWith('/api') || req.originalUrl?.startsWith('/api')) {
    console.error('API Error:', err);
    return res.status(err.status || 500).json({
      error: err.message || 'Internal Server Error'
    });
  }
  next(err);
});

// ==========================================
// VITE INTEGRATION / PRODUCTION SERVING
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`StarHouse Voting Platform Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
