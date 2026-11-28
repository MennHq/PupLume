import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, RotateCcw, X } from 'lucide-react';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

interface ToastNotificationProps {
  isOpen: boolean;
  message: string;
  onClose: () => void;
  action?: ToastAction;
  onUndo?: () => void;
  undoLabel?: string;
  durationMs?: number;
}

/**
 * Senior UI/UX Reversible Undo Toast Notification
 * Implements Case 15 (Undo Toast vs Blocking Modals)
 * Implements Case 38 (Mobile Thumb Zone - Bottom center placement)
 * Implements Rule 5 (44x44 minimum touch target on Undo action)
 */
export const ToastNotification: React.FC<ToastNotificationProps> = ({
  isOpen,
  message,
  onClose,
  action,
  onUndo,
  undoLabel = 'Undo',
  durationMs = 5000,
}) => {
  const effectiveAction = action || (onUndo ? { label: undoLabel, onClick: onUndo } : undefined);
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      onClose();
    }, durationMs);
    return () => clearTimeout(timer);
  }, [isOpen, durationMs, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.96 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom,0px))] md:bottom-6 inset-x-4 max-w-sm mx-auto z-50 bg-[#2C211B] text-white px-4 py-2.5 rounded-2xl shadow-[0_12px_36px_rgba(0,0,0,0.22)] border border-[#E8DDD3]/20 flex items-center justify-between gap-3 pointer-events-auto"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-xs font-semibold truncate text-[#F3E7DA]">{message}</span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {effectiveAction && (
              <button
                type="button"
                onClick={() => {
                  effectiveAction.onClick();
                  onClose();
                }}
                className="min-h-[44px] min-w-[44px] px-2.5 flex items-center justify-center gap-1 text-xs font-extrabold text-amber-300 hover:text-amber-200 transition-all active:scale-95 cursor-pointer rounded-lg hover:bg-white/10"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{effectiveAction.label}</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center p-1 text-white/60 hover:text-white transition-all active:scale-95 cursor-pointer rounded-lg"
              aria-label="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
