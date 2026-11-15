import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Check, X, Shield, Lock, Loader2 } from 'lucide-react';
import { Button } from './Button';
import { useUser } from '@clerk/react';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { initializePaddle, Paddle } from '@paddle/paddle-js';

const PADDLE_CLIENT_TOKEN = import.meta.env.VITE_PADDLE_CLIENT_TOKEN || "test_b503a3450cb3219fa5267a7ef42";
const PADDLE_PRICE_ID = import.meta.env.VITE_PADDLE_PRICE_ID || "pri_01m43jma0epjpm0dhn9k3rbp47";
const PADDLE_ENVIRONMENT = PADDLE_CLIENT_TOKEN.startsWith("live_") ? "production" : "sandbox";

interface ProPaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName: string;
}

export const ProPaywallModal: React.FC<ProPaywallModalProps> = ({ isOpen, onClose, featureName }) => {
  const { user } = useUser();
  const userEmail = user?.primaryEmailAddress?.emailAddress || '';
  const confirmSuccessMutation = useMutation(api.users.confirmCheckoutSuccess);

  const [, setPaddle] = useState<Paddle>();
  const [isProcessing, setIsProcessing] = useState(false);
  const paddleRef = useRef<Paddle | undefined>(undefined);
  const initialized = useRef(false);

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

  // Initialize Paddle.js
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    initializePaddle({
      environment: PADDLE_ENVIRONMENT,
      token: PADDLE_CLIENT_TOKEN,
      eventCallback: function(data) {
        if (data.name === "checkout.completed") {
          setIsProcessing(true);
          if (paddleRef.current) {
            paddleRef.current.Checkout.close();
          }

          if (typeof window !== 'undefined') {
            if (user?.id) localStorage.setItem(`puplume_access_${user.id}`, 'true');
            if (userEmail) localStorage.setItem(`puplume_access_${userEmail.trim().toLowerCase()}`, 'true');
          }

          const txnId = (data as any)?.data?.id || (data as any)?.data?.transaction_id;
          confirmSuccessMutation({
            userId: user?.id,
            email: userEmail.trim().toLowerCase(),
            transactionId: txnId,
          })
            .catch((err) => console.debug('[ProPaywallModal] Confirm checkout error:', err))
            .finally(() => {
              setIsProcessing(false);
              onClose();
              if (typeof window !== 'undefined') window.location.reload();
            });
        }
      }
    }).then((instance) => {
      if (instance) {
        setPaddle(instance);
        paddleRef.current = instance;
      }
    });
  }, [confirmSuccessMutation, user?.id, userEmail, onClose]);

  if (!isOpen) return null;

  const handleUpgrade = () => {
    setIsProcessing(true);
    if (paddleRef.current) {
      paddleRef.current.Checkout.open({
        settings: {
          displayMode: 'overlay',
          theme: 'light',
          locale: 'en',
        },
        items: [{ priceId: PADDLE_PRICE_ID, quantity: 1 }],
        customer: userEmail ? { email: userEmail } : undefined,
        customData: userEmail ? { email: userEmail } : undefined,
      });
      setIsProcessing(false);
    } else {
      setTimeout(() => {
        setIsProcessing(false);
      }, 1200);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="pro-paywall-title"
      >
        {/* Header */}
        <div className="relative bg-gradient-to-br from-[#8B5E3C] to-[#5F3E29] p-8 text-center text-white">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors cursor-pointer text-white"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="mx-auto w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-4 border border-white/20 shadow-inner">
            <Lock className="w-8 h-8 text-[#F3E7DA]" />
          </div>
          
          <h2 id="pro-paywall-title" className="text-2xl font-bold mb-2">Unlock {featureName}</h2>
          <p className="text-sm text-white/80 max-w-xs mx-auto">
            Upgrade to PupLume Pro to access premium features and give your puppy the best care possible.
          </p>
        </div>

        {/* Pricing & Features */}
        <div className="p-6">
          <div className="flex items-baseline justify-center gap-1 mb-6">
            <span className="text-4xl font-extrabold text-[#2C211B]">$4.99</span>
            <span className="text-sm font-semibold text-[#766A63]">/ month</span>
          </div>

          <div className="space-y-4 mb-8">
            <FeatureRow text="Unlimited AI Co-Pilot chat" />
            <FeatureRow text="Full access to Training Academy" />
            <FeatureRow text="Advanced health & growth analytics" />
            <FeatureRow text="Priority support & cloud backup" />
          </div>

          <Button 
            variant="primary" 
            className="w-full h-14 text-lg font-bold shadow-xl shadow-[#8B5E3C]/20"
            onClick={handleUpgrade}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Preparing Checkout...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Upgrade to Pro
              </>
            )}
          </Button>
          
          <p className="text-center text-[11px] text-[#A69B95] mt-4 flex items-center justify-center gap-1.5 font-medium">
            <Shield className="w-3.5 h-3.5 text-emerald-600" /> Secure 256-bit billing powered by Paddle • Cancel anytime
          </p>
        </div>
      </div>
    </div>
  );
};

const FeatureRow = ({ text }: { text: string }) => (
  <div className="flex items-start gap-3">
    <div className="mt-0.5 w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
      <Check className="w-3 h-3 text-emerald-600 font-bold" />
    </div>
    <span className="text-sm font-medium text-[#4A3B32]">{text}</span>
  </div>
);
