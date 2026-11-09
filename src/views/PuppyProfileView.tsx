import React, { useState, useEffect } from 'react';
import { generatePupLumeQRDataUrl } from '../lib/qrCodeGenerator';
import { PupLumeQRCode } from '../components/common/PupLumeQRCode';
import { 
  Dog, 
  Edit3, 
  Heart, 
  ShieldCheck, 
  Phone, 
  Calendar, 
  Award, 
  Sparkles, 
  Camera,
  Cloud,
  QrCode,
  Printer,
  ExternalLink,
  Copy,
  Check,
  AlertTriangle,
  Zap,
  Lock,
  Unlock,
  MapPin,
  FileText,
  Mail,
  Share2,
  Globe,
  MessageCircle
} from 'lucide-react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { PuppyProfile } from '../types';
import { storage } from '../lib/storage';
import { nativeBridge } from '../lib/nativeBridge';
import { copyToClipboard } from '../lib/clipboard';
import { ShareModal } from '../components/common/ShareModal';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { CloudinaryImageUploader } from '../components/ui/CloudinaryImageUploader';
import { SmartTagPaywallModal } from '../components/ui/SmartTagPaywallModal';
import { MissingPupFlyerModal } from '../components/ui/MissingPupFlyerModal';
import { PrintableCollarTagModal } from '../components/ui/PrintableCollarTagModal';
import { SmartCollarTagLogo } from '../components/common/SmartCollarTagLogo';
import { CommunicationLinksInput, CommunicationLinkItem } from '../components/common/CommunicationLinksInput';
import { RewardSettingInput } from '../components/common/RewardSettingInput';
import { CountryPhoneInput } from '../components/common/CountryPhoneInput';
import { 
  validatePhoneNumber, 
  validateFinderInstructions, 
  validateRewardAmount, 
  validateCommunicationLink,
  sanitizePhoneInput,
  preventLetterInput
} from '../lib/validation';

interface PuppyProfileViewProps {
  puppy: PuppyProfile;
  onUpdatePuppy: (updated: PuppyProfile) => void;
}

