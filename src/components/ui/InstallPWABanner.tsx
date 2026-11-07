import React, { useState, useEffect } from 'react';
import { Download, X, Sparkles } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { PupLumeAntigravityInstallModal } from '../pwa/PupLumeAntigravityInstallModal';

export const InstallPWABanner: React.FC = () => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [isDismissed, setIsDismissed] = useState(false);
  const [showRichModal, setShowRichModal] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem('puplume_pwa_banner_dismissed') === 'true';
    if (dismissed) {
      setIsDismissed(true);
    }
  }, []);

  // Suppress if already running in standalone PWA mode or dismissed
  if (isInstalled || isDismissed) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const outcome = await install();
      if (outcome) {
        setIsDismissed(true);
      }
    } else {
      setShowRichModal(true);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem('puplume_pwa_banner_dismissed', 'true');
  };

  return (
    <>
      <aside
        id="pwa-install-banner"
        aria-label="Install PupLume App"
        className="relative z-30 bg-gradient-to-r from-[#FFF4E8] via-[#FFF9F2] to-[#F7ECE1] border-b border-[#E8DDD3] px-3.5 py-2.5 shadow-2xs"
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative shrink-0">
              <img
                src="/pwa-192x192.png"
                alt="PupLume PWA"
                className="w-8 h-8 rounded-xl border border-[#D1C2B4] shadow-xs object-cover"
              />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full border border-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <p className="text-xs font-bold text-[#2C211B] truncate">
                  Install PupLume App
                </p>
                <span className="hidden sm:inline-flex text-[10px] bg-[#E9B89C]/30 text-[#8B5E3C] font-semibold px-2 py-0.5 rounded-full">
                  Clean Premium PWA
                </span>
              </div>
              <p className="text-[11px] text-[#7A6B63] truncate hidden xs:block">
                Add to your home screen for instant 1-tap logging and offline tracking.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              id="pwa-install-cta-btn"
              onClick={handleInstallClick}
              className="flex items-center gap-1.5 bg-[#8B5E3C] hover:bg-[#734927] text-white font-semibold text-xs px-3.5 py-1.5 rounded-xl shadow-xs transition-transform active:scale-95 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install</span>
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              aria-label="Dismiss banner"
              className="p-1 rounded-lg text-[#A2948A] hover:text-[#2C211B] hover:bg-[#F3E7DA]/50 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Google Antigravity-style Rich Modal */}
      <PupLumeAntigravityInstallModal
        isOpen={showRichModal}
        onClose={() => setShowRichModal(false)}
      />
    </>
  );
};
