import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Shield, Lock, ArrowRight, Dog, Loader2, AlertCircle } from 'lucide-react';
import { Button } from './Button';
import { useUser } from '@clerk/react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { initializePaddle, Paddle } from '@paddle/paddle-js';

// Dynamic credentials: read from env var with fallback
const PADDLE_CLIENT_TOKEN = import.meta.env.VITE_PADDLE_CLIENT_TOKEN || "test_b503a3450cb3219fa5267a7ef42";
const PADDLE_PRICE_ID = import.meta.env.VITE_PADDLE_PRICE_ID || "pri_01m43jma0epjpm0dhn9k3rbp47";
// Auto-detect production vs sandbox from token prefix
const PADDLE_ENVIRONMENT = PADDLE_CLIENT_TOKEN.startsWith("live_") ? "production" : "sandbox";

interface PaddlePaywallProps {
  onSignOut: () => void;
}

export const PaddlePaywall: React.FC<PaddlePaywallProps> = ({ onSignOut }) => {
  const { user } = useUser();
  const userEmail = user?.primaryEmailAddress?.emailAddress || '';
  
  const [paddle, setPaddle] = useState<Paddle>();
  const [isVerifying, setIsVerifying] = useState(false);
  const [showError, setShowError] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreMessage, setRestoreMessage] = useState<string | null>(null);

  const confirmSuccessMutation = useMutation(api.users.confirmCheckoutSuccess);
  const restoreAccessMutation = useMutation(api.users.restoreUserAccess);

  // Auto-restore check on mount: If this user already paid, unlock immediately!
  const hasAutoChecked = useRef(false);
  useEffect(() => {
    if (hasAutoChecked.current || !userEmail) return;
    hasAutoChecked.current = true;

    restoreAccessMutation({
      userId: user?.id,
      email: userEmail.trim().toLowerCase(),
    })
      .then((res) => {
        if (res.restored) {
          if (typeof window !== 'undefined') {
            if (user?.id) localStorage.setItem(`puplume_access_${user.id}`, 'true');
            localStorage.setItem(`puplume_access_${userEmail.trim().toLowerCase()}`, 'true');
            window.location.reload();
          }
        }
      })
      .catch((err) => {
        console.debug('[PaddlePaywall] Auto-check error:', err);
      });
  }, [userEmail, user?.id, restoreAccessMutation]);

  const handleManualRestore = async () => {
    setIsRestoring(true);
    setRestoreMessage(null);
    try {
      const res = await restoreAccessMutation({
        userId: user?.id,
        email: userEmail.trim().toLowerCase(),
      });
      if (res.restored) {
        if (typeof window !== 'undefined') {
          if (user?.id) localStorage.setItem(`puplume_access_${user.id}`, 'true');
          localStorage.setItem(`puplume_access_${userEmail.trim().toLowerCase()}`, 'true');
          window.location.reload();
        }
      } else {
        setRestoreMessage(res.message);
      }
    } catch (e: any) {
      setRestoreMessage("Unable to verify purchase status. Please ensure your connection is active or contact support.");
    } finally {
      setIsRestoring(false);
    }
  };

  const paddleRef = useRef<Paddle | undefined>(undefined);
  // Initialize Paddle.js
  const initialized = useRef(false);
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    initializePaddle({
      environment: PADDLE_ENVIRONMENT, 
      token: PADDLE_CLIENT_TOKEN,
      eventCallback: function(data) {
        if (data.name === "checkout.completed") {
          setIsVerifying(true);
          
          // Close the overlay automatically
          if (paddleRef.current) {
            paddleRef.current.Checkout.close();
          }

          // Save local access immediately so user is never locked out
          if (typeof window !== 'undefined') {
            if (user?.id) localStorage.setItem(`puplume_access_${user.id}`, 'true');
            if (userEmail) localStorage.setItem(`puplume_access_${userEmail.trim().toLowerCase()}`, 'true');
          }

          const txnId = (data as any)?.data?.id || (data as any)?.data?.transaction_id;

          // Instantly activate user access in Convex
          confirmSuccessMutation({
            userId: user?.id,
            email: userEmail.trim().toLowerCase(),
            transactionId: txnId,
          })
            .then(() => {
              if (typeof window !== 'undefined') {
                window.location.reload();
              }
            })
            .catch((err) => {
              console.debug('[PaddlePaywall] Client confirm error:', err);
              if (typeof window !== 'undefined') {
                window.location.reload();
              }
            });
        }
      }
    }).then((paddleInstance) => {
      if (paddleInstance) {
        setPaddle(paddleInstance);
        paddleRef.current = paddleInstance;
      }
    });
  }, [confirmSuccessMutation, user?.id, userEmail]);


  const [isOpeningCheckout, setIsOpeningCheckout] = useState(false);

  const openCheckout = () => {
    setIsOpeningCheckout(true);
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
      setIsOpeningCheckout(false);
    } else {
      // If paddle is still initializing, wait a moment and retry
      setTimeout(() => {
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
        }
        setIsOpeningCheckout(false);
      }, 800);
    }
  };

  const FeatureItem = ({ text }: { text: string }) => (
    <div className="flex items-center gap-3">
      <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
      </div>
      <span className="text-[#2C211B] font-medium">{text}</span>
    </div>
  );



  return (
    <div className="min-h-screen bg-[#FFF9F2] flex items-center justify-center p-4 sm:p-8">
      <div className="max-w-4xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl border border-[#F5F0EA] flex flex-col md:flex-row">
        
        {/* Left Side: Illustration / Brand */}
        <div className="md:w-5/12 bg-[#8B5E3C] p-10 flex flex-col justify-between relative overflow-hidden text-white">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          
          <div className="relative z-10 flex items-center gap-2 mb-12">
            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
              <Dog className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">PupLume</span>
          </div>

          <div className="relative z-10 space-y-6">
            <h2 className="text-3xl font-extrabold leading-tight">
              Unlock the Ultimate Puppy OS.
            </h2>
            <p className="text-white/80 font-medium leading-relaxed">
              No subscriptions. No limits. Pay once and get lifetime access to all features, including unlimited AI training advice.
            </p>
          </div>

          <div className="relative z-10 mt-12 flex items-center gap-4 text-sm font-medium text-white/70">
            <Shield className="w-5 h-5" />
            <span>Secure checkout by Paddle</span>
          </div>
        </div>

        {/* Right Side: Payment Form */}
        <div className="md:w-7/12 flex flex-col justify-between">
          
          <div className="p-8 px-10 border-b border-[#F5F0EA] flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-600 font-bold tracking-widest text-xs uppercase bg-amber-50 px-3 py-1.5 rounded-full">
              <Lock className="w-3.5 h-3.5" />
              <span>Lifetime Access</span>
            </div>
            <button onClick={onSignOut} className="text-sm font-medium text-[#766A63] hover:text-[#2C211B] transition-colors underline-offset-4 hover:underline">
              Sign out
            </button>
          </div>

          {/* Content */}
          <div className="p-8 px-10">
            
            {isVerifying && (
              <div className="mb-6 p-4 bg-amber-50 rounded-2xl border border-amber-200 flex items-center justify-center gap-3 text-amber-800 animate-pulse">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="font-semibold text-sm">Verifying your payment...</span>
              </div>
            )}

            {showError && (
              <div className="mb-6 p-4 bg-red-50 rounded-2xl border border-red-200 flex items-start gap-3 text-red-800 animate-in fade-in zoom-in duration-300">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-500" />
                <div className="text-sm font-medium">
                  <span className="font-bold block text-red-700">Payment successful, but app unlock delayed.</span>
                  Our server is waiting for Paddle to send the payment confirmation. Please refresh the page or check your email for a receipt. If the issue persists, contact support.
                </div>
              </div>
            )}

            <div className="space-y-5 mb-10">
              <FeatureItem text="Unlimited AI Co-Pilot chat" />
              <FeatureItem text="Full access to Training Academy" />
              <FeatureItem text="Unlimited Potty, Sleep & Health logging" />
              <FeatureItem text="Export to Vet reports & PDF sharing" />
            </div>

            <div className="bg-[#FFF9F2] p-6 rounded-2xl border border-[#F5F0EA] mb-8">
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-4xl font-extrabold text-[#2C211B]">$24.99</span>
                <span className="text-[#766A63] font-medium text-sm">one-time payment</span>
              </div>
              <p className="text-sm text-[#766A63] font-medium">No recurring fees. Ever.</p>
            </div>

            <Button 
              size="lg" 
              className="w-full h-14 text-base font-bold flex items-center justify-center gap-2 shadow-xl shadow-amber-600/20"
              onClick={openCheckout}
              disabled={isOpeningCheckout || isRestoring}
            >
              {isOpeningCheckout ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Opening Secure Checkout...
                </span>
              ) : (
                <>
                  Get PupLume Forever
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </Button>

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={handleManualRestore}
                disabled={isRestoring}
                className="text-xs font-semibold text-[#8B5E3C] hover:text-[#5F3E29] underline cursor-pointer disabled:opacity-50"
              >
                {isRestoring ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin inline" />
                    Checking purchase in database...
                  </span>
                ) : (
                  "Already paid? Restore Access"
                )}
              </button>
            </div>

            {restoreMessage && (
              <div className="mt-3 p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 text-center font-medium animate-in fade-in">
                {restoreMessage}
              </div>
            )}

            <p className="text-center text-xs text-[#9C928B] mt-3 font-medium">
              You are signed in as <span className="text-[#2C211B] font-bold">{userEmail}</span>
            </p>
            {import.meta.env.DEV && (
              <div className="mt-4 pt-4 border-t border-[#F5F0EA] flex items-center justify-between text-xs">
                <span className="text-[#9C928B]">Dev Mode:</span>
                <button
                  onClick={() => {
                    if (typeof window !== 'undefined' && user?.id) {
                      localStorage.setItem(`puplume_access_${user.id}`, 'true');
                      window.location.reload();
                    }
                  }}
                  className="text-amber-700 hover:text-amber-900 font-bold underline cursor-pointer"
                >
                  ⚡ Local Dev Bypass
                </button>
              </div>
            )}



          </div>
        </div>
      </div>
    </div>
  );
};
