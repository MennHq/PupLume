const fs = require('fs');
const path = require('path');
const { Resvg } = require('@resvg/resvg-js');

async function main() {
  const photoUrl = 'https://res.cloudinary.com/puplume/image/upload/v1792845578/puplume/pets/j76lqhakqxgczyplknen.jpg';
  console.log('Fetching Graxzo photo from Cloudinary...');
  const res = await fetch(photoUrl);
  const buf = await res.arrayBuffer();
  const b64 = Buffer.from(buf).toString('base64');
  const dataUri = `data:image/jpeg;base64,${b64}`;

  const fonts = [
    path.join(__dirname, '..', 'fonts', 'Grandstander-Black.ttf'),
    path.join(__dirname, '..', 'fonts', 'Grandstander-ExtraBold.ttf'),
    path.join(__dirname, '..', 'fonts', 'Grandstander-Bold.ttf'),
    path.join(__dirname, '..', 'fonts', 'Grandstander-SemiBold.ttf'),
    path.join(__dirname, '..', 'fonts', 'Grandstander-Medium.ttf'),
    path.join(__dirname, '..', 'fonts', 'Grandstander-Regular.ttf'),
  ];

  // Exact Clean PupLume Mascot (NO background box!)
  const cleanMascot = `
    <g transform="translate(0, 0) scale(0.125)">
      <!-- Head Base -->
      <path d="M 220 80 C 130 80 70 140 70 240 C 70 330 140 380 220 380 C 300 380 370 330 370 240 C 370 140 310 80 220 80 Z" fill="url(#pupGrad)"/>
      <!-- Left Ear -->
      <path d="M 120 120 C 60 140 30 210 40 290 C 45 320 70 340 95 325 C 115 310 135 250 140 200 Z" fill="#5F3E29"/>
      <!-- Right Ear -->
      <path d="M 320 120 C 380 140 410 210 400 290 C 395 320 370 340 345 325 C 325 310 305 250 300 200 Z" fill="#5F3E29"/>
      <!-- Snout -->
      <ellipse cx="220" cy="275" rx="85" ry="70" fill="#FFF9F2"/>
      <!-- Nose -->
      <path d="M 195 240 C 195 230 245 230 245 240 C 245 258 228 272 220 272 C 212 272 195 258 195 240 Z" fill="#2C211B"/>
      <ellipse cx="212" cy="238" rx="6" ry="3" fill="#FFFFFF" opacity="0.6"/>
      <!-- Mouth -->
      <path d="M 220 272 L 220 286" stroke="#2C211B" stroke-width="4" stroke-linecap="round"/>
      <path d="M 200 286 C 210 294 220 294 220 286 C 220 294 230 294 240 286" fill="none" stroke="#2C211B" stroke-width="4" stroke-linecap="round"/>
      <!-- Eyes -->
      <circle cx="165" cy="205" r="14" fill="#2C211B"/>
      <circle cx="161" cy="201" r="5" fill="#FFFFFF"/>
      <circle cx="275" cy="205" r="14" fill="#2C211B"/>
      <circle cx="271" cy="201" r="5" fill="#FFFFFF"/>
      <!-- Eyebrows -->
      <ellipse cx="160" cy="180" rx="14" ry="7" fill="#F3E7DA" opacity="0.9"/>
      <ellipse cx="280" cy="180" rx="14" ry="7" fill="#F3E7DA" opacity="0.9"/>
      <!-- Glowing Lume Star -->
      <g transform="translate(295, 45)">
        <path d="M 40 0 C 40 22 58 40 80 40 C 58 40 40 58 40 80 C 40 58 22 40 0 40 C 22 40 40 22 40 0 Z" fill="url(#lumeGrad)"/>
        <circle cx="40" cy="40" r="10" fill="#FFF9F2"/>
      </g>
    </g>
  `;

  // =========================================================================
  // 1. MASTER OPENGRAPH PREVIEW CARD (1200 x 630 px)
  // Clean rounded edges (rx=32), Zero AI slopes, Transparent exact logo,
  // Crisp typography, elevated passport card, perfect spacing.
  // =========================================================================
  const ogSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
    <defs>
      <!-- Warm Skin / Cream Gradient Background -->
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FFFCF7"/>
        <stop offset="55%" stop-color="#FFF6EB"/>
        <stop offset="100%" stop-color="#F1DFC8"/>
      </linearGradient>
      <radialGradient id="leftGlow" cx="15%" cy="30%" r="65%">
        <stop offset="0%" stop-color="#FCDDC7" stop-opacity="0.6"/>
        <stop offset="100%" stop-color="#FFF6EB" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="rightGlow" cx="85%" cy="75%" r="65%">
        <stop offset="0%" stop-color="#FDE68A" stop-opacity="0.35"/>
        <stop offset="100%" stop-color="#FFF6EB" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="pupGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#8B5E3C"/>
        <stop offset="45%" stop-color="#A27046"/>
        <stop offset="100%" stop-color="#734927"/>
      </linearGradient>
      <linearGradient id="lumeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FDE68A"/>
        <stop offset="40%" stop-color="#F59E0B"/>
        <stop offset="100%" stop-color="#8B5E3C"/>
      </linearGradient>
      <!-- High-End Soft Shadows -->
      <filter id="cardShadow" x="-15%" y="-15%" width="130%" height="130%">
        <feDropShadow dx="0" dy="18" stdDeviation="22" flood-color="#734927" flood-opacity="0.11"/>
        <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#734927" flood-opacity="0.04"/>
      </filter>
      <filter id="photoShadow" x="-15%" y="-15%" width="130%" height="130%">
        <feDropShadow dx="0" dy="16" stdDeviation="24" flood-color="#734927" flood-opacity="0.12"/>
      </filter>
      <filter id="sealShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="8" stdDeviation="10" flood-color="#734927" flood-opacity="0.15"/>
      </filter>
      <!-- Clean Round Rect Clip (rx=32, NOT an arch slope!) -->
      <clipPath id="photoClip">
        <rect width="464" height="450" rx="32" />
      </clipPath>
    </defs>

    <!-- Canvas Background -->
    <rect width="1200" height="630" fill="url(#bgGrad)"/>
    <rect width="1200" height="630" fill="url(#leftGlow)"/>
    <rect width="1200" height="630" fill="url(#rightGlow)"/>

    <!-- Top Left: Clean PupLume Brand (NO Background Box!) -->
    <g transform="translate(52, 34)">
      ${cleanMascot}
      <text x="62" y="32" font-family="Grandstander" font-size="38" font-weight="900" fill="#2C211B" letter-spacing="-0.5">
        Pup<tspan fill="#8B5E3C">Lume</tspan>
      </text>
      <text x="64" y="48" font-family="Grandstander" font-size="12" font-weight="800" fill="#766A63" letter-spacing="1.8">
        VERIFIED DIGITAL PET PASSPORT
      </text>
    </g>

    <!-- Top Right: Editorial Brand Caption -->
    <g transform="translate(866, 52)">
      <line x1="0" y1="0" x2="30" y2="0" stroke="#8B5E3C" stroke-width="1.5" />
      <text x="40" y="4" font-family="Grandstander" font-size="11" font-weight="800" fill="#8B5E3C" letter-spacing="1.6">
        SMALL PAWS. BIG PEACE OF MIND.
      </text>
    </g>

    <!-- Left: Hero Pet Photo (Modern Rounded Rectangle rx=32, Double Border) -->
    <g transform="translate(52, 115)">
      <!-- Outline frame -->
      <rect x="-9" y="-9" width="482" height="468" rx="40" fill="none" stroke="#EBDDD0" stroke-width="1.5"/>
      <!-- Photo Container -->
      <g filter="url(#photoShadow)">
        <g clip-path="url(#photoClip)">
          <rect width="464" height="450" fill="#FAF0E4"/>
          <image href="${dataUri}" width="464" height="450" preserveAspectRatio="xMidYMid slice" />
        </g>
      </g>
      <!-- Sparkle accent -->
      <g transform="translate(410, 16)" fill="#8B5E3C" opacity="0.8">
        <path d="M 12 0 C 12 6.6 17.4 12 24 12 C 17.4 12 12 17.4 12 24 C 12 17.4 6.6 12 0 12 C 6.6 12 12 6.6 12 0 Z"/>
      </g>
      <!-- Floating Verified Portrait Seal (Pill rx=23) -->
      <g transform="translate(24, 396)" filter="url(#sealShadow)">
        <rect width="250" height="46" rx="23" fill="#FFFDFB" stroke="#FFFFFF" stroke-width="2"/>
        <g transform="translate(14, 12)">
          <circle cx="11" cy="11" r="11" fill="#087E61"/>
          <text x="11" y="15" font-size="13" text-anchor="middle" fill="#FFFFFF" font-family="Grandstander" font-weight="900">✓</text>
        </g>
        <text x="44" y="28" font-family="Grandstander" font-size="12" font-weight="800" fill="#2C211B">
          A good pup. A verified identity.
        </text>
      </g>
    </g>

    <!-- Right: Elevated Pet Passport Card (width=584, height=422, rx=28) -->
    <g transform="translate(564, 115)" filter="url(#cardShadow)">
      <!-- Card Body -->
      <rect width="584" height="422" rx="28" fill="#FFFDFB" stroke="#FFFFFF" stroke-width="2"/>
      
      <!-- Top Heading -->
      <g transform="translate(30, 26)">
        <g transform="translate(0, 0)">
          <circle cx="9" cy="9" r="9" fill="#8B5E3C"/>
          <text x="9" y="12" font-size="10" text-anchor="middle" fill="#FFFFFF" font-family="Grandstander" font-weight="900">✓</text>
          <text x="26" y="13" font-family="Grandstander" font-size="10.5" font-weight="900" fill="#8B5E3C" letter-spacing="1.4">
            VERIFIED DIGITAL PET PASSPORT
          </text>
        </g>
        <!-- NFC Waves Icon on Right -->
        <g transform="translate(502, 0)" stroke="#8B5E3C" stroke-width="2" fill="none" stroke-linecap="round">
          <path d="M 0 14 C 4 10 4 4 0 0" />
          <path d="M 5 18 C 11 12 11 2 5 -4" />
          <path d="M 10 22 C 18 14 18 0 10 -8" />
        </g>
      </g>

      <!-- Pet Identity -->
      <g transform="translate(30, 64)">
        <text x="0" y="58" font-family="Grandstander" font-size="66" font-weight="900" fill="#2C211B" letter-spacing="-2.5">
          Graxzo<tspan fill="#8B5E3C">.</tspan>
        </text>
        <text x="0" y="88" font-family="Grandstander" font-size="23" font-weight="700" fill="#8B5E3C">
          German Shepherd • 12 lbs • 6 mo
        </text>
      </g>

      <!-- Care Statuses (3 Green Badges) -->
      <g transform="translate(30, 174)">
        <!-- Pill 1: Active Collar Tag -->
        <g transform="translate(0, 0)">
          <rect width="142" height="32" rx="16" fill="#EDF5EC"/>
          <circle cx="18" cy="16" r="4.5" fill="#087E61"/>
          <text x="30" y="21" font-family="Grandstander" font-size="12" font-weight="800" fill="#087E61">
            Active Collar Tag
          </text>
        </g>
        <!-- Pill 2: Vaccinated -->
        <g transform="translate(150, 0)">
          <rect width="112" height="32" rx="16" fill="#EDF5EC"/>
          <circle cx="18" cy="16" r="4.5" fill="#087E61"/>
          <text x="30" y="21" font-family="Grandstander" font-size="12" font-weight="800" fill="#087E61">
            Vaccinated
          </text>
        </g>
        <!-- Pill 3: Emergency Ready -->
        <g transform="translate(270, 0)">
          <rect width="148" height="32" rx="16" fill="#EDF5EC"/>
          <circle cx="18" cy="16" r="4.5" fill="#087E61"/>
          <text x="30" y="21" font-family="Grandstander" font-size="12" font-weight="800" fill="#087E61">
            Emergency Ready
          </text>
        </g>
      </g>

      <!-- Details Divider -->
      <line x1="30" y1="224" x2="554" y2="224" stroke="#EBDDD0" stroke-width="1"/>

      <!-- Microchip Row -->
      <g transform="translate(30, 246)">
        <text x="0" y="0" font-family="Grandstander" font-size="10.5" font-weight="800" fill="#807067" letter-spacing="1">
          MICROCHIP ID
        </text>
        <text x="115" y="0" font-family="Grandstander" font-size="15" font-weight="800" fill="#2C211B" letter-spacing="0.3">
          985-GRAXZO-2025-PUP
        </text>

        <text x="0" y="28" font-family="Grandstander" font-size="10.5" font-weight="800" fill="#807067" letter-spacing="1">
          CARE NOTES
        </text>
        <text x="115" y="28" font-family="Grandstander" font-size="14" font-weight="600" fill="#8B5E3C">
          Playful, affectionate, and learning fast
        </text>
      </g>

      <!-- Bottom Collar Scan Bar -->
      <g transform="translate(0, 317)">
        <path d="M 0 0 L 584 0 L 584 77 C 584 92.464 571.464 105 556 105 L 28 105 C 12.536 105 0 92.464 0 77 Z" fill="#8B5E3C" />
        <!-- Scan Icon -->
        <g transform="translate(30, 38)" stroke="#FFFFFF" stroke-width="2.5" fill="none">
          <path d="M 0 8 L 0 0 L 8 0" stroke-linecap="round"/>
          <path d="M 20 0 L 28 0 L 28 8" stroke-linecap="round"/>
          <path d="M 0 20 L 0 28 L 8 28" stroke-linecap="round"/>
          <path d="M 20 28 L 28 28 L 28 20" stroke-linecap="round"/>
          <line x1="4" y1="14" x2="24" y2="14" stroke="#FDE68A" stroke-linecap="round"/>
        </g>
        <!-- Text -->
        <text x="74" y="52" font-family="Grandstander" font-size="14.5" font-weight="900" fill="#FFFFFF">
          One scan. Right by their side.
        </text>
        <text x="74" y="73" font-family="Grandstander" font-size="11" font-weight="600" fill="#F7E4D2">
          Scan collar tag for live emergency contacts &amp; medical vault
        </text>
      </g>
    </g>

    <!-- Bottom Signature -->
    <g transform="translate(566, 576)">
      <text x="0" y="0" font-family="Grandstander" font-size="16" font-weight="800" fill="#2C211B">
        puplumepet.vercel.app
      </text>
      <g transform="translate(470, -12)">
        <text x="0" y="12" font-size="13" fill="#8B5E3C">♡</text>
        <text x="18" y="12" font-family="Grandstander" font-size="11.5" font-weight="700" fill="#8B5E3C">
          Care, connected.
        </text>
      </g>
    </g>
  </svg>`;

  // =========================================================================
  // 2. MASTER INSTAGRAM STORY TEMPLATE (1080 x 1920 px, 9:16)
  // Perfectly translated to vertical format:
  // - Top brand header (clean mascot, NO background box)
  // - Hero pet photo with clean rounded edges (rx=40)
  // - Verified portrait seal pill
  // - Elevated passport specs card with status pills, microchip, scan bar
  // - Bottom Link Sticker Safe Zone
  // =========================================================================
  const storySvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1920" width="1080" height="1920">
    <defs>
      <linearGradient id="storyBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FFFCF7"/>
        <stop offset="55%" stop-color="#FFF6EB"/>
        <stop offset="100%" stop-color="#F1DFC8"/>
      </linearGradient>
      <radialGradient id="storyGlow" cx="20%" cy="20%" r="60%">
        <stop offset="0%" stop-color="#FCDDC7" stop-opacity="0.55"/>
        <stop offset="100%" stop-color="#FFF6EB" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="storyAmberGlow" cx="80%" cy="70%" r="60%">
        <stop offset="0%" stop-color="#FDE68A" stop-opacity="0.4"/>
        <stop offset="100%" stop-color="#FFF6EB" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="pupGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#8B5E3C"/>
        <stop offset="45%" stop-color="#A27046"/>
        <stop offset="100%" stop-color="#734927"/>
      </linearGradient>
      <linearGradient id="lumeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FDE68A"/>
        <stop offset="40%" stop-color="#F59E0B"/>
        <stop offset="100%" stop-color="#8B5E3C"/>
      </linearGradient>
      <filter id="storyCardShadow" x="-15%" y="-15%" width="130%" height="130%">
        <feDropShadow dx="0" dy="24" stdDeviation="28" flood-color="#734927" flood-opacity="0.12"/>
      </filter>
      <filter id="storyPhotoShadow" x="-15%" y="-15%" width="130%" height="130%">
        <feDropShadow dx="0" dy="20" stdDeviation="26" flood-color="#734927" flood-opacity="0.12"/>
      </filter>
      <clipPath id="storyPhotoClip">
        <rect width="880" height="780" rx="40" />
      </clipPath>
    </defs>

    <rect width="1080" height="1920" fill="url(#storyBgGrad)"/>
    <rect width="1080" height="1920" fill="url(#storyGlow)"/>
    <rect width="1080" height="1920" fill="url(#storyAmberGlow)"/>

    <!-- Header Brand (Safe zone below y=210) -->
    <g transform="translate(100, 230)">
      ${cleanMascot}
      <text x="68" y="34" font-family="Grandstander" font-size="42" font-weight="900" fill="#2C211B" letter-spacing="-0.5">
        Pup<tspan fill="#8B5E3C">Lume</tspan>
      </text>
      <text x="70" y="54" font-family="Grandstander" font-size="13" font-weight="800" fill="#766A63" letter-spacing="2">
        VERIFIED DIGITAL PET PASSPORT
      </text>
      <g transform="translate(740, 14)">
        <text x="0" y="14" font-family="Grandstander" font-size="12" font-weight="800" fill="#8B5E3C" letter-spacing="1.5">
          CANINE TAG
        </text>
      </g>
    </g>

    <!-- Hero Pet Photo (Modern Squircle rx=40, Clean Rounded Edges) -->
    <g transform="translate(100, 325)">
      <g filter="url(#storyPhotoShadow)">
        <g clip-path="url(#storyPhotoClip)">
          <rect width="880" height="780" fill="#FAF0E4"/>
          <image href="${dataUri}" width="880" height="780" preserveAspectRatio="xMidYMid slice" />
        </g>
      </g>
      <!-- Floating Verified Portrait Seal -->
      <g transform="translate(36, 706)" filter="url(#storyCardShadow)">
        <rect width="320" height="52" rx="26" fill="#FFFDFB" stroke="#FFFFFF" stroke-width="2.5"/>
        <circle cx="26" cy="26" r="14" fill="#087E61"/>
        <text x="26" y="31" font-size="16" text-anchor="middle" fill="#FFFFFF" font-family="Grandstander" font-weight="900">✓</text>
        <text x="52" y="33" font-family="Grandstander" font-size="14" font-weight="800" fill="#2C211B">
          A good pup. Verified identity.
        </text>
      </g>
    </g>

    <!-- Elevated Pet Passport Card (width=880, height=480, rx=36) -->
    <g transform="translate(100, 1150)" filter="url(#storyCardShadow)">
      <rect width="880" height="480" rx="36" fill="#FFFDFB" stroke="#FFFFFF" stroke-width="2.5"/>

      <!-- Card Top Heading -->
      <g transform="translate(44, 34)">
        <circle cx="10" cy="10" r="10" fill="#8B5E3C"/>
        <text x="10" y="14" font-size="11" text-anchor="middle" fill="#FFFFFF" font-family="Grandstander" font-weight="900">✓</text>
        <text x="30" y="15" font-family="Grandstander" font-size="13" font-weight="900" fill="#8B5E3C" letter-spacing="1.5">
          VERIFIED CANINE PASSPORT
        </text>
      </g>

      <!-- Pet Name & Breed -->
      <g transform="translate(44, 78)">
        <text x="0" y="60" font-family="Grandstander" font-size="72" font-weight="900" fill="#2C211B" letter-spacing="-2">
          Graxzo<tspan fill="#8B5E3C">.</tspan>
        </text>
        <text x="0" y="94" font-family="Grandstander" font-size="28" font-weight="700" fill="#8B5E3C">
          German Shepherd • 12 lbs • 6 mo
        </text>
      </g>

      <!-- Status Pills -->
      <g transform="translate(44, 198)">
        <g transform="translate(0, 0)">
          <rect width="180" height="38" rx="19" fill="#EDF5EC"/>
          <circle cx="20" cy="19" r="5.5" fill="#087E61"/>
          <text x="36" y="25" font-family="Grandstander" font-size="14" font-weight="800" fill="#087E61">
            Active Collar Tag
          </text>
        </g>
        <g transform="translate(195, 0)">
          <rect width="140" height="38" rx="19" fill="#EDF5EC"/>
          <circle cx="20" cy="19" r="5.5" fill="#087E61"/>
          <text x="36" y="25" font-family="Grandstander" font-size="14" font-weight="800" fill="#087E61">
            Vaccinated
          </text>
        </g>
        <g transform="translate(350, 0)">
          <rect width="186" height="38" rx="19" fill="#EDF5EC"/>
          <circle cx="20" cy="19" r="5.5" fill="#087E61"/>
          <text x="36" y="25" font-family="Grandstander" font-size="14" font-weight="800" fill="#087E61">
            Emergency Ready
          </text>
        </g>
      </g>

      <!-- Divider -->
      <line x1="44" y1="256" x2="836" y2="256" stroke="#EBDDD0" stroke-width="1.5"/>

      <!-- Microchip Details -->
      <g transform="translate(44, 284)">
        <text x="0" y="0" font-family="Grandstander" font-size="13" font-weight="800" fill="#807067" letter-spacing="1">
          MICROCHIP ID
        </text>
        <text x="160" y="0" font-family="Grandstander" font-size="18" font-weight="800" fill="#2C211B">
          985-GRAXZO-2025-PUP
        </text>

        <text x="0" y="36" font-family="Grandstander" font-size="13" font-weight="800" fill="#807067" letter-spacing="1">
          CARE NOTES
        </text>
        <text x="160" y="36" font-family="Grandstander" font-size="16" font-weight="600" fill="#8B5E3C">
          Playful, affectionate, and learning fast
        </text>
      </g>

      <!-- Bottom Bar (Scan Info) -->
      <g transform="translate(0, 368)">
        <path d="M 0 0 L 880 0 L 880 76 C 880 95.882 863.882 112 844 112 L 36 112 C 16.118 112 0 95.882 0 76 Z" fill="#8B5E3C" />
        <g transform="translate(44, 38)" stroke="#FFFFFF" stroke-width="2.5" fill="none">
          <path d="M 0 8 L 0 0 L 8 0" stroke-linecap="round"/>
          <path d="M 22 0 L 30 0 L 30 8" stroke-linecap="round"/>
          <path d="M 0 22 L 0 30 L 8 30" stroke-linecap="round"/>
          <path d="M 22 30 L 30 30 L 30 22" stroke-linecap="round"/>
          <line x1="5" y1="15" x2="25" y2="15" stroke="#FDE68A" stroke-linecap="round"/>
        </g>
        <text x="96" y="54" font-family="Grandstander" font-size="18" font-weight="900" fill="#FFFFFF">
          One scan. Right by their side.
        </text>
        <text x="96" y="78" font-family="Grandstander" font-size="13" font-weight="600" fill="#F7E4D2">
          Scan collar tag for live emergency contacts &amp; medical vault
        </text>
      </g>
    </g>

    <!-- Bottom Link Sticker Callout (Safe Zone above y=1680) -->
    <g transform="translate(100, 1680)" filter="url(#storyCardShadow)">
      <rect width="880" height="96" rx="32" fill="#FFFFFF" stroke="#E8DDD3" stroke-width="2"/>
      <g transform="translate(440, 56)" text-anchor="middle">
        <text font-family="Grandstander" font-size="24" font-weight="900" fill="#8B5E3C">
          TAP LINK STICKER TO VIEW PASSPORT 🐾
        </text>
      </g>
    </g>
  </svg>`;

  // Write SVGs
  const ogSvgPath = path.join(__dirname, '..', 'public', 'master-og-preview.svg');
  const storySvgPath = path.join(__dirname, '..', 'public', 'master-story-template.svg');
  fs.writeFileSync(ogSvgPath, ogSvg, 'utf8');
  fs.writeFileSync(storySvgPath, storySvg, 'utf8');

  // Render PNGs
  const resvgOg = new Resvg(ogSvg, {
    fitTo: { mode: 'width', value: 1200 },
    font: { fontFiles: fonts, defaultFontFamily: 'Grandstander' }
  });
  const ogPng = resvgOg.render().asPng();
  const ogPngPath = path.join(__dirname, '..', 'public', 'master-og-preview.png');
  fs.writeFileSync(ogPngPath, ogPng);
  console.log(`Rendered master-og-preview.png (${ogPng.length} bytes)`);

  const resvgStory = new Resvg(storySvg, {
    fitTo: { mode: 'width', value: 1080 },
    font: { fontFiles: fonts, defaultFontFamily: 'Grandstander' }
  });
  const storyPng = resvgStory.render().asPng();
  const storyPngPath = path.join(__dirname, '..', 'public', 'master-story-template.png');
  fs.writeFileSync(storyPngPath, storyPng);
  console.log(`Rendered master-story-template.png (${storyPng.length} bytes)`);
}

main().catch(console.error);
