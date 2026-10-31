import React from 'react';

interface SmartCollarTagLogoProps {
  variant?: 'full' | 'icon' | 'badge';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  onClick?: () => void;
}

export const SmartCollarTagLogo: React.FC<SmartCollarTagLogoProps> = ({
  variant = 'full',
  size = 'md',
  className = '',
  onClick,
}) => {
  const iconDimensions = {
    sm: { w: 36, h: 36 },
    md: { w: 48, h: 48 },
    lg: { w: 64, h: 64 },
    xl: { w: 84, h: 84 },
  }[size];

  const textSize = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl',
    xl: 'text-2xl',
  }[size];

  const subSize = {
    sm: 'text-[9px] tracking-wider',
    md: 'text-[10px] tracking-wider',
    lg: 'text-xs tracking-wider',
    xl: 'text-sm tracking-wider',
  }[size];

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-3 select-none ${
        onClick ? 'cursor-pointer transition-opacity hover:opacity-90' : ''
      } ${className}`}
    >
      {/* Smart Collar Tag SVG Icon */}
      {(variant === 'full' || variant === 'icon' || variant === 'badge') && (
        <svg
          viewBox="0 0 100 100"
          width={iconDimensions.w}
          height={iconDimensions.h}
          className="flex-shrink-0 drop-shadow-sm"
        >
          <defs>
            <linearGradient id="sclPupGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#A27046" />
              <stop offset="100%" stopColor="#734927" />
            </linearGradient>

            <linearGradient id="sclCollarGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8B5E3C" />
              <stop offset="50%" stopColor="#A76D44" />
              <stop offset="100%" stopColor="#8B5E3C" />
            </linearGradient>

            <linearGradient id="sclGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDE68A" />
              <stop offset="40%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>

            <linearGradient id="sclStarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDE68A" />
              <stop offset="50%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#8B5E3C" />
            </linearGradient>

            <filter id="sclTagShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#2C211B" floodOpacity="0.25" />
            </filter>
          </defs>

          {/* Squircle Base Frame */}
          <rect width="100" height="100" rx="28" fill="#FFF9F2" stroke="#E8DDD3" strokeWidth="2.5" />

          {/* Main Puppy + Collar + Smart Tag Group */}
          <g transform="translate(10, 3) scale(0.18)">
            {/* Puppy Head Base */}
            <path
              d="M 220 80 C 130 80 70 140 70 240 C 70 330 140 380 220 380 C 300 380 370 330 370 240 C 370 140 310 80 220 80 Z"
              fill="url(#sclPupGrad)"
            />

            {/* Floppy Left Ear */}
            <path
              d="M 120 120 C 60 140 30 210 40 290 C 45 320 70 340 95 325 C 115 310 135 250 140 200 Z"
              fill="#5F3E29"
            />

            {/* Floppy Right Ear */}
            <path
              d="M 320 120 C 380 140 410 210 400 290 C 395 320 370 340 345 325 C 325 310 305 250 300 200 Z"
              fill="#5F3E29"
            />

            {/* Snout */}
            <ellipse cx="220" cy="275" rx="85" ry="70" fill="#FFF9F2" />

            {/* Dog Nose */}
            <path
              d="M 195 240 C 195 230 245 230 245 240 C 245 258 228 272 220 272 C 212 272 195 258 195 240 Z"
              fill="#2C211B"
            />
            <ellipse cx="212" cy="238" rx="6" ry="3" fill="#FFFFFF" opacity="0.6" />

            {/* Eyes */}
            <circle cx="165" cy="205" r="14" fill="#2C211B" />
            <circle cx="161" cy="201" r="5" fill="#FFFFFF" />
            <circle cx="275" cy="205" r="14" fill="#2C211B" />
            <circle cx="271" cy="201" r="5" fill="#FFFFFF" />

            {/* Glowing Lume Star on Ear */}
            <g transform="translate(295, 45)">
              <path
                d="M 40 0 C 40 22 58 40 80 40 C 58 40 40 58 40 80 C 40 58 22 40 0 40 C 22 40 40 22 40 0 Z"
                fill="url(#sclStarGrad)"
              />
              <circle cx="40" cy="40" r="10" fill="#FFF9F2" />
            </g>

            {/* ==================== THE COLLAR ==================== */}
            {/* Leather Collar Strap */}
            <path
              d="M 132 342 C 160 366 195 378 220 378 C 245 378 280 366 308 342 L 318 368 C 285 396 248 408 220 408 C 192 408 155 396 122 368 Z"
              fill="url(#sclCollarGrad)"
              stroke="#5F3E29"
              strokeWidth="3"
            />

            {/* Collar Stitching Line */}
            <path
              d="M 130 355 C 160 378 195 390 220 390 C 245 390 280 378 310 355"
              fill="none"
              stroke="#FDE68A"
              strokeWidth="2"
              strokeDasharray="6,4"
              opacity="0.85"
            />

            {/* Golden Collar Studs */}
            <circle cx="152" cy="362" r="5.5" fill="url(#sclGoldGrad)" stroke="#78350F" strokeWidth="1.5" />
            <circle cx="288" cy="362" r="5.5" fill="url(#sclGoldGrad)" stroke="#78350F" strokeWidth="1.5" />

            {/* ==================== HANGING RING ==================== */}
            <circle cx="220" cy="408" r="13" fill="none" stroke="url(#sclGoldGrad)" strokeWidth="5" />
            <circle cx="220" cy="408" r="7" fill="#FFF9F2" />

            {/* ==================== SMART QR MEDALLION / TAG ==================== */}
            <g filter="url(#sclTagShadow)">
              {/* Outer Gold Tag Bezel */}
              <rect
                x="172"
                y="418"
                width="96"
                height="96"
                rx="26"
                fill="url(#sclGoldGrad)"
                stroke="#78350F"
                strokeWidth="3"
              />

              {/* Tag Inner White Scannable Plate */}
              <rect
                x="178"
                y="424"
                width="84"
                height="84"
                rx="20"
                fill="#FFFFFF"
              />

              {/* Corner Position Squares (QR Code Anatomy) */}
              {/* 1. Top-Left QR Target */}
              <rect x="188" y="434" width="22" height="22" rx="5" fill="#2C211B" />
              <rect x="192" y="438" width="14" height="14" rx="3" fill="#FFFFFF" />
              <rect x="195" y="441" width="8" height="8" rx="1.5" fill="#8B5E3C" />

              {/* 2. Top-Right QR Target */}
              <rect x="230" y="434" width="22" height="22" rx="5" fill="#2C211B" />
              <rect x="234" y="438" width="14" height="14" rx="3" fill="#FFFFFF" />
              <rect x="237" y="441" width="8" height="8" rx="1.5" fill="#8B5E3C" />

              {/* 3. Bottom-Left QR Target */}
              <rect x="188" y="476" width="22" height="22" rx="5" fill="#2C211B" />
              <rect x="192" y="480" width="14" height="14" rx="3" fill="#FFFFFF" />
              <rect x="195" y="483" width="8" height="8" rx="1.5" fill="#8B5E3C" />

              {/* QR Data Pixels / Matrix Grid Pattern */}
              <rect x="216" y="440" width="6" height="6" rx="1.5" fill="#8B5E3C" />
              <rect x="216" y="452" width="6" height="6" rx="1.5" fill="#2C211B" />
              <rect x="216" y="464" width="6" height="6" rx="1.5" fill="#D97706" />

              <rect x="228" y="464" width="6" height="6" rx="1.5" fill="#2C211B" />
              <rect x="236" y="464" width="6" height="6" rx="1.5" fill="#8B5E3C" />
              <rect x="244" y="464" width="6" height="6" rx="1.5" fill="#2C211B" />

              <rect x="228" y="474" width="7" height="7" rx="1.5" fill="#8B5E3C" />
              <rect x="241" y="474" width="7" height="7" rx="1.5" fill="#2C211B" />

              <rect x="228" y="486" width="7" height="7" rx="1.5" fill="#2C211B" />
              <rect x="241" y="486" width="7" height="7" rx="1.5" fill="#D97706" />

              {/* Smart Tag Broadcast Sparkle (Tiny Star on Tag) */}
              <path
                d="M 220 422 L 222 427 L 227 427 L 223 430 L 225 435 L 220 432 L 215 435 L 217 430 L 213 427 L 218 427 Z"
                fill="#F59E0B"
              />
            </g>
          </g>
        </svg>
      )}

      {/* Brand Typography */}
      {variant === 'full' && (
        <div className="flex flex-col leading-none">
          <div className={`font-black tracking-tight text-[#2C211B] ${textSize}`}>
            Smart <span className="text-[#8B5E3C]">QR Collar Tag</span>
          </div>
          <span className={`font-bold uppercase text-[#766A63] ${subSize} mt-0.5`}>
            Public Safety Page • puplume.pet/pup
          </span>
        </div>
      )}
    </div>
  );
};
