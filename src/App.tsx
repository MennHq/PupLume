import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useUser, useClerk, SignIn, SignUp } from '@clerk/react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { PuppyProfile } from './types';
import { storage } from './lib/storage';

// Layout
import { AppLayout } from './components/layout/AppLayout';
import { PupLumeLogo } from './components/common/PupLumeLogo';

// Core Views (bundled for zero latency and zero stale-chunk 404 errors)
import { HomeScreen } from './views/HomeScreen';
import { OnboardingWizard } from './views/OnboardingWizard';
import { TasksView } from './views/TasksView';
import { AIAssistantView } from './views/AIAssistantView';
import { TrainingAcademyView } from './views/TrainingAcademyView';
import { PottyTrackerView } from './views/PottyTrackerView';
import { HealthCenterView } from './views/HealthCenterView';
import { ExpensesView } from './views/ExpensesView';
import { DocumentVaultView } from './views/DocumentVaultView';
import { SocializationGroomingView } from './views/SocializationGroomingView';
import { PuppyJournalView } from './views/PuppyJournalView';
import { PuppyProfileView } from './views/PuppyProfileView';
import { FamilySharingView } from './views/FamilySharingView';
import { SettingsView } from './views/SettingsView';
import { MoreMenuView } from './views/MoreMenuView';

// Secondary / External Views (lazy loaded with retry protection)
import { lazyWithRetry } from './lib/lazyWithRetry';
const PublicPupSafetyPage = lazyWithRetry(() => import('./views/PublicPupSafetyPage').then(m => ({ default: m.PublicPupSafetyPage })));
const PaddleLogPage = lazyWithRetry(() => import('./views/PaddleLogPage').then(m => ({ default: m.PaddleLogPage })));
const RecapView = lazyWithRetry(() => import('./views/RecapView').then(m => ({ default: m.RecapView })));
const PrivacyPolicyView = lazyWithRetry(() => import('./views/PrivacyPolicyView').then(m => ({ default: m.PrivacyPolicyView })));
const TermsOfServiceView = lazyWithRetry(() => import('./views/TermsOfServiceView').then(m => ({ default: m.TermsOfServiceView })));
const ProPaywallModal = lazyWithRetry(() => import('./components/ui/ProPaywallModal').then(m => ({ default: m.ProPaywallModal })));
import { Sparkles } from 'lucide-react';
import { clearUserDataInConvex } from './lib/convex';
import { nativeBridge } from './lib/nativeBridge';
import { OfflineAlert } from './components/pwa/OfflineAlert';
import { PaddlePaywall } from './components/ui/PaddlePaywall';
import { FirstTimeWelcomeTour } from './components/ui/FirstTimeWelcomeTour';
import { GettingStartedChecklist } from './components/onboarding/GettingStartedChecklist';
import { OnboardingGuideTip } from './components/onboarding/OnboardingGuideTip';
import { HeadsUpNotification } from './components/ui/HeadsUpNotification';
import { engine as notificationEngine } from './lib/NotificationEngine';
import { PupLumeSkeleton, getSkeletonVariantForPath, AuthSkeleton, SignInCardSkeleton } from './components/common/PupLumeSkeleton';
import { Skeleton } from 'skullet/react';
import posthog from 'posthog-js';

// Create a small component for the animated marketing text
import { motion, AnimatePresence } from 'framer-motion';

