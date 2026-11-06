import React, { useState } from 'react';
import { 
  Plus, 
  Droplet, 
  Utensils, 
  Moon, 
  Footprints, 
  GraduationCap, 
  DollarSign, 
  Pill, 
  FileText, 
  Sparkles,
  Check
} from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';
import { storage } from '../../lib/storage';
import { nativeBridge } from '../../lib/nativeBridge';
import { playNotificationChime } from '../../lib/sound';
import { Camera, Scissors, Smile, Meh, Frown, Heart } from 'lucide-react';
import { CloudinaryImageUploader } from './CloudinaryImageUploader';

interface QuickActionSheetProps {
  onActionComplete: (msg: string) => void;
}

export const QuickActionSheet: React.FC<QuickActionSheetProps> = ({ onActionComplete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const handleActionDone = (msg: string) => {
    nativeBridge.haptics.success();
    playNotificationChime();
    onActionComplete(msg);
  };

  // Form states
  const [pottyType, setPottyType] = useState<'pee' | 'poop' | 'both' | 'accident'>('pee');
  const [pottyLocation, setPottyLocation] = useState<'outdoor' | 'pad' | 'indoor_accident'>('outdoor');
  const [pottyNotes, setPottyNotes] = useState('');

  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack' | 'water'>('lunch');
  const [foodAmount, setFoodAmount] = useState('0.75');
  const [foodNotes, setFoodNotes] = useState('');

  const [sleepDuration, setSleepDuration] = useState('60');
  const [sleepType, setSleepType] = useState<'nap' | 'night' | 'crate'>('nap');

  const [walkDuration, setWalkDuration] = useState('15');
  const [walkDistance, setWalkDistance] = useState('0.4');

  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCategory, setExpenseCategory] = useState<any>('food');

  const [noteText, setNoteText] = useState('');

  // Memory & Socialization quick states
  const [memoryTitle, setMemoryTitle] = useState('');
  const [memoryPhotoUrl, setMemoryPhotoUrl] = useState('');
  const [memoryNotes, setMemoryNotes] = useState('');
  const [socialItems, setSocialItems] = useState(() => storage.getSocialization().filter(s => s.status === 'unexposed').slice(0, 4));

  const activePuppy = storage.getActivePuppy();
  if (!activePuppy) return null;

  const handleSavePotty = (e: React.FormEvent) => {
    e.preventDefault();
    storage.addPottyLog({
      puppyId: activePuppy.id,
      type: pottyType,
      location: pottyLocation,
      timestamp: new Date().toISOString(),
      notes: pottyNotes || `${pottyType.toUpperCase()} at ${pottyLocation}`
    });
    setActiveModal(null);
    handleActionDone(`Logged ${pottyType} for ${activePuppy.name}`);
  };

  const handleSaveFood = (e: React.FormEvent) => {
    e.preventDefault();
    storage.addFeedingLog({
      puppyId: activePuppy.id,
      mealType,
      amountCups: parseFloat(foodAmount) || 0.5,
      foodBrand: 'Puppy Formula Kibble',
      timestamp: new Date().toISOString(),
      notes: foodNotes
    });
    setActiveModal(null);
    handleActionDone(`Logged ${mealType} for ${activePuppy.name}`);
  };

  const handleSaveWater = () => {
    storage.addFeedingLog({
      puppyId: activePuppy.id,
      mealType: 'water',
      foodBrand: 'Fresh filtered water',
      timestamp: new Date().toISOString(),
      notes: 'Refilled water bowl'
    });
    setIsOpen(false);
    handleActionDone(`Logged fresh water bowl for ${activePuppy.name}`);
  };

  const handleSaveSleep = (e: React.FormEvent) => {
    e.preventDefault();
    const duration = parseInt(sleepDuration, 10) || 45;
    storage.addSleepLog({
      puppyId: activePuppy.id,
      type: sleepType,
      startTime: new Date(Date.now() - duration * 60000).toISOString(),
      endTime: new Date().toISOString(),
      durationMin: duration,
      notes: `${sleepType === 'crate' ? 'Crate rest' : 'Sleep'} logged`
    });
    setActiveModal(null);
    handleActionDone(`Logged ${duration}m sleep for ${activePuppy.name}`);
  };

  const handleSaveWalk = (e: React.FormEvent) => {
    e.preventDefault();
    const dur = parseInt(walkDuration, 10) || 15;
    storage.addWalkLog({
      puppyId: activePuppy.id,
      startTime: new Date(Date.now() - dur * 60000).toISOString(),
      durationMin: dur,
      distanceMiles: parseFloat(walkDistance) || 0.3,
      peesCount: 1,
      poopsCount: 0,
      pullingRating: 'none',
      notes: 'Logged via quick actions'
    });
    setActiveModal(null);
    handleActionDone(`Logged ${dur}m walk for ${activePuppy.name}`);
  };

  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(expenseAmount);
    if (!expenseTitle || isNaN(amount)) return;
    storage.addExpense({
      puppyId: activePuppy.id,
      title: expenseTitle,
      category: expenseCategory,
      amount,
      date: new Date().toISOString().split('T')[0],
      vendor: 'Local Store'
    });
    setActiveModal(null);
    setExpenseTitle('');
    setExpenseAmount('');
    handleActionDone(`Added $${amount.toFixed(2)} expense for ${activePuppy.name}`);
  };

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    storage.addJournalEntry({
      puppyId: activePuppy.id,
      title: `Puppy Log: ${noteText.slice(0, 30)}...`,
      date: new Date().toISOString().split('T')[0],
      notes: noteText
    });
    setActiveModal(null);
    setNoteText('');
    handleActionDone(`Saved observation for ${activePuppy.name}`);
  };

  const handleSaveMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memoryTitle.trim()) return;
    storage.addJournalEntry({
      puppyId: activePuppy.id,
      title: memoryTitle.trim(),
      notes: memoryNotes.trim(),
      mediaUrl: memoryPhotoUrl || undefined,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      milestoneBadge: 'Memory'
    });
    setActiveModal(null);
    setMemoryTitle('');
    setMemoryPhotoUrl('');
    setMemoryNotes('');
    handleActionDone(`Saved memory photo for ${activePuppy.name} 📸`);
  };

  const handleMarkSocial = (itemId: string, status: 'positive' | 'neutral' | 'needs_work') => {
    storage.updateSocializationStatus(itemId, status);
    setSocialItems(prev => prev.filter(s => s.id !== itemId));
    handleActionDone(`Logged socialization experience! 🐾`);
  };

  const actions = [
    {
      id: 'potty',
      label: 'Potty',
      icon: <Droplet className="w-5 h-5 text-emerald-600" />,
      bg: 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200/60',
      action: () => { setIsOpen(false); setActiveModal('potty'); }
    },
    {
      id: 'food',
      label: 'Food',
      icon: <Utensils className="w-5 h-5 text-amber-600" />,
      bg: 'bg-amber-50 hover:bg-amber-100 border-amber-200/60',
      action: () => { setIsOpen(false); setActiveModal('food'); }
    },
    {
      id: 'water',
      label: 'Water',
      icon: <Sparkles className="w-5 h-5 text-sky-600" />,
      bg: 'bg-sky-50 hover:bg-sky-100 border-sky-200/60',
      action: handleSaveWater
    },
    {
      id: 'sleep',
      label: 'Sleep / Nap',
      icon: <Moon className="w-5 h-5 text-indigo-600" />,
      bg: 'bg-indigo-50 hover:bg-indigo-100 border-indigo-200/60',
      action: () => { setIsOpen(false); setActiveModal('sleep'); }
    },
    {
      id: 'walk',
      label: 'Walk',
      icon: <Footprints className="w-5 h-5 text-teal-600" />,
      bg: 'bg-teal-50 hover:bg-teal-100 border-teal-200/60',
      action: () => { setIsOpen(false); setActiveModal('walk'); }
    },
    {
      id: 'expense',
      label: 'Expense',
      icon: <DollarSign className="w-5 h-5 text-[#8B5E3C]" />,
      bg: 'bg-[#F3E7DA] hover:bg-[#E8DDD3] border-[#E8DDD3]',
      action: () => { setIsOpen(false); setActiveModal('expense'); }
    },
    {
      id: 'note',
      label: 'Quick Note',
      icon: <FileText className="w-5 h-5 text-purple-600" />,
      bg: 'bg-purple-50 hover:bg-purple-100 border-purple-200/60',
      action: () => { setIsOpen(false); setActiveModal('note'); }
    },
    {
      id: 'memory',
      label: 'Snap Memory',
      icon: <Camera className="w-5 h-5 text-pink-600" />,
      bg: 'bg-pink-50 hover:bg-pink-100 border-pink-200/60',
      action: () => { setIsOpen(false); setActiveModal('memory'); }
    },
    {
      id: 'social',
      label: 'Socialize',
      icon: <Scissors className="w-5 h-5 text-purple-600" />,
      bg: 'bg-purple-50 hover:bg-purple-100 border-purple-200/60',
      action: () => { 
        setSocialItems(storage.getSocialization().filter(s => s.status === 'unexposed').slice(0, 4));
        setIsOpen(false); 
        setActiveModal('social'); 
      }
    }
  ];

  return (
    <>
      {/* Floating Action Button for Mobile & Desktop */}
      <div className="fixed bottom-[calc(5.25rem+env(safe-area-inset-bottom,0px))] sm:bottom-8 right-4 sm:right-8 z-40">
        <button
          id="quick-action-fab"
          onClick={() => {
            nativeBridge.haptics.medium();
            setIsOpen(true);
          }}
          className="w-14 h-14 rounded-full bg-[#8B5E3C] hover:bg-[#5F3E29] active:bg-[#4A2F1E] text-white shadow-lg hover:shadow-xl flex items-center justify-center transition-transform active:scale-95 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8B5E3C]"
          aria-label="Quick puppy action menu"
        >
          <Plus className="w-7 h-7 stroke-[2.5]" />
        </button>
      </div>

      {/* Quick Action Picker BottomSheet */}
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={`Quick Log for ${activePuppy.name}`}
        subtitle="Record an event in one tap"
      >
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 py-2">
          {actions.map((act) => (
            <button
              key={act.id}
              id={`quick-action-btn-${act.id}`}
              onClick={act.action}
              className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border ${act.bg} transition-transform active:scale-95 cursor-pointer text-center group`}
            >
              <div className="p-2 rounded-xl bg-white/80 shadow-xs mb-1.5 group-hover:scale-105 transition-transform">
                {act.icon}
              </div>
              <span className="text-xs font-semibold text-[#2C211B] leading-tight">
                {act.label}
              </span>
            </button>
          ))}
        </div>
      </Modal>

      {/* Potty Modal */}
      <Modal
        isOpen={activeModal === 'potty'}
        onClose={() => setActiveModal(null)}
        title={`Log Potty for ${activePuppy.name}`}
      >
        <form onSubmit={handleSavePotty} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#2C211B] uppercase tracking-wider mb-2">
              Event Type
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'pee', label: 'Pee' },
                { id: 'poop', label: 'Poop' },
                { id: 'both', label: 'Both' },
                { id: 'accident', label: 'Accident' }
              ].map(item => (
                <button
                  type="button"
                  key={item.id}
                  id={`potty-type-${item.id}`}
                  onClick={() => {
                    setPottyType(item.id as any);
                    if (item.id === 'accident') setPottyLocation('indoor_accident');
                    else setPottyLocation('outdoor');
                  }}
                  className={`py-2 px-1 rounded-xl text-xs font-bold border transition-colors cursor-pointer text-center ${
                    pottyType === item.id 
                      ? 'bg-[#8B5E3C] text-white border-[#8B5E3C]' 
                      : 'bg-[#FFF9F2] text-[#2C211B] border-[#E8DDD3] hover:bg-[#F3E7DA]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2C211B] uppercase tracking-wider mb-2">
              Location
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'outdoor', label: 'Outdoor Grass' },
                { id: 'pad', label: 'Puppy Pad' },
                { id: 'indoor_accident', label: 'Indoor Slip' }
              ].map(item => (
                <button
                  type="button"
                  key={item.id}
                  id={`potty-loc-${item.id}`}
                  onClick={() => setPottyLocation(item.id as any)}
                  className={`py-2 px-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer text-center ${
                    pottyLocation === item.id 
                      ? 'bg-[#5F3E29] text-white border-[#5F3E29]' 
                      : 'bg-[#FFF9F2] text-[#2C211B] border-[#E8DDD3] hover:bg-[#F3E7DA]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2C211B] uppercase tracking-wider mb-1.5">
              Notes (optional)
            </label>
            <input
              type="text"
              value={pottyNotes}
              onChange={(e) => setPottyNotes(e.target.value)}
              placeholder="e.g. Right outside on grass, rewarded with liver treat"
              className="w-full px-3.5 py-2 rounded-xl border border-[#E8DDD3] bg-[#FFF9F2] text-sm focus:outline-none focus:border-[#8B5E3C]"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setActiveModal(null)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="flex-1">
              Save Potty Log
            </Button>
          </div>
        </form>
      </Modal>

      {/* Feeding Modal */}
      <Modal
        isOpen={activeModal === 'food'}
        onClose={() => setActiveModal(null)}
        title={`Log Meal for ${activePuppy.name}`}
      >
        <form onSubmit={handleSaveFood} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#2C211B] uppercase tracking-wider mb-2">
              Meal
            </label>
            <div className="grid grid-cols-4 gap-2">
              {['breakfast', 'lunch', 'dinner', 'snack'].map((m) => (
                <button
                  type="button"
                  key={m}
                  onClick={() => setMealType(m as any)}
                  className={`py-2 px-1 rounded-xl text-xs font-bold capitalize border transition-colors cursor-pointer ${
                    mealType === m 
                      ? 'bg-[#8B5E3C] text-white border-[#8B5E3C]' 
                      : 'bg-[#FFF9F2] text-[#2C211B] border-[#E8DDD3]'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2C211B] uppercase tracking-wider mb-1.5">
              Amount (Cups)
            </label>
            <input
              type="number"
              step="0.25"
              min="0.1"
              value={foodAmount}
              onChange={(e) => setFoodAmount(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-[#E8DDD3] bg-[#FFF9F2] text-sm focus:outline-none focus:border-[#8B5E3C]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2C211B] uppercase tracking-wider mb-1.5">
              Food Details
            </label>
            <input
              type="text"
              value={foodNotes}
              onChange={(e) => setFoodNotes(e.target.value)}
              placeholder="e.g. Kibble soaked in warm bone broth"
              className="w-full px-3.5 py-2 rounded-xl border border-[#E8DDD3] bg-[#FFF9F2] text-sm focus:outline-none focus:border-[#8B5E3C]"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setActiveModal(null)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="flex-1">
              Save Meal Log
            </Button>
          </div>
        </form>
      </Modal>

      {/* Sleep Modal */}
      <Modal
        isOpen={activeModal === 'sleep'}
        onClose={() => setActiveModal(null)}
        title={`Log Sleep for ${activePuppy.name}`}
      >
        <form onSubmit={handleSaveSleep} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#2C211B] uppercase tracking-wider mb-2">
              Sleep Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'nap', label: 'Day Nap' },
                { id: 'crate', label: 'Crate Rest' },
                { id: 'night', label: 'Night Sleep' }
              ].map(s => (
                <button
                  type="button"
                  key={s.id}
                  onClick={() => setSleepType(s.id as any)}
                  className={`py-2 px-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                    sleepType === s.id
                      ? 'bg-[#8B5E3C] text-white border-[#8B5E3C]'
                      : 'bg-[#FFF9F2] text-[#2C211B] border-[#E8DDD3]'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2C211B] uppercase tracking-wider mb-1.5">
              Duration (Minutes)
            </label>
            <input
              type="number"
              min="5"
              step="5"
              value={sleepDuration}
              onChange={(e) => setSleepDuration(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-[#E8DDD3] bg-[#FFF9F2] text-sm focus:outline-none focus:border-[#8B5E3C]"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setActiveModal(null)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="flex-1">
              Save Sleep Log
            </Button>
          </div>
        </form>
      </Modal>

      {/* Walk Modal */}
      <Modal
        isOpen={activeModal === 'walk'}
        onClose={() => setActiveModal(null)}
        title={`Log Walk for ${activePuppy.name}`}
      >
        <form onSubmit={handleSaveWalk} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#2C211B] uppercase tracking-wider mb-1.5">
                Minutes
              </label>
              <input
                type="number"
                min="5"
                value={walkDuration}
                onChange={(e) => setWalkDuration(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-[#E8DDD3] bg-[#FFF9F2] text-sm focus:outline-none focus:border-[#8B5E3C]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#2C211B] uppercase tracking-wider mb-1.5">
                Distance (Miles)
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={walkDistance}
                onChange={(e) => setWalkDistance(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-[#E8DDD3] bg-[#FFF9F2] text-sm focus:outline-none focus:border-[#8B5E3C]"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setActiveModal(null)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="flex-1">
              Save Walk
            </Button>
          </div>
        </form>
      </Modal>

      {/* Expense Modal */}
      <Modal
        isOpen={activeModal === 'expense'}
        onClose={() => setActiveModal(null)}
        title={`Add Expense for ${activePuppy.name}`}
      >
        <form onSubmit={handleSaveExpense} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#2C211B] uppercase tracking-wider mb-1.5">
              Item / Service
            </label>
            <input
              type="text"
              required
              value={expenseTitle}
              onChange={(e) => setExpenseTitle(e.target.value)}
              placeholder="e.g. Teething puppy chew toy"
              className="w-full px-3.5 py-2 rounded-xl border border-[#E8DDD3] bg-[#FFF9F2] text-sm focus:outline-none focus:border-[#8B5E3C]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#2C211B] uppercase tracking-wider mb-1.5">
                Amount ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.5"
                required
                value={expenseAmount}
                onChange={(e) => setExpenseAmount(e.target.value)}
                placeholder="24.99"
                className="w-full px-3.5 py-2 rounded-xl border border-[#E8DDD3] bg-[#FFF9F2] text-sm focus:outline-none focus:border-[#8B5E3C]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#2C211B] uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                value={expenseCategory}
                onChange={(e) => setExpenseCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E8DDD3] bg-[#FFF9F2] text-sm focus:outline-none focus:border-[#8B5E3C]"
              >
                <option value="vet">Vet</option>
                <option value="food">Food</option>
                <option value="treats">Treats</option>
                <option value="toys">Toys</option>
                <option value="training">Training</option>
                <option value="grooming">Grooming</option>
                <option value="insurance">Insurance</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setActiveModal(null)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="flex-1">
              Save Expense
            </Button>
          </div>
        </form>
      </Modal>

      {/* Note Modal */}
      <Modal
        isOpen={activeModal === 'note'}
        onClose={() => setActiveModal(null)}
        title={`Quick Note for ${activePuppy.name}`}
      >
        <form onSubmit={handleSaveNote} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#2C211B] uppercase tracking-wider mb-1.5">
              Observation / Milestone
            </label>
            <textarea
              rows={3}
              required
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="e.g. Max sat politely when the mail carrier came to the door without barking!"
              className="w-full px-3.5 py-2 rounded-xl border border-[#E8DDD3] bg-[#FFF9F2] text-sm focus:outline-none focus:border-[#8B5E3C]"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setActiveModal(null)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="flex-1">
              Save Note
            </Button>
          </div>
        </form>
      </Modal>

      {/* Snap Memory Photo Modal */}
      <Modal
        isOpen={activeModal === 'memory'}
        onClose={() => setActiveModal(null)}
        title={`Snap Memory for ${activePuppy.name}`}
        subtitle="Save milestone moments and photos to your Journal"
      >
        <form onSubmit={handleSaveMemory} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#2C211B] uppercase tracking-wider mb-1.5">
              Memory Photo
            </label>
            <CloudinaryImageUploader
              folder="puplume/journal"
              currentImageUrl={memoryPhotoUrl}
              onUploadSuccess={(url) => setMemoryPhotoUrl(url)}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2C211B] uppercase tracking-wider mb-1.5">
              Milestone / Caption
            </label>
            <input
              type="text"
              required
              value={memoryTitle}
              onChange={(e) => setMemoryTitle(e.target.value)}
              placeholder="e.g. First time splashing in the park puddle!"
              className="w-full px-3.5 py-2 rounded-xl border border-[#E8DDD3] bg-[#FFF9F2] text-sm focus:outline-none focus:border-[#8B5E3C]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2C211B] uppercase tracking-wider mb-1.5">
              Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={memoryNotes}
              onChange={(e) => setMemoryNotes(e.target.value)}
              placeholder="How did they react? Any special details?"
              className="w-full px-3.5 py-2 rounded-xl border border-[#E8DDD3] bg-[#FFF9F2] text-sm focus:outline-none focus:border-[#8B5E3C]"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setActiveModal(null)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="flex-1">
              Save Memory 📸
            </Button>
          </div>
        </form>
      </Modal>

      {/* 1-Tap Socialization Experience Modal */}
      <Modal
        isOpen={activeModal === 'social'}
        onClose={() => setActiveModal(null)}
        title={`Socialization Check for ${activePuppy.name}`}
        subtitle="12-Week fear-free exposure checklist"
      >
        <div className="space-y-3">
          <p className="text-xs text-[#766A63]">
            Record how {activePuppy.name} reacts to new surfaces, sounds, and people:
          </p>

          {socialItems.length === 0 ? (
            <div className="text-center py-6">
              <Check className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <p className="text-xs font-bold text-[#2C211B]">All priority exposures logged!</p>
              <p className="text-[11px] text-[#766A63]">Visit the full Socialization view for more.</p>
            </div>
          ) : (
            socialItems.map((item) => (
              <div 
                key={item.id}
                className="p-3 rounded-2xl bg-[#FFF9F2] border border-[#E8DDD3] flex items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-[#2C211B] truncate">{item.title || item.name}</h4>
                  <span className="text-[10px] text-[#766A63] uppercase tracking-wider font-semibold">
                    {item.category}
                  </span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleMarkSocial(item.id, 'positive')}
                    className="p-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center gap-1 border border-emerald-200 transition-colors cursor-pointer"
                    title="Positive reaction"
                  >
                    <Smile className="w-4 h-4" />
                    <span className="text-[10px]">Loved</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMarkSocial(item.id, 'neutral')}
                    className="p-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-bold flex items-center gap-1 border border-amber-200 transition-colors cursor-pointer"
                    title="Neutral reaction"
                  >
                    <Meh className="w-4 h-4" />
                    <span className="text-[10px]">Okay</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMarkSocial(item.id, 'needs_work')}
                    className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center gap-1 border border-rose-200 transition-colors cursor-pointer"
                    title="Needs more gentle exposure"
                  >
                    <Frown className="w-4 h-4" />
                    <span className="text-[10px]">Wary</span>
                  </button>
                </div>
              </div>
            ))
          )}

          <div className="pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setActiveModal(null)} 
              className="w-full text-xs"
            >
              Done
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
