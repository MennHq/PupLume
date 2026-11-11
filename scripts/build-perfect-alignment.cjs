const fs = require('fs');
const path = require('path');
const { Resvg } = require('@resvg/resvg-js');

async function main() {
  const dogJpgPath = 'C:\\Users\\AHSAN HAROON\\.gemini\\antigravity\\brain\\4ddb26e3-d523-42ab-9697-966bb647edaa\\original-dog.jpg';
  const dogJpg = fs.readFileSync(dogJpgPath);
  const b64 = dogJpg.toString('base64');
  const dataUri = `data:image/jpeg;base64,${b64}`;

  // Registered fonts:
  // ONLY Grandstander for "PupLume" wordmark.
  // ALL OTHER TYPOGRAPHY uses Outfit!
  const fonts = [
    path.join(__dirname, '..', 'fonts', 'Grandstander-Black.ttf'),
    path.join(__dirname, '..', 'fonts', 'Grandstander-Bold.ttf'),
    path.join(__dirname, '..', 'fonts', 'Outfit-Black.ttf'),
    path.join(__dirname, '..', 'fonts', 'Outfit-ExtraBold.ttf'),
    path.join(__dirname, '..', 'fonts', 'Outfit-Bold.ttf'),
    path.join(__dirname, '..', 'fonts', 'Outfit-SemiBold.ttf'),
    path.join(__dirname, '..', 'fonts', 'Outfit-Medium.ttf'),
    path.join(__dirname, '..', 'fonts', 'Outfit-Regular.ttf'),
  ];

  // Natural warm golden fur filter (removes green cast)
  const warmFurFilter = `
    <filter id="warmFurFilter" x="0%" y="0%" width="100%" height="100%">
      <feColorMatrix type="matrix" values="
        0 1.0 0 0 0
        0 1.0 0 0 0
        0 1.0 0 0 0
        0 0   0 1 0
      " result="gray" />
      <feColorMatrix in="gray" type="matrix" values="
        1.18 0 0 0 0.05
        0.98 0 0 0 0.02
        0.72 0 0 0 -0.04
        0    0 0 1 0
      " result="warm" />
    </filter>
  `;

  // PupLume Transparent Mascot
  const cleanMascot = (scale = 0.12) => `
    <g transform="scale(${scale})">
      <path d="M 220 80 C 130 80 70 140 70 240 C 70 330 140 380 220 380 C 300 380 370 330 370 240 C 370 140 310 80 220 80 Z" fill="#8B5E3C"/>
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
        <path d="M 40 0 C 40 22 58 40 80 40 C 58 40 40 58 40 80 C 40 58 22 40 0 40 C 22 40 40 22 40 0 Z" fill="#F59E0B"/>
        <circle cx="40" cy="40" r="10" fill="#FFF9F2"/>
      </g>
    </g>
  `;

  // =========================================================================
  // 1. RE-ARCHITECTED OPENGRAPH SOCIAL PREVIEW CARD (1200 x 630 px)
  // Clean, modern, immaculate alignment, zero gimmicks.
  // Only PupLume uses Grandstander; all content typography uses Outfit!
  // =========================================================================
  const ogSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
    <defs>
      ${warmFurFilter}
      <linearGradient id="canvasGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FBF9F6"/>
        <stop offset="50%" stop-color="#F4EFE8"/>
        <stop offset="100%" stop-color="#EBE3D8"/>
      </linearGradient>

      <!-- Clean soft shadow -->
      <filter id="passDropShadow" x="-8%" y="-8%" width="120%" height="120%">
        <feDropShadow dx="0" dy="20" stdDeviation="28" flood-color="#3A2818" flood-opacity="0.10"/>
        <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#3A2818" flood-opacity="0.04"/>
      </filter>

      <!-- Crisp squircle for photo -->
      <clipPath id="ogPhotoSquircle">
        <rect width="390" height="434" rx="24"/>
      </clipPath>
    </defs>

    <!-- Warm Canvas Ground -->
    <rect width="1200" height="630" fill="url(#canvasGrad)"/>

    <!-- Top Canvas Brand Header -->
    <g transform="translate(64, 26)">
      ${cleanMascot(0.12)}
      <!-- ONLY PupLume uses Grandstander -->
      <text x="54" y="27" font-family="Grandstander" font-size="28" font-weight="900" fill="#241912">
        Pup<tspan fill="#8B5E3C">Lume</tspan>
      </text>
      <!-- Sub-label uses Outfit -->
      <text x="176" y="24" font-family="Outfit" font-size="11" font-weight="700" fill="#8C7A6D" letter-spacing="2">
        DIGITAL PET PASSPORT
      </text>
    </g>
    <!-- Right side tag -->
    <g transform="translate(1136, 26)">
      <rect x="-140" y="2" width="140" height="28" rx="14" fill="#EAE0D4"/>
      <circle cx="-124" cy="16" r="4" fill="#087E61"/>
      <text x="-110" y="20" font-family="Outfit" font-size="11" font-weight="700" fill="#241912" letter-spacing="1">
        VERIFIED NFC
      </text>
    </g>

    <!-- THE MASTER DIGITAL PASSPORT CARD (1072 x 494 px, centered at x=64, y=72) -->
    <g transform="translate(64, 72)" filter="url(#passDropShadow)">
      <!-- Card Body -->
      <rect width="1072" height="494" rx="28" fill="#FFFFFF" stroke="#EDE5DC" stroke-width="1.5"/>

      <!-- LEFT: Hero Photo with Warm Fur (390 x 434 px at x=30, y=30) -->
      <g transform="translate(30, 30)">
        <g clip-path="url(#ogPhotoSquircle)">
          <rect width="390" height="434" fill="#EFE8DE"/>
          <image href="${dataUri}" width="390" height="434" preserveAspectRatio="xMidYMid slice" filter="url(#warmFurFilter)"/>
        </g>
        <rect width="390" height="434" rx="24" fill="none" stroke="#FFFFFF" stroke-width="2" opacity="0.9"/>

        <!-- Sleek Verified Badge embedded in bottom of photo -->
        <g transform="translate(18, 372)">
          <rect width="200" height="44" rx="22" fill="#1C140E" opacity="0.9"/>
          <circle cx="22" cy="22" r="11" fill="#087E61"/>
          <text x="22" y="26" font-size="12" text-anchor="middle" fill="#FFFFFF" font-family="Outfit" font-weight="900">✓</text>
          <text x="42" y="21" font-family="Outfit" font-size="11" font-weight="800" fill="#FFFFFF" letter-spacing="0.5">
            VERIFIED CANINE
          </text>
          <text x="42" y="33" font-family="Outfit" font-size="9" font-weight="600" fill="#A7F3D0" letter-spacing="1">
            PUPLUME COLLAR SECURED
          </text>
        </g>
      </g>

      <!-- RIGHT: The Clean Passport Profile (x=452 to x=1042, width=590px) -->
      <g transform="translate(452, 38)">
        <!-- Micro-Header Row -->
        <g>
          <text x="0" y="0" font-family="Outfit" font-size="11" font-weight="700" fill="#998778" letter-spacing="1.5">
            OFFICIAL PASSPORT
          </text>
          <text x="136" y="0" font-family="Outfit" font-size="12" font-weight="800" fill="#8B5E3C" letter-spacing="1">
            // NO. PL-985-GRAXZO
          </text>
          <!-- Tactile NFC Chip Symbol -->
          <g transform="translate(540, -10)">
            <rect width="40" height="26" rx="6" fill="#FDF6EA" stroke="#D5B895" stroke-width="1.2"/>
            <path d="M 12 13 L 28 13 M 20 6 L 20 20" stroke="#8B5E3C" stroke-width="1.2"/>
          </g>
        </g>

        <!-- Pet Name: Modern, Clean, Architectural Outfit Black -->
        <g transform="translate(0, 56)">
          <text x="0" y="0" font-family="Outfit" font-size="68" font-weight="900" fill="#1C140E" letter-spacing="-1.5">
            Graxzo
          </text>
          <text x="2" y="32" font-family="Outfit" font-size="20" font-weight="600" fill="#6A5A4D">
            German Shepherd • 12 lbs • 6 Months Old
          </text>
        </g>

        <!-- Status Highlights (Ultra Clean Pills in Outfit) -->
        <g transform="translate(0, 126)">
          <!-- Pill 1 -->
          <g transform="translate(0, 0)">
            <rect width="156" height="34" rx="17" fill="#F0FDF4" stroke="#DCFCE7" stroke-width="1.2"/>
            <circle cx="17" cy="17" r="4.5" fill="#16A34A"/>
            <text x="28" y="22" font-family="Outfit" font-size="12" font-weight="700" fill="#15803D">
              Active Collar Tag
            </text>
          </g>
          <!-- Pill 2 -->
          <g transform="translate(166, 0)">
            <rect width="148" height="34" rx="17" fill="#FEF3C7" stroke="#FDE68A" stroke-width="1.2"/>
            <circle cx="17" cy="17" r="4.5" fill="#D97706"/>
            <text x="28" y="22" font-family="Outfit" font-size="12" font-weight="700" fill="#B45309">
              Fully Vaccinated
            </text>
          </g>
          <!-- Pill 3 -->
          <g transform="translate(324, 0)">
            <rect width="156" height="34" rx="17" fill="#F0F9FF" stroke="#E0F2FE" stroke-width="1.2"/>
            <circle cx="17" cy="17" r="4.5" fill="#0284C7"/>
            <text x="28" y="22" font-family="Outfit" font-size="12" font-weight="700" fill="#0369A1">
              Emergency Ready
            </text>
          </g>
        </g>

        <!-- Subtle Clean Divider -->
        <line x1="0" y1="188" x2="580" y2="188" stroke="#EFE6DC" stroke-width="1.2"/>

        <!-- 2-Column Passport Details Grid -->
        <g transform="translate(0, 214)">
          <g>
            <text x="0" y="0" font-family="Outfit" font-size="10" font-weight="700" fill="#9C897A" letter-spacing="1.5">
              MICROCHIP ID
            </text>
            <text x="0" y="22" font-family="Outfit" font-size="15" font-weight="700" fill="#241912">
              985-GRAXZO-2025-PUP
            </text>
          </g>
          <g transform="translate(290, 0)">
            <text x="0" y="0" font-family="Outfit" font-size="10" font-weight="700" fill="#9C897A" letter-spacing="1.5">
              CARE &amp; TEMPERAMENT
            </text>
            <text x="0" y="22" font-family="Outfit" font-size="15" font-weight="600" fill="#241912">
              Playful, affectionate &amp; loyal
            </text>
          </g>
        </g>

        <!-- Bottom Integrated Collar Scan Capsule (580 x 86 px at y=278) -->
        <g transform="translate(0, 278)">
          <rect width="580" height="86" rx="20" fill="#FAF6F0" stroke="#EDE4D8" stroke-width="1.2"/>
          <!-- Mini QR Scanner -->
          <g transform="translate(18, 15)">
            <rect width="56" height="56" rx="12" fill="#FFFFFF" stroke="#E2D7C8" stroke-width="1"/>
            <g transform="translate(13, 13)" fill="#241912">
              <rect width="10" height="10" rx="2"/>
              <rect x="20" y="0" width="10" height="10" rx="2"/>
              <rect x="0" y="20" width="10" height="10" rx="2"/>
              <rect x="13" y="13" width="5" height="5" rx="1"/>
              <rect x="22" y="22" width="8" height="8" rx="1"/>
            </g>
          </g>
          <g transform="translate(90, 36)">
            <text x="0" y="0" font-family="Outfit" font-size="15" font-weight="800" fill="#1C140E">
              Scan Collar Tag to Connect Instantly
            </text>
            <text x="0" y="18" font-family="Outfit" font-size="12" font-weight="500" fill="#756455">
              Direct access to live emergency contacts, diet &amp; vet documents
            </text>
          </g>
          <!-- Security lock badge -->
          <g transform="translate(530, 29)">
            <circle cx="14" cy="14" r="14" fill="#EAE0D4"/>
            <path d="M 10 13 L 10 11 C 10 9 12 7 14 7 C 16 7 18 9 18 11 L 18 13 M 9 13 L 19 13 L 19 20 L 9 20 Z" fill="none" stroke="#5F4B3C" stroke-width="1.5"/>
          </g>
        </g>
      </g>
    </g>

    <!-- Footer Signature (x=64 to 1136) -->
    <g transform="translate(64, 608)">
      <text x="0" y="0" font-family="Outfit" font-size="12" font-weight="600" fill="#8C7A6D">
        puplume.com/leo
      </text>
    </g>
    <g transform="translate(1136, 608)">
      <text x="0" y="0" font-family="Outfit" font-size="12" font-weight="600" fill="#8C7A6D" text-anchor="end">
        Small paws. Big peace of mind. ♡
      </text>
    </g>
  </svg>`;

  // =========================================================================
  // 2. RE-ARCHITECTED INSTAGRAM STORY CARD (1080 x 1920 px, 9:16)
  // Hero portrait is the dominant focal point (72% height).
  // Frosted dark HUD in Outfit typography. Clean telemetry dossier below.
  // =========================================================================
  const storySvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1920" width="1080" height="1920">
    <defs>
      ${warmFurFilter}
      <linearGradient id="storyCanvasBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FBF8F4"/>
        <stop offset="45%" stop-color="#F3ECE2"/>
        <stop offset="100%" stop-color="#E7DDD0"/>
      </linearGradient>

      <filter id="storyCardShadow" x="-8%" y="-8%" width="120%" height="120%">
        <feDropShadow dx="0" dy="28" stdDeviation="36" flood-color="#3A2818" flood-opacity="0.12"/>
        <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#3A2818" flood-opacity="0.04"/>
      </filter>

      <clipPath id="storyPhotoSquircle">
        <rect width="920" height="980" rx="36"/>
      </clipPath>
    </defs>

    <!-- Canvas Background -->
    <rect width="1080" height="1920" fill="url(#storyCanvasBg)"/>

    <!-- Top Instagram Safe Zone Header (Y=140) -->
    <g transform="translate(80, 140)">
      ${cleanMascot(0.14)}
      <!-- ONLY PupLume uses Grandstander -->
      <text x="64" y="32" font-family="Grandstander" font-size="34" font-weight="900" fill="#241912">
        Pup<tspan fill="#8B5E3C">Lume</tspan>
      </text>
      <text x="66" y="54" font-family="Outfit" font-size="12" font-weight="700" fill="#8C7A6D" letter-spacing="2">
        OFFICIAL CANINE PASSPORT
      </text>
      <g transform="translate(920, 30)">
        <text x="0" y="0" font-family="Outfit" font-size="12" font-weight="700" fill="#8C7A6D" letter-spacing="1.5" text-anchor="end">
          2026 EDITION
        </text>
      </g>
    </g>

    <!-- HERO PHOTO CARD (920 x 980 px at Y=230) -->
    <g transform="translate(80, 230)" filter="url(#storyCardShadow)">
      <g clip-path="url(#storyPhotoSquircle)">
        <rect width="920" height="980" fill="#EFE8DE"/>
        <image href="${dataUri}" width="920" height="980" preserveAspectRatio="xMidYMid slice" filter="url(#warmFurFilter)"/>
      </g>
      <rect width="920" height="980" rx="36" fill="none" stroke="#FFFFFF" stroke-width="3" opacity="0.85"/>

      <!-- FLOATING FROSTED GLASS HUD (Overlay at bottom of photo) -->
      <g transform="translate(28, 770)">
        <rect width="864" height="180" rx="28" fill="#1A130E" opacity="0.92"/>
        <rect width="864" height="180" rx="28" fill="none" stroke="#FFFFFF" stroke-width="1.2" opacity="0.15"/>

        <!-- Name & Breed in Outfit -->
        <g transform="translate(36, 68)">
          <text x="0" y="0" font-family="Outfit" font-size="64" font-weight="900" fill="#FFFFFF" letter-spacing="-1">
            Graxzo
          </text>
          <text x="2" y="32" font-family="Outfit" font-size="20" font-weight="600" fill="#D6C9BE">
            German Shepherd • 12 lbs • 6 Months Old
          </text>
        </g>

        <!-- Verified Status Pill -->
        <g transform="translate(620, 44)">
          <rect width="208" height="46" rx="23" fill="#087E61"/>
          <circle cx="23" cy="23" r="11" fill="#FFFFFF"/>
          <text x="23" y="27" font-size="13" text-anchor="middle" fill="#087E61" font-family="Outfit" font-weight="900">✓</text>
          <text x="44" y="28" font-family="Outfit" font-size="12" font-weight="800" fill="#FFFFFF" letter-spacing="0.5">
            VERIFIED PUP
          </text>
        </g>
        <!-- Smart Collar tag -->
        <g transform="translate(620, 104)">
          <text x="208" y="20" font-family="Outfit" font-size="12" font-weight="700" fill="#FDE68A" letter-spacing="1" text-anchor="end">
            ● SMART COLLAR ACTIVE
          </text>
        </g>
      </g>
    </g>

    <!-- PASSPORT TELEMETRY CARD (Y=1240, height=420) -->
    <g transform="translate(80, 1240)" filter="url(#storyCardShadow)">
      <rect width="920" height="420" rx="36" fill="#FFFFFF" stroke="#EDE5DC" stroke-width="1.5"/>

      <g transform="translate(48, 48)">
        <!-- Microchip, Vaccine, Care 3-Column Grid -->
        <g>
          <g>
            <text x="0" y="0" font-family="Outfit" font-size="11" font-weight="700" fill="#998778" letter-spacing="1.5">
              MICROCHIP ID
            </text>
            <text x="0" y="26" font-family="Outfit" font-size="20" font-weight="800" fill="#241912">
              985-GRAXZO-2025
            </text>
          </g>
          <g transform="translate(300, 0)">
            <text x="0" y="0" font-family="Outfit" font-size="11" font-weight="700" fill="#998778" letter-spacing="1.5">
              VACCINE RECORD
            </text>
            <text x="0" y="26" font-family="Outfit" font-size="20" font-weight="800" fill="#15803D">
              Up to Date ✓
            </text>
          </g>
          <g transform="translate(580, 0)">
            <text x="0" y="0" font-family="Outfit" font-size="11" font-weight="700" fill="#998778" letter-spacing="1.5">
              SAFETY STATUS
            </text>
            <text x="0" y="26" font-family="Outfit" font-size="20" font-weight="800" fill="#B45309">
              Emergency Ready
            </text>
          </g>
        </g>

        <!-- Divider -->
        <line x1="0" y1="84" x2="824" y2="84" stroke="#EFE6DC" stroke-width="1.2"/>

        <!-- Interactive Scan Prompt -->
        <g transform="translate(0, 114)">
          <rect width="824" height="180" rx="24" fill="#FAF6F0" stroke="#EDE4D8" stroke-width="1.2"/>
          <g transform="translate(30, 35)">
            <rect width="110" height="110" rx="20" fill="#FFFFFF" stroke="#E2D7C8" stroke-width="1"/>
            <g transform="translate(25, 25)" fill="#241912">
              <rect width="18" height="18" rx="3"/>
              <rect x="42" y="0" width="18" height="18" rx="3"/>
              <rect x="0" y="42" width="18" height="18" rx="3"/>
              <rect x="26" y="26" width="10" height="10" rx="2"/>
              <rect x="44" y="44" width="16" height="16" rx="2"/>
            </g>
          </g>
          <g transform="translate(164, 75)">
            <text x="0" y="0" font-family="Outfit" font-size="22" font-weight="800" fill="#1C140E">
              One Scan. Right by their side.
            </text>
            <text x="0" y="28" font-family="Outfit" font-size="15" font-weight="500" fill="#756455">
              Tap collar tag for live emergency contacts, diet &amp; vet vault
            </text>
          </g>
        </g>
      </g>
    </g>

    <!-- Bottom Instagram Link Sticker Zone (Y=1700) -->
    <g transform="translate(80, 1700)">
      <rect width="920" height="88" rx="44" fill="#FFFFFF" stroke="#EDE5DC" stroke-width="1.5" filter="url(#storyCardShadow)"/>
      <g transform="translate(460, 52)">
        <text x="0" y="0" font-family="Outfit" font-size="19" font-weight="800" fill="#241912" letter-spacing="1.5" text-anchor="middle">
          TAP LINK STICKER TO VIEW PASSPORT 🐾
        </text>
      </g>
    </g>
  </svg>`;

  console.log('Rendering New Swiss-Aligned Master OpenGraph Card...');
  const resvgOg = new Resvg(ogSvg, {
    fitTo: { mode: 'width', value: 1200 },
    font: { fontFiles: fonts, defaultFontFamily: 'Outfit' }
  });
  const ogPng = resvgOg.render().asPng();

  console.log('Rendering New Swiss-Aligned Master Instagram Story Template...');
  const resvgStory = new Resvg(storySvg, {
    fitTo: { mode: 'width', value: 1080 },
    font: { fontFiles: fonts, defaultFontFamily: 'Outfit' }
  });
  const storyPng = resvgStory.render().asPng();

  // Save to public directory
  fs.writeFileSync(path.join(__dirname, '../public/master-og-preview.svg'), ogSvg);
  fs.writeFileSync(path.join(__dirname, '../public/master-og-preview.png'), ogPng);
  fs.writeFileSync(path.join(__dirname, '../public/master-story-template.svg'), storySvg);
  fs.writeFileSync(path.join(__dirname, '../public/master-story-template.png'), storyPng);

  // Copy to live endpoints
  fs.copyFileSync(path.join(__dirname, '../public/master-og-preview.png'), path.join(__dirname, '../public/og-graxzo.png'));
  fs.copyFileSync(path.join(__dirname, '../public/master-og-preview.png'), path.join(__dirname, '../public/og-pup-preview.png'));
  fs.copyFileSync(path.join(__dirname, '../public/master-og-preview.svg'), path.join(__dirname, '../public/og-pup-preview.svg'));

  console.log('SUCCESS: Generated Swiss-Aligned Master OpenGraph and Story Templates with Outfit typography!');
}

main().catch(console.error);
