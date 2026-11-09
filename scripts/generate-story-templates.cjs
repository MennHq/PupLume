const fs = require('fs');
const path = require('path');
const { Resvg } = require('@resvg/resvg-js');

async function main() {
  const photoUrl = 'https://res.cloudinary.com/puplume/image/upload/v1792845578/puplume/pets/j76lqhakqxgczyplknen.jpg';
  console.log('Fetching photo from Cloudinary...');
  const res = await fetch(photoUrl);
  const buf = await res.arrayBuffer();
  const b64 = Buffer.from(buf).toString('base64');
  const dataUri = `data:image/jpeg;base64,${b64}`;

  // Fonts
  const fonts = [
    path.join(__dirname, '..', 'fonts', 'Grandstander-Black.ttf'),
    path.join(__dirname, '..', 'fonts', 'Grandstander-ExtraBold.ttf'),
    path.join(__dirname, '..', 'fonts', 'Grandstander-Bold.ttf'),
    path.join(__dirname, '..', 'fonts', 'Grandstander-SemiBold.ttf'),
    path.join(__dirname, '..', 'fonts', 'Grandstander-Medium.ttf'),
    path.join(__dirname, '..', 'fonts', 'Grandstander-Regular.ttf'),
  ];

  // ==========================================
  // Template 1: Spotify-Style Editorial Story (1080 x 1920)
  // ==========================================
  const t1Svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1920" width="1080" height="1920">
    <defs>
      <linearGradient id="t1Bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FFFDF9"/>
        <stop offset="40%" stop-color="#FFF9F2"/>
        <stop offset="80%" stop-color="#FAF1E6"/>
        <stop offset="100%" stop-color="#F5E8D8"/>
      </linearGradient>
      <radialGradient id="t1Peach" cx="25%" cy="20%" r="65%">
        <stop offset="0%" stop-color="#FCDDC7" stop-opacity="0.45"/>
        <stop offset="100%" stop-color="#FFF9F2" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="t1Amber" cx="80%" cy="75%" r="65%">
        <stop offset="0%" stop-color="#FDE68A" stop-opacity="0.35"/>
        <stop offset="100%" stop-color="#FFF9F2" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="logoPupGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#A27046"/>
        <stop offset="100%" stop-color="#734927"/>
      </linearGradient>
      <linearGradient id="logoLumeStar" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FDE68A"/>
        <stop offset="50%" stop-color="#F59E0B"/>
        <stop offset="100%" stop-color="#D97706"/>
      </linearGradient>
      <filter id="photoShadow" x="-10%" y="-10%" width="125%" height="125%">
        <feDropShadow dx="0" dy="24" stdDeviation="32" flood-color="#2C211B" flood-opacity="0.12"/>
      </filter>
      <clipPath id="t1PhotoClip">
        <rect x="0" y="0" width="880" height="840" rx="44" />
      </clipPath>
    </defs>

    <rect width="1080" height="1920" fill="url(#t1Bg)"/>
    <rect width="1080" height="1920" fill="url(#t1Peach)"/>
    <rect width="1080" height="1920" fill="url(#t1Amber)"/>

    <!-- Header Brand Section (Safe zone: below y=200) -->
    <g transform="translate(100, 240)">
      <rect width="64" height="64" rx="20" fill="url(#logoPupGrad)"/>
      <g transform="translate(2, -2) scale(0.14)">
        <path d="M 120 120 C 60 140 30 210 40 290 C 45 320 70 340 95 325 C 115 310 135 250 140 200 Z" fill="#5F3E29" />
        <path d="M 320 120 C 380 140 410 210 400 290 C 395 320 370 340 345 325 C 325 310 305 250 300 200 Z" fill="#5F3E29" />
        <ellipse cx="220" cy="275" rx="85" ry="70" fill="#FFF9F2" />
        <path d="M 195 240 C 195 230 245 230 245 240 C 245 258 228 272 220 272 C 212 272 195 258 195 240 Z" fill="#2C211B" />
        <ellipse cx="212" cy="238" rx="6" ry="3" fill="#FFFFFF" opacity="0.6" />
        <circle cx="165" cy="205" r="14" fill="#2C211B" />
        <circle cx="161" cy="201" r="5" fill="#FFFFFF" />
        <circle cx="275" cy="205" r="14" fill="#2C211B" />
        <circle cx="271" cy="201" r="5" fill="#FFFFFF" />
        <g transform="translate(295, 45)">
          <path d="M 40 0 C 40 22 58 40 80 40 C 58 40 40 58 40 80 C 40 58 22 40 0 40 C 22 40 40 22 40 0 Z" fill="url(#logoLumeStar)" />
          <circle cx="40" cy="40" r="10" fill="#FFF9F2" />
        </g>
      </g>
      <text x="86" y="40" font-family="Grandstander" font-size="44" font-weight="900" fill="#2C211B" letter-spacing="-0.5">
        Pup<tspan fill="#8B5E3C">Lume</tspan>
      </text>
      <text x="88" y="62" font-family="Grandstander" font-size="14" font-weight="700" fill="#766A63" letter-spacing="2.5">
        VERIFIED DIGITAL PET PASSPORT
      </text>
    </g>

    <!-- Center: Large Hero Photo Card -->
    <g transform="translate(100, 350)" filter="url(#photoShadow)">
      <g clip-path="url(#t1PhotoClip)">
        <rect width="880" height="840" fill="#FAF0E4"/>
        <image href="${dataUri}" width="880" height="840" preserveAspectRatio="xMidYMid slice" />
      </g>
      <!-- Verified Emerald Badge -->
      <g transform="translate(790, 40)">
        <circle cx="34" cy="34" r="34" fill="#059669" stroke="#FFFFFF" stroke-width="4"/>
        <text x="34" y="44" font-size="30" text-anchor="middle" fill="#FFFFFF" font-family="Grandstander" font-weight="900">✓</text>
      </g>
    </g>

    <!-- Content: Bold Name & Attributes (Grandstander Black 900) -->
    <g transform="translate(100, 1270)">
      <text x="0" y="0" font-family="Grandstander" font-size="82" font-weight="900" fill="#2C211B" letter-spacing="-2">
        Graxzo
      </text>
      <text x="0" y="52" font-family="Grandstander" font-size="36" font-weight="700" fill="#8B5E3C">
        German Shepherd • 12 lbs • 6 mo
      </text>

      <!-- Status Indicators -->
      <g transform="translate(0, 110)">
        <circle cx="10" cy="-8" r="8" fill="#059669" />
        <text x="30" y="0" font-family="Grandstander" font-size="26" font-weight="700" fill="#059669">
          Active Collar Tag
        </text>

        <circle cx="300" cy="-8" r="8" fill="#059669" />
        <text x="320" y="0" font-family="Grandstander" font-size="26" font-weight="700" fill="#059669">
          Vaccinated
        </text>
      </g>

      <!-- Microchip & Temperament -->
      <g transform="translate(0, 180)">
        <text x="0" y="0" font-family="Grandstander" font-size="20" font-weight="700" fill="#766A63" letter-spacing="1.5">
          MICROCHIP ID:
        </text>
        <text x="180" y="0" font-family="Grandstander" font-size="24" font-weight="800" fill="#2C211B">
          985-GRAXZO-2025-PUP
        </text>

        <text x="0" y="46" font-family="Grandstander" font-size="20" font-weight="700" fill="#766A63" letter-spacing="1.5">
          CARE NOTES:
        </text>
        <text x="160" y="46" font-family="Grandstander" font-size="24" font-weight="600" fill="#5F3E29">
          Playful, affectionate, and learning fast
        </text>
      </g>
    </g>

    <!-- Bottom Spotify-Style Link Callout (Safe zone: above y=1650) -->
    <g transform="translate(100, 1580)">
      <rect width="880" height="90" rx="28" fill="#FFFFFF" stroke="#E8DDD3" stroke-width="2" filter="url(#photoShadow)"/>
      <text x="440" y="55" font-family="Grandstander" font-size="28" font-weight="900" fill="#8B5E3C" text-anchor="middle">
        TAP LINK STICKER TO VIEW PASSPORT 🐾
      </text>
    </g>
  </svg>`;

  // ==========================================
  // Template 2: Clean Minimal Passport ID (1080 x 1920)
  // ==========================================
  const t2Svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1920" width="1080" height="1920">
    <defs>
      <linearGradient id="t2Bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FAF4EB"/>
        <stop offset="100%" stop-color="#F2E6D8"/>
      </linearGradient>
      <filter id="t2CardShadow" x="-10%" y="-10%" width="125%" height="125%">
        <feDropShadow dx="0" dy="28" stdDeviation="36" flood-color="#2C211B" flood-opacity="0.10"/>
      </filter>
      <clipPath id="t2PhotoClip">
        <rect width="800" height="740" rx="36" />
      </clipPath>
    </defs>

    <rect width="1080" height="1920" fill="url(#t2Bg)"/>

    <!-- Passport Card Frame -->
    <g transform="translate(90, 260)" filter="url(#t2CardShadow)">
      <rect width="900" height="1360" rx="48" fill="#FFFFFF" stroke="#E8DDD3" stroke-width="3"/>
      
      <!-- Card Header -->
      <g transform="translate(50, 60)">
        <text x="0" y="40" font-family="Grandstander" font-size="44" font-weight="900" fill="#2C211B">
          Pup<tspan fill="#8B5E3C">Lume</tspan>
        </text>
        <text x="0" y="70" font-family="Grandstander" font-size="14" font-weight="800" fill="#8B5E3C" letter-spacing="3">
          OFFICIAL CANINE PASSPORT
        </text>
        <g transform="translate(730, 10)">
          <circle cx="28" cy="28" r="28" fill="#FAF2E6" stroke="#8B5E3C" stroke-width="2"/>
          <text x="28" y="36" font-family="Grandstander" font-size="24" font-weight="900" fill="#8B5E3C" text-anchor="middle">🐾</text>
        </g>
      </g>

      <!-- Photo -->
      <g transform="translate(50, 160)">
        <g clip-path="url(#t2PhotoClip)">
          <image href="${dataUri}" width="800" height="740" preserveAspectRatio="xMidYMid slice" />
        </g>
      </g>

      <!-- Pet Name & Info -->
      <g transform="translate(50, 970)">
        <text x="0" y="40" font-family="Grandstander" font-size="68" font-weight="900" fill="#2C211B">Graxzo</text>
        <text x="0" y="86" font-family="Grandstander" font-size="30" font-weight="700" fill="#8B5E3C">German Shepherd • 6 Months</text>

        <line x1="0" y1="120" x2="800" y2="120" stroke="#F0E5D8" stroke-width="2" />

        <g transform="translate(0, 160)">
          <text x="0" y="0" font-family="Grandstander" font-size="18" font-weight="800" fill="#766A63">STATUS</text>
          <text x="0" y="28" font-family="Grandstander" font-size="22" font-weight="900" fill="#059669">✓ VERIFIED ACTIVE</text>

          <text x="280" y="0" font-family="Grandstander" font-size="18" font-weight="800" fill="#766A63">COLLAR TAG</text>
          <text x="280" y="28" font-family="Grandstander" font-size="22" font-weight="900" fill="#2C211B">SMART QR SCANNABLE</text>

          <text x="600" y="0" font-family="Grandstander" font-size="18" font-weight="800" fill="#766A63">VAULT</text>
          <text x="600" y="28" font-family="Grandstander" font-size="22" font-weight="900" fill="#8B5E3C">MEDICAL READY</text>
        </g>
      </g>

      <!-- Footer Inside Card -->
      <g transform="translate(50, 1260)">
        <rect width="800" height="60" rx="16" fill="#FAF2E6" />
        <text x="400" y="38" font-family="Grandstander" font-size="20" font-weight="800" fill="#5F3E29" text-anchor="middle">
          puplumepet.vercel.app/pup/graxzo
        </text>
      </g>
    </g>
  </svg>`;

  // ==========================================
  // Template 3: High-Contrast Safety & Recovery Story (1080 x 1920)
  // ==========================================
  const t3Svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1920" width="1080" height="1920">
    <defs>
      <linearGradient id="t3Bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FFFDF9"/>
        <stop offset="50%" stop-color="#FFF5EC"/>
        <stop offset="100%" stop-color="#FDE8D4"/>
      </linearGradient>
      <clipPath id="t3PhotoClip">
        <rect width="880" height="920" rx="40" />
      </clipPath>
      <filter id="t3Shadow" x="-10%" y="-10%" width="125%" height="125%">
        <feDropShadow dx="0" dy="24" stdDeviation="32" flood-color="#2C211B" flood-opacity="0.12"/>
      </filter>
    </defs>

    <rect width="1080" height="1920" fill="url(#t3Bg)"/>

    <!-- Urgent Top Safety Banner -->
    <g transform="translate(100, 230)">
      <rect width="880" height="80" rx="24" fill="#059669" />
      <text x="440" y="50" font-family="Grandstander" font-size="28" font-weight="900" fill="#FFFFFF" text-anchor="middle">
        🛡️ VERIFIED PUPLUME COLLAR TAG ID
      </text>
    </g>

    <!-- Large Borderless Photo -->
    <g transform="translate(100, 340)" filter="url(#t3Shadow)">
      <g clip-path="url(#t3PhotoClip)">
        <image href="${dataUri}" width="880" height="920" preserveAspectRatio="xMidYMid slice" />
      </g>
    </g>

    <!-- Bottom Safety Specs -->
    <g transform="translate(100, 1310)">
      <text x="0" y="40" font-family="Grandstander" font-size="78" font-weight="900" fill="#2C211B">
        Meet Graxzo
      </text>
      <text x="0" y="90" font-family="Grandstander" font-size="34" font-weight="700" fill="#8B5E3C">
        German Shepherd • Microchipped &amp; Vaccinated
      </text>

      <g transform="translate(0, 150)">
        <rect width="880" height="120" rx="24" fill="#FFFFFF" stroke="#E8DDD3" stroke-width="2"/>
        <text x="40" y="50" font-family="Grandstander" font-size="18" font-weight="800" fill="#766A63">EMERGENCY CONTACT &amp; VET RECORDS</text>
        <text x="40" y="85" font-family="Grandstander" font-size="26" font-weight="900" fill="#059669">Live Collar Tag Active • Scan to Connect</text>
      </g>
    </g>

    <!-- Link Sticker Placeholder -->
    <g transform="translate(100, 1630)">
      <rect width="880" height="80" rx="24" fill="#8B5E3C" />
      <text x="440" y="50" font-family="Grandstander" font-size="26" font-weight="900" fill="#FFFFFF" text-anchor="middle">
        👉 TAP HERE TO OPEN OFFICIAL PASSPORT
      </text>
    </g>
  </svg>`;

  const templates = [
    { svg: t1Svg, name: 'story-template-1' },
    { svg: t2Svg, name: 'story-template-2' },
    { svg: t3Svg, name: 'story-template-3' }
  ];

  for (const t of templates) {
    const svgPath = path.join(__dirname, '..', 'public', `${t.name}.svg`);
    fs.writeFileSync(svgPath, t.svg, 'utf8');

    const resvg = new Resvg(t.svg, {
      fitTo: { mode: 'width', value: 1080 },
      font: {
        fontFiles: fonts,
        defaultFontFamily: 'Grandstander'
      }
    });
    const png = resvg.render().asPng();
    const pngPath = path.join(__dirname, '..', 'public', `${t.name}.png`);
    fs.writeFileSync(pngPath, png);
    console.log(`Rendered ${t.name}.png (${png.length} bytes)`);
  }
}

main().catch(console.error);
