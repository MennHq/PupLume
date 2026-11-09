const fs = require('fs');
const path = require('path');
const { Resvg } = require('@resvg/resvg-js');

async function main() {
  const dogJpgPath = 'C:\\Users\\AHSAN HAROON\\.gemini\\antigravity\\brain\\4ddb26e3-d523-42ab-9697-966bb647edaa\\original-dog.jpg';
  const dogJpg = fs.readFileSync(dogJpgPath);
  const b64 = dogJpg.toString('base64');
  const dataUri = `data:image/jpeg;base64,${b64}`;

  // Font registration:
  // Grandstander for "PupLume" wordmark ONLY.
  // Outfit for ALL other typography!
  const fonts = [
    path.resolve(__dirname, '../fonts/Grandstander-Black.ttf'),
    path.resolve(__dirname, '../fonts/Grandstander-Bold.ttf'),
    path.resolve(__dirname, '../fonts/Outfit-900.ttf'),
    path.resolve(__dirname, '../fonts/Outfit-800.ttf'),
    path.resolve(__dirname, '../fonts/Outfit-700.ttf'),
    path.resolve(__dirname, '../fonts/Outfit-600.ttf'),
    path.resolve(__dirname, '../fonts/Outfit-400.ttf'),
    path.resolve(__dirname, '../fonts/PlusJakartaSans-800.ttf'),
    path.resolve(__dirname, '../fonts/PlusJakartaSans-700.ttf'),
  ];

  // Natural warm golden coat color filter
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

  // Transparent Mascot (NO background box!)
  const mascot = (scale = 0.12) => `
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
  // 1. MASTER OPENGRAPH PREVIEW CARD (1200 x 630 px)
  // Perfectly aligned, Swiss mathematical grid, clean luxury pass.
  // ONLY "PupLume" in Grandstander; ALL ELSE in Outfit!
  // =========================================================================
  const ogSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
    <defs>
      ${warmFurFilter}
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FCFAF7"/>
        <stop offset="50%" stop-color="#F5EFE8"/>
        <stop offset="100%" stop-color="#ECE3D7"/>
      </linearGradient>

      <!-- Soft ambient card shadow -->
      <filter id="passShadow" x="-6%" y="-6%" width="115%" height="115%">
        <feDropShadow dx="0" dy="22" stdDeviation="28" flood-color="#3A2818" flood-opacity="0.09"/>
        <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#3A2818" flood-opacity="0.03"/>
      </filter>

      <!-- Clean photo squircle -->
      <clipPath id="ogPhotoSquircle">
        <rect width="396" height="442" rx="26"/>
      </clipPath>
    </defs>

    <!-- Canvas Background -->
    <rect width="1200" height="630" fill="url(#bgGrad)"/>

    <!-- TOP BRAND BAR (Aligned with Card Margins: X=60 to X=1140) -->
    <g transform="translate(60, 24)">
      ${mascot(0.12)}
      <!-- ONLY PupLume in Grandstander -->
      <text x="52" y="27" font-family="Grandstander" font-size="28" font-weight="900" fill="#241912">
        Pup<tspan fill="#8B5E3C">Lume</tspan>
      </text>
      <!-- Subtitle in Outfit with generous spacing -->
      <text x="210" y="25" font-family="Outfit" font-size="12" font-weight="700" fill="#8C7A6D" letter-spacing="2">
        DIGITAL PET PASSPORT
      </text>
    </g>

    <!-- Top Right Status Badge -->
    <g transform="translate(980, 26)">
      <rect width="160" height="30" rx="15" fill="#EBE1D5" stroke="#DFD4C6" stroke-width="1"/>
      <circle cx="18" cy="15" r="4.5" fill="#087E61"/>
      <text x="32" y="19" font-family="Outfit" font-size="11" font-weight="700" fill="#241912" letter-spacing="0.8">
        SMART COLLAR LIVE
      </text>
    </g>

    <!-- THE MASTER DIGITAL PASSPORT (1080 x 498 px, centered at X=60, Y=70) -->
    <g transform="translate(60, 70)" filter="url(#passShadow)">
      <!-- Outer Card Surface -->
      <rect width="1080" height="498" rx="30" fill="#FFFFFF" stroke="#EAE2D8" stroke-width="1.5"/>

      <!-- LEFT: Hero Photo Frame (396 x 442 px at X=28, Y=28) -->
      <g transform="translate(28, 28)">
        <g clip-path="url(#ogPhotoSquircle)">
          <rect width="396" height="442" fill="#EFE8DE"/>
          <image href="${dataUri}" width="396" height="442" preserveAspectRatio="xMidYMid slice" filter="url(#warmFurFilter)"/>
        </g>
        <!-- Clean white inset rim -->
        <rect width="396" height="442" rx="26" fill="none" stroke="#FFFFFF" stroke-width="2.5" opacity="0.85"/>

        <!-- Inset Verified Badge (Bottom Left of Photo) -->
        <g transform="translate(20, 378)">
          <rect width="216" height="44" rx="22" fill="#1C140E" opacity="0.92"/>
          <circle cx="22" cy="22" r="11" fill="#087E61"/>
          <text x="22" y="26" font-size="12" text-anchor="middle" fill="#FFFFFF" font-family="Outfit" font-weight="900">✓</text>
          <text x="42" y="21" font-family="Outfit" font-size="11" font-weight="800" fill="#FFFFFF" letter-spacing="0.5">
            VERIFIED CANINE
          </text>
          <text x="42" y="33" font-family="Outfit" font-size="9" font-weight="600" fill="#A7F3D0" letter-spacing="1">
            PUPLUME SMART COLLAR
          </text>
        </g>
      </g>

      <!-- RIGHT: The Clean Passport Dossier (X=460 to X=1052, Width=592 px) -->
      <g transform="translate(460, 40)">
        <!-- Header Tag Row -->
        <g>
          <text x="0" y="0" font-family="Outfit" font-size="11" font-weight="700" fill="#9C897A" letter-spacing="1.8">
            OFFICIAL PASSPORT
          </text>
          <text x="144" y="0" font-family="Outfit" font-size="12" font-weight="800" fill="#8B5E3C" letter-spacing="1">
            // NO. PL-985-GRAXZO-2026
          </text>

          <!-- Tactile NFC Chip Symbol -->
          <g transform="translate(540, -10)">
            <rect width="42" height="28" rx="7" fill="#FDF7EE" stroke="#DAC1A4" stroke-width="1.2"/>
            <path d="M 13 14 L 29 14 M 21 6 L 21 22" stroke="#8B5E3C" stroke-width="1.5" stroke-linecap="round"/>
          </g>
        </g>

        <!-- Pet Name: Modern, Sleek, Architectural Outfit 900 -->
        <g transform="translate(0, 60)">
          <text x="0" y="0" font-family="Outfit" font-size="74" font-weight="900" fill="#1C140E" letter-spacing="-1.8">
            Graxzo
          </text>
          <text x="3" y="34" font-family="Outfit" font-size="20" font-weight="600" fill="#6A5A4D">
            German Shepherd • 12 lbs • 6 Months Old
          </text>
        </g>

        <!-- Status Highlights (3 Balanced Pills with Exact Spacing) -->
        <g transform="translate(0, 134)">
          <!-- Pill 1 -->
          <g transform="translate(0, 0)">
            <rect width="158" height="36" rx="18" fill="#F0FDF4" stroke="#DCFCE7" stroke-width="1.2"/>
            <circle cx="18" cy="18" r="4.5" fill="#16A34A"/>
            <text x="30" y="23" font-family="Outfit" font-size="12" font-weight="700" fill="#15803D">
              Active Collar Tag
            </text>
          </g>
          <!-- Pill 2 -->
          <g transform="translate(170, 0)">
            <rect width="150" height="36" rx="18" fill="#FEF3C7" stroke="#FDE68A" stroke-width="1.2"/>
            <circle cx="18" cy="18" r="4.5" fill="#D97706"/>
            <text x="30" y="23" font-family="Outfit" font-size="12" font-weight="700" fill="#B45309">
              Fully Vaccinated
            </text>
          </g>
          <!-- Pill 3 -->
          <g transform="translate(332, 0)">
            <rect width="158" height="36" rx="18" fill="#F0F9FF" stroke="#E0F2FE" stroke-width="1.2"/>
            <circle cx="18" cy="18" r="4.5" fill="#0284C7"/>
            <text x="30" y="23" font-family="Outfit" font-size="12" font-weight="700" fill="#0369A1">
              Emergency Ready
            </text>
          </g>
        </g>

        <!-- Divider Line -->
        <line x1="0" y1="202" x2="582" y2="202" stroke="#EFE6DC" stroke-width="1.2"/>

        <!-- 2-Column Swiss Specs Grid -->
        <g transform="translate(0, 230)">
          <!-- Col 1 -->
          <g>
            <text x="0" y="0" font-family="Outfit" font-size="10" font-weight="700" fill="#9C897A" letter-spacing="1.5">
              MICROCHIP ID
            </text>
            <text x="0" y="24" font-family="Outfit" font-size="16" font-weight="800" fill="#241912">
              985-GRAXZO-2025-PUP
            </text>
          </g>
          <!-- Col 2 -->
          <g transform="translate(290, 0)">
            <text x="0" y="0" font-family="Outfit" font-size="10" font-weight="700" fill="#9C897A" letter-spacing="1.5">
              CARE &amp; TEMPERAMENT
            </text>
            <text x="0" y="24" font-family="Outfit" font-size="16" font-weight="600" fill="#241912">
              Playful, affectionate &amp; loyal
            </text>
          </g>
        </g>

        <!-- Bottom Integrated Scan Collar Banner (582 x 88 px at Y=292) -->
        <g transform="translate(0, 292)">
          <rect width="582" height="88" rx="22" fill="#FAF6F0" stroke="#EDE4D8" stroke-width="1.2"/>
          <!-- Mini QR Matrix -->
          <g transform="translate(18, 16)">
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
          <!-- Shield badge -->
          <g transform="translate(532, 30)">
            <circle cx="14" cy="14" r="14" fill="#EAE0D4"/>
            <path d="M 10 13 L 10 11 C 10 9 12 7 14 7 C 16 7 18 9 18 11 L 18 13 M 9 13 L 19 13 L 19 20 L 9 20 Z" fill="none" stroke="#5F4B3C" stroke-width="1.5"/>
          </g>
        </g>
      </g>
    </g>

    <!-- FOOTER SIGNATURE (Aligned with Card Margins: X=60 to X=1140) -->
    <g transform="translate(60, 608)">
      <text x="0" y="0" font-family="Outfit" font-size="12" font-weight="600" fill="#8C7A6D">
        puplumepet.vercel.app/pup/graxzo
      </text>
    </g>
    <g transform="translate(1140, 608)">
      <text x="0" y="0" font-family="Outfit" font-size="12" font-weight="600" fill="#8C7A6D" text-anchor="end">
        Small paws. Big peace of mind. ♡
      </text>
    </g>
  </svg>`;

  // =========================================================================
  // 2. MASTER INSTAGRAM STORY TEMPLATE (1080 x 1920 px, 9:16)
  // Clean, high-impact vertical editorial.
  // ONLY "PupLume" in Grandstander; ALL ELSE in Outfit!
  // =========================================================================
  const storySvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1920" width="1080" height="1920">
    <defs>
      ${warmFurFilter}
      <linearGradient id="storyCanvasBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FCFAF7"/>
        <stop offset="45%" stop-color="#F5EFE7"/>
        <stop offset="100%" stop-color="#EAE0D3"/>
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

    <!-- TOP INSTAGRAM SAFE HEADER (Y=140) -->
    <g transform="translate(80, 140)">
      ${mascot(0.14)}
      <!-- ONLY PupLume in Grandstander -->
      <text x="64" y="32" font-family="Grandstander" font-size="34" font-weight="900" fill="#241912">
        Pup<tspan fill="#8B5E3C">Lume</tspan>
      </text>
      <!-- Subtitle in Outfit -->
      <text x="66" y="56" font-family="Outfit" font-size="12" font-weight="700" fill="#8C7A6D" letter-spacing="2">
        DIGITAL PET PASSPORT
      </text>
      <g transform="translate(920, 30)">
        <text x="0" y="0" font-family="Outfit" font-size="12" font-weight="700" fill="#8C7A6D" letter-spacing="1.5" text-anchor="end">
          2026 OFFICIAL PASS
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

      <!-- FLOATING FROSTED GLASS HUD (At base of photo) -->
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
        <!-- Smart Collar Active tag -->
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

        <!-- Divider Line -->
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

  console.log('Rendering Swiss-Aligned Master OpenGraph Card with Outfit font...');
  const resvgOg = new Resvg(ogSvg, {
    fitTo: { mode: 'width', value: 1200 },
    font: {
      fontFiles: fonts,
      defaultFontFamily: 'Outfit'
    }
  });
  const ogPng = resvgOg.render().asPng();

  console.log('Rendering Swiss-Aligned Master Instagram Story Template with Outfit font...');
  const resvgStory = new Resvg(storySvg, {
    fitTo: { mode: 'width', value: 1080 },
    font: {
      fontFiles: fonts,
      defaultFontFamily: 'Outfit'
    }
  });
  const storyPng = resvgStory.render().asPng();

  // Save to public/
  fs.writeFileSync(path.join(__dirname, '../public/master-og-preview.svg'), ogSvg);
  fs.writeFileSync(path.join(__dirname, '../public/master-og-preview.png'), ogPng);
  fs.writeFileSync(path.join(__dirname, '../public/master-story-template.svg'), storySvg);
  fs.writeFileSync(path.join(__dirname, '../public/master-story-template.png'), storyPng);

  // Copy to live endpoints
  fs.copyFileSync(path.join(__dirname, '../public/master-og-preview.png'), path.join(__dirname, '../public/og-graxzo.png'));
  fs.copyFileSync(path.join(__dirname, '../public/master-og-preview.png'), path.join(__dirname, '../public/og-pup-preview.png'));
  fs.copyFileSync(path.join(__dirname, '../public/master-og-preview.svg'), path.join(__dirname, '../public/og-pup-preview.svg'));

  console.log('SUCCESS: Master assets generated with Outfit font and immaculate alignment!');
}

main().catch(console.error);
