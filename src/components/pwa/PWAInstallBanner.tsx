import React, { useState, useEffect } from 'react';
import { Download, X, Sparkles } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

export const PWAInstallBanner: React.FC = () => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if dismissed previously in session
    const isDismissed = sessionStorage.getItem('puplume_pwa_banner_dismissed') === 'true';
    if (isDismissed) {
      setDismissed(true);
    }
  }, []);

  // NEVER show if already running inside installed PWA, dismissed, or prompt not available
  if (isInstalled || dismissed || !isInstallable) {
    return null;
  }

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem('puplume_pwa_banner_dismissed', 'true');
  };

  const handleInstallClick = async () => {
    const success = await install();
    if (success) {
      setDismissed(true);
    }
  };

  return (
    <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-40 bg-[#FFF9F2] border border-[#E8DDD3] rounded-2xl shadow-xl p-4 text-[#2C211B] animate-in slide-in-from-bottom-5 duration-300">
      <div className="flex items-start gap-3">
        <div className="relative shrink-0">
          <img
            src="/pwa-192x192.png"
            alt="PupLume Icon"
            className="w-12 h-12 rounded-xl shadow-md border border-[#E8DDD3]"
          />
          <div className="absolute -top-1 -right-1 bg-amber-500 rounded-full p-0.5 text-white">
            <Sparkles className="w-3 h-3" />
          </div>
        </div>

        <div className="flex-1 min-w-0 pr-4">
          <div className="flex items-center gap-1.5">
            <h4 className="text-sm font-bold text-[#2C211B]">Install PupLume App</h4>
            <span className="text-[10px] bg-[#E9B89C]/40 text-[#5F3E29] font-medium px-1.5 py-0.5 rounded-full">PWA</span>
          </div>
          <p className="text-xs text-[#7A6B63] mt-0.5 line-clamp-2">
            Add to Home Screen for lightning-fast launch, offline schedules, and full-screen view.
          </p>

          <div className="flex items-center gap-2 mt-3">
            <button
              type="button"
              id="pwa-banner-install-btn"
              onClick={handleInstallClick}
              className="flex items-center justify-center gap-1.5 bg-[#8B5E3C] hover:bg-[#734927] text-white text-xs font-semibold px-3.5 py-1.5 rounded-xl shadow-xs transition-transform active:scale-95 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install Now</span>
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              className="text-xs font-medium text-[#7A6B63] hover:text-[#2C211B] px-2 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              Not Now
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Close install prompt"
          className="text-[#A2948A] hover:text-[#2C211B] p-1 rounded-full hover:bg-[#F3E7DA]/60 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
