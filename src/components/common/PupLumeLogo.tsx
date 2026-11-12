import React from 'react';

interface PupLumeLogoProps {
  variant?: 'full' | 'icon' | 'wordmark';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  onClick?: () => void;
  showBackground?: boolean;
}

export const PupLumeLogo: React.FC<PupLumeLogoProps> = ({
  variant = 'full',
  size = 'md',
  className = '',
  onClick,
  showBackground = false
}) => {
  const iconDimensions = {
    sm: { w: 32, h: 32 },
    md: { w: 40, h: 40 },
    lg: { w: 52, h: 52 },
    xl: { w: 68, h: 68 }
  }[size];

  const textSize = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl'
  }[size];

  const subSize = {
    sm: 'text-[9px] tracking-[0.14em]',
    md: 'text-[10px] tracking-[0.16em]',
    lg: 'text-xs tracking-[0.18em]',
    xl: 'text-sm tracking-[0.2em]'
  }[size];

  return (
    <div
      id="puplume-brand-logo"
      onClick={onClick}
      className={`inline-flex items-center gap-2.5 select-none ${onClick ? 'cursor-pointer transition-opacity hover:opacity-90' : ''} ${className}`}
    >
      {/* Puppy + Lume Sparkle Icon */}
      {(variant === 'full' || variant === 'icon') && (
        <svg
          viewBox="0 0 100 100"
          width={iconDimensions.w}
          height={iconDimensions.h}
          className="flex-shrink-0 drop-shadow-xs"
        >
          <defs>
            <linearGradient id="logoPupGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#A27046" />
              <stop offset="100%" stopColor="#734927" />
            </linearGradient>
            <linearGradient id="logoLumeStar" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDE68A" />
              <stop offset="50%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#8B5E3C" />
            </linearGradient>
          </defs>

          {/* Puppy Head & Floppy Ears (Direct Vector Mascot - No Background Box) */}
          <g transform="translate(6, 4) scale(0.19)">
            <path
              d="M 220 80 C 130 80 70 140 70 240 C 70 330 140 380 220 380 C 300 380 370 330 370 240 C 370 140 310 80 220 80 Z"
              fill="#8B5E3C"
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

            {/* Glowing Lume Star */}
            <g transform="translate(295, 45)">
              <path
                d="M 40 0 C 40 22 58 40 80 40 C 58 40 40 58 40 80 C 40 58 22 40 0 40 C 22 40 40 22 40 0 Z"
                fill="#F59E0B"
              />
              <circle cx="40" cy="40" r="10" fill="#FFF9F2" />
            </g>
          </g>
        </svg>
      )}

      {/* Brand Typography */}
      {(variant === 'full' || variant === 'wordmark') && (
        <div className="flex flex-col leading-none">
          <div className={`font-black tracking-tight text-[#2C211B] ${textSize}`} style={{ fontFamily: "'Grandstander', cursive" }}>
            Pup<span className="text-[#8B5E3C]">Lume</span>
          </div>
          <span className={`font-bold uppercase text-[#766A63] ${subSize} hidden sm:block`}>
            Your Puppy Digital Home
          </span>
        </div>
      )}
    </div>
  );
};
