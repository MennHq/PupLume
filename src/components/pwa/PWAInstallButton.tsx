import React from 'react';
import { Download } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'primary' | 'outline' | 'minimal';
  className?: string;
  showIconOnly?: boolean;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'primary',
  className = '',
  showIconOnly = false,
}) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();

  // If running inside PWA or not installable, don't show
  if (isInstalled || !isInstallable) {
    return null;
  }

  const handleInstallClick = async () => {
    await install();
  };

  const getBaseClasses = () => {
    if (variant === 'primary') {
      return 'bg-gradient-to-r from-[#A27046] to-[#734927] text-white hover:opacity-95 shadow-sm active:scale-95';
    }
    if (variant === 'outline') {
      return 'border border-[#D1C2B4] text-[#4A3B32] hover:bg-[#F3E7DA]/50 bg-white/80 backdrop-blur-xs';
    }
    return 'text-[#8B5E3C] hover:bg-[#F3E7DA]/50';
  };

  return (
    <button
      type="button"
      id="pwa-install-btn"
      onClick={handleInstallClick}
      title="Install PupLume to your home screen"
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer ${getBaseClasses()} ${className}`}
    >
      <Download className="w-3.5 h-3.5" />
      {!showIconOnly && <span>Install App</span>}
    </button>
  );
};
