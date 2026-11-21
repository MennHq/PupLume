import React, { useState, useEffect, useMemo } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { useUser } from '@clerk/react';
import { api } from '../../convex/_generated/api';
import { PuppyProfile } from '../types';
import { storage, generateUniqueId } from '../lib/storage';
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
  Loader2,
  Plus,
  ChevronRight,
  Palette,
  Type,
  Layers,
  ArrowUp,
  ArrowDown,
  Trash2,
  Link as LinkIcon,
  ShoppingBag,
  BookOpen,
  Eye,
  EyeOff
} from 'lucide-react';
import { 
  PUP_PAGE_THEMES, 
  PUP_PAGE_FONTS, 
  AVAILABLE_PUP_THEMES,
  AVAILABLE_PUP_FONTS,
  DEFAULT_LINK_CATEGORIES 
} from '../lib/pupThemeEngine';
import { getFaviconCandidates, extractHostname } from '../lib/faviconExtractor';
import { PupLinkTreeCard } from '../components/common/PupLinkTreeCard';
import { PupCustomLink, PupPageTheme, PupPageFont } from '../types';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
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
  onSwitchPuppy?: (puppyId: string) => void;
  onOpenNewPuppyWizard?: () => void;
}

export const PuppyProfileView: React.FC<PuppyProfileViewProps> = ({ 
  puppy, 
  onUpdatePuppy,
  onSwitchPuppy,
  onOpenNewPuppyWizard
}) => {
  const { user } = useUser();
  // Convex mutations & queries
  const unlockSmartTagPassMutation = useMutation(api.puppies.unlockSmartTagPass);
  const updatePuppySlugMutation = useMutation(api.puppies.updatePuppySlug);
  const updateIndexingMutation = useMutation(api.puppies.updateSearchEngineIndexing);

  // Active view tab state
  const [activeTab, setActiveTab] = useState<'passport' | 'collar' | 'safety' | 'studio'>('passport');

  // Studio & Link Tree Customization State (PupLume Brand Standard)
  const [studioTheme, setStudioTheme] = useState<PupPageTheme>(() => puppy.pageTheme || 'puplume_classic');
  const [studioFont, setStudioFont] = useState<PupPageFont>(() => puppy.pageFont || 'grandstander');
  const [studioHeadline, setStudioHeadline] = useState<string>(() => puppy.pageHeadline || '');
  const [studioBio, setStudioBio] = useState<string>(() => puppy.pageBio || '');
  const [studioLinks, setStudioLinks] = useState<PupCustomLink[]>(() => {
    if (puppy.customLinks && puppy.customLinks.length > 0) {
      return puppy.customLinks;
    }
    return [
      {
        id: 'link-starter-ig',
        title: `${puppy.name}'s Instagram Adventure`,
        url: puppy.ownerInstagram ? `https://instagram.com/${puppy.ownerInstagram.replace('@', '')}` : 'https://instagram.com',
        subtitle: 'Photos, park runs & daily life',
        category: 'social',
        highlight: true,
        badgeText: 'Official'
      },
      {
        id: 'link-starter-gear',
        title: 'Favorite Chews & Gear',
        url: 'https://puplume.pet/gear',
        subtitle: 'The toys & treats I love most',
        category: 'gear',
        highlight: false,
        badgeText: 'Verified'
      }
    ];
  });

  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<PupCustomLink | null>(null);
  const [linkTitleInput, setLinkTitleInput] = useState('');
  const [linkUrlInput, setLinkUrlInput] = useState('');
  const [linkSubtitleInput, setLinkSubtitleInput] = useState('');
  const [linkCategoryInput, setLinkCategoryInput] = useState<'social' | 'gear' | 'service' | 'story' | 'custom'>('social');
  const [linkHighlightInput, setLinkHighlightInput] = useState(false);
  const [linkBadgeTextInput, setLinkBadgeTextInput] = useState('');
  const [isSavingStudio, setIsSavingStudio] = useState(false);
  const [studioSuccessMessage, setStudioSuccessMessage] = useState<string | null>(null);
  const [showLivePhoneMockup, setShowLivePhoneMockup] = useState(true);

  // Link CRUD Handlers
  const handleOpenAddLink = () => {
    setEditingLink(null);
    setLinkTitleInput('');
    setLinkUrlInput('');
    setLinkSubtitleInput('');
    setLinkCategoryInput('social');
    setLinkHighlightInput(false);
    setLinkBadgeTextInput('');
    setIsLinkModalOpen(true);
  };

  const handleOpenEditLink = (link: PupCustomLink) => {
    setEditingLink(link);
    setLinkTitleInput(link.title);
    setLinkUrlInput(link.url);
    setLinkSubtitleInput(link.subtitle || '');
    setLinkCategoryInput(link.category || 'social');
    setLinkHighlightInput(Boolean(link.highlight));
    setLinkBadgeTextInput(link.badgeText || '');
    setIsLinkModalOpen(true);
  };

  const handleSaveLink = () => {
    if (!linkTitleInput.trim() || !linkUrlInput.trim()) {
      alert('Please provide both a Title and a valid URL.');
      return;
    }

    let cleanUrl = linkUrlInput.trim();
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = `https://${cleanUrl}`;
    }

    if (editingLink) {
      setStudioLinks((prev) =>
        prev.map((l) =>
          l.id === editingLink.id
            ? {
                ...l,
                title: linkTitleInput.trim(),
                url: cleanUrl,
                subtitle: linkSubtitleInput.trim() || undefined,
                category: linkCategoryInput,
                highlight: linkHighlightInput,
                badgeText: linkBadgeTextInput.trim() || undefined,
              }
            : l
        )
      );
    } else {
      const newLink: PupCustomLink = {
        id: `link-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        title: linkTitleInput.trim(),
        url: cleanUrl,
        subtitle: linkSubtitleInput.trim() || undefined,
        category: linkCategoryInput,
        highlight: linkHighlightInput,
        badgeText: linkBadgeTextInput.trim() || undefined,
      };
      setStudioLinks((prev) => [...prev, newLink]);
    }

    setIsLinkModalOpen(false);
  };

  const handleDeleteLink = (id: string) => {
    nativeBridge.haptics.light();
    setStudioLinks((prev) => prev.filter((l) => l.id !== id));
  };

  const handleMoveLink = (index: number, direction: 'up' | 'down') => {
    nativeBridge.haptics.light();
    setStudioLinks((prev) => {
      const copy = [...prev];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= copy.length) return prev;
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy;
    });
  };

  const handleSaveStudioSettings = async () => {
    nativeBridge.haptics.light();
    setIsSavingStudio(true);
    setStudioSuccessMessage(null);
    try {
      const updated: PuppyProfile = {
        ...puppy,
        pageTheme: studioTheme,
        pageFont: studioFont,
        pageHeadline: studioHeadline.trim() || undefined,
        pageBio: studioBio.trim() || undefined,
        customLinks: studioLinks,
      };

      storage.savePuppy(updated);
      await syncPuppyToConvex(updated);
      await triggerMarketingSiteInstantUpdate(activeSlug);

      onUpdatePuppy(updated, '✨ Page Studio settings & Link Tree published!');
      setStudioSuccessMessage('✓ Theme, fonts & links synced live to database & public URL!');
      setTimeout(() => setStudioSuccessMessage(null), 4000);
    } catch (err) {
      console.error('Failed to save studio settings:', err);
      setStudioSuccessMessage('Saved locally. Database sync queued.');
    } finally {
      setIsSavingStudio(false);
    }
  };

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

  // Multi-Pet Pack Manager state
  const [allPuppies, setAllPuppies] = useState<PuppyProfile[]>(() => storage.getPuppies());
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [puppyToDelete, setPuppyToDelete] = useState<PuppyProfile | null>(null);

  useEffect(() => {
    setAllPuppies(storage.getPuppies());
    return storage.subscribe(() => {
      setAllPuppies([...storage.getPuppies()]);
    });
  }, [puppy.id]);

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

  // Watchdog effect to guarantee photo upload spinner never hangs indefinitely
  useEffect(() => {
    if (!isUploadingPhoto) return;
    const timer = setTimeout(() => {
      setIsUploadingPhoto(false);
    }, 25000);
    return () => clearTimeout(timer);
  }, [isUploadingPhoto]);
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
      setStudioTheme(puppy.pageTheme || 'puplume_classic');
      setStudioFont(puppy.pageFont || 'grandstander');
      setStudioHeadline(puppy.pageHeadline || '');
      setStudioBio(puppy.pageBio || '');
      if (puppy.customLinks && puppy.customLinks.length > 0) {
        setStudioLinks(puppy.customLinks);
      }
      const localPass = typeof window !== 'undefined' 
        ? localStorage.getItem(`puplume_smart_tag_pass_${puppy.id}`) === 'true' 
        : false;
      setHasSmartTagPass(Boolean(puppy.hasSmartTagPass || localPass));
    }
  }, [puppy]);

  // Age calculations
  const birthTimestamp = puppy.birthDate ? new Date(puppy.birthDate).getTime() : NaN;
  const ageWeeks = isNaN(birthTimestamp)
    ? 12
    : Math.max(1, Math.floor((Date.now() - birthTimestamp) / (1000 * 60 * 60 * 24 * 7)));
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

  const [copiedField, setCopiedField] = useState<string | null>(null);
  const handleCopyText = async (text: string, label: string) => {
    nativeBridge.haptics.light();
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopiedField(label);
      setTimeout(() => setCopiedField(null), 2500);
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
        validLinks.push({ id: generateUniqueId('link-wa'), platform: 'whatsapp', value: effectivePhone });
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
        weightLbs: Math.max(0.5, parseFloat(weightLbs) || puppy.weightLbs),
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

  const handleDeletePuppy = () => {
    if (!puppyToDelete) return;
    storage.deletePuppy(puppyToDelete.id);
    setDeleteConfirmOpen(false);
    const remaining = storage.getPuppies();
    if (remaining.length > 0) {
      onSwitchPuppy?.(remaining[0].id);
    }
    onUpdatePuppy(storage.getActivePuppy() || remaining[0], `Removed ${puppyToDelete.name} from your pack.`);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-6 px-1 sm:px-4">

      {/* PUP PACK SELECTOR & MANAGER (Case 37: Multi-Pet Architecture) */}
      <div className="bg-white rounded-[24px] border border-[#E8DDD3] p-4 sm:p-5 shadow-xs select-none">
        <div className="flex items-center justify-between gap-3 mb-3.5">
          <div className="space-y-0.5">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#8B5E3C] block">Multi-Pet Manager</span>
            <h2 className="text-sm sm:text-base font-black text-[#2C211B] flex items-center gap-1.5">
              <Dog className="w-4 h-4 text-[#8B5E3C]" />
              Your Puppies ({allPuppies.length})
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onOpenNewPuppyWizard?.()}
            className="min-h-[44px] px-3.5 py-2 rounded-xl bg-[#FFF9F2] hover:bg-[#F3E7DA] text-[#8B5E3C] border border-[#E8DDD3] text-xs font-extrabold flex items-center gap-1.5 transition-all active:scale-[0.98] shadow-2xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Add Puppy</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {allPuppies.map((p) => {
            const isSelected = p.id === puppy.id;
            return (
              <div
                key={p.id}
                onClick={() => {
                  if (!isSelected) onSwitchPuppy?.(p.id);
                }}
                className={`min-h-[56px] p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 select-none active:scale-[0.99] ${
                  isSelected
                    ? 'bg-[#FFF9F2] border-[#8B5E3C] ring-2 ring-[#8B5E3C]/20 shadow-xs'
                    : 'bg-white border-[#E8DDD3] hover:border-[#8B5E3C]/50 hover:bg-[#FAF6F0]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={p.photoUrl}
                    alt={p.name}
                    draggable={false}
                    className="w-11 h-11 rounded-xl object-cover border border-[#8B5E3C]/30 shrink-0 pointer-events-none select-none shadow-2xs"
                  />
                  <div className="min-w-0">
                    <h4 className="text-xs sm:text-sm font-extrabold text-[#2C211B] truncate flex items-center gap-1.5">
                      {p.name}
                      {isSelected && <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]" />}
                    </h4>
                    <p className="text-[11px] text-[#766A63] font-medium truncate tabular-nums">
                      {p.breed} • {p.weightLbs} lbs
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isSelected ? (
                    <span className="px-2.5 py-1 rounded-lg bg-[#8B5E3C] text-white text-[11px] font-bold shadow-2xs">
                      Active
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-[#8B5E3C] hover:underline px-2 py-1">
                      Switch
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

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
      <div className="bg-[#FFFDF9] rounded-[28px] border-2 border-[#E8DDD3] p-5 sm:p-7 shadow-[0_8px_30px_rgba(44,33,27,0.06)] relative overflow-hidden select-none">
        
        {/* Subtle decorative background watermarks */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-[#F3E7DA]/50 to-transparent rounded-bl-full pointer-events-none -mr-16 -mt-16" />
        <div className="absolute top-4 right-6 text-right hidden sm:block">
          <span className="text-[11px] font-mono tracking-widest text-[#8B5E3C] font-bold uppercase block">
            PupLume Official Passport
          </span>
          <span className="text-xs font-mono text-[#766A63] font-semibold tabular-nums">
            {passportSerial}
          </span>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6 lg:gap-8">
          
          {/* Avatar with Emerald Verified Seal and Instant Uploader */}
          <div className="relative group shrink-0">
            <div className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-[24px] overflow-hidden border-3 border-[#8B5E3C] shadow-md bg-[#FAF6F0]">
              <img
                src={photoUrl || puppy.photoUrl}
                alt={puppy.name}
                draggable={false}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 pointer-events-none select-none"
              />
              {/* Lost Mode Glow ring */}
              {isLost && (
                <div className="absolute inset-0 border-4 border-rose-500 animate-pulse pointer-events-none" />
              )}
              {/* Professional Centered Uploading Overlay */}
              {isUploadingPhoto && (
                <div className="absolute inset-0 bg-[#2C211B]/70 backdrop-blur-xs rounded-[22px] flex flex-col items-center justify-center text-white gap-2 p-3 text-center z-20 animate-in fade-in duration-150">
                  <Loader2 className="w-7 h-7 animate-spin text-[#F3E7DA]" />
                  <span className="text-xs font-bold text-white tracking-wide">Optimizing photo...</span>
                </div>
              )}
            </div>

            {/* Emerald Verified Seal */}
            <div 
              className="absolute -top-2 -left-2 bg-[#059669] text-white p-1.5 rounded-xl shadow-md border-2 border-white flex items-center gap-1 z-10"
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
                userId={user?.id}
                targetType="puppy_profile"
                targetId={puppy.id}
                folder="puplume/puppies"
                label="Photo"
                variant="button"
              />
            </div>
          </div>

          {/* Hero Details & Primary Identity */}
          <div className="flex-1 text-center md:text-left space-y-3.5 w-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
                  <h1 className="text-3xl sm:text-4xl font-black text-[#2C211B] tracking-tight font-brand">
                    {puppy.name}
                  </h1>
                  <span className={`text-xs font-extrabold uppercase tracking-wider px-3 py-1 rounded-full border ${
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
                  {puppy.breed} • <span className="text-[#8B5E3C] font-bold">{ageDisplay}</span> • <span className="tabular-nums font-semibold">{puppy.weightLbs} lbs</span>
                </p>
              </div>

              {/* Action Buttons: Share Passport & Edit Profile with min-h-[44px] mobile touch ergonomics */}
              <div className="flex flex-wrap items-center justify-center md:justify-end gap-2.5 pt-1 sm:pt-0">
                <button
                  type="button"
                  onClick={handleSharePassport}
                  className="min-h-[44px] px-4 py-2.5 rounded-xl bg-white hover:bg-[#FAF6F0] text-[#2C211B] border border-[#E8DDD3] text-xs font-extrabold flex items-center gap-2 transition-all active:scale-[0.98] shadow-xs cursor-pointer"
                >
                  <Share2 className="w-4 h-4 text-[#8B5E3C]" />
                  <span>Share Passport</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditOpen(true)}
                  className="min-h-[44px] px-4 py-2.5 rounded-xl bg-white hover:bg-[#FAF6F0] text-[#2C211B] border border-[#E8DDD3] text-xs font-extrabold flex items-center gap-2 transition-all active:scale-[0.98] shadow-xs cursor-pointer"
                >
                  <Edit3 className="w-4 h-4 text-[#8B5E3C]" />
                  <span>Edit Profile</span>
                </button>
              </div>
            </div>

            {/* Quick Pet Dossier Highlights - Stacked card layout with zero awkward text truncation */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 w-full">
              <div className="bg-[#FFF9F2] border border-[#E8DDD3] rounded-xl p-2.5 sm:p-3 flex flex-col justify-between min-h-[64px] shadow-2xs">
                <div className="flex items-center gap-1.5 text-[#766A63]">
                  <Calendar className="w-3.5 h-3.5 text-[#8B5E3C] shrink-0" />
                  <span className="text-[11px] font-extrabold uppercase tracking-wider">Born</span>
                </div>
                <span className="text-xs font-extrabold text-[#2C211B] tabular-nums mt-1 block">
                  {puppy.birthDate || 'Not set'}
                </span>
              </div>

              <div className="bg-[#FFF9F2] border border-[#E8DDD3] rounded-xl p-2.5 sm:p-3 flex flex-col justify-between min-h-[64px] shadow-2xs">
                <div className="flex items-center gap-1.5 text-[#766A63]">
                  <Heart className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span className="text-[11px] font-extrabold uppercase tracking-wider">Treat</span>
                </div>
                <span 
                  className="text-xs font-extrabold text-[#2C211B] line-clamp-2 leading-tight mt-1 block"
                  title={puppy.favoriteTreat || 'None set'}
                >
                  {puppy.favoriteTreat || 'None set'}
                </span>
              </div>

              <div className="bg-[#FFF9F2] border border-[#E8DDD3] rounded-xl p-2.5 sm:p-3 flex flex-col justify-between min-h-[64px] shadow-2xs">
                <div className="flex items-center gap-1.5 text-[#766A63]">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="text-[11px] font-extrabold uppercase tracking-wider">Microchip</span>
                </div>
                <span className="text-xs font-mono font-extrabold text-[#2C211B] truncate tabular-nums mt-1 block">
                  {puppy.microchipNumber || 'Pending'}
                </span>
              </div>

              <div className="bg-[#FFF9F2] border border-[#E8DDD3] rounded-xl p-2.5 sm:p-3 flex flex-col justify-between min-h-[64px] shadow-2xs">
                <div className="flex items-center gap-1.5 text-[#766A63]">
                  <QrCode className="w-3.5 h-3.5 text-[#8B5E3C] shrink-0" />
                  <span className="text-[11px] font-extrabold uppercase tracking-wider">Smart Tag</span>
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${hasSmartTagPass ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]' : 'bg-amber-400'}`} />
                  <span className="text-xs font-extrabold text-[#2C211B]">
                    {hasSmartTagPass ? 'Active Pass' : 'Standard'}
                  </span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* SECTION NAV: SLEEK SEGMENTED CONTROL TABS */}
      <div className="bg-[#F3E7DA]/70 p-1.5 rounded-2xl border border-[#E8DDD3] shadow-inner flex items-center gap-1 sm:gap-1.5 overflow-x-auto select-none">
        {[
          { id: 'passport', label: 'Passport & Care', short: 'Passport', icon: <Dog className="w-4 h-4 text-[#8B5E3C] shrink-0" /> },
          { id: 'collar', label: 'Smart Tag & QR', short: 'Tag & QR', icon: <QrCode className="w-4 h-4 text-[#8B5E3C] shrink-0" /> },
          { id: 'safety', label: 'Safety & Contacts', short: 'Safety', icon: <AlertTriangle className={`w-4 h-4 shrink-0 ${isLost ? 'text-rose-600 animate-pulse' : 'text-[#8B5E3C]'}`} />, badge: isLost },
          { id: 'studio', label: 'Page Studio & Links', short: 'Studio', icon: <Sparkles className="w-4 h-4 text-[#8B5E3C] shrink-0" /> },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                nativeBridge.haptics.selection();
                setActiveTab(tab.id as any);
              }}
              className={`flex-1 min-h-[44px] py-2 sm:py-2.5 px-2.5 sm:px-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap active:scale-[0.98] ${
                isActive
                  ? 'bg-white text-[#2C211B] shadow-xs border border-[#E8DDD3]'
                  : 'text-[#766A63] hover:text-[#2C211B] hover:bg-white/40'
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.short}</span>
              {tab.badge && (
                <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: VERIFIED PET DOSSIER & IDENTITY (Case 37 Grouped List Architecture) */}
      {activeTab === 'passport' && (
        <div className="space-y-4">
          {/* Section Header with Action */}
          <div className="flex items-center justify-between px-1">
            <div>
              <h3 className="text-sm font-extrabold text-[#2C211B] flex items-center gap-1.5">
                <Dog className="w-4 h-4 text-[#8B5E3C]" />
                Verified Pet Dossier & Identity
              </h3>
              <p className="text-[11px] text-[#766A63]">Essential identity traits, feeding formula, and official records</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditOpen(true)}
              leftIcon={<Edit3 className="w-3.5 h-3.5 text-[#8B5E3C]" />}
              className="text-xs font-bold bg-white rounded-xl shadow-2xs hover:bg-[#FAF6F0]"
            >
              Edit Details
            </Button>
          </div>

          {/* Group 1: Core Physical Identity */}
          <div className="bg-white rounded-2xl border border-[#E8DDD3] overflow-hidden shadow-xs divide-y divide-[#E8DDD3]/60">
            <div className="p-3.5 sm:px-4 flex items-center justify-between gap-3 hover:bg-[#FFF9F2]/50 transition-colors">
              <div className="flex items-center gap-2.5">
                <Dog className="w-4 h-4 text-[#8B5E3C] shrink-0" />
                <span className="text-xs font-semibold text-[#766A63]">Breed</span>
              </div>
              <span className="text-xs font-bold text-[#2C211B]">{puppy.breed}</span>
            </div>

            <div className="p-3.5 sm:px-4 flex items-center justify-between gap-3 hover:bg-[#FFF9F2]/50 transition-colors">
              <div className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-[#8B5E3C] shrink-0" />
                <span className="text-xs font-semibold text-[#766A63]">Birthday & Age</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-[#2C211B]">{puppy.birthDate || 'Not recorded'}</span>
                <span className="text-[11px] text-[#8B5E3C] font-semibold block">{ageDisplay}</span>
              </div>
            </div>

            <div className="p-3.5 sm:px-4 flex items-center justify-between gap-3 hover:bg-[#FFF9F2]/50 transition-colors">
              <div className="flex items-center gap-2.5">
                <Award className="w-4 h-4 text-[#8B5E3C] shrink-0" />
                <span className="text-xs font-semibold text-[#766A63]">Sex & Weight</span>
              </div>
              <span className="text-xs font-bold text-[#2C211B] font-mono tabular-nums">
                {puppy.sex === 'male' ? 'Male (Boy)' : 'Female (Girl)'} • {puppy.weightLbs} lbs
              </span>
            </div>

            <div className="p-3.5 sm:px-4 flex items-center justify-between gap-3 hover:bg-[#FFF9F2]/50 transition-colors">
              <div className="flex items-center gap-2.5">
                <Smile className="w-4 h-4 text-[#8B5E3C] shrink-0" />
                <span className="text-xs font-semibold text-[#766A63]">Temperament</span>
              </div>
              <span className="text-xs font-medium text-[#2C211B] max-w-[200px] sm:max-w-xs text-right truncate">
                {puppy.temperament ? `“${puppy.temperament}”` : 'Not recorded'}
              </span>
            </div>
          </div>

          {/* Group 2: Nutrition, Care & Rewards */}
          <div className="bg-white rounded-2xl border border-[#E8DDD3] overflow-hidden shadow-xs divide-y divide-[#E8DDD3]/60">
            <div className="p-3.5 sm:px-4 flex items-center justify-between gap-3 hover:bg-[#FFF9F2]/50 transition-colors">
              <div className="flex items-center gap-2.5">
                <Heart className="w-4 h-4 text-rose-500 shrink-0" />
                <span className="text-xs font-semibold text-[#766A63]">Favorite Reward / Treat</span>
              </div>
              <span className="text-xs font-bold text-[#2C211B]">{puppy.favoriteTreat || 'None recorded'}</span>
            </div>

            <div className="p-3.5 sm:px-4 flex items-center justify-between gap-3 hover:bg-[#FFF9F2]/50 transition-colors">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="text-xs font-semibold text-[#766A63]">Dietary Restrictions & Allergies</span>
              </div>
              <span className="text-xs font-medium text-[#2C211B] max-w-[200px] sm:max-w-xs text-right truncate">
                {puppy.dietaryRestrictions || puppy.allergies || 'None recorded'}
              </span>
            </div>
          </div>

          {/* Group 3: Veterinary & Official Credentials */}
          <div className="bg-white rounded-2xl border border-[#E8DDD3] overflow-hidden shadow-xs divide-y divide-[#E8DDD3]/60">
            <div className="p-3.5 sm:px-4 flex items-center justify-between gap-3 hover:bg-[#FFF9F2]/50 transition-colors">
              <div className="flex items-center gap-2.5">
                <Stethoscope className="w-4 h-4 text-[#8B5E3C] shrink-0" />
                <span className="text-xs font-semibold text-[#766A63]">Primary Clinic</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-[#2C211B] block">{puppy.vetClinic || 'Not set'}</span>
                {puppy.vetPhone && (
                  <a href={`tel:${puppy.vetPhone}`} className="text-[11px] font-bold text-[#8B5E3C] hover:underline">
                    {puppy.vetPhone}
                  </a>
                )}
              </div>
            </div>

            <div className="p-3.5 sm:px-4 flex items-center justify-between gap-3 hover:bg-[#FFF9F2]/50 transition-colors">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-xs font-semibold text-[#766A63]">Microchip RFID</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-[#2C211B]">{puppy.microchipNumber || 'Pending'}</span>
                {puppy.microchipNumber && (
                  <button
                    type="button"
                    onClick={() => handleCopyText(puppy.microchipNumber || '', 'chip')}
                    className="p-1 text-[#766A63] hover:text-[#8B5E3C] cursor-pointer"
                    title="Copy Microchip"
                  >
                    {copiedField === 'chip' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>
            </div>

            <div className="p-3.5 sm:px-4 flex items-center justify-between gap-3 hover:bg-[#FFF9F2]/50 transition-colors">
              <div className="flex items-center gap-2.5">
                <Award className="w-4 h-4 text-[#8B5E3C] shrink-0" />
                <span className="text-xs font-semibold text-[#766A63]">Pet Insurance</span>
              </div>
              <span className="text-xs font-bold text-[#2C211B]">
                {puppy.insuranceProvider ? `${puppy.insuranceProvider}${puppy.insurancePolicyNumber ? ` (${puppy.insurancePolicyNumber})` : ''}` : 'Not recorded'}
              </span>
            </div>

            <div className="p-3.5 sm:px-4 flex items-center justify-between gap-3 hover:bg-[#FFF9F2]/50 transition-colors">
              <div className="flex items-center gap-2.5">
                <QrCode className="w-4 h-4 text-[#8B5E3C] shrink-0" />
                <span className="text-xs font-semibold text-[#766A63]">Digital Passport Serial</span>
              </div>
              <span className="text-xs font-mono font-bold text-[#8B5E3C]">{passportSerial}</span>
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
                  <label className="block text-xs font-bold text-[#2C211B] mb-1">
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

      {/* TAB 4: PAGE STUDIO & LINK TREE (UNSLOP ENGINE) */}
      {activeTab === 'studio' && (
        <div className="space-y-6">
          {/* Section Header with Quick Link */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
            <div>
              <h3 className="text-base font-black text-[#2C211B] flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#8B5E3C]" />
                Page Studio &amp; Link Tree
              </h3>
              <p className="text-xs text-[#766A63] mt-0.5">
                Customize {puppy.name}&apos;s public page. Premium themes, Google fonts, custom links, and live mobile preview.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={publicUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#FAF6F0] border border-[#E8DDD3] text-[#8B5E3C] text-xs font-bold shadow-2xs flex items-center gap-1.5 transition-transform active:scale-[0.98] cursor-pointer"
              >
                <span>View Public Page</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveStudioSettings}
                disabled={isSavingStudio}
                leftIcon={isSavingStudio ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                className="text-xs font-bold shadow-xs"
              >
                {isSavingStudio ? 'Saving...' : 'Save & Publish'}
              </Button>
            </div>
          </div>

          {/* Success / Feedback Notification */}
          {studioSuccessMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{studioSuccessMessage}</span>
            </div>
          )}

          {/* ================================================================= */}
          {/* SECTION 1: CREATIVE THEME SYSTEM (UNSLOP PALETTE) */}
          {/* ================================================================= */}
          <div className="bg-white rounded-2xl border border-[#E8DDD3] p-5 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-[#8B5E3C]" />
                <h4 className="text-xs font-black uppercase tracking-wider text-[#2C211B]">
                  1. Creative Theme &amp; Atmosphere
                </h4>
              </div>
              <span className="text-[11px] text-[#766A63] font-medium">4 Handcrafted Palettes</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {AVAILABLE_PUP_THEMES.map((themeKey) => {
                const t = PUP_PAGE_THEMES[themeKey];
                const isSelected = studioTheme === themeKey;

                return (
                  <button
                    key={themeKey}
                    type="button"
                    onClick={() => {
                      nativeBridge.haptics.light();
                      setStudioTheme(themeKey);
                    }}
                    className={`p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden flex items-start gap-3 cursor-pointer ${
                      isSelected
                        ? 'border-[#8B5E3C] bg-[#FFF9F2] shadow-xs ring-2 ring-[#8B5E3C]/20'
                        : 'border-[#E8DDD3] hover:border-[#8B5E3C]/50 bg-white hover:bg-[#FAF6F0]/40'
                    }`}
                  >
                    {/* Visual Color Swatch */}
                    <div 
                      className="w-10 h-10 rounded-xl shrink-0 border border-black/10 shadow-2xs flex items-center justify-center font-bold text-xs"
                      style={{ backgroundColor: t.previewBg, color: t.previewAccent }}
                    >
                      <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: t.previewAccent }} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-black text-[#2C211B]">{t.name}</span>
                        {isSelected && (
                          <span className="px-1.5 py-0.5 rounded-md bg-[#8B5E3C] text-white text-[10px] font-black uppercase tracking-wider">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#766A63] mt-0.5 font-medium truncate">
                        {t.tagline}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ================================================================= */}
          {/* SECTION 2: GOOGLE FONTS (SIL OFL 100% FREE COMMERCIAL) */}
          {/* ================================================================= */}
          <div className="bg-white rounded-2xl border border-[#E8DDD3] p-5 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Type className="w-4 h-4 text-[#8B5E3C]" />
                <h4 className="text-xs font-black uppercase tracking-wider text-[#2C211B]">
                  2. Google Font Typography (Free Commercial)
                </h4>
              </div>
              <span className="text-[11px] text-[#766A63] font-medium">4 Authentic Brand Fonts</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {AVAILABLE_PUP_FONTS.map((fontKey) => {
                const f = PUP_PAGE_FONTS[fontKey];
                const isSelected = studioFont === fontKey;

                return (
                  <button
                    key={fontKey}
                    type="button"
                    onClick={() => {
                      nativeBridge.haptics.light();
                      setStudioFont(fontKey);
                    }}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative ${
                      isSelected
                        ? 'border-[#8B5E3C] bg-[#FFF9F2] shadow-xs ring-2 ring-[#8B5E3C]/20'
                        : 'border-[#E8DDD3] hover:border-[#8B5E3C]/40 bg-white hover:bg-[#FAF6F0]/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#8B5E3C]">
                        {f.category}
                      </span>
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-[#8B5E3C]" />
                      )}
                    </div>
                    <div className="text-sm font-bold text-[#2C211B] truncate">
                      {f.name}
                    </div>
                    <div className={`text-xs mt-1 text-[#766A63] truncate ${f.headingClass}`}>
                      {puppy.name}&apos;s Passport 🐾
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ================================================================= */}
          {/* SECTION 3: EDITORIAL HEADLINE & PUBLIC STORY */}
          {/* ================================================================= */}
          <div className="bg-white rounded-2xl border border-[#E8DDD3] p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-[#8B5E3C]" />
              <h4 className="text-xs font-black uppercase tracking-wider text-[#2C211B]">
                3. Editorial Tagline &amp; Public Bio
              </h4>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#2C211B] mb-1">
                  Public Headline / Catchphrase
                </label>
                <input
                  type="text"
                  value={studioHeadline}
                  onChange={(e) => setStudioHeadline(e.target.value)}
                  placeholder={`e.g. Seattle's Adventure Golden Retriever 🌲`}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DDD3] bg-white text-xs font-medium text-[#2C211B] focus:outline-none focus:border-[#8B5E3C] shadow-2xs"
                />
                <p className="text-[11px] text-[#766A63] mt-1">
                  Displays in large styled text beneath {puppy.name}&apos;s name.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2C211B] mb-1">
                  Public Story / Bio
                </label>
                <textarea
                  rows={3}
                  value={studioBio}
                  onChange={(e) => setStudioBio(e.target.value)}
                  placeholder={`e.g. Park enthusiast, fetch champion, and treat connoisseur. Check out my gear and socials below!`}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DDD3] bg-white text-xs font-medium text-[#2C211B] focus:outline-none focus:border-[#8B5E3C] shadow-2xs resize-none"
                />
                <p className="text-[11px] text-[#766A63] mt-1">
                  A personal note, funny personality traits, or intro for visitors and finders.
                </p>
              </div>
            </div>
          </div>

          {/* ================================================================= */}
          {/* SECTION 4: THE PUPPY LINK TREE BUILDER */}
          {/* ================================================================= */}
          <div className="bg-white rounded-2xl border border-[#E8DDD3] p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <LinkIcon className="w-4 h-4 text-[#8B5E3C]" />
                  <h4 className="text-xs font-black uppercase tracking-wider text-[#2C211B]">
                    4. Puppy Link Tree ({studioLinks.length})
                  </h4>
                </div>
                <p className="text-[11px] text-[#766A63] mt-0.5">
                  Add socials, favorite gear, emergency vet portals, or rescue stories.
                </p>
              </div>

              <button
                type="button"
                onClick={handleOpenAddLink}
                className="px-3.5 py-2 rounded-xl bg-[#8B5E3C] hover:bg-[#6D492F] text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-transform active:scale-[0.98] cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Link</span>
              </button>
            </div>

            {/* List of Custom Links */}
            {studioLinks.length === 0 ? (
              <div className="p-8 text-center border-2 border-dashed border-[#E8DDD3] rounded-2xl space-y-2">
                <LinkIcon className="w-8 h-8 text-[#8B5E3C]/40 mx-auto" />
                <h5 className="text-xs font-bold text-[#2C211B]">No links in {puppy.name}&apos;s link tree</h5>
                <p className="text-[11px] text-[#766A63] max-w-sm mx-auto">
                  Add their Instagram page, TikTok, favorite dog chews, or direct care links.
                </p>
                <button
                  type="button"
                  onClick={handleOpenAddLink}
                  className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-[#8B5E3C] hover:underline cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create first link</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {studioLinks.map((link, idx) => (
                  <div
                    key={link.id}
                    className="p-3 rounded-xl border border-[#E8DDD3] bg-[#FAF6F0]/40 flex items-center justify-between gap-3 hover:bg-white hover:border-[#8B5E3C]/40 transition-colors shadow-2xs"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {/* Drag / Reorder Controls */}
                      <div className="flex flex-col gap-0.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleMoveLink(idx, 'up')}
                          disabled={idx === 0}
                          className="p-1 rounded text-[#766A63] hover:text-[#2C211B] disabled:opacity-20 cursor-pointer"
                          title="Move link up"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveLink(idx, 'down')}
                          disabled={idx === studioLinks.length - 1}
                          className="p-1 rounded text-[#766A63] hover:text-[#2C211B] disabled:opacity-20 cursor-pointer"
                          title="Move link down"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Link Info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-[#2C211B] truncate">
                            {link.title}
                          </span>
                          {link.highlight && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200 text-[9px] font-black uppercase tracking-wider">
                              ★ {link.badgeText || 'Featured'}
                            </span>
                          )}
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-[#E8DDD3]/60 text-[#766A63] capitalize">
                            {link.category || 'custom'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-[#766A63] mt-0.5 truncate font-mono">
                          <span className="truncate">{link.url}</span>
                          {link.subtitle && (
                            <>
                              <span>•</span>
                              <span className="font-sans truncate">{link.subtitle}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Edit & Delete Controls */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleOpenEditLink(link)}
                        className="p-1.5 rounded-lg border border-[#E8DDD3] bg-white text-[#766A63] hover:text-[#2C211B] hover:bg-[#FAF6F0] transition-colors cursor-pointer"
                        title="Edit Link"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteLink(link.id)}
                        className="p-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer"
                        title="Delete Link"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ================================================================= */}
          {/* SECTION 5: LIVE INTERACTIVE PHONE MOCKUP PREVIEW */}
          {/* ================================================================= */}
          <div className="bg-white rounded-2xl border border-[#E8DDD3] p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#8B5E3C]" />
                <h4 className="text-xs font-black uppercase tracking-wider text-[#2C211B]">
                  5. Real-Time Phone Preview
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setShowLivePhoneMockup(!showLivePhoneMockup)}
                className="text-xs font-bold text-[#8B5E3C] hover:underline flex items-center gap-1 cursor-pointer"
              >
                {showLivePhoneMockup ? (
                  <>
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>Hide Preview</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5" />
                    <span>Show Preview</span>
                  </>
                )}
              </button>
            </div>

            {showLivePhoneMockup && (
              <div className="flex justify-center p-4 sm:p-6 bg-[#FAF6F0]/60 rounded-2xl border border-[#E8DDD3]/80">
                {/* Mobile Phone Mockup Chassis */}
                <div className="w-full max-w-[340px] rounded-[36px] border-[8px] border-[#2C211B] shadow-[0_20px_50px_rgba(44,33,27,0.25)] overflow-hidden bg-white">
                  {/* Dynamic Island / Speaker Notch */}
                  <div className="bg-[#2C211B] h-5 w-full flex items-center justify-center">
                    <div className="w-20 h-3 rounded-full bg-black/60 flex items-center justify-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-900/60 ml-8" />
                    </div>
                  </div>

                  {/* Phone Screen Rendering Active Theme */}
                  {(() => {
                    const previewTheme = PUP_PAGE_THEMES[studioTheme] || PUP_PAGE_THEMES.puplume_classic;
                    const previewFont = PUP_PAGE_FONTS[studioFont] || PUP_PAGE_FONTS.grandstander;

                    return (
                      <div className={`p-4 space-y-3.5 max-h-[520px] overflow-y-auto ${previewTheme.backgroundClass} ${previewFont.bodyClass}`}>
                        {/* Mini Hero Card */}
                        <div className={`${previewTheme.cardClass} rounded-2xl p-4 text-center space-y-2`}>
                          <div className="w-20 h-20 rounded-2xl overflow-hidden mx-auto border-2 border-white/20 shadow-xs">
                            <img
                              src={photoUrl || puppy.photoUrl || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=400"}
                              alt={puppy.name}
                              draggable={false}
                              className="w-full h-full object-cover pointer-events-none select-none"
                            />
                          </div>

                          <div>
                            <h4 className={`${previewFont.headingClass} text-xl font-black ${previewTheme.textPrimary}`}>
                              {puppy.name}
                            </h4>
                            {studioHeadline ? (
                              <p className={`text-[11px] font-semibold italic ${previewTheme.isDark ? 'text-[#E5C378]' : 'text-[#8B5E3C]'}`}>
                                &ldquo;{studioHeadline}&rdquo;
                              </p>
                            ) : null}
                            <p className={`text-[11px] ${previewTheme.textSecondary} mt-0.5`}>
                              {puppy.breed} • {ageDisplay}
                            </p>
                          </div>

                          {studioBio ? (
                            <p className={`text-[10px] ${previewTheme.textSecondary} leading-relaxed line-clamp-3`}>
                              {studioBio}
                            </p>
                          ) : null}
                        </div>

                        {/* Mini Call & SMS Buttons */}
                        <div className="grid grid-cols-2 gap-2 text-[10px] font-bold">
                          <div className={`p-2 rounded-xl text-center shadow-xs ${previewTheme.accentButtonClass}`}>
                            📞 Call Owner
                          </div>
                          <div className={`p-2 rounded-xl text-center shadow-xs ${previewTheme.secondaryButtonClass}`}>
                            💬 Send SMS
                          </div>
                        </div>

                        {/* Mini Link Tree Cards */}
                        <div className="space-y-2">
                          <span className={`text-[9px] font-extrabold uppercase tracking-wider block ${previewTheme.isDark ? 'text-[#E5C378]' : 'text-[#8B5E3C]'}`}>
                            Curated Links ({studioLinks.length})
                          </span>
                          {studioLinks.map((link) => (
                            <PupLinkTreeCard
                              key={link.id}
                              link={link}
                              themeId={studioTheme}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>

          {/* ================================================================= */}
          {/* SAVE & PUBLISH ACTION BAR */}
          {/* ================================================================= */}
          <div className="bg-[#FAF6F0] rounded-2xl border border-[#E8DDD3] p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
            <div className="text-center sm:text-left">
              <h5 className="text-xs font-black text-[#2C211B]">
                Ready to publish {puppy.name}&apos;s redesigned page?
              </h5>
              <p className="text-[11px] text-[#766A63] mt-0.5">
                Updates {publicUrl} immediately with your selected theme, fonts, and links.
              </p>
            </div>

            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={handleSaveStudioSettings}
              disabled={isSavingStudio}
              leftIcon={
                isSavingStudio ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )
              }
              className="w-full sm:w-auto text-xs font-black px-6 shadow-sm cursor-pointer"
            >
              {isSavingStudio ? 'Publishing to Cloud...' : 'Publish to Public URL'}
            </Button>
          </div>
        </div>
      )}

      {/* CASE 37 STEP 4: ISOLATE DESTRUCTIVE ACTIONS AT BOTTOM */}
      {allPuppies.length > 1 && (
        <div className="pt-6 border-t border-[#E8DDD3]/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-[#766A63]">
          <div>
            <h4 className="font-bold text-[#2C211B]">Danger Zone</h4>
            <p>Remove {puppy.name} from your multi-pet household pack.</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setPuppyToDelete(puppy);
              setDeleteConfirmOpen(true);
            }}
            className="px-3.5 py-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold transition-colors cursor-pointer text-xs"
          >
            Remove {puppy.name} from Pack
          </button>
        </div>
      )}

      {/* Non-blocking Confirm Dialog for Pet Deletion */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDeletePuppy}
        title={`Remove ${puppyToDelete?.name || 'Puppy'}?`}
        description={`Are you sure you want to remove ${puppyToDelete?.name || 'this puppy'} from your pack? This will permanently delete their health records and routine data from your device.`}
        confirmLabel="Yes, Remove Puppy"
        isDestructive={true}
      />

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
        <form onSubmit={handleSaveFullProfile} autoComplete="off" data-form-type="other" className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#2C211B] mb-1.5">
              Puppy Name
            </label>
            <input
              type="text"
              name="pet_name_field"
              id="pet_name_field"
              autoComplete="off"
              data-lpignore="true"
              data-form-type="other"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-[#E8DDD3] bg-[#FFF9F2] text-sm focus:outline-none focus:border-[#8B5E3C]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#2C211B] mb-1.5">
                Breed
              </label>
              <input
                type="text"
                name="pet_breed_field"
                id="pet_breed_field"
                autoComplete="off"
                data-lpignore="true"
                data-form-type="other"
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E8DDD3] bg-[#FFF9F2] text-xs focus:outline-none focus:border-[#8B5E3C]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#2C211B] mb-1.5">
                Weight (lbs)
              </label>
              <input
                type="text"
                inputMode="decimal"
                name="pet_weight_lbs"
                id="pet_weight_lbs"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
                data-lpignore="true"
                data-form-type="other"
                data-1p-ignore="true"
                value={weightLbs}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '' || /^\d*\.?\d*$/.test(val)) setWeightLbs(val);
                }}
                className="w-full px-3 py-2 rounded-xl border border-[#E8DDD3] bg-[#FFF9F2] text-xs focus:outline-none focus:border-[#8B5E3C]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2C211B] mb-1.5">
              Puppy Photo
            </label>
            <CloudinaryImageUploader
              currentImageUrl={photoUrl}
              onUploadSuccess={(url) => setPhotoUrl(url)}
              userId={user?.id}
              targetType="puppy_profile"
              targetId={puppy.id}
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
                <label className="block text-xs font-bold text-[#2C211B] mb-1.5">
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
              <label className="block text-xs font-bold text-[#2C211B] mb-1.5">
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
            <label className="block text-xs font-bold text-[#2C211B] mb-1.5">
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
            <label className="block text-xs font-bold text-[#2C211B] mb-1.5">
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
            <label className="block text-xs font-bold text-[#2C211B] mb-1.5">
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
              <label className="block text-xs font-bold text-[#2C211B] mb-1.5">
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
              <label className="block text-xs font-bold text-[#2C211B] mb-1.5">
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

      {/* MODAL 7: ADD / EDIT CUSTOM LINK (LINK TREE STUDIO) */}
      <Modal
        isOpen={isLinkModalOpen}
        onClose={() => setIsLinkModalOpen(false)}
        title={editingLink ? 'Edit Link' : 'Add Link to Tree'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#2C211B] mb-1">
              Link Title *
            </label>
            <input
              type="text"
              value={linkTitleInput}
              onChange={(e) => setLinkTitleInput(e.target.value)}
              placeholder="e.g. Follow my Instagram Reels"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DDD3] bg-[#FFF9F2] text-xs font-semibold text-[#2C211B] focus:outline-none focus:border-[#8B5E3C]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2C211B] mb-1">
              Destination URL *
            </label>
            <input
              type="text"
              value={linkUrlInput}
              onChange={(e) => setLinkUrlInput(e.target.value)}
              placeholder="e.g. https://instagram.com/graxzo"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DDD3] bg-[#FFF9F2] text-xs font-mono text-[#2C211B] focus:outline-none focus:border-[#8B5E3C]"
            />
            {linkUrlInput.trim() && (
              <div className="mt-2 p-2.5 rounded-xl bg-white border border-[#E8DDD3] flex items-center gap-2.5 shadow-2xs">
                {(() => {
                  const previewCandidates = getFaviconCandidates(linkUrlInput);
                  const previewSrc = previewCandidates[0] || null;
                  const host = extractHostname(linkUrlInput);
                  return (
                    <>
                      <div className="w-8 h-8 rounded-lg bg-[#FAF6F0] border border-[#E8DDD3] flex items-center justify-center shrink-0 overflow-hidden">
                        {previewSrc ? (
                          <img 
                            src={previewSrc} 
                            alt="" 
                            draggable={false}
                            className="w-5 h-5 object-contain pointer-events-none select-none"
                            onError={(e) => {
                              (e.currentTarget as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <LinkIcon className="w-4 h-4 text-[#8B5E3C]" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-[11px] font-black text-[#2C211B] truncate">
                            100% Favicon Extracted
                          </span>
                        </div>
                        <p className="text-[10px] text-[#766A63] font-mono truncate">
                          {host || 'Ready to fetch'}
                        </p>
                      </div>
                    </>
                  );
                })()}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2C211B] mb-1">
              Subtitle / Description (Optional)
            </label>
            <input
              type="text"
              value={linkSubtitleInput}
              onChange={(e) => setLinkSubtitleInput(e.target.value)}
              placeholder="e.g. Daily park runs & puppy tricks"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DDD3] bg-[#FFF9F2] text-xs text-[#2C211B] focus:outline-none focus:border-[#8B5E3C]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2C211B] mb-1">
              Category
            </label>
            <select
              value={linkCategoryInput}
              onChange={(e) => setLinkCategoryInput(e.target.value as any)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8DDD3] bg-[#FFF9F2] text-xs font-bold text-[#2C211B] focus:outline-none focus:border-[#8B5E3C]"
            >
              <option value="social">Social &amp; Media (Instagram, TikTok, YouTube)</option>
              <option value="gear">Favorite Treats &amp; Gear</option>
              <option value="service">Care &amp; Vet Portals</option>
              <option value="story">Story &amp; Pedigree</option>
              <option value="custom">Custom Destination</option>
            </select>
          </div>

          <div className="p-3.5 rounded-xl bg-[#FAF6F0] border border-[#E8DDD3] space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={linkHighlightInput}
                onChange={(e) => setLinkHighlightInput(e.target.checked)}
                className="w-4 h-4 rounded text-[#8B5E3C] focus:ring-[#8B5E3C]"
              />
              <span className="text-xs font-bold text-[#2C211B]">
                Feature this link with animated glow badge
              </span>
            </label>

            {linkHighlightInput && (
              <div>
                <label className="block text-[11px] font-bold text-[#766A63] mb-1">
                  Custom Badge Label (Optional)
                </label>
                <input
                  type="text"
                  value={linkBadgeTextInput}
                  onChange={(e) => setLinkBadgeTextInput(e.target.value)}
                  placeholder="e.g. 20% Off Treats, Most Watched, New"
                  className="w-full px-3 py-1.5 rounded-lg border border-[#E8DDD3] bg-white text-xs font-bold text-[#2C211B] focus:outline-none focus:border-[#8B5E3C]"
                />
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsLinkModalOpen(false)}
              className="flex-1 text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleSaveLink}
              className="flex-1 font-bold text-xs"
            >
              {editingLink ? 'Save Changes' : 'Add Link'}
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
};
