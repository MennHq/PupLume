import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useUser, useClerk, SignIn } from '@clerk/react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { PuppyProfile } from './types';
import { storage } from './lib/storage';

// Layout
import { AppLayout } from './components/layout/AppLayout';

// Views
import { HomeScreen } from './views/HomeScreen';
const OnboardingWizard = lazy(() => import('./views/OnboardingWizard').then(m => ({ default: m.OnboardingWizard })));
const TasksView = lazy(() => import('./views/TasksView').then(m => ({ default: m.TasksView })));
const AIAssistantView = lazy(() => import('./views/AIAssistantView').then(m => ({ default: m.AIAssistantView })));
const TrainingAcademyView = lazy(() => import('./views/TrainingAcademyView').then(m => ({ default: m.TrainingAcademyView })));
const PottyTrackerView = lazy(() => import('./views/PottyTrackerView').then(m => ({ default: m.PottyTrackerView })));
const HealthCenterView = lazy(() => import('./views/HealthCenterView').then(m => ({ default: m.HealthCenterView })));
const ExpensesView = lazy(() => import('./views/ExpensesView').then(m => ({ default: m.ExpensesView })));
const DocumentVaultView = lazy(() => import('./views/DocumentVaultView').then(m => ({ default: m.DocumentVaultView })));
const SocializationGroomingView = lazy(() => import('./views/SocializationGroomingView').then(m => ({ default: m.SocializationGroomingView })));
const PuppyJournalView = lazy(() => import('./views/PuppyJournalView').then(m => ({ default: m.PuppyJournalView })));
const PuppyProfileView = lazy(() => import('./views/PuppyProfileView').then(m => ({ default: m.PuppyProfileView })));
const FamilySharingView = lazy(() => import('./views/FamilySharingView').then(m => ({ default: m.FamilySharingView })));
const SettingsView = lazy(() => import('./views/SettingsView').then(m => ({ default: m.SettingsView })));
const MoreMenuView = lazy(() => import('./views/MoreMenuView').then(m => ({ default: m.MoreMenuView })));
const PublicPupSafetyPage = lazy(() => import('./views/PublicPupSafetyPage').then(m => ({ default: m.PublicPupSafetyPage })));
const PaddleLogPage = lazy(() => import('./views/PaddleLogPage').then(m => ({ default: m.PaddleLogPage })));
const RecapView = lazy(() => import('./views/RecapView').then(m => ({ default: m.RecapView })));
const ProPaywallModal = lazy(() => import('./components/ui/ProPaywallModal').then(m => ({ default: m.ProPaywallModal })));
import { Dog, Sparkles, ShieldCheck, Heart } from 'lucide-react';
import { clearUserDataInConvex } from './lib/convex';
import { OfflineAlert } from './components/pwa/OfflineAlert';
import { PaddlePaywall } from './components/ui/PaddlePaywall';
import { FirstTimeWelcomeTour } from './components/ui/FirstTimeWelcomeTour';
import { GettingStartedChecklist } from './components/onboarding/GettingStartedChecklist';
import { OnboardingGuideTip } from './components/onboarding/OnboardingGuideTip';
import { HeadsUpNotification } from './components/ui/HeadsUpNotification';
import { engine as notificationEngine } from './lib/NotificationEngine';
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

