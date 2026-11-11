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

  // Common Golden Fur filter
  const warmFilter = `
    <filter id="warmFur" x="0%" y="0%" width="100%" height="100%">
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

  // Transparent Clean Mascot
  const mascot = (scale = 0.125) => `
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
  // CONCEPT 1: "APPLE WALLET / TITANIUM DIGITAL PASS" (1200 x 630)
  // Luxury boarding-pass aesthetic with subtle ticket notches, tactile QR,
  // integrated NFC chip, and unified card geometry.
  // =========================================================================
  const concept1_og = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
    <defs>
      ${warmFilter}
      <linearGradient id="bg1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#F7F3ED"/>
        <stop offset="100%" stop-color="#E9DFD2"/>
      </linearGradient>
      <filter id="shadow1" x="-10%" y="-10%" width="125%" height="125%">
        <feDropShadow dx="0" dy="24" stdDeviation="30" flood-color="#3A2818" flood-opacity="0.14"/>
        <feDropShadow dx="0" dy="6" stdDeviation="10" flood-color="#3A2818" flood-opacity="0.06"/>
      </filter>
      <clipPath id="passPhotoClip1">
        <rect width="380" height="490" rx="28"/>
      </clipPath>
    </defs>

    <rect width="1200" height="630" fill="url(#bg1)"/>

    <!-- Subtle studio grid -->
    <path d="M 0 50 L 1200 50 M 0 580 L 1200 580 M 60 0 L 60 630 M 1140 0 L 1140 630" stroke="#DFD5C6" stroke-width="1" opacity="0.6"/>

    <!-- Top Branding -->
    <g transform="translate(60, 16)">
      ${mascot(0.11)}
      <text x="50" y="24" font-family="Grandstander" font-size="26" font-weight="900" fill="#241912">
        Pup<tspan fill="#8B5E3C">Lume</tspan>
      </text>
      <text x="170" y="23" font-family="Grandstander" font-size="11" font-weight="800" fill="#8A7769" letter-spacing="2">
        // VERIFIED CANINE PASSPORT
      </text>
    </g>
    <g transform="translate(1000, 20)">
      <rect width="140" height="28" rx="14" fill="#E8DDD0" opacity="0.7"/>
      <circle cx="16" cy="14" r="4" fill="#087E61"/>
      <text x="28" y="18" font-family="Grandstander" font-size="10" font-weight="800" fill="#241912" letter-spacing="0.5">
        LIVE NFC ACTIVE
      </text>
    </g>

    <!-- THE UNIFIED WALLET PASS (1080 x 490) -->
    <g transform="translate(60, 68)" filter="url(#shadow1)">
      <!-- Main Pass Background -->
      <rect width="1080" height="490" rx="32" fill="#FFFFFF" stroke="#EAE1D5" stroke-width="1.5"/>

      <!-- Perforated Ticket Notches & Line -->
      <path d="M 410 0 C 410 16 424 30 440 30 C 456 30 470 16 470 0" fill="#F7F3ED" stroke="#EAE1D5" stroke-width="1.5"/>
      <path d="M 410 490 C 410 474 424 460 440 460 C 456 460 470 474 470 490" fill="#F7F3ED" stroke="#EAE1D5" stroke-width="1.5"/>
      <line x1="440" y1="36" x2="440" y2="454" stroke="#EAE1D5" stroke-width="1.5" stroke-dasharray="6,6"/>

      <!-- LEFT SECTION: Full Portrait Inset -->
      <g transform="translate(20, 20)">
        <g clip-path="url(#passPhotoClip1)">
          <rect width="380" height="450" fill="#EFE8DE"/>
          <image href="${dataUri}" width="380" height="450" preserveAspectRatio="xMidYMid slice" filter="url(#warmFur)"/>
        </g>
        <rect width="380" height="450" rx="28" fill="none" stroke="#FFFFFF" stroke-width="2" opacity="0.7"/>

        <!-- In-Photo Holographic Tag -->
        <g transform="translate(16, 388)">
          <rect width="180" height="44" rx="22" fill="#1A130E" opacity="0.9"/>
          <circle cx="22" cy="22" r="11" fill="#087E61"/>
          <text x="22" y="26" font-size="12" text-anchor="middle" fill="#FFFFFF" font-family="Grandstander" font-weight="900">✓</text>
          <text x="42" y="21" font-family="Grandstander" font-size="11" font-weight="800" fill="#FFFFFF">
            VERIFIED CANINE
          </text>
          <text x="42" y="33" font-family="Grandstander" font-size="9" font-weight="700" fill="#6EE7B7">
            PUPLUME COLLAR
          </text>
        </g>
      </g>

      <!-- RIGHT SECTION: The Digital Passport Dossier -->
      <g transform="translate(480, 40)">
        <!-- Pass Serial & NFC Radar -->
        <g>
          <text x="0" y="0" font-family="Grandstander" font-size="11" font-weight="800" fill="#998677" letter-spacing="2">
            PASSPORT ID
          </text>
          <text x="110" y="0" font-family="Grandstander" font-size="12" font-weight="900" fill="#241912" letter-spacing="1">
            PL-985-GRAXZO-2026
          </text>
          <g transform="translate(510, -8)">
            <!-- Tactile Gold NFC Chip -->
            <rect width="40" height="28" rx="6" fill="#FDE68A" stroke="#D97706" stroke-width="1.2"/>
            <path d="M 8 14 L 32 14 M 20 4 L 20 24" stroke="#B45309" stroke-width="1.2"/>
          </g>
        </g>

        <!-- Huge Confident Typography -->
        <g transform="translate(0, 68)">
          <text x="0" y="0" font-family="Grandstander" font-size="82" font-weight="900" fill="#1C140E" letter-spacing="-2">
            GRAXZO
          </text>
          <text x="4" y="28" font-family="Grandstander" font-size="19" font-weight="700" fill="#6E5F52">
            German Shepherd • 12 lbs • 6 Months
          </text>
        </g>

        <!-- Swiss Key-Value Metrics -->
        <g transform="translate(0, 140)">
          <!-- Col 1 -->
          <g>
            <text x="0" y="0" font-family="Grandstander" font-size="10" font-weight="800" fill="#998677" letter-spacing="1.5">
              MICROCHIP NO.
            </text>
            <text x="0" y="22" font-family="Grandstander" font-size="15" font-weight="800" fill="#241912">
              985-GRAXZO-2025
            </text>
          </g>
          <!-- Col 2 -->
          <g transform="translate(190, 0)">
            <text x="0" y="0" font-family="Grandstander" font-size="10" font-weight="800" fill="#998677" letter-spacing="1.5">
              HEALTH STATUS
            </text>
            <text x="0" y="22" font-family="Grandstander" font-size="15" font-weight="800" fill="#15803D">
              ● Fully Vaccinated
            </text>
          </g>
          <!-- Col 3 -->
          <g transform="translate(370, 0)">
            <text x="0" y="0" font-family="Grandstander" font-size="10" font-weight="800" fill="#998677" letter-spacing="1.5">
              COLLAR SECURITY
            </text>
            <text x="0" y="22" font-family="Grandstander" font-size="15" font-weight="800" fill="#B45309">
              ● Active Smart Tag
            </text>
          </g>
        </g>

        <line x1="0" y1="205" x2="550" y2="205" stroke="#EFE6DA" stroke-width="1.2"/>

        <!-- Personality & Care Note -->
        <g transform="translate(0, 235)">
          <text x="0" y="0" font-family="Grandstander" font-size="10" font-weight="800" fill="#998677" letter-spacing="1.5">
            CARE &amp; TEMPERAMENT
          </text>
          <text x="0" y="22" font-family="Grandstander" font-size="15" font-weight="700" fill="#3D3025">
            Playful, affectionate, loves children &amp; learning fast.
          </text>
        </g>

        <!-- Bottom Integrated Scan Callout -->
        <g transform="translate(0, 295)">
          <rect width="550" height="96" rx="20" fill="#F8F4EE" stroke="#E8DFD3" stroke-width="1.2"/>
          <!-- Mini QR Scanner -->
          <g transform="translate(18, 16)">
            <rect width="64" height="64" rx="12" fill="#FFFFFF" stroke="#E2D7C8" stroke-width="1"/>
            <g transform="translate(14, 14)" fill="#241912">
              <rect width="12" height="12" rx="2"/>
              <rect x="24" y="0" width="12" height="12" rx="2"/>
              <rect x="0" y="24" width="12" height="12" rx="2"/>
              <rect x="16" y="16" width="6" height="6" rx="1"/>
              <rect x="26" y="26" width="10" height="10" rx="1"/>
            </g>
          </g>
          <g transform="translate(100, 38)">
            <text x="0" y="0" font-family="Grandstander" font-size="15" font-weight="900" fill="#241912">
              Scan Collar Tag to Connect Live
            </text>
            <text x="0" y="20" font-family="Grandstander" font-size="11" font-weight="600" fill="#756455">
              Instant emergency contacts, dietary rules &amp; medical vault
            </text>
          </g>
        </g>
      </g>
    </g>

    <!-- Bottom Signature -->
    <g transform="translate(60, 608)">
      <text x="0" y="0" font-family="Grandstander" font-size="11" font-weight="800" fill="#8C7A6D">
        puplume.com/leo
      </text>
    </g>
    <g transform="translate(1140, 608)">
      <text x="0" y="0" font-family="Grandstander" font-size="11" font-weight="800" fill="#8C7A6D" text-anchor="end">
        Small paws. Big peace of mind. ♡
      </text>
    </g>
  </svg>`;

  // =========================================================================
  // CONCEPT 2: "CINEMATIC SPOTIFY-WRAPPED STORY" (1080 x 1920)
  // Full-bleed portrait, floating frosted telemetry capsule, massive type.
  // =========================================================================
  const concept2_story = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1920" width="1080" height="1920">
    <defs>
      ${warmFilter}
      <linearGradient id="bgStory2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#F9F6F0"/>
        <stop offset="40%" stop-color="#F2EBE0"/>
        <stop offset="100%" stop-color="#E2D6C5"/>
      </linearGradient>
      <filter id="storyShadow2" x="-10%" y="-10%" width="125%" height="125%">
        <feDropShadow dx="0" dy="30" stdDeviation="40" flood-color="#3A2818" flood-opacity="0.14"/>
      </filter>
      <clipPath id="storyPhotoClip2">
        <rect width="940" height="1060" rx="44"/>
      </clipPath>
    </defs>

    <rect width="1080" height="1920" fill="url(#bgStory2)"/>

    <!-- Top Instagram Safe Header (Y=140) -->
    <g transform="translate(70, 140)">
      ${mascot(0.14)}
      <text x="70" y="32" font-family="Grandstander" font-size="36" font-weight="900" fill="#241912">
        Pup<tspan fill="#8B5E3C">Lume</tspan>
      </text>
      <text x="72" y="56" font-family="Grandstander" font-size="12" font-weight="800" fill="#8A7769" letter-spacing="2.2">
        VERIFIED CANINE DIGITAL PASSPORT
      </text>
      <g transform="translate(940, 30)">
        <text x="0" y="0" font-family="Grandstander" font-size="13" font-weight="800" fill="#8A7769" letter-spacing="1.5" text-anchor="end">
          2026 OFFICIAL PASS
        </text>
      </g>
    </g>

    <!-- HERO PHOTO CARD (940 x 1060, Y=240) -->
    <g transform="translate(70, 240)" filter="url(#storyShadow2)">
      <g clip-path="url(#storyPhotoClip2)">
        <rect width="940" height="1060" fill="#EFE8DE"/>
        <image href="${dataUri}" width="940" height="1060" preserveAspectRatio="xMidYMid slice" filter="url(#warmFur)"/>
      </g>
      <rect width="940" height="1060" rx="44" fill="none" stroke="#FFFFFF" stroke-width="3" opacity="0.8"/>

      <!-- FLOATING GLASS PASSPORT HUD OVER PHOTO (Bottom of photo) -->
      <g transform="translate(32, 850)">
        <rect width="876" height="176" rx="32" fill="#1A130E" opacity="0.92"/>
        <rect width="876" height="176" rx="32" fill="none" stroke="#FFFFFF" stroke-width="1.2" opacity="0.15"/>

        <!-- Pet Name & Breed inside Glass HUD -->
        <g transform="translate(36, 68)">
          <text x="0" y="0" font-family="Grandstander" font-size="64" font-weight="900" fill="#FFFFFF" letter-spacing="-1">
            GRAXZO
          </text>
          <text x="4" y="30" font-family="Grandstander" font-size="18" font-weight="700" fill="#D1C4B7">
            German Shepherd • 12 lbs • 6 Months
          </text>
        </g>

        <!-- Verified Status Pill -->
        <g transform="translate(630, 42)">
          <rect width="210" height="46" rx="23" fill="#087E61"/>
          <circle cx="23" cy="23" r="11" fill="#FFFFFF"/>
          <text x="23" y="27" font-size="13" text-anchor="middle" fill="#087E61" font-family="Grandstander" font-weight="900">✓</text>
          <text x="44" y="28" font-family="Grandstander" font-size="12" font-weight="900" fill="#FFFFFF" letter-spacing="0.5">
            VERIFIED PUP
          </text>
        </g>
        <!-- NFC Active Tag -->
        <g transform="translate(630, 102)">
          <text x="210" y="20" font-family="Grandstander" font-size="12" font-weight="700" fill="#FDE68A" letter-spacing="1" text-anchor="end">
            ● SMART COLLAR ACTIVE
          </text>
        </g>
      </g>
    </g>

    <!-- DOSSIER TELEMETRY CARD (Y=1330, height=330) -->
    <g transform="translate(70, 1330)" filter="url(#storyShadow2)">
      <rect width="940" height="330" rx="36" fill="#FFFFFF" stroke="#EAE1D5" stroke-width="1.5"/>

      <g transform="translate(44, 44)">
        <!-- 3-Column Quick Metrics -->
        <g>
          <g>
            <text x="0" y="0" font-family="Grandstander" font-size="11" font-weight="800" fill="#998677" letter-spacing="1.5">
              MICROCHIP ID
            </text>
            <text x="0" y="26" font-family="Grandstander" font-size="19" font-weight="900" fill="#241912">
              985-GRAXZO-2025
            </text>
          </g>
          <g transform="translate(320, 0)">
            <text x="0" y="0" font-family="Grandstander" font-size="11" font-weight="800" fill="#998677" letter-spacing="1.5">
              VACCINE RECORD
            </text>
            <text x="0" y="26" font-family="Grandstander" font-size="19" font-weight="900" fill="#15803D">
              Up to Date ✓
            </text>
          </g>
          <g transform="translate(600, 0)">
            <text x="0" y="0" font-family="Grandstander" font-size="11" font-weight="800" fill="#998677" letter-spacing="1.5">
              CARE STATUS
            </text>
            <text x="0" y="26" font-family="Grandstander" font-size="19" font-weight="900" fill="#B45309">
              Emergency Ready
            </text>
          </g>
        </g>

        <!-- Divider -->
        <line x1="0" y1="80" x2="852" y2="80" stroke="#EFE6DA" stroke-width="1.2"/>

        <!-- Interactive Scan Prompt -->
        <g transform="translate(0, 110)">
          <rect width="852" height="130" rx="24" fill="#F8F4EE" stroke="#E8DFD3" stroke-width="1.2"/>
          <g transform="translate(24, 25)">
            <rect width="80" height="80" rx="16" fill="#FFFFFF" stroke="#E2D7C8" stroke-width="1"/>
            <g transform="translate(18, 18)" fill="#241912">
              <rect width="14" height="14" rx="2"/>
              <rect x="30" y="0" width="14" height="14" rx="2"/>
              <rect x="0" y="30" width="14" height="14" rx="2"/>
              <rect x="20" y="20" width="8" height="8" rx="1"/>
              <rect x="32" y="32" width="12" height="12" rx="2"/>
            </g>
          </g>
          <g transform="translate(128, 54)">
            <text x="0" y="0" font-family="Grandstander" font-size="20" font-weight="900" fill="#241912">
              One Scan. Right by their side.
            </text>
            <text x="0" y="26" font-family="Grandstander" font-size="14" font-weight="600" fill="#756455">
              Tap collar tag for live emergency contacts, diet &amp; vet vault
            </text>
          </g>
        </g>
      </g>
    </g>

    <!-- Bottom Instagram Link Sticker (Y=1710) -->
    <g transform="translate(70, 1710)">
      <rect width="940" height="84" rx="42" fill="#FFFFFF" stroke="#EDE5DA" stroke-width="1.5" filter="url(#storyShadow2)"/>
      <g transform="translate(470, 50)">
        <text x="0" y="0" font-family="Grandstander" font-size="19" font-weight="900" fill="#241912" letter-spacing="1.5" text-anchor="middle">
          TAP LINK STICKER TO VIEW PASSPORT 🐾
        </text>
      </g>
    </g>
  </svg>`;

  console.log('Rendering Concept 1 (Apple Wallet Pass OG)...');
  const resvgC1 = new Resvg(concept1_og, { fitTo: { mode: 'width', value: 1200 }, font: { fontFiles: fonts, defaultFontFamily: 'Grandstander' } });
  const pngC1 = resvgC1.render().asPng();

  console.log('Rendering Concept 2 (Cinematic Spotify Story)...');
  const resvgC2 = new Resvg(concept2_story, { fitTo: { mode: 'width', value: 1080 }, font: { fontFiles: fonts, defaultFontFamily: 'Grandstander' } });
  const pngC2 = resvgC2.render().asPng();

  // Save files
  fs.writeFileSync(path.join(__dirname, '../public/master-og-preview.svg'), concept1_og);
  fs.writeFileSync(path.join(__dirname, '../public/master-og-preview.png'), pngC1);
  fs.writeFileSync(path.join(__dirname, '../public/master-story-template.svg'), concept2_story);
  fs.writeFileSync(path.join(__dirname, '../public/master-story-template.png'), pngC2);

  // Copy to live endpoints
  fs.copyFileSync(path.join(__dirname, '../public/master-og-preview.png'), path.join(__dirname, '../public/og-graxzo.png'));
  fs.copyFileSync(path.join(__dirname, '../public/master-og-preview.png'), path.join(__dirname, '../public/og-pup-preview.png'));
  fs.copyFileSync(path.join(__dirname, '../public/master-og-preview.svg'), path.join(__dirname, '../public/og-pup-preview.svg'));

  console.log('Files successfully generated!');
}

main().catch(console.error);
