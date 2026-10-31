import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Sparkles, 
  Check, 
  Plus, 
  Smile, 
  Meh, 
  Frown, 
  Volume2, 
  Scissors, 
  ShieldCheck, 
  Heart 
} from 'lucide-react';
import { PuppyProfile } from '../types';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { storage } from '../lib/storage';

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
    const existing = storage.getGroomingTasks();
    const freq = parseInt(newGroomFreqDays, 10) || 3;
    storage.saveGroomingTasks([
      ...existing,
      {
        id: `groom-${Date.now()}`,
        puppyId: puppy.id,
        type: 'brush',
        label: newGroomName.trim(),
        frequencyDays: freq,
        lastDone: '',
        nextDue: new Date(Date.now() + freq * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }
    ]);
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
    const tasks = storage.getGroomingTasks();
    const updated = tasks.map(t => t.id === id ? { ...t, lastDone: new Date().toISOString() } : t);
    storage.saveGroomingTasks(updated);
  };

  const positiveCount = socialItems.filter(s => s.status === 'positive').length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-24">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-[#E8DDD3] p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#2C211B]">
              Socialization & Grooming
            </h1>
            <span className="text-xs font-bold bg-[#A8B59A] text-white px-2.5 py-0.5 rounded-full">
              Fear-Free Protocol
            </span>
          </div>
          <p className="text-xs text-[#766A63] mt-1">
            Build a confident, bulletproof dog through intentional exposure and low-stress handling.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setTab('socialization')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
              tab === 'socialization'
                ? 'bg-[#8B5E3C] text-white border-[#8B5E3C]'
                : 'bg-white text-[#766A63] border-[#E8DDD3] hover:bg-[#FFF9F2]'
            }`}
          >
            Socialization ({positiveCount}/{socialItems.length})
          </button>
          <button
            onClick={() => setTab('grooming')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
              tab === 'grooming'
                ? 'bg-[#8B5E3C] text-white border-[#8B5E3C]'
                : 'bg-white text-[#766A63] border-[#E8DDD3] hover:bg-[#FFF9F2]'
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
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#8B5E3C] mb-3 capitalize">
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
                          className="p-3 rounded-xl border border-[#E8DDD3] hover:border-[#8B5E3C]/40 bg-[#FFF9F2]/50 hover:bg-[#FFF9F2] transition-colors flex items-center justify-between gap-3 cursor-pointer"
                        >
                          <span className="text-xs font-bold text-[#2C211B]">{item.name}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeMap[item.status].color}`}>
                            {badgeMap[item.status].text}
                          </span>
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
                    <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-[#8B5E3C] bg-[#FFF9F2] px-2 py-0.5 rounded-md border border-[#E8DDD3] mt-1.5">
                      Cooperative state: {item.cooperativeLevel}
                    </span>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleMarkGrooming(item.id)}
                    leftIcon={<Check className="w-4 h-4" />}
                  >
                    Mark Completed Today
                  </Button>
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
            <label className="block text-xs font-bold text-[#2C211B] uppercase tracking-wider mb-1">
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
            <label className="block text-xs font-bold text-[#2C211B] uppercase tracking-wider mb-1">
              Category
            </label>
            <select
              value={newSocialCategory}
              onChange={(e) => setNewSocialCategory(e.target.value as any)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DDD3] bg-[#FFF9F2] text-sm focus:outline-none focus:border-[#8B5E3C]"
            >
              <option value="people">People & Outfits</option>
              <option value="surfaces">Surfaces & Textures</option>
              <option value="sounds">Household & City Sounds</option>
              <option value="environments">Environments & Transport</option>
            </select>
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
            <label className="block text-xs font-bold text-[#2C211B] uppercase tracking-wider mb-1">
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
            <label className="block text-xs font-bold text-[#2C211B] uppercase tracking-wider mb-1">
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
    </div>
  );
};
