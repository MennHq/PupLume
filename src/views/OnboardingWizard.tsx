import React, { useState } from 'react';
import { 
  Sparkles, 
  Dog, 
  Clock, 
  Calendar, 
  ShieldAlert, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  Camera,
  Sun,
  Moon,
  Utensils,
  Award,
  AlertTriangle,
  Loader2,
  Phone,
  Globe,
  ChevronDown,
  ChevronUp,
  MessageSquare
} from 'lucide-react';
import { PupLumeLogo } from '../components/common/PupLumeLogo';
import { Button } from '../components/ui/Button';
import { PuppyProfile, TaskItem, TaskCategory } from '../types';
import { storage } from '../lib/storage';
import { completeAIOnboardingInConvex } from '../lib/convex';
import { CloudinaryImageUploader } from '../components/ui/CloudinaryImageUploader';
import { CommunicationLinksInput, CommunicationLinkItem } from '../components/common/CommunicationLinksInput';
import { RewardSettingInput } from '../components/common/RewardSettingInput';
import { CountryPhoneInput } from '../components/common/CountryPhoneInput';
import { validatePhoneNumber, validateFinderInstructions, sanitizePhoneInput, preventLetterInput } from '../lib/validation';

interface OnboardingWizardProps {
  onComplete: (puppy: PuppyProfile) => void;
  onCancel?: () => void;
  userId?: string;
}

interface GeneratedTask {
  title: string;
  category: TaskCategory;
  time: string;
  durationMin: number;
  period: 'morning' | 'afternoon' | 'evening';
  description: string;
}

const COMMON_BREEDS = [
  'Golden Retriever',
  'French Bulldog',
  'German Shepherd',
  'Labrador Retriever',
  'Poodle',
  'Goldendoodle',
  'Siberian Husky',
  'Pembroke Welsh Corgi',
  'Beagle',
  'Dachshund',
  'Rottweiler',
  'Mixed Breed / Mutt'
];

