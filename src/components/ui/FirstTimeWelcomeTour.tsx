import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  CalendarCheck, 
  Clock, 
  GraduationCap, 
  Bot, 
  ArrowRight, 
  ArrowLeft, 
  X, 
  Dog
} from 'lucide-react';
import { PuppyProfile } from '../../types';
import { storage } from '../../lib/storage';

interface FirstTimeWelcomeTourProps {
  puppy: PuppyProfile;
  onTourComplete?: () => void;
}

export const FirstTimeWelcomeTour: React.FC<FirstTimeWelcomeTourProps> = ({ puppy, onTourComplete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const storageKey = `puplume_seen_tour_${storage.getCurrentUserId() || 'guest'}_${puppy.id}`;

  useEffect(() => {
    // Check if user has already seen this tour
    const hasSeen = localStorage.getItem(storageKey);
    if (!hasSeen) {
      // Small 800ms delay so user sees dashboard first, then gets greeted
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [storageKey]);

  // Listen for custom trigger to replay tour from settings or menu
  useEffect(() => {
    const handleReplay = () => {
      setCurrentStep(1);
      setIsOpen(true);
    };
    window.addEventListener('replay-welcome-tour', handleReplay);
    return () => window.removeEventListener('replay-welcome-tour', handleReplay);
  }, []);

  const handleFinish = () => {
    localStorage.setItem(storageKey, 'true');
    setIsOpen(false);
    if (onTourComplete) onTourComplete();
  };

  if (!isOpen) return null;

  const totalSteps = 5;

  const steps = [
    {
      step: 1,
      badge: "Welcome to PupLume",
      title: `Welcome to ${puppy.name}'s Digital Home! 🐾`,
      description: `Raising a puppy is joyous but intensely overwhelming. PupLume gives you structure, biological sleep balance, and veterinary-grade puppy guidance all in one place.`,
      icon: <Dog className="w-8 h-8 text-[#8B5E3C]" />,
      highlight: `Personalized for your ${puppy.breed || 'puppy'}`
    },
    {
      step: 2,
      badge: "Step 1: Biological Rhythms",
      title: "Enforced Naps & Potty Predictability ⏰",
      description: `Young puppies require 16 to 18 hours of sleep per day. When overtired, they turn into frantic 'land sharks' that bite and have indoor accidents. Your daily plan automatically schedules wake windows and den naps to prevent meltdowns.`,
      icon: <Clock className="w-8 h-8 text-amber-600" />,
      highlight: "Stops evening witching hours & biting tantrums"
    },
    {
      step: 3,
      badge: "Step 2: Effortless Tracking",
      title: "1-Tap Quick Logging & Schedule Checking ⚡",
      description: `Double-tap any task to check it off as done. Need to log an unplanned potty break, midday meal, or walk? Simply tap the glowing (+) button on your screen anytime to record it in under 2 seconds.`,
      icon: <CalendarCheck className="w-8 h-8 text-emerald-600" />,
      highlight: "Keeps your daily rhythm and bladder countdowns accurate"
    },
    {
      step: 4,
      badge: "Step 3: 24/7 Intelligence",
      title: `AI Co-Pilot Trained on ${puppy.name} 🧠`,
      description: `Have a panic moment at 11 PM? 'Ask AI' knows ${puppy.name}'s exact age (${puppy.breed}) and current routine. Ask about teething, crate crying, leash biting, or food safety for immediate expert advice.`,
      icon: <Bot className="w-8 h-8 text-[#8B5E3C]" />,
      highlight: "No more doom-scrolling conflicting online forums"
    },
    {
      step: 5,
      badge: "Step 4: Real Confidence",
      title: "Academy Drills & Offline Protection 🎓",
      description: `Follow 5-minute training drills with built-in practice timers. Best of all, PupLume works completely offline on outdoor walks and syncs seamlessly to the cloud when you return home!`,
      icon: <GraduationCap className="w-8 h-8 text-indigo-600" />,
      highlight: "All set! You're ready to give your puppy the best start."
    }
  ];

  const current = steps[currentStep - 1];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2C211B]/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl border border-[#E8DDD3] shadow-2xl p-6 sm:p-8 overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Decorative Top Accent */}
        <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-[#8B5E3C] via-[#A87954] to-[#C99E7D]" />

        {/* Close / Skip button */}
        <button
          onClick={handleFinish}
          className="absolute top-4 right-4 p-2 text-[#766A63] hover:text-[#2C211B] rounded-full hover:bg-[#FFF9F2] transition-colors cursor-pointer"
          title="Skip Tour"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Step Indicator & Icon */}
        <div className="flex items-center justify-between mb-6 pt-2">
          <div className="w-14 h-14 rounded-2xl bg-[#FFF9F2] border border-[#E8DDD3] flex items-center justify-center shadow-xs">
            {current.icon}
          </div>

          <div className="flex items-center gap-1.5">
            {steps.map((s) => (
              <div
                key={s.step}
                className={`h-2 rounded-full transition-all duration-300 ${
                  s.step === currentStep 
                    ? 'w-7 bg-[#8B5E3C]' 
                    : s.step < currentStep 
                      ? 'w-2.5 bg-[#8B5E3C]/40' 
                      : 'w-2.5 bg-[#E8DDD3]'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="space-y-3">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#8B5E3C] bg-[#FFF9F2] px-3 py-1 rounded-full border border-[#E8DDD3]">
            {current.badge} • {currentStep} of {totalSteps}
          </span>

          <h2 className="text-xl sm:text-2xl font-black text-[#2C211B] leading-tight">
            {current.title}
          </h2>

          <p className="text-xs sm:text-sm text-[#766A63] leading-relaxed">
            {current.description}
          </p>

          <div className="p-3 rounded-2xl bg-[#FFF9F2] border border-[#E8DDD3]/80 flex items-center gap-2.5 text-xs font-bold text-[#5F3E29]">
            <Sparkles className="w-4 h-4 text-[#8B5E3C] shrink-0" />
            <span>{current.highlight}</span>
          </div>
        </div>

        {/* Navigation Footer */}
        <div className="flex items-center justify-between pt-6 mt-6 border-t border-[#E8DDD3]">
          {currentStep > 1 ? (
            <button
              onClick={() => setCurrentStep((s) => s - 1)}
              className="px-4 py-2.5 text-xs font-bold text-[#766A63] hover:text-[#2C211B] flex items-center gap-1.5 rounded-xl hover:bg-[#FFF9F2] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="px-4 py-2.5 text-xs font-bold text-[#A39B96] hover:text-[#2C211B] transition-colors cursor-pointer"
            >
              Skip Tour
            </button>
          )}

          {currentStep < totalSteps ? (
            <button
              onClick={() => setCurrentStep((s) => s + 1)}
              className="px-5 py-2.5 rounded-xl bg-[#8B5E3C] hover:bg-[#6D492F] text-white text-xs font-bold flex items-center gap-2 transition-all shadow-sm hover:shadow-md cursor-pointer"
            >
              Next Step <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="px-6 py-2.5 rounded-xl bg-[#8B5E3C] hover:bg-[#6D492F] text-white text-xs font-bold flex items-center gap-2 transition-all shadow-sm hover:shadow-md cursor-pointer"
            >
              Get Started with {puppy.name} 🐾
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