export const PuppyProfileView: React.FC<PuppyProfileViewProps> = ({ puppy, onUpdatePuppy }) => {
  const unlockSmartTagPassMutation = useMutation(api.puppies.unlockSmartTagPass);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);
  const [isFlyerOpen, setIsFlyerOpen] = useState(false);
  const [isCollarTagPrintOpen, setIsCollarTagPrintOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareModalConfig, setShareModalConfig] = useState<{ isEmergency: boolean; title: string }>({ isEmergency: false, title: '' });

  // QR Code State
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Smart Tag Unlock State (persisted locally & in puppy record)
  const [hasSmartTagPass, setHasSmartTagPass] = useState<boolean>(() => {
    if (puppy.hasSmartTagPass) return true;
    if (typeof window !== 'undefined') {
      return localStorage.getItem(`puplume_smart_tag_pass_${puppy.id}`) === 'true';
    }
    return false;
  });

  // Lost Mode States
  const [isLost, setIsLost] = useState<boolean>(puppy.isLost ?? false);
  const [rewardAmount, setRewardAmount] = useState<string>(puppy.rewardAmount || '');
  const [emergencyNotes, setEmergencyNotes] = useState<string>(puppy.emergencyNotes || '');
  const [ownerPhone, setOwnerPhone] = useState<string>(puppy.ownerPhone || '');
  const [ownerEmail, setOwnerEmail] = useState<string>(puppy.ownerEmail || '');

  // Communication links state (1 field by default: WhatsApp with 100+ app dropdown & auto-detection)
  const [communicationLinks, setCommunicationLinks] = useState<CommunicationLinkItem[]>(() => {
    if (puppy.communicationLinks && puppy.communicationLinks.length > 0) {
      return puppy.communicationLinks;
    }
    const initial: CommunicationLinkItem[] = [];
    if (puppy.ownerWhatsApp) {
      initial.push({ id: 'link-wa', platform: 'whatsapp', value: puppy.ownerWhatsApp });
    }
    if (puppy.ownerInstagram) {
      initial.push({ id: 'link-ig', platform: 'instagram', value: puppy.ownerInstagram });
    }
    if (puppy.ownerTelegram) {
      initial.push({ id: 'link-tg', platform: 'telegram', value: puppy.ownerTelegram });
    }
    if (puppy.ownerFacebook) {
      initial.push({ id: 'link-fb', platform: 'facebook', value: puppy.ownerFacebook });
    }
    if (puppy.ownerSlack) {
      initial.push({ id: 'link-slack', platform: 'slack', value: puppy.ownerSlack });
    }
    if (initial.length === 0) {
      return [{ id: 'link-default-wa', platform: 'whatsapp', value: '' }];
    }
    return initial;
  });

  // Validation & Feedback States
  const [contactError, setContactError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [fieldErrors, setFieldErrors] = useState<{ phone?: string; notes?: string; reward?: string }>({});

  const phoneValidation = validatePhoneNumber(ownerPhone);
  const notesValidation = validateFinderInstructions(emergencyNotes);

  // Form states for general profile edit
  const [name, setName] = useState(puppy.name);
  const [birthDate, setBirthDate] = useState(puppy.birthDate);
  const [breed, setBreed] = useState(puppy.breed);
  const [weightLbs, setWeightLbs] = useState(puppy.weightLbs.toString());
  const [photoUrl, setPhotoUrl] = useState(puppy.photoUrl);
  const [temperament, setTemperament] = useState(puppy.temperament || '');
  const [dietary, setDietary] = useState(puppy.dietaryRestrictions || '');
  const [treat, setTreat] = useState(puppy.favoriteTreat || '');
  const [vetClinic, setVetClinic] = useState(puppy.vetClinic || '');
  const [vetPhone, setVetPhone] = useState(puppy.vetPhone || '');
  const [microchip, setMicrochip] = useState(puppy.microchipNumber || '');
  const [insurance, setInsurance] = useState(puppy.insuranceProvider || '');

  // Construct Public Webpage URL
  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  const publicSlug = encodeURIComponent(puppy.name.toLowerCase());
  const publicUrl = `${origin}/pup/${publicSlug}`;

  // Generate Custom PupLume QR Code data URL with center logo
  useEffect(() => {
    generatePupLumeQRDataUrl(publicUrl, { size: 800 })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('Failed to generate PupLume QR code:', err));
  }, [publicUrl]);

  const lastPuppyIdRef = React.useRef(puppy.id);

  // Sync state ONLY when switching to a different puppy
  useEffect(() => {
    if (lastPuppyIdRef.current !== puppy.id) {
      lastPuppyIdRef.current = puppy.id;
      setName(puppy.name);
      setBirthDate(puppy.birthDate);
      setBreed(puppy.breed);
      setWeightLbs(puppy.weightLbs.toString());
      setPhotoUrl(puppy.photoUrl);
      setTemperament(puppy.temperament || '');
      setDietary(puppy.dietaryRestrictions || '');
      setTreat(puppy.favoriteTreat || '');
      setVetClinic(puppy.vetClinic || '');
      setVetPhone(puppy.vetPhone || '');
      setMicrochip(puppy.microchipNumber || '');
      setInsurance(puppy.insuranceProvider || '');
      setIsLost(puppy.isLost ?? false);
      setRewardAmount(puppy.rewardAmount || '');
      setEmergencyNotes(puppy.emergencyNotes || '');
      setOwnerPhone(puppy.ownerPhone || '');
      setOwnerEmail(puppy.ownerEmail || '');

      if (puppy.communicationLinks && puppy.communicationLinks.length > 0) {
        setCommunicationLinks(puppy.communicationLinks);
      } else {
        const initialLinks: CommunicationLinkItem[] = [];
        if (puppy.ownerWhatsApp) initialLinks.push({ id: 'link-wa', platform: 'whatsapp', value: puppy.ownerWhatsApp });
        if (puppy.ownerInstagram) initialLinks.push({ id: 'link-ig', platform: 'instagram', value: puppy.ownerInstagram });
        if (puppy.ownerTelegram) initialLinks.push({ id: 'link-tg', platform: 'telegram', value: puppy.ownerTelegram });
        if (puppy.ownerFacebook) initialLinks.push({ id: 'link-fb', platform: 'facebook', value: puppy.ownerFacebook });
        if (puppy.ownerSlack) initialLinks.push({ id: 'link-slack', platform: 'slack', value: puppy.ownerSlack });
        if (initialLinks.length === 0) {
          initialLinks.push({ id: 'link-default-wa', platform: 'whatsapp', value: '' });
        }
        setCommunicationLinks(initialLinks);
      }

      const localPass = typeof window !== 'undefined' ? localStorage.getItem(`puplume_smart_tag_pass_${puppy.id}`) === 'true' : false;
      setHasSmartTagPass(Boolean(puppy.hasSmartTagPass || localPass));
    }
  }, [puppy.id]);

  // Calculate age
  const bDate = new Date(puppy.birthDate);
  const ageWeeks = Math.max(1, Math.floor((new Date().getTime() - bDate.getTime()) / (1000 * 60 * 60 * 24 * 7)));

  const handleCopyLink = async () => {
    nativeBridge.haptics.light();
    const ok = await copyToClipboard(publicUrl);
    if (ok) {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2500);
    }
  };

  const handleUnlockSmartTag = () => {
    setHasSmartTagPass(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem(`puplume_smart_tag_pass_${puppy.id}`, 'true');
    }
    const updated: PuppyProfile = {
      ...puppy,
      hasSmartTagPass: true,
    };
    storage.savePuppy(updated);
    onUpdatePuppy(updated);
    setIsPaywallOpen(false);

    unlockSmartTagPassMutation({
      identifier: puppy.name,
      puppyId: puppy.id,
    }).catch((err) => {
      console.debug('[PuppyProfileView] Convex smart tag unlock sync error:', err);
    });
  };

  const handleToggleLostMode = (nextLost: boolean) => {
    setIsLost(nextLost);
    const validLinks = communicationLinks.filter((l) => l.value.trim() !== '');
    const waLink = communicationLinks.find((l) => l.platform === 'whatsapp')?.value;
    const igLink = communicationLinks.find((l) => l.platform === 'instagram')?.value;
    const fbLink = communicationLinks.find((l) => l.platform === 'facebook' || l.platform === 'messenger')?.value;
    const tgLink = communicationLinks.find((l) => l.platform === 'telegram')?.value;
    const slackLink = communicationLinks.find((l) => l.platform === 'slack')?.value;

    const updated: PuppyProfile = {
      ...puppy,
      isLost: nextLost,
      rewardAmount: rewardAmount.trim() || undefined,
      emergencyNotes: emergencyNotes.trim(),
      ownerPhone: ownerPhone.trim(),
      ownerEmail: ownerEmail.trim() || undefined,
      communicationLinks: validLinks,
      ownerInstagram: igLink || undefined,
      ownerFacebook: fbLink || undefined,
      ownerWhatsApp: waLink || undefined,
      ownerTelegram: tgLink || undefined,
      ownerSlack: slackLink || undefined,
    };
    storage.savePuppy(updated);
    onUpdatePuppy(updated);
  };

  const saveContactInfoSilently = (
    overridePhone?: string,
    overrideNotes?: string,
    overrideReward?: string,
    overrideLinks?: CommunicationLinkItem[]
  ) => {
    const currentPhone = overridePhone !== undefined ? overridePhone : ownerPhone;
    const currentNotes = overrideNotes !== undefined ? overrideNotes : emergencyNotes;
    const currentReward = overrideReward !== undefined ? overrideReward : rewardAmount;
    const currentLinks = overrideLinks !== undefined ? overrideLinks : communicationLinks;

    const validLinks = currentLinks.filter((l) => l.value.trim() !== '');
    const waLink = currentLinks.find((l) => l.platform === 'whatsapp')?.value;
    const igLink = currentLinks.find((l) => l.platform === 'instagram')?.value;
    const fbLink = currentLinks.find((l) => l.platform === 'facebook' || l.platform === 'messenger')?.value;
    const tgLink = currentLinks.find((l) => l.platform === 'telegram')?.value;
    const slackLink = currentLinks.find((l) => l.platform === 'slack')?.value;

    const updated: PuppyProfile = {
      ...puppy,
      isLost,
      rewardAmount: currentReward.trim() || undefined,
      emergencyNotes: currentNotes.trim(),
      ownerPhone: currentPhone.trim(),
      ownerEmail: ownerEmail.trim() || undefined,
      communicationLinks: validLinks,
      ownerInstagram: igLink || undefined,
      ownerFacebook: fbLink || undefined,
      ownerWhatsApp: waLink || undefined,
      ownerTelegram: tgLink || undefined,
      ownerSlack: slackLink || undefined,
    };
    storage.savePuppy(updated);
    // Silent storage write only — no global toast popups while editing
  };

  const currentTagPuppy: PuppyProfile = React.useMemo(() => ({
    ...puppy,
    ownerPhone: ownerPhone.trim() || puppy.ownerPhone || '',
    emergencyNotes: emergencyNotes.trim() || puppy.emergencyNotes || '',
    rewardAmount: rewardAmount.trim() || puppy.rewardAmount,
    isLost,
    communicationLinks: communicationLinks.filter((l) => l.value.trim() !== ''),
  }), [puppy, ownerPhone, emergencyNotes, rewardAmount, isLost, communicationLinks]);

  const handleOpenPrintCollarTag = () => {
    saveContactInfoSilently();
    setIsCollarTagPrintOpen(true);
  };

  const handleOpenFlyer = () => {
    saveContactInfoSilently();
    setIsFlyerOpen(true);
  };

  const handleSharePassport = () => {
    nativeBridge.haptics.medium();
    setShareModalConfig({ isEmergency: false, title: `Share ${puppy.name}'s Passport 🐾` });
    setIsShareModalOpen(true);
  };

  const handleShareSafetyTag = () => {
    nativeBridge.haptics.medium();
    setShareModalConfig({ isEmergency: false, title: `${puppy.name}'s Smart Collar Tag 🐾` });
    setIsShareModalOpen(true);
  };

  React.useEffect(() => {
    const handleSos = () => {
      handleShareEmergencyAlert();
    };
    window.addEventListener('open-sos-alert', handleSos);
    return () => window.removeEventListener('open-sos-alert', handleSos);
  }, [puppy.name]);

  const handleShareEmergencyAlert = async () => {
    nativeBridge.haptics.warning();
    setShareModalConfig({ isEmergency: true, title: `🚨 Missing Puppy Alert: ${puppy.name}` });
    setIsShareModalOpen(true);
  };

  const handleSaveEmergencyContact = () => {
    const newErrors: { phone?: string; notes?: string; reward?: string } = {};

    // 1. Phone number logic:
    // If ownerPhone is empty, but user provided a WhatsApp phone number, adopt it seamlessly!
    const waLink = communicationLinks.find((l) => l.platform === 'whatsapp')?.value?.trim();
    let effectivePhone = ownerPhone.trim();
    if (!effectivePhone && waLink) {
      effectivePhone = waLink;
      setOwnerPhone(waLink);
    }

    const phoneRes = validatePhoneNumber(effectivePhone);
    if (!phoneRes.isValid) {
      newErrors.phone = phoneRes.error;
    }

    // 2. Instructions for Finder:
    const effectiveNotes = emergencyNotes.trim();
    const notesRes = validateFinderInstructions(effectiveNotes);
    if (!effectiveNotes) {
      newErrors.notes = 'Instructions for Finder are required so people finding your puppy know how to handle them.';
    } else if (!notesRes.isValid) {
      newErrors.notes = notesRes.error;
    }

    // 3. Reward Setting:
    const rewardRes = validateRewardAmount(rewardAmount);
    if (!rewardRes.isValid) {
      newErrors.reward = rewardRes.error;
    }

    // 4. Communication Links:
    for (const link of communicationLinks) {
      if (link.value.trim()) {
        const linkRes = validateCommunicationLink(link.platform, link.value);
        if (!linkRes.isValid) {
          setContactError(`Invalid ${link.platform} link: ${linkRes.error}`);
          return;
        }
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      setContactError("Please complete all required fields correctly before saving.");
      return;
    }

    setFieldErrors({});
    setContactError(null);

    const validLinks = [...communicationLinks.filter((l) => l.value.trim() !== '')];
    // If owner phone is present but no WhatsApp link is set, automatically add it for ease of use
    if (effectivePhone && !validLinks.some((l) => l.platform === 'whatsapp')) {
      validLinks.push({ id: `link-wa-${Date.now()}`, platform: 'whatsapp', value: effectivePhone });
      setCommunicationLinks(validLinks);
    }

    const wa = validLinks.find((l) => l.platform === 'whatsapp')?.value || effectivePhone;
    const ig = validLinks.find((l) => l.platform === 'instagram')?.value;
    const fb = validLinks.find((l) => l.platform === 'facebook' || l.platform === 'messenger')?.value;
    const tg = validLinks.find((l) => l.platform === 'telegram')?.value;
    const slack = validLinks.find((l) => l.platform === 'slack')?.value;

    const updated: PuppyProfile = {
      ...puppy,
      isLost,
      rewardAmount: rewardRes.cleanedValue || undefined,
      emergencyNotes: notesRes.cleanedValue || effectiveNotes,
      ownerPhone: phoneRes.cleanedValue || effectivePhone,
      ownerEmail: ownerEmail.trim() || undefined,
      communicationLinks: validLinks,
      ownerInstagram: ig || undefined,
      ownerFacebook: fb || undefined,
      ownerWhatsApp: wa || undefined,
      ownerTelegram: tg || undefined,
      ownerSlack: slack || undefined,
    };

    storage.savePuppy(updated);
    onUpdatePuppy(updated);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handlePhotoUploaded = (newUrl: string) => {
    setPhotoUrl(newUrl);
    const updated: PuppyProfile = {
      ...puppy,
      photoUrl: newUrl,
    };
    storage.savePuppy(updated);
    onUpdatePuppy(updated);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const phoneRes = validatePhoneNumber(ownerPhone);
    if (!phoneRes.isValid) {
      alert(`Invalid Phone: ${phoneRes.error}`);
      return;
    }
    const notesRes = validateFinderInstructions(emergencyNotes);
    if (!notesRes.isValid) {
      alert(`Invalid Instructions: ${notesRes.error}`);
      return;
    }
    const rewardRes = validateRewardAmount(rewardAmount);
    if (!rewardRes.isValid) {
      alert(`Invalid Reward: ${rewardRes.error}`);
      return;
    }

    const validLinks = communicationLinks.filter((l) => l.value.trim() !== '');
    const waLink = communicationLinks.find((l) => l.platform === 'whatsapp')?.value;
    const igLink = communicationLinks.find((l) => l.platform === 'instagram')?.value;
    const fbLink = communicationLinks.find((l) => l.platform === 'facebook' || l.platform === 'messenger')?.value;
    const tgLink = communicationLinks.find((l) => l.platform === 'telegram')?.value;
    const slackLink = communicationLinks.find((l) => l.platform === 'slack')?.value;

    const updated: PuppyProfile = {
      ...puppy,
      name,
      breed,
      birthDate,
      weightLbs: parseFloat(weightLbs) || puppy.weightLbs,
      photoUrl,
      temperament,
      dietaryRestrictions: dietary,
      favoriteTreat: treat,
      vetClinic,
      vetPhone,
      microchipNumber: microchip,
      insuranceProvider: insurance,
      ownerPhone: ownerPhone.trim(),
      ownerEmail: ownerEmail.trim() || undefined,
      emergencyNotes: emergencyNotes.trim(),
      rewardAmount: rewardAmount.trim() || undefined,
      communicationLinks: validLinks,
      ownerInstagram: igLink || undefined,
      ownerFacebook: fbLink || undefined,
      ownerWhatsApp: waLink || undefined,
      ownerTelegram: tgLink || undefined,
      ownerSlack: slackLink || undefined,
      isLost,
      hasSmartTagPass,
    };
    storage.savePuppy(updated);
    onUpdatePuppy(updated);
    setIsEditOpen(false);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-24">
      
      {/* Hero Profile Card */}
      <div className="bg-white rounded-3xl border border-[#E8DDD3] p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          <div className="relative group">
            <img
              src={puppy.photoUrl}
              alt={puppy.name}
              className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl object-cover border-4 border-[#8B5E3C] shadow-md"
            />
            <div className="absolute -bottom-2 -right-2">
              <CloudinaryImageUploader
                currentImageUrl={puppy.photoUrl}
                onUploadSuccess={handlePhotoUploaded}
                folder="puplume/puppies"
                label="Photo"
                variant="button"
              />
            </div>
          </div>

          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-[#2C211B] flex items-center justify-center sm:justify-start gap-2">
                  {puppy.name}
                  <span className="text-xs font-bold uppercase tracking-wider bg-[#F3E7DA] text-[#5F3E29] px-2.5 py-0.5 rounded-full">
                    {puppy.sex}
                  </span>
                </h1>
                <p className="text-sm text-[#766A63] font-medium mt-0.5">
                  {puppy.breed} • {ageWeeks} weeks old ({puppy.weightLbs} lbs)
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 self-center sm:self-start">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSharePassport}
                  leftIcon={<Share2 className="w-4 h-4 text-[#8B5E3C]" />}
                  title="Share pet passport via WhatsApp, Messages, AirDrop"
                >
                  Share Passport
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditOpen(true)}
                  leftIcon={<Edit3 className="w-4 h-4" />}
                >
                  Edit Profile
                </Button>
              </div>
            </div>

            {/* Quick stats pills */}
            <div className="mt-4 flex flex-wrap justify-center sm:justify-start gap-2 text-xs">
              <span className="px-3 py-1 rounded-xl bg-[#FFF9F2] border border-[#E8DDD3] text-[#5F3E29] font-medium">
                🎂 Born: {puppy.birthDate || 'Date not set'}
              </span>
              {puppy.favoriteTreat ? (
                <span className="px-3 py-1 rounded-xl bg-[#FFF9F2] border border-[#E8DDD3] text-[#5F3E29] font-medium">
                  🍖 Favorite: {puppy.favoriteTreat}
                </span>
              ) : null}
              {puppy.microchipNumber ? (
                <span className="px-3 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold">
                  ✓ Microchipped
                </span>
              ) : null}
              {isLost && (
                <span className="px-3 py-1 rounded-xl bg-rose-500 text-white font-black animate-pulse">
                  🚨 Missing Mode Active
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* SMART QR COLLAR TAG & SAFETY HUB */}
      <div className="bg-white rounded-3xl border-2 border-[#8B5E3C]/20 p-6 sm:p-8 shadow-xs relative overflow-hidden space-y-6">
        
        {/* Hub Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8DDD3] pb-5">
          <div className="flex items-center gap-3">
            <SmartCollarTagLogo variant="icon" size="md" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-[#2C211B]">
                  Smart QR Collar Tag & Safety Hub
                </h2>
                {hasSmartTagPass ? (
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-full uppercase tracking-wider">
                    Active
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-black rounded-full uppercase tracking-wider">
                    $1.99 Pass
                  </span>
                )}
              </div>
              <p className="text-xs text-[#766A63] mt-0.5">
                Zero-battery scannable safety webpage for {puppy.name}. Anyone who finds your pup can contact you with 1 tap.
              </p>
            </div>
          </div>

          {!hasSmartTagPass && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsPaywallOpen(true)}
              leftIcon={<Zap className="w-4 h-4 text-amber-300" />}
              className="shadow-md"
            >
              Unlock for $1.99
            </Button>
          )}
        </div>

        {/* Locked State Teaser / Unlocked Full Hub */}
        {!hasSmartTagPass ? (
          <div className="bg-[#FFF9F2] rounded-2xl border border-[#E8DDD3] p-6 text-center space-y-4">
            <div className="max-w-md mx-auto space-y-2">
              <div className="w-14 h-14 bg-white rounded-2xl border border-[#E8DDD3] mx-auto flex items-center justify-center text-[#8B5E3C] shadow-2xs">
                <Lock className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-[#2C211B]">
                Unlock {puppy.name}&apos;s Permanent Smart Collar Webpage
              </h3>
              <p className="text-xs text-[#766A63] leading-relaxed">
                Get a scannable QR badge for your dog&apos;s collar, 1-tap GPS pin alerts from finders, and instant printable Missing Dog posters for just a one-time $1.99 micro-pass.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Button
                variant="primary"
                onClick={() => setIsPaywallOpen(true)}
                leftIcon={<Sparkles className="w-4 h-4 text-amber-300" />}
              >
                Activate Smart Collar Tag ($1.99)
              </Button>
              <a
                href={publicUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white hover:bg-neutral-50 text-[#2C211B] text-xs font-bold rounded-xl border border-[#E8DDD3] transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Preview Public Page
              </a>
            </div>
          </div>
        ) : (
          /* Active Unlocked Hub Content */
          <div className="space-y-6">
            
            {/* Top Link Banner */}
            <div className="bg-[#FAF6F0] rounded-2xl border border-[#E8DDD3] p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 overflow-hidden">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span className="text-xs font-bold text-[#5F3E29] shrink-0">Live Tag URL:</span>
                <span className="text-xs font-mono text-[#2C211B] truncate">{publicUrl}</span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleShareSafetyTag}
                  className="px-3 py-1.5 bg-[#FFF9F2] hover:bg-[#F3E7DA] text-[#8B5E3C] text-xs font-bold rounded-xl border border-[#8B5E3C]/30 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  title="Share safety tag via native mobile share"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share Tag</span>
                </button>

                <button
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 bg-white hover:bg-[#F3E7DA] text-[#2C211B] text-xs font-bold rounded-xl border border-[#E8DDD3] transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedUrl ? 'Copied!' : 'Copy Link'}</span>
                </button>

                <a
                  href={publicUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-[#8B5E3C] hover:bg-[#6D492F] text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Test Page</span>
                </a>
              </div>
            </div>

            {/* Hub Two-Column Layout */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              
              {/* Left Column: Collar QR Code Card */}
              <div className="md:col-span-5 bg-[#FFF9F2] rounded-3xl border border-[#E8DDD3] p-5 flex flex-col items-center text-center space-y-3.5">
                <span className="text-[11px] font-black uppercase tracking-wider text-[#8B5E3C]">
                  Official PupLume Smart Collar QR Tag
                </span>

                {/* Branded PupLume QR Code with Center Logo & Fast Actions */}
                <PupLumeQRCode
                  value={publicUrl}
                  puppyName={puppy.name}
                  size={176}
                  showActions={true}
                />

                <p className="text-[11px] text-[#766A63] leading-relaxed">
                  Anyone who points their smartphone camera at this QR code instantly accesses {puppy.name}&apos;s verified emergency card.
                </p>

                {/* Print Collar Tag Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleOpenPrintCollarTag}
                  leftIcon={<Printer className="w-4 h-4" />}
                  className="w-full bg-white text-xs font-bold"
                >
                  Print Physical Collar Badge (1.5&quot;)
                </Button>
              </div>

              {/* Right Column: Emergency Actions & Lost Mode */}
              <div className="md:col-span-7 space-y-4">
                
                {/* Lost Mode Control Box */}
                <div className={`rounded-3xl p-5 border-2 transition-all ${
                  isLost 
                    ? 'bg-rose-50/80 border-rose-400 shadow-sm' 
                    : 'bg-white border-[#E8DDD3]'
                }`}>
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className={`w-5 h-5 ${isLost ? 'text-rose-600' : 'text-[#766A63]'}`} />
                      <h3 className={`text-sm font-black uppercase tracking-wider ${isLost ? 'text-rose-900' : 'text-[#2C211B]'}`}>
                        Emergency Lost Mode
                      </h3>
                    </div>

                    {/* Toggle Switch */}
                    <button
                      onClick={() => handleToggleLostMode(!isLost)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        isLost ? 'bg-rose-600' : 'bg-neutral-300'
                      }`}
                      role="switch"
                      aria-checked={isLost}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                          isLost ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  <p className="text-xs text-[#766A63] leading-relaxed">
                    {isLost ? (
                      <span className="font-bold text-rose-800">
                        🚨 Lost Mode is ACTIVE! The public webpage is displaying urgent missing alerts and reward callouts.
                      </span>
                    ) : (
                      "Turn on Lost Mode if your puppy wanders away. This adds a prominent Missing Alert and reward banner to their public safety webpage."
                    )}
                  </p>

                  {/* Lost Dog Flyer Action Button */}
                  <div className="mt-4 pt-3 border-t border-neutral-200/80 flex flex-col sm:flex-row items-center gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleOpenFlyer}
                      leftIcon={<FileText className="w-4 h-4 text-amber-300" />}
                      className={`w-full sm:w-auto font-bold text-xs ${
                        isLost ? 'bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-600/20' : ''
                      }`}
                    >
                      🚨 Open Printable Flyer
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleShareEmergencyAlert}
                      leftIcon={<Share2 className="w-4 h-4 text-rose-600" />}
                      className="w-full sm:w-auto font-bold text-xs border-rose-300 text-rose-700 hover:bg-rose-50"
                      title="Instantly broadcast missing alert via WhatsApp, Messages, or AirDrop"
                    >
                      Broadcast Missing Alert
                    </Button>
                    <span className="text-[11px] text-[#766A63] hidden sm:inline">
                      1-tap share with neighbors & family
                    </span>
                  </div>
                </div>

                {/* Emergency Contact & Finder Settings */}
                <div className="bg-[#FAF6F0] rounded-3xl border border-[#E8DDD3] p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black uppercase tracking-wider text-[#8B5E3C] flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5" /> Contact Information Displayed on Tag
                    </h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                      Live on Scanned Tag
                    </span>
                  </div>

                  {contactError && (
                    <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 font-semibold flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                      <span>{contactError}</span>
                    </div>
                  )}

                  {saveSuccess && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center gap-2">
                      <Check className="w-4 h-4 shrink-0 text-emerald-600" />
                      <span>Tag details and contact information updated successfully!</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Owner Phone (REQUIRED) */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[11px] font-bold text-[#5F3E29]">
                          Owner Phone Number <span className="text-amber-800 text-[10px] font-bold bg-amber-100/80 px-1.5 py-0.5 rounded-md border border-amber-200 ml-1">Required</span>
                        </label>
                        {phoneValidation.isValid && ownerPhone.trim() && (
                          <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                            <Check className="w-3 h-3 text-emerald-600" /> Valid
                          </span>
                        )}
                      </div>
                      <CountryPhoneInput
                        value={ownerPhone}
                        required
                        onChange={(val) => {
                          setOwnerPhone(val);
                          if (fieldErrors.phone) setFieldErrors(prev => ({ ...prev, phone: undefined }));
                          if (contactError) setContactError(null);
                        }}
                        placeholder="+1 (555) 123-4567 or 03XX XXXXXXX"
                        error={fieldErrors.phone}
                      />
                      {!fieldErrors.phone && (
                        <span className="text-[10px] text-[#766A63] font-medium block mt-1">
                          Printed on collar tag & used for finder SMS/calls
                        </span>
                      )}
                    </div>

                    {/* Reward Setting (DROPDOWN) */}
                    <div>
                      <RewardSettingInput
                        value={rewardAmount}
                        onChange={(val) => {
                          setRewardAmount(val);
                          if (fieldErrors.reward) setFieldErrors(prev => ({ ...prev, reward: undefined }));
                          if (contactError) setContactError(null);
                        }}
                        error={fieldErrors.reward}
                      />
                    </div>
                  </div>

                  {/* Finder Instructions (REQUIRED) */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-bold text-[#5F3E29]">
                        Instructions for Finder <span className="text-amber-800 text-[10px] font-bold bg-amber-100/80 px-1.5 py-0.5 rounded-md border border-amber-200 ml-1">Required</span>
                      </label>
                      {notesValidation.isValid && emergencyNotes.trim() ? (
                        <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                          <Check className="w-3 h-3 text-emerald-600" /> Valid
                        </span>
                      ) : (
                        <span className="text-[10px] text-[#766A63]">Handling, Temperament & Allergies</span>
                      )}
                    </div>
                    <textarea
                      rows={2}
                      required
                      value={emergencyNotes}
                      onChange={(e) => {
                        setEmergencyNotes(e.target.value);
                        if (fieldErrors.notes) setFieldErrors(prev => ({ ...prev, notes: undefined }));
                        if (contactError) setContactError(null);
                      }}
                      placeholder="e.g. Loves peanut butter, do not chase, friendly with kids and dogs"
                      className={`w-full px-3 py-2 rounded-xl border ${
                        fieldErrors.notes ? 'border-amber-400 bg-amber-50/20' : 'border-[#E8DDD3] bg-white'
                      } text-xs text-[#2C211B] focus:outline-none focus:border-[#8B5E3C] focus:ring-1 focus:ring-[#8B5E3C] resize-none`}
                    />
                    {fieldErrors.notes ? (
                      <span className="text-[10px] text-amber-800 font-bold block mt-1 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                        {fieldErrors.notes}
                      </span>
                    ) : (
                      <span className="text-[10px] text-[#766A63] font-medium block mt-1">
                        Shown immediately to anyone scanning the collar tag
                      </span>
                    )}
                  </div>

                  {/* Dynamic 1-Field Communication Links with 100+ App Favicons & Auto-detect */}
                  <div className="pt-2 border-t border-[#E8DDD3]/80">
                    <CommunicationLinksInput
                      links={communicationLinks}
                      onChange={(updatedLinks) => {
                        setCommunicationLinks(updatedLinks);
                        const wa = updatedLinks.find(l => l.platform === 'whatsapp')?.value?.trim();
                        if (wa && !ownerPhone.trim()) {
                          const phoneCheck = validatePhoneNumber(wa);
                          if (phoneCheck.isValid && phoneCheck.cleanedValue) {
                            setOwnerPhone(phoneCheck.cleanedValue);
                            if (fieldErrors.phone) setFieldErrors(prev => ({ ...prev, phone: undefined }));
                            if (contactError) setContactError(null);
                          }
                        }
                      }}
                      maxRecommended={3}
                    />
                  </div>

                  {/* Save Button for Quick Tag Details */}
                  <div className="pt-2 flex justify-end">
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={handleSaveEmergencyContact}
                      leftIcon={<Check className="w-3.5 h-3.5" />}
                    >
                      Save Tag & Contact Details
                    </Button>
                  </div>
                </div>

              </div>
            </div>

          </div>
        )}

      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Behavior & Temperament */}
        <div className="p-5 rounded-3xl bg-white border border-[#E8DDD3] shadow-xs space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#8B5E3C] flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" /> Temperament & Traits
          </span>
          <p className="text-xs sm:text-sm text-[#2C211B] leading-relaxed">
            {puppy.temperament || (
              <span className="text-[#766A63] italic">No temperament notes added yet. Tap &quot;Edit Profile&quot; to add details.</span>
            )}
          </p>
        </div>

        {/* Nutrition */}
        <div className="p-5 rounded-3xl bg-white border border-[#E8DDD3] shadow-xs space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#8B5E3C] flex items-center gap-1.5">
            <Heart className="w-4 h-4" /> Nutrition & Diet
          </span>
          <p className="text-xs sm:text-sm text-[#2C211B] leading-relaxed">
            {puppy.dietaryRestrictions || (
              <span className="text-[#766A63] italic">No food brand or feeding instructions recorded yet.</span>
            )}
          </p>
        </div>

        {/* Primary Vet Clinic */}
        <div className="p-5 rounded-3xl bg-white border border-[#E8DDD3] shadow-xs space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#8B5E3C] flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" /> Veterinary Clinic
          </span>
          {puppy.vetClinic || puppy.vetPhone || puppy.vetName ? (
            <>
              <h4 className="text-sm font-bold text-[#2C211B]">{puppy.vetClinic || 'Clinic not specified'}</h4>
              {puppy.vetName && <p className="text-xs text-[#5F3E29]">{puppy.vetName}</p>}
              {puppy.vetPhone && (
                <p className="text-xs font-semibold text-[#8B5E3C] flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" /> {puppy.vetPhone}
                </p>
              )}
            </>
          ) : (
            <p className="text-xs text-[#766A63] italic">No veterinary clinic added yet.</p>
          )}
        </div>

        {/* Identification & Insurance */}
        <div className="p-5 rounded-3xl bg-white border border-[#E8DDD3] shadow-xs space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#8B5E3C] flex items-center gap-1.5">
            <Award className="w-4 h-4" /> Identification & Policy
          </span>
          <p className="text-xs text-[#2C211B]">
            Microchip ID: <strong>{puppy.microchipNumber || 'Not recorded'}</strong>
          </p>
          <p className="text-xs text-[#2C211B]">
            Insurance: <strong>{puppy.insuranceProvider || 'Not recorded'}</strong>
          </p>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Puppy Profile">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#2C211B] uppercase tracking-wider mb-1">
              Puppy Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-[#E8DDD3] bg-[#FFF9F2] text-sm focus:outline-none focus:border-[#8B5E3C]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#2C211B] uppercase tracking-wider mb-1">
                Breed
              </label>
              <input
                type="text"
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E8DDD3] bg-[#FFF9F2] text-xs focus:outline-none focus:border-[#8B5E3C]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#2C211B] uppercase tracking-wider mb-1">
                Weight (lbs)
              </label>
              <input
                type="number"
                step="0.1"
                value={weightLbs}
                onChange={(e) => setWeightLbs(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E8DDD3] bg-[#FFF9F2] text-xs focus:outline-none focus:border-[#8B5E3C]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2C211B] uppercase tracking-wider mb-1">
              Puppy Photo
            </label>
            <CloudinaryImageUploader
              currentImageUrl={photoUrl}
              onUploadSuccess={(url) => setPhotoUrl(url)}
              folder="puplume/puppies"
              label={`Upload ${name || 'Puppy'}'s Photo`}
              sublabel="Upload a high-quality picture of your pet"
              variant="card"
            />
          </div>

          {/* Safety Tag & Emergency Contact Section */}
          <div className="p-4 bg-[#FAF6F0] rounded-2xl border border-[#E8DDD3] space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-[#8B5E3C] flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5" /> Emergency Collar Tag Details
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#2C211B] uppercase tracking-wider mb-1">
                  Owner Phone <span className="text-amber-800 text-[10px] font-bold bg-amber-100/80 px-1.5 py-0.5 rounded-md border border-amber-200 ml-1">Required</span>
                </label>
                <CountryPhoneInput
                  value={ownerPhone}
                  required
                  onChange={(val) => setOwnerPhone(val)}
                  placeholder="+1 (555) 123-4567 or 03XX XXXXXXX"
                />
              </div>

              <div>
                <RewardSettingInput
                  value={rewardAmount}
                  onChange={(val) => setRewardAmount(val)}
                  label="Reward Amount"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2C211B] uppercase tracking-wider mb-1">
                Instructions for Finder <span className="text-amber-800 text-[10px] font-bold bg-amber-100/80 px-1.5 py-0.5 rounded-md border border-amber-200 ml-1">Required</span>
              </label>
              <textarea
                rows={2}
                required
                value={emergencyNotes}
                onChange={(e) => setEmergencyNotes(e.target.value)}
                placeholder="e.g. Friendly, loves peanut butter, do not chase"
                className="w-full px-3.5 py-2 rounded-xl border border-[#E8DDD3] bg-white text-xs focus:outline-none focus:border-[#8B5E3C] resize-none"
              />
            </div>

            {/* Dynamic Communication Links in modal */}
            <div className="pt-2 border-t border-[#E8DDD3]">
              <CommunicationLinksInput
                links={communicationLinks}
                onChange={setCommunicationLinks}
                maxRecommended={3}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2C211B] uppercase tracking-wider mb-1">
              Microchip ID
            </label>
            <input
              type="text"
              value={microchip}
              onChange={(e) => setMicrochip(e.target.value)}
              placeholder="98514100..."
              className="w-full px-3.5 py-2 rounded-xl border border-[#E8DDD3] bg-[#FFF9F2] text-xs focus:outline-none focus:border-[#8B5E3C]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2C211B] uppercase tracking-wider mb-1">
              Diet / Food Formula
            </label>
            <input
              type="text"
              value={dietary}
              onChange={(e) => setDietary(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-[#E8DDD3] bg-[#FFF9F2] text-xs focus:outline-none focus:border-[#8B5E3C]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2C211B] uppercase tracking-wider mb-1">
              Favorite Treat
            </label>
            <input
              type="text"
              value={treat}
              onChange={(e) => setTreat(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-[#E8DDD3] bg-[#FFF9F2] text-xs focus:outline-none focus:border-[#8B5E3C]"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="flex-1">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Paywall Modal ($1.99 micro-pass) */}
      <SmartTagPaywallModal
        isOpen={isPaywallOpen}
        puppyName={puppy.name}
        puppyId={puppy.id}
        onClose={() => setIsPaywallOpen(false)}
        onUnlock={handleUnlockSmartTag}
      />

      {/* 1-Click Printable Lost Dog Flyer Modal */}
      <MissingPupFlyerModal
        isOpen={isFlyerOpen}
        puppy={currentTagPuppy}
        qrDataUrl={qrDataUrl}
        publicUrl={publicUrl}
        onClose={() => setIsFlyerOpen(false)}
      />

      {/* Printable Collar Tag Badge Modal */}
      <PrintableCollarTagModal
        isOpen={isCollarTagPrintOpen}
        puppy={currentTagPuppy}
        qrDataUrl={qrDataUrl}
        publicUrl={publicUrl}
        onClose={() => setIsCollarTagPrintOpen(false)}
      />

      {/* Instagram-Style Native Share Sheet Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        puppy={currentTagPuppy}
        url={publicUrl}
        title={shareModalConfig.title}
        isEmergency={shareModalConfig.isEmergency}
      />

    </div>
  );
};
