import React, { useState } from 'react';
import { AdLocation, AdSlotConfig, AdSlotItem } from '../types';
import { useShow } from '../context/ShowContext';

interface AdSlotContainerProps {
  location?: AdLocation;
  slot?: AdSlotItem;
  config?: AdSlotConfig;
  slotName?: string;
  className?: string;
}

export const AdSlotContainer: React.FC<AdSlotContainerProps> = ({
  location,
  slot,
  config,
  slotName,
  className = '',
}) => {
  const { siteSettings } = useShow();
  const [hasError, setHasError] = useState(false);

  // Find the target ad slot:
  // 1. Direct slot passed
  // 2. Lookup by location from siteSettings.adSlots
  // 3. Fallback to siteSettings.adsConfig based on location or config prop
  let targetSlot: {
    enabled: boolean;
    code: string;
    desktop?: boolean;
    tablet?: boolean;
    mobile?: boolean;
    id?: string;
    name?: string;
  } | undefined = undefined;

  if (slot) {
    targetSlot = slot;
  } else if (location && siteSettings?.adSlots && Array.isArray(siteSettings.adSlots)) {
    const found = siteSettings.adSlots
      .filter((s) => s.location === location && s.enabled && s.code && s.code.trim().length > 0)
      .sort((a, b) => (a.order || 0) - (b.order || 0))[0];
    if (found) {
      targetSlot = found;
    }
  }

  // Fallback to legacy config if not found
  if (!targetSlot) {
    if (config && config.enabled && config.code && config.code.trim()) {
      targetSlot = config;
    } else if (location === 'header' && siteSettings?.adsConfig?.headerAd?.enabled && siteSettings.adsConfig.headerAd.code?.trim()) {
      targetSlot = siteSettings.adsConfig.headerAd;
    } else if (location === 'footer' && siteSettings?.adsConfig?.footerAd?.enabled && siteSettings.adsConfig.footerAd.code?.trim()) {
      targetSlot = siteSettings.adsConfig.footerAd;
    } else if ((location === 'banner' || location === 'homepage') && siteSettings?.adsConfig?.bannerAd?.enabled && siteSettings.adsConfig.bannerAd.code?.trim()) {
      targetSlot = siteSettings.adsConfig.bannerAd;
    }
  }

  if (!targetSlot || !targetSlot.enabled || !targetSlot.code || !targetSlot.code.trim() || hasError) {
    return null;
  }

  const showOnDesktop = targetSlot.desktop !== false;
  const showOnTablet = targetSlot.tablet !== false;
  const showOnMobile = targetSlot.mobile !== false;

  // Build responsive device visibility classes
  let deviceVisibilityClass = '';
  if (!showOnMobile && !showOnTablet && !showOnDesktop) {
    return null;
  }
  if (!showOnMobile && showOnTablet && showOnDesktop) {
    deviceVisibilityClass = 'hidden md:flex';
  } else if (!showOnMobile && !showOnTablet && showOnDesktop) {
    deviceVisibilityClass = 'hidden lg:flex';
  } else if (showOnMobile && !showOnTablet && !showOnDesktop) {
    deviceVisibilityClass = 'flex md:hidden';
  } else if (showOnMobile && showOnTablet && !showOnDesktop) {
    deviceVisibilityClass = 'flex lg:hidden';
  } else if (!showOnMobile && showOnTablet && !showOnDesktop) {
    deviceVisibilityClass = 'hidden md:flex lg:hidden';
  } else if (showOnMobile && !showOnTablet && showOnDesktop) {
    deviceVisibilityClass = 'flex md:hidden lg:flex';
  } else {
    deviceVisibilityClass = 'flex';
  }

  const slotIdentifier = slot?.id || slotName || location || 'ad';

  // Safe isolated HTML document for the Adsterra ad snippet
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          html, body {
            background: transparent;
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          }
          img { max-width: 100%; height: auto; display: block; margin: 0 auto; }
          iframe { max-width: 100%; }
          #ad-wrapper {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
          }
        </style>
      </head>
      <body>
        <div id="ad-wrapper">
          ${targetSlot.code}
        </div>
        <script>
          window.onerror = function() {
            // Silently absorb third party ad script runtime errors
            return true;
          };
        </script>
      </body>
    </html>
  `;

  return (
    <aside
      id={`ad-slot-${slotIdentifier}`}
      aria-label={`Sponsored Content - ${slotIdentifier}`}
      className={`w-full ${deviceVisibilityClass} flex-col items-center justify-center my-4 transition-opacity duration-300 ${className}`}
    >
      <div className="w-full max-w-5xl mx-auto px-4 flex flex-col items-center">
        {/* Subtle Ad Disclaimer */}
        <div className="text-[10px] uppercase font-bold tracking-widest text-zinc-500/80 mb-1 flex items-center gap-1">
          <span>Advertisement</span>
        </div>

        {/* Sandboxed Ad Isolation Frame */}
        <div className="w-full flex justify-center overflow-hidden rounded-xl border border-white/10 bg-black/40 backdrop-blur-sm p-1 shadow-md">
          <iframe
            srcDoc={htmlContent}
            title={`Adsterra Ad Slot ${slotIdentifier}`}
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
            loading="lazy"
            onError={() => setHasError(true)}
            className="w-full min-h-[60px] sm:min-h-[90px] md:min-h-[100px] border-0 overflow-hidden"
            style={{ border: 'none' }}
          />
        </div>
      </div>
    </aside>
  );
};

