import React, { useState, useEffect, useRef } from 'react';
import { WifiOff, RotateCw, CheckCircle2, ChevronRight, CloudUpload } from 'lucide-react';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { OfflinePageModal } from './OfflinePageModal';
import { offlineQueue } from '../../lib/offlineQueue';

export const OfflineAlert: React.FC = () => {
  const { isOnline, isChecking, wasOffline, checkConnection } = useNetworkStatus();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showReconnectedToast, setShowReconnectedToast] = useState(false);
  const [flushedCount, setFlushedCount] = useState<number | null>(null);
  const [queuedCount, setQueuedCount] = useState<number>(() => offlineQueue.getCount());
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Listen to offline mutation queue changes
  useEffect(() => {
    return offlineQueue.subscribe((count) => {
      setQueuedCount(count);
    });
  }, []);

  // Listen to queue flushed event
  useEffect(() => {
    const handleFlushed = (e: Event) => {
      const customEvt = e as CustomEvent<{ count?: number }>;
      const count = customEvt.detail?.count || 0;
      if (count > 0) {
        setFlushedCount(count);
        setShowReconnectedToast(true);
        if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
        toastTimerRef.current = setTimeout(() => {
          setShowReconnectedToast(false);
          setFlushedCount(null);
          toastTimerRef.current = null;
        }, 5000);
      }
    };

    window.addEventListener('offline-queue-flushed', handleFlushed);
    return () => {
      window.removeEventListener('offline-queue-flushed', handleFlushed);
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  // If reconnected after being offline, show brief reassuring toast
  useEffect(() => {
    if (isOnline && wasOffline && !flushedCount) {
      setShowReconnectedToast(true);
      const timer = setTimeout(() => {
        setShowReconnectedToast(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline, flushedCount]);

  // When back online, reset modal
  useEffect(() => {
    if (isOnline) {
      setIsModalOpen(false);
    }
  }, [isOnline]);

  // 1. Brief reconnected toast
  if (showReconnectedToast && isOnline) {
    return (
      <aside 
        aria-label="Internet connection restored"
        className="fixed top-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full bg-emerald-700 px-4 py-2 text-xs font-bold text-white shadow-xl animate-in fade-in slide-in-from-top-3 duration-300"
      >
        <CheckCircle2 className="w-4 h-4 text-emerald-200" />
        <span>
          {flushedCount && flushedCount > 0 
            ? `Internet restored — Synced ${flushedCount} offline change${flushedCount > 1 ? 's' : ''} to PupLume Cloud!`
            : 'Internet connection restored — PupLume is online'}
        </span>
      </aside>
    );
  }

  // 2. SHOW THIS ONLY WHEN THE USER IS OFFLINE
  if (isOnline) {
    return null;
  }

  return (
    <>
      {/* Sticky Top Internet Connection Alert Banner */}
      <aside
        role="alert"
        aria-live="assertive"
        className="sticky top-0 z-50 w-full bg-gradient-to-r from-[#8B5E3C] via-[#7B5132] to-[#6A4328] text-white px-3 sm:px-4 py-2.5 shadow-md border-b border-[#A06E47] animate-in fade-in slide-in-from-top duration-300"
      >
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4 text-xs">
          {/* Alert Message */}
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-300 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400"></span>
            </span>

            <div className="flex items-center gap-1.5 shrink-0 p-1 rounded-md bg-black/20">
              <WifiOff className="w-3.5 h-3.5 text-amber-300" />
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <strong className="font-bold text-white tracking-wide">
                Offline Mode:
              </strong>
              <span className="text-[#F5EAE0]">
                {queuedCount > 0 
                  ? `${queuedCount} change${queuedCount > 1 ? 's' : ''} safely queued in offline storage.`
                  : 'You are currently disconnected. All data is cached locally.'}
              </span>
              {queuedCount > 0 ? (
                <span className="inline-flex items-center gap-1 text-[11px] bg-amber-400/20 text-amber-200 px-2 py-0.5 rounded-full font-semibold border border-amber-300/30">
                  <CloudUpload className="w-3 h-3 text-amber-300" />
                  Auto-syncs on reconnect
                </span>
              ) : (
                <span className="hidden md:inline text-[11px] bg-white/15 px-2 py-0.5 rounded-full text-amber-200 font-medium">
                  Offline safe
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
            <button
              onClick={() => checkConnection()}
              disabled={isChecking}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-[#2C211B] font-bold text-xs hover:bg-[#FFF4E8] active:scale-95 transition-all shadow-xs cursor-pointer disabled:opacity-60"
              title="Test internet connection"
            >
              <RotateCw className={`w-3.5 h-3.5 text-[#8B5E3C] ${isChecking ? 'animate-spin' : ''}`} />
              <span>{isChecking ? 'Checking...' : 'Try Reconnecting'}</span>
            </button>

            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-black/25 text-white font-semibold text-xs hover:bg-black/35 transition-colors cursor-pointer"
            >
              <span>Troubleshoot</span>
              <ChevronRight className="w-3.5 h-3.5 text-amber-300" />
            </button>
          </div>
        </div>
      </aside>

      {/* Troubleshooting Modal */}
      <OfflinePageModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRetry={checkConnection}
        isChecking={isChecking}
      />
    </>
  );
};
