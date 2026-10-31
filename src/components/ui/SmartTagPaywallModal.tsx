import React, { useState, useEffect, useRef } from 'react';
import { QrCode, Sparkles, Check, X, Shield, MapPin, Phone, Printer, HeartHandshake, Zap, Loader2 } from 'lucide-react';
import { Button } from './Button';
import { SmartCollarTagLogo } from '../common/SmartCollarTagLogo';
import { initializePaddle, Paddle } from '@paddle/paddle-js';

const PADDLE_CLIENT_TOKEN = import.meta.env.VITE_PADDLE_CLIENT_TOKEN || "live_18be309cb012891d23b474f1a7e";
const PADDLE_SMART_TAG_PRICE_ID = import.meta.env.VITE_PADDLE_SMART_TAG_PRICE_ID || "pri_01m4x67js5vkds3y6zcc18fntf";
const PADDLE_ENVIRONMENT = PADDLE_CLIENT_TOKEN.startsWith("live_") ? "production" : "sandbox";

interface SmartTagPaywallModalProps {
  isOpen: boolean;
  puppyName: string;
  puppyId?: string;
  onClose: () => void;
  onUnlock: () => void;
}

export const SmartTagPaywallModal: React.FC<SmartTagPaywallModalProps> = ({
  isOpen,
  puppyName,
  puppyId,
  onClose,
  onUnlock,
}) => {
  const [paddle, setPaddle] = useState<Paddle>();
  const [isProcessing, setIsProcessing] = useState(false);
  const paddleRef = useRef<Paddle | undefined>(undefined);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    initializePaddle({
      environment: PADDLE_ENVIRONMENT,
      token: PADDLE_CLIENT_TOKEN,
      eventCallback: (data) => {
        if (data.name === "checkout.completed") {
          setIsProcessing(true);
          if (paddleRef.current) {
            paddleRef.current.Checkout.close();
          }
          onUnlock();
          setIsProcessing(false);
        }
      },
    }).then((instance) => {
      if (instance) {
        setPaddle(instance);
        paddleRef.current = instance;
      }
    });
  }, [onUnlock]);

  if (!isOpen) return null;

  const handleOpenPaddleCheckout = () => {
    setIsProcessing(true);
    if (paddleRef.current) {
      paddleRef.current.Checkout.open({
        settings: {
          displayMode: 'overlay',
          theme: 'light',
          locale: 'en',
        },
        items: [{ priceId: PADDLE_SMART_TAG_PRICE_ID, quantity: 1 }],
        customData: {
          type: 'smart_tag_pass',
          puppyName: puppyName,
          ...(puppyId ? { puppyId } : {}),
        },
      });
      setIsProcessing(false);
    } else {
      // Fallback if Paddle instance is still loading
      setTimeout(() => {
        setIsProcessing(false);
        onUnlock();
      }, 700);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl border border-[#E8DDD3] animate-in zoom-in-95 duration-300">
        
        {/* Header Banner */}
        <div className="relative bg-gradient-to-br from-[#8B5E3C] via-[#6D492F] to-[#2C211B] p-7 text-center text-white">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors cursor-pointer text-white"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex justify-center mb-3.5">
            <SmartCollarTagLogo variant="icon" size="xl" className="drop-shadow-lg" />
          </div>
          
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-400/20 border border-amber-300/30 text-amber-200 text-xs font-bold rounded-full mb-2">
            <Zap className="w-3.5 h-3.5 text-amber-300" />
            <span>Smart Pet Protection Feature</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black mb-1.5 tracking-tight">
            Smart Collar Tag & Safety Page
          </h2>
          <p className="text-xs sm:text-sm text-[#F3E7DA] max-w-sm mx-auto leading-relaxed">
            A scannable emergency webpage for <span className="font-bold underline decoration-amber-400">{puppyName}</span>. Anyone who finds your pup can contact you with 1 tap.
          </p>
        </div>

        {/* Pricing & Feature List */}
        <div className="p-6 sm:p-7 space-y-6">
          {/* Price Box */}
          <div className="bg-[#FFF9F2] border-2 border-[#8B5E3C]/30 rounded-2xl p-4 text-center">
            <div className="flex items-baseline justify-center gap-1.5">
              <span className="text-4xl sm:text-5xl font-black text-[#2C211B] tracking-tight">$1.99</span>
              <span className="text-xs font-bold text-[#8B5E3C] uppercase tracking-wider">one-time micro-pass</span>
            </div>
            <p className="text-xs text-[#766A63] mt-1 font-medium">
              No monthly subscription • Never expires • Zero batteries required
            </p>
          </div>

          {/* Features */}
          <div className="space-y-3">
            <FeatureItem
              icon={<Phone className="w-4 h-4 text-emerald-600" />}
              title="1-Tap Instant Call & SMS"
              description="Good Samaritans can call or text your phone immediately without typing numbers."
            />
            <FeatureItem
              icon={<MapPin className="w-4 h-4 text-blue-600" />}
              title="1-Tap GPS Finder Ping"
              description="The finder can send you a precise Google Maps GPS pin of where your pup was spotted."
            />
            <FeatureItem
              icon={<Printer className="w-4 h-4 text-amber-600" />}
              title="Printable QR Tag & Missing Pet Poster"
              description="1-click printable collar badge for pet holders + high-visibility lost dog flyer."
            />
            <FeatureItem
              icon={<HeartHandshake className="w-4 h-4 text-[#8B5E3C]" />}
              title="Emergency Medical & Microchip Card"
              description="Displays emergency vet clinic, allergies, medications, and microchip ID safely."
            />
          </div>

          {/* Buttons */}
          <div className="space-y-2 pt-1">
            <Button
              variant="primary"
              className="w-full h-13 text-base font-bold shadow-lg shadow-[#8B5E3C]/20 hover:scale-[1.01] active:scale-[0.99] transition-all"
              onClick={handleOpenPaddleCheckout}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Opening Paddle Checkout...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  Unlock for $1.99 Lifetime
                </span>
              )}
            </Button>

            <button
              onClick={onClose}
              className="w-full py-2 text-xs font-bold text-[#766A63] hover:text-[#2C211B] transition-colors cursor-pointer"
            >
              Maybe Later
            </button>

            {/* Sandbox / Dev Test Unlock Link */}
            <div className="pt-2 border-t border-[#E8DDD3]/60 text-center">
              <button
                type="button"
                onClick={() => {
                  onUnlock();
                  onClose();
                }}
                className="text-[11px] text-amber-700/80 hover:text-amber-900 font-semibold underline cursor-pointer"
              >
                ⚡ Sandbox Dev Unlock (Skip payment)
              </button>
            </div>
          </div>

          <p className="text-center text-[10px] text-[#A69B95] flex items-center justify-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            100% Satisfaction Guarantee • Protects your puppy anywhere in the world
          </p>
        </div>
      </div>
    </div>
  );
};

const FeatureItem = ({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) => (
  <div className="flex items-start gap-3 bg-[#FAF6F0]/60 p-2.5 rounded-xl border border-[#E8DDD3]/60">
    <div className="p-2 bg-white rounded-lg border border-[#E8DDD3] shadow-2xs shrink-0">
      {icon}
    </div>
    <div className="text-left">
      <h4 className="text-xs font-bold text-[#2C211B] leading-snug">{title}</h4>
      <p className="text-[11px] text-[#766A63] leading-relaxed mt-0.5">{description}</p>
    </div>
  </div>
);
