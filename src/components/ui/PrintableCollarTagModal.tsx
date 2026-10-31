import React, { useState } from 'react';
import { 
  X, 
  Printer, 
  QrCode, 
  Scissors, 
  Dog, 
  ShieldCheck, 
  Sparkles, 
  Heart, 
  Flame, 
  Compass, 
  Crown, 
  Check, 
  Palette,
  Phone,
  AlertCircle
} from 'lucide-react';
import { Button } from './Button';
import { PuppyProfile } from '../../types';
import { generatePupLumeQRSvg } from '../../lib/qrCodeGenerator';

interface PrintableCollarTagModalProps {
  isOpen: boolean;
  puppy: PuppyProfile;
  qrDataUrl: string;
  publicUrl: string;
  onClose: () => void;
}

export type TagStyleId = 
  | 'classic-amber' 
  | 'emerald-guardian' 
  | 'midnight-pro' 
  | 'blush-paw' 
  | 'crimson-emergency' 
  | 'royal-gold';

export type TagShapeId = 'all' | 'round' | 'bone' | 'squircle' | 'hex';

interface TagDesignTheme {
  id: TagStyleId;
  name: string;
  badge: string;
  bgGradient: string;
  borderColor: string;
  dashedBorder: string;
  textColor: string;
  accentColor: string;
  phoneBg: string;
  phoneText: string;
  subtextColor: string;
  qrBg: string;
}

const DESIGN_THEMES: TagDesignTheme[] = [
  {
    id: 'classic-amber',
    name: 'PupLume Honey',
    badge: 'Warm & Iconic',
    bgGradient: 'bg-gradient-to-b from-[#FFFDF9] via-[#FFF5EA] to-[#FCECDC]',
    borderColor: 'border-[#8B5E3C]',
    dashedBorder: 'border-[#A27046]',
    textColor: 'text-[#2C211B]',
    accentColor: '#8B5E3C',
    phoneBg: 'bg-[#8B5E3C] text-white',
    phoneText: 'text-white',
    subtextColor: 'text-[#8B5E3C]',
    qrBg: 'bg-white',
  },
  {
    id: 'midnight-pro',
    name: 'Midnight Carbon',
    badge: 'Sleek & Tactical',
    bgGradient: 'bg-gradient-to-b from-[#1E232A] via-[#15191E] to-[#0B0D11]',
    borderColor: 'border-neutral-700',
    dashedBorder: 'border-neutral-500',
    textColor: 'text-white',
    accentColor: '#38BDF8',
    phoneBg: 'bg-sky-500 text-slate-950 font-black',
    phoneText: 'text-slate-950',
    subtextColor: 'text-sky-400',
    qrBg: 'bg-white',
  },
  {
    id: 'crimson-emergency',
    name: 'SOS High-Visibility',
    badge: 'Emergency Alert',
    bgGradient: 'bg-gradient-to-b from-[#FFF5F5] via-[#FEE2E2] to-[#FECACA]',
    borderColor: 'border-red-600',
    dashedBorder: 'border-red-500',
    textColor: 'text-red-950',
    accentColor: '#DC2626',
    phoneBg: 'bg-red-600 text-white font-black',
    phoneText: 'text-white',
    subtextColor: 'text-red-700',
    qrBg: 'bg-white',
  },
  {
    id: 'emerald-guardian',
    name: 'Sage Guardian',
    badge: 'Natural & Calming',
    bgGradient: 'bg-gradient-to-b from-[#F6FBF7] via-[#E8F5EB] to-[#DCF0E1]',
    borderColor: 'border-emerald-700',
    dashedBorder: 'border-emerald-600',
    textColor: 'text-emerald-950',
    accentColor: '#059669',
    phoneBg: 'bg-emerald-700 text-white',
    phoneText: 'text-white',
    subtextColor: 'text-emerald-800',
    qrBg: 'bg-white',
  },
  {
    id: 'blush-paw',
    name: 'Pastel Petal',
    badge: 'Sweet & Playful',
    bgGradient: 'bg-gradient-to-b from-[#FFF9FB] via-[#FCE7F3] to-[#FBCFE8]',
    borderColor: 'border-pink-500',
    dashedBorder: 'border-pink-400',
    textColor: 'text-pink-950',
    accentColor: '#DB2777',
    phoneBg: 'bg-pink-600 text-white',
    phoneText: 'text-white',
    subtextColor: 'text-pink-700',
    qrBg: 'bg-white',
  },
  {
    id: 'royal-gold',
    name: 'Golden Crest',
    badge: 'Premium Edition',
    bgGradient: 'bg-gradient-to-b from-[#FFFDF0] via-[#FEF3C7] to-[#FDE68A]',
    borderColor: 'border-amber-600',
    dashedBorder: 'border-amber-500',
    textColor: 'text-amber-950',
    accentColor: '#D97706',
    phoneBg: 'bg-amber-600 text-white',
    phoneText: 'text-white',
    subtextColor: 'text-amber-800',
    qrBg: 'bg-white',
  },
];

