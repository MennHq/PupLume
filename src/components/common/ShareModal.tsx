import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { 
  Share2, 
  Copy, 
  Check, 
  MessageCircle, 
  ExternalLink, 
  ShieldCheck, 
  AlertTriangle,
  QrCode
} from 'lucide-react';
import { copyToClipboard } from '../../lib/clipboard';
import { nativeBridge } from '../../lib/nativeBridge';
import { PuppyProfile } from '../../types';

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
  title = `Share ${puppy.name}'s Profile`,
  shareText,
  isEmergency = false
}) => {
  const [copied, setCopied] = useState(false);

  const defaultText = isEmergency
    ? `🚨 EMERGENCY: ${puppy.name} is reported missing! Please see safety info: ${url}`
    : `Meet ${puppy.name}! Check out their digital pet passport on PupLume 🐾: ${url}`;

  const messageText = shareText || defaultText;

  const handleCopy = async () => {
    nativeBridge.haptics.light();
    const success = await copyToClipboard(url);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleNativeShare = async () => {
    nativeBridge.haptics.medium();
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title,
          text: messageText,
          url
        });
        onClose();
        return;
      } catch (err: any) {
        if (err?.name === 'AbortError') return;
      }
    }
    // Fallback to copy
    await handleCopy();
  };

  const whatsAppUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(messageText)}`;
  const smsUrl = `sms:?&body=${encodeURIComponent(messageText)}`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEmergency ? `🚨 Broadcast ${puppy.name}'s Alert` : title}
      subtitle={isEmergency ? "Share immediately with neighborhood chats & finders" : "Share public digital pet card with family, friends or sitters"}
      maxWidth="sm"
      isBottomSheet={true}
    >
      <div className="space-y-4 pt-1">
        {/* Puppy Mini Card Preview */}
        <div className={`p-3.5 rounded-2xl border flex items-center gap-3.5 ${
          isEmergency 
            ? 'bg-rose-50/70 border-rose-200' 
            : 'bg-[#FAF6F0] border-[#E8DDD3]'
        }`}>
          <img
            src={puppy.photoUrl}
            alt={puppy.name}
            className="w-14 h-14 rounded-2xl object-cover border-2 border-[#8B5E3C] shadow-xs shrink-0"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h4 className="text-sm font-black text-[#2C211B] truncate">{puppy.name}</h4>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-[#F3E7DA] text-[#5F3E29]">
                {puppy.breed}
              </span>
            </div>
            <p className="text-xs text-[#766A63] mt-0.5 flex items-center gap-1">
              {isEmergency ? (
                <span className="text-rose-600 font-bold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Missing Alert Active
                </span>
              ) : (
                <span className="text-emerald-700 font-medium flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Public Pet Card
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Quick 1-Tap Share Channels (Instagram / TikTok Style) */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* WhatsApp Direct */}
          <a
            href={whatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => nativeBridge.haptics.light()}
            className="flex items-center justify-center gap-2 p-3 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white rounded-xl font-bold text-xs shadow-xs transition-all cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            <span>WhatsApp</span>
          </a>

          {/* SMS / Text Messages */}
          <a
            href={smsUrl}
            onClick={() => nativeBridge.haptics.light()}
            className="flex items-center justify-center gap-2 p-3 bg-[#8B5E3C] hover:bg-[#6D492F] active:scale-[0.98] text-white rounded-xl font-bold text-xs shadow-xs transition-all cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>Text / SMS</span>
          </a>
        </div>

        {/* System Native Share Button (if available) */}
        {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
          <Button
            variant="outline"
            onClick={handleNativeShare}
            className="w-full text-xs font-bold border-[#8B5E3C]/30 text-[#8B5E3C] hover:bg-[#FFF9F2]"
            leftIcon={<Share2 className="w-4 h-4" />}
          >
            More Apps (AirDrop, Instagram, Telegram)
          </Button>
        )}

        {/* Copy Link Row */}
        <div className="space-y-1.5 pt-1">
          <label className="text-[11px] font-bold uppercase tracking-wider text-[#766A63] block">
            Public Profile Link
          </label>
          <div className="flex items-center gap-2 p-1.5 bg-[#FAF6F0] rounded-xl border border-[#E8DDD3]">
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
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Direct Link Preview */}
        <div className="pt-1 flex items-center justify-between text-xs border-t border-[#E8DDD3]">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#8B5E3C] font-bold hover:underline inline-flex items-center gap-1"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Open Public Profile
          </a>
          <button
            onClick={onClose}
            className="text-[#766A63] font-bold hover:text-[#2C211B]"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};
