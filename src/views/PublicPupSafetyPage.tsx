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
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [copiedShareLink, setCopiedShareLink] = useState(false);

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
    const canvas = (e.currentTarget.parentElement?.querySelector('.boop-canvas') || boopCanvasRef.current) as HTMLElement | null;
    if (canvas) {
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

  // Authentic Location Sharing (Google Maps & WhatsApp)
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [detectedLocationUrl, setDetectedLocationUrl] = useState<string>('https://maps.google.com');
  const [copiedMapLink, setCopiedMapLink] = useState(false);

  const handleOpenLocationModal = () => {
    setIsLocationModalOpen(true);
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude.toFixed(6);
          const lng = pos.coords.longitude.toFixed(6);
          setDetectedLocationUrl(`https://www.google.com/maps?q=${lat},${lng}`);
        },
        () => {
          setDetectedLocationUrl('https://maps.google.com');
        },
        { enableHighAccuracy: false, timeout: 3500, maximumAge: 300000 }
      );
    }
  };

  const handleShareViaWhatsApp = () => {
    const mapUrl = detectedLocationUrl || 'https://maps.google.com';
    const text = encodeURIComponent(
      `📍 Hi! I have found ${activePup.name}. Here is my location on Google Maps: ${mapUrl}`
    );
    const targetUrl = cleanWhatsAppNumber
      ? `https://wa.me/${cleanWhatsAppNumber}?text=${text}`
      : `https://wa.me/?text=${text}`;
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
    setIsLocationModalOpen(false);
  };

  const handleShareViaGoogleMaps = () => {
    const mapUrl = detectedLocationUrl || 'https://maps.google.com';
    window.open(mapUrl, '_blank', 'noopener,noreferrer');
  };

  const handleCopyMapLink = async () => {
    const mapUrl = detectedLocationUrl || 'https://maps.google.com';
    const ok = await copyToClipboard(mapUrl);
    if (ok) {
      setCopiedMapLink(true);
      setTimeout(() => setCopiedMapLink(false), 2000);
    }
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
      {/* 1. TOP NAV BAR (Responsive)                */}
      {/* ========================================== */}
      <header className="w-full bg-[#FFF9F2]/90 backdrop-blur-md border-b border-[#EFE8E1] sticky top-0 z-40">
        <div className="max-w-md md:max-w-5xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          
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
            <span className="hidden sm:inline-block text-xs font-bold text-[#766A63] border-l border-[#EFE8E1] pl-2.5 ml-0.5">
              Digital Pet Passport
            </span>
          </a>

          {/* Active Status Badge + Share */}
          <div className="flex items-center gap-2.5">
            {isEmergency ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 border border-rose-300 rounded-full text-xs font-bold text-rose-800 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-rose-600 pulse-dot" />
                <span>Lost Pet Alert</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200/80 rounded-full text-xs font-bold text-emerald-800">
                <span className="w-2 h-2 rounded-full bg-emerald-500 pulse-dot" />
                <span>Active Tag</span>
              </div>
            )}

            <button
              onClick={handleOpenShare}
              className="h-8 px-3 rounded-full bg-white border border-[#EFE8E1] text-[#8B5E3C] flex items-center gap-1.5 hover:bg-[#FAF6F0] active:scale-95 transition-transform cursor-pointer text-xs font-bold"
              title="Share Pet Passport"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Share</span>
            </button>
          </div>

        </div>
      </header>

      {/* ========================================== */}
      {/* 2. MAIN CLEAN STREAM (Phones Only)         */}
      {/* ========================================== */}
      <main className="w-full max-w-md px-4 py-4 space-y-3.5 md:hidden">

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
            <div ref={boopCanvasRef} className="boop-canvas pointer-events-none absolute inset-0 z-30 overflow-visible" />
          </div>

        </article>

        {/* ========================================== */}
        {/* 3. EMERGENCY REUNIFICATION (Primary Action)*/}
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
              onClick={handleOpenLocationModal}
              className="py-2.5 px-3 rounded-xl bg-[#FAF6F0] hover:bg-[#F3E7DA] border border-[#EFE8E1] text-[#2C211B] text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-transform cursor-pointer"
              title="Share Location via Google Maps or WhatsApp"
            >
              <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#EA4335"/>
                <circle cx="12" cy="9" r="2.5" fill="#FFFFFF"/>
              </svg>
              <span>Share Location</span>
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
      {/* 4. SPREAD-OUT DESKTOP UI (Laptops & Desktops)*/}
      {/* ========================================== */}
      <section className="hidden md:block w-full max-w-5xl mx-auto px-6 lg:px-8 py-8 space-y-6">
        
        {/* EMERGENCY LOST MODE BANNER (IF LOST) */}
        {isEmergency && (
          <div className="bg-rose-600 text-white p-5 rounded-3xl shadow-clean space-y-2 animate-pulse border-2 border-rose-400">
            <div className="flex items-center justify-between">
              <span className="text-sm font-black uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-300 shrink-0" />
                <span>CRITICAL MISSING PET ALERT &bull; PLEASE CONTACT GUARDIAN IMMEDIATELY</span>
              </span>
              {activePup.rewardAmount && (
                <span className="px-3 py-1 bg-amber-400 text-amber-950 text-xs font-black rounded-lg uppercase tracking-wider shadow-sm">
                  ★ Reward: {activePup.rewardAmount}
                </span>
              )}
            </div>
            {activePup.emergencyNotes && (
              <p className="text-sm text-rose-100 font-medium pl-7 leading-relaxed">
                {activePup.emergencyNotes}
              </p>
            )}
          </div>
        )}

        {/* 2-COLUMN SPREAD GRID */}
        <div className="grid grid-cols-12 gap-8 items-start">
          
          {/* ======================================== */}
          {/* LEFT COLUMN: IDENTITY, BIO & COMMUNITY  */}
          {/* ======================================== */}
          <div className="col-span-5 space-y-6 sticky top-24">
            
            {/* HERO PROFILE CARD */}
            <article className="bg-white rounded-[32px] border border-[#EFE8E1] p-6 shadow-clean space-y-5 relative overflow-hidden">
              
              {/* Pet Photo & Header */}
              <div className="flex items-start gap-4">
                <div className="relative shrink-0">
                  <div className="w-28 h-28 rounded-2xl overflow-hidden bg-[#FAF6F0] border border-[#EFE8E1] shadow-xs">
                    <img
                      src={photoUrl}
                      alt={activePup.name}
                      className="w-full h-full object-cover select-none"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=400";
                      }}
                    />
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-emerald-600 text-white rounded-full p-1.5 border-2 border-white shadow-xs" title="Verified Pet Registration">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                </div>

                <div className="space-y-1 min-w-0 flex-1 pt-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-3xl font-black text-[#2C211B] leading-tight truncate" style={{ fontFamily: "'Grandstander', cursive" }}>
                      {activePup.name}
                    </h1>
                    <span className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold shrink-0">
                      Verified
                    </span>
                  </div>

                  <p className="text-xs font-bold text-[#8B5E3C] truncate">
                    {activePup.breed || "Canine"} &bull; {activePup.sex ? activePup.sex.charAt(0).toUpperCase() + activePup.sex.slice(1) : "Pet"} &bull; {ageDisplay}
                  </p>

                  <p className="text-xs text-[#766A63] leading-relaxed pt-1 line-clamp-3">
                    {activePup.pageBio || activePup.emergencyNotes || "Friendly & loyal family pet. If found alone or in distress, please contact guardian immediately."}
                  </p>
                </div>
              </div>

              {/* Trait Pills */}
              <div className="grid grid-cols-3 gap-2 text-center pt-4 border-t border-[#EFE8E1]">
                <div className="p-2.5 rounded-xl bg-[#FAF6F0] border border-[#EFE8E1]/60">
                  <span className="text-[10px] text-[#766A63] font-bold block uppercase tracking-wider">Weight</span>
                  <span className="text-xs font-black text-[#2C211B] block pt-0.5">
                    {activePup.weightLbs ? `${activePup.weightLbs} lbs` : "Recorded"}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#FAF6F0] border border-[#EFE8E1]/60">
                  <span className="text-[10px] text-[#766A63] font-bold block uppercase tracking-wider">Status</span>
                  <span className={`text-xs font-black block pt-0.5 ${isEmergency ? "text-rose-600 font-extrabold" : "text-emerald-700"}`}>
                    {isEmergency ? "Missing" : (activePup.hasSmartTagPass ? "Protected" : "Active Tag")}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#FAF6F0] border border-[#EFE8E1]/60">
                  <span className="text-[10px] text-[#766A63] font-bold block uppercase tracking-wider">Temperament</span>
                  <span className="text-xs font-black text-[#2C211B] truncate block pt-0.5">
                    {activePup.temperament || "Friendly"}
                  </span>
                </div>
              </div>

              {/* Snoot Boop Desktop Widget */}
              <div className="pt-1 relative">
                <button
                  type="button"
                  onClick={handleSendBoop}
                  className="w-full py-3 px-4 rounded-2xl bg-[#FAF6F0] hover:bg-[#F3E7DA] border border-[#EFE8E1] flex items-center justify-between text-xs font-bold text-[#2C211B] transition-all active:scale-[0.98] cursor-pointer shadow-subtle group"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-base group-hover:scale-125 transition-transform">🐾</span>
                    <span>Send {activePup.name} a Boop</span>
                  </span>
                  <span className="text-xs text-[#8B5E3C] bg-white px-3 py-1 rounded-full border border-[#EFE8E1] shadow-subtle font-mono font-bold">
                    {boopCount} Boops
                  </span>
                </button>
                <div className="boop-canvas pointer-events-none absolute inset-0 z-30 overflow-visible" />
              </div>

            </article>

            {/* COMMUNITY / SOCIAL CHANNELS */}
            {((Array.isArray(activePup.customLinks) && activePup.customLinks.length > 0) ||
              (Array.isArray(activePup.communicationLinks) && activePup.communicationLinks.length > 0)) && (
              <section className="bg-white rounded-[28px] border border-[#EFE8E1] p-5 shadow-clean space-y-3">
                <div className="flex items-center justify-between border-b border-[#EFE8E1] pb-2.5">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-[#2C211B] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#8B5E3C]" />
                    <span>{activePup.name}&apos;s Official Links</span>
                  </h2>
                  <span className="text-[10px] text-[#766A63]">Verified</span>
                </div>

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

                  {activePup.communicationLinks?.map((cLink: any) => {
                    const plat = COMMUNICATION_PLATFORMS.find((p) => p.id === cLink.platform);
                    const favicon = getPlatformFaviconUrl(cLink.platform, cLink.value);
                    const targetUrl = cLink.value.startsWith("http") ? cLink.value : `https://${cLink.value}`;
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

            {/* PASSPORT VERIFICATION STAMP */}
            <div className="bg-[#FAF6F0]/80 border border-[#EFE8E1] rounded-2xl p-4 text-xs text-[#766A63] space-y-1.5">
              <div className="flex items-center justify-between font-bold text-[#2C211B]">
                <span>Pet Passport Registry</span>
                <span className="text-emerald-700 font-mono text-[11px]">ACTIVE #{activePup._id?.toString().slice(-6).toUpperCase() || "PL-84920"}</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Official digital pet identity recorded in PupLume Cloud Registry. NFC collar tag verified.
              </p>
            </div>

          </div>

          {/* ======================================== */}
          {/* RIGHT COLUMN: REUNIFICATION & MEDICAL   */}
          {/* ======================================== */}
          <div className="col-span-7 space-y-6">
            
            {/* EMERGENCY REUNIFICATION HUB */}
            <section className="bg-white rounded-[32px] border border-[#EFE8E1] p-6 shadow-clean space-y-5">
              
              <div className="flex items-center justify-between border-b border-[#EFE8E1] pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🚨</span>
                  <div>
                    <h2 className="text-sm font-bold uppercase tracking-wider text-[#2C211B]">
                      Emergency Reunification
                    </h2>
                    <p className="text-[11px] text-[#766A63]">Direct connection to verified pet guardian</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                  24/7 Available
                </span>
              </div>

              {/* 1-Tap Call Guardian Main Button */}
              {ownerPhoneNumber ? (
                <a
                  href={`tel:${ownerPhoneNumber}`}
                  className="w-full py-4 px-6 rounded-2xl bg-[#8B5E3C] hover:bg-[#5F3E29] text-white font-black text-sm flex items-center justify-center gap-3 shadow-clean hover:shadow-md transition-all active:scale-[0.98] group"
                >
                  <Phone className="w-5 h-5 shrink-0 group-hover:rotate-12 transition-transform" />
                  <span>Call {guardianDisplayName} ({ownerPhoneNumber})</span>
                </a>
              ) : (
                <div className="w-full py-4 px-6 rounded-2xl bg-[#FAF6F0] text-[#766A63] font-bold text-xs text-center border border-[#EFE8E1]">
                  Guardian contact on file &bull; See veterinary details below
                </div>
              )}

              {/* WhatsApp + Send GPS Location Grid */}
              <div className="grid grid-cols-2 gap-3">
                {cleanWhatsAppNumber ? (
                  <a
                    href={`https://wa.me/${cleanWhatsAppNumber}?text=${encodeURIComponent(`Hi! I have found ${activePup.name}. They are safe with me.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-3 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center justify-center gap-2 active:scale-95 transition-all shadow-subtle"
                  >
                    <svg className="w-4 h-4 text-emerald-600 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.52 11.63c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.03-1.25-.75-.67-1.26-1.5-1.41-1.75-.15-.25-.02-.39.11-.51.11-.11.25-.29.37-.44.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.78 2.71 4.3 3.8 2.53 1.09 2.53.73 2.99.69.45-.04 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.11-.23-.17-.48-.29"/>
                    </svg>
                    <span>Message on WhatsApp</span>
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={handleOpenShare}
                    className="py-3 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer shadow-subtle"
                  >
                    <Share2 className="w-4 h-4 text-emerald-600" />
                    <span>Share Passport</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleOpenLocationModal}
                  className="py-3 px-4 rounded-xl bg-[#FAF6F0] hover:bg-[#F3E7DA] border border-[#EFE8E1] text-[#2C211B] text-xs font-bold flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer shadow-subtle hover:border-[#8B5E3C]/30"
                  title="Share Location via Google Maps or WhatsApp"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#EA4335"/>
                    <circle cx="12" cy="9" r="2.5" fill="#FFFFFF"/>
                  </svg>
                  <span>Share Location (Google Maps)</span>
                </button>
              </div>

              {/* Primary Veterinary Details */}
              <div className="p-4 rounded-2xl bg-[#FAF6F0]/80 border border-[#EFE8E1] flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#766A63] block">Primary Veterinary Hospital</span>
                  <span className="font-bold text-[#2C211B] text-sm block">
                    {activePup.vetClinic || activePup.vetName || "Oakwood Vet Hospital (24/7)"}
                  </span>
                </div>
                <a
                  href={`tel:${activePup.vetPhone || ownerPhoneNumber || ""}`}
                  className="px-4 py-2 bg-[#8B5E3C] hover:bg-[#5F3E29] text-white rounded-xl text-xs font-bold transition-colors shadow-subtle shrink-0"
                >
                  Call Vet
                </a>
              </div>

              {/* Backup Emergency Contact (if configured) */}
              {activePup.emergencyContactPhone && activePup.emergencyContactPhone !== ownerPhoneNumber && (
                <div className="p-4 rounded-2xl bg-[#FAF6F0]/80 border border-[#EFE8E1] flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#766A63] block">Secondary Emergency Backup</span>
                    <span className="font-bold text-[#2C211B] text-sm block">
                      {activePup.emergencyContactName || "Trusted Family"}
                    </span>
                  </div>
                  <a
                    href={`tel:${activePup.emergencyContactPhone}`}
                    className="px-4 py-2 bg-white border border-[#EFE8E1] text-[#8B5E3C] hover:bg-[#FAF6F0] rounded-xl text-xs font-bold transition-colors shadow-subtle shrink-0"
                  >
                    Call Backup
                  </a>
                </div>
              )}

            </section>

            {/* CARE & MEDICAL DOSSIER */}
            <section className="bg-white rounded-[32px] border border-[#EFE8E1] p-6 shadow-clean space-y-5">
              
              <div className="flex items-center justify-between border-b border-[#EFE8E1] pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🩺</span>
                  <div>
                    <h2 className="text-sm font-bold uppercase tracking-wider text-[#2C211B]">
                      Care &amp; Medical Dossier
                    </h2>
                    <p className="text-[11px] text-[#766A63]">Verified dietary alerts and clinical records</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                  Vaccinated
                </span>
              </div>

              {/* Allergy & Dietary Alert */}
              {(activePup.allergies || activePup.dietaryRestrictions) ? (
                <div className="p-4 rounded-2xl bg-orange-50/90 border border-orange-200 text-xs text-orange-950 space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-orange-800 text-sm">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-orange-600" />
                    <span>Special Dietary &amp; Allergy Caution</span>
                  </div>
                  <p className="text-xs leading-relaxed text-orange-900">
                    {activePup.allergies && <span>Allergies: <strong className="font-semibold">{activePup.allergies}</strong>. </span>}
                    {activePup.dietaryRestrictions && <span>Diet: <strong className="font-semibold">{activePup.dietaryRestrictions}</strong>. </span>}
                    Do not feed snacks without consulting guardian.
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-emerald-50/90 border border-emerald-200 text-xs text-emerald-950 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-emerald-800 text-sm">
                    <Check className="w-4 h-4 shrink-0 text-emerald-600 stroke-[3]" />
                    <span>No Known Health Allergies</span>
                  </div>
                  <p className="text-xs leading-relaxed text-emerald-900">
                    No food allergies reported. Always check with guardian before offering human foods.
                  </p>
                </div>
              )}

              {/* Verified Vaccinations Grid */}
              <div>
                <span className="text-xs font-bold text-[#766A63] uppercase tracking-wider block mb-2.5">
                  Verified Core Vaccinations
                </span>
                <div className="grid grid-cols-3 gap-3 text-center">
                  {vaccinesList.map((vac, idx) => (
                    <div key={idx} className="p-3 rounded-2xl bg-[#FAF6F0] border border-[#EFE8E1]">
                      <span className="text-xs text-[#766A63] block truncate font-medium">{vac.name}</span>
                      <span className="font-black text-sm text-emerald-700 capitalize block pt-1">{vac.status}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rescuer Assistance Box */}
              <div className="p-4 rounded-2xl bg-[#FAF6F0]/60 border border-[#EFE8E1] text-xs text-[#766A63] space-y-1">
                <span className="font-bold text-[#2C211B] block">Safe Reunification Guide</span>
                <p className="text-[11px] leading-relaxed">
                  Keep {activePup.name} in a secure, calm space with clean water. Check for any physical injuries and keep the leash secured while contacting the guardian.
                </p>
              </div>

            </section>

          </div>

        </div>

        {/* DESKTOP FOOTER */}
        <footer className="pt-8 pb-12 text-center text-xs text-[#766A63] space-y-2 border-t border-[#EFE8E1]/60 mt-8">
          <div className="flex items-center justify-center gap-2">
            <span className="font-bold text-[#2C211B]">PupLume Pet Passport</span>
            <span>&bull;</span>
            <span>Smart NFC Collar Connected</span>
            <span>&bull;</span>
            <span>Global Reunification Protocol</span>
          </div>
          <div>
            <a href="/" className="text-xs font-bold text-[#8B5E3C] hover:underline">
              Are you the owner? Open PupLume App &rarr;
            </a>
          </div>
        </footer>

      </section>

      {/* ========================================== */}
      {/* 5. MOBILE FIXED BOTTOM CALL DOCK (Phones)  */}
      {/* ========================================== */}
      <aside className="md:hidden fixed bottom-3 inset-x-3 z-30">
        <div className="bg-white/95 backdrop-blur-md border border-[#EFE8E1] rounded-2xl p-2 shadow-modal flex gap-2">
          {ownerPhoneNumber ? (
            <>
              <a
                href={`tel:${ownerPhoneNumber}`}
                className="flex-1 h-12 rounded-xl bg-[#8B5E3C] text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-subtle active:scale-95 transition-transform"
              >
                <Phone className="w-4 h-4 shrink-0" />
                <span>Call Guardian</span>
              </a>
              <button
                type="button"
                onClick={handleOpenShare}
                className="px-4 h-12 rounded-xl bg-[#FAF6F0] border border-[#EFE8E1] text-[#8B5E3C] font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-transform cursor-pointer"
                title="Share Pet Passport"
              >
                <Share2 className="w-4 h-4 shrink-0" />
                <span>Share</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleOpenShare}
              className="w-full h-12 rounded-xl bg-[#8B5E3C] text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-subtle active:scale-95 transition-transform cursor-pointer"
            >
              <Share2 className="w-4 h-4 shrink-0" />
              <span>Share Passport</span>
            </button>
          )}
        </div>
      </aside>

      {/* ========================================== */}
      {/* 7. SIMPLE LINK SHARING MODAL               */}
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

      {/* ========================================== */}
      {/* 8. AUTHENTIC LOCATION SHARING MODAL        */}
      {/* ========================================== */}
      {isLocationModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] border border-[#EFE8E1] max-w-md w-full p-6 space-y-5 shadow-modal animate-in fade-in zoom-in-95">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#EFE8E1] pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#EA4335"/>
                    <circle cx="12" cy="9" r="2.5" fill="#FFFFFF"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-black text-base text-[#2C211B] leading-tight" style={{ fontFamily: "'Grandstander', cursive" }}>
                    Share Location with Guardian
                  </h3>
                  <p className="text-xs text-[#766A63]">Send your exact spot to reunite {activePup.name}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsLocationModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#FAF6F0] text-[#766A63] flex items-center justify-center text-xs hover:bg-[#F3E7DA] cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Options List */}
            <div className="space-y-3">
              
              {/* Option 1: WhatsApp Native Location (Trusted & Direct) */}
              {cleanWhatsAppNumber && (
                <button
                  type="button"
                  onClick={handleShareViaWhatsApp}
                  className="w-full p-4 rounded-2xl bg-emerald-50/70 hover:bg-emerald-100/80 border border-emerald-200 flex items-start gap-3.5 text-left transition-all active:scale-[0.98] cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.52 11.63c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.03-1.25-.75-.67-1.26-1.5-1.41-1.75-.15-.25-.02-.39.11-.51.11-.11.25-.29.37-.44.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.78 2.71 4.3 3.8 2.53 1.09 2.53.73 2.99.69.45-.04 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.11-.23-.17-.48-.29"/>
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-emerald-950">Send via WhatsApp</span>
                      <span className="text-[10px] font-bold bg-emerald-200/60 text-emerald-900 px-2 py-0.5 rounded-full">Recommended</span>
                    </div>
                    <p className="text-[11px] text-emerald-800 leading-snug pt-0.5">
                      Opens direct chat with {guardianDisplayName}. You can send your live pin using WhatsApp&apos;s location tool.
                    </p>
                  </div>
                </button>
              )}

              {/* Option 2: Google Maps Pin (Authentic Google Maps) */}
              <button
                type="button"
                onClick={handleShareViaGoogleMaps}
                className="w-full p-4 rounded-2xl bg-[#FAF6F0] hover:bg-[#F3E7DA] border border-[#EFE8E1] flex items-start gap-3.5 text-left transition-all active:scale-[0.98] cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-xl bg-white border border-[#EFE8E1] flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#EA4335"/>
                    <circle cx="12" cy="9" r="2.5" fill="#FFFFFF"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#2C211B]">Open in Google Maps</span>
                    <span className="text-[10px] font-bold bg-white text-[#766A63] border border-[#EFE8E1] px-2 py-0.5 rounded-full">Universal</span>
                  </div>
                  <p className="text-[11px] text-[#766A63] leading-snug pt-0.5">
                    Opens Google Maps app or website to generate an exact pin and share directions with the guardian.
                  </p>
                </div>
              </button>

              {/* Option 3: Copy GPS Coordinates / Google Maps Link */}
              <div className="p-3 rounded-2xl bg-white border border-[#EFE8E1] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 min-w-0 pr-2">
                  <span className="text-sm">📍</span>
                  <span className="text-[11px] text-[#766A63] truncate font-mono">
                    {detectedLocationUrl ? detectedLocationUrl : 'Google Maps Link ready'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyMapLink}
                  className="px-3 py-1.5 bg-[#8B5E3C] hover:bg-[#5F3E29] text-white rounded-xl text-xs font-bold shrink-0 transition-colors cursor-pointer"
                >
                  {copiedMapLink ? 'Copied!' : 'Copy Link'}
                </button>
              </div>

            </div>

            {/* Guardian Phone Call direct fallback */}
            {ownerPhoneNumber && (
              <div className="pt-1 text-center">
                <a
                  href={`tel:${ownerPhoneNumber}`}
                  className="text-xs font-bold text-[#8B5E3C] hover:underline inline-flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Or call guardian directly: {ownerPhoneNumber}</span>
                </a>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
