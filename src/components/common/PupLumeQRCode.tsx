import React, { useState, useMemo } from 'react';
import { Download, Copy, Check, ExternalLink, QrCode as QrIcon } from 'lucide-react';
import { generatePupLumeQRSvg, downloadPupLumeQR, PupLumeQROptions } from '../../lib/qrCodeGenerator';

interface PupLumeQRCodeProps {
  value: string;
  size?: number; // Visual display size in pixels
  puppyName?: string;
  className?: string;
  showActions?: boolean;
  options?: PupLumeQROptions;
}

export const PupLumeQRCode: React.FC<PupLumeQRCodeProps> = ({
  value,
  size = 220,
  puppyName = 'Pup',
  className = '',
  showActions = true,
  options,
}) => {
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Generate the razor-sharp branded SVG synchronously
  const svgString = useMemo(() => {
    return generatePupLumeQRSvg(value, options);
  }, [value, options]);

  const handleCopy = async () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      const safeName = puppyName.toLowerCase().replace(/[^a-z0-9]/g, '-');
      await downloadPupLumeQR(value, `puplume-qr-${safeName}.png`, {
        size: 1024,
        ...options,
      });
    } catch (e) {
      console.error('Download QR failed:', e);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className={`flex flex-col items-center text-center ${className}`}>
      {/* QR Code Container with Warm Collar-Ring Border */}
      <div 
        className="p-3 bg-white rounded-3xl border-2 border-[#8B5E3C]/30 shadow-md relative group transition-all hover:border-[#8B5E3C] hover:shadow-lg"
        style={{ width: size + 24, height: size + 24 }}
      >
        <div
          className="w-full h-full flex items-center justify-center overflow-hidden rounded-2xl select-none"
          dangerouslySetInnerHTML={{ __html: svgString }}
          style={{ width: size, height: size }}
        />

        {/* Subtle PupLume Tag Badge Overlay at bottom-right */}
        <div className="absolute -bottom-2 -right-2 bg-[#8B5E3C] text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-xs border border-white flex items-center gap-1">
          <QrIcon className="w-2.5 h-2.5" />
          <span>PupLume Tag</span>
        </div>
      </div>

      {/* Action Buttons */}
      {showActions && (
        <div className="mt-4 w-full flex flex-col items-center gap-2">
          <div className="flex items-center gap-2 w-full justify-center">
            <button
              type="button"
              onClick={handleDownload}
              disabled={isDownloading}
              className="flex-1 max-w-[160px] flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#8B5E3C] hover:bg-[#5F3E29] text-white text-xs font-bold shadow-xs transition-all cursor-pointer active:scale-97 disabled:opacity-60"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isDownloading ? 'Saving...' : 'Save PNG'}</span>
            </button>

            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#FFF9F2] hover:bg-[#F3E7DA] text-[#5F3E29] border border-[#E8DDD3] text-xs font-bold transition-all cursor-pointer active:scale-97"
              title="Copy public emergency link"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-extrabold">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#8B5E3C]" />
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>

          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-bold text-[#8B5E3C] hover:text-[#5F3E29] flex items-center gap-1 transition-colors mt-0.5 hover:underline"
          >
            <span>Test scan emergency card</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}
    </div>
  );
};
