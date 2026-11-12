import React, { useState, useEffect } from 'react';
import { 
  Check, 
  X, 
  Sparkles, 
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { PuppyProfile } from '../../types';
import { storage } from '../../lib/storage';
import { useUser } from '@clerk/react';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { FullScreenConfetti } from '../ui/FullScreenConfetti';
import { playVictoryFanfare } from '../../lib/sound';

interface GettingStartedChecklistProps {
  puppy: PuppyProfile;
  onNavigate: (view: string) => void;
  backendCompleted?: boolean;
}

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  actionText: string;
  isCompleted: boolean;
  onAction: () => void;
}

export const GettingStartedChecklist: React.FC<GettingStartedChecklistProps> = ({ 
  puppy, 
  onNavigate,
  backendCompleted = false
}) => {
  const { user } = useUser();
  const userName = user?.firstName || user?.fullName || 'Pup Parent';

  const dismissChecklistMutation = useMutation(api.settings.dismissChecklistForever);

  const permanentKey = `puplume_checklist_finished_forever_${puppy.id}`;
  const dismissedKey = `puplume_checklist_dismissed_${puppy.id}`;
  const minimizedKey = `puplume_checklist_minimized_${puppy.id}`;

  // If backend says completed or 100% was ever achieved, NEVER EVER show this box again
  const [isPermanentlyFinished, setIsPermanentlyFinished] = useState<boolean>(() => {
    if (backendCompleted) return true;
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(permanentKey) === 'true';
  });

  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    if (backendCompleted) return true;
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(dismissedKey) === 'true';
  });

  const [isMinimized, setIsMinimized] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    if (window.innerWidth < 768) return true;
    return localStorage.getItem(minimizedKey) === 'true';
  });

  const [showConfetti, setShowConfetti] = useState(false);
  const [isCelebrating, setIsCelebrating] = useState(false);

  // Reactive state for automatic detection only (no manual ticking allowed)
  const [tasks, setTasks] = useState(() => storage.getTasks());
  const [pottyLogs, setPottyLogs] = useState(() => storage.getPottyLogs());
  const [lessons, setLessons] = useState(() => storage.getTrainingLessons());
  const [hasAskedAI, setHasAskedAI] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('puplume_asked_ai') === 'true' || storage.getAIMessages().some(m => m.sender === 'user');
  });

  useEffect(() => {
    const unsub = storage.subscribe(() => {
      setTasks([...storage.getTasks()]);
      setPottyLogs([...storage.getPottyLogs()]);
      setLessons([...storage.getTrainingLessons()]);
      if (localStorage.getItem('puplume_asked_ai') === 'true' || storage.getAIMessages().some(m => m.sender === 'user')) {
        setHasAskedAI(true);
      }
    });

    const handleActionDone = (e: any) => {
      if (e.detail?.action === 'ai') setHasAskedAI(true);
    };

    window.addEventListener('puplume-action-completed', handleActionDone);
    return () => {
      unsub();
      window.removeEventListener('puplume-action-completed', handleActionDone);
    };
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    setIsPermanentlyFinished(true);
    localStorage.setItem(dismissedKey, 'true');
    localStorage.setItem(permanentKey, 'true');
    if (user?.id) {
      dismissChecklistMutation({ userId: user.id }).catch((err) => {
        console.debug('[GettingStartedChecklist] handleDismiss sync:', err);
      });
    }
  };

  const handleToggleMinimize = () => {
    const next = !isMinimized;
    setIsMinimized(next);
    localStorage.setItem(minimizedKey, String(next));
  };

  // Dispatch guided tip banner to direct user where to click on target page
  const guideUserTo = (view: string, message: string) => {
    onNavigate(view);
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('show-onboarding-guide', { detail: { message } }));
    }, 150);
  };

  // Automatic Detection Only
  const isProfileDone = Boolean(
    puppy.name && 
    puppy.name !== 'Max' && 
    (puppy.photoUrl || (puppy.breed && puppy.weightLbs > 0))
  );
  const isTaskDone = tasks.some((t) => t.completed);
  const isPottyDone = pottyLogs.length > 0;
  const isAIDone = hasAskedAI;
  const isAcademyDone = lessons.some((l) => l.completed || l.mastered || Boolean(l.lastPracticed)) || localStorage.getItem('puplume_did_academy') === 'true';

  const checklistItems: ChecklistItem[] = [
    {
      id: 'profile',
      title: `Personalize ${puppy.name}'s Profile`,
      description: 'Upload a cute photo, verify breed and birthdate.',
      actionText: 'Do it',
      isCompleted: isProfileDone,
      onAction: () => guideUserTo('puppy', `Tap the camera icon or 'Edit Profile' to upload a photo for ${puppy.name}!`),
    },
    {
      id: 'task',
      title: 'Complete a Daily Task',
      description: 'Check off a routine task to establish daily rhythm.',
      actionText: 'Do it',
      isCompleted: isTaskDone,
      onAction: () => guideUserTo('tasks', 'Tap the circular checkmark on any task card to mark it complete!'),
    },
    {
      id: 'potty',
      title: 'Log a Potty Break',
      description: 'Record an outdoor pee or poop to start predictions.',
      actionText: 'Do it',
      isCompleted: isPottyDone,
      onAction: () => guideUserTo('potty', "Tap '+ Quick Log Potty' or choose Pee/Poop below to log your break!"),
    },
    {
      id: 'ai',
      title: 'Ask AI Your First Question',
      description: 'Get tailored advice on teething, biting, or naps.',
      actionText: 'Do it',
      isCompleted: isAIDone,
      onAction: () => guideUserTo('ai', `Type a question below (e.g. 'How to stop ${puppy.name} from biting?') and send!`),
    },
    {
      id: 'academy',
      title: 'Try a 5-Min Training Drill',
      description: 'Run a short recall or crate settling drill with timer.',
      actionText: 'Do it',
      isCompleted: isAcademyDone,
      onAction: () => guideUserTo('academy', "Choose any lesson and tap 'Start Drill' to practice with the timer!"),
    },
  ];

  const completedCount = checklistItems.filter((i) => i.isCompleted).length;
  const totalCount = checklistItems.length;
  const percentCompleted = Math.round((completedCount / totalCount) * 100);

  const handlePermanentClose = () => {
    localStorage.setItem(permanentKey, 'true');
    localStorage.setItem(dismissedKey, 'true');
    storage.saveSettings({
      ...storage.getSettings(),
      hasCompletedOnboarding: true,
      hasCompletedChecklist: true,
    });

    if (user?.id) {
      dismissChecklistMutation({ userId: user.id }).catch((err) => {
        console.debug('[GettingStartedChecklist] dismissal sync:', err);
      });
    }

    setIsPermanentlyFinished(true);
    setIsDismissed(true);
  };

  // When 100% is reached: Trigger full-screen confetti, celebratory fanfare, and permanently vanish
  useEffect(() => {
    if (percentCompleted === 100 && !isPermanentlyFinished && !isDismissed && !isCelebrating) {
      setIsCelebrating(true);
      setShowConfetti(true);
      playVictoryFanfare();

      // Automatically vanish the box after celebration animation
      const timer = setTimeout(() => {
        handlePermanentClose();
      }, 3500);

      return () => clearTimeout(timer);
    }
  }, [percentCompleted, isPermanentlyFinished, isDismissed, isCelebrating]);

  // If permanently finished or dismissed, only show the confetti overlay if it's currently animating
  if (backendCompleted || isPermanentlyFinished || isDismissed) {
    return showConfetti ? (
      <FullScreenConfetti onComplete={() => setShowConfetti(false)} />
    ) : null;
  }

  // Active Celebration Card before vanishing
  if (isCelebrating) {
    return (
      <>
        {showConfetti && <FullScreenConfetti onComplete={() => setShowConfetti(false)} />}
        <div className="fixed bottom-[calc(5.25rem+env(safe-area-inset-bottom,0px))] md:bottom-6 inset-x-3 sm:inset-x-auto sm:right-6 sm:w-[360px] max-w-sm z-40 animate-in zoom-in-95 duration-300">
          <div className="bg-gradient-to-br from-[#FFF9F2] via-white to-amber-50 rounded-3xl border-2 border-amber-400/80 shadow-[0_16px_50px_rgba(217,119,6,0.25)] p-6 text-center space-y-3.5 relative overflow-hidden">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-3xl shadow-inner animate-bounce">
              🏆
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-700 bg-amber-100 px-3 py-0.5 rounded-full border border-amber-300">
                100% Completed
              </span>
              <h3 className="text-base font-black text-[#2C211B] mt-2">
                Superstar Puppy Parent! 🎉
              </h3>
              <p className="text-xs text-[#766A63] mt-1 leading-relaxed">
                All 5 onboarding milestones complete! You and {puppy.name} are officially ready to thrive.
              </p>
            </div>
            <button
              onClick={handlePermanentClose}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-[#8B5E3C] text-white hover:bg-[#6F472C] transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Awesome, Let&apos;s Go! 🐾
            </button>
          </div>
        </div>
      </>
    );
  }

  // Minimized Floating Pill Mode
  if (isMinimized) {
    return (
      <>
        {showConfetti && <FullScreenConfetti onComplete={() => setShowConfetti(false)} />}
        <div className="fixed bottom-[calc(5.25rem+env(safe-area-inset-bottom,0px))] md:bottom-6 left-3 sm:left-auto sm:right-6 z-30 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <button
            onClick={handleToggleMinimize}
            className="flex items-center gap-3 px-4 py-2.5 bg-white border border-[#E8DDD3] rounded-2xl shadow-xl hover:shadow-2xl transition-all cursor-pointer group hover:border-[#8B5E3C]"
          >
            <div className="w-6 h-6 rounded-lg bg-[#F3E7DA] text-[#8B5E3C] flex items-center justify-center font-black text-xs">
              🐾
            </div>
            <div className="text-left">
              <div className="text-xs font-extrabold text-[#2C211B] flex items-center gap-1.5">
                Getting Started
                <span className="text-[10px] font-bold text-[#8B5E3C] bg-[#FFF9F2] px-2 py-0.2 rounded-full border border-[#E8DDD3]">
                  {completedCount}/{totalCount}
                </span>
              </div>
              <div className="w-24 bg-[#E8DDD3] h-1.5 rounded-full overflow-hidden mt-1">
                <div 
                  className="bg-[#8B5E3C] h-full transition-all duration-300" 
                  style={{ width: `${percentCompleted}%` }} 
                />
              </div>
            </div>
            <ChevronUp className="w-4 h-4 text-[#766A63] group-hover:text-[#2C211B] transition-transform" />
          </button>
        </div>
      </>
    );
  }

  return (
    <div className="fixed bottom-[calc(5.25rem+env(safe-area-inset-bottom,0px))] md:bottom-6 inset-x-3 sm:inset-x-auto sm:right-6 sm:w-[360px] max-w-sm z-40 animate-in fade-in zoom-in-95 duration-200">
      <div className="bg-white rounded-3xl border border-[#E8DDD3] shadow-[0_12px_40px_rgba(0,0,0,0.16)] p-5 overflow-hidden relative">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E8DDD3]/70">
          <span className="text-[11px] font-extrabold tracking-wider uppercase text-[#766A63]">
            Getting Started
          </span>

          <div className="flex items-center gap-1 text-[#766A63]">
            <button
              onClick={handleToggleMinimize}
              className="p-1.5 hover:text-[#2C211B] hover:bg-[#FFF9F2] rounded-lg transition-colors cursor-pointer"
              title="Minimize"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
            <button
              onClick={handleDismiss}
              className="p-1.5 hover:text-[#2C211B] hover:bg-[#FFF9F2] rounded-lg transition-colors cursor-pointer"
              title="Dismiss Checklist"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Greeting */}
        <div className="mt-3.5 mb-3">
          <h3 className="text-base font-extrabold text-[#2C211B] flex items-center gap-1.5">
            Hello {userName}! 👋
          </h3>
          <p className="text-xs text-[#766A63] mt-0.5">
            You&apos;re gonna be a {puppy.name} superstar!
          </p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5 mb-4">
          <div className="w-full bg-[#F3E7DA] h-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#8B5E3C] to-[#C99E7D] transition-all duration-500 rounded-full"
              style={{ width: `${percentCompleted}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-[#2C211B]">{percentCompleted}% Completed</span>
            <span className="text-[#8B5E3C]">
              {percentCompleted === 100 ? 'Superstar! 🎉' : percentCompleted >= 60 ? 'Almost there!' : 'Keep it up!'}
            </span>
          </div>
        </div>

        {/* Checklist Items (Strictly Automatic - Read Only Checkmarks) */}
        <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
          {checklistItems.map((item) => (
            <div
              key={item.id}
              className={`p-2.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                item.isCompleted
                  ? 'bg-[#FFF9F2]/70 border-[#E8DDD3]/80 opacity-80'
                  : 'bg-white border-[#E8DDD3] hover:border-[#8B5E3C]/40 shadow-2xs'
              }`}
            >
              <div className="flex items-start gap-2.5 min-w-0 flex-1">
                {/* Automatic Read-Only Status Indicator */}
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                    item.isCompleted
                      ? 'bg-[#8B5E3C] text-white shadow-xs'
                      : 'border-2 border-[#E8DDD3] bg-white text-transparent'
                  }`}
                  title={item.isCompleted ? 'Completed automatically' : 'Complete this action in the app'}
                >
                  {item.isCompleted ? (
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  ) : null}
                </div>

                {/* Text */}
                <div className="min-w-0 flex-1">
                  <h4
                    className={`text-xs font-bold truncate transition-colors ${
                      item.isCompleted
                        ? 'line-through text-[#766A63]'
                        : 'text-[#2C211B]'
                    }`}
                  >
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-[#766A63] truncate leading-tight mt-0.5">
                    {item.description}
                  </p>
                </div>
              </div>

              {/* Action Button - Guides the user to target page with spotlight tip */}
              {!item.isCompleted ? (
                <button
                  type="button"
                  onClick={item.onAction}
                  className="px-3 py-1 rounded-full text-xs font-bold bg-[#F3E7DA] text-[#8B5E3C] hover:bg-[#8B5E3C] hover:text-white transition-all cursor-pointer shrink-0 shadow-2xs"
                >
                  {item.actionText}
                </button>
              ) : (
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  Done
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
