import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useShow } from '../context/ShowContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Banner } from '../types';

const SLIDE_INTERVAL_MS = 5000; // 5 seconds per slide

// Safe URL protocol validator to reject dangerous schemes
function isSafeUrl(url?: string): boolean {
  if (!url || !url.trim()) return false;
  const trimmed = url.trim().toLowerCase();
  if (
    trimmed.startsWith('javascript:') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('vbscript:') ||
    trimmed.startsWith('file:')
  ) {
    return false;
  }
  return true;
}

export const HeroBanner: React.FC = () => {
  const { banners, setCurrentView, currentView, setIsLeaderboardVisible } = useShow();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isDocumentVisible, setIsDocumentVisible] = useState(true);
  const [timerKey, setTimerKey] = useState(0);

  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const touchCurrentXRef = useRef<number | null>(null);
  const touchCurrentYRef = useRef<number | null>(null);

  // Active banners filtered and sorted strictly by displayOrder / order
  const activeBanners: Banner[] = (banners || [])
    .filter(b => b.isActive !== false && (b.status === undefined || b.status === 'active'))
    .sort((a, b) => (a.displayOrder ?? a.order ?? 0) - (b.displayOrder ?? b.order ?? 0));

  const bannerCount = activeBanners.length;

  // Track document visibility to pause when the browser tab is hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsDocumentVisible(document.visibilityState === 'visible');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Auto-reset index if activeBanners shrink
  useEffect(() => {
    if (currentIndex >= bannerCount && bannerCount > 0) {
      setCurrentIndex(0);
    }
  }, [bannerCount, currentIndex]);

  // Navigate to previous slide & reset timer
  const handlePrevSlide = useCallback(() => {
    if (bannerCount <= 1) return;
    setCurrentIndex(prev => (prev - 1 + bannerCount) % bannerCount);
    setTimerKey(prev => prev + 1);
  }, [bannerCount]);

  // Navigate to next slide & reset timer
  const handleNextSlide = useCallback(() => {
    if (bannerCount <= 1) return;
    setCurrentIndex(prev => (prev + 1) % bannerCount);
    setTimerKey(prev => prev + 1);
  }, [bannerCount]);

  // Navigate to specific slide index & reset timer
  const handleSelectSlide = useCallback((index: number) => {
    if (bannerCount <= 1 || index === currentIndex) return;
    setCurrentIndex(index);
    setTimerKey(prev => prev + 1);
  }, [bannerCount, currentIndex]);

  // Auto-rotation timer: continuously loops through all banners every 5 seconds,
  // pauses on hover/touch and when the browser tab is hidden
  useEffect(() => {
    if (bannerCount <= 1 || isHovered || !isDocumentVisible) return;

    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % bannerCount);
    }, SLIDE_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [bannerCount, isHovered, isDocumentVisible, timerKey]);

  // Touch handlers for mobile swipe (left -> next, right -> prev)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.targetTouches[0].clientX;
    touchStartYRef.current = e.targetTouches[0].clientY;
    touchCurrentXRef.current = e.targetTouches[0].clientX;
    touchCurrentYRef.current = e.targetTouches[0].clientY;
    setIsHovered(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchCurrentXRef.current = e.targetTouches[0].clientX;
    touchCurrentYRef.current = e.targetTouches[0].clientY;
  };

  const handleTouchEnd = () => {
    setIsHovered(false);
    if (
      touchStartXRef.current === null ||
      touchStartYRef.current === null ||
      touchCurrentXRef.current === null ||
      touchCurrentYRef.current === null
    ) {
      return;
    }

    const deltaX = touchStartXRef.current - touchCurrentXRef.current;
    const deltaY = touchStartYRef.current - touchCurrentYRef.current;

    // Minimum swipe threshold (40px) and ensure horizontal intent over vertical scroll
    if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY) * 1.1) {
      if (deltaX > 0) {
        // Swiped Left -> Next Banner
        handleNextSlide();
      } else {
        // Swiped Right -> Previous Banner
        handlePrevSlide();
      }
    }

    touchStartXRef.current = null;
    touchStartYRef.current = null;
    touchCurrentXRef.current = null;
    touchCurrentYRef.current = null;
  };

  // Safe banner click handler for individual destination URLs
  const handleBannerClick = (banner: Banner, e: React.MouseEvent) => {
    const rawUrl = (banner.destinationUrl || banner.ctaLink || '').trim();
    if (!rawUrl || !isSafeUrl(rawUrl)) return;

    const isOpenNewTab = Boolean(
      banner.openTarget === '_blank' || banner.openInNewTab
    );

    // Handle internal anchor links (#contestants-section, #ranking-section, etc.)
    if (rawUrl.startsWith('#')) {
      e.preventDefault();
      if (rawUrl === '#ranking-section') {
        setIsLeaderboardVisible(true);
        if (currentView !== 'home') {
          setCurrentView('ranking');
        } else {
          const el = document.getElementById('ranking-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        if (currentView !== 'home') {
          setCurrentView('home');
          setTimeout(() => {
            const el = document.getElementById('contestants-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        } else {
          const el = document.getElementById('contestants-section');
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
          } else {
            setCurrentView('contestants');
          }
        }
      }
      return;
    }

    // Handle absolute & relative external/internal URLs safely
    if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://') || rawUrl.startsWith('/')) {
      if (isOpenNewTab) {
        window.open(rawUrl, '_blank', 'noopener,noreferrer');
      } else {
        window.location.href = rawUrl;
      }
    }
  };

  // If there are zero active banners: cleanly hide without broken UI
  if (bannerCount === 0) {
    return null;
  }

  return (
    <section
      id="hero-banner-slider"
      aria-label="Promotional Banner Slider"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-3 sm:pt-6 pb-2 select-none group focus:outline-none"
    >
      {/* Outer Code-Shaped Angular Frame Container with Subtle Glow and Clean Chamfer Silhouette */}
      <div className="relative rounded-2xl sm:rounded-3xl p-1 sm:p-2 bg-gradient-to-b from-zinc-900/90 via-zinc-950/95 to-black border border-amber-500/25 shadow-[0_0_30px_rgba(0,0,0,0.85)] shadow-amber-500/5 backdrop-blur-xl transition-all duration-500 hover:border-amber-500/40">

        {/* Ambient Subtle Pulsing Neon Aura behind the frame */}
        <div
          aria-hidden="true"
          className="absolute -inset-1 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-amber-500/10 blur-xl opacity-40 group-hover:opacity-70 transition-opacity duration-700 pointer-events-none -z-10 animate-code-glow"
        />

        {/* Chamfered Code Frame Viewport: Houses ONLY the pure banner images with cut/angular corners */}
        <div className="relative w-full aspect-[21/9] sm:aspect-[21/8] md:aspect-[24/9] max-h-[540px] overflow-hidden bg-black code-frame-chamfer border border-amber-500/20 shadow-[inset_0_0_25px_rgba(0,0,0,0.8)]">
          {activeBanners.map((banner, index) => {
            const isActive = index === currentIndex;
            const destinationUrl = (banner.destinationUrl || banner.ctaLink || '').trim();
            const isClickable = Boolean(destinationUrl && isSafeUrl(destinationUrl));
            const bannerName = banner.name || banner.title || `Banner ${index + 1}`;

            return (
              <div
                key={banner.id || `banner-${index}`}
                onClick={(e) => isClickable && handleBannerClick(banner, e)}
                role={isClickable ? 'button' : undefined}
                tabIndex={isClickable && isActive ? 0 : -1}
                onKeyDown={(e) => {
                  if (isClickable && isActive && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    handleBannerClick(banner, e as any);
                  }
                }}
                title={isClickable && destinationUrl ? `Open: ${destinationUrl}` : undefined}
                className={`absolute inset-0 w-full h-full transition-all duration-700 ease-in-out ${
                  isActive
                    ? 'opacity-100 z-10 scale-100 pointer-events-auto'
                    : 'opacity-0 z-0 scale-[1.01] pointer-events-none'
                } ${isClickable ? 'cursor-pointer' : 'cursor-default'} focus:outline-none focus:ring-2 focus:ring-amber-400/80 focus:ring-inset`}
              >
                {/* Pure Image Only Presentation (No text, no badges, no overlays) */}
                <picture className="w-full h-full block">
                  {/* Mobile Artwork (max-width: 768px) */}
                  {banner.mobileImageUrl && (
                    <source
                      media="(max-width: 768px)"
                      srcSet={banner.mobileImageUrl}
                    />
                  )}
                  {/* Tablet Artwork (max-width: 1024px) */}
                  {banner.tabletImageUrl && (
                    <source
                      media="(max-width: 1024px)"
                      srcSet={banner.tabletImageUrl}
                    />
                  )}
                  {/* Desktop Artwork */}
                  <img
                    src={banner.desktopImageUrl}
                    alt={bannerName}
                    className="w-full h-full object-cover object-center transform transition-transform duration-700 ease-out group-hover:scale-[1.008]"
                    loading={index === 0 ? 'eager' : 'lazy'}
                  />
                </picture>
              </div>
            );
          })}
        </div>

        {/* Clean Minimalist Navigation Controls (Only rendered when 2 or more banners exist) */}
        {bannerCount > 1 && (
          <>
            {/* Previous Slide Chevron Button */}
            <button
              type="button"
              aria-label="Previous Slide"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handlePrevSlide();
              }}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-black/60 hover:bg-black/85 border border-white/20 hover:border-amber-400 text-white hover:text-amber-400 flex items-center justify-center backdrop-blur-md opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            {/* Next Slide Chevron Button */}
            <button
              type="button"
              aria-label="Next Slide"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleNextSlide();
              }}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-black/60 hover:bg-black/85 border border-white/20 hover:border-amber-400 text-white hover:text-amber-400 flex items-center justify-center backdrop-blur-md opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            {/* Clean, discreet pagination indicators */}
            <div
              role="tablist"
              aria-label="Banner slide indicators"
              className="absolute bottom-2.5 sm:bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/10"
            >
              {activeBanners.map((_, i) => (
                <button
                  key={`dot-${i}`}
                  type="button"
                  role="tab"
                  aria-selected={currentIndex === i}
                  aria-label={`Go to banner slide ${i + 1}`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSelectSlide(i);
                  }}
                  className={`transition-all duration-300 rounded-full focus:outline-none focus:ring-1 focus:ring-amber-400 ${
                    currentIndex === i
                      ? 'w-5 sm:w-6 h-1.5 bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.6)]'
                      : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/80'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
};
