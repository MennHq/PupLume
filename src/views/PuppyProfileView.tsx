import React, { useState, useEffect, useMemo } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { useUser } from '@clerk/react';
import { api } from '../../convex/_generated/api';
import { PuppyProfile } from '../types';
import { storage } from '../lib/storage';
import { nativeBridge } from '../lib/nativeBridge';
import { copyToClipboard } from '../lib/clipboard';
import { generatePupLumeQRDataUrl } from '../lib/qrCodeGenerator';
import { PupLumeQRCode } from '../components/common/PupLumeQRCode';
import { 
  validatePuppySlug, 
  getPuppyPublicUrl, 
  getPuppyDisplayUrl, 
  generateDefaultSlug,
  normalizeSlug 
} from '../lib/slugHelper';
import { 
  Dog, 
  Edit3, 
  Heart, 
  ShieldCheck, 
  Phone, 
  Calendar, 
  Award, 
  Sparkles, 
  QrCode, 
  Printer, 
  ExternalLink, 
  Copy, 
  Check, 
  AlertTriangle, 
  Zap, 
  FileText, 
  Share2, 
  Globe, 
  RefreshCw,
  Info,
  Stethoscope,
  Smile,
  CheckCircle2,
  XCircle,
  BadgeAlert,
  HelpCircle,
  Loader2
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { CloudinaryImageUploader } from '../components/ui/CloudinaryImageUploader';
import { SmartTagPaywallModal } from '../components/ui/SmartTagPaywallModal';
import { MissingPupFlyerModal } from '../components/ui/MissingPupFlyerModal';
import { PrintableCollarTagModal } from '../components/ui/PrintableCollarTagModal';
import { SmartCollarTagLogo } from '../components/common/SmartCollarTagLogo';
import { ShareModal } from '../components/common/ShareModal';
import { CommunicationLinksInput, CommunicationLinkItem } from '../components/common/CommunicationLinksInput';
import { RewardSettingInput } from '../components/common/RewardSettingInput';
import { CountryPhoneInput } from '../components/common/CountryPhoneInput';
import { syncPuppyToConvex } from '../lib/convex';
import { 
  validatePhoneNumber, 
  validateFinderInstructions, 
  validateRewardAmount, 
  validateCommunicationLink 
} from '../lib/validation';

// Helper to push instant updates directly to marketing site puppy page
const triggerMarketingSiteInstantUpdate = async (slug: string) => {
  const cleanSlug = slug.toLowerCase().trim();
  const endpoints = [
    'https://petttttttpuplume.vercel.app',
    'https://puplumepet.vercel.app',
    typeof window !== 'undefined' ? window.location.origin : '',
  ].filter(Boolean);

  for (const origin of endpoints) {
    try {
      fetch(`${origin}/api/revalidate?slug=${encodeURIComponent(cleanSlug)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: cleanSlug }),
        mode: 'no-cors',
      }).catch(() => {});
    } catch (_) {}
  }
};

interface PuppyProfileViewProps {
  puppy: PuppyProfile;
  onUpdatePuppy: (updated: PuppyProfile, customToast?: string | false) => void;
}

export const PuppyProfileView: React.FC<PuppyProfileViewProps> = ({ puppy, onUpdatePuppy }) => {
  const { user } = useUser();
  // Convex mutations & queries
  const unlockSmartTagPassMutation = useMutation(api.puppies.unlockSmartTagPass);
  const updatePuppySlugMutation = useMutation(api.puppies.updatePuppySlug);
  const updateIndexingMutation = useMutation(api.puppies.updateSearchEngineIndexing);

  // Active view tab state
  const [activeTab, setActiveTab] = useState<'passport' | 'collar' | 'safety'>('passport');

  // Modals state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);
  const [isFlyerOpen, setIsFlyerOpen] = useState(false);
  const [isCollarTagPrintOpen, setIsCollarTagPrintOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareModalConfig, setShareModalConfig] = useState<{ isEmergency: boolean; title: string }>({ 
    isEmergency: false, 
    title: '' 
  });

  // Search Engine Indexing (SEO) State
  const [allowIndexing, setAllowIndexing] = useState<boolean>(puppy.allowSearchIndexing !== false);
  const [isUpdatingIndexing, setIsUpdatingIndexing] = useState(false);
  const [showIndexingInfo, setShowIndexingInfo] = useState(false);
  const [indexingSuccessMessage, setIndexingSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    setAllowIndexing(puppy.allowSearchIndexing !== false);
  }, [puppy.allowSearchIndexing]);

  const handleToggleIndexing = async (newValue: boolean) => {
    nativeBridge.haptics.light();
    setAllowIndexing(newValue);
    setIsUpdatingIndexing(true);
    setIndexingSuccessMessage(null);
    try {
      const updated: PuppyProfile = {
        ...puppy,
        allowSearchIndexing: newValue,
      };
      storage.savePuppy(updated);

      // syncPuppyToConvex calls savePuppy mutation which includes allowSearchIndexing
      await syncPuppyToConvex(updated);
      await triggerMarketingSiteInstantUpdate(activeSlug);

      onUpdatePuppy(
        updated, 
        newValue 
          ? `🔍 Search engine indexing enabled & updated in database!` 
          : `🔒 Profile set to unlisted in database!`
      );

      setIndexingSuccessMessage(
        newValue
          ? "✓ Search indexing enabled in database! Crawlable by Google & Bing."
          : "✓ Unlisted mode saved in database (noindex, nofollow)."
      );
      setTimeout(() => setIndexingSuccessMessage(null), 4000);
    } catch (err: any) {
      console.error("Failed to update indexing preference:", err);
      setIndexingSuccessMessage("Failed to update database. Changes saved locally.");
    } finally {
      setIsUpdatingIndexing(false);
    }
  };

  // URL Slug Editing & Migration State
  const initialSlug = puppy.slug || generateDefaultSlug(puppy.name);
  const [activeSlug, setActiveSlug] = useState<string>(initialSlug);
  const [isSlugEditorOpen, setIsSlugEditorOpen] = useState(false);
  const [slugInput, setSlugInput] = useState<string>(initialSlug);
  const [isConfirmingSlugChange, setIsConfirmingSlugChange] = useState(false);
  const [isSavingSlug, setIsSavingSlug] = useState(false);
  const [slugSuccessMessage, setSlugSuccessMessage] = useState<string | null>(null);
  const [slugErrorMessage, setSlugErrorMessage] = useState<string | null>(null);

  // Check availability against Convex DB
  const cleanCandidateSlug = normalizeSlug(slugInput);
  const availabilityQuery = useQuery(
    api.puppies.checkSlugAvailability,
    cleanCandidateSlug && cleanCandidateSlug.length >= 3 && cleanCandidateSlug.length <= 7
      ? { slug: cleanCandidateSlug, puppyId: puppy.id }
      : 'skip'
  );

  const slugValidation = useMemo(() => {
    return validatePuppySlug(slugInput, puppy.name);
  }, [slugInput, puppy.name]);

  // Public URL calculation
  const publicUrl = useMemo(() => {
    return getPuppyPublicUrl(activeSlug);
  }, [activeSlug]);

  const displayUrl = useMemo(() => {
    return getPuppyDisplayUrl(activeSlug);
  }, [activeSlug]);

  // QR Code State (regenerated whenever publicUrl changes)
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedUrl, setCopiedUrl] = useState(false);

  useEffect(() => {
    generatePupLumeQRDataUrl(publicUrl, { size: 800 })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('Failed to generate PupLume QR code:', err));
  }, [publicUrl]);

  // Smart Tag Unlock State
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

  // Communication links state
  const [communicationLinks, setCommunicationLinks] = useState<CommunicationLinkItem[]>(() => {
    if (puppy.communicationLinks && puppy.communicationLinks.length > 0) {
      return puppy.communicationLinks;
    }
    const initial: CommunicationLinkItem[] = [];
    if (puppy.ownerWhatsApp) initial.push({ id: 'link-wa', platform: 'whatsapp', value: puppy.ownerWhatsApp });
    if (puppy.ownerInstagram) initial.push({ id: 'link-ig', platform: 'instagram', value: puppy.ownerInstagram });
    if (puppy.ownerTelegram) initial.push({ id: 'link-tg', platform: 'telegram', value: puppy.ownerTelegram });
    if (puppy.ownerFacebook) initial.push({ id: 'link-fb', platform: 'facebook', value: puppy.ownerFacebook });
    if (puppy.ownerSlack) initial.push({ id: 'link-slack', platform: 'slack', value: puppy.ownerSlack });
    if (initial.length === 0) {
      return [{ id: 'link-default-wa', platform: 'whatsapp', value: '' }];
    }
    return initial;
  });

  // Feedback states
  const [contactError, setContactError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);
  const [isSavingContact, setIsSavingContact] = useState<boolean>(false);
  const [isSavingFullProfile, setIsSavingFullProfile] = useState<boolean>(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState<boolean>(false);
  const [fieldErrors, setFieldErrors] = useState<{ phone?: string; notes?: string; reward?: string }>({});

  const phoneValidation = validatePhoneNumber(ownerPhone);
  const notesValidation = validateFinderInstructions(emergencyNotes);

  // General profile form fields
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
  const [vetName, setVetName] = useState(puppy.vetName || '');
  const [microchip, setMicrochip] = useState(puppy.microchipNumber || '');
  const [insurance, setInsurance] = useState(puppy.insuranceProvider || '');
  const [insurancePolicy, setInsurancePolicy] = useState(puppy.insurancePolicyNumber || '');

  // Synchronize state when switching puppy
  const lastPuppyIdRef = React.useRef(puppy.id);
  useEffect(() => {
    if (lastPuppyIdRef.current !== puppy.id) {
      lastPuppyIdRef.current = puppy.id;
      const slugVal = puppy.slug || generateDefaultSlug(puppy.name);
      setActiveSlug(slugVal);
      setSlugInput(slugVal);
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
      setVetName(puppy.vetName || '');
      setMicrochip(puppy.microchipNumber || '');
      setInsurance(puppy.insuranceProvider || '');
      setInsurancePolicy(puppy.insurancePolicyNumber || '');
      setIsLost(puppy.isLost ?? false);
      setRewardAmount(puppy.rewardAmount || '');
      setEmergencyNotes(puppy.emergencyNotes || '');
      setOwnerPhone(puppy.ownerPhone || '');
      setOwnerEmail(puppy.ownerEmail || '');

      if (puppy.communicationLinks && puppy.communicationLinks.length > 0) {
        setCommunicationLinks(puppy.communicationLinks);
      }
      const localPass = typeof window !== 'undefined' 
        ? localStorage.getItem(`puplume_smart_tag_pass_${puppy.id}`) === 'true' 
        : false;
      setHasSmartTagPass(Boolean(puppy.hasSmartTagPass || localPass));
    }
  }, [puppy]);

  // Age calculations
  const bDate = new Date(puppy.birthDate);
  const ageWeeks = Math.max(1, Math.floor((Date.now() - bDate.getTime()) / (1000 * 60 * 60 * 24 * 7)));
  const ageDisplay = ageWeeks >= 52 
    ? `${(ageWeeks / 52).toFixed(1)} yrs old` 
    : `${ageWeeks} weeks old`;

  // Passport serial number for editorial aesthetics
  const passportSerial = useMemo(() => {
    const hash = (puppy.id || puppy.name).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return `#PL-${(10000 + (hash % 90000))}`;
  }, [puppy.id, puppy.name]);

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
      slug: activeSlug,
    };
    storage.savePuppy(updated);
    onUpdatePuppy(updated);
    setIsPaywallOpen(false);

    unlockSmartTagPassMutation({
      identifier: puppy.name,
      puppyId: puppy.id,
      userId: user?.id,
    }).catch((err) => {
      console.debug('[PuppyProfileView] Convex smart tag unlock sync error:', err);
    });
  };

  const handleToggleLostMode = async (nextLost: boolean) => {
    setIsLost(nextLost);
    const validLinks = communicationLinks.filter((l) => l.value.trim() !== '');
    const waLink = communicationLinks.find((l) => l.platform === 'whatsapp')?.value;
    const igLink = communicationLinks.find((l) => l.platform === 'instagram')?.value;
    const fbLink = communicationLinks.find((l) => l.platform === 'facebook' || l.platform === 'messenger')?.value;
    const tgLink = communicationLinks.find((l) => l.platform === 'telegram')?.value;
    const slackLink = communicationLinks.find((l) => l.platform === 'slack')?.value;

    const updated: PuppyProfile = {
      ...puppy,
      slug: activeSlug,
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
    try {
      await syncPuppyToConvex(updated);
      await triggerMarketingSiteInstantUpdate(activeSlug);
      onUpdatePuppy(
        updated,
        nextLost 
          ? `🚨 Missing alert published in database & live tag!` 
          : `✓ Safe mode restored in database!`
      );
    } catch (_) {
      onUpdatePuppy(updated);
    }
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
      slug: activeSlug,
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
  };

  const currentTagPuppy: PuppyProfile = React.useMemo(() => ({
    ...puppy,
    slug: activeSlug,
    ownerPhone: ownerPhone.trim() || puppy.ownerPhone || '',
    emergencyNotes: emergencyNotes.trim() || puppy.emergencyNotes || '',
    rewardAmount: rewardAmount.trim() || puppy.rewardAmount,
    isLost,
    communicationLinks: communicationLinks.filter((l) => l.value.trim() !== ''),
  }), [puppy, activeSlug, ownerPhone, emergencyNotes, rewardAmount, isLost, communicationLinks]);

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

  const handleShareEmergencyAlert = async () => {
    nativeBridge.haptics.warning();
    setShareModalConfig({ isEmergency: true, title: `🚨 Missing Puppy Alert: ${puppy.name}` });
    setIsShareModalOpen(true);
  };

  // Pre-save check for custom slug: prompt warning if user printed collar tag
  const handleInitiateSlugSave = () => {
    setSlugErrorMessage(null);
    if (!slugValidation.isValid) {
      const firstError = Object.values(slugValidation.errors)[0];
      setSlugErrorMessage(firstError || 'Please fix the errors before updating.');
      return;
    }

    if (availabilityQuery && !availabilityQuery.available) {
      setSlugErrorMessage(availabilityQuery.reason || 'This custom URL is unavailable.');
      return;
    }

    // Always ask the user with a short message if they printed the QR collar tag
    setIsConfirmingSlugChange(true);
  };

  // Confirmed slug migration execution
  const handleConfirmSlugChange = async () => {
    setIsSavingSlug(true);
    setSlugErrorMessage(null);
    const targetSlug = slugValidation.cleanedSlug;

    try {
      // 1. Database update in Convex
      if (puppy.id && !puppy.id.startsWith('pup-')) {
        await updatePuppySlugMutation({
          puppyId: puppy.id as any,
          slug: targetSlug,
        });
      }

      // 2. Update local state and persistent storage
      setActiveSlug(targetSlug);
      const updated: PuppyProfile = {
        ...puppy,
        slug: targetSlug,
      };
      storage.savePuppy(updated);
      await triggerMarketingSiteInstantUpdate(targetSlug);
      onUpdatePuppy(updated, `🐾 Custom URL puplume.com/${targetSlug} saved in database!`);

      // 3. Close dialogs & show success
      setIsConfirmingSlugChange(false);
      setIsSlugEditorOpen(false);
      setSlugSuccessMessage(`URL updated to puplume.com/${targetSlug}! QR code regenerated.`);
      setTimeout(() => setSlugSuccessMessage(null), 4000);
      nativeBridge.haptics.success();
    } catch (err: any) {
      console.error('Failed to update puppy slug:', err);
      setSlugErrorMessage(err?.message || 'Failed to update custom URL. Please try again.');
      setIsConfirmingSlugChange(false);
    } finally {
      setIsSavingSlug(false);
    }
  };

  const handleSaveEmergencyContact = async () => {
    const newErrors: { phone?: string; notes?: string; reward?: string } = {};

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

    const effectiveNotes = emergencyNotes.trim();
    const notesRes = validateFinderInstructions(effectiveNotes);
    if (!effectiveNotes) {
      newErrors.notes = 'Instructions for Finder are required so people finding your puppy know how to handle them.';
    } else if (!notesRes.isValid) {
      newErrors.notes = notesRes.error;
    }

    const rewardRes = validateRewardAmount(rewardAmount);
    if (!rewardRes.isValid) {
      newErrors.reward = rewardRes.error;
    }

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
    setIsSavingContact(true);
    setSaveSuccess(false);
    setSaveSuccessMessage(null);

    try {
      const validLinks = [...communicationLinks.filter((l) => l.value.trim() !== '')];
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
        slug: activeSlug,
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

      // 1. Save locally
      storage.savePuppy(updated);

      // 2. Real Convex backend database sync
      await syncPuppyToConvex(updated);

      // 3. Instant revalidation & push to marketing site URL path
      await triggerMarketingSiteInstantUpdate(activeSlug);

      // 4. Update UI with verified real message
      setSaveSuccess(true);
      setSaveSuccessMessage("✓ Database updated successfully — changes are live on public passport!");
      onUpdatePuppy(updated, `🐾 ${updated.name}'s contact details updated in database!`);
      nativeBridge.haptics.success();
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      console.error('Failed to save emergency contacts to database:', err);
      setContactError(err?.message || 'Failed to update database. Changes cached locally.');
      nativeBridge.haptics.error();
    } finally {
      setIsSavingContact(false);
    }
  };

  const handlePhotoUploaded = async (newUrl: string) => {
    setPhotoUrl(newUrl);
    const updated: PuppyProfile = {
      ...puppy,
      photoUrl: newUrl,
      slug: activeSlug,
    };
    storage.savePuppy(updated);
    try {
      await syncPuppyToConvex(updated);
      await triggerMarketingSiteInstantUpdate(activeSlug);
      onUpdatePuppy(updated, `🐾 ${updated.name}'s photo updated in database!`);
    } catch (_) {
      onUpdatePuppy(updated);
    }
  };

  const handleSaveFullProfile = async (e: React.FormEvent) => {
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

    setIsSavingFullProfile(true);
    try {
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
        vetName,
        microchipNumber: microchip,
        insuranceProvider: insurance,
        insurancePolicyNumber: insurancePolicy,
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
        slug: activeSlug,
      };
      storage.savePuppy(updated);
      await syncPuppyToConvex(updated);
      await triggerMarketingSiteInstantUpdate(activeSlug);
      onUpdatePuppy(updated, `🐾 ${updated.name}'s profile updated in database!`);
      setIsEditOpen(false);
      nativeBridge.haptics.success();
    } catch (err: any) {
      console.error('Failed to save profile to database:', err);
      alert(`Error saving to database: ${err?.message || 'Please try again.'}`);
    } finally {
      setIsSavingFullProfile(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-28 px-2 sm:px-4">

      {/* Global Success / Notice Banners */}
      {slugSuccessMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-xs sm:text-sm text-emerald-900 font-bold flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{slugSuccessMessage}</span>
          </div>
          <button
            onClick={() => setSlugSuccessMessage(null)}
            className="text-emerald-700 hover:text-emerald-950 font-bold text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* SECTION 1: VERIFIED PET PASSPORT HERO CARD */}
      <div className="bg-[#FFFDF9] rounded-3xl border-2 border-[#E8DDD3] p-6 sm:p-8 shadow-[0_8px_30px_rgba(44,33,27,0.06)] relative overflow-hidden">
        
        {/* Subtle decorative background watermarks */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-[#F3E7DA]/50 to-transparent rounded-bl-full pointer-events-none -mr-16 -mt-16" />
        <div className="absolute top-4 right-6 text-right hidden sm:block">
          <span className="text-[11px] font-mono tracking-widest text-[#8B5E3C] font-bold uppercase block">
            PupLume Official Passport
          </span>
          <span className="text-xs font-mono text-[#766A63] font-semibold">
            {passportSerial}
          </span>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6 lg:gap-8">
          
          {/* Avatar with Emerald Verified Seal and Instant Uploader */}
          <div className="relative group shrink-0">
            <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-[36px] overflow-hidden border-4 border-[#8B5E3C] shadow-lg bg-[#FAF6F0]">
              <img
                src={photoUrl || puppy.photoUrl}
                alt={puppy.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              {/* Lost Mode Glow ring */}
              {isLost && (
                <div className="absolute inset-0 border-4 border-rose-500 animate-pulse pointer-events-none" />
              )}
              {/* Professional Centered Uploading Overlay */}
              {isUploadingPhoto && (
                <div className="absolute inset-0 bg-[#2C211B]/70 backdrop-blur-xs rounded-[32px] flex flex-col items-center justify-center text-white gap-2 p-3 text-center z-20 animate-in fade-in duration-150">
                  <Loader2 className="w-7 h-7 animate-spin text-[#F3E7DA]" />
                  <span className="text-xs font-bold text-white tracking-wide">Optimizing photo...</span>
                </div>
              )}
            </div>

            {/* Emerald Verified Seal */}
            <div 
              className="absolute -top-2 -left-2 bg-[#059669] text-white p-1.5 rounded-2xl shadow-md border-2 border-white flex items-center gap-1 z-10"
              title="Verified Digital Pet Passport"
            >
              <ShieldCheck className="w-4 h-4" />
            </div>

            {/* Upload Button Trigger */}
            <div className="absolute -bottom-2 -right-2 z-10">
              <CloudinaryImageUploader
                currentImageUrl={photoUrl || puppy.photoUrl}
                onUploadSuccess={handlePhotoUploaded}
                onUploadingChange={setIsUploadingPhoto}
                folder="puplume/puppies"
                label="Photo"
                variant="button"
              />
            </div>
          </div>

          {/* Hero Details & Primary Identity */}
          <div className="flex-1 text-center md:text-left space-y-3 w-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
                  <h1 className="text-3xl sm:text-4xl font-black text-[#2C211B] tracking-tight font-brand">
                    {puppy.name}
                  </h1>
                  <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${
                    puppy.sex === 'male' 
                      ? 'bg-blue-50 text-blue-800 border-blue-200' 
                      : 'bg-rose-50 text-rose-800 border-rose-200'
                  }`}>
                    {puppy.sex === 'male' ? '♂ Boy' : '♀ Girl'}
                  </span>
                  {isLost && (
                    <span className="px-3 py-1 bg-rose-600 text-white text-xs font-black rounded-full uppercase tracking-wider animate-pulse shadow-sm flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> Missing
                    </span>
                  )}
                </div>

                <p className="text-sm sm:text-base text-[#766A63] font-medium mt-1">
                  {puppy.breed} • <span className="text-[#8B5E3C] font-semibold">{ageDisplay}</span> • {puppy.weightLbs} lbs
                </p>
              </div>

              {/* Action Buttons: Share Passport & Edit Profile */}
              <div className="flex flex-wrap items-center justify-center md:justify-end gap-2 pt-1 sm:pt-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSharePassport}
                  leftIcon={<Share2 className="w-4 h-4 text-[#8B5E3C]" />}
                  className="bg-white text-xs font-bold rounded-xl shadow-2xs hover:bg-[#FAF6F0]"
                >
                  Share Passport
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditOpen(true)}
                  leftIcon={<Edit3 className="w-4 h-4 text-[#8B5E3C]" />}
                  className="bg-white text-xs font-bold rounded-xl shadow-2xs hover:bg-[#FAF6F0]"
                >
                  Edit Profile
                </Button>
              </div>
            </div>

            {/* Quick Pet Dossier Highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 w-full text-xs">
              <div className="bg-[#FFF9F2] border border-[#E8DDD3] rounded-xl px-3 py-2 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#8B5E3C] shrink-0" />
                <div className="min-w-0">
                  <span className="text-[10px] text-[#766A63] font-bold uppercase tracking-wider block">Born</span>
                  <span className="text-xs font-bold text-[#2C211B] truncate block">{puppy.birthDate || 'Not set'}</span>
                </div>
              </div>

              <div className="bg-[#FFF9F2] border border-[#E8DDD3] rounded-xl px-3 py-2 flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-500 shrink-0" />
                <div className="min-w-0">
                  <span className="text-[10px] text-[#766A63] font-bold uppercase tracking-wider block">Treat</span>
                  <span className="text-xs font-bold text-[#2C211B] truncate block">{puppy.favoriteTreat || 'None set'}</span>
                </div>
              </div>

              <div className="bg-[#FFF9F2] border border-[#E8DDD3] rounded-xl px-3 py-2 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <div className="min-w-0">
                  <span className="text-[10px] text-[#766A63] font-bold uppercase tracking-wider block">Microchip</span>
                  <span className="text-xs font-bold text-[#2C211B] font-mono truncate block">{puppy.microchipNumber || 'Pending'}</span>
                </div>
              </div>

              <div className="bg-[#FFF9F2] border border-[#E8DDD3] rounded-xl px-3 py-2 flex items-center gap-2">
                <QrCode className="w-4 h-4 text-[#8B5E3C] shrink-0" />
                <div className="min-w-0">
                  <span className="text-[10px] text-[#766A63] font-bold uppercase tracking-wider block">Smart Tag</span>
                  <span className="text-xs font-bold text-[#2C211B] flex items-center gap-1">
                    <span className={`w-2 h-2 rounded-full ${hasSmartTagPass ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                    {hasSmartTagPass ? 'Active' : 'Standard'}
                  </span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* SECTION NAV: SLEEK SEGMENTED CONTROL TABS */}
      <div className="bg-[#F5EDE4] p-1.5 rounded-2xl border border-[#E8DDD3] shadow-2xs flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => {
            nativeBridge.haptics.light();
            setActiveTab('passport');
          }}
          className={`flex-1 py-2 sm:py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'passport'
              ? 'bg-white text-[#2C211B] shadow-xs border border-[#E8DDD3]'
              : 'text-[#766A63] hover:text-[#2C211B]'
          }`}
        >
          <Dog className="w-4 h-4 text-[#8B5E3C]" />
          <span>Passport &amp; Care</span>
        </button>

        <button
          type="button"
          onClick={() => {
            nativeBridge.haptics.light();
            setActiveTab('collar');
          }}
          className={`flex-1 py-2 sm:py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'collar'
              ? 'bg-white text-[#2C211B] shadow-xs border border-[#E8DDD3]'
              : 'text-[#766A63] hover:text-[#2C211B]'
          }`}
        >
          <QrCode className="w-4 h-4 text-[#8B5E3C]" />
          <span>Smart Tag &amp; QR</span>
        </button>

        <button
          type="button"
          onClick={() => {
            nativeBridge.haptics.light();
            setActiveTab('safety');
          }}
          className={`flex-1 py-2 sm:py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'safety'
              ? 'bg-white text-[#2C211B] shadow-xs border border-[#E8DDD3]'
              : 'text-[#766A63] hover:text-[#2C211B]'
          }`}
        >
          <AlertTriangle className={`w-4 h-4 ${isLost ? 'text-rose-600 animate-pulse' : 'text-[#8B5E3C]'}`} />
          <span>Safety &amp; Contacts</span>
          {isLost && (
            <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping shrink-0" />
          )}
        </button>
      </div>

      {/* TAB 1: VERIFIED PET PASSPORT & CARE DOSSIER */}
      {activeTab === 'passport' && (
        <div className="bg-[#FFFDF9] rounded-3xl border border-[#E8DDD3] p-5 sm:p-7 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8DDD3] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Dog className="w-5 h-5 text-[#8B5E3C]" />
                <h3 className="text-base sm:text-lg font-black text-[#2C211B] font-brand">
                  Verified Pet Dossier &amp; Care Details
                </h3>
              </div>
              <p className="text-xs text-[#766A63] mt-0.5">
                Essential identity, health formula, temperament, and attending vet records.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditOpen(true)}
              leftIcon={<Edit3 className="w-3.5 h-3.5 text-[#8B5E3C]" />}
              className="text-xs font-bold bg-white rounded-xl shadow-2xs hover:bg-[#FAF6F0] self-start sm:self-auto"
            >
              Edit Details
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Temperament & Personality */}
            <div className="bg-[#FAF6F0] rounded-2xl p-4 sm:p-5 border border-[#E8DDD3] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-[#8B5E3C] flex items-center gap-1.5">
                  <Smile className="w-4 h-4" /> Temperament &amp; Traits
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#2C211B] leading-relaxed">
                {puppy.temperament ? (
                  <span className="italic font-medium">&ldquo;{puppy.temperament}&rdquo;</span>
                ) : (
                  <span className="text-[#766A63] italic">No temperament notes recorded. Tap &quot;Edit Details&quot; to describe personality.</span>
                )}
              </p>
            </div>

            {/* Nutrition & Diet Formula */}
            <div className="bg-[#FAF6F0] rounded-2xl p-4 sm:p-5 border border-[#E8DDD3] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-[#8B5E3C] flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-rose-500" /> Nutrition &amp; Diet Formula
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#2C211B] leading-relaxed">
                {puppy.dietaryRestrictions || (
                  <span className="text-[#766A63] italic">No dietary restrictions or food formula recorded.</span>
                )}
              </p>
              {puppy.favoriteTreat && (
                <p className="text-xs text-[#5F3E29] font-medium pt-2 border-t border-[#E8DDD3]/60 flex items-center gap-1.5">
                  <span>🍖 Favorite Reward:</span>
                  <strong className="text-[#2C211B]">{puppy.favoriteTreat}</strong>
                </p>
              )}
            </div>

            {/* Primary Veterinary Clinic */}
            <div className="bg-[#FAF6F0] rounded-2xl p-4 sm:p-5 border border-[#E8DDD3] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-[#8B5E3C] flex items-center gap-1.5">
                  <Stethoscope className="w-4 h-4 text-[#8B5E3C]" /> Primary Veterinary Clinic
                </span>
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </div>
              {puppy.vetClinic || puppy.vetPhone || puppy.vetName ? (
                <div className="space-y-1.5 text-xs">
                  <h4 className="font-bold text-[#2C211B]">{puppy.vetClinic || 'Clinic not specified'}</h4>
                  {puppy.vetName && <p className="text-[#5F3E29]">Attending Vet: {puppy.vetName}</p>}
                  {puppy.vetPhone && (
                    <a
                      href={`tel:${puppy.vetPhone}`}
                      className="text-xs font-bold text-[#8B5E3C] hover:underline flex items-center gap-1 pt-1"
                    >
                      <Phone className="w-3.5 h-3.5" /> Call Clinic: {puppy.vetPhone}
                    </a>
                  )}
                </div>
              ) : (
                <p className="text-xs text-[#766A63] italic">No veterinary clinic added yet.</p>
              )}
            </div>

            {/* Official Identification & Policy */}
            <div className="bg-[#FAF6F0] rounded-2xl p-4 sm:p-5 border border-[#E8DDD3] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-[#8B5E3C] flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-500" /> Official Identification &amp; Policy
                </span>
              </div>
              <div className="space-y-2 text-xs text-[#2C211B]">
                <div className="flex items-center justify-between">
                  <span className="text-[#766A63]">Microchip RFID:</span>
                  <strong className="font-mono">{puppy.microchipNumber || 'Not recorded'}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#766A63]">Insurance Provider:</span>
                  <strong>{puppy.insuranceProvider || 'Not recorded'}</strong>
                </div>
                {puppy.insurancePolicyNumber && (
                  <div className="flex items-center justify-between">
                    <span className="text-[#766A63]">Policy Number:</span>
                    <strong className="font-mono">{puppy.insurancePolicyNumber}</strong>
                  </div>
                )}
                <div className="flex items-center justify-between pt-1.5 border-t border-[#E8DDD3]/60">
                  <span className="text-[#766A63]">Passport Serial:</span>
                  <strong className="font-mono text-[#8B5E3C]">{passportSerial}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SMART TAG & CUSTOM QR HUB */}
      {activeTab === 'collar' && (
        <div className="space-y-5">
          {/* Custom URL Management Bar */}
          <div className="bg-[#FFFDF9] rounded-3xl border border-[#E8DDD3] p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between gap-3 border-b border-[#E8DDD3] pb-4">
              <div className="flex items-center gap-3 min-w-0">
                <SmartCollarTagLogo variant="icon" size="sm" />
                <div className="min-w-0">
                  <h3 className="text-base sm:text-lg font-black text-[#2C211B] font-brand leading-tight">
                    Custom Puppy URL
                  </h3>
                  <p className="text-xs text-[#766A63] mt-0.5 truncate">
                    Customize {puppy.name}&apos;s public webpage link.
                  </p>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-2">
                {hasSmartTagPass ? (
                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 text-[10px] font-black rounded-full uppercase tracking-wider border border-emerald-200 shadow-2xs whitespace-nowrap">
                    ✓ Live Verified
                  </span>
                ) : (
                  <span className="px-2.5 py-1 bg-amber-50 text-amber-800 text-[10px] font-black rounded-full uppercase tracking-wider border border-amber-200 shadow-2xs whitespace-nowrap">
                    $1.99 Pass
                  </span>
                )}
                {!hasSmartTagPass && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setIsPaywallOpen(true)}
                    leftIcon={<Zap className="w-3.5 h-3.5 text-amber-300" />}
                    className="shadow-2xs font-bold text-xs"
                  >
                    Unlock Tag
                  </Button>
                )}
              </div>
            </div>

            {/* URL Display and Action Bar */}
            <div className="bg-[#FFF9F2] rounded-2xl border border-[#E8DDD3] p-3.5 sm:p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#8B5E3C] flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5" /> Primary Puppy Page URL
                </span>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-md shrink-0">
                  Active
                </span>
              </div>

              {/* Responsive URL Pill (Contained, never overflows out of box) */}
              <div className="bg-white px-3 py-2 rounded-xl border border-[#E8DDD3] shadow-2xs flex items-center min-w-0 overflow-hidden">
                <span className="text-xs sm:text-sm font-black font-mono text-[#2C211B] truncate select-all">
                  {displayUrl}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-0.5">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="flex-1 sm:flex-none px-3 py-1.5 bg-white hover:bg-[#F3E7DA] text-[#2C211B] text-xs font-bold rounded-xl border border-[#E8DDD3] transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-[#8B5E3C]" />}
                  <span>{copiedUrl ? 'Copied!' : 'Copy Link'}</span>
                </button>

                <a
                  href={publicUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 sm:flex-none px-3 py-1.5 bg-white hover:bg-[#FAF6F0] text-[#8B5E3C] text-xs font-bold rounded-xl border border-[#8B5E3C]/30 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Visit Page</span>
                </a>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setSlugInput(activeSlug);
                    setSlugErrorMessage(null);
                    setIsSlugEditorOpen(!isSlugEditorOpen);
                  }}
                  leftIcon={<Edit3 className="w-3.5 h-3.5" />}
                  className="w-full sm:w-auto text-xs font-bold"
                >
                  {isSlugEditorOpen ? 'Close Editor' : 'Customize URL'}
                </Button>
              </div>
            </div>

            {/* Expandable Inline Slug Editor */}
            {isSlugEditorOpen && (
              <div className="p-4 sm:p-5 bg-white rounded-2xl border-2 border-[#8B5E3C]/30 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                <div>
                  <label className="block text-xs font-bold text-[#2C211B] uppercase tracking-wider mb-1">
                    Edit URL Slug for {puppy.name}
                  </label>
                  <p className="text-xs text-[#766A63] mb-3">
                    Choose a short, unique handle. The slug must be <strong>3 to 7 characters</strong> and contain your puppy&apos;s name.
                  </p>

                  <div className="flex items-center rounded-xl border-2 border-[#8B5E3C]/30 focus-within:border-[#8B5E3C] bg-[#FFF9F2] overflow-hidden shadow-2xs">
                    <span className="px-3.5 py-2.5 text-xs sm:text-sm font-bold text-[#766A63] bg-[#F3E7DA] select-none border-r border-[#E8DDD3]">
                      puplume.com/
                    </span>
                    <input
                      type="text"
                      maxLength={7}
                      value={slugInput}
                      onChange={(e) => {
                        const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
                        setSlugInput(val);
                        setSlugErrorMessage(null);
                      }}
                      placeholder={generateDefaultSlug(puppy.name)}
                      className="flex-1 px-3 py-2.5 text-sm sm:text-base font-black font-mono text-[#2C211B] bg-transparent focus:outline-none"
                    />
                    <span className="px-3 text-xs font-mono font-bold text-[#766A63]">
                      {slugInput.length}/7
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-1">
                  <div className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
                    slugValidation.checks.length 
                      ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900' 
                      : 'bg-amber-50/80 border-amber-200 text-amber-900'
                  }`}>
                    {slugValidation.checks.length ? (
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <span className="w-4 h-4 rounded-full border border-amber-500 text-[10px] flex items-center justify-center text-amber-700 shrink-0">!</span>
                    )}
                    <span>3 to 7 characters</span>
                  </div>

                  <div className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
                    slugValidation.checks.containsName 
                      ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900' 
                      : 'bg-amber-50/80 border-amber-200 text-amber-900'
                  }`}>
                    {slugValidation.checks.containsName ? (
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <span className="w-4 h-4 rounded-full border border-amber-500 text-[10px] flex items-center justify-center text-amber-700 shrink-0">!</span>
                    )}
                    <span className="truncate">Includes &quot;{puppy.name.toLowerCase()}&quot;</span>
                  </div>

                  <div className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
                    slugValidation.checks.characters 
                      ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900' 
                      : 'bg-amber-50/80 border-amber-200 text-amber-900'
                  }`}>
                    {slugValidation.checks.characters ? (
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <span className="w-4 h-4 rounded-full border border-amber-500 text-[10px] flex items-center justify-center text-amber-700 shrink-0">!</span>
                    )}
                    <span>URL-safe (a-z, 0-9)</span>
                  </div>

                  <div className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
                    availabilityQuery === undefined 
                      ? 'bg-neutral-50 border-neutral-200 text-neutral-600' 
                      : availabilityQuery.available
                        ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                        : 'bg-rose-50/80 border-rose-200 text-rose-900'
                  }`}>
                    {availabilityQuery === undefined ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-neutral-500 shrink-0" />
                    ) : availabilityQuery.available ? (
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    )}
                    <span>
                      {availabilityQuery === undefined 
                        ? 'Checking...' 
                        : availabilityQuery.available 
                          ? 'Available' 
                          : 'Already Taken'}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-[#FAF6F0] rounded-xl border border-[#E8DDD3] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className="text-[#766A63] font-medium shrink-0">Live URL Preview:</span>
                    <span className="font-mono font-bold text-[#8B5E3C] truncate">
                      {getPuppyDisplayUrl(slugInput)}
                    </span>
                  </div>
                  {cleanCandidateSlug === activeSlug && (
                    <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider shrink-0">
                      Current URL
                    </span>
                  )}
                </div>

                {slugErrorMessage && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-semibold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{slugErrorMessage}</span>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSlugInput(activeSlug);
                      setIsSlugEditorOpen(false);
                      setSlugErrorMessage(null);
                    }}
                    className="text-xs"
                  >
                    Cancel
                  </Button>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleInitiateSlugSave}
                    disabled={
                      !slugValidation.isValid || 
                      (availabilityQuery !== undefined && !availabilityQuery.available) ||
                      cleanCandidateSlug === activeSlug
                    }
                    leftIcon={<Check className="w-3.5 h-3.5" />}
                    className="text-xs font-bold"
                  >
                    Save &amp; Migrate URL
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* QR Code and Search Indexing 2-Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
            {/* Physical QR Collar Badge */}
            <div className="md:col-span-5 bg-[#FFFDF9] rounded-3xl border border-[#E8DDD3] p-5 flex flex-col items-center text-center space-y-4 shadow-xs">
              <div className="space-y-1">
                <span className="text-[11px] font-black uppercase tracking-wider text-[#8B5E3C] block">
                  Physical Collar Tag QR Code
                </span>
                <p className="text-xs text-[#766A63]">
                  Smartphone camera scan to open {puppy.name}&apos;s verified card
                </p>
              </div>

              <PupLumeQRCode
                value={publicUrl}
                puppyName={puppy.name}
                size={180}
                showActions={true}
              />

              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenPrintCollarTag}
                leftIcon={<Printer className="w-4 h-4 text-[#8B5E3C]" />}
                className="w-full bg-white text-xs font-bold rounded-xl shadow-2xs hover:bg-[#FFF9F2]"
              >
                Print Collar Tag (1.5&quot;)
              </Button>
            </div>

            {/* Search Engine Indexing & SEO Setting */}
            <div className="md:col-span-7 bg-[#FFFDF9] rounded-3xl border border-[#E8DDD3] p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-[#FFF9F2] border border-[#E8DDD3] flex items-center justify-center text-[#8B5E3C] shadow-2xs shrink-0">
                    <Globe className="w-4 h-4 text-[#8B5E3C]" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs sm:text-sm font-black text-[#2C211B] font-brand">
                        Search Engine Indexing
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowIndexingInfo((prev) => !prev)}
                        className="p-1 rounded-full text-[#766A63] hover:text-[#2C211B] hover:bg-[#E8DDD3]/60 transition-colors cursor-pointer"
                        title="What does search engine indexing mean? Tap to learn more."
                        aria-label="Search engine indexing info"
                      >
                        <HelpCircle className="w-3.5 h-3.5 text-[#8B5E3C]" />
                      </button>
                      {allowIndexing ? (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-full uppercase tracking-wider border border-emerald-200">
                          ✓ Indexed
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-neutral-200 text-neutral-700 text-[10px] font-black rounded-full uppercase tracking-wider border border-neutral-300">
                          Unlisted (noindex)
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#766A63] truncate">
                      {allowIndexing ? 'Crawlable on Google & Bing with Schema.org SEO' : 'Direct link & QR collar tag only'}
                    </p>
                  </div>
                </div>

                {/* Compact Toggle Switch */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleToggleIndexing(!allowIndexing)}
                    disabled={isUpdatingIndexing}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      allowIndexing ? 'bg-emerald-600' : 'bg-neutral-300'
                    }`}
                    role="switch"
                    aria-checked={allowIndexing}
                    title={allowIndexing ? 'Click to disable search engine indexing' : 'Click to enable search engine indexing'}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        allowIndexing ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {indexingSuccessMessage && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 font-semibold flex items-center gap-2 animate-in fade-in duration-150">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{indexingSuccessMessage}</span>
                </div>
              )}

              {/* Expandable Explanation */}
              {showIndexingInfo && (
                <div className="pt-3 border-t border-[#E8DDD3] space-y-2.5 text-xs animate-in fade-in duration-150">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="p-3 bg-[#FAF6F0] rounded-xl border border-emerald-200">
                      <div className="font-bold text-emerald-800 flex items-center gap-1.5 mb-1 text-[11px]">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>When Indexing is Enabled</span>
                      </div>
                      <p className="text-[#5F3E29] leading-relaxed text-[11px]">
                        Search engines (Google, Bing) crawl this page, making it searchable by puppy name or microchip ID if they wander away. We inject 100% compliant Schema.org JSON-LD data.
                      </p>
                    </div>

                    <div className="p-3 bg-[#FAF6F0] rounded-xl border border-neutral-300">
                      <div className="font-bold text-neutral-800 flex items-center gap-1.5 mb-1 text-[11px]">
                        <ShieldCheck className="w-3.5 h-3.5 text-neutral-600 shrink-0" />
                        <span>When Indexing is Disabled (Unlisted)</span>
                      </div>
                      <p className="text-[#5F3E29] leading-relaxed text-[11px]">
                        We instruct search engines not to index this page (noindex, nofollow). Only people with the direct URL or physical collar tag scan can access it.
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setShowIndexingInfo(false)}
                      className="text-[11px] font-bold text-[#8B5E3C] hover:underline cursor-pointer"
                    >
                      Close Explanation
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SAFETY, LOST MODE & EMERGENCY CONTACTS */}
      {activeTab === 'safety' && (
        <div className="space-y-5">
          {/* Emergency Lost Mode Card */}
          <div className={`rounded-3xl p-5 sm:p-6 border-2 transition-all ${
            isLost 
              ? 'bg-rose-50 border-rose-400 shadow-sm' 
              : 'bg-[#FFFDF9] border-[#E8DDD3] shadow-xs'
          }`}>
            <div className="flex items-center justify-between gap-3 mb-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className={`w-5 h-5 ${isLost ? 'text-rose-600' : 'text-[#8B5E3C]'}`} />
                <h3 className={`text-sm sm:text-base font-black uppercase tracking-wider ${isLost ? 'text-rose-900' : 'text-[#2C211B]'}`}>
                  Emergency Lost Mode
                </h3>
              </div>

              {/* Toggle switch */}
              <button
                type="button"
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
                "Turn on Lost Mode if your puppy wanders away. This immediately adds a prominent Missing Alert and reward banner to their public safety webpage."
              )}
            </p>

            {/* Quick Actions */}
            <div className="mt-4 pt-3 border-t border-neutral-200/80 flex flex-wrap items-center gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={handleOpenFlyer}
                leftIcon={<FileText className="w-4 h-4 text-amber-300" />}
                className={`text-xs font-bold ${
                  isLost ? 'bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-600/20' : ''
                }`}
              >
                🚨 Printable Missing Flyer
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleShareEmergencyAlert}
                leftIcon={<Share2 className="w-4 h-4 text-rose-600" />}
                className="text-xs font-bold border-rose-300 text-rose-700 hover:bg-rose-50"
              >
                Broadcast Missing Alert
              </Button>
            </div>
          </div>

          {/* Emergency Contacts on Tag */}
          <div className="bg-[#FFFDF9] rounded-3xl border border-[#E8DDD3] p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#E8DDD3] pb-3">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#8B5E3C]" />
                <h4 className="text-sm font-black uppercase tracking-wider text-[#2C211B]">
                  Emergency Contacts on Tag
                </h4>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                Visible to Finders
              </span>
            </div>

            {contactError && (
              <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                <span>{contactError}</span>
              </div>
            )}

            {saveSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center gap-2 animate-in fade-in duration-150">
                <Check className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{saveSuccessMessage || 'Tag details and contact information updated in database!'}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Owner Phone */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-bold text-[#5F3E29]">
                    Owner Phone <span className="text-amber-800 text-[10px] font-bold bg-amber-100 px-1.5 py-0.5 rounded ml-1">Required</span>
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
              </div>

              {/* Reward Setting */}
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

            {/* Instructions for Finder */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-bold text-[#5F3E29]">
                  Instructions for Finder <span className="text-amber-800 text-[10px] font-bold bg-amber-100 px-1.5 py-0.5 rounded ml-1">Required</span>
                </label>
                {notesValidation.isValid && emergencyNotes.trim() && (
                  <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                    <Check className="w-3 h-3 text-emerald-600" /> Valid
                  </span>
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
                placeholder="e.g. Friendly, loves peanut butter, do not chase"
                className={`w-full px-3 py-2 rounded-xl border ${
                  fieldErrors.notes ? 'border-amber-400 bg-amber-50/20' : 'border-[#E8DDD3] bg-white'
                } text-xs text-[#2C211B] focus:outline-none focus:border-[#8B5E3C] resize-none`}
              />
            </div>

            {/* Dynamic Communication Links */}
            <div className="pt-2 border-t border-[#E8DDD3]/80">
              <CommunicationLinksInput
                links={communicationLinks}
                onChange={(updatedLinks) => {
                  setCommunicationLinks(updatedLinks);
                }}
                maxRecommended={3}
              />
            </div>

            {/* Save Button */}
            <div className="pt-2 flex justify-end">
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleSaveEmergencyContact}
                disabled={isSavingContact}
                leftIcon={
                  isSavingContact ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )
                }
                className="text-xs font-bold"
              >
                {isSavingContact ? 'Saving to Database...' : 'Save Emergency Contacts'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: CONFIRMATION FOR SLUG CHANGE (WARNING ABOUT PRINTED QR COLLAR) */}
      <Modal
        isOpen={isConfirmingSlugChange}
        onClose={() => setIsConfirmingSlugChange(false)}
        title="Update Puppy URL & QR Code?"
      >
        <div className="space-y-4">
          <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl flex items-start gap-3">
            <BadgeAlert className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1.5 text-xs sm:text-sm text-amber-950">
              <p className="font-black text-amber-900">
                ⚠️ Have you already printed {puppy.name}&apos;s QR collar tag?
              </p>
              <p className="leading-relaxed">
                Changing your puppy&apos;s URL to <strong>puplume.com/{slugValidation.cleanedSlug}</strong> will update their QR code. Any previously printed tags or flyers will stop working and you will have to print them again.
              </p>
            </div>
          </div>

          <div className="bg-[#FAF6F0] rounded-xl p-3.5 border border-[#E8DDD3] space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-[#766A63]">Current URL:</span>
              <span className="font-mono line-through text-rose-700">{displayUrl}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#766A63]">New Primary URL:</span>
              <span className="font-mono font-bold text-emerald-800">puplume.com/{slugValidation.cleanedSlug}</span>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsConfirmingSlugChange(false)}
              className="flex-1 text-xs"
              disabled={isSavingSlug}
            >
              Keep Current URL
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleConfirmSlugChange}
              disabled={isSavingSlug}
              leftIcon={isSavingSlug ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              className="flex-1 text-xs font-bold"
            >
              {isSavingSlug ? 'Updating...' : 'Yes, Update URL & QR'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* MODAL 2: FULL EDIT PROFILE MODAL */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Puppy Profile">
        <form onSubmit={handleSaveFullProfile} className="space-y-4">
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
              sublabel="Upload a clear picture of your pet"
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
                  Owner Phone <span className="text-amber-800 text-[10px] font-bold bg-amber-100 px-1.5 py-0.5 rounded ml-1">Required</span>
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
                Instructions for Finder <span className="text-amber-800 text-[10px] font-bold bg-amber-100 px-1.5 py-0.5 rounded ml-1">Required</span>
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#2C211B] uppercase tracking-wider mb-1">
                Vet Clinic
              </label>
              <input
                type="text"
                value={vetClinic}
                onChange={(e) => setVetClinic(e.target.value)}
                placeholder="Central Animal Hospital"
                className="w-full px-3 py-2 rounded-xl border border-[#E8DDD3] bg-[#FFF9F2] text-xs focus:outline-none focus:border-[#8B5E3C]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#2C211B] uppercase tracking-wider mb-1">
                Vet Phone
              </label>
              <input
                type="text"
                value={vetPhone}
                onChange={(e) => setVetPhone(e.target.value)}
                placeholder="(555) 987-6543"
                className="w-full px-3 py-2 rounded-xl border border-[#E8DDD3] bg-[#FFF9F2] text-xs focus:outline-none focus:border-[#8B5E3C]"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSavingFullProfile}
              className="flex-1 font-bold"
              leftIcon={isSavingFullProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : undefined}
            >
              {isSavingFullProfile ? 'Saving to Database...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 3: PAYWALL MODAL ($1.99 MICRO-PASS) */}
      <SmartTagPaywallModal
        isOpen={isPaywallOpen}
        puppyName={puppy.name}
        puppyId={puppy.id}
        onClose={() => setIsPaywallOpen(false)}
        onUnlock={handleUnlockSmartTag}
      />

      {/* MODAL 4: 1-CLICK PRINTABLE LOST DOG FLYER */}
      <MissingPupFlyerModal
        isOpen={isFlyerOpen}
        puppy={currentTagPuppy}
        qrDataUrl={qrDataUrl}
        publicUrl={publicUrl}
        onClose={() => setIsFlyerOpen(false)}
      />

      {/* MODAL 5: PRINTABLE COLLAR TAG BADGE */}
      <PrintableCollarTagModal
        isOpen={isCollarTagPrintOpen}
        puppy={currentTagPuppy}
        qrDataUrl={qrDataUrl}
        publicUrl={publicUrl}
        onClose={() => setIsCollarTagPrintOpen(false)}
      />

      {/* MODAL 6: INSTAGRAM & NATIVE SHARE SHEET */}
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
