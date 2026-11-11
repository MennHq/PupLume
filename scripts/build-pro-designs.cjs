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

  // ==========================================
  // SHARED DEFINITIONS
  // ==========================================
  const sharedDefs = `
    <linearGradient id="warmCanvas" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFCF7"/>
      <stop offset="45%" stop-color="#FFF7EE"/>
      <stop offset="85%" stop-color="#FAF1E4"/>
      <stop offset="100%" stop-color="#F3E5D4"/>
    </linearGradient>
    <radialGradient id="peachGlow" cx="20%" cy="25%" r="75%">
      <stop offset="0%" stop-color="#FCDDC7" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="#FFF7EE" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="amberGlow" cx="85%" cy="75%" r="65%">
      <stop offset="0%" stop-color="#FDE68A" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#FFF7EE" stop-opacity="0"/>
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
    <filter id="softCardShadow" x="-15%" y="-15%" width="130%" height="130%">
      <feDropShadow dx="0" dy="16" stdDeviation="24" flood-color="#4A2E1B" flood-opacity="0.08"/>
      <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#4A2E1B" flood-opacity="0.03"/>
    </filter>
    <filter id="heroPhotoShadow" x="-15%" y="-15%" width="130%" height="130%">
      <feDropShadow dx="0" dy="18" stdDeviation="26" flood-color="#4A2E1B" flood-opacity="0.10"/>
      <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#4A2E1B" flood-opacity="0.04"/>
    </filter>
    <clipPath id="photoRoundClip">
      <rect width="460" height="470" rx="36" />
    </clipPath>
    <clipPath id="storyPhotoRoundClip">
      <rect width="880" height="840" rx="40" />
    </clipPath>
  `;

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
  // DESIGN 1: Master Professional OpenGraph Preview Card (1200 x 630 px)
  // Clean No-Background Logo • Rounded Squircle Photo • Elevated Passport Card
  // =========================================================================
  const proOg1 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
    <defs>${sharedDefs}</defs>

    <!-- Canvas -->
    <rect width="1200" height="630" fill="url(#warmCanvas)"/>
    <rect width="1200" height="630" fill="url(#peachGlow)"/>
    <rect width="1200" height="630" fill="url(#amberGlow)"/>

    <!-- Top Left: Clean PupLume Logo (NO BACKGROUND BOX) -->
    <g transform="translate(60, 42)">
      ${cleanMascot}
      <text x="62" y="32" font-family="Grandstander" font-size="34" font-weight="900" fill="#2C211B" letter-spacing="-0.5">
        Pup<tspan fill="#8B5E3C">Lume</tspan>
      </text>
      <text x="64" y="48" font-family="Grandstander" font-size="11" font-weight="700" fill="#766A63" letter-spacing="2">
        VERIFIED DIGITAL PET PASSPORT
      </text>
    </g>

    <!-- Top Right: Minimal Brand Tagline -->
    <g transform="translate(860, 52)">
      <circle cx="0" cy="6" r="3" fill="#8B5E3C"/>
      <text x="12" y="10" font-family="Grandstander" font-size="12" font-weight="700" fill="#8B5E3C" letter-spacing="2">
        LIVE SAFETY COLLAR TAG
      </text>
    </g>

    <!-- Left Side: Hero Pet Photo (Modern Squircle rx=36, Zero Weird Slopes) -->
    <g transform="translate(60, 115)" filter="url(#heroPhotoShadow)">
      <g clip-path="url(#photoRoundClip)">
        <rect width="460" height="470" fill="#FAF0E4"/>
        <image href="${dataUri}" width="460" height="470" preserveAspectRatio="xMidYMid slice" />
      </g>
      <!-- Floating Verified Badge (Clean Pill) -->
      <g transform="translate(24, 404)" filter="url(#softCardShadow)">
        <rect width="210" height="42" rx="21" fill="#FFFFFF" stroke="#E8DDD3" stroke-width="1.5"/>
        <circle cx="22" cy="21" r="12" fill="#059669"/>
        <text x="22" y="26" font-size="14" text-anchor="middle" fill="#FFFFFF" font-family="Grandstander" font-weight="900">✓</text>
        <text x="44" y="27" font-family="Grandstander" font-size="12" font-weight="800" fill="#2C211B">Verified Pet Identity</text>
      </g>
    </g>

    <!-- Right Side: Elevated Passport Details Card (rx=32) -->
    <g transform="translate(560, 115)" filter="url(#softCardShadow)">
      <rect width="580" height="470" rx="32" fill="#FFFDFB" stroke="#EFE4D8" stroke-width="2"/>

      <!-- Card Inner Padding -->
      <g transform="translate(36, 32)">
        
        <!-- Header: Shield + Passport Tag -->
        <g transform="translate(0, 0)">
          <circle cx="10" cy="9" r="9" fill="#059669"/>
          <text x="10" y="13" font-size="10" text-anchor="middle" fill="#FFFFFF" font-family="Grandstander" font-weight="900">✓</text>
          <text x="26" y="13" font-family="Grandstander" font-size="11" font-weight="800" fill="#8B5E3C" letter-spacing="1.5">
            VERIFIED CANINE PASSPORT
          </text>
          <!-- Smart Tag Chip Indicator -->
          <g transform="translate(460, 0)">
            <rect width="48" height="20" rx="10" fill="#FAF2E6" stroke="#E8DDD3" stroke-width="1"/>
            <text x="24" y="14" font-family="Grandstander" font-size="10" font-weight="900" fill="#8B5E3C" text-anchor="middle">TAG</text>
          </g>
        </g>

        <!-- Pet Name: Bold Grandstander Black 900 -->
        <text x="0" y="78" font-family="Grandstander" font-size="64" font-weight="900" fill="#2C211B" letter-spacing="-1.5">
          Graxzo<tspan fill="#8B5E3C">.</tspan>
        </text>

        <!-- Breed & Age -->
        <text x="0" y="112" font-family="Grandstander" font-size="22" font-weight="700" fill="#8B5E3C">
          German Shepherd • 12 lbs • 6 mo
        </text>

        <!-- Status Pills -->
        <g transform="translate(0, 142)">
          <!-- Pill 1: Active Tag -->
          <g transform="translate(0, 0)">
            <rect width="144" height="32" rx="16" fill="#EDF5EC" stroke="#CBE6C9" stroke-width="1"/>
            <circle cx="16" cy="16" r="4.5" fill="#059669"/>
            <text x="28" y="21" font-family="Grandstander" font-size="12" font-weight="800" fill="#087E61">Active Collar Tag</text>
          </g>

          <!-- Pill 2: Vaccinated -->
          <g transform="translate(154, 0)">
            <rect width="116" height="32" rx="16" fill="#EDF5EC" stroke="#CBE6C9" stroke-width="1"/>
            <circle cx="16" cy="16" r="4.5" fill="#059669"/>
            <text x="28" y="21" font-family="Grandstander" font-size="12" font-weight="800" fill="#087E61">Vaccinated</text>
          </g>

          <!-- Pill 3: Emergency Ready -->
          <g transform="translate(280, 0)">
            <rect width="146" height="32" rx="16" fill="#EDF5EC" stroke="#CBE6C9" stroke-width="1"/>
            <circle cx="16" cy="16" r="4.5" fill="#059669"/>
            <text x="28" y="21" font-family="Grandstander" font-size="12" font-weight="800" fill="#087E61">Emergency Ready</text>
          </g>
        </g>

        <!-- Divider Line -->
        <line x1="0" y1="198" x2="508" y2="198" stroke="#F0E5D8" stroke-width="1.5" />

        <!-- Microchip Row -->
        <g transform="translate(0, 228)">
          <text x="0" y="0" font-family="Grandstander" font-size="11" font-weight="800" fill="#766A63" letter-spacing="1.5">
            MICROCHIP ID
          </text>
          <text x="130" y="0" font-family="Grandstander" font-size="15" font-weight="900" fill="#2C211B" letter-spacing="0.5">
            985-GRAXZO-2025-PUP
          </text>

          <text x="0" y="32" font-family="Grandstander" font-size="11" font-weight="800" fill="#766A63" letter-spacing="1.5">
            CARE NOTES
          </text>
          <text x="130" y="32" font-family="Grandstander" font-size="14" font-weight="600" fill="#5F3E29">
            Playful, affectionate, and learning fast
          </text>
        </g>

        <!-- Bottom Collar Scan Bar (Integrated inside card) -->
        <g transform="translate(0, 288)">
          <rect width="508" height="88" rx="20" fill="#8B5E3C" />
          <!-- Scan Icon -->
          <g transform="translate(20, 24)" stroke="#FFFFFF" stroke-width="2.5" fill="none">
            <path d="M 0 10 L 0 0 L 10 0" stroke-linecap="round"/>
            <path d="M 30 0 L 40 0 L 40 10" stroke-linecap="round"/>
            <path d="M 0 30 L 0 40 L 10 40" stroke-linecap="round"/>
            <path d="M 30 40 L 40 40 L 40 30" stroke-linecap="round"/>
            <line x1="6" y1="20" x2="34" y2="20" stroke-linecap="round" stroke="#FDE68A"/>
          </g>
          <text x="76" y="38" font-family="Grandstander" font-size="15" font-weight="900" fill="#FFFFFF">
            One tap. Right by their side.
          </text>
          <text x="76" y="60" font-family="Grandstander" font-size="11" font-weight="600" fill="#F7E4D2">
            Scan collar tag for live emergency contacts &amp; medical vault
          </text>
        </g>
      </g>
    </g>

    <!-- Bottom Canvas Footer -->
    <g transform="translate(560, 604)">
      <text x="0" y="0" font-family="Grandstander" font-size="13" font-weight="800" fill="#2C211B">
        puplumepet.vercel.app
      </text>
      <text x="420" y="0" font-family="Grandstander" font-size="12" font-weight="700" fill="#8B5E3C">
        Care, connected. 🐾
      </text>
    </g>
  </svg>`;

  // =========================================================================
  // DESIGN 2: Clean Editorial OpenGraph Card (1200 x 630 px)
  // Pure Typographic Rhythm • No Nested Boxes • No Slopes
  // =========================================================================
  const proOg2 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
    <defs>${sharedDefs}</defs>

    <rect width="1200" height="630" fill="url(#warmCanvas)"/>
    <rect width="1200" height="630" fill="url(#peachGlow)"/>
    <rect width="1200" height="630" fill="url(#amberGlow)"/>

    <!-- Left: Borderless Photo (Modern Squircle rx=36) -->
    <g transform="translate(80, 80)" filter="url(#heroPhotoShadow)">
      <g clip-path="url(#photoRoundClip)">
        <rect width="460" height="470" fill="#FAF0E4"/>
        <image href="${dataUri}" width="460" height="470" preserveAspectRatio="xMidYMid slice" />
      </g>
      <g transform="translate(390, 24)">
        <circle cx="22" cy="22" r="22" fill="#059669" stroke="#FFFFFF" stroke-width="3"/>
        <text x="22" y="29" font-size="18" text-anchor="middle" fill="#FFFFFF" font-family="Grandstander" font-weight="900">✓</text>
      </g>
    </g>

    <!-- Right: Editorial Hierarchy (Direct on Canvas, Zero Boxes) -->
    <g transform="translate(590, 80)">
      <!-- Logo Mark (No Background Box!) -->
      <g transform="translate(0, 0)">
        ${cleanMascot}
        <text x="64" y="32" font-family="Grandstander" font-size="36" font-weight="900" fill="#2C211B" letter-spacing="-0.5">
          Pup<tspan fill="#8B5E3C">Lume</tspan>
        </text>
        <text x="66" y="50" font-family="Grandstander" font-size="12" font-weight="700" fill="#766A63" letter-spacing="2.5">
          VERIFIED DIGITAL PET PASSPORT
        </text>
      </g>

      <!-- Pet Name -->
      <text x="0" y="152" font-family="Grandstander" font-size="82" font-weight="900" fill="#2C211B" letter-spacing="-2">
        Graxzo<tspan fill="#8B5E3C">.</tspan>
      </text>

      <!-- Breed & Attributes -->
      <text x="0" y="200" font-family="Grandstander" font-size="30" font-weight="700" fill="#8B5E3C">
        German Shepherd • 12 lbs • 6 mo
      </text>

      <!-- Status Pills -->
      <g transform="translate(0, 248)">
        <circle cx="6" cy="-6" r="5" fill="#059669" />
        <text x="20" y="0" font-family="Grandstander" font-size="20" font-weight="800" fill="#059669">
          Active Collar Tag
        </text>

        <circle cx="220" cy="-6" r="5" fill="#059669" />
        <text x="235" y="0" font-family="Grandstander" font-size="20" font-weight="800" fill="#059669">
          Vaccinated
        </text>

        <circle cx="380" cy="-6" r="5" fill="#059669" />
        <text x="395" y="0" font-family="Grandstander" font-size="20" font-weight="800" fill="#059669">
          Emergency Ready
        </text>
      </g>

      <!-- Microchip Specs -->
      <g transform="translate(0, 298)">
        <text x="0" y="0" font-family="Grandstander" font-size="14" font-weight="800" fill="#766A63" letter-spacing="1.5">
          MICROCHIP ID:
        </text>
        <text x="140" y="0" font-family="Grandstander" font-size="18" font-weight="900" fill="#2C211B">
          985-GRAXZO-2025-PUP
        </text>

        <text x="0" y="38" font-family="Grandstander" font-size="14" font-weight="800" fill="#766A63" letter-spacing="1.5">
          CARE NOTES:
        </text>
        <text x="125" y="38" font-family="Grandstander" font-size="18" font-weight="600" fill="#5F3E29">
          Playful, affectionate, and learning fast
        </text>
      </g>

      <!-- Footer URL -->
      <g transform="translate(0, 415)">
        <text x="0" y="0" font-family="Grandstander" font-size="28" font-weight="900" fill="#2C211B">
          puplumepet.vercel.app
        </text>
        <text x="0" y="28" font-family="Grandstander" font-size="16" font-weight="600" fill="#766A63">
          Scan collar tag for live emergency contacts &amp; medical vault
        </text>
      </g>
    </g>
  </svg>`;

  // =========================================================================
  // DESIGN 3: Master Spotify-Style Instagram Story (1080 x 1920 px, 9:16)
  // Clean No-Background Logo • Rounded Squircle Hero • Link Sticker Safe Zone
  // =========================================================================
  const proStory1 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1920" width="1080" height="1920">
    <defs>${sharedDefs}</defs>

    <rect width="1080" height="1920" fill="url(#warmCanvas)"/>
    <rect width="1080" height="1920" fill="url(#peachGlow)"/>
    <rect width="1080" height="1920" fill="url(#amberGlow)"/>

    <!-- Header Section (Safe zone below y=200) -->
    <g transform="translate(100, 230)">
      ${cleanMascot}
      <text x="76" y="36" font-family="Grandstander" font-size="44" font-weight="900" fill="#2C211B" letter-spacing="-0.5">
        Pup<tspan fill="#8B5E3C">Lume</tspan>
      </text>
      <text x="78" y="58" font-family="Grandstander" font-size="14" font-weight="800" fill="#766A63" letter-spacing="2.5">
        VERIFIED DIGITAL PET PASSPORT
      </text>
    </g>

    <!-- Large Rounded Photo (Squircle rx=40, Clean & High-End) -->
    <g transform="translate(100, 335)" filter="url(#heroPhotoShadow)">
      <g clip-path="url(#storyPhotoRoundClip)">
        <rect width="880" height="840" fill="#FAF0E4"/>
        <image href="${dataUri}" width="880" height="840" preserveAspectRatio="xMidYMid slice" />
      </g>
      <!-- Verified Emerald Badge -->
      <g transform="translate(790, 40)">
        <circle cx="34" cy="34" r="34" fill="#059669" stroke="#FFFFFF" stroke-width="4"/>
        <text x="34" y="44" font-size="30" text-anchor="middle" fill="#FFFFFF" font-family="Grandstander" font-weight="900">✓</text>
      </g>
    </g>

    <!-- Content: Bold Name & Attributes -->
    <g transform="translate(100, 1260)">
      <text x="0" y="0" font-family="Grandstander" font-size="84" font-weight="900" fill="#2C211B" letter-spacing="-2">
        Graxzo<tspan fill="#8B5E3C">.</tspan>
      </text>
      <text x="0" y="52" font-family="Grandstander" font-size="36" font-weight="700" fill="#8B5E3C">
        German Shepherd • 12 lbs • 6 mo
      </text>

      <!-- Status Indicators -->
      <g transform="translate(0, 110)">
        <circle cx="10" cy="-8" r="8" fill="#059669" />
        <text x="30" y="0" font-family="Grandstander" font-size="26" font-weight="800" fill="#059669">
          Active Collar Tag
        </text>

        <circle cx="300" cy="-8" r="8" fill="#059669" />
        <text x="320" y="0" font-family="Grandstander" font-size="26" font-weight="800" fill="#059669">
          Vaccinated
        </text>

        <circle cx="530" cy="-8" r="8" fill="#059669" />
        <text x="550" y="0" font-family="Grandstander" font-size="26" font-weight="800" fill="#059669">
          Emergency Ready
        </text>
      </g>

      <!-- Microchip & Care Note -->
      <g transform="translate(0, 180)">
        <text x="0" y="0" font-family="Grandstander" font-size="20" font-weight="800" fill="#766A63" letter-spacing="1.5">
          MICROCHIP ID:
        </text>
        <text x="180" y="0" font-family="Grandstander" font-size="24" font-weight="900" fill="#2C211B">
          985-GRAXZO-2025-PUP
        </text>

        <text x="0" y="46" font-family="Grandstander" font-size="20" font-weight="800" fill="#766A63" letter-spacing="1.5">
          CARE NOTES:
        </text>
        <text x="160" y="46" font-family="Grandstander" font-size="24" font-weight="600" fill="#5F3E29">
          Playful, affectionate, and learning fast
        </text>
      </g>
    </g>

    <!-- Bottom Spotify-Style Link Callout Bar (Safe Zone above y=1680) -->
    <g transform="translate(100, 1580)" filter="url(#softCardShadow)">
      <rect width="880" height="92" rx="30" fill="#FFFFFF" stroke="#E8DDD3" stroke-width="2"/>
      <text x="440" y="56" font-family="Grandstander" font-size="26" font-weight="900" fill="#8B5E3C" text-anchor="middle">
        TAP LINK STICKER TO VIEW PASSPORT 🐾
      </text>
    </g>
  </svg>`;

  // =========================================================================
  // DESIGN 4: Elevated Canine Passport Instagram Story (1080 x 1920 px, 9:16)
  // Clean Passport ID Document Card on Warm Canvas
  // =========================================================================
  const proStory2 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1920" width="1080" height="1920">
    <defs>${sharedDefs}</defs>

    <rect width="1080" height="1920" fill="url(#warmCanvas)"/>
    <rect width="1080" height="1920" fill="url(#peachGlow)"/>

    <!-- Passport Card Frame (Clean rx=48) -->
    <g transform="translate(90, 240)" filter="url(#heroPhotoShadow)">
      <rect width="900" height="1420" rx="48" fill="#FFFDFB" stroke="#E8DDD3" stroke-width="2.5"/>

      <!-- Inner Header: Clean No-Box Logo -->
      <g transform="translate(56, 56)">
        ${cleanMascot}
        <text x="70" y="32" font-family="Grandstander" font-size="38" font-weight="900" fill="#2C211B">
          Pup<tspan fill="#8B5E3C">Lume</tspan>
        </text>
        <text x="72" y="52" font-family="Grandstander" font-size="13" font-weight="800" fill="#8B5E3C" letter-spacing="2">
          OFFICIAL CANINE PASSPORT
        </text>

        <g transform="translate(710, 8)">
          <rect width="78" height="36" rx="18" fill="#FAF2E6" stroke="#8B5E3C" stroke-width="1.5"/>
          <text x="39" y="23" font-family="Grandstander" font-size="14" font-weight="900" fill="#8B5E3C" text-anchor="middle">PASS</text>
        </g>
      </g>

      <!-- Photo (Squircle rx=36) -->
      <g transform="translate(56, 140)">
        <clipPath id="innerStoryPhotoClip">
          <rect width="788" height="740" rx="36" />
        </clipPath>
        <g clip-path="url(#innerStoryPhotoClip)">
          <rect width="788" height="740" fill="#FAF0E4"/>
          <image href="${dataUri}" width="788" height="740" preserveAspectRatio="xMidYMid slice" />
        </g>
      </g>

      <!-- Pet Name & Info -->
      <g transform="translate(56, 940)">
        <text x="0" y="40" font-family="Grandstander" font-size="72" font-weight="900" fill="#2C211B">
          Graxzo<tspan fill="#8B5E3C">.</tspan>
        </text>
        <text x="0" y="86" font-family="Grandstander" font-size="32" font-weight="700" fill="#8B5E3C">
          German Shepherd • 12 lbs • 6 mo
        </text>

        <line x1="0" y1="120" x2="788" y2="120" stroke="#F0E5D8" stroke-width="2" />

        <!-- Status Details -->
        <g transform="translate(0, 160)">
          <g transform="translate(0, 0)">
            <text x="0" y="0" font-family="Grandstander" font-size="16" font-weight="800" fill="#766A63" letter-spacing="1">STATUS</text>
            <text x="0" y="30" font-family="Grandstander" font-size="22" font-weight="900" fill="#059669">✓ VERIFIED ACTIVE</text>
          </g>

          <g transform="translate(290, 0)">
            <text x="0" y="0" font-family="Grandstander" font-size="16" font-weight="800" fill="#766A63" letter-spacing="1">COLLAR TAG</text>
            <text x="0" y="30" font-family="Grandstander" font-size="22" font-weight="900" fill="#2C211B">SMART QR LIVE</text>
          </g>

          <g transform="translate(570, 0)">
            <text x="0" y="0" font-family="Grandstander" font-size="16" font-weight="800" fill="#766A63" letter-spacing="1">MICROCHIP</text>
            <text x="0" y="30" font-family="Grandstander" font-size="20" font-weight="900" fill="#8B5E3C">985-GRAXZO</text>
          </g>
        </g>

        <!-- Bottom URL Bar inside card -->
        <g transform="translate(0, 240)">
          <rect width="788" height="68" rx="20" fill="#8B5E3C" />
          <text x="394" y="42" font-family="Grandstander" font-size="20" font-weight="800" fill="#FFFFFF" text-anchor="middle">
            puplume.com/leo
          </text>
        </g>
      </g>
    </g>
  </svg>`;

  const designs = [
    { svg: proOg1, name: 'pro-og-preview-1', width: 1200 },
    { svg: proOg2, name: 'pro-og-preview-2', width: 1200 },
    { svg: proStory1, name: 'pro-story-1', width: 1080 },
    { svg: proStory2, name: 'pro-story-2', width: 1080 }
  ];

  for (const d of designs) {
    const svgPath = path.join(__dirname, '..', 'public', `${d.name}.svg`);
    fs.writeFileSync(svgPath, d.svg, 'utf8');

    const resvg = new Resvg(d.svg, {
      fitTo: { mode: 'width', value: d.width },
      font: {
        fontFiles: fonts,
        defaultFontFamily: 'Grandstander'
      }
    });
    const png = resvg.render().asPng();
    const pngPath = path.join(__dirname, '..', 'public', `${d.name}.png`);
    fs.writeFileSync(pngPath, png);
    console.log(`Rendered ${d.name}.png (${png.length} bytes)`);
  }
}

main().catch(console.error);