export const PrintableCollarTagModal: React.FC<PrintableCollarTagModalProps> = ({
  isOpen,
  puppy,
  qrDataUrl,
  publicUrl,
  onClose,
}) => {
  const [selectedThemeId, setSelectedThemeId] = useState<TagStyleId>('classic-amber');
  const [selectedShape, setSelectedShape] = useState<TagShapeId>('all');
  const [includeOwnerPhone, setIncludeOwnerPhone] = useState(true);
  const [includeMicrochip, setIncludeMicrochip] = useState(true);

  if (!isOpen) return null;

  const currentTheme = DESIGN_THEMES.find((t) => t.id === selectedThemeId) || DESIGN_THEMES[0];

  const handlePrint = () => {
    window.print();
  };

  const contactPhone = includeOwnerPhone 
    ? (puppy.ownerPhone?.trim() || puppy.emergencyContactPhone?.trim() || '')
    : '';

  const microchip = includeMicrochip ? puppy.microchipNumber?.trim() : '';
  const effectiveQr = qrDataUrl || (publicUrl ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(generatePupLumeQRSvg(publicUrl))}` : '');

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-neutral-300 overflow-hidden my-auto animate-in zoom-in-95 duration-200 print:shadow-none print:border-none print:m-0 print:p-0 print:max-w-none print:w-full">
        
        {/* Header (Hidden when printing) */}
        <div className="bg-[#8B5E3C] text-white p-4 sm:p-5 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/10 backdrop-blur-xs">
              <QrCode className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg">Smart Collar Tag Print Studio</h3>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-[#2C211B]">
                  6 Designer Styles
                </span>
              </div>
              <p className="text-xs text-[#F5EAE0]">
                Choose your favorite collar badge theme and printable tag shape
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              leftIcon={<Printer className="w-4 h-4" />}
              className="bg-white/10 hover:bg-white/20 text-white border-white/30 font-bold"
            >
              Print Sheet
            </Button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Studio Controls Bar (Hidden when printing) */}
        <div className="p-4 sm:p-5 bg-[#FAF6F0] border-b border-[#E8DDD3] space-y-4 print:hidden">
          
          {/* Design Style Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-[#2C211B] flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-[#8B5E3C]" />
                Select Collar Theme:
              </label>
              <span className="text-[11px] font-bold text-[#8B5E3C]">
                {currentTheme.name} ({currentTheme.badge})
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              {DESIGN_THEMES.map((theme) => {
                const isSelected = theme.id === selectedThemeId;
                return (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => setSelectedThemeId(theme.id)}
                    className={`relative p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between h-20 ${
                      isSelected
                        ? 'border-[#8B5E3C] ring-2 ring-[#8B5E3C]/30 shadow-md bg-white'
                        : 'border-[#E8DDD3] hover:border-[#8B5E3C]/50 bg-white/70 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div
                        className="w-4 h-4 rounded-full border border-black/10 shadow-2xs"
                        style={{ backgroundColor: theme.accentColor }}
                      />
                      {isSelected && (
                        <span className="w-4 h-4 rounded-full bg-[#8B5E3C] text-white flex items-center justify-center text-[10px]">
                          <Check className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-[#2C211B] leading-tight truncate">
                        {theme.name}
                      </p>
                      <p className="text-[9px] text-[#766A63] leading-none mt-0.5 truncate">
                        {theme.badge}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tag Shape Filter & Info Toggles */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-[#E8DDD3]">
              <span className="text-[11px] font-bold text-[#766A63] px-2">Show:</span>
              {(
                [
                  { id: 'all', label: 'All 4 Cuts' },
                  { id: 'round', label: '1.75" Round' },
                  { id: 'bone', label: 'Dog Bone' },
                  { id: 'squircle', label: 'Keychain Tag' },
                  { id: 'hex', label: 'Hex Shield' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedShape(tab.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedShape === tab.id
                      ? 'bg-[#8B5E3C] text-white shadow-2xs'
                      : 'text-[#766A63] hover:text-[#2C211B] hover:bg-[#FAF6F0]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Customization Options */}
            <div className="flex items-center gap-4 text-xs font-semibold text-[#5F3E29]">
              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includeOwnerPhone}
                  onChange={(e) => setIncludeOwnerPhone(e.target.checked)}
                  className="rounded border-[#8B5E3C] text-[#8B5E3C] focus:ring-[#8B5E3C] w-3.5 h-3.5"
                />
                <span>Include Phone #</span>
              </label>

              {puppy.microchipNumber && (
                <label className="flex items-center gap-1.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={includeMicrochip}
                    onChange={(e) => setIncludeMicrochip(e.target.checked)}
                    className="rounded border-[#8B5E3C] text-[#8B5E3C] focus:ring-[#8B5E3C] w-3.5 h-3.5"
                  />
                  <span>Include Microchip</span>
                </label>
              )}
            </div>
          </div>

        </div>

        {/* Printable Sheet Canvas */}
        <div className="p-6 sm:p-8 space-y-6 text-center print:p-4 print:space-y-4">
          
          {/* Print Sheet Header Instructions (Visible on print preview) */}
          <div className="border-b border-dashed border-neutral-300 pb-3 text-left flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-black text-neutral-900 tracking-tight">
                  PUPLUME SMART COLLAR TAG SHEET
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-neutral-100 text-neutral-700 border border-neutral-300">
                  {puppy.name.toUpperCase()} • {puppy.breed || 'PUPPY'}
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 mt-0.5">
                Print 100% scale on letter/A4 photo cardstock or waterproof sticker paper. Cut along dotted line and insert into your puppy's collar tag ring.
              </p>
            </div>
            
            <div className="hidden sm:block text-right text-[10px] text-neutral-400 font-mono">
              Live Profile: {publicUrl}
            </div>
          </div>

          {/* Tag Badges Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-center justify-items-center py-2">
            
            {/* DESIGN 1: Classic Round Collar Tag (1.75") */}
            {(selectedShape === 'all' || selectedShape === 'round') && (
              <div className="flex flex-col items-center">
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-2 flex items-center gap-1 print:hidden">
                  <Scissors className="w-3.5 h-3.5" /> 1.75&quot; Round Tag
                </span>
                
                <div className={`w-48 h-48 rounded-full border-2 border-dashed ${currentTheme.dashedBorder} p-3 flex flex-col items-center justify-between ${currentTheme.bgGradient} shadow-md relative transition-transform hover:scale-102`}>
                  {/* Punch Hole Ring */}
                  <div className="w-3 h-3 rounded-full border border-neutral-500 bg-white absolute top-2 shadow-inner" />
                  
                  <span className={`text-[9px] font-black uppercase tracking-widest ${currentTheme.subtextColor} mt-3`}>
                    ★ IF LOST, SCAN ME ★
                  </span>
                  
                  {effectiveQr && (
                    <div className="p-1 rounded-xl bg-white shadow-2xs border border-neutral-200">
                      <img src={effectiveQr} alt="Collar QR Tag" className="w-20 h-20" />
                    </div>
                  )}
                  
                  <div className="text-center w-full pb-1">
                    <span className={`text-sm font-black ${currentTheme.textColor} leading-none block tracking-wide`}>
                      {puppy.name.toUpperCase()}
                    </span>
                    
                    {contactPhone ? (
                      <span className={`inline-block text-[9px] font-bold ${currentTheme.phoneBg} px-2 py-0.5 rounded-full mt-1 font-mono tracking-tight shadow-2xs`}>
                        {contactPhone}
                      </span>
                    ) : (
                      <span className="text-[8px] font-bold text-neutral-500 mt-1 block">
                        SCAN FOR EMERGENCY OWNER
                      </span>
                    )}

                    {microchip && (
                      <span className="text-[7px] text-neutral-500 font-mono block mt-0.5 truncate">
                        CHIP: {microchip}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* DESIGN 2: Cute Dog Bone Silhouette Tag */}
            {(selectedShape === 'all' || selectedShape === 'bone') && (
              <div className="flex flex-col items-center">
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-2 flex items-center gap-1 print:hidden">
                  <Scissors className="w-3.5 h-3.5" /> Dog Bone Silhouette
                </span>
                
                <div className={`w-48 h-48 rounded-3xl border-2 border-dashed ${currentTheme.dashedBorder} p-3 flex flex-col items-center justify-between ${currentTheme.bgGradient} shadow-md relative transition-transform hover:scale-102`}>
                  {/* Punch Hole Ring */}
                  <div className="w-3 h-3 rounded-full border border-neutral-500 bg-white absolute top-2 shadow-inner" />
                  
                  <div className="flex items-center justify-between w-full px-2 mt-2">
                    <Dog className="w-3.5 h-3.5 text-neutral-500" />
                    <span className={`text-[9px] font-black uppercase tracking-wider ${currentTheme.subtextColor}`}>
                      HELP ME GET HOME
                    </span>
                    <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                  </div>
                  
                  {effectiveQr && (
                    <div className="p-1 rounded-xl bg-white shadow-2xs border border-neutral-200">
                      <img src={effectiveQr} alt="Collar QR Tag" className="w-20 h-20" />
                    </div>
                  )}
                  
                  <div className="text-center w-full pb-1">
                    <span className={`text-sm font-black ${currentTheme.textColor} leading-none block`}>
                      {puppy.name.toUpperCase()}
                    </span>
                    
                    {contactPhone ? (
                      <span className={`inline-block text-[9px] font-bold ${currentTheme.phoneBg} px-2 py-0.5 rounded-full mt-1 font-mono tracking-tight shadow-2xs`}>
                        {contactPhone}
                      </span>
                    ) : (
                      <span className="text-[8px] font-bold text-neutral-500 mt-1 block">
                        SCAN TO CALL FAMILY
                      </span>
                    )}

                    <span className="text-[7.5px] font-bold text-neutral-400 block mt-0.5 uppercase tracking-wider">
                      PUPLUME SMART ID
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* DESIGN 3: Rounded Squircle Keyring Tag (2" x 2") */}
            {(selectedShape === 'all' || selectedShape === 'squircle') && (
              <div className="flex flex-col items-center">
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-2 flex items-center gap-1 print:hidden">
                  <Scissors className="w-3.5 h-3.5" /> 2&quot; Squircle Keychain
                </span>
                
                <div className={`w-48 h-48 rounded-2xl border-2 border-dashed ${currentTheme.dashedBorder} p-3 flex flex-col items-center justify-between ${currentTheme.bgGradient} shadow-md relative transition-transform hover:scale-102`}>
                  {/* Punch Hole Ring */}
                  <div className="w-3 h-3 rounded-full border border-neutral-500 bg-white absolute top-2 shadow-inner" />
                  
                  <div className="flex items-center justify-between w-full px-1 mt-2">
                    <span className={`text-[9px] font-black tracking-wider ${currentTheme.subtextColor}`}>
                      PUPLUME SAFE PASS
                    </span>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  
                  {effectiveQr && (
                    <div className="p-1 rounded-xl bg-white shadow-2xs border border-neutral-200">
                      <img src={effectiveQr} alt="Collar QR Tag" className="w-20 h-20" />
                    </div>
                  )}
                  
                  <div className="text-center w-full pb-1">
                    <p className={`text-sm font-black ${currentTheme.textColor} leading-none`}>
                      {puppy.name}
                    </p>
                    {contactPhone ? (
                      <p className={`text-[9px] font-bold ${currentTheme.phoneBg} px-2 py-0.5 rounded-md inline-block font-mono mt-1 shadow-2xs`}>
                        {contactPhone}
                      </p>
                    ) : (
                      <p className="text-[8px] font-semibold text-neutral-500 mt-1">
                        Scan QR for Instant Contact
                      </p>
                    )}
                    <span className="text-[7.5px] text-neutral-400 font-mono block mt-0.5">
                      GPS MAPS PIN ON SCAN
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* DESIGN 4: Hexagonal Tactical Shield */}
            {(selectedShape === 'all' || selectedShape === 'hex') && (
              <div className="flex flex-col items-center">
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-2 flex items-center gap-1 print:hidden">
                  <Scissors className="w-3.5 h-3.5" /> Hexagonal Shield Tag
                </span>
                
                <div className={`w-48 h-48 rounded-[36px] border-2 border-dashed ${currentTheme.dashedBorder} p-3 flex flex-col items-center justify-between ${currentTheme.bgGradient} shadow-md relative transition-transform hover:scale-102`}>
                  {/* Punch Hole Ring */}
                  <div className="w-3 h-3 rounded-full border border-neutral-500 bg-white absolute top-2 shadow-inner" />
                  
                  <div className="flex items-center gap-1 mt-2">
                    <Crown className="w-3 h-3 text-amber-500" />
                    <span className={`text-[9px] font-black uppercase tracking-wider ${currentTheme.subtextColor}`}>
                      EMERGENCY CONTACT
                    </span>
                  </div>
                  
                  {effectiveQr && (
                    <div className="p-1 rounded-xl bg-white shadow-2xs border border-neutral-200">
                      <img src={effectiveQr} alt="Collar QR Tag" className="w-20 h-20" />
                    </div>
                  )}
                  
                  <div className="text-center w-full pb-1">
                    <p className={`text-sm font-black ${currentTheme.textColor} leading-none`}>
                      {puppy.name.toUpperCase()}
                    </p>
                    {contactPhone ? (
                      <p className={`text-[9px] font-bold ${currentTheme.phoneBg} px-2 py-0.5 rounded-full inline-block font-mono mt-1 shadow-2xs`}>
                        {contactPhone}
                      </p>
                    ) : (
                      <p className="text-[8px] font-bold text-neutral-500 mt-1">
                        SCAN TO SHARE LIVE GPS
                      </p>
                    )}
                    <span className="text-[7.5px] font-semibold text-neutral-400 block mt-0.5">
                      1-TAP CALL & SMS ENABLED
                    </span>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Bottom Watermark / Instructions Footer */}
          <div className="pt-4 border-t border-dashed border-neutral-300 flex flex-col sm:flex-row items-center justify-between text-[10px] text-neutral-400 gap-2">
            <span>
              💡 <strong>Pro Tip:</strong> Cover front and back with clear packing tape or self-adhesive lamination film for 100% waterproof protection in rain and mud.
            </span>
            <span className="font-mono">
              Designed with PupLume Smart Tag Engine
            </span>
          </div>

        </div>

        {/* Modal Bottom Actions (Hidden when printing) */}
        <div className="p-4 bg-neutral-50 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2 text-xs text-[#766A63]">
            <Sparkles className="w-4 h-4 text-[#8B5E3C]" />
            <span>Printed tags link directly to your pet's live emergency contact profile.</span>
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handlePrint}
              leftIcon={<Printer className="w-4 h-4" />}
              className="font-bold shadow-md"
            >
              Print Tag Sheet
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
};