const MarketingCarousel = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  
  const slides = [
    { title: "Sign In.", desc: "Welcome back to your puppy's digital home." },
    { title: "Track.", desc: "Log potty breaks, meals, and sleep effortlessly." },
    { title: "Train.", desc: "Master recall and loose leash walking with our Academy." },
    { title: "Care.", desc: "Keep track of vaccines, weights, and vet visits." },
    { title: "Ask AI.", desc: "Get instant advice on biting, barking, and behavior." }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <div className="relative z-10 max-w-lg xl:max-w-xl mx-auto w-full h-[300px] flex flex-col justify-end pb-8">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-6xl lg:text-8xl font-black mb-6 leading-tight tracking-tighter">
            {slides[activeIndex].title}
          </h1>
          <p className="text-xl lg:text-2xl font-medium text-[#F3E7DA] leading-relaxed max-w-md">
            {slides[activeIndex].desc}
          </p>
        </motion.div>
      </AnimatePresence>
      <div className="flex gap-3 mt-12">
        {slides.map((_, i) => (
          <button 
            key={i}
            onClick={() => setActiveIndex(i)}
            className={`w-3 h-3 rounded-full transition-all duration-300 cursor-pointer ${
              i === activeIndex ? 'bg-white shadow-md scale-125' : 'bg-white/30 hover:bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

import { isPublicPuppyPath } from './lib/slugHelper';

const VALID_VIEWS = new Set([
  'home', 'tasks', 'ai', 'academy', 'more', 'potty', 'health', 
  'expenses', 'vault', 'socialization', 'journal', 'recap', 
  'puppy', 'sharing', 'settings', 'onboarding', 'privacy', 'terms',
  'auth', 'signin'
]);

function sanitizeView(view: string | null | undefined): string {
  if (!view) return 'home';
  const clean = view.split('#')[0].split('?')[0].replace(/^\/+|\/+$/g, '').trim().toLowerCase();
  if (clean === 'plan') return 'tasks';
  if (clean === 'sign-in' || clean === 'login' || clean === 'auth' || clean === 'signin') return 'auth';
  return VALID_VIEWS.has(clean) ? clean : 'home';
}

function SkeletonPlayground() {
  const [selectedVariant, setSelectedVariant] = useState<string>('home');
  const [testingProgress, setTestingProgress] = useState(15);
  const [testingSeconds, setTestingSeconds] = useState(0.0);
  const [isLoading, setIsLoading] = useState(true);
  const [replayCount, setReplayCount] = useState(0);

  const runAnimation = () => {
    setReplayCount((c) => c + 1);
  };

  useEffect(() => {
    let animId: number;
    let timerId: ReturnType<typeof setTimeout> | undefined;

    setIsLoading(true);
    setTestingProgress(15);
    setTestingSeconds(0.0);
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      setTestingSeconds(Number((elapsed / 1000).toFixed(2)));

      if (elapsed < 200) {
        setTestingProgress(Math.round(15 + (elapsed / 200) * 50));
        animId = requestAnimationFrame(tick);
      } else if (elapsed < 450) {
        setTestingProgress(Math.round(65 + ((elapsed - 200) / 250) * 35));
        animId = requestAnimationFrame(tick);
      } else {
        setTestingProgress(100);
        setTestingSeconds(0.5);
        timerId = setTimeout(() => setIsLoading(false), 50);
      }
    };
    animId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animId);
      if (timerId) clearTimeout(timerId);
    };
  }, [selectedVariant, replayCount]);

  return (
    <div className="min-h-screen bg-[#FFF9F2] flex flex-col">
      {/* Top Lume Loading Progress Bar */}
      {isLoading && (
        <div className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none">
          <div 
            className="h-[3.5px] bg-gradient-to-r from-[#8B5E3C] via-[#F59E0B] to-[#FDE68A] shadow-[0_0_12px_rgba(245,158,11,0.8)] transition-all duration-75 ease-out"
            style={{ width: `${testingProgress}%` }}
          />
        </div>
      )}

      {/* Control Strip & Live HUD */}
      <div className="sticky top-0 z-50 bg-[#2C211B] text-white p-3 border-b border-[#F59E0B]/30 shadow-md">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-black text-[#FDE68A]">🦴 Skullet Engine</span>
            <div className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold flex items-center gap-1.5 ${
              isLoading ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isLoading ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'}`} />
              ⏱ {testingSeconds.toFixed(2)}s • {testingProgress}% {isLoading ? '(Shimmering...)' : '(100% Revealed)'}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={runAnimation}
              className="px-3.5 py-1.5 bg-[#8B5E3C] hover:bg-[#A06C47] text-white font-bold rounded-xl text-xs transition-all shadow-xs cursor-pointer flex items-center gap-1.5 active:scale-95"
            >
              ▶ Replay 0.5s Load
            </button>
            <a
              href="/"
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-xs font-semibold rounded-xl text-zinc-200 transition-colors"
            >
              Exit
            </a>
          </div>
        </div>

        {/* View Switcher Chips */}
        <div className="max-w-4xl mx-auto flex items-center gap-1.5 overflow-x-auto pt-2.5 pb-0.5 no-scrollbar">
          {[
            { id: 'home', label: '🏠 Home' },
            { id: 'auth', label: '🔐 Sign In' },
            { id: 'ai', label: '✨ Ask AI' },
            { id: 'tasks', label: '📅 Plan' },
            { id: 'academy', label: '🎓 Academy' },
            { id: 'health', label: '🩺 Health' },
            { id: 'more', label: '🐾 More' },
            { id: 'potty', label: '🚽 Potty' },
            { id: 'safety', label: '🚨 Safety QR' },
            { id: 'expenses', label: '💰 Expenses' },
            { id: 'vault', label: '📁 Vault' },
            { id: 'journal', label: '📖 Journal' },
            { id: 'socialization', label: '🐶 Socialize' },
            { id: 'puppy', label: '🐕 Profile' },
            { id: 'settings', label: '⚙️ Settings' },
            { id: 'sharing', label: '👨‍👩‍👧 Sharing' },
            { id: 'recap', label: '📊 Recap' },
            { id: 'privacy', label: '📜 Privacy' },
            { id: 'terms', label: '⚖️ Terms' },
            { id: 'onboarding', label: '🚀 Onboarding' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedVariant(tab.id)}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all shrink-0 cursor-pointer ${
                selectedVariant === tab.id
                  ? 'bg-[#F59E0B] text-[#2C211B] shadow-sm scale-105'
                  : 'bg-white/10 text-zinc-300 hover:bg-white/15'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Render the skeleton or content with Skullet */}
      <div className="flex-1 w-full max-w-4xl mx-auto p-4">
        <Skeleton id={`test-${selectedVariant}`} loading={isLoading} className="w-full">
          <PupLumeSkeleton variant={selectedVariant as any} showPreviewSwitcher={false} />
        </Skeleton>
      </div>
    </div>
  );
}

export default function App() {
  const { isSignedIn, isLoaded, user } = useUser();
  const { signOut } = useClerk();
  const [puppy, setPuppy] = useState<PuppyProfile | null>(() => storage.getPuppy());
  const [currentView, setCurrentView] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const viewParam = params.get('view');
      if (viewParam) {
        return sanitizeView(viewParam);
      }
      return sanitizeView(window.location.pathname);
    }
    return 'home';
  });
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [paywallFeature, setPaywallFeature] = useState<string | null>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Skullet 0.2s - 0.5s Automatic UI Measurement & Timed Transition Engine
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [transitionProgress, setTransitionProgress] = useState(15);
  const [transitionSeconds, setTransitionSeconds] = useState(0.0);
  const loadedViewsRef = React.useRef<Set<string>>(new Set());

  // Core tabs are bundled for zero latency and instant tab switching

  useEffect(() => {
    // When tabs are 100% loaded, DO NOT show skeleton again!
    if (loadedViewsRef.current.has(currentView)) {
      setIsTransitioning(false);
      setTransitionProgress(100);
      return;
    }

    setIsTransitioning(true);
    setTransitionProgress(15);
    setTransitionSeconds(0.0);

    const startTime = performance.now();
    let animationFrameId: number;
    let transitionTimeoutId: ReturnType<typeof setTimeout> | undefined;

    const update = (now: number) => {
      const elapsedMs = now - startTime;
      const elapsedSec = elapsedMs / 1000;
      setTransitionSeconds(Number(elapsedSec.toFixed(2)));

      if (elapsedMs < 200) {
        // Milestone 0.0s to 0.2s: Progress moves from 15% to 65%
        const p = 15 + (elapsedMs / 200) * 50;
        setTransitionProgress(Math.round(p));
        animationFrameId = requestAnimationFrame(update);
      } else if (elapsedMs < 450) {
        // Milestone 0.2s to 0.45s: Progress moves from 65% to 100%
        const p = 65 + ((elapsedMs - 200) / 250) * 35;
        setTransitionProgress(Math.round(p));
        animationFrameId = requestAnimationFrame(update);
      } else {
        // Milestone 0.45s to 0.5s: Complete & reveal measured UI
        setTransitionProgress(100);
        setTransitionSeconds(0.5);
        transitionTimeoutId = setTimeout(() => {
          setIsTransitioning(false);
          // Mark tab as 100% loaded so skeleton is never shown again
          loadedViewsRef.current.add(currentView);
        }, 40);
      }
    };

    animationFrameId = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (transitionTimeoutId) clearTimeout(transitionTimeoutId);
    };
  }, [currentView]);

  // Sync currentView to clean URL paths (e.g. /academy)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      // NEVER overwrite public routes (like /pup/*, /safety/*, custom puppy slugs, or /paddlelog)
      if (isPublicPuppyPath(path) || path === '/paddlelog') {
        return;
      }

      const targetPath = currentView === 'home' ? '/' : `/${currentView}`;
      if (window.location.pathname !== targetPath) {
        window.history.pushState({ view: currentView }, '', targetPath);
      }
    }
  }, [currentView]);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const viewParam = params.get('view');
      if (viewParam) {
        setCurrentView(sanitizeView(viewParam));
        return;
      }
      setCurrentView(sanitizeView(window.location.pathname));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Handle Home Screen App Shortcuts (3D Touch / Launchers) & Native Web Share Target
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const action = params.get('action');

    if (action) {
      if (action === 'potty' || action === 'feeding' || action === 'meal' || action === 'sleep') {
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('open-quick-action', { detail: { action } }));
        }, 350);
      } else if (action === 'sos') {
        setCurrentView('puppy');
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('open-sos-alert'));
        }, 350);
      } else if (action === 'shared-media' || action === 'shared-photo') {
        setCurrentView('journal');
      }
    }
  }, []);

  // Listen for Service Worker navigation messages (when user clicks Windows / Android push notification)
  useEffect(() => {
    const handleSwMessage = (e: MessageEvent) => {
      if (e.data?.type === 'NAVIGATE') {
        const view = e.data.view || (e.data.url ? e.data.url.replace(/^\/+/, '').split('?')[0] : null);
        if (view) {
          setCurrentView(view === 'plan' ? 'tasks' : view);
        }
      } else if (e.data?.type === 'SHOW_IN_APP_ALERT' && e.data.payload) {
        window.dispatchEvent(
          new CustomEvent('puplume-headsup-alert', {
            detail: e.data.payload
          })
        );
      }
    };

    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleSwMessage);
      return () => {
        navigator.serviceWorker.removeEventListener('message', handleSwMessage);
      };
    }
  }, []);

  // Listen for custom navigate events (e.g., triggered by the AI assistant or notification click)
  useEffect(() => {
    const handleCustomNavigate = (e: Event) => {
      const customEvt = e as CustomEvent<{ view?: string }>;
      if (customEvt.detail && customEvt.detail.view) {
        setCurrentView(sanitizeView(customEvt.detail.view));
      }
    };
    window.addEventListener('navigate', handleCustomNavigate);
    return () => window.removeEventListener('navigate', handleCustomNavigate);
  }, []);


  const currentUserEmail = user?.primaryEmailAddress?.emailAddress?.toLowerCase();

  // Authoritative real-time data subscription from Convex scoped to user.id and verified email
  const cloudData = useQuery(
    api.app.getUserAppData,
    isSignedIn && user?.id ? { 
      userId: user.id,
      userEmail: currentUserEmail,
    } : 'skip'
  );
  
  // Since the entire app is gated by the Paddle lifetime purchase paywall, 
  // anyone who makes it here is a Pro member.
  const isPro = true;

  const syncUserMutation = useMutation(api.users.syncUser);

  // Set authenticated user on storage to isolate data across users
  useEffect(() => {
    storage.setAuthenticatedUser(user?.id ?? null);
  }, [user?.id]);

  // Sync user profile to Convex upon signing in & identify in PostHog
  useEffect(() => {
    if (isSignedIn && user?.id) {
      posthog.identify(user.id, {
        email: user.primaryEmailAddress?.emailAddress,
        name: user.fullName || user.firstName || 'Pup Parent',
        firstName: user.firstName,
        lastName: user.lastName,
      });

      syncUserMutation({
        clerkId: user.id,
        email: user.primaryEmailAddress?.emailAddress,
        name: user.fullName || user.firstName || 'Pup Parent',
        avatarUrl: user.imageUrl,
      }).catch((err) => console.debug('[App] syncUser error:', err));
    } else if (!isSignedIn && isLoaded) {
      posthog.reset();
    }
  }, [isSignedIn, isLoaded, user, syncUserMutation]);

  // Track view changes with PostHog
  useEffect(() => {
    posthog.capture('$pageview', {
      view: currentView,
      path: window.location.pathname,
    });
  }, [currentView]);

  // Reactive listener to storage changes
  useEffect(() => {
    const unsubscribe = storage.subscribe(() => {
      const current = storage.getPuppy();
      setPuppy(current ? { ...current } : null);
      nativeBridge.badge.updateFromTasks(current?.id);
    });
    return unsubscribe;
  }, []);

  // Update app icon notification badge on puppy change
  useEffect(() => {
    nativeBridge.badge.updateFromTasks(puppy?.id);
  }, [puppy?.id]);

  // Hydrate from Convex reactive cloud subscription (No fake data!)
  useEffect(() => {
    if (cloudData && user?.id) {
      if (cloudData.user?.hasAccess && typeof window !== 'undefined') {
        localStorage.setItem(`puplume_access_${user.id}`, 'true');
        const email = user.primaryEmailAddress?.emailAddress?.toLowerCase();
        if (email) {
          localStorage.setItem(`puplume_access_${email}`, 'true');
        }
      }
      if (cloudData.puppies && cloudData.puppies.length > 0) {
        storage.hydrateFromConvex(cloudData, user.id);
        const activePup = storage.getPuppy();
        setPuppy(activePup ? { ...activePup } : null);
      } else if (Array.isArray(cloudData.puppies) && cloudData.puppies.length === 0) {
        // Cloud has zero puppies for this account; only reset if no local puppy exists
        if (!storage.getPuppy()) {
          setPuppy(null);
        }
      }
    }
  }, [cloudData, user?.id]);

  const toastTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (msg: string) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
      toastTimeoutRef.current = null;
    }, 3000);
  };

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  // 1. Loading authentication state
  
  // Start the background notification engine
  useEffect(() => {
    notificationEngine.start(user?.id);
    return () => notificationEngine.stop();
  }, [user?.id]);

  // 0. Public zero-auth emergency page for collar tag scans (/pup/*, /safety/*, or custom puppy slug e.g. /leo)
  if (typeof window !== 'undefined') {
    const path = window.location.pathname.toLowerCase();
    if (isPublicPuppyPath(path)) {
      return (
        <Suspense fallback={<PupLumeSkeleton variant="safety" label="Loading puppy safety card..." />}>
          <PublicPupSafetyPage />
        </Suspense>
      );
    }
  }

  // Temporary /paddlelog diagnostic page
  if (typeof window !== 'undefined' && window.location.pathname === '/paddlelog') {
    return <Suspense fallback={<PupLumeSkeleton variant="card" label="Loading logs..." />}><PaddleLogPage /></Suspense>;
  }

  // URL trigger to preview and test specific page skeletons anytime (?skeleton or ?loading)
  if (typeof window !== 'undefined' && (window.location.search.includes('skeleton') || window.location.search.includes('loading'))) {
    return <SkeletonPlayground />;
  }

  if (!isLoaded) {
    const hasExistingSession = typeof window !== 'undefined' && (
      Boolean(storage.getPuppy()) || 
      document.cookie.includes('__session') || 
      document.cookie.includes('__client_uat') ||
      Boolean(localStorage.getItem('__clerk_db_jwt')) ||
      Boolean(localStorage.getItem('clerk-db-jwt'))
    );

    if (!hasExistingSession) {
      return <AuthSkeleton label="Loading PupLume Sign In..." />;
    }
    return <PupLumeSkeleton variant={getSkeletonVariantForPath(currentView)} label={`Loading PupLume ${currentView}...`} />;
  }

  // 2. Unauthenticated: Split-screen layout (Marketing on left, Clerk on right)
  if (!isSignedIn) {
    // Direct in-app sign in

    return (
      <div className="min-h-screen bg-[#FFF9F2] flex flex-col md:flex-row">
        
        {/* Left Side: Brand Hero */}
        <div className="hidden md:flex md:w-1/2 bg-[#8B5E3C] text-white p-12 flex-col justify-center relative overflow-hidden">
          {/* Decorative glowing background */}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
          
          <MarketingCarousel />
        </div>

        {/* Right Side: Auth Widget */}
        <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-4 sm:p-12 relative bg-[#FFF9F2] min-h-screen md:min-h-0">
          <div className="absolute top-4 w-full px-4">
            <OfflineAlert />
          </div>
          
          <div className="w-full max-w-md mx-auto flex flex-col items-center my-auto">
            {/* Mobile Brand Header */}
            <div className="md:hidden flex flex-col items-center mb-6 text-center">
              <PupLumeLogo variant="full" size="lg" />
              <p className="text-xs text-[#766A63] mt-2 font-medium">
                Your AI companion for happy, healthy puppies
              </p>
            </div>

            <div className="w-full flex justify-center">
              {typeof window !== 'undefined' && (window.location.pathname.toLowerCase().includes('signup') || window.location.pathname.toLowerCase().includes('sign-up')) ? (
                <SignUp 
                  fallback={<SignInCardSkeleton mode="signup" />}
                  signInUrl="/sign-in"
                  appearance={{
                    variables: {
                      colorPrimary: "#8B5E3C",
                      colorBackground: "#FFF9F2",
                      borderRadius: "1rem",
                    },
                    elements: {
                      rootBox: "w-full",
                      cardBox: "!shadow-none",
                      card: "bg-[#FFF9F2] !shadow-none rounded-3xl border border-[#E8DDD3] w-full max-w-md p-5 sm:p-8",
                      footer: "!bg-transparent !border-none !shadow-none",
                      headerTitle: "text-2xl font-black text-[#2C211B] mb-1",
                      headerSubtitle: "text-[#766A63] font-medium text-base",
                      socialButtonsBlockButton: "border border-[#E8DDD3] bg-white hover:bg-[#F3E7DA] text-[#2C211B] transition-colors rounded-xl py-3.5",
                      socialButtonsBlockButtonText: "font-bold",
                      formButtonPrimary: "bg-[#8B5E3C] hover:bg-[#6D492F] transition-colors shadow-sm hover:shadow-md font-bold py-3.5",
                      formFieldInput: "bg-white border border-[#E8DDD3] focus:ring-2 focus:ring-[#8B5E3C]/20 focus:border-[#8B5E3C] shadow-xs py-2.5",
                      formFieldLabel: "text-[#2C211B] font-bold text-sm",
                      footerActionLink: "text-[#8B5E3C] hover:text-[#5F3E29] font-bold",
                      footerActionText: "text-[#766A63] font-medium",
                      dividerLine: "bg-[#E8DDD3]",
                      dividerText: "text-[#766A63] font-bold text-xs uppercase tracking-wider",
                    },
                  }}
                />
              ) : (
                <SignIn 
                  fallback={<SignInCardSkeleton mode="signin" />}
                  signUpUrl="/sign-up"
                  appearance={{
                    variables: {
                      colorPrimary: "#8B5E3C",
                      colorBackground: "#FFF9F2",
                      borderRadius: "1rem",
                    },
                    elements: {
                      rootBox: "w-full",
                      cardBox: "!shadow-none",
                      card: "bg-[#FFF9F2] !shadow-none rounded-3xl border border-[#E8DDD3] w-full max-w-md p-5 sm:p-8",
                      footer: "!bg-transparent !border-none !shadow-none",
                      headerTitle: "text-2xl font-black text-[#2C211B] mb-1",
                      headerSubtitle: "text-[#766A63] font-medium text-base",
                      socialButtonsBlockButton: "border border-[#E8DDD3] bg-white hover:bg-[#F3E7DA] text-[#2C211B] transition-colors rounded-xl py-3.5",
                      socialButtonsBlockButtonText: "font-bold",
                      formButtonPrimary: "bg-[#8B5E3C] hover:bg-[#6D492F] transition-colors shadow-sm hover:shadow-md font-bold py-3.5",
                      formFieldInput: "bg-white border border-[#E8DDD3] focus:ring-2 focus:ring-[#8B5E3C]/20 focus:border-[#8B5E3C] shadow-xs py-2.5",
                      formFieldLabel: "text-[#2C211B] font-bold text-sm",
                      footerActionLink: "text-[#8B5E3C] hover:text-[#5F3E29] font-bold",
                      footerActionText: "text-[#766A63] font-medium",
                      dividerLine: "bg-[#E8DDD3]",
                      dividerText: "text-[#766A63] font-bold text-xs uppercase tracking-wider",
                    },
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. Waiting for user's cloud data to load before making routing decision
  const hasLocalAccess = typeof window !== 'undefined' && (
    (user?.id && localStorage.getItem(`puplume_access_${user.id}`) === 'true') ||
    (currentUserEmail && localStorage.getItem(`puplume_access_${currentUserEmail}`) === 'true')
  );

  // Wait for user cloud data and user account resolution before routing
  if (isSignedIn && !hasLocalAccess && (cloudData === undefined || cloudData === null || cloudData.user === null)) {
    return <PupLumeSkeleton variant={getSkeletonVariantForPath(currentView)} label={`Loading ${currentView}...`} />;
  }

  // 4. Paddle Paywall Gate (only shown if user profile is resolved and definitively unpaid)
  const isPaidUser = Boolean(cloudData?.user?.hasAccess || hasLocalAccess);
  if (isSignedIn && cloudData !== undefined && cloudData !== null && cloudData.user !== null && !isPaidUser) {
    return <PaddlePaywall onSignOut={signOut} />;
  }


  // Active puppy from state, storage, or cloud data
  const activePuppyId = cloudData?.settings?.activePuppyId;
  const cloudActivePup = cloudData?.puppies && cloudData.puppies.length > 0
    ? (activePuppyId
        ? cloudData.puppies.find((p: any) => p._id === activePuppyId) || cloudData.puppies[0]
        : cloudData.puppies[0])
    : null;

  const activePuppy: PuppyProfile | null = puppy || storage.getPuppy() || (cloudActivePup ? {
    id: cloudActivePup._id,
    name: cloudActivePup.name,
    breed: cloudActivePup.breed,
    birthDate: cloudActivePup.birthDate,
    sex: cloudActivePup.sex as 'male' | 'female',
    weightLbs: cloudActivePup.weightLbs,
    photoUrl: cloudActivePup.photoUrl,
    temperament: cloudActivePup.temperament,
    dietaryRestrictions: cloudActivePup.dietaryRestrictions,
    favoriteTreat: cloudActivePup.favoriteTreat,
    createdAt: cloudActivePup.createdAt,
    hasSmartTagPass: Boolean(cloudActivePup.hasSmartTagPass),
    isLost: Boolean(cloudActivePup.isLost),
    ownerPhone: cloudActivePup.ownerPhone,
    ownerEmail: cloudActivePup.ownerEmail,
    emergencyNotes: cloudActivePup.emergencyNotes,
    emergencyContactName: cloudActivePup.emergencyContactName,
    emergencyContactPhone: cloudActivePup.emergencyContactPhone,
    communicationLinks: cloudActivePup.communicationLinks,
  } : null);

  // 4. Show onboarding only if user explicitly navigated to it, OR if user has no puppy profile yet
  if (!activePuppy || currentView === 'onboarding') {
    return (
      <div className="min-h-screen flex flex-col">
        <OfflineAlert />
        <div className="flex-1">
          <Suspense fallback={<PupLumeSkeleton variant="onboarding" label="Loading AI Onboarding..." />}>
            <OnboardingWizard
              userId={user?.id}
              onComplete={(newPuppy) => {
                setPuppy(newPuppy);
                setCurrentView('home');
                showToast(`Welcome ${newPuppy.name}! Your puppy's schedule is ready.`);
              }}
              onCancel={() => {
                if (activePuppy) setCurrentView('home');
              }}
            />
          </Suspense>
        </div>
      </div>
    );
  }

  // 5. Authenticated with puppy profile: Full Application
  return (
    <AppLayout
      currentView={currentView}
      onNavigate={(view) => {
        if (!isPro && (view === 'ai' || view === 'academy')) {
          setPaywallFeature(view === 'ai' ? 'AI Co-Pilot' : 'Training Academy');
          return;
        }
        setCurrentView(view);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }}
      puppy={activePuppy}
      isNotificationsOpen={isNotificationsOpen}
      onOpenNotifications={() => setIsNotificationsOpen(true)}
      onCloseNotifications={() => setIsNotificationsOpen(false)}
      isSearchOpen={isSearchOpen}
      onOpenSearch={() => setIsSearchOpen(true)}
      onCloseSearch={() => setIsSearchOpen(false)}
      onSelectLesson={(lessonId) => {
        setSelectedLessonId(lessonId);
        setCurrentView('academy');
      }}
      onOpenNewPuppyWizard={() => setCurrentView('onboarding')}
    >
      {/* Demo Profile Alert Banner if user still has placeholder Max */}
      {activePuppy.name === 'Max' && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Demo profile active:</strong> Set up your real puppy&apos;s schedule with our conversational AI Onboarding!
            </span>
          </div>
          <button
            onClick={async () => {
              if (user?.id) {
                await clearUserDataInConvex(user.id);
              }
              storage.clearAllUserData();
              setPuppy(null);
              setCurrentView('onboarding');
            }}
            className="px-3 py-1 bg-[#8B5E3C] hover:bg-[#6D492F] text-white font-bold rounded-lg transition-colors cursor-pointer shrink-0 text-xs shadow-xs"
          >
            Start Real AI Onboarding
          </button>
        </div>
      )}

      {/* 100% Bespoke In-App Heads-Up Alert with 1-Click Interactive Actions */}
      <HeadsUpNotification 
        puppy={activePuppy} 
        onNavigate={setCurrentView} 
        onShowToast={showToast} 
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-[#2C211B] text-white text-xs font-semibold px-4 py-2.5 rounded-2xl shadow-xl border border-[#E8DDD3]/30">
          🐾 {toastMessage}
        </div>
      )}

      {/* First-time Interactive Welcome Tour (Shows once, 5 steps) */}
      <FirstTimeWelcomeTour puppy={activePuppy} />

      {/* Getting Started Onboarding Checklist Widget (Permanently suppressed once completed in backend) */}
      {!cloudData?.settings?.hasCompletedChecklist && (
        <GettingStartedChecklist 
          puppy={activePuppy} 
          onNavigate={setCurrentView} 
          backendCompleted={Boolean(cloudData?.settings?.hasCompletedChecklist)}
        />
      )}

      {/* Top Lume Loading Progress Bar (0.2s - 0.5s Smooth Feedback) */}
      {isTransitioning && (
        <div 
          className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none transition-opacity duration-200"
          style={{ opacity: isTransitioning ? 1 : 0 }}
        >
          <div 
            className="h-[3.5px] bg-gradient-to-r from-[#8B5E3C] via-[#F59E0B] to-[#FDE68A] shadow-[0_0_12px_rgba(245,158,11,0.8)] transition-all duration-100 ease-out"
            style={{ width: `${transitionProgress}%` }}
          />
        </div>
      )}

      {/* Floating Onboarding Guide Tip Spotlight */}
      <OnboardingGuideTip />

      {/* Main View Router with Skullet Automatic UI Measurement */}
      <Skeleton
        id={`puplume-view-${currentView}`}
        loading={isTransitioning}
        className="w-full flex-1"
        skeleton={<PupLumeSkeleton variant={getSkeletonVariantForPath(currentView)} />}
      >
      {currentView === 'home' && (
        <Suspense fallback={<PupLumeSkeleton variant="home" label="Loading Home Dashboard..." />}>
          <HomeScreen
            puppy={activePuppy}
            onNavigate={setCurrentView}
            onOpenSearch={() => setIsSearchOpen(true)}
            onOpenNotifications={() => setIsNotificationsOpen(true)}
            onOpenLesson={(lessonId) => {
              if (!isPro) {
                setPaywallFeature('Training Academy');
                return;
              }
              setSelectedLessonId(lessonId);
              setCurrentView('academy');
            }}
          />
        </Suspense>
      )}

      {currentView === 'tasks' && (
        <Suspense fallback={<PupLumeSkeleton variant="tasks" label="Loading Daily Routine Plan..." />}>
          <TasksView
            puppy={activePuppy}
            onNavigate={setCurrentView}
            onOpenLesson={(lessonId) => {
              if (!isPro) {
                setPaywallFeature('Training Academy');
                return;
              }
              setSelectedLessonId(lessonId);
              setCurrentView('academy');
            }}
          />
        </Suspense>
      )}

      {currentView === 'ai' && (
        <Suspense fallback={<PupLumeSkeleton variant="ai" label="Loading PupLume AI Assistant..." />}>
          <AIAssistantView
            puppy={activePuppy}
            onActionTriggered={(msg) => showToast(msg)}
          />
        </Suspense>
      )}

      {currentView === 'academy' && (
        <Suspense fallback={<PupLumeSkeleton variant="academy" label="Loading Training Academy..." />}>
          <TrainingAcademyView
            puppy={activePuppy}
            activeLessonId={selectedLessonId}
            onCloseLessonModal={() => setSelectedLessonId(null)}
          />
        </Suspense>
      )}

      {currentView === 'more' && (
        <Suspense fallback={<PupLumeSkeleton variant="more" label="Loading Menu & Settings..." />}>
          <MoreMenuView
            puppy={activePuppy}
            onNavigate={setCurrentView}
            onSignOut={async () => {
              storage.clearActiveSession();
              setPuppy(null);
              await signOut();
            }}
          />
        </Suspense>
      )}

      {currentView === 'potty' && (
        <Suspense fallback={<PupLumeSkeleton variant="potty" label="Loading Potty Tracker..." />}>
          <PottyTrackerView puppy={activePuppy} />
        </Suspense>
      )}

      {currentView === 'health' && (
        <Suspense fallback={<PupLumeSkeleton variant="health" label="Loading Health & Veterinary Center..." />}>
          <HealthCenterView 
            puppy={activePuppy} 
            onUpdatePuppy={(updated) => {
              setPuppy(updated);
              showToast(`${updated.name}'s veterinary records updated!`);
            }}
          />
        </Suspense>
      )}

      {currentView === 'expenses' && (
        <Suspense fallback={<PupLumeSkeleton variant="expenses" label="Loading Expenses..." />}>
          <ExpensesView puppy={activePuppy} />
        </Suspense>
      )}

      {currentView === 'vault' && (
        <Suspense fallback={<PupLumeSkeleton variant="vault" label="Loading Document Vault..." />}>
          <DocumentVaultView puppy={activePuppy} />
        </Suspense>
      )}

      {currentView === 'socialization' && (
        <Suspense fallback={<PupLumeSkeleton variant="socialization" label="Loading Socialization..." />}>
          <SocializationGroomingView puppy={activePuppy} />
        </Suspense>
      )}

      {currentView === 'journal' && (
        <Suspense fallback={<PupLumeSkeleton variant="journal" label="Loading Puppy Journal..." />}>
          <PuppyJournalView puppy={activePuppy} />
        </Suspense>
      )}

      {currentView === 'recap' && (
        <Suspense fallback={<PupLumeSkeleton variant="recap" label="Loading Recap..." />}>
          <RecapView puppy={activePuppy} onNavigate={setCurrentView} />
        </Suspense>
      )}

      {currentView === 'puppy' && (
        <Suspense fallback={<PupLumeSkeleton variant="puppy" label="Loading Puppy Profile..." />}>
          <PuppyProfileView
            puppy={activePuppy}
            onUpdatePuppy={(updated, customToast) => {
              setPuppy(updated);
              if (customToast !== false) {
                showToast(customToast || `🐾 ${updated.name}'s profile updated in database!`);
              }
            }}
          />
        </Suspense>
      )}

      {currentView === 'sharing' && (
        <Suspense fallback={<PupLumeSkeleton variant="sharing" label="Loading Family Sharing..." />}>
          <FamilySharingView puppy={activePuppy} />
        </Suspense>
      )}

      {currentView === 'privacy' && (
        <Suspense fallback={<PupLumeSkeleton variant="privacy" label="Loading Privacy Policy..." />}>
          <PrivacyPolicyView onBack={() => setCurrentView('more')} />
        </Suspense>
      )}

      {currentView === 'terms' && (
        <Suspense fallback={<PupLumeSkeleton variant="terms" label="Loading Terms of Service..." />}>
          <TermsOfServiceView onBack={() => setCurrentView('more')} />
        </Suspense>
      )}

      {currentView === 'settings' && (
        <Suspense fallback={<PupLumeSkeleton variant="settings" label="Loading Settings..." />}>
          <SettingsView
            puppy={activePuppy}
            onResetData={async () => {
              if (user?.id) {
                await clearUserDataInConvex(user.id);
              }
              storage.clearAllUserData();
              setPuppy(null);
              setCurrentView('onboarding');
              showToast('All data cleared. Welcome to AI Onboarding!');
            }}
          />
        </Suspense>
      )}
      </Skeleton>
      <ProPaywallModal 
        isOpen={!!paywallFeature}
        onClose={() => setPaywallFeature(null)}
        featureName={paywallFeature || ''}
      />
    </AppLayout>
  );
}
