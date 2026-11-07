import React from 'react';
import { Download, X } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface PupLumeAntigravityInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PupLumeAntigravityInstallModal: React.FC<PupLumeAntigravityInstallModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { isInstallable, install, isIOS } = usePWAInstall();

  if (!isOpen) return null;

  const handleInstall = async () => {
    if (isInstallable) {
      await install();
      onClose();
    } else if (isIOS) {
      alert("To install PupLume on iOS: Tap the Share button at the bottom of Safari, then select 'Add to Home Screen'.");
    } else {
      // In case browser prompt is blocked, guide them
      alert("To install PupLume: Tap your browser's menu (three dots in top right) and select 'Install app' or 'Add to Home Screen'.");
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Bottom sheet on mobile, centered modal on desktop — styled after Google Antigravity */}
      <div 
        className="w-full max-w-md bg-[#1B120C] text-[#FFF9F2] rounded-t-3xl sm:rounded-3xl border-t sm:border border-[#3E2718] shadow-2xl p-5 pb-8 sm:p-6 space-y-4 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Drag Handle */}
        <div className="w-12 h-1 bg-[#4A3222] rounded-full mx-auto mb-2" />

        {/* Header: Icon, Titles & Cyan Install Pill */}
        <div className="flex items-center justify-between gap-3 pt-1">
          {/* Logo & Domain */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-[#2A1A10] border border-[#523520] p-1.5 flex items-center justify-center shrink-0 shadow-md">
              <img 
                src="/icon.svg" 
                alt="PupLume" 
                className="w-full h-full object-contain"
              />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-bold text-[#FFF8F0] tracking-tight truncate">
                PupLume
              </h3>
              <p className="text-xs text-[#A2948A] truncate font-medium">
                puplumepet.vercel.app
              </p>
            </div>
          </div>

          {/* Cyan Install Pill (identical to Google Antigravity) */}
          <button
            type="button"
            onClick={handleInstall}
            className="bg-[#4EE2EC] hover:bg-[#38CAD4] text-[#052225] font-bold text-sm px-5 py-2 rounded-full shadow-lg transition-transform active:scale-95 shrink-0 cursor-pointer flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>Install</span>
          </button>
        </div>

        {/* Personalized Description: Clean Premium */}
        <p className="text-sm text-[#DFC5AF] leading-relaxed pt-1">
          PupLume is our clean, premium AI puppy companion platform, allowing anyone to effortlessly master potty routines, nutrition, wellness, and veterinary safety.
        </p>

        {/* Large Bespoke Preview Graphic (PupLume Mascot & Golden Lume) */}
        <div className="relative rounded-2xl overflow-hidden border border-[#3E2718] shadow-xl bg-[#120A05]">
          <img 
            src="/screenshots/puplume-mobile-preview.png" 
            alt="PupLume Clean Premium Preview" 
            className="w-full h-auto max-h-[360px] object-cover mx-auto"
          />
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#120A05]/80 via-transparent to-transparent" />
          <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#FDE68A] uppercase tracking-wider bg-[#2B190E]/90 px-2.5 py-1 rounded-full border border-[#F59E0B]/40">
              Clean Premium PWA
            </span>
            <span className="text-[11px] text-[#DFC5AF] font-medium">
              Offline Ready • 1-Tap Log
            </span>
          </div>
        </div>

        {/* Dismiss Button */}
        <div className="flex items-center justify-center pt-1">
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-semibold text-[#8B786D] hover:text-[#FFF8F0] px-4 py-2 rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
