import React, { useState } from 'react';
import { 
  Heart, 
  Plus, 
  Calendar, 
  Sparkles, 
  Camera, 
  Trash2, 
  Award, 
  Share2,
  Cloud 
} from 'lucide-react';
import { PuppyProfile } from '../types';
import { storage } from '../lib/storage';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { CloudinaryImageUploader } from '../components/ui/CloudinaryImageUploader';
import { deleteImageFromCloudinary } from '../lib/cloudinary';

interface PuppyJournalViewProps {
  puppy: PuppyProfile;
}

export const PuppyJournalView: React.FC<PuppyJournalViewProps> = ({ puppy }) => {
  const [entries, setEntries] = useState(() => storage.getJournal(puppy.id));
  const [isAddOpen, setIsAddOpen] = useState(false);

  React.useEffect(() => {
    setEntries(storage.getJournal(puppy.id));
  }, [puppy.id]);

  React.useEffect(() => {
    return storage.subscribe(() => {
      setEntries([...storage.getJournal(puppy.id)]);
    });
  }, [puppy.id]);

  // Check if launched via Web Share Target from Camera Roll or WhatsApp
  React.useEffect(() => {
    const checkSharedMedia = async () => {
      const params = new URLSearchParams(window.location.search);
      if (params.get('action') === 'shared-media' || params.get('action') === 'shared-photo') {
        const queryPhoto = params.get('sharedPhotoUrl') || params.get('photoUrl');
        const queryTitle = params.get('title');
        if (queryPhoto) {
          setPhotoUrl(queryPhoto);
          setTitle(queryTitle ? decodeURIComponent(queryTitle) : puppy.name + ' Photo Memory');
          setBody('Saved from camera roll via native share');
          setIsAddOpen(true);
          return;
        }

        if (typeof window === 'undefined' || !('caches' in window)) return;
        try {
          const cache = await caches.open('puplume-shared-media');
          const res = await cache.match('/shared-media-latest');
          if (res) {
            const blob = await res.blob();
            const titleHeader = res.headers.get('x-shared-title');
            const decodedTitle = titleHeader ? decodeURIComponent(titleHeader) : 'Shared Puppy Memory';

            const reader = new FileReader();
            reader.onloadend = () => {
              if (typeof reader.result === 'string') {
                setPhotoUrl(reader.result);
                setTitle(decodedTitle !== 'Puppy Memory' ? decodedTitle : puppy.name + ' Photo Memory');
                setBody('Saved from camera roll via native share');
                setIsAddOpen(true);
              }
            };
            reader.readAsDataURL(blob);

            // Clean up cache entry
            await cache.delete('/shared-media-latest');
          }
        } catch (e) {
          console.debug('[PuppyJournal] Error retrieving shared media:', e);
        }
      }
    };
    checkSharedMedia();
  }, [puppy.name]);

  // Form states
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [milestone, setMilestone] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;

    storage.addJournalEntry({
      puppyId: puppy.id,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      title,
      notes: body,
      milestoneBadge: milestone || undefined,
      mediaUrl: photoUrl || undefined
    });

    setEntries([...storage.getJournal(puppy.id)]);
    setIsAddOpen(false);
    setTitle('');
    setBody('');
    setMilestone('');
    setPhotoUrl('');
  };


  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-24">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-[#E8DDD3] p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#2C211B]">
              {puppy.name}’s Memory Book & Journal
            </h1>
            <span className="text-xs font-bold bg-[#F3E7DA] text-[#5F3E29] px-2.5 py-0.5 rounded-full">
              {entries.length} Memories
            </span>
          </div>
          <p className="text-xs text-[#766A63] mt-1">
            Capture puppy milestones, cute quirks, funny moments, and puppyhood breakthroughs.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsAddOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Add Journal Entry
        </Button>
      </div>

      {/* Entries List */}
      <div className="space-y-4">
        {entries.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-[#E8DDD3] shadow-xs">
            <Heart className="w-10 h-10 text-[#8B5E3C]/60 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-[#2C211B] mb-1">No journal memories yet</h4>
            <p className="text-xs text-[#766A63] max-w-sm mx-auto mb-4">
              Write down your puppy&apos;s first days, breakthroughs, and fun memories with {puppy.name}.
            </p>
            <Button size="sm" variant="primary" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setIsAddOpen(true)}>
              Write First Memory
            </Button>
          </div>
        ) : (
          entries.map((entry) => (
            <div
              key={entry.id}
              className="p-5 rounded-3xl bg-white border border-[#E8DDD3] shadow-xs space-y-3"
            >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-[#8B5E3C] flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {entry.date}
              </span>

              <div className="flex items-center gap-2">
                {(entry.milestoneBadge || (entry as any).milestone) && (
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 flex items-center gap-1 border border-amber-200">
                    <Award className="w-3 h-3 text-amber-700" />
                    {entry.milestoneBadge || (entry as any).milestone}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => {
                    const media = entry.mediaUrl || (entry as any).photoUrl;
                    if (media) {
                      deleteImageFromCloudinary(media).catch(() => {});
                    }
                    storage.deleteJournalEntry(entry.id);
                    setEntries([...storage.getJournal(puppy.id)]);
                  }}
                  className="p-1 text-[#766A63] hover:text-rose-600 transition-colors cursor-pointer"
                  title="Delete memory"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <h3 className="text-base font-extrabold text-[#2C211B]">{entry.title}</h3>
            <p className="text-xs sm:text-sm text-[#5F3E29] leading-relaxed whitespace-pre-line">
              {entry.notes || (entry as any).body}
            </p>

            {(entry.mediaUrl || (entry as any).photoUrl) && (
              <div className="rounded-2xl overflow-hidden max-h-64 border border-[#E8DDD3]">
                <img src={entry.mediaUrl || (entry as any).photoUrl} alt={entry.title} className="w-full h-full object-cover" />
              </div>
            )}

          </div>
        )))}
      </div>

      {/* Add Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="New Journal Memory">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#2C211B] uppercase tracking-wider mb-1">
              Title / Milestone
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Mastered the 'Down' command!"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DDD3] bg-[#FFF9F2] text-sm focus:outline-none focus:border-[#8B5E3C]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2C211B] uppercase tracking-wider mb-1">
              Milestone Tag (Optional)
            </label>
            <input
              type="text"
              value={milestone}
              onChange={(e) => setMilestone(e.target.value)}
              placeholder="e.g. Crate Training Victory"
              className="w-full px-3.5 py-2 rounded-xl border border-[#E8DDD3] bg-[#FFF9F2] text-xs focus:outline-none focus:border-[#8B5E3C]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2C211B] uppercase tracking-wider mb-1">
              What happened?
            </label>
            <textarea
              rows={3}
              required
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write the sweet details, what treats worked, how happy you felt..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DDD3] bg-[#FFF9F2] text-xs focus:outline-none focus:border-[#8B5E3C]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2C211B] uppercase tracking-wider mb-1">
              Pet Photo / Memory Picture
            </label>
            <CloudinaryImageUploader
              currentImageUrl={photoUrl}
              onUploadSuccess={(url) => setPhotoUrl(url)}
              folder="puplume/journal"
              label="Upload Memory Photo"
              sublabel="Upload a picture to attach to this memory"
              variant="card"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="flex-1">
              Save Memory
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
