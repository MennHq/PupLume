const fs = require('fs');
const path = require('path');
const { Resvg } = require('@resvg/resvg-js');

async function main() {
  const dogJpgPath = 'C:\\Users\\AHSAN HAROON\\.gemini\\antigravity\\brain\\4ddb26e3-d523-42ab-9697-966bb647edaa\\original-dog.jpg';
  const dogJpg = fs.readFileSync(dogJpgPath);
  const b64 = dogJpg.toString('base64');
  const dataUri = `data:image/jpeg;base64,${b64}`;

  const fonts = [
    path.join(__dirname, '..', 'fonts', 'Grandstander-Black.ttf'),
    path.join(__dirname, '..', 'fonts', 'Grandstander-ExtraBold.ttf'),
    path.join(__dirname, '..', 'fonts', 'Grandstander-Bold.ttf'),
    path.join(__dirname, '..', 'fonts', 'Grandstander-SemiBold.ttf'),
    path.join(__dirname, '..', 'fonts', 'Grandstander-Medium.ttf'),
    path.join(__dirname, '..', 'fonts', 'Grandstander-Regular.ttf'),
  ];

  // =========================================================================
  // REUSABLE ASSETS:
  // 1. Warm Golden Fur color correction filter (eliminates the green tint completely)
  // 2. PupLume Mascot with 100% transparent background (zero brown box)
  // =========================================================================
  const warmColorFilter = `
    <filter id="warmFurFilter" x="0%" y="0%" width="100%" height="100%">
      <!-- Map green-dominated luminance to grayscale -->
      <feColorMatrix type="matrix" values="
        0 1.0 0 0 0
        0 1.0 0 0 0
        0 1.0 0 0 0
        0 0   0 1 0
      " result="gray" />
      <!-- Re-colorize to rich natural golden retriever warmth & honey highlights -->
      <feColorMatrix in="gray" type="matrix" values="
        1.16 0 0 0 0.06
        0.96 0 0 0 0.02
        0.70 0 0 0 -0.04
        0    0 0 1 0
      " result="warmCoat" />
    </filter>
  `;

  const cleanMascotVector = `
    <g transform="scale(0.125)">
      <path d="M 220 80 C 130 80 70 140 70 240 C 70 330 140 380 220 380 C 300 380 370 330 370 240 C 370 140 310 80 220 80 Z" fill="url(#pupGrad)"/>
      <path d="M 120 120 C 60 140 30 210 40 290 C 45 320 70 340 95 325 C 115 310 135 250 140 200 Z" fill="#5F3E29"/>
      <path d="M 320 120 C 380 140 410 210 400 290 C 395 320 370 340 345 325 C 325 310 305 250 300 200 Z" fill="#5F3E29"/>
      <ellipse cx="220" cy="275" rx="85" ry="70" fill="#FFF9F2"/>
      <path d="M 195 240 C 195 230 245 230 245 240 C 245 258 228 272 220 272 C 212 272 195 258 195 240 Z" fill="#2C211B"/>
      <ellipse cx="212" cy="238" rx="6" ry="3" fill="#FFFFFF" opacity="0.6"/>
      <path d="M 220 272 L 220 286" stroke="#2C211B" stroke-width="4" stroke-linecap="round"/>
      <path d="M 200 286 C 210 294 220 294 220 286 C 220 294 230 294 240 286" fill="none" stroke="#2C211B" stroke-width="4" stroke-linecap="round"/>
      <circle cx="165" cy="205" r="14" fill="#2C211B"/>
      <circle cx="161" cy="201" r="5" fill="#FFFFFF"/>
      <circle cx="275" cy="205" r="14" fill="#2C211B"/>
      <circle cx="271" cy="201" r="5" fill="#FFFFFF"/>
      <ellipse cx="160" cy="180" rx="14" ry="7" fill="#F3E7DA" opacity="0.9"/>
      <ellipse cx="280" cy="180" rx="14" ry="7" fill="#F3E7DA" opacity="0.9"/>
      <g transform="translate(295, 45)">
        <path d="M 40 0 C 40 22 58 40 80 40 C 58 40 40 58 40 80 C 40 58 22 40 0 40 C 22 40 40 22 40 0 Z" fill="url(#lumeGrad)"/>
        <circle cx="40" cy="40" r="10" fill="#FFF9F2"/>
      </g>
    </g>
  `;

  // =========================================================================
  // 1. BRAND NEW 2026 OPENGRAPH PREVIEW CARD (1200 x 630 px)
  // ARCHETYPE: "The Titanium Gold Luxury Pet Passport"
  // Clean, high-fashion, cohesive monolithic pass with zero split-box slop.
  // =========================================================================
  const ogSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
    <defs>
      ${warmColorFilter}
      <linearGradient id="canvasBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FAF7F2"/>
        <stop offset="45%" stop-color="#F4EFE6"/>
        <stop offset="100%" stop-color="#E8DFD3"/>
      </linearGradient>

      <linearGradient id="cardBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FFFFFF"/>
        <stop offset="100%" stop-color="#FDFBF7"/>
      </linearGradient>

      <linearGradient id="goldSheen" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#F59E0B"/>
        <stop offset="50%" stop-color="#D97706"/>
        <stop offset="100%" stop-color="#B45309"/>
      </linearGradient>

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

      <!-- Luxury Soft Ambient Drop Shadows -->
      <filter id="luxuryPassShadow" x="-10%" y="-10%" width="125%" height="125%">
        <feDropShadow dx="0" dy="24" stdDeviation="32" flood-color="#4A3423" flood-opacity="0.10"/>
        <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#4A3423" flood-opacity="0.04"/>
      </filter>

      <filter id="photoSoftShadow" x="-15%" y="-15%" width="130%" height="130%">
        <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#000000" flood-opacity="0.12"/>
      </filter>

      <!-- Clean Squircle Crop for Hero Photo -->
      <clipPath id="heroPhotoSquircle">
        <rect width="440" height="490" rx="28"/>
      </clipPath>
    </defs>

    <!-- Studio Warm Alabaster Canvas -->
    <rect width="1200" height="630" fill="url(#canvasBg)"/>

    <!-- Subtle Architectural Background Grids & Security Patterns -->
    <g stroke="#E5DDD0" stroke-width="1" opacity="0.4">
      <line x1="80" y1="0" x2="80" y2="630"/>
      <line x1="1120" y1="0" x2="1120" y2="630"/>
      <line x1="0" y1="45" x2="1200" y2="45"/>
      <line x1="0" y1="585" x2="1200" y2="585"/>
    </g>

    <!-- Top Canvas Brand Bar -->
    <g transform="translate(80, 24)">
      ${cleanMascotVector}
      <text x="58" y="27" font-family="Grandstander" font-size="28" font-weight="900" fill="#241912" letter-spacing="-0.5">
        Pup<tspan fill="#8B5E3C">Lume</tspan>
      </text>
      <text x="180" y="25" font-family="Grandstander" font-size="11" font-weight="800" fill="#8C7A6D" letter-spacing="2.2">
        // OFFICIAL DIGITAL PET PASSPORT
      </text>
    </g>
    <g transform="translate(970, 28)">
      <text x="150" y="20" font-family="Grandstander" font-size="11" font-weight="800" fill="#8C7A6D" letter-spacing="1.5" text-anchor="end">
        GLOBAL VERIFICATION SYSTEM
      </text>
    </g>

    <!-- THE MASTER MONOLITHIC PASSPORT CARD (1040 x 510 px, rx=32) -->
    <g transform="translate(80, 65)" filter="url(#luxuryPassShadow)">
      <!-- Main Card Surface -->
      <rect width="1040" height="510" rx="32" fill="url(#cardBg)" stroke="#EDE5DA" stroke-width="1.5"/>

      <!-- Inner Subtle Security Border -->
      <rect x="12" y="12" width="1016" height="486" rx="22" fill="none" stroke="#F4EDE4" stroke-width="1"/>

      <!-- LEFT: Hero Photo with Radiant Golden Fur -->
      <g transform="translate(24, 24)">
        <g filter="url(#photoSoftShadow)">
          <g clip-path="url(#heroPhotoSquircle)">
            <rect width="440" height="462" fill="#EFE8DE"/>
            <image href="${dataUri}" width="440" height="462" preserveAspectRatio="xMidYMid slice" filter="url(#warmFurFilter)"/>
          </g>
        </g>
        <!-- Photo Border Outline -->
        <rect width="440" height="462" rx="28" fill="none" stroke="#FFFFFF" stroke-width="2.5" opacity="0.8"/>

        <!-- Holographic Gold Security Seal Badge (Bottom Left of Photo) -->
        <g transform="translate(18, 396)">
          <rect width="210" height="46" rx="23" fill="#1E1611" opacity="0.88"/>
          <circle cx="23" cy="23" r="13" fill="#087E61"/>
          <text x="23" y="28" font-size="14" text-anchor="middle" fill="#FFFFFF" font-family="Grandstander" font-weight="900">✓</text>
          <text x="44" y="22" font-family="Grandstander" font-size="11" font-weight="800" fill="#FFFFFF" letter-spacing="0.5">
            VERIFIED CANINE
          </text>
          <text x="44" y="34" font-family="Grandstander" font-size="9" font-weight="600" fill="#A7F3D0" letter-spacing="1.2">
            NFC COLLAR ACTIVE
          </text>
        </g>
      </g>

      <!-- RIGHT: Editorial High-Fashion Passport Content -->
      <g transform="translate(500, 42)">
        <!-- Top Metadata Header -->
        <g>
          <text x="0" y="0" font-family="Grandstander" font-size="11" font-weight="800" fill="#9C8778" letter-spacing="2">
            PASSPORT NUMBER
          </text>
          <text x="140" y="0" font-family="Grandstander" font-size="12" font-weight="900" fill="#241912" letter-spacing="1">
            PL-985-GRAXZO-2026
          </text>
          <g transform="translate(470, -10)">
            <!-- Tactile NFC Chip Symbol -->
            <path d="M 0 10 C 6 4 14 4 20 10 M 4 14 C 8 9 12 9 16 14 M 8 18 C 10 16 10 16 12 18" fill="none" stroke="#B45309" stroke-width="2" stroke-linecap="round"/>
          </g>
        </g>

        <!-- Pet Name: Massive, Bold, Confident Typography -->
        <g transform="translate(0, 75)">
          <text x="0" y="0" font-family="Grandstander" font-size="76" font-weight="900" fill="#1E1611" letter-spacing="-1.5">
            GRAXZO
          </text>
          <text x="4" y="28" font-family="Grandstander" font-size="18" font-weight="700" fill="#7C6B5E" letter-spacing="0.2">
            German Shepherd • 12 lbs • 6 Months
          </text>
        </g>

        <!-- Status Highlights (Modern minimal pills, not messy boxes) -->
        <g transform="translate(0, 140)">
          <!-- Pill 1: Vaccinated -->
          <g transform="translate(0, 0)">
            <rect width="138" height="34" rx="17" fill="#F0FDF4" stroke="#DCFCE7" stroke-width="1.2"/>
            <circle cx="16" cy="17" r="4.5" fill="#16A34A"/>
            <text x="28" y="22" font-family="Grandstander" font-size="12" font-weight="800" fill="#15803D">
              Fully Vaccinated
            </text>
          </g>
          <!-- Pill 2: Microchip Verified -->
          <g transform="translate(148, 0)">
            <rect width="144" height="34" rx="17" fill="#FEF3C7" stroke="#FDE68A" stroke-width="1.2"/>
            <circle cx="16" cy="17" r="4.5" fill="#D97706"/>
            <text x="28" y="22" font-family="Grandstander" font-size="12" font-weight="800" fill="#B45309">
              Microchip Verified
            </text>
          </g>
          <!-- Pill 3: Emergency Ready -->
          <g transform="translate(302, 0)">
            <rect width="144" height="34" rx="17" fill="#F0F9FF" stroke="#E0F2FE" stroke-width="1.2"/>
            <circle cx="16" cy="17" r="4.5" fill="#0284C7"/>
            <text x="28" y="22" font-family="Grandstander" font-size="12" font-weight="800" fill="#0369A1">
              Emergency Ready
            </text>
          </g>
        </g>

        <!-- Divider Line -->
        <line x1="0" y1="205" x2="500" y2="205" stroke="#EFE7DC" stroke-width="1.5"/>

        <!-- 2-Column Swiss Data Specs -->
        <g transform="translate(0, 235)">
          <!-- Col 1: Microchip Details -->
          <g>
            <text x="0" y="0" font-family="Grandstander" font-size="10" font-weight="800" fill="#A8978A" letter-spacing="1.5">
              MICROCHIP ID
            </text>
            <text x="0" y="20" font-family="Grandstander" font-size="14" font-weight="800" fill="#241912">
              985-GRAXZO-2025-PUP
            </text>
          </g>
          <!-- Col 2: Temperament -->
          <g transform="translate(250, 0)">
            <text x="0" y="0" font-family="Grandstander" font-size="10" font-weight="800" fill="#A8978A" letter-spacing="1.5">
              TEMPERAMENT &amp; CARE
            </text>
            <text x="0" y="20" font-family="Grandstander" font-size="14" font-weight="800" fill="#241912">
              Playful, affectionate, loyal
            </text>
          </g>
        </g>

        <!-- Bottom Tactile Scan Banner (Ultra-clean, seamless integration) -->
        <g transform="translate(0, 310)">
          <rect width="500" height="92" rx="20" fill="#FAF6F0" stroke="#EDE4D8" stroke-width="1.2"/>
          <!-- Mini QR & Scanner Graphic -->
          <g transform="translate(18, 16)">
            <rect width="60" height="60" rx="12" fill="#FFFFFF" stroke="#E5DDD0" stroke-width="1"/>
            <g transform="translate(14, 14)" fill="#1E1611">
              <rect width="10" height="10" rx="2"/>
              <rect x="22" y="0" width="10" height="10" rx="2"/>
              <rect x="0" y="22" width="10" height="10" rx="2"/>
              <rect x="14" y="14" width="6" height="6" rx="1"/>
              <rect x="24" y="24" width="8" height="8" rx="1"/>
            </g>
          </g>
          <!-- Action text -->
          <g transform="translate(94, 34)">
            <text x="0" y="0" font-family="Grandstander" font-size="14" font-weight="900" fill="#1E1611" letter-spacing="-0.2">
              Scan Collar Tag to Connect Instantly
            </text>
            <text x="0" y="18" font-family="Grandstander" font-size="11" font-weight="600" fill="#7C6B5E">
              Direct access to live emergency contacts, diet &amp; vet documents
            </text>
          </g>
          <!-- Security lock pill -->
          <g transform="translate(420, 33)">
            <circle cx="14" cy="14" r="14" fill="#E8DFD3"/>
            <path d="M 10 13 L 10 11 C 10 9 12 7 14 7 C 16 7 18 9 18 11 L 18 13 M 9 13 L 19 13 L 19 20 L 9 20 Z" fill="none" stroke="#5F4B3C" stroke-width="1.5"/>
          </g>
        </g>
      </g>
    </g>

    <!-- Footer Live Link -->
    <g transform="translate(80, 608)">
      <text x="0" y="0" font-family="Grandstander" font-size="12" font-weight="800" fill="#8C7A6D">
        puplumepet.vercel.app/pup/graxzo
      </text>
    </g>
    <g transform="translate(1120, 608)">
      <text x="0" y="0" font-family="Grandstander" font-size="12" font-weight="800" fill="#8C7A6D" text-anchor="end">
        Small paws. Big peace of mind. ♡
      </text>
    </g>
  </svg>`;

  // =========================================================================
  // 2. BRAND NEW 2026 INSTAGRAM STORY CARD (1080 x 1920 px, 9:16)
  // ARCHETYPE: "Spotify-Wrapped meets High-Fashion Canine Editorial"
  // Safe zones respected, dramatic editorial typography, warm golden fur.
  // =========================================================================
  const storySvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1920" width="1080" height="1920">
    <defs>
      ${warmColorFilter}
      <linearGradient id="storyBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FAF7F2"/>
        <stop offset="35%" stop-color="#F5EFE6"/>
        <stop offset="100%" stop-color="#EBE1D3"/>
      </linearGradient>

      <linearGradient id="storyCardBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FFFFFF"/>
        <stop offset="100%" stop-color="#FDFBF8"/>
      </linearGradient>

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

      <filter id="storyCardShadow" x="-10%" y="-10%" width="125%" height="125%">
        <feDropShadow dx="0" dy="28" stdDeviation="36" flood-color="#4A3423" flood-opacity="0.12"/>
        <feDropShadow dx="0" dy="10" stdDeviation="16" flood-color="#4A3423" flood-opacity="0.05"/>
      </filter>

      <clipPath id="storyPhotoClip">
        <rect width="900" height="740" rx="36"/>
      </clipPath>
    </defs>

    <!-- Canvas Background -->
    <rect width="1080" height="1920" fill="url(#storyBg)"/>

    <!-- Subtle Safety-Zone Ambient Elements -->
    <g stroke="#E8E0D2" stroke-width="1.2" opacity="0.4">
      <line x1="90" y1="0" x2="90" y2="1920"/>
      <line x1="990" y1="0" x2="990" y2="1920"/>
    </g>

    <!-- Top Instagram Safe Header (Y=140 to 220) -->
    <g transform="translate(90, 150)">
      ${cleanMascotVector}
      <text x="64" y="30" font-family="Grandstander" font-size="34" font-weight="900" fill="#241912" letter-spacing="-0.5">
        Pup<tspan fill="#8B5E3C">Lume</tspan>
      </text>
      <text x="66" y="52" font-family="Grandstander" font-size="12" font-weight="800" fill="#8C7A6D" letter-spacing="2">
        VERIFIED DIGITAL CANINE PASSPORT
      </text>
      <g transform="translate(860, 25)">
        <text x="0" y="0" font-family="Grandstander" font-size="13" font-weight="800" fill="#8C7A6D" letter-spacing="1.5" text-anchor="end">
          2026 EDITION
        </text>
      </g>
    </g>

    <!-- MAIN HERO SECTION: Full-width Editorial Portrait (Y=260) -->
    <g transform="translate(90, 260)" filter="url(#storyCardShadow)">
      <g clip-path="url(#storyPhotoClip)">
        <rect width="900" height="740" fill="#EFE8DE"/>
        <image href="${dataUri}" width="900" height="740" preserveAspectRatio="xMidYMid slice" filter="url(#warmFurFilter)"/>
      </g>
      <!-- Sleek outer border -->
      <rect width="900" height="740" rx="36" fill="none" stroke="#FFFFFF" stroke-width="3" opacity="0.8"/>

      <!-- Floating Verified Badge in Photo -->
      <g transform="translate(36, 640)">
        <rect width="320" height="60" rx="30" fill="#1E1611" opacity="0.9"/>
        <circle cx="30" cy="30" r="16" fill="#087E61"/>
        <text x="30" y="37" font-size="18" text-anchor="middle" fill="#FFFFFF" font-family="Grandstander" font-weight="900">✓</text>
        <text x="60" y="28" font-family="Grandstander" font-size="14" font-weight="900" fill="#FFFFFF" letter-spacing="0.5">
          VERIFIED IDENTITY
        </text>
        <text x="60" y="45" font-family="Grandstander" font-size="11" font-weight="700" fill="#A7F3D0" letter-spacing="1.2">
          PUPLUME COLLAR SECURED
        </text>
      </g>
    </g>

    <!-- THE PASSPORT DOSSIER CARD (Y=1040, height=590) -->
    <g transform="translate(90, 1040)" filter="url(#storyCardShadow)">
      <rect width="900" height="590" rx="36" fill="url(#storyCardBg)" stroke="#EDE5DA" stroke-width="1.5"/>

      <g transform="translate(48, 54)">
        <!-- Microchip & Security tag -->
        <g>
          <text x="0" y="0" font-family="Grandstander" font-size="13" font-weight="800" fill="#9C8778" letter-spacing="2">
            PASSPORT NUMBER // PL-985-GRAXZO-2026
          </text>
        </g>

        <!-- Big Name Header -->
        <g transform="translate(0, 68)">
          <text x="0" y="0" font-family="Grandstander" font-size="88" font-weight="900" fill="#1E1611" letter-spacing="-2">
            GRAXZO
          </text>
          <text x="4" y="34" font-family="Grandstander" font-size="24" font-weight="700" fill="#7C6B5E">
            German Shepherd • 12 lbs • 6 Months
          </text>
        </g>

        <!-- Status Badges Row -->
        <g transform="translate(0, 150)">
          <g transform="translate(0, 0)">
            <rect width="180" height="42" rx="21" fill="#F0FDF4" stroke="#DCFCE7" stroke-width="1.2"/>
            <circle cx="20" cy="21" r="5" fill="#16A34A"/>
            <text x="34" y="26" font-family="Grandstander" font-size="14" font-weight="800" fill="#15803D">
              Active Collar Tag
            </text>
          </g>
          <g transform="translate(196, 0)">
            <rect width="180" height="42" rx="21" fill="#FEF3C7" stroke="#FDE68A" stroke-width="1.2"/>
            <circle cx="20" cy="21" r="5" fill="#D97706"/>
            <text x="34" y="26" font-family="Grandstander" font-size="14" font-weight="800" fill="#B45309">
              Fully Vaccinated
            </text>
          </g>
          <g transform="translate(392, 0)">
            <rect width="190" height="42" rx="21" fill="#F0F9FF" stroke="#E0F2FE" stroke-width="1.2"/>
            <circle cx="20" cy="21" r="5" fill="#0284C7"/>
            <text x="34" y="26" font-family="Grandstander" font-size="14" font-weight="800" fill="#0369A1">
              Emergency Ready
            </text>
          </g>
        </g>

        <!-- Divider line -->
        <line x1="0" y1="230" x2="804" y2="230" stroke="#EFE7DC" stroke-width="1.5"/>

        <!-- Details Grid -->
        <g transform="translate(0, 270)">
          <g>
            <text x="0" y="0" font-family="Grandstander" font-size="12" font-weight="800" fill="#A8978A" letter-spacing="1.5">
              MICROCHIP ID
            </text>
            <text x="0" y="24" font-family="Grandstander" font-size="18" font-weight="800" fill="#241912">
              985-GRAXZO-2025-PUP
            </text>
          </g>
          <g transform="translate(420, 0)">
            <text x="0" y="0" font-family="Grandstander" font-size="12" font-weight="800" fill="#A8978A" letter-spacing="1.5">
              CARE &amp; PERSONALITY
            </text>
            <text x="0" y="24" font-family="Grandstander" font-size="18" font-weight="800" fill="#241912">
              Playful, affectionate, fast learner
            </text>
          </g>
        </g>

        <!-- Live Scanner Callout Box -->
        <g transform="translate(0, 350)">
          <rect width="804" height="120" rx="24" fill="#FAF6F0" stroke="#EDE4D8" stroke-width="1.2"/>
          <g transform="translate(24, 24)">
            <rect width="72" height="72" rx="16" fill="#FFFFFF" stroke="#E5DDD0" stroke-width="1"/>
            <g transform="translate(18, 18)" fill="#1E1611">
              <rect width="12" height="12" rx="2"/>
              <rect x="24" y="0" width="12" height="12" rx="2"/>
              <rect x="0" y="24" width="12" height="12" rx="2"/>
              <rect x="16" y="16" width="6" height="6" rx="1"/>
              <rect x="26" y="26" width="10" height="10" rx="1"/>
            </g>
          </g>
          <g transform="translate(120, 48)">
            <text x="0" y="0" font-family="Grandstander" font-size="18" font-weight="900" fill="#1E1611">
              One Scan. Right by their side.
            </text>
            <text x="0" y="24" font-family="Grandstander" font-size="14" font-weight="600" fill="#7C6B5E">
              Scan smart collar tag for live emergency contacts &amp; medical vault
            </text>
          </g>
        </g>
      </g>
    </g>

    <!-- Bottom Instagram Link Sticker Callout (Y=1680) -->
    <g transform="translate(90, 1680)">
      <rect width="900" height="88" rx="44" fill="#FFFFFF" stroke="#EDE5DA" stroke-width="1.5" filter="url(#storyCardShadow)"/>
      <g transform="translate(450, 52)">
        <text x="0" y="0" font-family="Grandstander" font-size="20" font-weight="900" fill="#1E1611" letter-spacing="1.5" text-anchor="middle">
          TAP LINK STICKER TO VIEW PASSPORT 🐾
        </text>
      </g>
    </g>
  </svg>`;

  console.log('Rendering new Master OpenGraph Preview Card with Resvg...');
  const resvgOg = new Resvg(ogSvg, {
    fitTo: { mode: 'width', value: 1200 },
    font: { fontFiles: fonts, defaultFontFamily: 'Grandstander' }
  });
  const ogPng = resvgOg.render().asPng();

  console.log('Rendering new Master Instagram Story Template with Resvg...');
  const resvgStory = new Resvg(storySvg, {
    fitTo: { mode: 'width', value: 1080 },
    font: { fontFiles: fonts, defaultFontFamily: 'Grandstander' }
  });
  const storyPng = resvgStory.render().asPng();

  // Save deliverables to public/
  const ogSvgPath = path.join(__dirname, '../public/master-og-preview.svg');
  const ogPngPath = path.join(__dirname, '../public/master-og-preview.png');
  const storySvgPath = path.join(__dirname, '../public/master-story-template.svg');
  const storyPngPath = path.join(__dirname, '../public/master-story-template.png');

  fs.writeFileSync(ogSvgPath, ogSvg);
  fs.writeFileSync(ogPngPath, ogPng);
  fs.writeFileSync(storySvgPath, storySvg);
  fs.writeFileSync(storyPngPath, storyPng);

  // Copy to live public assets
  fs.copyFileSync(ogPngPath, path.join(__dirname, '../public/og-graxzo.png'));
  fs.copyFileSync(ogPngPath, path.join(__dirname, '../public/og-pup-preview.png'));
  fs.copyFileSync(ogSvgPath, path.join(__dirname, '../public/og-pup-preview.svg'));

  console.log('SUCCESS: Generated fresh 2026 Master OpenGraph and Story Templates!');
}

main().catch(console.error);
