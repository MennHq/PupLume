import React, { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { 
  Phone, 
  MessageCircle, 
  MapPin, 
  AlertTriangle, 
  ShieldCheck, 
  Heart, 
  Dog, 
  Copy, 
  Check, 
  Stethoscope, 
  Info, 
  Share2,
  Globe
} from 'lucide-react';
import { storage } from '../lib/storage';
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

export const PublicPupSafetyPage: React.FC = () => {
  const localPup = storage.getPuppy();
  return (
    <LocalPublicErrorBoundary fallback={<PublicPupSafetyCard puppy={localPup} />}>
      <PublicPupSafetyContent />
    </LocalPublicErrorBoundary>
  );
};

const PublicPupSafetyContent: React.FC = () => {
  // Extract identifier from /pup/:id or /pup/:name
  const [identifier] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const parts = window.location.pathname.split('/').filter(Boolean);
      if (parts[0] === 'pup' && parts[1]) {
        return decodeURIComponent(parts[1]);
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
      localPup.name.toLowerCase() === identifier.toLowerCase() ||
      identifier === ''
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
      emergencyContactPhone: localPup.emergencyContactPhone,
      emergencyNotes: localPup.emergencyNotes,
      isLost: localPup.isLost ?? false,
      rewardAmount: localPup.rewardAmount,
      hasSmartTagPass: localPup.hasSmartTagPass ?? (
        typeof window !== 'undefined' && localStorage.getItem(`puplume_smart_tag_pass_${localPup.id}`) === 'true'
      ),
      communicationLinks: localPup.communicationLinks,
      ownerInstagram: localPup.ownerInstagram,
      ownerFacebook: localPup.ownerFacebook,
      ownerWhatsApp: localPup.ownerWhatsApp,
      ownerTelegram: localPup.ownerTelegram,
      ownerSlack: localPup.ownerSlack,
    } : null
  );

  // If loading and identifier provided and no local pup cached
  if (convexPup === undefined && identifier && !localPup) {
    return (
      <div className="min-h-screen bg-[#FAF6F0] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 border-3 border-[#8B5E3C] border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="text-lg font-bold text-[#2C211B]">Accessing Smart Collar Tag...</h2>
        <p className="text-xs text-[#766A63] mt-1">Fetching emergency safety card</p>
      </div>
    );
  }

  // Not found fallback
  if (!activePup) {
    return (
      <div className="min-h-screen bg-[#FAF6F0] flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
        <div className="w-20 h-20 bg-amber-100 rounded-3xl flex items-center justify-center mb-5 border border-amber-200 shadow-xs">
          <Dog className="w-10 h-10 text-amber-700" />
        </div>
        <h1 className="text-2xl font-black text-[#2C211B] mb-2">Puppy Profile Not Found</h1>
        <p className="text-sm text-[#766A63] mb-6 leading-relaxed">
          We couldn&apos;t find an active smart collar tag for &quot;{identifier || 'this link'}&quot;. The link might be mistyped or the owner hasn&apos;t published it yet.
        </p>
        <a
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#8B5E3C] hover:bg-[#6D492F] text-white text-sm font-bold rounded-2xl shadow-md transition-all cursor-pointer"
        >
          Go to PupLume Home
        </a>
      </div>
    );
  }

  // The emergency safety card is ALWAYS displayed for strangers / finders who scan the tag!
  return <PublicPupSafetyCard puppy={activePup} />;
};

export const PublicPupSafetyCard: React.FC<{ puppy: any }> = ({ puppy: activePup }) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'locating' | 'success' | 'error'>('idle');
  const [locationLink, setLocationLink] = useState<string | null>(null);

  if (!activePup) {
    return (
      <div className="min-h-screen bg-[#FAF6F0] flex flex-col items-center justify-center p-6 text-center">
        <Dog className="w-10 h-10 text-amber-700 mb-3" />
        <h2 className="text-lg font-bold text-[#2C211B]">Puppy Not Found</h2>
      </div>
    );
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleShareLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setLocationStatus('locating');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
        setLocationLink(mapsUrl);
        setLocationStatus('success');

        const ownerPhone = activePup.ownerPhone || '';
        const pupName = activePup.name || 'your puppy';
        const smsMessage = encodeURIComponent(
          `Hi! I found ${pupName}! Here is my current GPS location: ${mapsUrl}`
        );

        if (ownerPhone) {
          const smsLink = `sms:${ownerPhone}?body=${smsMessage}`;
          window.location.href = smsLink;
        } else {
          navigator.clipboard.writeText(mapsUrl);
        }
      },
      (err) => {
        console.error("Geolocation error:", err);
        setLocationStatus('error');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Calculate age weeks/months
  let ageString = '';
  if (activePup.birthDate) {
    const bDate = new Date(activePup.birthDate);
    const diffWeeks = Math.max(1, Math.floor((Date.now() - bDate.getTime()) / (1000 * 60 * 60 * 24 * 7)));
    if (diffWeeks >= 52) {
      const years = (diffWeeks / 52).toFixed(1);
      ageString = `${years} yrs old`;
    } else {
      ageString = `${diffWeeks} weeks old`;
    }
  }

  const ownerPhoneNumber = activePup.ownerPhone || '';

  return (
    <div className="min-h-screen bg-[#FFF9F2] text-[#2C211B] flex flex-col items-center">
      
      {/* Top Banner: Emergency or Friendly Found Banner */}
      <div className="w-full">
        {activePup.isLost ? (
          <div className="bg-rose-600 text-white px-4 py-3.5 shadow-md">
            <div className="max-w-xl mx-auto flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full bg-white animate-ping" />
                <AlertTriangle className="w-5 h-5 text-amber-300 shrink-0" />
                <span className="text-xs sm:text-sm font-black tracking-wide uppercase">
                  MISSING PUPPY ALERT • PLEASE HELP REUNITE
                </span>
              </div>
              {(() => {
                const raw = activePup.rewardAmount?.trim();
                if (!raw) return null;
                const lower = raw.toLowerCase();
                if (lower === 'no reward' || lower === 'none' || lower === 'no_reward') {
                  return null;
                }
                const label = lower.includes('reward') ? raw.toUpperCase() : `${raw.toUpperCase()} REWARD`;
                return (
                  <span className="px-2.5 py-1 bg-amber-400 text-amber-950 text-xs font-black rounded-lg shrink-0 shadow-xs uppercase">
                    ★ {label}
                  </span>
                );
              })()}
            </div>
          </div>
        ) : (
          <div className="bg-emerald-600 text-white px-4 py-2.5 text-center text-xs font-bold shadow-xs">
            🐾 PupLume Smart Collar Tag • If I&apos;m alone, please contact my family below!
          </div>
        )}
      </div>

      {/* Main Container */}
      <div className="w-full max-w-xl px-4 py-6 sm:py-8 space-y-6">
        
        {/* Puppy Hero Profile Card */}
        <div className="bg-white rounded-3xl border border-[#E8DDD3] p-6 shadow-sm relative overflow-hidden text-center sm:text-left flex flex-col sm:flex-row items-center gap-6">
          <div className="relative shrink-0">
            <img
              src={activePup.photoUrl || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=400"}
              alt={activePup.name}
              className="w-32 h-32 sm:w-36 sm:h-36 rounded-3xl object-cover border-4 border-[#8B5E3C] shadow-md"
            />
            {activePup.isLost && (
              <span className="absolute -top-2 -right-2 px-2.5 py-1 bg-rose-600 text-white text-[10px] font-black rounded-full shadow-md uppercase">
                Lost
              </span>
            )}
          </div>

          <div className="flex-1 space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FAF6F0] border border-[#E8DDD3] rounded-full text-xs font-bold text-[#8B5E3C]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Verified PupLume Safety Tag
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-[#2C211B] tracking-tight">
              {activePup.name}
            </h1>

            <p className="text-sm text-[#766A63] font-medium">
              {activePup.breed} {ageString && `• ${ageString}`} {activePup.weightLbs ? `• ${activePup.weightLbs} lbs` : ''}
            </p>

            {activePup.temperament && (
              <div className="inline-block bg-[#FFF9F2] border border-[#E8DDD3] px-3 py-1 rounded-xl text-xs font-medium text-[#5F3E29]">
                ✨ {activePup.temperament}
              </div>
            )}
          </div>
        </div>

        {/* Big Action Buttons (Targeted for Stranger on Street) */}
        <div className="space-y-3">
          <h2 className="text-xs font-black uppercase tracking-wider text-[#8B5E3C] px-1 flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5" /> Emergency Contact Actions
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Call Owner */}
            <a
              href={ownerPhoneNumber ? `tel:${ownerPhoneNumber}` : '#'}
              onClick={(e) => {
                if (!ownerPhoneNumber) {
                  e.preventDefault();
                  alert("Owner phone number is not listed publicly. Please see vet or microchip information below.");
                }
              }}
              className="flex items-center justify-center gap-3 p-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-black text-base rounded-2xl shadow-md transition-all cursor-pointer"
            >
              <Phone className="w-5 h-5 shrink-0" />
              <span>Call Owner Now</span>
            </a>

            {/* Send SMS */}
            <a
              href={ownerPhoneNumber ? `sms:${ownerPhoneNumber}?body=${encodeURIComponent(`Hi! I found ${activePup.name}. They are with me right now.`)}` : '#'}
              onClick={(e) => {
                if (!ownerPhoneNumber) {
                  e.preventDefault();
                  alert("Owner phone number is not listed publicly.");
                }
              }}
              className="flex items-center justify-center gap-3 p-4 bg-[#8B5E3C] hover:bg-[#6D492F] active:scale-[0.98] text-white font-black text-base rounded-2xl shadow-md transition-all cursor-pointer"
            >
              <MessageCircle className="w-5 h-5 shrink-0" />
              <span>Send Text / SMS</span>
            </a>
          </div>

          {/* 1-Tap Share GPS Pin */}
          <div className="bg-white rounded-2xl border border-[#E8DDD3] p-4 shadow-2xs">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-center sm:text-left">
                <h3 className="text-xs font-bold text-[#2C211B] flex items-center justify-center sm:justify-start gap-1.5">
                  <MapPin className="w-4 h-4 text-rose-500" />
                  Send Exact Location Pin to Owner
                </h3>
                <p className="text-[11px] text-[#766A63] mt-0.5">
                  Uses your phone GPS to create an instant Google Maps pin for the owner.
                </p>
              </div>

              <button
                onClick={handleShareLocation}
                disabled={locationStatus === 'locating'}
                className="w-full sm:w-auto px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer shrink-0"
              >
                {locationStatus === 'locating' ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Getting GPS...</span>
                  </>
                ) : locationStatus === 'success' ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span>GPS Pin Shared!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4" />
                    <span>Send GPS Pin</span>
                  </>
                )}
              </button>
            </div>

            {locationStatus === 'success' && locationLink && (
              <div className="mt-3 p-2.5 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-center justify-between gap-2">
                <span className="truncate text-[11px] font-mono">{locationLink}</span>
                <button
                  onClick={() => copyToClipboard(locationLink, 'gps')}
                  className="px-2 py-1 bg-blue-600 text-white rounded text-[10px] font-bold shrink-0 cursor-pointer"
                >
                  {copiedField === 'gps' ? 'Copied!' : 'Copy'}
                </button>
              </div>
            )}

            {locationStatus === 'error' && (
              <p className="mt-2 text-[11px] text-rose-600">
                Could not retrieve GPS. Please check location permissions in your browser.
              </p>
            )}
          </div>

          {/* Direct Communication Links (Only show channels entered by owner) */}
          {(() => {
            const effectiveLinks: Array<{ id: string; platform: string; value: string }> = (() => {
              if (Array.isArray(activePup.communicationLinks) && activePup.communicationLinks.length > 0) {
                return activePup.communicationLinks.filter((l: any) => l && typeof l.value === 'string' && l.value.trim() !== '');
              }
              const legacy: Array<{ id: string; platform: string; value: string }> = [];
              if (activePup.ownerWhatsApp?.trim()) {
                legacy.push({ id: 'legacy-wa', platform: 'whatsapp', value: activePup.ownerWhatsApp.trim() });
              }
              if (activePup.ownerInstagram?.trim()) {
                legacy.push({ id: 'legacy-ig', platform: 'instagram', value: activePup.ownerInstagram.trim() });
              }
              if (activePup.ownerTelegram?.trim()) {
                legacy.push({ id: 'legacy-tg', platform: 'telegram', value: activePup.ownerTelegram.trim() });
              }
              if (activePup.ownerFacebook?.trim()) {
                legacy.push({ id: 'legacy-fb', platform: 'facebook', value: activePup.ownerFacebook.trim() });
              }
              if (activePup.ownerSlack?.trim()) {
                legacy.push({ id: 'legacy-slack', platform: 'slack', value: activePup.ownerSlack.trim() });
              }
              return legacy;
            })();

            if (effectiveLinks.length === 0) return null;

            return (
              <div className="bg-white rounded-2xl border border-[#E8DDD3] p-4 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-wider text-[#8B5E3C] flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5" /> Direct Chat & Communication
                  </h3>
                  <span className="text-[10px] text-[#766A63] font-medium">Instant Owner Contact</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {effectiveLinks.map((link) => {
                    const platform = COMMUNICATION_PLATFORMS.find(p => p.id === link.platform) || {
                      id: link.platform,
                      name: link.platform.charAt(0).toUpperCase() + link.platform.slice(1),
                      color: '#5F3E29',
                      bgColor: '#FAF6F0',
                      domain: 'google.com',
                      placeholder: '',
                      buildUrl: (v: string) => v.startsWith('http') ? v : `https://${v}`
                    };

                    const targetUrl = platform.buildUrl ? platform.buildUrl(link.value) : (link.value.startsWith('http') ? link.value : `https://${link.value}`);
                    const faviconUrl = getPlatformFaviconUrl(platform.id, link.value);

                    return (
                      <a
                        key={link.id || `${link.platform}-${link.value}`}
                        href={targetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-xl hover:opacity-95 border transition-all cursor-pointer shadow-2xs group"
                        style={{
                          backgroundColor: platform.bgColor || '#FAF6F0',
                          borderColor: `${platform.color}35`,
                          color: '#2C211B'
                        }}
                      >
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform overflow-hidden bg-white/80 p-1"
                        >
                          <img
                            src={faviconUrl}
                            alt=""
                            className="w-5 h-5 object-contain rounded-xs"
                            onError={(e) => {
                              (e.currentTarget as HTMLElement).style.display = 'none';
                            }}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div
                            className="text-[11px] font-black uppercase truncate tracking-wide"
                            style={{ color: platform.color }}
                          >
                            {platform.name}
                          </div>
                          <div className="text-[10px] text-[#766A63] truncate font-mono">
                            {link.value}
                          </div>
                        </div>
                      </a>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </div>

        {/* Essential Instructions for Finder & Handling */}
        <div className="bg-amber-50/90 border-2 border-amber-300/80 rounded-3xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
              <Info className="w-4 h-4 text-amber-700" />
              Essential Instructions for Finder
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200/70 text-amber-950">
              Special Handling
            </span>
          </div>
          <p className="text-xs sm:text-sm text-amber-950 leading-relaxed font-medium">
            {activePup.emergencyNotes || "Please keep in a safe, quiet spot and offer clean water. Loves gentle pets. Owner is actively waiting to hear from you!"}
          </p>
        </div>

        {/* Medical & Identification Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Microchip ID */}
          <div className="bg-white rounded-2xl border border-[#E8DDD3] p-4 shadow-2xs space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8B5E3C] flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Microchip ID
            </span>
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-mono font-bold text-[#2C211B]">
                {activePup.microchipNumber || "Registered with Vet"}
              </span>
              {activePup.microchipNumber && (
                <button
                  onClick={() => copyToClipboard(activePup.microchipNumber!, 'microchip')}
                  className="p-1.5 hover:bg-[#FAF6F0] rounded-lg text-[#766A63] hover:text-[#2C211B] transition-colors cursor-pointer"
                  title="Copy Microchip ID"
                >
                  {copiedField === 'microchip' ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              )}
            </div>
            <p className="text-[10px] text-[#766A63]">
              Can be scanned by any local veterinarian or animal shelter.
            </p>
          </div>

          {/* Primary Vet Clinic */}
          <div className="bg-white rounded-2xl border border-[#E8DDD3] p-4 shadow-2xs space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8B5E3C] flex items-center gap-1.5">
              <Stethoscope className="w-3.5 h-3.5 text-blue-600" /> Primary Vet Clinic
            </span>
            <h4 className="text-xs font-bold text-[#2C211B]">
              {activePup.vetClinic || "Local Emergency Vet"}
            </h4>
            {activePup.vetPhone ? (
              <a
                href={`tel:${activePup.vetPhone}`}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#8B5E3C] hover:underline"
              >
                <Phone className="w-3 h-3" /> {activePup.vetPhone}
              </a>
            ) : (
              <p className="text-[10px] text-[#766A63]">Call local 24/7 animal hospital if injured.</p>
            )}
          </div>

          {/* Dietary & Allergies */}
          <div className="bg-white rounded-2xl border border-[#E8DDD3] p-4 shadow-2xs space-y-1.5 sm:col-span-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8B5E3C] flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-rose-500" /> Allergies & Dietary Restrictions
            </span>
            <p className="text-xs text-[#2C211B] leading-relaxed">
              {activePup.allergies || activePup.dietaryRestrictions ? (
                <>
                  {activePup.allergies && <span><strong>Allergies:</strong> {activePup.allergies}. </span>}
                  {activePup.dietaryRestrictions && <span><strong>Diet:</strong> {activePup.dietaryRestrictions}</span>}
                </>
              ) : (
                <span className="text-[#766A63] italic">No critical allergies reported. Clean tap water is safe.</span>
              )}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 pb-8 text-center space-y-2 border-t border-[#E8DDD3]">
          <div className="flex items-center justify-center gap-2 text-xs font-bold text-[#766A63]">
            <Dog className="w-4 h-4 text-[#8B5E3C]" />
            <span>Powered by PupLume Smart Collar Network</span>
          </div>
          <p className="text-[11px] text-[#A69B95] max-w-sm mx-auto">
            Free public emergency pet identification system. Helping reunite lost puppies with their families quickly and safely.
          </p>
          <div className="pt-2">
            <a
              href="/"
              className="text-xs font-bold text-[#8B5E3C] hover:text-[#5F3E29] hover:underline"
            >
              Are you the owner? Open PupLume App &rarr;
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};
