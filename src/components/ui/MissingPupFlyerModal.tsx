import React, { useRef } from 'react';
import { X, Printer, AlertTriangle, Phone, MapPin, QrCode, Download, Heart } from 'lucide-react';
import { Button } from './Button';
import { PuppyProfile } from '../../types';
import { generatePupLumeQRSvg } from '../../lib/qrCodeGenerator';

interface MissingPupFlyerModalProps {
  isOpen: boolean;
  puppy: PuppyProfile;
  qrDataUrl: string;
  publicUrl: string;
  onClose: () => void;
}

export const MissingPupFlyerModal: React.FC<MissingPupFlyerModalProps> = ({
  isOpen,
  puppy,
  qrDataUrl,
  publicUrl,
  onClose,
}) => {
  const flyerRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const contactPhone = puppy.ownerPhone?.trim() || puppy.emergencyContactPhone?.trim() || 'Scan QR for Contact';
  const effectiveQr = qrDataUrl || (publicUrl ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(generatePupLumeQRSvg(publicUrl))}` : '');
  const rawReward = puppy.rewardAmount?.trim();
  const isNoReward = !rawReward || rawReward.toLowerCase() === 'no reward' || rawReward.toLowerCase() === 'none' || rawReward.toLowerCase() === 'no_reward';
  const rewardText = !isNoReward
    ? (rawReward.toLowerCase().includes('reward') ? rawReward.toUpperCase() : `${rawReward.toUpperCase()} REWARD`)
    : null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/75 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      
      {/* Container */}
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-neutral-300 overflow-hidden my-auto animate-in zoom-in-95 duration-200 print:shadow-none print:border-none print:m-0 print:p-0 print:max-w-none print:w-full">
        
        {/* Top Control Bar (Hidden when printing) */}
        <div className="bg-[#2C211B] text-white p-4 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <span className="font-bold text-sm">Emergency Missing Dog Flyer Preview</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={handlePrint}
              leftIcon={<Printer className="w-4 h-4" />}
            >
              Print / Save PDF
            </Button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/20 text-neutral-300 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Flyer Canvas */}
        <div 
          ref={flyerRef}
          className="p-6 sm:p-8 bg-white text-black space-y-4 print:p-8 print:w-full print:max-w-[800px] print:mx-auto"
        >
          {/* Top Big Header */}
          <div className="bg-red-600 text-white p-4 sm:p-5 rounded-2xl text-center shadow-sm">
            <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight">
              MISSING DOG
            </h1>
            <p className="text-base sm:text-xl font-extrabold text-amber-200 tracking-wide mt-0.5">
              PLEASE HELP US FIND {puppy.name.toUpperCase()}!
            </p>
          </div>

          {/* Reward Banner (Only if reward is offered) */}
          {rewardText && (
            <div className="bg-amber-400 text-amber-950 p-2.5 rounded-xl text-center font-black text-lg sm:text-2xl uppercase tracking-wider border-2 border-amber-500">
              ★ {rewardText} FOR SAFE RETURN ★
            </div>
          )}

          {/* Main Info Columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-center pt-2">
            {/* Big Photo */}
            <div className="flex justify-center">
              <img
                src={puppy.photoUrl}
                alt={puppy.name}
                className="w-56 h-56 sm:w-64 sm:h-64 object-cover rounded-2xl border-4 border-red-600 shadow-md"
              />
            </div>

            {/* Pet Details */}
            <div className="space-y-2 text-left">
              <div className="border-b border-neutral-200 pb-1.5">
                <span className="text-xs uppercase font-bold text-neutral-500">Name</span>
                <p className="text-2xl font-black text-neutral-900">{puppy.name}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 border-b border-neutral-200 pb-1.5">
                <div>
                  <span className="text-xs uppercase font-bold text-neutral-500">Breed</span>
                  <p className="text-sm font-bold text-neutral-800">{puppy.breed}</p>
                </div>
                <div>
                  <span className="text-xs uppercase font-bold text-neutral-500">Sex & Weight</span>
                  <p className="text-sm font-bold text-neutral-800">{puppy.sex} • {puppy.weightLbs} lbs</p>
                </div>
              </div>

              {puppy.temperament && (
                <div className="border-b border-neutral-200 pb-1.5">
                  <span className="text-xs uppercase font-bold text-neutral-500">Temperament</span>
                  <p className="text-xs font-semibold text-neutral-700">{puppy.temperament}</p>
                </div>
              )}

              {puppy.microchipNumber && (
                <div className="border-b border-neutral-200 pb-1.5">
                  <span className="text-xs uppercase font-bold text-neutral-500">Microchip ID</span>
                  <p className="text-xs font-mono font-bold text-neutral-800">{puppy.microchipNumber}</p>
                </div>
              )}

              {puppy.emergencyNotes && (
                <div>
                  <span className="text-xs uppercase font-bold text-neutral-500">Notes</span>
                  <p className="text-xs font-medium text-neutral-700">{puppy.emergencyNotes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Contact & QR Section */}
          <div className="bg-neutral-100 rounded-2xl p-4 sm:p-5 border-2 border-neutral-300 flex flex-col sm:flex-row items-center justify-between gap-4">
            
            <div className="text-center sm:text-left space-y-1">
              <span className="text-xs font-black uppercase tracking-wider text-red-600 flex items-center justify-center sm:justify-start gap-1">
                <Phone className="w-4 h-4" /> CALL OR TEXT 24/7
              </span>
              <p className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
                {contactPhone}
              </p>
              <p className="text-xs text-neutral-600 font-medium">
                No questions asked. Family is heartbroken.
              </p>
            </div>

            {/* QR Tag */}
            {effectiveQr && (
              <div className="bg-white p-2.5 rounded-xl border border-neutral-300 shadow-xs flex flex-col items-center shrink-0">
                <img 
                  src={effectiveQr} 
                  alt="Scan collar tag" 
                  className="w-24 h-24 sm:w-28 sm:h-28" 
                />
                <span className="text-[10px] font-bold text-neutral-600 mt-1 uppercase tracking-wider">
                  Scan to Open Webpage
                </span>
              </div>
            )}
          </div>

          {/* Bottom Footer */}
          <div className="text-center pt-1 text-[11px] text-neutral-500 font-medium">
            Generated via PupLume Smart Tag Network • <span className="font-mono">{publicUrl}</span>
          </div>

        </div>

        {/* Modal Bottom Actions (Hidden when printing) */}
        <div className="p-4 bg-neutral-50 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden">
          <p className="text-xs text-neutral-500">
            Tip: Select &quot;Save as PDF&quot; in your browser print window to save a high-res digital copy.
          </p>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="flex-1 sm:flex-none"
            >
              Close
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handlePrint}
              leftIcon={<Printer className="w-4 h-4" />}
              className="flex-1 sm:flex-none"
            >
              Print Flyer Now
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
};
