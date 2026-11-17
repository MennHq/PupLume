import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Sparkles, 
  Check, 
  Plus, 
  Smile, 
  Meh, 
  Frown, 
  Scissors, 
  ShieldCheck,
  Trash2 
} from 'lucide-react';
import { PuppyProfile, GroomingTask } from '../types';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { ToastNotification } from '../components/ui/ToastNotification';
import { storage, generateUniqueId } from '../lib/storage';

interface SocializationGroomingViewProps {
  puppy: PuppyProfile;
}

interface SocializationItem {
  id: string;
  category: 'people' | 'surfaces' | 'sounds' | 'environments';
  name: string;
  status: 'positive' | 'neutral' | 'needs_work' | 'unexposed';
  notes?: string;
}

interface GroomingItem {
  id: string;
  name: string;
  frequency: string;
  lastDone: string;
  cooperativeLevel: 'comfort' | 'tolerates' | 'training';
}

const STANDARD_CHECKLIST_TEMPLATE: Omit<SocializationItem, 'id'>[] = [
  { category: 'people', name: 'Children playing outdoors', status: 'unexposed' },
  { category: 'people', name: 'Men wearing hats / sunglasses', status: 'unexposed' },
  { category: 'people', name: 'Delivery drivers / uniforms', status: 'unexposed' },
  { category: 'surfaces', name: 'Hardwood & slippery tiles', status: 'unexposed' },
  { category: 'surfaces', name: 'Metal outdoor sewer grates', status: 'unexposed' },
  { category: 'surfaces', name: 'Wet grass & autumn leaves', status: 'unexposed' },
  { category: 'sounds', name: 'Household vacuum cleaner', status: 'unexposed' },
  { category: 'sounds', name: 'Thunderstorm & rain audio track', status: 'unexposed' },
  { category: 'sounds', name: 'Doorbell chime / knocks', status: 'unexposed' },
  { category: 'environments', name: 'Vet clinic waiting area', status: 'unexposed' },
  { category: 'environments', name: 'Car ride in puppy harness', status: 'unexposed' }
];