export default function App() {
  const { isSignedIn, isLoaded, user } = useUser();
  const { signOut } = useClerk();
  const [puppy, setPuppy] = useState<PuppyProfile | null>(() => storage.getPuppy());
  const [currentView, setCurrentView] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const viewParam = params.get('view');
      if (viewParam) {
        return viewParam === 'plan' ? 'tasks' : viewParam;
      }
      let path = window.location.pathname.replace(/^\/+/, '');
      if (path === 'plan') path = 'tasks';
      return path || 'home';
    }
    return 'home';
  });
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [paywallFeature, setPaywallFeature] = useState<string | null>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Sync currentView to clean URL paths (e.g. /academy)
  useEffect(() => {
    if (typeof window !== 'undefined') {
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
        setCurrentView(viewParam === 'plan' ? 'tasks' : viewParam);
        return;
      }
      let path = window.location.pathname.replace(/^\/+/, '');
      if (path === 'plan') path = 'tasks';
      setCurrentView(path || 'home');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
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
    const handleCustomNavigate = (e: any) => {
      if (e.detail && e.detail.view) {
        let view = e.detail.view;
        if (view === 'plan') view = 'tasks';
        setCurrentView(view);
      }
    };
    window.addEventListener('navigate', handleCustomNavigate);
    return () => window.removeEventListener('navigate', handleCustomNavigate);
  }, []);


  // Authoritative real-time data subscription from Convex scoped to user.id
  const cloudData = useQuery(
    api.app.getUserAppData,
    isSignedIn && user?.id ? { userId: user.id } : 'skip'
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
    });
    return unsubscribe;
  }, []);

  // Hydrate from Convex reactive cloud subscription (No fake data!)
  useEffect(() => {
    if (cloudData && user?.id) {
      if (cloudData.puppies && cloudData.puppies.length > 0) {
        storage.hydrateFromConvex(cloudData);
        const activePup = storage.getPuppy();
        setPuppy(activePup ? { ...activePup } : null);
      } else {
        // Cloud has zero puppies for this account (clean database or fresh account)
        storage.clearAllUserData();
        setPuppy(null);
      }
    }
  }, [cloudData, user?.id]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // 1. Loading authentication state
  
  // Start the background notification engine
  useEffect(() => {
    notificationEngine.start();
    return () => notificationEngine.stop();
  }, []);

  // 0. Public zero-auth emergency page for collar tag scans (/pup/*)
  if (typeof window !== 'undefined' && (window.location.pathname.startsWith('/pup/') || window.location.pathname === '/pup')) {
    return <Suspense fallback={<div className="min-h-screen bg-[#FFF9F2] flex items-center justify-center"><div className="w-8 h-8 border-3 border-[#8B5E3C] border-t-transparent rounded-full animate-spin" /></div>}><PublicPupSafetyPage /></Suspense>;
  }

  // Temporary /paddlelog diagnostic page
  if (typeof window !== 'undefined' && window.location.pathname === '/paddlelog') {
    return <Suspense fallback={<div className="min-h-screen bg-[#FFF9F2] flex items-center justify-center"><div className="w-8 h-8 border-3 border-[#8B5E3C] border-t-transparent rounded-full animate-spin" /></div>}><PaddleLogPage /></Suspense>;
  }


  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#FAF6F0] flex flex-col">
        <OfflineAlert />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-3 border-[#8B5E3C] border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-semibold text-[#766A63]">Loading PupLume...</span>
          </div>
        </div>
      </div>
    );
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
              <SignIn 
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
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. Waiting for user's cloud data to load before making routing decision
  if (cloudData === undefined && !puppy) {
    return (
      <div className="min-h-screen bg-[#FAF6F0] flex flex-col">
        <OfflineAlert />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-3 border-[#8B5E3C] border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-semibold text-[#766A63]">Loading your puppy profile...</span>
          </div>
        </div>
      </div>
    );
  }

  // 4. Paddle Paywall Gate
  const hasLocalAccess = typeof window !== 'undefined' && user?.id && localStorage.getItem(`puplume_access_${user.id}`) === 'true';
  if (cloudData !== undefined && !cloudData?.user?.hasAccess && !hasLocalAccess) {
    return <PaddlePaywall onSignOut={signOut} />;
  }


  // Active puppy from state, storage, or cloud data
  const activePuppy: PuppyProfile | null = puppy || storage.getPuppy() || (cloudData?.puppies && cloudData.puppies.length > 0 ? {
    id: cloudData.puppies[0]._id,
    name: cloudData.puppies[0].name,
    breed: cloudData.puppies[0].breed,
    birthDate: cloudData.puppies[0].birthDate,
    sex: cloudData.puppies[0].sex as 'male' | 'female',
    weightLbs: cloudData.puppies[0].weightLbs,
    photoUrl: cloudData.puppies[0].photoUrl,
    temperament: cloudData.puppies[0].temperament,
    dietaryRestrictions: cloudData.puppies[0].dietaryRestrictions,
    favoriteTreat: cloudData.puppies[0].favoriteTreat,
    createdAt: cloudData.puppies[0].createdAt,
  } : null);

  // 4. Show onboarding only if user explicitly navigated to it, OR if user has no puppy profile yet
  if (!activePuppy || currentView === 'onboarding') {
    return (
      <div className="min-h-screen flex flex-col">
        <OfflineAlert />
        <div className="flex-1">
          <Suspense fallback={
            <div className="min-h-screen bg-[#FAF6F0] flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-3 border-[#8B5E3C] border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-semibold text-[#766A63]">Loading AI Onboarding...</span>
              </div>
            </div>
          }>
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

      {/* Floating Onboarding Guide Tip Spotlight */}
      <OnboardingGuideTip />

      {/* Main View Router */}
      <Suspense fallback={<div className="flex-1 flex items-center justify-center p-12"><div className="w-8 h-8 border-3 border-[#8B5E3C] border-t-transparent rounded-full animate-spin" /></div>}>
      {currentView === 'home' && (
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
      )}

      {currentView === 'tasks' && (
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
      )}

      {currentView === 'ai' && (
        <AIAssistantView
          puppy={activePuppy}
          onActionTriggered={(msg) => showToast(msg)}
        />
      )}

      {currentView === 'academy' && (
        <TrainingAcademyView
          puppy={activePuppy}
          activeLessonId={selectedLessonId}
          onCloseLessonModal={() => setSelectedLessonId(null)}
        />
      )}

      {currentView === 'more' && (
        <MoreMenuView
          puppy={activePuppy}
          onNavigate={setCurrentView}
          onSignOut={async () => {
            storage.clearActiveSession();
            setPuppy(null);
            await signOut();
          }}
        />
      )}

      {currentView === 'potty' && (
        <PottyTrackerView puppy={activePuppy} />
      )}

      {currentView === 'health' && (
        <HealthCenterView 
          puppy={activePuppy} 
          onUpdatePuppy={(updated) => {
            setPuppy(updated);
            showToast(`${updated.name}'s veterinary records updated!`);
          }}
        />
      )}

      {currentView === 'expenses' && (
        <ExpensesView puppy={activePuppy} />
      )}

      {currentView === 'vault' && (
        <DocumentVaultView puppy={activePuppy} />
      )}

      {currentView === 'socialization' && (
        <SocializationGroomingView puppy={activePuppy} />
      )}

      {currentView === 'journal' && (
        <PuppyJournalView puppy={activePuppy} />
      )}

      {currentView === 'recap' && (
        <RecapView puppy={activePuppy} onNavigate={setCurrentView} />
      )}

      {currentView === 'puppy' && (
        <PuppyProfileView
          puppy={activePuppy}
          onUpdatePuppy={(updated) => {
            setPuppy(updated);
            showToast(`${updated.name}'s profile updated!`);
          }}
        />
      )}

      {currentView === 'sharing' && (
        <FamilySharingView puppy={activePuppy} />
      )}

      {currentView === 'settings' && (
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
      )}
      <ProPaywallModal 
        isOpen={!!paywallFeature}
        onClose={() => setPaywallFeature(null)}
        featureName={paywallFeature || ''}
      />
      </Suspense>
    </AppLayout>
  );
}