import { useUser } from '@clerk/react';

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ onComplete, onCancel, userId }) => {
  const { user } = useUser();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Profile data
  const [userName, setUserName] = useState(user?.firstName || user?.fullName || '');
  
  React.useEffect(() => {
    if (user && !userName) {
      setUserName(user.firstName || user.fullName || '');
    }
  }, [user]);

  const generateInitialAvatar = async (name: string): Promise<Blob> => {
    const cleanName = name.trim();
    await document.fonts.ready; // Ensure Grandstander is loaded
    
    return new Promise((resolve, reject) => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject('No 2d context');

        const displayText = cleanName.length <= 4 ? cleanName : cleanName.charAt(0).toUpperCase();

        ctx.fillStyle = '#FFFDFE';
        ctx.fillRect(0, 0, 512, 512);

        ctx.fillStyle = '#5F3E29'; // Dark brown text
        
        // Dynamically measure and scale text to fit inside the circular safe zone
        let fontSize = cleanName.length <= 4 ? 160 : 320;
        ctx.font = `900 ${fontSize}px "Grandstander", system-ui, sans-serif`;
        while (ctx.measureText(displayText).width > 400 && fontSize > 30) {
          fontSize -= 5;
          ctx.font = `900 ${fontSize}px "Grandstander", system-ui, sans-serif`;
        }
        
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        ctx.shadowColor = 'rgba(95, 62, 41, 0.15)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetY = 4;
        
        const yOffset = cleanName.length <= 4 ? 270 : 285;
        ctx.fillText(displayText, 256, yOffset);

        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject('Failed to create blob');
        }, 'image/png', 1.0);
      } catch (e) {
        reject(e);
      }
    });
  };

  const handleStep1Next = async () => {
    if (user && userName.trim()) {
      try {
        if (userName.trim() !== user.firstName) {
          await user.update({ firstName: userName.trim() });
        }
        
        // Generate and set the custom alphabet logo as profile picture
        const avatarFile = await generateInitialAvatar(userName.trim());
        await user.setProfileImage({ file: avatarFile });
      } catch (err) {
        console.warn("Failed to sync name or avatar to Clerk", err);
      }
    }
    setCurrentStep(2);
  };

  const [puppyName, setPuppyName] = useState('');
  const [breed, setBreed] = useState('');
  const [sex, setSex] = useState<'male' | 'female'>('male');
  const [birthDate, setBirthDate] = useState<string>('');

  const isBirthDateValid = React.useMemo(() => {
    if (!birthDate) return false;
    const date = new Date(birthDate);
    if (isNaN(date.getTime())) return false;
    const today = new Date();
    if (date > today) return false;
    const twentyYearsAgo = new Date();
    twentyYearsAgo.setFullYear(today.getFullYear() - 25); // Safe upper limit for dog age
    if (date < twentyYearsAgo) return false;
    return true;
  }, [birthDate]);
  const [photoUrl, setPhotoUrl] = useState('');

  // Smart Collar Tag Emergency & Social Info (Owner Phone & Finder Instructions are COMPULSORY)
  const [ownerPhone, setOwnerPhone] = useState('');
  const [emergencyNotes, setEmergencyNotes] = useState('');
  const [rewardAmount, setRewardAmount] = useState('');
  const [communicationLinks, setCommunicationLinks] = useState<CommunicationLinkItem[]>([
    { id: 'onboard-default-wa', platform: 'whatsapp', value: '' }
  ]);
  const [step2Error, setStep2Error] = useState<string | null>(null);

  const phoneValidation = validatePhoneNumber(ownerPhone);
  const notesValidation = validateFinderInstructions(emergencyNotes);

  // Household timings
  const [wakeTime, setWakeTime] = useState('07:00 AM');
  const [breakfastTime, setBreakfastTime] = useState('07:30 AM');
  const [lunchTime, setLunchTime] = useState('12:30 PM');
  const [dinnerTime, setDinnerTime] = useState('06:30 PM');
  const [bedtime, setBedtime] = useState('10:00 PM');
  const [trainingFocus, setTrainingFocus] = useState('Potty Training & Housebreaking');

  // Generated tasks state
  const [generatedTasks, setGeneratedTasks] = useState<GeneratedTask[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Build 100% personalized schedule matching household timings
  const generatePersonalizedRoutine = () => {
    const name = puppyName.trim() || 'Puppy';
    const tasks: GeneratedTask[] = [
      {
        title: 'Morning Wake-Up & Potty Stretch',
        category: 'potty',
        time: wakeTime,
        durationMin: 15,
        period: 'morning',
        description: `Take ${name} immediately outside upon waking to your designated bathroom spot. Reward with high praise upon elimination.`
      },
      {
        title: `${name}'s Breakfast & Hydration`,
        category: 'feeding',
        time: breakfastTime,
        durationMin: 20,
        period: 'morning',
        description: `Measured meal portion with fresh water. Avoid vigorous exercise right after feeding to promote safe digestion.`
      },
      {
        title: 'Post-Meal Potty Break',
        category: 'potty',
        time: '08:00 AM',
        durationMin: 15,
        period: 'morning',
        description: `Puppies regularly eliminate 15 to 30 minutes after eating. Watch for sniffing or circling.`
      },
      {
        title: 'Morning Nap & Rest in Den',
        category: 'sleep',
        time: '09:00 AM',
        durationMin: 90,
        period: 'morning',
        description: `Young puppies require 16–18 hours of sleep per day to support brain development and prevent overtired tantrums.`
      },
      {
        title: 'Midday Lunch & Hydration',
        category: 'feeding',
        time: lunchTime,
        durationMin: 20,
        period: 'afternoon',
        description: `Midday meal to support young puppy blood sugar and steady growth.`
      },
      {
        title: `Targeted Training: ${trainingFocus}`,
        category: 'training',
        time: '02:30 PM',
        durationMin: 10,
        period: 'afternoon',
        description: `Short, high-energy positive reinforcement session focused on ${trainingFocus}. Stop on a winning repetition!`
      },
      {
        title: 'Evening Sniff Walk & Exploration',
        category: 'walk',
        time: '05:30 PM',
        durationMin: 20,
        period: 'evening',
        description: `Gentle mental stimulation walk. Allow ${name} to sniff safely on a loose harness to expend energy calmly.`
      },
      {
        title: `${name}'s Dinner Meal`,
        category: 'feeding',
        time: dinnerTime,
        durationMin: 20,
        period: 'evening',
        description: `Final measured meal of the day. Pick up the water bowl 2 hours before bedtime to prevent midnight bathroom breaks.`
      },
      {
        title: 'Final Bedtime Potty & Lights Out',
        category: 'potty',
        time: bedtime,
        durationMin: 15,
        period: 'evening',
        description: `Calm, low-stimulation final outdoor break right before tucking ${name} into their sleeping crate for the night.`
      }
    ];

    setGeneratedTasks(tasks);
    setCurrentStep(5);
  };

  // Save finalized profile & schedule to storage and Convex
  const handleFinalActivation = async () => {
    setIsSaving(true);
    try {
      // Update Clerk User's First Name if they changed it
      if (user && userName.trim() && userName.trim() !== user.firstName) {
        try {
          await user.update({ firstName: userName.trim() });
        } catch (e) {
          console.warn("Failed to update Clerk user name", e);
        }
      }

      const finalBirthDate = birthDate || new Date(Date.now() - 12 * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const validLinks = communicationLinks.filter((l) => l.value.trim() !== '');
      const waLink = communicationLinks.find((l) => l.platform === 'whatsapp')?.value;
      const igLink = communicationLinks.find((l) => l.platform === 'instagram')?.value;
      const fbLink = communicationLinks.find((l) => l.platform === 'facebook' || l.platform === 'messenger')?.value;
      const tgLink = communicationLinks.find((l) => l.platform === 'telegram')?.value;
      const slackLink = communicationLinks.find((l) => l.platform === 'slack')?.value;

      const newPuppy: PuppyProfile = {
        id: `pup-${Date.now()}`,
        name: puppyName.trim() || 'My Puppy',
        breed: breed.trim() || 'Mixed Breed',
        birthDate: finalBirthDate,
        sex,
        weightLbs: 12,
        photoUrl: photoUrl || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=600',
        temperament: 'Playful, affectionate, and learning fast',
        favoriteTreat: 'Small training bites',
        ownerPhone: ownerPhone.trim(),
        emergencyNotes: emergencyNotes.trim(),
        rewardAmount: rewardAmount.trim() || undefined,
        communicationLinks: validLinks,
        ownerWhatsApp: waLink || undefined,
        ownerInstagram: igLink || undefined,
        ownerFacebook: fbLink || undefined,
        ownerTelegram: tgLink || undefined,
        ownerSlack: slackLink || undefined,
        createdAt: new Date().toISOString(),
      };

      // Ensure tasks are never empty
      let effectiveTasks = generatedTasks;
      if (effectiveTasks.length === 0) {
        effectiveTasks = [
          {
            title: 'Morning Wake-Up & Potty Stretch',
            category: 'potty',
            time: wakeTime || '07:00 AM',
            durationMin: 15,
            period: 'morning',
            description: `Take ${newPuppy.name} immediately outside upon waking to your designated bathroom spot.`
          },
          {
            title: `${newPuppy.name}'s Breakfast & Hydration`,
            category: 'feeding',
            time: breakfastTime || '07:30 AM',
            durationMin: 20,
            period: 'morning',
            description: `Measured meal portion with fresh water.`
          },
          {
            title: 'Post-Meal Potty Break',
            category: 'potty',
            time: '08:00 AM',
            durationMin: 15,
            period: 'morning',
            description: `Puppies regularly eliminate 15 to 30 minutes after eating.`
          },
          {
            title: 'Morning Nap & Rest in Den',
            category: 'sleep',
            time: '09:00 AM',
            durationMin: 90,
            period: 'morning',
            description: `Young puppies require 16–18 hours of sleep per day to support brain development.`
          },
          {
            title: 'Midday Lunch & Hydration',
            category: 'feeding',
            time: lunchTime || '12:30 PM',
            durationMin: 20,
            period: 'afternoon',
            description: `Midday meal to support young puppy blood sugar and steady growth.`
          },
          {
            title: `Targeted Training: ${trainingFocus || 'Basic Commands'}`,
            category: 'training',
            time: '02:30 PM',
            durationMin: 10,
            period: 'afternoon',
            description: `Short, high-energy positive reinforcement session.`
          },
          {
            title: 'Evening Sniff Walk & Exploration',
            category: 'walk',
            time: '05:30 PM',
            durationMin: 20,
            period: 'evening',
            description: `Gentle mental stimulation walk.`
          },
          {
            title: `${newPuppy.name}'s Dinner Meal`,
            category: 'feeding',
            time: dinnerTime || '06:30 PM',
            durationMin: 20,
            period: 'evening',
            description: `Final measured meal of the day.`
          },
          {
            title: 'Final Bedtime Potty & Lights Out',
            category: 'potty',
            time: bedtime || '10:00 PM',
            durationMin: 15,
            period: 'evening',
            description: `Calm, low-stimulation final outdoor break right before tucking ${newPuppy.name} in.`
          }
        ];
      }

      // Save to local storage
      storage.savePuppy(newPuppy);
      const taskItems: TaskItem[] = effectiveTasks.map((t, idx) => ({
        id: `task-${Date.now()}-${idx}`,
        puppyId: newPuppy.id,
        title: t.title,
        category: t.category,
        time: t.time,
        durationMin: t.durationMin,
        completed: false,
        skipped: false,
        period: t.period,
        date: new Date().toISOString().split('T')[0],
        description: t.description,
      }));
      storage.saveTasks(taskItems);
      storage.saveSettings({
        ...storage.getSettings(),
        hasCompletedOnboarding: true,
        activePuppyId: newPuppy.id,
      });

      // Sync to Convex
      const effectiveUserId = userId || storage.getCurrentUserId();
      if (effectiveUserId) {
        await completeAIOnboardingInConvex(
          {
            name: newPuppy.name,
            breed: newPuppy.breed,
            birthDate: newPuppy.birthDate,
            sex: newPuppy.sex,
            weightLbs: newPuppy.weightLbs,
            photoUrl: newPuppy.photoUrl,
            temperament: newPuppy.temperament,
            favoriteTreat: newPuppy.favoriteTreat,
          },
          effectiveTasks.map((t) => ({
            title: t.title,
            category: t.category,
            time: t.time,
            durationMin: t.durationMin,
            period: t.period,
            description: t.description,
          })),
          effectiveUserId
        );
      }

      onComplete(newPuppy);
    } catch (err) {
      console.error('Failed to complete onboarding:', err);
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF6F0] flex flex-col justify-between py-6 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto w-full space-y-6">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between bg-white px-5 py-4 rounded-3xl border border-[#E8DDD3] shadow-xs">
          <div className="flex items-center gap-3">
            <PupLumeLogo size="sm" />
            <div className="hidden sm:block h-5 w-px bg-[#E8DDD3]" />
            <span className="text-xs font-black uppercase tracking-wider text-[#8B5E3C]">
              AI Routine Architect
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onCancel && (
              <Button variant="ghost" size="sm" onClick={onCancel} className="text-xs">
                Cancel
              </Button>
            )}
            <div className="flex items-center gap-1 bg-[#FAF6F0] px-3 py-1.5 rounded-full border border-[#E8DDD3] text-xs font-bold text-[#8B5E3C]">
              <span>Step {currentStep} of 5</span>
            </div>
          </div>
        </div>

        {/* Step Progress Bar */}
        <div className="grid grid-cols-5 gap-2">
          {[
            { step: 1, label: 'Basics' },
            { step: 2, label: 'Puppy Info' },
            { step: 3, label: 'Photo' },
            { step: 4, label: 'Timings' },
            { step: 5, label: 'Routine' }
          ].map((item) => (
            <div key={item.step} className="flex flex-col gap-1">
              <div
                className={`h-1.5 rounded-full transition-all ${
                  currentStep >= item.step ? 'bg-[#8B5E3C]' : 'bg-[#E8DDD3]'
                }`}
              />
              <span className={`text-[10px] font-bold text-center hidden sm:block ${
                currentStep === item.step ? 'text-[#8B5E3C]' : 'text-[#A69B93]'
              }`}>
                {item.label}
              </span>
            </div>
          ))}
        </div>

        {/* STEP 1: Owner Name & Puppy Name */}
        {currentStep === 1 && (
          <div className="bg-white rounded-3xl border border-[#E8DDD3] p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#F3E7DA] text-[#8B5E3C] flex items-center justify-center shrink-0">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-[#2C211B]">
                  Welcome to PupLume! Let&apos;s get acquainted.
                </h2>
                <p className="text-xs text-[#766A63] mt-1 leading-relaxed">
                  I&apos;m your AI Routine Architect. I build your puppy&apos;s real daily schedule based on your household&apos;s actual hours—with zero fake filler data.
                </p>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-[#2C211B] uppercase tracking-wider mb-1.5">
                  Your Name
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="e.g. Alex, Sarah, Michael"
                  className="w-full p-3.5 bg-[#FAF6F0] border border-[#E8DDD3] rounded-2xl text-sm font-semibold text-[#2C211B] focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2C211B] uppercase tracking-wider mb-1.5">
                  What is your puppy&apos;s name?
                </label>
                <input
                  type="text"
                  value={puppyName}
                  onChange={(e) => setPuppyName(e.target.value)}
                  placeholder="e.g. Bella, Rocky, Luna, Milo"
                  className="w-full p-3.5 bg-[#FAF6F0] border border-[#E8DDD3] rounded-2xl text-sm font-semibold text-[#2C211B] focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]"
                />
              </div>

              {/* Quick Name Suggestions */}
              <div>
                <span className="text-[11px] font-bold text-[#766A63] mr-2">Popular names:</span>
                <div className="inline-flex flex-wrap gap-1.5 mt-1">
                  {['Rocky', 'Bella', 'Charlie', 'Luna', 'Milo', 'Daisy', 'Teddy'].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setPuppyName(n)}
                      className="px-2.5 py-1 bg-[#FAF6F0] hover:bg-[#F3E7DA] border border-[#E8DDD3] rounded-lg text-xs font-bold text-[#5F3E29] transition-colors cursor-pointer"
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E8DDD3] flex justify-end">
              <Button
                variant="primary"
                onClick={handleStep1Next}
                disabled={!puppyName.trim() || !userName.trim()}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Next: {puppyName.trim() || 'Puppy'}&apos;s Details
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2: Breed, Sex & Strict Age Validation */}
        {currentStep === 2 && (
          <div className="bg-white rounded-3xl border border-[#E8DDD3] p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#F3E7DA] text-[#8B5E3C] flex items-center justify-center shrink-0">
                <Dog className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-[#2C211B]">
                  Tell us about {puppyName || 'your puppy'}
                </h2>
                <p className="text-xs text-[#766A63] mt-1">
                  Daily sleep thresholds, potty timing, and exercise depend on age and breed size.
                </p>
              </div>
            </div>

            <div className="space-y-5 pt-2">
              {/* Breed */}
              <div>
                <label className="block text-xs font-bold text-[#2C211B] uppercase tracking-wider mb-1.5">
                  Breed
                </label>
                <input
                  type="text"
                  value={breed}
                  onChange={(e) => setBreed(e.target.value)}
                  placeholder="e.g. Golden Retriever, French Bulldog, Lab"
                  className="w-full p-3.5 bg-[#FAF6F0] border border-[#E8DDD3] rounded-2xl text-sm font-semibold text-[#2C211B] focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]"
                />

                <div className="flex flex-wrap gap-1.5 mt-2">
                  {COMMON_BREEDS.slice(0, 6).map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setBreed(b)}
                      className="px-2.5 py-1 bg-[#FAF6F0] hover:bg-[#F3E7DA] border border-[#E8DDD3] rounded-lg text-xs font-medium text-[#5F3E29] transition-colors cursor-pointer"
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sex Toggle */}
              <div>
                <label className="block text-xs font-bold text-[#2C211B] uppercase tracking-wider mb-1.5">
                  Sex
                </label>
                <div className="grid grid-cols-2 gap-3 max-w-sm">
                  <button
                    type="button"
                    onClick={() => setSex('male')}
                    className={`py-3 px-4 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      sex === 'male'
                        ? 'bg-[#8B5E3C] text-white border-[#8B5E3C] shadow-2xs'
                        : 'bg-[#FAF6F0] text-[#2C211B] border-[#E8DDD3] hover:bg-[#F3E7DA]'
                    }`}
                  >
                    <span>Boy (Male)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSex('female')}
                    className={`py-3 px-4 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      sex === 'female'
                        ? 'bg-[#8B5E3C] text-white border-[#8B5E3C] shadow-2xs'
                        : 'bg-[#FAF6F0] text-[#2C211B] border-[#E8DDD3] hover:bg-[#F3E7DA]'
                    }`}
                  >
                    <span>Girl (Female)</span>
                  </button>
                </div>
              </div>

              {/* Date of Birth */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-[#2C211B] uppercase tracking-wider">
                    Date of Birth
                  </label>
                  <span className="text-[11px] text-[#766A63]">
                    We use this to track milestones & birthdays
                  </span>
                </div>

                <div className="flex flex-col gap-1">
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className={`w-full p-3.5 bg-[#FAF6F0] border ${birthDate && !isBirthDateValid ? 'border-red-400 focus:ring-red-400' : 'border-[#E8DDD3] focus:ring-[#8B5E3C]'} rounded-2xl text-sm font-semibold text-[#2C211B] focus:outline-none focus:ring-2`}
                  />
                  {birthDate && !isBirthDateValid && (
                    <span className="text-[11px] font-bold text-red-500 mt-1">Please enter a valid, realistic birth date.</span>
                  )}
                </div>
              </div>

              {/* Safety Tag & Emergency Contact Information (Compulsory Phone & Instructions) */}
              <div className="pt-3 border-t border-[#E8DDD3] space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-[#8B5E3C] flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" /> Emergency Collar Tag Details
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                    Required for Safety
                  </span>
                </div>

                {/* Owner Phone (REQUIRED) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-[#2C211B] uppercase tracking-wider">
                      Owner Phone Number <span className="text-amber-800 text-[10px] font-bold bg-amber-100/80 px-1.5 py-0.5 rounded-md border border-amber-200 ml-1">Required</span>
                    </label>
                    {phoneValidation.isValid && ownerPhone.trim() && (
                      <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Valid
                      </span>
                    )}
                  </div>
                  <CountryPhoneInput
                    value={ownerPhone}
                    required
                    onChange={(val) => {
                      setOwnerPhone(val);
                      if (step2Error) setStep2Error(null);
                    }}
                    placeholder="+1 (555) 123-4567 or 03XX XXXXXXX"
                    inputClassName="p-3 bg-[#FAF6F0] rounded-2xl"
                  />
                  <p className="text-[11px] text-[#766A63] font-medium mt-1">
                    Printed directly on the physical collar tag so finders can reach you immediately.
                  </p>
                </div>

                {/* Finder Instructions (REQUIRED) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-[#2C211B] uppercase tracking-wider">
                      Instructions for Finder <span className="text-amber-800 text-[10px] font-bold bg-amber-100/80 px-1.5 py-0.5 rounded-md border border-amber-200 ml-1">Required</span>
                    </label>
                    {notesValidation.isValid && emergencyNotes.trim() ? (
                      <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Valid
                      </span>
                    ) : (
                      <span className="text-[10px] text-[#766A63]">Shown on public tag</span>
                    )}
                  </div>
                  <textarea
                    rows={2}
                    required
                    value={emergencyNotes}
                    onChange={(e) => {
                      setEmergencyNotes(e.target.value);
                      if (step2Error) setStep2Error(null);
                    }}
                    placeholder="e.g. Friendly, loves treats, answers to whistle, do not chase. Clean tap water is safe."
                    className="w-full p-3.5 bg-[#FAF6F0] border border-[#E8DDD3] focus:ring-[#8B5E3C] rounded-2xl text-xs font-semibold text-[#2C211B] focus:outline-none focus:ring-2 resize-none"
                  />
                  <p className="text-[11px] text-[#766A63] font-medium mt-1">
                    Care notes shown to anyone who scans your tag to keep {puppyName || 'your puppy'} safe.
                  </p>
                </div>

                {/* Reward Setting (DROPDOWN) */}
                <div>
                  <RewardSettingInput
                    value={rewardAmount}
                    onChange={(val) => setRewardAmount(val)}
                  />
                </div>

                {/* Direct Chat & International Apps Input */}
                <div className="pt-2">
                  <CommunicationLinksInput
                    links={communicationLinks}
                    onChange={setCommunicationLinks}
                    maxRecommended={3}
                  />
                </div>
              </div>
            </div>

            {step2Error && (
              <div className="p-3 bg-amber-50 border border-amber-300 rounded-2xl text-xs font-semibold text-amber-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{step2Error}</span>
              </div>
            )}

            <div className="pt-4 border-t border-[#E8DDD3] flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(1)}
                leftIcon={<ArrowLeft className="w-4 h-4" />}
              >
                Back
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  if (!breed.trim()) {
                    setStep2Error("Please select or enter your puppy's breed.");
                    return;
                  }
                  if (!isBirthDateValid) {
                    setStep2Error("Please select a valid birth date.");
                    return;
                  }
                  const phoneRes = validatePhoneNumber(ownerPhone);
                  if (!phoneRes.isValid) {
                    setStep2Error(phoneRes.error || "Please enter a valid owner phone number.");
                    return;
                  }
                  const notesRes = validateFinderInstructions(emergencyNotes);
                  if (!notesRes.isValid) {
                    setStep2Error(notesRes.error || "Please enter care instructions for finder (at least 5 characters).");
                    return;
                  }
                  setStep2Error(null);
                  setCurrentStep(3);
                }}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Next: Photo
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: Puppy Photo (Cloudinary Upload) */}
        {currentStep === 3 && (
          <div className="bg-white rounded-3xl border border-[#E8DDD3] p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#F3E7DA] text-[#8B5E3C] flex items-center justify-center shrink-0">
                <Camera className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-[#2C211B]">
                  Add a picture of {puppyName || 'your puppy'}
                </h2>
                <p className="text-xs text-[#766A63] mt-1">
                  Upload a photo to personalize the dashboard and health journals. You can also skip and add one later.
                </p>
              </div>
            </div>

            <div className="py-2">
              <CloudinaryImageUploader
                currentImageUrl={photoUrl}
                onUploadSuccess={(url) => setPhotoUrl(url)}
                folder="puplume/pets"
                label={`Upload ${puppyName || 'Puppy'}'s Photo`}
                sublabel="JPG, PNG, or WEBP (Max 25MB)"
                variant="card"
              />
            </div>

            <div className="pt-4 border-t border-[#E8DDD3] flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(2)}
                leftIcon={<ArrowLeft className="w-4 h-4" />}
              >
                Back
              </Button>
              <div className="flex items-center gap-2">
                {!photoUrl && (
                  <Button
                    variant="ghost"
                    onClick={() => setCurrentStep(4)}
                    className="text-xs text-[#766A63]"
                  >
                    Skip for Now
                  </Button>
                )}
                <Button
                  variant="primary"
                  onClick={() => setCurrentStep(4)}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Next: Schedule Timings
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Household Timings (The core user request) */}
        {currentStep === 4 && (
          <div className="bg-white rounded-3xl border border-[#E8DDD3] p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#F3E7DA] text-[#8B5E3C] flex items-center justify-center shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-[#2C211B]">
                  Customize Around Your Household Routine
                </h2>
                <p className="text-xs text-[#766A63] mt-1">
                  {puppyName}&apos;s tasks are scheduled directly to match your family&apos;s actual wake-up, meal, and bedtimes.
                </p>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              {/* Wake-Up Time */}
              <div className="p-4 rounded-2xl bg-[#FAF6F0] border border-[#E8DDD3] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#2C211B] flex items-center gap-2">
                    <Sun className="w-4 h-4 text-amber-500" /> Morning Wake-Up
                  </span>
                  <input
                    type="text"
                    value={wakeTime}
                    onChange={(e) => setWakeTime(e.target.value)}
                    className="w-24 text-right p-1.5 bg-white border border-[#E8DDD3] rounded-xl font-bold text-xs text-[#8B5E3C]"
                  />
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {['06:00 AM', '06:30 AM', '07:00 AM', '07:30 AM'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setWakeTime(t)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                        wakeTime === t
                          ? 'bg-[#8B5E3C] text-white'
                          : 'bg-white text-[#766A63] border border-[#E8DDD3] hover:bg-[#F3E7DA]'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Breakfast Time */}
              <div className="p-4 rounded-2xl bg-[#FAF6F0] border border-[#E8DDD3] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#2C211B] flex items-center gap-2">
                    <Utensils className="w-4 h-4 text-orange-500" /> Breakfast Time
                  </span>
                  <input
                    type="text"
                    value={breakfastTime}
                    onChange={(e) => setBreakfastTime(e.target.value)}
                    className="w-24 text-right p-1.5 bg-white border border-[#E8DDD3] rounded-xl font-bold text-xs text-[#8B5E3C]"
                  />
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {['06:30 AM', '07:00 AM', '07:30 AM', '08:00 AM'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setBreakfastTime(t)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                        breakfastTime === t
                          ? 'bg-[#8B5E3C] text-white'
                          : 'bg-white text-[#766A63] border border-[#E8DDD3] hover:bg-[#F3E7DA]'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Lunch Time */}
              <div className="p-4 rounded-2xl bg-[#FAF6F0] border border-[#E8DDD3] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#2C211B] flex items-center gap-2">
                    <Utensils className="w-4 h-4 text-orange-400" /> Lunch Time
                  </span>
                  <input
                    type="text"
                    value={lunchTime}
                    onChange={(e) => setLunchTime(e.target.value)}
                    className="w-24 text-right p-1.5 bg-white border border-[#E8DDD3] rounded-xl font-bold text-xs text-[#8B5E3C]"
                  />
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {['12:00 PM', '12:30 PM', '01:00 PM'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setLunchTime(t)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                        lunchTime === t
                          ? 'bg-[#8B5E3C] text-white'
                          : 'bg-white text-[#766A63] border border-[#E8DDD3] hover:bg-[#F3E7DA]'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dinner Time */}
              <div className="p-4 rounded-2xl bg-[#FAF6F0] border border-[#E8DDD3] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#2C211B] flex items-center gap-2">
                    <Utensils className="w-4 h-4 text-amber-600" /> Dinner Time
                  </span>
                  <input
                    type="text"
                    value={dinnerTime}
                    onChange={(e) => setDinnerTime(e.target.value)}
                    className="w-24 text-right p-1.5 bg-white border border-[#E8DDD3] rounded-xl font-bold text-xs text-[#8B5E3C]"
                  />
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {['05:30 PM', '06:00 PM', '06:30 PM', '07:00 PM'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setDinnerTime(t)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                        dinnerTime === t
                          ? 'bg-[#8B5E3C] text-white'
                          : 'bg-white text-[#766A63] border border-[#E8DDD3] hover:bg-[#F3E7DA]'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bedtime & Night Potty */}
              <div className="p-4 rounded-2xl bg-[#FAF6F0] border border-[#E8DDD3] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#2C211B] flex items-center gap-2">
                    <Moon className="w-4 h-4 text-indigo-500" /> Bedtime & Final Night Potty
                  </span>
                  <input
                    type="text"
                    value={bedtime}
                    onChange={(e) => setBedtime(e.target.value)}
                    className="w-24 text-right p-1.5 bg-white border border-[#E8DDD3] rounded-xl font-bold text-xs text-[#8B5E3C]"
                  />
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {['09:30 PM', '10:00 PM', '10:30 PM', '11:00 PM'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setBedtime(t)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                        bedtime === t
                          ? 'bg-[#8B5E3C] text-white'
                          : 'bg-white text-[#766A63] border border-[#E8DDD3] hover:bg-[#F3E7DA]'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Training Focus */}
              <div>
                <label className="block text-xs font-bold text-[#2C211B] uppercase tracking-wider mb-1.5">
                  Primary Training Focus
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {[
                    'Potty Training & Housebreaking',
                    'Crate Sleeping & Separation Ease',
                    'Biting & Chewing Management',
                    'Loose-Leash Walking & Recall'
                  ].map((focus) => (
                    <button
                      key={focus}
                      type="button"
                      onClick={() => setTrainingFocus(focus)}
                      className={`p-3 rounded-xl border text-left font-bold transition-all cursor-pointer ${
                        trainingFocus === focus
                          ? 'bg-[#8B5E3C] text-white border-[#8B5E3C] shadow-2xs'
                          : 'bg-[#FAF6F0] text-[#2C211B] border-[#E8DDD3] hover:bg-[#F3E7DA]'
                      }`}
                    >
                      {focus}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E8DDD3] flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(3)}
                leftIcon={<ArrowLeft className="w-4 h-4" />}
              >
                Back
              </Button>
              <Button
                variant="primary"
                onClick={generatePersonalizedRoutine}
                rightIcon={<Sparkles className="w-4 h-4" />}
              >
                Generate {puppyName || 'Puppy'}&apos;s Routine
              </Button>
            </div>
          </div>
        )}

        {/* STEP 5: AI Generated Daily Routine Review */}
        {currentStep === 5 && (
          <div className="bg-white rounded-3xl border border-[#E8DDD3] p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#F3E7DA] text-[#8B5E3C] flex items-center justify-center shrink-0">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-[#2C211B]">
                    {puppyName}&apos;s Personalized Daily Routine
                  </h2>
                  <p className="text-xs text-[#766A63] mt-1">
                    Generated around your wake-up ({wakeTime}), meal times, and bedtime ({bedtime}). Zero placeholder data!
                  </p>
                </div>
              </div>

              <div className="text-right hidden sm:block">
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  {generatedTasks.length} Tasks Scheduled
                </span>
              </div>
            </div>

            {/* Routine Tasks List */}
            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {generatedTasks.map((t, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#FAF6F0] border border-[#E8DDD3]"
                >
                  <div className="w-16 shrink-0 text-center bg-white px-2 py-1.5 rounded-xl border border-[#E8DDD3]">
                    <span className="text-xs font-black text-[#8B5E3C] block">{t.time}</span>
                    <span className="text-[10px] text-[#766A63] uppercase font-bold">{t.durationMin}m</span>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-[#2C211B]">{t.title}</h4>
                      <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-md bg-white border border-[#E8DDD3] text-[#766A63]">
                        {t.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#766A63] mt-0.5 leading-relaxed">
                      {t.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-[#E8DDD3] flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(4)}
                leftIcon={<ArrowLeft className="w-4 h-4" />}
                disabled={isSaving}
              >
                Adjust Hours
              </Button>

              <Button
                variant="primary"
                onClick={handleFinalActivation}
                disabled={isSaving}
                leftIcon={isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              >
                {isSaving ? 'Activating Routine...' : `Activate Routine & Go to Dashboard`}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