export const SocializationGroomingView: React.FC<SocializationGroomingViewProps> = ({ puppy }) => {
  const [tab, setTab] = useState<'socialization' | 'grooming'>('socialization');
  const [socialItems, setSocialItems] = useState<SocializationItem[]>(() => {
    const fromStorage = storage.getSocialization();
    return fromStorage.map(s => ({
      id: s.id,
      category: (s.category.toLowerCase() as any) || 'people',
      name: s.title,
      status: (s.status as any) || 'unexposed',
      notes: s.notes
    }));
  });

  const [groomingItems, setGroomingItems] = useState<GroomingItem[]>(() => {
    const fromStorage = storage.getGroomingTasks(puppy.id);
    return fromStorage.map(g => ({
      id: g.id,
      name: g.label,
      frequency: `Every ${g.frequencyDays} days`,
      lastDone: g.lastDone ? new Date(g.lastDone).toLocaleDateString() : 'Not yet logged',
      cooperativeLevel: 'comfort'
    }));
  });

  const [isAddSocialOpen, setIsAddSocialOpen] = useState(false);
  const [newSocialName, setNewSocialName] = useState('');
  const [newSocialCategory, setNewSocialCategory] = useState<'people' | 'surfaces' | 'sounds' | 'environments'>('people');

  const [isAddGroomOpen, setIsAddGroomOpen] = useState(false);
  const [newGroomName, setNewGroomName] = useState('');
  const [newGroomFreqDays, setNewGroomFreqDays] = useState('3');

  useEffect(() => {
    const fromGroom = storage.getGroomingTasks(puppy.id);
    setGroomingItems(fromGroom.map(g => ({
      id: g.id,
      name: g.label,
      frequency: `Every ${g.frequencyDays} days`,
      lastDone: g.lastDone ? new Date(g.lastDone).toLocaleDateString() : 'Not yet logged',
      cooperativeLevel: 'comfort'
    })));
  }, [puppy.id]);

  useEffect(() => {
    return storage.subscribe(() => {
      const fromSocial = storage.getSocialization();
      setSocialItems(fromSocial.map(s => ({
        id: s.id,
        category: (s.category.toLowerCase() as any) || 'people',
        name: s.title,
        status: (s.status as any) || 'unexposed',
        notes: s.notes
      })));

      const fromGroom = storage.getGroomingTasks(puppy.id);
      setGroomingItems(fromGroom.map(g => ({
        id: g.id,
        name: g.label,
        frequency: `Every ${g.frequencyDays} days`,
        lastDone: g.lastDone ? new Date(g.lastDone).toLocaleDateString() : 'Not yet logged',
        cooperativeLevel: 'comfort'
      })));
    });
  }, [puppy.id]);

  const handleCycleSocial = (id: string) => {
    const item = socialItems.find(i => i.id === id);
    if (!item) return;
    const nextStatus: Record<SocializationItem['status'], SocializationItem['status']> = {
      unexposed: 'positive',
      positive: 'neutral',
      neutral: 'needs_work',
      needs_work: 'unexposed'
    };
    const newStatus = nextStatus[item.status];
    setSocialItems(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
    storage.updateSocializationStatus(id, newStatus);
  };

  const handleAddSocial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSocialName.trim()) return;
    storage.addSocializationItem({
      puppyId: puppy.id,
      title: newSocialName.trim(),
      category: newSocialCategory,
      status: 'unexposed'
    });
    setNewSocialName('');
    setIsAddSocialOpen(false);
  };

  const handleLoadStandardChecklist = () => {
    STANDARD_CHECKLIST_TEMPLATE.forEach(item => {
      storage.addSocializationItem({
        puppyId: puppy.id,
        title: item.name,
        category: item.category,
        status: 'unexposed'
      });
    });
  };

  const handleAddGrooming = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroomName.trim()) return;
    const existing = storage.getGroomingTasks(puppy.id);
    const freq = Math.max(1, parseInt(newGroomFreqDays, 10) || 3);
    const newTask: GroomingTask = {
      id: generateUniqueId('groom'),
      puppyId: puppy.id,
      type: 'brush',
      label: newGroomName.trim(),
      frequencyDays: freq,
      lastDone: '',
      nextDue: new Date(Date.now() + freq * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };
    storage.saveGroomingTasks([...existing, newTask], puppy.id);
    setNewGroomName('');
    setIsAddGroomOpen(false);
  };

  const handleMarkGrooming = (id: string) => {
    setGroomingItems(prev => prev.map(g => {
      if (g.id === id) {
        return { ...g, lastDone: 'Just now!' };
      }
      return g;
    }));
    const tasks = storage.getGroomingTasks(puppy.id);
    const updated = tasks.map(t => t.id === id ? { ...t, lastDone: new Date().toISOString() } : t);
    storage.saveGroomingTasks(updated, puppy.id);
  };

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    confirmLabel: string;
    onConfirm: () => void;
  }>({
    open: false,
    title: '',
    description: '',
    confirmLabel: 'Delete',
    onConfirm: () => {},
  });

  const [undoToast, setUndoToast] = useState<{
    open: boolean;
    message: string;
    undoAction?: () => void;
  }>({
    open: false,
    message: '',
  });

  const handleDeleteGrooming = (id: string, label: string) => {
    setConfirmDialog({
      open: true,
      title: 'Remove Grooming Routine?',
      description: `Remove "${label}" from ${puppy.name}'s care checklist? You can undo this immediately.`,
      confirmLabel: 'Remove Routine',
      onConfirm: () => {
        const removed = storage.getGroomingTasks(puppy.id).find(g => g.id === id);
        storage.deleteGroomingTask(id, puppy.id);
        setGroomingItems(prev => prev.filter(g => g.id !== id));
        if (removed) {
          setUndoToast({
            open: true,
            message: `"${label}" removed`,
            undoAction: () => {
              const current = storage.getGroomingTasks(puppy.id);
              storage.saveGroomingTasks([...current, removed], puppy.id);
              setGroomingItems(storage.getGroomingTasks(puppy.id).map(g => ({
                id: g.id,
                name: g.label,
                frequency: `Every ${g.frequencyDays} days`,
                lastDone: g.lastDone ? new Date(g.lastDone).toLocaleDateString() : 'Not yet logged',
                cooperativeLevel: 'comfort'
              })));
            }
          });
        }
      }
    });
  };

  const handleDeleteSocial = (id: string, title: string) => {
    setConfirmDialog({
      open: true,
      title: 'Remove Socialization Item?',
      description: `Remove "${title}" from ${puppy.name}'s exposure list? You can undo this immediately.`,
      confirmLabel: 'Remove Item',
      onConfirm: () => {
        const removed = storage.getSocialization().find(s => s.id === id);
        storage.deleteSocializationItem(id);
        setSocialItems(prev => prev.filter(s => s.id !== id));
        if (removed) {
          setUndoToast({
            open: true,
            message: `"${title}" removed`,
            undoAction: () => {
              storage.addSocializationItem(removed);
              setSocialItems(storage.getSocialization().map(s => ({
                id: s.id,
                category: (s.category.toLowerCase() as any) || 'people',
                name: s.title,
                status: (s.status as any) || 'unexposed',
                notes: s.notes
              })));
            }
          });
        }
      }
    });
  };

  const positiveCount = socialItems.filter(s => s.status === 'positive').length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-6">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-[#E8DDD3] p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#2C211B]">
              Socialization & Grooming
            </h1>
            <span className="text-xs font-bold bg-[#EAF0E6] text-[#24451D] border border-[#C5D8BD] px-2.5 py-0.5 rounded-full">
              Fear-Free Protocol
            </span>
          </div>
          <p className="text-xs text-[#766A63] mt-1">
            Build a confident, bulletproof dog through intentional exposure and low-stress handling.
          </p>
        </div>

        <div className="flex p-1 bg-[#F5EDE4] rounded-2xl border border-[#E8DDD3] self-stretch sm:self-auto">
          <button
            onClick={() => setTab('socialization')}
            className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              tab === 'socialization'
                ? 'bg-white text-[#2C211B] shadow-xs'
                : 'text-[#766A63] hover:text-[#2C211B]'
            }`}
          >
            Socialization ({positiveCount}/{socialItems.length})
          </button>
          <button
            onClick={() => setTab('grooming')}
            className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              tab === 'grooming'
                ? 'bg-white text-[#2C211B] shadow-xs'
                : 'text-[#766A63] hover:text-[#2C211B]'
            }`}
          >
            Grooming & Handling
          </button>
        </div>
      </div>

      {tab === 'socialization' && (
        <div className="space-y-5">
          {/* Socialization Info Box */}
          <div className="p-4 rounded-2xl bg-[#FFF9F2] border border-[#E8DDD3] flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-[#8B5E3C] flex-shrink-0 mt-0.5" />
              <div className="text-xs">
                <strong className="text-[#2C211B]">The Critical 16-Week Socialization Window</strong>
                <p className="text-[#766A63] mt-0.5 leading-relaxed">
                  Socialization is NOT simply letting dogs run up to {puppy.name}. It means creating calm, positive, neutral associations with novel sounds, textures, and strange sights.
                </p>
              </div>
            </div>
            <Button
              size="sm"
              variant="primary"
              onClick={() => setIsAddSocialOpen(true)}
              leftIcon={<Plus className="w-4 h-4" />}
              className="flex-shrink-0"
            >
              Add Item
            </Button>
          </div>

          {socialItems.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-[#E8DDD3] shadow-xs">
              <Users className="w-10 h-10 text-[#8B5E3C]/60 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-[#2C211B] mb-1">No exposure items tracked yet</h4>
              <p className="text-xs text-[#766A63] max-w-sm mx-auto mb-4">
                Track sights, sounds, surfaces, and people for {puppy.name} to explore during their puppyhood.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <Button size="sm" variant="primary" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setIsAddSocialOpen(true)}>
                  Add Custom Item
                </Button>
                <Button size="sm" variant="outline" leftIcon={<Sparkles className="w-4 h-4" />} onClick={handleLoadStandardChecklist}>
                  Load Standard 100-Things Checklist
                </Button>
              </div>
            </div>
          ) : (
            /* Social items categorized */
            (['people', 'surfaces', 'sounds', 'environments'] as const).map(cat => {
              const itemsInCat = socialItems.filter(i => i.category === cat);
              if (itemsInCat.length === 0) return null;

              return (
                <div key={cat} className="bg-white rounded-2xl border border-[#E8DDD3] p-4 shadow-xs">
                  <h3 className="text-xs font-bold text-[#8B5E3C] mb-3 capitalize">
                    {cat} Exposure Checklist
                  </h3>

                  <div className="space-y-2">
                    {itemsInCat.map(item => {
                      const badgeMap = {
                        positive: { text: 'Confident / Happy', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
                        neutral: { text: 'Neutral / Calm', color: 'bg-amber-100 text-amber-800 border-amber-200' },
                        needs_work: { text: 'Needs Desensitization', color: 'bg-rose-100 text-rose-800 border-rose-200' },
                        unexposed: { text: 'Not Exposed', color: 'bg-stone-100 text-stone-700 border-stone-200' }
                      };
                      return (
                        <div
                          key={item.id}
                          onClick={() => handleCycleSocial(item.id)}
                          className="group p-3 rounded-xl border border-[#E8DDD3] hover:border-[#8B5E3C]/40 bg-[#FFF9F2]/50 hover:bg-[#FFF9F2] transition-colors flex items-center justify-between gap-3 cursor-pointer"
                        >
                          <span className="text-xs font-bold text-[#2C211B]">{item.name}</span>
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeMap[item.status].color}`}>
                              {badgeMap[item.status].text}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteSocial(item.id, item.name);
                              }}
                              className="min-w-[44px] min-h-[44px] flex items-center justify-center -m-2 p-2 text-[#766A63] hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors opacity-70 group-hover:opacity-100 cursor-pointer"
                              title="Delete exposure item"
                              aria-label={`Delete ${item.name}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {tab === 'grooming' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-[#FFF9F2] border border-[#E8DDD3] flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-[#8B5E3C] flex-shrink-0 mt-0.5" />
              <div className="text-xs">
                <strong className="text-[#2C211B]">Cooperative Care & Body Touch</strong>
                <p className="text-[#766A63] mt-0.5 leading-relaxed">
                  By conditioning nail trims, ear cleaning, and mouth checks now with high-value lick mats, {puppy.name} will never fear the vet or groomer table.
                </p>
              </div>
            </div>
            <Button
              size="sm"
              variant="primary"
              onClick={() => setIsAddGroomOpen(true)}
              leftIcon={<Plus className="w-4 h-4" />}
              className="flex-shrink-0"
            >
              Add Routine
            </Button>
          </div>

          {groomingItems.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-[#E8DDD3] shadow-xs">
              <Scissors className="w-10 h-10 text-[#8B5E3C]/60 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-[#2C211B] mb-1">No grooming routines added yet</h4>
              <p className="text-xs text-[#766A63] max-w-sm mx-auto mb-4">
                Add coat brushing, nail trimming, teeth cleaning, or bathing routines for {puppy.name}.
              </p>
              <Button size="sm" variant="primary" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setIsAddGroomOpen(true)}>
                Add Grooming Routine
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {groomingItems.map(item => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-white border border-[#E8DDD3] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <h3 className="text-sm font-bold text-[#2C211B]">{item.name}</h3>
                    <p className="text-xs text-[#766A63] mt-0.5">
                      Recommended: {item.frequency} • Last Done: <strong>{item.lastDone}</strong>
                    </p>
                    <span className="inline-block text-[10px] font-bold text-[#8B5E3C] bg-[#FFF9F2] px-2 py-0.5 rounded-md border border-[#E8DDD3] mt-1.5 capitalize">
                      Cooperative state: {item.cooperativeLevel}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleMarkGrooming(item.id)}
                      leftIcon={<Check className="w-4 h-4" />}
                    >
                      Mark Completed Today
                    </Button>
                    <button
                      type="button"
                      onClick={() => handleDeleteGrooming(item.id, item.name)}
                      className="min-w-[44px] min-h-[44px] flex items-center justify-center p-2 text-[#766A63] hover:text-rose-600 rounded-xl hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors cursor-pointer"
                      title="Delete grooming routine"
                      aria-label={`Delete ${item.name}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Socialization Item Modal */}
      <Modal
        isOpen={isAddSocialOpen}
        onClose={() => setIsAddSocialOpen(false)}
        title="Add Socialization Exposure"
      >
        <form onSubmit={handleAddSocial} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#2C211B] mb-1">
              Exposure Item Name
            </label>
            <input
              type="text"
              required
              value={newSocialName}
              onChange={(e) => setNewSocialName(e.target.value)}
              placeholder="e.g. Bicycles riding past on sidewalk"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DDD3] bg-[#FFF9F2] text-sm focus:outline-none focus:border-[#8B5E3C]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2C211B] mb-1.5">
              Category
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'people', label: 'People & Outfits' },
                { id: 'surfaces', label: 'Surfaces & Textures' },
                { id: 'sounds', label: 'Household & Sounds' },
                { id: 'environments', label: 'Places & Transport' }
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setNewSocialCategory(cat.id as any)}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-left flex items-center justify-between cursor-pointer ${
                    newSocialCategory === cat.id
                      ? 'bg-[#8B5E3C] text-white border-[#8B5E3C] shadow-2xs'
                      : 'bg-[#FFF9F2] text-[#5F3E29] border-[#E8DDD3] hover:bg-[#F3E7DA]'
                  }`}
                >
                  <span>{cat.label}</span>
                  {newSocialCategory === cat.id && <span className="w-1.5 h-1.5 rounded-full bg-white shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          <Button type="submit" variant="primary" className="w-full">
            Add Exposure Item
          </Button>
        </form>
      </Modal>

      {/* Add Grooming Task Modal */}
      <Modal
        isOpen={isAddGroomOpen}
        onClose={() => setIsAddGroomOpen(false)}
        title="Add Grooming Routine"
      >
        <form onSubmit={handleAddGrooming} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#2C211B] mb-1">
              Routine Name
            </label>
            <input
              type="text"
              required
              value={newGroomName}
              onChange={(e) => setNewGroomName(e.target.value)}
              placeholder="e.g. Slicker Brush & Detangler"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DDD3] bg-[#FFF9F2] text-sm focus:outline-none focus:border-[#8B5E3C]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2C211B] mb-1">
              Frequency (Days)
            </label>
            <input
              type="number"
              min="1"
              required
              value={newGroomFreqDays}
              onChange={(e) => setNewGroomFreqDays(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DDD3] bg-[#FFF9F2] text-sm focus:outline-none focus:border-[#8B5E3C]"
            />
          </div>

          <Button type="submit" variant="primary" className="w-full">
            Save Routine
          </Button>
        </form>
      </Modal>

      {/* Non-blocking Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.open}
        onClose={() => setConfirmDialog(prev => ({ ...prev, open: false }))}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        description={confirmDialog.description}
        confirmLabel={confirmDialog.confirmLabel}
        isDestructive={true}
      />

      {/* 5-second Undo Toast Notification */}
      <ToastNotification
        isOpen={undoToast.open}
        message={undoToast.message}
        onClose={() => setUndoToast(prev => ({ ...prev, open: false }))}
        onUndo={undoToast.undoAction}
      />
    </div>
  );
};
