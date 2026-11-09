import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { 
  ShieldCheck, 
  AlertTriangle,
  Loader2,
  ExternalLink,
  Sparkles,
  Check,
  ArrowLeft,
  Smartphone,
  Download,
  Copy
} from 'lucide-react';
import { copyToClipboard } from '../../lib/clipboard';
import { nativeBridge } from '../../lib/nativeBridge';
import { generatePuppyStoryBlob } from '../../lib/storyCardGenerator';
import { PuppyProfile } from '../../types';

// ==========================================
// Authentic Pixel-Perfect Brand SVG Glyphs
// ==========================================

const InstagramGlyph: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

const WhatsAppGlyph: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
);

const XTwitterGlyph: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const MessagesGlyph: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2C6.477 2 2 6.03 2 11c0 2.807 1.438 5.31 3.69 6.896-.16.92-.612 2.44-1.89 3.585 0 0 2.45.228 4.795-1.353.766.216 1.574.332 2.405.332 5.523 0 10-4.03 10-9s-4.477-9-10-9z"/>
  </svg>
);

const DownloadGlyph: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" x2="12" y1="15" y2="3"/>
  </svg>
);

const LinkGlyph: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
  </svg>
);

const MoreAppsGlyph: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="18" cy="5" r="3"/>
    <circle cx="6" cy="12" r="3"/>
    <circle cx="18" cy="19" r="3"/>
    <line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/>
    <line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/>
  </svg>
);

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  puppy: PuppyProfile;
  url: string;
  title?: string;
  shareText?: string;
  isEmergency?: boolean;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  puppy,
  url,
  title = `Share ${puppy.name}'s Passport 🐾`,
  shareText,
  isEmergency = false
}) => {
  // Navigation view: 'channels' (all apps) or 'instagram' (focused Instagram Story Studio)
  const [currentView, setCurrentView] = useState<'channels' | 'instagram'>('channels');
  
  const [copied, setCopied] = useState(false);
  const [isGeneratingStory, setIsGeneratingStory] = useState(false);
  const [isDownloadingCard, setIsDownloadingCard] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [storyBlob, setStoryBlob] = useState<Blob | null>(null);
  const [storyPreviewUrl, setStoryPreviewUrl] = useState<string | null>(null);

  // Reset view when modal re-opens
  useEffect(() => {
    if (isOpen) {
      setCurrentView('channels');
      setToastMessage(null);
    }
  }, [isOpen]);

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      if (storyPreviewUrl) {
        URL.revokeObjectURL(storyPreviewUrl);
      }
    };
  }, [storyPreviewUrl]);

  const defaultText = isEmergency
    ? `🚨 EMERGENCY: ${puppy.name} is reported missing! Please see live safety & contact info: ${url}`
    : `Meet ${puppy.name}! Check out their verified digital pet passport on PupLume 🐾: ${url}`;

  const messageText = shareText || defaultText;

  // Direct share URLs
  const whatsAppUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(messageText)}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(messageText)}`;
  const smsUrl = `sms:?&body=${encodeURIComponent(messageText)}`;

  const showToast = (msg: string, durationMs: number = 4000) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, durationMs);
  };

  const handleCopy = async () => {
    nativeBridge.haptics.light();
    const success = await copyToClipboard(url);
    if (success) {
      setCopied(true);
      showToast("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const triggerDownload = (blob: Blob, filename: string) => {
    const downloadUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(downloadUrl), 6000);
  };

  // Helper to ensure 9:16 Story Blob is ready
  const ensureStoryBlob = async (): Promise<Blob> => {
    if (storyBlob) return storyBlob;
    setIsGeneratingStory(true);
    try {
      const blob = await generatePuppyStoryBlob(puppy, url);
      setStoryBlob(blob);
      const prevUrl = URL.createObjectURL(blob);
      setStoryPreviewUrl(prevUrl);
      return blob;
    } finally {
      setIsGeneratingStory(false);
    }
  };

  // Enter Instagram Story Focused View
  const handleOpenInstagramStoryView = async () => {
    nativeBridge.haptics.medium();
    setCurrentView('instagram');
    // Pre-generate blob in background
    ensureStoryBlob().catch((e) => console.error('Error pre-generating story blob:', e));
    // Also copy link immediately so it's ready for Instagram Link sticker
    await copyToClipboard(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // 1. Direct Instagram App Open (Bypasses the OS Multi-App Share Sheet!)
  const handleOpenInstagramDirect = async () => {
    nativeBridge.haptics.heavy();
    try {
      // 1. Copy link to clipboard
      await copyToClipboard(url);
      setCopied(true);

      // 2. Download / save the 9:16 card to the device
      const blob = await ensureStoryBlob();
      const filename = `${puppy.name.toLowerCase().replace(/\s+/g, '-')}-story.png`;
      triggerDownload(blob, filename);

      showToast("📸 Card saved & link copied! Launching Instagram camera...");

      const isMobile = typeof navigator !== 'undefined' && /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);

      if (isMobile) {
        // Deep link straight into Instagram Story camera (Zero other apps shown!)
        const start = Date.now();
        window.location.href = 'instagram://story-camera';

        // Fallback if Instagram app is not installed
        setTimeout(() => {
          if (Date.now() - start < 2000) {
            window.location.href = 'https://www.instagram.com/';
          }
        }, 1500);
      } else {
        // Desktop fallback: open Instagram web
        window.open('https://www.instagram.com/', '_blank', 'noopener,noreferrer');
      }
    } catch (err) {
      console.error('Failed to open Instagram directly:', err);
      showToast("Couldn't open Instagram directly. Try downloading the card.");
    }
  };

  // 2. Use Phone Share Sheet (For users who specifically want OS file delivery)
  const handleShareViaPhoneSheet = async () => {
    nativeBridge.haptics.medium();
    try {
      await copyToClipboard(url);
      const blob = await ensureStoryBlob();
      const filename = `${puppy.name.toLowerCase().replace(/\s+/g, '-')}-story.png`;
      const file = new File([blob], filename, { type: 'image/png' });

      if (
        typeof navigator !== 'undefined' &&
        typeof navigator.share === 'function' &&
        typeof navigator.canShare === 'function' &&
        navigator.canShare({ files: [file] })
      ) {
        showToast("Select Instagram from the sheet below:");
        await navigator.share({
          files: [file],
          title: `${puppy.name}'s Story Passport`,
          text: messageText
        });
      } else {
        triggerDownload(blob, filename);
        showToast("Phone share sheet not supported. Image downloaded to your device.");
      }
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        console.error('Share sheet error:', err);
        showToast("Share cancelled or not supported.");
      }
    }
  };

  // 3. Download Story Image (9:16)
  const handleDownloadStoryImage = async () => {
    nativeBridge.haptics.light();
    try {
      const blob = await ensureStoryBlob();
      const filename = `${puppy.name.toLowerCase().replace(/\s+/g, '-')}-story-9x16.png`;
      triggerDownload(blob, filename);
      showToast("✓ 9:16 Story card saved to photos!");
    } catch (err) {
      console.error('Failed to download story image:', err);
      showToast("Failed to download story image.");
    }
  };

  // 4. Download Passport Card (1200x630 High-Res Designed OpenGraph Passport Card)
  const handleDownloadPassportCard = async () => {
    nativeBridge.haptics.medium();
    setIsDownloadingCard(true);

    try {
      const isGraxzo = puppy.name?.toLowerCase() === 'graxzo' || url.toLowerCase().includes('graxzo');
      const cardUrl = isGraxzo ? '/og-graxzo.png?v=2' : '/og-pup-preview.png?v=2';
      const filename = `${puppy.name.toLowerCase().replace(/\s+/g, '-')}-passport-card.png`;

      const response = await fetch(cardUrl);
      if (response.ok) {
        const blob = await response.blob();
        triggerDownload(blob, filename);
        showToast(`✓ ${puppy.name}'s passport card downloaded!`);
      } else {
        const fallbackBlob = await generatePuppyStoryBlob(puppy, url);
        triggerDownload(fallbackBlob, filename);
        showToast(`✓ ${puppy.name}'s passport card downloaded!`);
      }
    } catch (err) {
      console.error('Error downloading passport card:', err);
      showToast("Download failed. Please try copying the link instead.");
    } finally {
      setIsDownloadingCard(false);
    }
  };

  // 5. More Apps (Native System Share)
  const handleMoreApps = async () => {
    nativeBridge.haptics.medium();
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title,
          text: messageText,
          url
        });
        return;
      } catch (err: any) {
        if (err?.name === 'AbortError') return;
      }
    }
    await handleCopy();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        currentView === 'instagram'
          ? "Instagram Story Studio"
          : isEmergency
          ? `🚨 Broadcast ${puppy.name}'s Alert`
          : title
      }
      subtitle={
        currentView === 'instagram'
          ? "Share Spotify-style 9:16 vertical passport with link sticker"
          : isEmergency
          ? "Share emergency broadcast immediately across social media & messaging"
          : "Share digital pet passport with family, friends, vet, or sitters"
      }
      maxWidth="sm"
      isBottomSheet={true}
    >
      <div className="space-y-4 pt-1">
        
        {/* ======================================================== */}
        {/* VIEW A: DEDICATED INSTAGRAM STORY VIEW (THE COMPLETE FIX) */}
        {/* ======================================================== */}
        {currentView === 'instagram' ? (
          <div className="space-y-3.5 animate-in fade-in slide-in-from-right-2 duration-200">
            {/* Top Bar with Back Navigation */}
            <div className="flex items-center justify-between pb-1">
              <button
                type="button"
                onClick={() => setCurrentView('channels')}
                className="flex items-center gap-1.5 text-xs font-bold text-[#8B5E3C] hover:text-[#5F3E29] cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>All Share Channels</span>
              </button>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded-full">
                9:16 Story Card
              </span>
            </div>

            {/* Live 9:16 Card Mini Preview Banner */}
            <div className="p-3 rounded-2xl bg-[#FAF2E6] border border-[#E8DDD3] flex items-center gap-3">
              <div className="w-14 h-22 rounded-xl bg-white border border-[#E8DDD3] overflow-hidden shadow-xs shrink-0 flex items-center justify-center relative">
                {storyPreviewUrl ? (
                  <img
                    src={storyPreviewUrl}
                    alt="Story Preview"
                    className="w-full h-full object-cover"
                  />
                ) : isGeneratingStory ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#8B5E3C]" />
                ) : (
                  <img
                    src={puppy.photoUrl}
                    alt={puppy.name}
                    className="w-full h-full object-cover opacity-85"
                  />
                )}
                <div className="absolute inset-x-0 bottom-0 py-0.5 bg-black/50 text-[7px] text-white text-center font-bold">
                  9:16
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-black text-[#2C211B] flex items-center gap-1.5" style={{ fontFamily: 'Grandstander, cursive' }}>
                  <span>{puppy.name}&apos;s Story Card</span>
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                </h4>
                <p className="text-[11px] text-[#766A63] mt-0.5 leading-tight">
                  High-res vertical passport card with QR tag, verified badge, and tap-to-open link.
                </p>
                <div className="mt-1.5 flex items-center gap-2">
                  <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                    <Check className="w-3 h-3 text-emerald-600 stroke-[3]" /> Link Ready to Paste
                  </span>
                </div>
              </div>
            </div>

            {/* Primary Action 1: Open Instagram Directly (NO OTHER APPS SHOWN!) */}
            <button
              type="button"
              onClick={handleOpenInstagramDirect}
              disabled={isGeneratingStory}
              className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-[#f09433] via-[#dc2743] to-[#bc1888] hover:opacity-95 active:scale-[0.98] text-white shadow-md shadow-rose-500/25 flex items-center justify-between transition-all cursor-pointer disabled:opacity-60"
            >
              <div className="flex items-center gap-3 text-left">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0">
                  <InstagramGlyph className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-sm font-black tracking-tight leading-tight">
                    Open Instagram Directly
                  </div>
                  <div className="text-[11px] text-white/90 font-medium leading-tight mt-0.5">
                    Saves card to photos &amp; opens Story camera
                  </div>
                </div>
              </div>
              <div className="w-7 h-7 rounded-full bg-white/25 flex items-center justify-center shrink-0 text-white font-bold text-xs">
                &rarr;
              </div>
            </button>

            {/* Secondary Action 2: Phone Share Sheet */}
            <button
              type="button"
              onClick={handleShareViaPhoneSheet}
              disabled={isGeneratingStory}
              className="w-full p-3 rounded-xl bg-white hover:bg-[#FAF6F0] active:scale-[0.98] border border-[#E8DDD3] text-[#2C211B] flex items-center justify-between transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2.5 text-left">
                <Smartphone className="w-5 h-5 text-[#8B5E3C] shrink-0" />
                <div>
                  <div className="text-xs font-bold leading-tight">
                    Share via Phone Share Sheet
                  </div>
                  <div className="text-[10px] text-[#766A63] leading-tight">
                    Shows phone&apos;s app picker to send the image file
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-bold text-[#8B5E3C]">
                Select app &rarr;
              </span>
            </button>

            {/* Quick 3-Step Guide (Why & How it works) */}
            <div className="p-3 rounded-xl bg-[#FFF9F2] border border-[#E8DDD3] text-[11px] space-y-1 text-[#5F3E29]">
              <div className="font-extrabold uppercase tracking-wider text-[9px] text-[#766A63] mb-1">
                How to share on your story:
              </div>
              <div className="flex items-start gap-1.5">
                <span className="font-bold text-[#8B5E3C]">1.</span>
                <span>Tap <strong>Open Instagram Directly</strong> (card saves to Photos &amp; link copies).</span>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="font-bold text-[#8B5E3C]">2.</span>
                <span>In Instagram Story camera, swipe up to select the downloaded card.</span>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="font-bold text-[#8B5E3C]">3.</span>
                <span>Tap the <strong>Stickers</strong> icon &rarr; <strong>LINK</strong> &rarr; paste the copied link!</span>
              </div>
            </div>

            {/* Save Card Image Only */}
            <div className="flex items-center justify-between pt-1 text-xs">
              <button
                type="button"
                onClick={handleDownloadStoryImage}
                disabled={isGeneratingStory}
                className="text-[#8B5E3C] font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> Save 9:16 image to device
              </button>
              <button
                type="button"
                onClick={handleCopy}
                className="text-[#766A63] font-bold hover:text-[#2C211B] inline-flex items-center gap-1 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" /> Copy link
              </button>
            </div>
          </div>
        ) : (
          /* ======================================================== */
          /* VIEW B: MAIN SHARE CHANNELS GRID (ALL DESTINATIONS)       */
          /* ======================================================== */
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* Passport Preview Card Header (Warm Skin / Cream Tone, Zero Nested Clutter) */}
            <div
              className={`p-3.5 rounded-2xl border flex items-center gap-3.5 transition-colors ${
                isEmergency
                  ? 'bg-rose-50/80 border-rose-200'
                  : 'bg-[#FAF2E6] border-[#E8DDD3]'
              }`}
            >
              <img
                src={puppy.photoUrl}
                alt={puppy.name}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-[#8B5E3C] shadow-xs shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h4 className="text-base font-black text-[#2C211B] truncate" style={{ fontFamily: 'Grandstander, cursive' }}>
                    {puppy.name}
                  </h4>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-[#F3E7DA] text-[#5F3E29]">
                    {puppy.breed || 'Puppy'}
                  </span>
                </div>
                <p className="text-xs text-[#766A63] mt-0.5 flex items-center gap-1">
                  {isEmergency ? (
                    <span className="text-rose-600 font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> Missing Alert Active
                    </span>
                  ) : (
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Active Collar Tag • Verified
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Section Title */}
            <div className="flex items-center justify-between px-0.5 pt-0.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#766A63]">
                Share Passport To
              </span>
              <span className="text-[10px] font-bold text-[#8B5E3C]">
                Instant 1-Tap
              </span>
            </div>

            {/* Native-Style App Channel Grid (Instagram, Twitter, Story, WhatsApp, SMS, Download, Copy, More) */}
            <div className="grid grid-cols-4 gap-y-4 gap-x-2 sm:gap-x-3 text-center">
              
              {/* 1. Instagram Story (Enters Focused Instagram Story Studio) */}
              <button
                type="button"
                onClick={handleOpenInstagramStoryView}
                className="group flex flex-col items-center gap-1.5 focus:outline-none cursor-pointer active:scale-95 transition-transform"
              >
                <div className="relative w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] shadow-md shadow-rose-500/20 text-white flex items-center justify-center group-hover:scale-105 transition-all">
                  <InstagramGlyph className="w-6 h-6 text-white" />
                  <span className="absolute -top-1.5 -right-1.5 px-1 py-0.2 rounded-full bg-amber-400 text-[#2C211B] text-[8px] font-black uppercase tracking-tighter shadow-xs">
                    Story
                  </span>
                </div>
                <span className="text-[11px] font-bold text-[#2C211B] tracking-tight group-hover:text-[#8B5E3C] transition-colors leading-tight">
                  IG Story
                </span>
              </button>

              {/* 2. WhatsApp */}
              <a
                href={whatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => nativeBridge.haptics.light()}
                className="group flex flex-col items-center gap-1.5 focus:outline-none cursor-pointer active:scale-95 transition-transform no-underline"
              >
                <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-[#25D366] shadow-md shadow-emerald-500/20 text-white flex items-center justify-center group-hover:scale-105 transition-all">
                  <WhatsAppGlyph className="w-6 h-6 text-white" />
                </div>
                <span className="text-[11px] font-bold text-[#2C211B] tracking-tight group-hover:text-[#8B5E3C] transition-colors leading-tight">
                  WhatsApp
                </span>
              </a>

              {/* 3. Twitter / X */}
              <a
                href={twitterUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => nativeBridge.haptics.light()}
                className="group flex flex-col items-center gap-1.5 focus:outline-none cursor-pointer active:scale-95 transition-transform no-underline"
              >
                <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-[#000000] shadow-md shadow-stone-900/20 text-white flex items-center justify-center group-hover:scale-105 transition-all">
                  <XTwitterGlyph className="w-5 h-5 text-white" />
                </div>
                <span className="text-[11px] font-bold text-[#2C211B] tracking-tight group-hover:text-[#8B5E3C] transition-colors leading-tight">
                  X / Twitter
                </span>
              </a>

              {/* 4. SMS / Messages */}
              <a
                href={smsUrl}
                onClick={() => nativeBridge.haptics.light()}
                className="group flex flex-col items-center gap-1.5 focus:outline-none cursor-pointer active:scale-95 transition-transform no-underline"
              >
                <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-[#34C759] shadow-md shadow-green-500/20 text-white flex items-center justify-center group-hover:scale-105 transition-all">
                  <MessagesGlyph className="w-6 h-6 text-white" />
                </div>
                <span className="text-[11px] font-bold text-[#2C211B] tracking-tight group-hover:text-[#8B5E3C] transition-colors leading-tight">
                  SMS / Text
                </span>
              </a>

              {/* 5. Download Passport Card */}
              <button
                type="button"
                onClick={handleDownloadPassportCard}
                disabled={isDownloadingCard}
                className="group flex flex-col items-center gap-1.5 focus:outline-none cursor-pointer active:scale-95 transition-transform"
              >
                <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-[#8B5E3C] to-[#5F3E29] shadow-md shadow-amber-900/20 text-white flex items-center justify-center group-hover:scale-105 transition-all">
                  {isDownloadingCard ? (
                    <Loader2 className="w-6 h-6 animate-spin text-white" />
                  ) : (
                    <DownloadGlyph className="w-6 h-6 text-white" />
                  )}
                </div>
                <span className="text-[11px] font-bold text-[#2C211B] tracking-tight group-hover:text-[#8B5E3C] transition-colors leading-tight">
                  Download
                </span>
              </button>

              {/* 6. Copy Link */}
              <button
                type="button"
                onClick={handleCopy}
                className="group flex flex-col items-center gap-1.5 focus:outline-none cursor-pointer active:scale-95 transition-transform"
              >
                <div
                  className={`w-13 h-13 sm:w-14 sm:h-14 rounded-2xl border-2 shadow-xs flex items-center justify-center group-hover:scale-105 transition-all ${
                    copied
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : 'bg-white border-[#E8DDD3] text-[#2C211B] hover:border-[#8B5E3C]'
                  }`}
                >
                  {copied ? (
                    <Check className="w-6 h-6 text-white stroke-[2.5]" />
                  ) : (
                    <LinkGlyph className="w-6 h-6 text-[#2C211B]" />
                  )}
                </div>
                <span
                  className={`text-[11px] font-bold tracking-tight transition-colors leading-tight ${
                    copied ? 'text-emerald-700' : 'text-[#2C211B] group-hover:text-[#8B5E3C]'
                  }`}
                >
                  {copied ? 'Copied!' : 'Copy Link'}
                </span>
              </button>

              {/* 7. More Apps */}
              <button
                type="button"
                onClick={handleMoreApps}
                className="group flex flex-col items-center gap-1.5 focus:outline-none cursor-pointer active:scale-95 transition-transform"
              >
                <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-[#F3E7DA] hover:bg-[#E8DDD3] shadow-xs text-[#5F3E29] flex items-center justify-center group-hover:scale-105 transition-all">
                  <MoreAppsGlyph className="w-6 h-6 text-[#5F3E29]" />
                </div>
                <span className="text-[11px] font-bold text-[#2C211B] tracking-tight group-hover:text-[#8B5E3C] transition-colors leading-tight">
                  More Apps
                </span>
              </button>

            </div>

            {/* Direct Link Copy Bar */}
            <div className="space-y-1.5 pt-1">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-[#766A63] block">
                Public Passport Link
              </label>
              <div className="flex items-center gap-2 p-1.5 bg-[#FAF2E6] rounded-xl border border-[#E8DDD3]">
                <input
                  type="text"
                  readOnly
                  value={url}
                  className="flex-1 bg-transparent text-xs font-mono text-[#2C211B] px-2.5 py-1 outline-none truncate select-all"
                />
                <button
                  onClick={handleCopy}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                    copied
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white hover:bg-[#F3E7DA] text-[#2C211B] border border-[#E8DDD3]'
                  }`}
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <LinkGlyph className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Toast Feedback (Shared across all views) */}
        {toastMessage && (
          <div className="p-3 rounded-xl bg-[#FAF6F0] border border-[#E8DDD3] text-[#5F3E29] text-xs font-semibold flex items-center gap-2.5 shadow-2xs animate-in fade-in leading-relaxed">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="flex-1">{toastMessage}</span>
          </div>
        )}

        {/* Modal Footer */}
        <div className="pt-2 flex items-center justify-between text-xs border-t border-[#E8DDD3]">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#8B5E3C] font-bold hover:underline inline-flex items-center gap-1"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Open Public Passport
          </a>
          <button
            onClick={onClose}
            className="text-[#766A63] font-bold hover:text-[#2C211B] cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};
