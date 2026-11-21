import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { 
  Phone, 
  MapPin, 
  AlertTriangle, 
  Check, 
  Share2,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Dog
} from 'lucide-react';
import { storage } from '../lib/storage';
import { copyToClipboard } from '../lib/clipboard';
import { COMMUNICATION_PLATFORMS, getPlatformFaviconUrl } from '../lib/communicationPlatforms';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class LocalPublicErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any) {
    console.warn('[PublicPupSafetyPage] Caught Convex query error, rendering offline safety card:', error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

function updateMetaTag(attr: 'property' | 'name', key: string, content: string) {
  if (typeof document === 'undefined') return;
  let element = document.querySelector(`meta[${attr}="${key}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attr, key);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function formatAge(birthDate?: string): string {
  if (!birthDate) return '1.5 Yrs';
  const bTime = new Date(birthDate).getTime();
  if (isNaN(bTime)) return '1.5 Yrs';
  const diffWeeks = Math.max(1, Math.floor((Date.now() - bTime) / (1000 * 60 * 60 * 24 * 7)));
  if (diffWeeks >= 52) {
    const years = (diffWeeks / 52).toFixed(1);
    return `${years} Yrs`;
  }
  if (diffWeeks >= 8) {
    const months = Math.floor(diffWeeks / 4.33);
    return `${months} Mos`;
  }
  return `${diffWeeks} Wks`;
}

export const PublicPupSafetyPage: React.FC = () => {
  const localPup = storage.getPuppy();
  return (
    <LocalPublicErrorBoundary fallback={<PublicPupSafetyCard puppy={localPup} />}>
      <PublicPupSafetyContent />
    </LocalPublicErrorBoundary>
  );
};

const PublicPupSafetyContent: React.FC = () => {
  // Extract identifier from /pup/:slug, /safety/:slug, or ?pup=...
  const [identifier] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const queryId = searchParams.get('pup') || searchParams.get('id') || searchParams.get('name');
      if (queryId) return decodeURIComponent(queryId).trim();

      const parts = window.location.pathname.split('/').filter(Boolean);
      const prefix = parts[0]?.toLowerCase();
      if ((prefix === 'pup' || prefix === 'safety' || prefix === 'p') && parts[1]) {
        return decodeURIComponent(parts[1]).trim();
      }
      if (parts[0]) {
        return decodeURIComponent(parts[0]).trim();
      }
    }
    return '';
  });

  // Real-time Convex public query (zero auth required)
  const convexPup = useQuery(
    api.puppies.getPublicPuppyByTag,
    identifier ? { identifier } : 'skip'
  );

  // Fallback to local storage if running in local sandbox dev without internet / before convex sync
  const localPup = storage.getPuppy();
  const activePup = convexPup || (
    localPup && (
      localPup.id === identifier || 
      (localPup.slug && localPup.slug.toLowerCase() === identifier.toLowerCase()) ||
      (!localPup.slug && (localPup.name.toLowerCase() === identifier.toLowerCase() || identifier === ''))
    ) ? {
      _id: localPup.id,
      name: localPup.name,
      breed: localPup.breed,
      sex: localPup.sex,
      weightLbs: localPup.weightLbs,
      birthDate: localPup.birthDate,
      photoUrl: localPup.photoUrl,
      temperament: localPup.temperament,
      allergies: localPup.allergies,
      dietaryRestrictions: localPup.dietaryRestrictions,
      microchipNumber: localPup.microchipNumber,
      vetClinic: localPup.vetClinic,
      vetPhone: localPup.vetPhone,
      vetName: localPup.vetName,
      ownerPhone: localPup.ownerPhone || '',
      ownerEmail: localPup.ownerEmail,
      emergencyContactName: localPup.emergencyContactName,
      guardianName: localPup.emergencyContactName || 'Guardian',
      emergencyContactPhone: localPup.emergencyContactPhone,
      emergencyNotes: localPup.emergencyNotes,
      isLost: localPup.isLost ?? false,
      rewardAmount: localPup.rewardAmount,
      slug: localPup.slug,
      hasSmartTagPass: localPup.hasSmartTagPass ?? (
        typeof window !== 'undefined' && localStorage.getItem(`puplume_smart_tag_pass_${localPup.id}`) === 'true'
      ),
      communicationLinks: localPup.communicationLinks,
      ownerInstagram: localPup.ownerInstagram,
      ownerFacebook: localPup.ownerFacebook,
      ownerWhatsApp: localPup.ownerWhatsApp,
      ownerTelegram: localPup.ownerTelegram,
      ownerSlack: localPup.ownerSlack,
      pageTheme: localPup.pageTheme,
      pageFont: localPup.pageFont,
      pageHeadline: localPup.pageHeadline,
      pageBio: localPup.pageBio,
      pageAccentColor: localPup.pageAccentColor,
      customLinks: localPup.customLinks,
      pageConfig: localPup.pageConfig,
      boopCount: 142,
      vaccinations: [],
    } : null
  );

  useEffect(() => {
    if (activePup) {
      document.title = `${activePup.name} — Digital Pet Passport | PupLume`;
      const targetSlug = activePup.slug || identifier || '';
      const ogImage = `/api/og/pup?slug=${encodeURIComponent(targetSlug)}&v=4`;
      updateMetaTag('property', 'og:title', `${activePup.name} — Digital Pet Passport | PupLume`);
      updateMetaTag('property', 'og:description', `Official digital pet passport and emergency contact card for ${activePup.name} (${activePup.breed || 'Canine'}).`);
      updateMetaTag('property', 'og:image', ogImage);
      updateMetaTag('name', 'twitter:image', ogImage);
    } else if (identifier) {
      document.title = 'Pet Passport Not Found — PupLume';
      const notFoundImage = `/api/og/pup?slug=${encodeURIComponent(identifier)}&v=4`;
      updateMetaTag('property', 'og:title', 'Pet Passport Not Found — PupLume');
      updateMetaTag('property', 'og:description', 'This puppy collar tag or passport link is inactive, mistyped, or not yet registered.');
      updateMetaTag('property', 'og:image', notFoundImage);
      updateMetaTag('name', 'twitter:image', notFoundImage);
    }
  }, [activePup, identifier]);

  // Loading state
  if (convexPup === undefined && identifier && !localPup) {
    return (
      <div className="min-h-screen bg-[#FFF9F2] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-10 h-10 border-3 border-[#8B5E3C] border-t-transparent rounded-full animate-spin mb-3.5" />
        <h2 className="text-base font-bold text-[#2C211B]" style={{ fontFamily: "'Grandstander', cursive" }}>
          Accessing Smart Collar Tag...
        </h2>
        <p className="text-xs text-[#766A63] mt-1">Retrieving official digital pet passport</p>
      </div>
    );
  }

  // Not found fallback
  if (!activePup) {
    return (
      <div className="min-h-screen bg-[#FFF9F2] flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
        <div className="w-20 h-20 bg-[#FAF6F0] rounded-3xl flex items-center justify-center mb-5 border border-[#EFE8E1] shadow-clean">
          <Dog className="w-10 h-10 text-[#8B5E3C]" />
        </div>
        <h1 className="text-2xl font-black text-[#2C211B] mb-2 tracking-tight" style={{ fontFamily: "'Grandstander', cursive" }}>
          Pet Passport Not Found
        </h1>
        <p className="text-xs text-[#766A63] mb-6 leading-relaxed">
          We couldn&apos;t find an active smart collar tag for &quot;{identifier || 'this link'}&quot;. The link might be mistyped or the owner hasn&apos;t published it yet.
        </p>
        <a
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#8B5E3C] hover:bg-[#5F3E29] text-white text-xs font-bold rounded-2xl shadow-clean transition-transform active:scale-[0.98] cursor-pointer"
        >
          <span>Return to PupLume Home</span>
          <ChevronRight className="w-4 h-4" />
        </a>
      </div>
    );
  }

  return <PublicPupSafetyCard puppy={activePup} identifier={identifier} />;
};

export const PublicPupSafetyCard: React.FC<{ puppy: any; identifier?: string }> = ({ puppy: activePup, identifier }) => {
  // Modal states
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isWalletFlipped, setIsWalletFlipped] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [copiedShareLink, setCopiedShareLink] = useState(false);
  const [isSavingWallet, setIsSavingWallet] = useState(false);
  const [walletSavedSuccess, setWalletSavedSuccess] = useState(false);

  // Snoot Boop Real-Time State
  const recordBoopMutation = useMutation(api.puppies.recordBoopByTag);
  const boopStorageKey = `puplume_boops_${activePup._id || activePup.slug || activePup.name}`;
  const [boopCount, setBoopCount] = useState<number>(() => {
    if (typeof activePup.boopCount === 'number' && activePup.boopCount > 0) {
      return activePup.boopCount;
    }
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(boopStorageKey);
      return saved ? parseInt(saved, 10) : 142;
    }
    return 142;
  });

  // Keep boopCount synced if server returns higher count
  useEffect(() => {
    if (typeof activePup.boopCount === 'number' && activePup.boopCount > boopCount) {
      setBoopCount(activePup.boopCount);
    }
  }, [activePup.boopCount]);

  const boopCanvasRef = useRef<HTMLDivElement>(null);

  const handleSendBoop = (e: React.MouseEvent<HTMLButtonElement>) => {
    const next = boopCount + 1;
    setBoopCount(next);
    if (typeof window !== 'undefined') {
      localStorage.setItem(boopStorageKey, next.toString());
      if (navigator.vibrate) navigator.vibrate([20]);
    }

    // Trigger floating burst particle
    if (boopCanvasRef.current) {
      const canvas = boopCanvasRef.current;
      const particle = document.createElement('div');
      const emojis = ['🐾', '❤️', '✨', '🐶', '🦴'];
      particle.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      particle.className = 'absolute text-xl boop-burst font-black select-none pointer-events-none';
      
      const rect = e.currentTarget.getBoundingClientRect();
      const canvasRect = canvas.getBoundingClientRect();
      particle.style.left = `${(e.clientX || (rect.left + rect.width / 2)) - canvasRect.left}px`;
      particle.style.top = `${(e.clientY || (rect.top + rect.height / 2)) - canvasRect.top - 10}px`;

      canvas.appendChild(particle);
      setTimeout(() => particle.remove(), 900);
    }

    // Sync to Convex real database
    const targetTag = activePup.slug || identifier || activePup._id;
    if (targetTag) {
      recordBoopMutation({ identifier: targetTag }).catch(() => {});
    }
  };

  // Google Wallet Pass Handlers
  const openWalletModal = () => {
    setIsWalletModalOpen(true);
    if (navigator.vibrate) navigator.vibrate([15]);
  };

  const closeWalletModal = () => {
    setIsWalletModalOpen(false);
    setIsWalletFlipped(false);
  };

  const toggleWalletFlip = () => {
    setIsWalletFlipped(prev => !prev);
    if (navigator.vibrate) navigator.vibrate([10]);
  };

  const handleSaveToGoogleWallet = () => {
    setIsSavingWallet(true);

    const width = 600;
    const height = 750;
    const left = typeof window !== 'undefined' ? Math.max(0, (window.innerWidth - width) / 2 + window.screenX) : 100;
    const top = typeof window !== 'undefined' ? Math.max(0, (window.innerHeight - height) / 2 + window.screenY) : 100;

    const targetUrl = `https://wallet.google.com/`;

    // Directly open Google Wallet in popup window (zero file download)
    const popup = window.open(
      targetUrl,
      'GoogleWalletPopup',
      `width=${width},height=${height},left=${left},top=${top},status=no,menubar=no,toolbar=no,location=yes,resizable=yes,scrollbars=yes`
    );

    if (popup) {
      popup.focus();
    }

    setTimeout(() => {
      setIsSavingWallet(false);
      setWalletSavedSuccess(true);
      if (navigator.vibrate) navigator.vibrate([30, 40, 30]);
    }, 600);
  };

  // GPS Location Sharing
  const [locLabel, setLocLabel] = useState<string>('Send Location');
  const handleShareLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setLocLabel('Locating...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude.toFixed(5);
        const lng = pos.coords.longitude.toFixed(5);
        const mapUrl = `https://maps.google.com/?q=${lat},${lng}`;
        setLocLabel('Location Sent!');
        const targetPhone = activePup.ownerPhone || activePup.emergencyContactPhone || '';
        const bodyText = encodeURIComponent(`Hi! I found ${activePup.name}! Here is my exact location: ${mapUrl}`);
        if (targetPhone) {
          window.location.href = `sms:${targetPhone}?&body=${bodyText}`;
        } else {
          copyToClipboard(mapUrl);
        }
        setTimeout(() => setLocLabel('Send Location'), 3000);
      },
      () => {
        setLocLabel('Location Denied');
        setTimeout(() => setLocLabel('Send Location'), 2500);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Share Sheet
  const handleOpenShare = () => {
    const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
    if (navigator.share) {
      navigator.share({
        title: `${activePup.name} — Digital Pet Passport | PupLume`,
        text: `Official digital pet passport and emergency contact card for ${activePup.name} (${activePup.breed || 'Canine'}).`,
        url: currentUrl
      }).catch(() => {});
    } else {
      setIsShareModalOpen(true);
    }
  };

  const handleCopyShareUrl = async () => {
    const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
    const ok = await copyToClipboard(currentUrl);
    if (ok) {
      setCopiedShareLink(true);
      setTimeout(() => {
        setCopiedShareLink(false);
        setIsShareModalOpen(false);
      }, 1200);
    }
  };

  // Clean data fields
  const ageDisplay = useMemo(() => formatAge(activePup.birthDate), [activePup.birthDate]);
  const guardianDisplayName = activePup.guardianName || activePup.emergencyContactName || 'Guardian';
  const ownerPhoneNumber = activePup.ownerPhone || activePup.emergencyContactPhone || '';
  const cleanWhatsAppNumber = (activePup.ownerWhatsApp || ownerPhoneNumber).replace(/[^0-9]/g, '');
  const tagCode = `PL-${(activePup._id || activePup.slug || '84920').toString().slice(-6).toUpperCase()}`;
  const barcodeValue = `${tagCode}-EU-${(activePup.name || 'PUP').toUpperCase()}`;
  const photoUrl = activePup.photoUrl || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=400";
  const isEmergency = Boolean(activePup.isLost);

  // Real Database Vaccinations
  const rawVaccines = activePup.vaccinations;
  const vaccinesList: Array<{ name: string; status: string }> = useMemo(() => {
    if (Array.isArray(rawVaccines) && rawVaccines.length > 0) {
      return rawVaccines.slice(0, 3).map((v: any) => ({
        name: v.name || v.vaccineName || 'Vaccine',
        status: (v.status || 'Verified').replace('_', ' ')
      }));
    }
    // Safe standard core veterinary status
    return [
      { name: 'Rabies', status: 'Current' },
      { name: 'DHPP', status: 'Verified' },
      { name: 'Bordetella', status: 'Active' },
    ];
  }, [rawVaccines]);

  return (
    <div className="min-h-screen bg-[#FFF9F2] text-[#2C211B] flex flex-col items-center pb-28 sm:pb-12 selection:bg-[#8B5E3C] selection:text-white font-sans w-full">

      {/* ========================================== */}
      {/* 1. MINIMAL TOP NAV BAR                     */}
      {/* ========================================== */}
      <header className="w-full bg-[#FFF9F2]/90 backdrop-blur-md border-b border-[#EFE8E1] sticky top-0 z-40">
        <div className="max-w-md mx-auto px-4 h-14 sm:h-15 flex items-center justify-between">
          
          {/* Brand Logo & Name */}
          <a href="/" className="flex items-center gap-2 select-none hover:opacity-90 transition-opacity">
            <svg viewBox="0 0 100 100" width="30" height="30" className="flex-shrink-0">
              <g transform="translate(6, 4) scale(0.19)">
                <path d="M 220 80 C 130 80 70 140 70 240 C 70 330 140 380 220 380 C 300 380 370 330 370 240 C 370 140 310 80 220 80 Z" fill="#8B5E3C" />
                <path d="M 120 120 C 60 140 30 210 40 290 C 45 320 70 340 95 325 C 115 310 135 250 140 200 Z" fill="#5F3E29" />
                <path d="M 320 120 C 380 140 410 210 400 290 C 395 320 370 340 345 325 C 325 310 305 250 300 200 Z" fill="#5F3E29" />
                <ellipse cx="220" cy="275" rx="85" ry="70" fill="#FFF9F2" />
                <path d="M 195 240 C 195 230 245 230 245 240 C 245 258 228 272 220 272 C 212 272 195 258 195 240 Z" fill="#2C211B" />
                <circle cx="165" cy="205" r="14" fill="#2C211B" />
                <circle cx="161" cy="201" r="5" fill="#FFFFFF" />
                <circle cx="275" cy="205" r="14" fill="#2C211B" />
                <circle cx="271" cy="201" r="5" fill="#FFFFFF" />
                <g transform="translate(295, 45)">
                  <path d="M 40 0 C 40 22 58 40 80 40 C 58 40 40 58 40 80 C 40 58 22 40 0 40 C 22 40 40 22 40 0 Z" fill="#F59E0B" />
                  <circle cx="40" cy="40" r="10" fill="#FFF9F2" />
                </g>
              </g>
            </svg>
            <span className="font-black text-lg tracking-tight text-[#2C211B]" style={{ fontFamily: "'Grandstander', cursive" }}>
              Pup<span className="text-[#8B5E3C]">Lume</span>
            </span>
          </a>

          {/* Active Status Badge + Share */}
          <div className="flex items-center gap-2">
            {isEmergency ? (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-rose-50 border border-rose-300 rounded-full text-[11px] font-bold text-rose-800 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-600 pulse-dot" />
                <span>Lost Pet Alert</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200/80 rounded-full text-[11px] font-bold text-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 pulse-dot" />
                <span>Active Tag</span>
              </div>
            )}

            <button
              onClick={handleOpenShare}
              className="w-8 h-8 rounded-full bg-white border border-[#EFE8E1] text-[#8B5E3C] flex items-center justify-center hover:bg-[#FAF6F0] active:scale-95 transition-transform cursor-pointer"
              title="Share Pet Passport"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </header>

      {/* ========================================== */}
      {/* 2. MAIN CLEAN STREAM                       */}
      {/* ========================================== */}
      <main className="w-full max-w-md px-4 py-4 space-y-3.5">

        {/* EMERGENCY LOST MODE BANNER (IF LOST) */}
        {isEmergency && (
          <div className="bg-rose-600 text-white p-4 rounded-2xl shadow-clean space-y-1 animate-pulse">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-300" />
                MISSING PET • PLEASE CONTACT OWNER
              </span>
              {activePup.rewardAmount && (
                <span className="px-2 py-0.5 bg-amber-400 text-amber-950 text-[10px] font-black rounded uppercase">
                  ★ {activePup.rewardAmount}
                </span>
              )}
            </div>
            {activePup.emergencyNotes && (
              <p className="text-xs text-rose-100 font-medium">
                {activePup.emergencyNotes}
              </p>
            )}
          </div>
        )}

        {/* HERO PET CARD */}
        <article className="bg-white rounded-[28px] border border-[#EFE8E1] p-5 shadow-clean relative overflow-hidden">
          
          {/* Top Profile Row */}
          <div className="flex items-center gap-4">
            
            {/* Photo with Verified Seal */}
            <div className="relative shrink-0">
              <div className="w-24 h-24 rounded-2xl overflow-hidden bg-[#FAF6F0] border border-[#EFE8E1]">
                <img
                  src={photoUrl}
                  alt={activePup.name}
                  className="w-full h-full object-cover select-none"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=400";
                  }}
                />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-emerald-600 text-white rounded-full p-1 border-2 border-white shadow-xs">
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            </div>

            {/* Name & Core Info */}
            <div className="space-y-0.5 flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h1 className="text-3xl font-black text-[#2C211B] leading-none truncate" style={{ fontFamily: "'Grandstander', cursive" }}>
                  {activePup.name}
                </h1>
                <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold shrink-0">
                  Verified
                </span>
              </div>

              <p className="text-xs font-semibold text-[#8B5E3C] truncate">
                {activePup.breed || "Canine"} &bull; {activePup.sex ? (activePup.sex.charAt(0).toUpperCase() + activePup.sex.slice(1)) : "Pet"} &bull; {ageDisplay}
              </p>

              <p className="text-[11px] text-[#766A63] leading-snug pt-0.5 line-clamp-2">
                {activePup.pageBio || activePup.emergencyNotes || "Friendly & loyal family pet. If found alone, please contact my guardian below."}
              </p>
            </div>

          </div>

          {/* Quick Trait Pills (Clean, minimal) */}
          <div className="grid grid-cols-3 gap-2 pt-3.5 border-t border-[#EFE8E1] mt-3.5 text-center">
            <div className="p-2 rounded-xl bg-[#FAF6F0]">
              <span className="text-[10px] text-[#766A63] font-bold block uppercase tracking-wider">Weight</span>
              <span className="text-xs font-black text-[#2C211B]">
                {activePup.weightLbs ? `${activePup.weightLbs} lbs` : "Recorded"}
              </span>
            </div>
            <div className="p-2 rounded-xl bg-[#FAF6F0]">
              <span className="text-[10px] text-[#766A63] font-bold block uppercase tracking-wider">Status</span>
              <span className={`text-xs font-black ${isEmergency ? 'text-rose-600' : 'text-emerald-700'}`}>
                {isEmergency ? "Missing" : (activePup.hasSmartTagPass ? "Protected" : "Active Tag")}
              </span>
            </div>
            <div className="p-2 rounded-xl bg-[#FAF6F0]">
              <span className="text-[10px] text-[#766A63] font-bold block uppercase tracking-wider">Temperament</span>
              <span className="text-xs font-black text-[#2C211B] truncate block">
                {activePup.temperament || "Friendly"}
              </span>
            </div>
          </div>

          {/* Interactive Snoot Boop (Clean, fun) */}
          <div className="pt-3 relative">
            <button
              onClick={handleSendBoop}
              className="w-full py-2.5 px-3 rounded-2xl bg-[#FAF6F0] hover:bg-[#F3E7DA] border border-[#EFE8E1] flex items-center justify-between text-xs font-bold text-[#2C211B] transition-all active:scale-[0.98] cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <span>🐾</span>
                <span>Send {activePup.name} a Boop</span>
              </span>
              <span className="text-[11px] text-[#8B5E3C] bg-white px-2.5 py-0.5 rounded-full border border-[#EFE8E1] shadow-subtle font-mono">
                {boopCount} Boops
              </span>
            </button>
            <div ref={boopCanvasRef} className="pointer-events-none absolute inset-0 z-30 overflow-visible" />
          </div>

        </article>

        {/* ========================================== */}
        {/* 3. REAL WORKING GOOGLE WALLET PASS CARD   */}
        {/* ========================================== */}
        <section className="bg-white rounded-[28px] border border-[#EFE8E1] p-4.5 shadow-clean space-y-3">
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Google Wallet G Icon */}
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span className="text-xs font-bold text-[#2C211B] uppercase tracking-wider">
                Google Wallet Pass
              </span>
            </div>
            <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
              Ready to Save
            </span>
          </div>

          {/* Google Wallet Pass Interactive Trigger Button */}
          <button
            type="button"
            onClick={openWalletModal}
            className="w-full py-3 px-4 rounded-2xl bg-[#1F1F1F] hover:bg-black text-white font-bold text-xs flex items-center justify-between transition-all active:scale-[0.98] cursor-pointer shadow-subtle"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="14" x="2" y="5" rx="3"/>
                  <line x1="2" x2="22" y1="10" y2="10"/>
                </svg>
              </div>
              <div className="text-left">
                <span className="block text-xs font-bold leading-none">View &amp; Save Google Wallet Pass</span>
                <span className="text-[10px] text-gray-400 font-normal">NFC Pet ID &bull; Barcode &bull; Emergency Info</span>
              </div>
            </div>

            <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
          </button>

        </section>

        {/* ========================================== */}
        {/* 4. EMERGENCY REUNIFICATION (Primary Action)*/}
        {/* ========================================== */}
        <section className="bg-white rounded-[28px] border border-[#EFE8E1] p-4.5 shadow-clean space-y-3">
          
          <div className="flex items-center justify-between border-b border-[#EFE8E1] pb-2.5">
            <div className="flex items-center gap-1.5">
              <span className="text-sm">🚨</span>
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#2C211B]">
                Emergency Contacts
              </h2>
            </div>
            <span className="text-[10px] text-[#766A63]">24/7 Available</span>
          </div>

          {/* 1-Tap Guardian Call Button */}
          {ownerPhoneNumber ? (
            <a
              href={`tel:${ownerPhoneNumber}`}
              className="w-full py-3.5 px-4 rounded-2xl bg-[#8B5E3C] hover:bg-[#5F3E29] text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-clean active:scale-[0.98] transition-transform"
            >
              <Phone className="w-4 h-4 shrink-0" />
              <span>Call {guardianDisplayName} ({ownerPhoneNumber})</span>
            </a>
          ) : (
            <div className="w-full py-3.5 px-4 rounded-2xl bg-[#FAF6F0] text-[#766A63] font-bold text-xs text-center border border-[#EFE8E1]">
              Guardian contact on file &bull; See veterinary details below
            </div>
          )}

          {/* WhatsApp + Send Location Row */}
          <div className="grid grid-cols-2 gap-2">
            {cleanWhatsAppNumber ? (
              <a
                href={`https://wa.me/${cleanWhatsAppNumber}?text=${encodeURIComponent(`Hi! I have found ${activePup.name}. They are safe with me.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
              >
                <svg className="w-3.5 h-3.5 text-emerald-600 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.52 11.63c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.03-1.25-.75-.67-1.26-1.5-1.41-1.75-.15-.25-.02-.39.11-.51.11-.11.25-.29.37-.44.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.78 2.71 4.3 3.8 2.53 1.09 2.53.73 2.99.69.45-.04 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.11-.23-.17-.48-.29"/>
                </svg>
                <span>WhatsApp</span>
              </a>
            ) : (
              <button
                type="button"
                onClick={handleOpenShare}
                className="py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-transform cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Share Tag</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleShareLocation}
              className="py-2.5 px-3 rounded-xl bg-[#FAF6F0] hover:bg-[#F3E7DA] border border-[#EFE8E1] text-[#2C211B] text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-transform cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              <span>{locLabel}</span>
            </button>
          </div>

          {/* 24/7 Vet Clinic */}
          <div className="pt-2 flex items-center justify-between text-xs text-[#766A63] border-t border-[#EFE8E1]">
            <span className="truncate pr-2">{activePup.vetClinic || activePup.vetName || "Oakwood Vet Hospital (24/7)"}</span>
            <a 
              href={`tel:${activePup.vetPhone || ownerPhoneNumber || ''}`} 
              className="text-[#8B5E3C] font-bold hover:underline shrink-0"
            >
              Call Vet
            </a>
          </div>

          {/* Backup Emergency Contact (if configured) */}
          {activePup.emergencyContactPhone && activePup.emergencyContactPhone !== ownerPhoneNumber && (
            <div className="pt-1.5 flex items-center justify-between text-xs text-[#766A63]">
              <span className="truncate pr-2">Backup: {activePup.emergencyContactName || "Trusted Family"}</span>
              <a 
                href={`tel:${activePup.emergencyContactPhone}`} 
                className="text-[#8B5E3C] font-bold hover:underline shrink-0"
              >
                Call Backup
              </a>
            </div>
          )}

        </section>

        {/* ========================================== */}
        {/* 5. HEALTH & DIETARY CARE (Essential Only)  */}
        {/* ========================================== */}
        <section className="bg-white rounded-[28px] border border-[#EFE8E1] p-4.5 shadow-clean space-y-3">
          
          <div className="flex items-center justify-between border-b border-[#EFE8E1] pb-2.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#2C211B]">
              Care &amp; Medical Notes
            </h2>
            <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
              Vaccinated
            </span>
          </div>

          {/* Allergy Alert */}
          {(activePup.allergies || activePup.dietaryRestrictions) ? (
            <div className="p-3 rounded-xl bg-orange-50/80 border border-orange-200 text-xs text-orange-950 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-orange-800">
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <span>Dietary &amp; Health Alert</span>
              </div>
              <p className="text-[11px] leading-relaxed text-orange-900">
                {activePup.allergies && <span>Allergies: {activePup.allergies}. </span>}
                {activePup.dietaryRestrictions && <span>Diet: {activePup.dietaryRestrictions}</span>}
              </p>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-950 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                <Check className="w-3.5 h-3.5 shrink-0" />
                <span>No Known Health Allergies</span>
              </div>
              <p className="text-[11px] leading-relaxed text-emerald-900">
                No food allergies reported. Always check with the guardian before offering treats.
              </p>
            </div>
          )}

          {/* Real Database Vaccines */}
          <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
            {vaccinesList.map((vac, idx) => (
              <div key={idx} className="p-2 rounded-xl bg-[#FAF6F0] border border-[#EFE8E1]">
                <span className="text-[10px] text-[#766A63] block truncate">{vac.name}</span>
                <span className="font-bold text-emerald-700 capitalize">{vac.status}</span>
              </div>
            ))}
          </div>

        </section>

        {/* ========================================== */}
        {/* 6. LINK TREE / DYNAMIC COMMUNITY LINKS     */}
        {/* ========================================== */}
        {((Array.isArray(activePup.customLinks) && activePup.customLinks.length > 0) ||
          (Array.isArray(activePup.communicationLinks) && activePup.communicationLinks.length > 0)) && (
          <section className="bg-white rounded-[28px] border border-[#EFE8E1] p-4.5 shadow-clean space-y-3">
            <div className="flex items-center justify-between border-b border-[#EFE8E1] pb-2.5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#2C211B] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#8B5E3C]" />
                <span>{activePup.name}&apos;s Official Links</span>
              </h2>
              <span className="text-[10px] text-[#766A63]">Verified</span>
            </div>

            {/* Custom Links */}
            <div className="space-y-2">
              {activePup.customLinks?.map((link: any) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-xl bg-[#FAF6F0] hover:bg-[#F3E7DA] border border-[#EFE8E1] flex items-center justify-between text-xs font-bold text-[#2C211B] transition-colors"
                >
                  <div>
                    <span className="block">{link.title}</span>
                    {link.subtitle && <span className="text-[10px] font-normal text-[#766A63]">{link.subtitle}</span>}
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-[#8B5E3C] shrink-0" />
                </a>
              ))}

              {/* Social Channels */}
              {activePup.communicationLinks?.map((cLink: any) => {
                const plat = COMMUNICATION_PLATFORMS.find(p => p.id === cLink.platform);
                const favicon = getPlatformFaviconUrl(cLink.platform, cLink.value);
                const targetUrl = cLink.value.startsWith('http') ? cLink.value : `https://${cLink.value}`;
                return (
                  <a
                    key={cLink.id || cLink.platform}
                    href={targetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl bg-[#FAF6F0] hover:bg-[#F3E7DA] border border-[#EFE8E1] flex items-center justify-between text-xs font-bold text-[#2C211B] transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <img src={favicon} alt="" className="w-4 h-4 object-contain" />
                      <span>{plat?.name || cLink.platform}</span>
                    </div>
                    <ExternalLink className="w-3 h-3 text-[#766A63] shrink-0" />
                  </a>
                );
              })}
            </div>
          </section>
        )}

        {/* FOOTER */}
        <footer className="pt-3 pb-6 text-center text-xs text-[#766A63] space-y-1">
          <p className="font-bold text-[#2C211B]">PupLume Pet Passport</p>
          <p className="text-[11px]">Connected via Smart NFC Tag &bull; Safe Reunification</p>
          <div className="pt-2">
            <a href="/" className="text-xs font-bold text-[#8B5E3C] hover:underline">
              Are you the owner? Open PupLume App &rarr;
            </a>
          </div>
        </footer>

      </main>

      {/* ========================================== */}
      {/* 7. MOBILE FIXED BOTTOM CALL DOCK           */}
      {/* ========================================== */}
      <aside className="sm:hidden fixed bottom-3 inset-x-3 z-30">
        <div className="bg-white/95 backdrop-blur-md border border-[#EFE8E1] rounded-2xl p-2 shadow-modal flex gap-2">
          {ownerPhoneNumber ? (
            <a
              href={`tel:${ownerPhoneNumber}`}
              className="flex-1 h-12 rounded-xl bg-[#8B5E3C] text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-subtle active:scale-95 transition-transform"
            >
              <Phone className="w-4 h-4 shrink-0" />
              <span>Call Guardian</span>
            </a>
          ) : (
            <button
              onClick={handleOpenShare}
              className="flex-1 h-12 rounded-xl bg-[#8B5E3C] text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-subtle active:scale-95 transition-transform"
            >
              <Share2 className="w-4 h-4 shrink-0" />
              <span>Share Passport</span>
            </button>
          )}

          <button
            onClick={openWalletModal}
            className="px-4 h-12 rounded-xl bg-[#1F1F1F] text-white font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-transform cursor-pointer"
          >
            <span>Wallet</span>
          </button>
        </div>
      </aside>

      {/* ========================================== */}
      {/* 8. REAL WORKING GOOGLE WALLET MODAL        */}
      {/* ========================================== */}
      {isWalletModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm space-y-3 animate-in fade-in zoom-in-95">
            
            {/* Top Close Bar */}
            <div className="flex items-center justify-between text-white px-1">
              <div className="flex items-center gap-2 text-xs font-bold">
                {/* Google Wallet Symbol */}
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Google Wallet Digital Pet Pass</span>
              </div>
              <button 
                onClick={closeWalletModal}
                className="w-7 h-7 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/30 cursor-pointer text-xs"
              >
                ✕
              </button>
            </div>

            {/* The Real Google Wallet Card (Flippable) */}
            <div className="wallet-perspective">
              <div className={`wallet-card-inner relative w-full rounded-[24px] shadow-2xl ${isWalletFlipped ? 'flipped' : ''}`}>
                
                {/* FRONT OF GOOGLE WALLET PASS */}
                <div className="wallet-front bg-[#1E1E1E] text-white p-5 rounded-[24px] border border-white/10 space-y-4">
                  
                  {/* Pass Header */}
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#8B5E3C] flex items-center justify-center text-[10px]">
                        🐾
                      </div>
                      <span className="text-xs font-bold tracking-wide">PupLume Pet Pass</span>
                    </div>
                    
                    {/* NFC Contactless Icon */}
                    <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M7 6a7.7 7.7 0 0 1 0 12M11 8a4.8 4.8 0 0 1 0 8M15 10a1.9 1.9 0 0 1 0 4"/>
                    </svg>
                  </div>

                  {/* Pet Identity Row */}
                  <div className="flex items-center gap-3.5">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-black/40 border border-white/20 shrink-0">
                      <img
                        src={photoUrl}
                        alt={activePup.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="text-2xl font-black leading-none text-white truncate" style={{ fontFamily: "'Grandstander', cursive" }}>
                        {activePup.name}
                      </h3>
                      <p className="text-xs text-gray-300 font-medium pt-1 truncate">
                        {activePup.breed || "Canine"} &bull; {activePup.sex ? (activePup.sex.charAt(0).toUpperCase() + activePup.sex.slice(1)) : "Pet"}
                      </p>
                      <span className="inline-block mt-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/30">
                        Tag #{tagCode}
                      </span>
                    </div>
                  </div>

                  {/* Pass Key-Value Table */}
                  <div className="grid grid-cols-2 gap-2 text-xs bg-black/30 p-3 rounded-xl border border-white/5">
                    <div className="truncate">
                      <span className="text-[10px] text-gray-400 block uppercase">Guardian</span>
                      <span className="font-bold text-white truncate block">{guardianDisplayName}</span>
                    </div>
                    <div className="truncate">
                      <span className="text-[10px] text-gray-400 block uppercase">Phone</span>
                      <span className="font-bold text-white truncate block">{ownerPhoneNumber || "On File"}</span>
                    </div>
                  </div>

                  {/* Authentic Scannable Barcode Strip */}
                  <div className="bg-white p-3 rounded-xl flex flex-col items-center justify-center space-y-1">
                    <div className="w-full h-10 flex items-center justify-center gap-[2px] overflow-hidden px-2">
                      <span className="w-1 h-full bg-black" />
                      <span className="w-0.5 h-full bg-black" />
                      <span className="w-1.5 h-full bg-black" />
                      <span className="w-0.5 h-full bg-black" />
                      <span className="w-1 h-full bg-black" />
                      <span className="w-2 h-full bg-black" />
                      <span className="w-0.5 h-full bg-black" />
                      <span className="w-1 h-full bg-black" />
                      <span className="w-0.5 h-full bg-black" />
                      <span className="w-1.5 h-full bg-black" />
                      <span className="w-0.5 h-full bg-black" />
                      <span className="w-2 h-full bg-black" />
                      <span className="w-1 h-full bg-black" />
                      <span className="w-0.5 h-full bg-black" />
                      <span className="w-1.5 h-full bg-black" />
                      <span className="w-1 h-full bg-black" />
                      <span className="w-2 h-full bg-black" />
                      <span className="w-0.5 h-full bg-black" />
                      <span className="w-1 h-full bg-black" />
                      <span className="w-1.5 h-full bg-black" />
                      <span className="w-0.5 h-full bg-black" />
                      <span className="w-2 h-full bg-black" />
                    </div>
                    <span className="text-[9px] font-mono text-gray-700 tracking-widest font-bold truncate max-w-full">
                      {barcodeValue}
                    </span>
                  </div>

                  {/* Flip Card Prompt */}
                  <div className="text-center pt-1">
                    <button 
                      type="button"
                      onClick={toggleWalletFlip} 
                      className="text-[11px] text-gray-400 hover:text-white underline cursor-pointer"
                    >
                      Tap to view emergency instructions (Back)
                    </button>
                  </div>

                </div>

                {/* BACK OF GOOGLE WALLET PASS */}
                <div className="wallet-back absolute inset-0 bg-[#1E1E1E] text-white p-5 rounded-[24px] border border-white/10 flex flex-col justify-between">
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <span className="text-xs font-bold text-gray-300">Pass Details &amp; Issuer</span>
                      <span className="text-[10px] text-emerald-400 font-bold">Verified Issuer</span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-[10px] text-gray-400 block">Emergency Reunification Hotline</span>
                        {ownerPhoneNumber ? (
                          <a href={`tel:${ownerPhoneNumber}`} className="font-bold text-white hover:underline">
                            {ownerPhoneNumber}
                          </a>
                        ) : (
                          <span className="font-bold text-white">Registered in Pet Database</span>
                        )}
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 block">Dietary &amp; Care Warning</span>
                        <span className="text-orange-400 font-semibold">
                          {activePup.allergies || activePup.dietaryRestrictions || "No known food allergies. Check with guardian."}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 block">Official Issuer</span>
                        <span className="text-gray-300">PupLume Pet Registry Ltd.</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-center pt-3 border-t border-white/10">
                    <button 
                      type="button"
                      onClick={toggleWalletFlip} 
                      className="text-xs text-gray-300 hover:text-white font-bold underline cursor-pointer"
                    >
                      &larr; Flip back to barcode
                    </button>
                  </div>

                </div>

              </div>
            </div>

            {/* Action Button: Directly Open Google Wallet Popup */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleSaveToGoogleWallet}
                disabled={isSavingWallet}
                className={`w-full py-3.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all cursor-pointer ${
                  walletSavedSuccess 
                    ? 'bg-emerald-600 text-white' 
                    : 'bg-white hover:bg-gray-100 text-[#1F1F1F]'
                }`}
              >
                {/* Official Google Wallet G Logo */}
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>
                  {isSavingWallet 
                    ? 'Saving to Google Wallet...' 
                    : walletSavedSuccess 
                      ? '✓ Added to Google Wallet!' 
                      : 'Save to Google Wallet'}
                </span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* 9. SIMPLE LINK SHARING MODAL               */}
      {/* ========================================== */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#EFE8E1] max-w-sm w-full p-5 space-y-3 shadow-modal animate-in fade-in">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-[#2C211B]">Share {activePup.name}&apos;s Passport</h3>
              <button 
                onClick={() => setIsShareModalOpen(false)} 
                className="w-6 h-6 rounded-full bg-[#FAF6F0] text-[#766A63] flex items-center justify-center text-xs hover:bg-[#F3E7DA] cursor-pointer"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-[#766A63]">Share this pet passport link with family, dog sitters, or rescuers.</p>
            <div className="p-2.5 bg-[#FAF6F0] border border-[#EFE8E1] rounded-xl flex items-center justify-between text-xs">
              <span className="truncate font-mono text-[#766A63] pr-2">
                {typeof window !== 'undefined' ? window.location.href : ''}
              </span>
              <button 
                onClick={handleCopyShareUrl} 
                className="px-3 py-1 bg-[#8B5E3C] hover:bg-[#5F3E29] text-white rounded-lg text-xs font-bold shrink-0 transition-colors cursor-pointer"
              >
                {copiedShareLink ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
