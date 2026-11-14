import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  Copy, 
  Check, 
  Trash2, 
  FileText 
} from 'lucide-react';
import { useQuery, useMutation } from 'convex/react';
import { useUser } from '@clerk/react';
import { api } from '../../convex/_generated/api';
import { PuppyProfile, FamilyMember } from '../types';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { storage } from '../lib/storage';
import { copyToClipboard } from '../lib/clipboard';

interface FamilySharingViewProps {
  puppy: PuppyProfile;
}

interface Member {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Member' | 'Walker / Sitter';
  avatar: string;
  status: 'active' | 'invited';
}

const mapFamilyToMember = (f: FamilyMember): Member => ({
  id: f.id,
  name: f.name,
  email: f.email,
  role: f.role === 'Admin' ? 'Admin' : f.role === 'Caregiver' ? 'Walker / Sitter' : 'Member',
  avatar: f.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
  status: 'active',
});

export const FamilySharingView: React.FC<FamilySharingViewProps> = ({ puppy }) => {
  const { user } = useUser();
  const [members, setMembers] = useState<Member[]>(() => storage.getFamily().map(mapFamilyToMember));
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isCheatsheetOpen, setIsCheatsheetOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const cloudFamily = useQuery(api.family.listFamilyMembers, user?.id ? { userId: user.id } : 'skip');
  const addFamilyMemberMutation = useMutation(api.family.addFamilyMember);
  const deleteFamilyMemberMutation = useMutation(api.family.deleteFamilyMember);

  useEffect(() => {
    if (cloudFamily) {
      const mapped: Member[] = cloudFamily.map((f: any) => ({
        id: f._id,
        name: f.name,
        email: f.email,
        role: (f.role === 'Admin' ? 'Admin' : f.role === 'Caregiver' ? 'Walker / Sitter' : 'Member') as 'Admin' | 'Member' | 'Walker / Sitter',
        avatar: f.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
        status: 'active' as const,
      }));
      setMembers(mapped);
      storage.saveFamily(cloudFamily.map((f: any) => ({
        id: f._id,
        name: f.name,
        email: f.email,
        role: (f.role || 'Member') as any,
        avatarUrl: f.avatarUrl,
        puppyId: f.puppyId,
        dateAdded: f.dateAdded || new Date().toISOString().split('T')[0],
      })));
    }
  }, [cloudFamily]);

  useEffect(() => {
    const unsub = storage.subscribe(() => {
      setMembers(storage.getFamily().map(mapFamilyToMember));
    });
    return unsub;
  }, []);

  // Invite Form
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState<'Admin' | 'Member' | 'Walker / Sitter'>('Member');

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    const roleName: 'Admin' | 'Caregiver' = inviteRole === 'Admin' ? 'Admin' : 'Caregiver';
    const newMember: Omit<FamilyMember, 'id'> = {
      name: inviteName || inviteEmail.split('@')[0],
      email: inviteEmail.trim().toLowerCase(),
      role: roleName,
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
      dateAdded: new Date().toISOString().split('T')[0],
      puppyId: puppy.id,
    };

    storage.addFamilyMember(newMember);

    if (user?.id) {
      addFamilyMemberMutation({
        userId: user.id,
        ...newMember,
      }).catch((err) => console.debug('[FamilySharing] addFamilyMember note:', err));
    }

    setIsInviteOpen(false);
    setInviteEmail('');
    setInviteName('');
  };

  const handleCopyCheatsheet = () => {
    const text = `🐾 PUPPY CHEATSHEET FOR ${puppy.name.toUpperCase()} 🐾
• Breed: ${puppy.breed} (${puppy.weightLbs} lbs)
• Meals: 3x daily (0.75 cups Purina Pro Plan Puppy) at 7:30 AM, 12:30 PM, 6:00 PM
• Potty Schedule: Outside every 2.5 - 3 hours. Use back garden gate and give 1 treat immediately after pee/poop.
• Emergency Vet: ${puppy.vetClinic} - ${puppy.vetPhone}
• Crate: Sleeps in crate with white noise machine. Frozen peanut butter Kong helps him settle.
• Notes: DO NOT give rawhide. If biting fingers, swap with rubber chew toy.`;

    copyToClipboard(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-24">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-[#E8DDD3] p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#2C211B]">
              Family & Caregiver Sharing
            </h1>
            <span className="text-xs font-bold bg-[#F3E7DA] text-[#5F3E29] px-2.5 py-0.5 rounded-full">
              {members.length} Members
            </span>
          </div>
          <p className="text-xs text-[#766A63] mt-1">
            Keep partners, family, pet sitters, and dog walkers in sync with real-time logs and custom roles.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCheatsheetOpen(true)}
            leftIcon={<FileText className="w-3.5 h-3.5" />}
          >
            Sitter Cheatsheet
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsInviteOpen(true)}
            leftIcon={<UserPlus className="w-4 h-4" />}
          >
            Invite Caregiver
          </Button>
        </div>
      </div>

      {/* Role Explanations */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-[#FFF9F2] border border-[#E8DDD3]">
          <span className="text-xs font-bold text-[#8B5E3C] uppercase tracking-wider block">Admin</span>
          <p className="text-xs text-[#766A63] mt-1 leading-relaxed">
            Full access to all health records, expense tracking, AI schedule changes, and member permissions.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#FFF9F2] border border-[#E8DDD3]">
          <span className="text-xs font-bold text-[#8B5E3C] uppercase tracking-wider block">Family Member</span>
          <p className="text-xs text-[#766A63] mt-1 leading-relaxed">
            Can log potty events, feed times, practice training drills, and check off daily tasks.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#FFF9F2] border border-[#E8DDD3]">
          <span className="text-xs font-bold text-[#8B5E3C] uppercase tracking-wider block">Pet Sitter / Walker</span>
          <p className="text-xs text-[#766A63] mt-1 leading-relaxed">
            Restricted access to daily potty/feed checklists, safety instructions, and vet emergency lines only.
          </p>
        </div>
      </div>

      {/* Members List */}
      <div className="bg-white rounded-2xl border border-[#E8DDD3] p-5 shadow-xs">
        <h3 className="text-sm font-bold text-[#2C211B] mb-4">Care Team for {puppy.name}</h3>
        <div className="space-y-3">
          {members.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#766A63]">
              <Users className="w-8 h-8 text-[#8B5E3C]/40 mx-auto mb-2" />
              <p className="font-semibold text-[#2C211B]">No family members or caregivers invited yet</p>
              <p className="mt-0.5">Invite your partner, family members, or pet sitters to co-parent {puppy.name}.</p>
            </div>
          ) : (
            members.map((member) => (
              <div
                key={member.id}
                className="p-3.5 rounded-xl border border-[#E8DDD3] bg-white hover:bg-[#FFF9F2] transition-colors flex items-center justify-between gap-3"
              >
              <div className="flex items-center gap-3">
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-10 h-10 rounded-full object-cover border border-[#8B5E3C]"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs sm:text-sm font-bold text-[#2C211B]">{member.name}</h4>
                    {member.status === 'invited' && (
                      <span className="text-[10px] bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded font-semibold">
                        Invite Sent
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#766A63]">{member.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-[#8B5E3C] bg-[#FFF9F2] px-2.5 py-1 rounded-lg border border-[#E8DDD3]">
                  {member.role}
                </span>
                {member.role !== 'Admin' && (
                  <button
                    onClick={() => {
                      storage.removeFamilyMember(member.id);
                      if (user?.id) {
                        deleteFamilyMemberMutation({ id: member.id, userId: user.id }).catch((err) =>
                          console.debug('[FamilySharing] deleteFamilyMember note:', err)
                        );
                      }
                    }}
                    className="p-1 text-[#766A63] hover:text-rose-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )))}
        </div>
      </div>

      {/* Sitter Cheatsheet Modal */}
      <Modal
        isOpen={isCheatsheetOpen}
        onClose={() => setIsCheatsheetOpen(false)}
        title="Pet Sitter Emergency Cheatsheet"
        subtitle={`1-Tap printable summary for anyone watching ${puppy.name}`}
      >
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-[#FFF9F2] border border-[#E8DDD3] text-xs space-y-3 text-[#2C211B] font-mono leading-relaxed">
            <div>
              <strong>🐾 PUPPY CHEATSHEET: {puppy.name.toUpperCase()}</strong>
              <p className="text-[#766A63]">{puppy.breed} • {puppy.weightLbs} lbs</p>
            </div>

            <div>
              <strong>🥣 FEEDING SCHEDULE:</strong>
              <p>• 7:30 AM: 0.75 cups with fresh bowl of water</p>
              <p>• 12:30 PM: 0.75 cups</p>
              <p>• 6:00 PM: 0.75 cups</p>
            </div>

            <div>
              <strong>🚽 POTTY INTERVAL:</strong>
              <p>• Every 2.5 - 3 hours. Bring out immediately after waking and 15 mins post-meal.</p>
              <p>• Praise with "Yes! Good Potty" + 1 high-value liver treat.</p>
            </div>

            <div>
              <strong>🏥 EMERGENCY CONTACTS:</strong>
              <p>• Clinic: {puppy.vetClinic || 'City Vet Animal Hospital'}</p>
              <p>• Phone: {puppy.vetPhone || '(555) 392-8819'}</p>
              <p>• Pet Poison Hotline: (888) 426-4435</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="primary"
              className="w-full"
              onClick={handleCopyCheatsheet}
              leftIcon={copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            >
              {copiedLink ? 'Copied Cheatsheet to Clipboard!' : 'Copy Sitter Cheatsheet'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Invite Modal */}
      <Modal isOpen={isInviteOpen} onClose={() => setIsInviteOpen(false)} title="Invite Caregiver">
        <form onSubmit={handleSendInvite} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#2C211B] uppercase tracking-wider mb-1">
              Caregiver Name
            </label>
            <input
              type="text"
              required
              value={inviteName}
              onChange={(e) => setInviteName(e.target.value)}
              placeholder="e.g. David Miller"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DDD3] bg-[#FFF9F2] text-sm focus:outline-none focus:border-[#8B5E3C]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2C211B] uppercase tracking-wider mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="david@example.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DDD3] bg-[#FFF9F2] text-sm focus:outline-none focus:border-[#8B5E3C]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2C211B] uppercase tracking-wider mb-1">
              Role & Permissions
            </label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border border-[#E8DDD3] bg-[#FFF9F2] text-xs focus:outline-none focus:border-[#8B5E3C]"
            >
              <option value="Admin">Admin (Full Control)</option>
              <option value="Member">Family Member (Log Tasks & Potty)</option>
              <option value="Walker / Sitter">Pet Sitter / Walker (Restricted View)</option>
            </select>
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsInviteOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="flex-1">
              Send Invitation Link
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
