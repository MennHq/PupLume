import React, { useState, useEffect } from 'react';
import { 
  WifiOff, 
  RotateCw, 
  CheckCircle2, 
  ShieldCheck, 
  Smartphone, 
  Radio, 
  PlaneTakeoff, 
  X,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { PupLumeLogo } from '../common/PupLumeLogo';

interface OfflinePageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRetry: () => Promise<boolean>;
  isChecking: boolean;
}

export const OfflinePageModal: React.FC<OfflinePageModalProps> = ({
  isOpen,
  onClose,
  onRetry,
  isChecking,
}) => {
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; message: string } | null>(null);

  // Keyboard Escape and Scroll Lock
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = prevOverflow;
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleRetry = async () => {
    setFeedback(null);
    const connected = await onRetry();
    if (connected) {
      setFeedback({
        type: 'success',
        message: 'Internet connection detected! Syncing with PupLume cloud...',
      });
      setTimeout(() => {
        onClose();
      }, 1200);
    } else {
      setFeedback({
        type: 'error',
        message: 'Still offline. Please verify your Wi-Fi, cellular, or router connection and try again.',
      });
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg bg-white rounded-3xl border border-[#E8DDD3] shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="offline-modal-title"
      >
        {/* Header bar */}
        <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-[#F3E7DA] bg-[#FFF9F2]">
          <div className="flex items-center gap-2.5">
            <PupLumeLogo variant="icon" size="sm" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#8B5E3C]">
              PupLume Offline Mode
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#766A63] hover:text-[#2C211B] hover:bg-[#F3E7DA] transition-colors"
            title="Continue in offline mode"
            aria-label="Close offline modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-7 overflow-y-auto space-y-6">
          {/* Main Visual */}
          <div className="text-center">
            {/* Status Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold mb-4">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              <span>Fully Disconnected from Internet</span>
            </div>

            {/* Icon Graphic */}
            <div className="relative w-20 h-20 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-[#FFF4E8] to-[#F5EAE0] border-2 border-dashed border-[#8B5E3C]/30 flex items-center justify-center shadow-inner">
              <WifiOff className="w-10 h-10 text-[#8B5E3C]" />
              <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center border-2 border-white shadow-xs">
                <Radio className="w-3.5 h-3.5" />
              </div>
            </div>

            <h2 id="offline-modal-title" className="text-2xl font-black text-[#2C211B] tracking-tight">
              No Internet Connection
            </h2>
            <p className="mt-2 text-sm text-[#766A63] leading-relaxed max-w-sm mx-auto">
              You are currently offline. Please try to connect with the internet to sync puppy records, receive AI training advice, and refresh data.
            </p>
          </div>

          {/* Real-time feedback status */}
          {feedback && (
            <div
              className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2.5 transition-all ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                  : 'bg-amber-50 border border-amber-200 text-amber-800'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <WifiOff className="w-4 h-4 text-amber-600 shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}

          {/* Cached Safety Badge */}
          <div className="p-4 rounded-2xl bg-[#FFF9F2] border border-[#E8DDD3] flex items-start gap-3">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800 shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="text-left text-xs">
              <span className="font-bold text-[#2C211B] block mb-0.5">
                Saved Safely in Offline Cache
              </span>
              <p className="text-[#766A63] leading-relaxed">
                Your puppy's local schedule, potty logs, and academy curriculum remain fully cached and accessible while you are offline.
              </p>
            </div>
          </div>

          {/* Troubleshooting Checklist */}
          <div className="text-left space-y-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#766A63] px-1 block">
              Steps to try connecting with the internet:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-xl border border-[#E8DDD3] bg-white flex items-start gap-2.5">
                <Radio className="w-4 h-4 text-[#8B5E3C] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#2C211B] block">Wi-Fi Connection</strong>
                  <span className="text-[#766A63] text-[11px]">Check if Wi-Fi is enabled and connected to your network.</span>
                </div>
              </div>

              <div className="p-3 rounded-xl border border-[#E8DDD3] bg-white flex items-start gap-2.5">
                <Smartphone className="w-4 h-4 text-[#8B5E3C] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#2C211B] block">Cellular / Mobile Data</strong>
                  <span className="text-[#766A63] text-[11px]">Ensure Cellular Data switch is toggled ON.</span>
                </div>
              </div>

              <div className="p-3 rounded-xl border border-[#E8DDD3] bg-white flex items-start gap-2.5">
                <PlaneTakeoff className="w-4 h-4 text-[#8B5E3C] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#2C211B] block">Airplane Mode</strong>
                  <span className="text-[#766A63] text-[11px]">Make sure Airplane Mode is switched OFF.</span>
                </div>
              </div>

              <div className="p-3 rounded-xl border border-[#E8DDD3] bg-white flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-[#8B5E3C] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#2C211B] block">Router & Modem</strong>
                  <span className="text-[#766A63] text-[11px]">Check broadband lights or restart router if needed.</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-6 pt-3 border-t border-[#F3E7DA] bg-[#FFF9F2] flex flex-col sm:flex-row gap-2.5">
          <button
            onClick={handleRetry}
            disabled={isChecking}
            className="flex-1 py-3 px-4 rounded-xl text-sm font-bold bg-[#8B5E3C] text-white hover:bg-[#724A2D] active:scale-[0.99] transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            <RotateCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
            <span>{isChecking ? 'Checking Connection...' : 'Try Reconnecting'}</span>
          </button>

          <button
            onClick={onClose}
            className="py-3 px-4 rounded-xl text-sm font-semibold border border-[#E8DDD3] text-[#2C211B] hover:bg-[#F3E7DA] transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Continue in Offline Mode</span>
          </button>

          <a
            href="/offline.html"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center justify-center p-3 rounded-xl border border-[#E8DDD3] text-[#766A63] hover:text-[#2C211B] hover:bg-[#F3E7DA] transition-colors"
            title="View Standalone Cached Page"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
};
