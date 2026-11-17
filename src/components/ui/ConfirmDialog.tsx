import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { Button } from './Button';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
}

/**
 * Senior UI/UX Confirmation Dialog
 * Implements Case 39 (Explicit action verbs, never generic OK/Cancel)
 * Implements Case 44 (Semantic destructive styling isolated from cancel)
 * Implements Rule 1 (Concentric Corner geometry R_inner = R_outer - Padding)
 * Implements Rule 5 (44x44 minimum touch targets)
 */
export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Delete',
  cancelLabel = 'Keep',
  isDestructive = true,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = 'unset';
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop with subtle blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            aria-hidden="true"
          />

          {/* Dialog Card */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 8 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 8 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-sm rounded-2xl bg-white p-5 border border-[#E8DDD3] shadow-[0_12px_40px_rgba(0,0,0,0.12)] space-y-4 z-10"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
            aria-describedby="confirm-dialog-description"
          >
            {/* Close Button (44x44 Touch Target) */}
            <button
              onClick={onClose}
              className="absolute top-3.5 right-3.5 min-w-[44px] min-h-[44px] flex items-center justify-center -m-2 p-2 text-[#766A63] hover:text-[#2C211B] rounded-lg transition-colors cursor-pointer"
              aria-label="Close dialog"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Icon & Title */}
            <div className="flex items-start gap-3.5 pr-6">
              <div
                className={`p-2.5 rounded-xl shrink-0 ${
                  isDestructive ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-800'
                }`}
              >
                {isDestructive ? <Trash2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
              </div>
              <div>
                <h3 id="confirm-dialog-title" className="text-base font-extrabold text-[#2C211B] leading-snug">
                  {title}
                </h3>
                <p id="confirm-dialog-description" className="text-xs text-[#766A63] mt-1 leading-relaxed">
                  {description}
                </p>
              </div>
            </div>

            {/* Actions: Primary Explicit Verb vs Safe Keep Verb */}
            <div className="flex items-center gap-2 pt-2 border-t border-[#E8DDD3]/60">
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                className="flex-1 min-h-[44px] font-bold text-xs"
              >
                {cancelLabel}
              </Button>
              <Button
                variant={isDestructive ? 'danger' : 'primary'}
                size="sm"
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className="flex-1 min-h-[44px] font-bold text-xs"
              >
                {confirmLabel}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
