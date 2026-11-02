import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  isBottomSheet?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'md',
  isBottomSheet = true
}) => {
  const touchStartY = React.useRef(0);
  const touchCurrentY = React.useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchCurrentY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = () => {
    const diff = touchCurrentY.current - touchStartY.current;
    if (diff > 70) {
      onClose();
    }
    touchStartY.current = 0;
    touchCurrentY.current = 0;
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const maxWidthClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl'
  }[maxWidth];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#2C211B]/40 backdrop-blur-xs transition-opacity"
          />

          {/* Content Sheet / Dialog */}
          <motion.div
            initial={isBottomSheet ? { y: '100%', opacity: 0.8 } : { scale: 0.95, opacity: 0 }}
            animate={isBottomSheet ? { y: 0, opacity: 1 } : { scale: 1, opacity: 1 }}
            exit={isBottomSheet ? { y: '100%', opacity: 0 } : { scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className={`relative z-10 w-full ${maxWidthClass} bg-white rounded-t-3xl sm:rounded-2xl border border-[#E8DDD3] shadow-xl overflow-hidden max-h-[92vh] flex flex-col`}
          >
            {/* Mobile Grab Bar with Swipe-to-Dismiss */}
            <div
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className="sm:hidden pt-3 pb-2 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing touch-none select-none"
              title="Swipe down to close"
            >
              <div className="w-14 h-1.5 bg-[#D4C3B3] hover:bg-[#8B5E3C] rounded-full transition-colors" />
            </div>

            {/* Header */}
            {(title || subtitle) && (
              <div
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                className="flex items-start justify-between px-5 pt-3 sm:pt-5 pb-3 border-b border-[#E8DDD3]/60 cursor-grab active:cursor-grabbing"
              >
                <div>
                  {title && <h3 className="text-lg font-bold text-[#2C211B] leading-snug">{title}</h3>}
                  {subtitle && <p className="text-xs text-[#766A63] mt-0.5">{subtitle}</p>}
                </div>
                <button
                  id="modal-close-button"
                  onClick={onClose}
                  className="p-2 -mr-2 text-[#766A63] hover:text-[#2C211B] rounded-full hover:bg-[#F3E7DA]/60 transition-colors cursor-pointer"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Body */}
            <div className="p-5 overflow-y-auto flex-1">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
