import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Resvg } from '@resvg/resvg-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outDir = path.resolve(__dirname, '../public/screenshots');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// 1. Mobile Narrow Screenshot SVG (720 x 1280)
const mobileSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 1280" width="720" height="1280">
  <defs>
    <!-- Background Radial Gradient -->
    <radialGradient id="bgGlow" cx="50%" cy="46%" r="65%">
      <stop offset="0%" stop-color="#3D2616" />
      <stop offset="45%" stop-color="#24150B" />
      <stop offset="100%" stop-color="#120A05" />
    </radialGradient>

    <!-- Golden Lume Halo -->
    <radialGradient id="lumeHalo" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#F59E0B" stop-opacity="0.35" />
      <stop offset="50%" stop-color="#8B5E3C" stop-opacity="0.18" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0" />
    </radialGradient>

    <!-- Pupil Mascot Gradients -->
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

    <!-- Soft Glow Filter -->
    <filter id="softGlow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="12" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>

  <!-- Deep Obsidian Bronze Backdrop -->
  <rect width="720" height="1280" fill="url(#bgGlow)" />

  <!-- Lume Ambient Glow Ring -->
  <circle cx="360" cy="500" r="320" fill="url(#lumeHalo)" />

  <!-- Background Decorative Subtle Stars/Sparkles -->
  <g opacity="0.35">
    <circle cx="120" cy="220" r="2.5" fill="#FDE68A" />
    <circle cx="620" cy="280" r="2" fill="#FDE68A" />
    <circle cx="140" cy="880" r="2" fill="#FDE68A" />
    <circle cx="590" cy="850" r="2.5" fill="#FDE68A" />
    <circle cx="200" cy="1120" r="1.5" fill="#FDE68A" />
    <circle cx="530" cy="1140" r="2" fill="#FDE68A" />
  </g>

  <!-- PupLume Mascot Centerpiece (Transparent, isolated vector) -->
  <g transform="translate(104, 250)">
    <!-- Head Base (Bronze Fur) -->
    <path d="M 220 80 C 130 80 70 140 70 240 C 70 330 140 380 220 380 C 300 380 370 330 370 240 C 370 140 310 80 220 80 Z" fill="url(#pupGrad)"/>

    <!-- Left Ear (dark chocolate brown) -->
    <path d="M 120 120 C 60 140 30 210 40 290 C 45 320 70 340 95 325 C 115 310 135 250 140 200 Z" fill="#5F3E29"/>

    <!-- Right Ear (dark chocolate brown) -->
    <path d="M 320 120 C 380 140 410 210 400 290 C 395 320 370 340 345 325 C 325 310 305 250 300 200 Z" fill="#5F3E29"/>

    <!-- Snout / Muzzle Cream Area -->
    <ellipse cx="220" cy="275" rx="85" ry="70" fill="#FFF9F2"/>

    <!-- Cute Dog Nose -->
    <path d="M 195 240 C 195 230 245 230 245 240 C 245 258 228 272 220 272 C 212 272 195 258 195 240 Z" fill="#2C211B"/>
    <ellipse cx="212" cy="238" rx="6" ry="3" fill="#FFFFFF" opacity="0.6"/>

    <!-- Mouth lines -->
    <path d="M 220 272 L 220 286" stroke="#2C211B" stroke-width="4" stroke-linecap="round"/>
    <path d="M 200 286 C 210 294 220 294 220 286 C 220 294 230 294 240 286" fill="none" stroke="#2C211B" stroke-width="4" stroke-linecap="round"/>

    <!-- Left Eye & Highlight -->
    <circle cx="165" cy="205" r="14" fill="#2C211B"/>
    <circle cx="161" cy="201" r="5" fill="#FFFFFF"/>

    <!-- Right Eye & Highlight -->
    <circle cx="275" cy="205" r="14" fill="#2C211B"/>
    <circle cx="271" cy="201" r="5" fill="#FFFFFF"/>

    <!-- Eyebrows -->
    <ellipse cx="160" cy="180" rx="14" ry="7" fill="#F3E7DA" opacity="0.9"/>
    <ellipse cx="280" cy="180" rx="14" ry="7" fill="#F3E7DA" opacity="0.9"/>

    <!-- Signature Glowing Lume Star -->
    <g transform="translate(290, 45)" filter="url(#softGlow)">
      <path d="M 40 0 C 40 22 58 40 80 40 C 58 40 40 58 40 80 C 40 58 22 40 0 40 C 22 40 40 22 40 0 Z" fill="url(#lumeGrad)"/>
      <circle cx="40" cy="40" r="10" fill="#FFF9F2"/>
    </g>
  </g>

  <!-- Brand Typography -->
  <g text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif">
    <!-- PupLume Wordmark -->
    <text x="360" y="770" font-size="64" font-weight="800" fill="#FFF9F2" letter-spacing="1">PupLume</text>

    <!-- Clean Premium Badge Container -->
    <rect x="110" y="810" width="500" height="52" rx="26" fill="#2B190E" stroke="#F59E0B" stroke-width="1.5" stroke-opacity="0.6" />
    <text x="360" y="844" font-size="19" font-weight="700" fill="#FDE68A" letter-spacing="2">CLEAN PREMIUM • AI PUPPY COMPANION</text>

    <!-- Subtitle description -->
    <text x="360" y="915" font-size="20" font-weight="500" fill="#DFC5AF" letter-spacing="0.5">Master Potty Training, Daily Care &amp; Health</text>

    <!-- 3 Pill Badges -->
    <g transform="translate(0, 960)">
      <!-- Pill 1: Potty Tracking -->
      <g transform="translate(90, 0)">
        <rect width="165" height="42" rx="21" fill="#1F1209" stroke="#8B5E3C" stroke-width="1.2" />
        <text x="82" y="27" font-size="15" font-weight="600" fill="#F7EEE4">🚽 Potty Logs</text>
      </g>
      <!-- Pill 2: Smart Schedule -->
      <g transform="translate(275, 0)">
        <rect width="170" height="42" rx="21" fill="#1F1209" stroke="#8B5E3C" stroke-width="1.2" />
        <text x="85" y="27" font-size="15" font-weight="600" fill="#F7EEE4">✨ Smart Plan</text>
      </g>
      <!-- Pill 3: Vet Safety -->
      <g transform="translate(465, 0)">
        <rect width="165" height="42" rx="21" fill="#1F1209" stroke="#8B5E3C" stroke-width="1.2" />
        <text x="82" y="27" font-size="15" font-weight="600" fill="#F7EEE4">🛡️ Vet Safety</text>
      </g>
    </g>
  </g>
</svg>
`;

// 2. Desktop Wide Screenshot SVG (1280 x 720)
const desktopSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" width="1280" height="720">
  <defs>
    <radialGradient id="bgGlowDesk" cx="50%" cy="50%" r="65%">
      <stop offset="0%" stop-color="#3D2616" />
      <stop offset="50%" stop-color="#24150B" />
      <stop offset="100%" stop-color="#120A05" />
    </radialGradient>

    <radialGradient id="lumeHaloDesk" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#F59E0B" stop-opacity="0.32" />
      <stop offset="50%" stop-color="#8B5E3C" stop-opacity="0.16" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0" />
    </radialGradient>

    <linearGradient id="pupGradDesk" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#8B5E3C"/>
      <stop offset="45%" stop-color="#A27046"/>
      <stop offset="100%" stop-color="#734927"/>
    </linearGradient>

    <linearGradient id="lumeGradDesk" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FDE68A"/>
      <stop offset="40%" stop-color="#F59E0B"/>
      <stop offset="100%" stop-color="#8B5E3C"/>
    </linearGradient>

    <filter id="softGlowDesk" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="12" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>

  <!-- Deep Obsidian Bronze Backdrop -->
  <rect width="1280" height="720" fill="url(#bgGlowDesk)" />
  <circle cx="640" cy="310" r="340" fill="url(#lumeHaloDesk)" />

  <!-- PupLume Mascot Centerpiece -->
  <g transform="translate(416, 50) scale(0.9)">
    <path d="M 220 80 C 130 80 70 140 70 240 C 70 330 140 380 220 380 C 300 380 370 330 370 240 C 370 140 310 80 220 80 Z" fill="url(#pupGradDesk)"/>
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
    <g transform="translate(290, 45)" filter="url(#softGlowDesk)">
      <path d="M 40 0 C 40 22 58 40 80 40 C 58 40 40 58 40 80 C 40 58 22 40 0 40 C 22 40 40 22 40 0 Z" fill="url(#lumeGradDesk)"/>
      <circle cx="40" cy="40" r="10" fill="#FFF9F2"/>
    </g>
  </g>

  <!-- Typography & Badges -->
  <g text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif">
    <text x="640" y="490" font-size="54" font-weight="800" fill="#FFF9F2" letter-spacing="1">PupLume</text>
    <rect x="370" y="520" width="540" height="48" rx="24" fill="#2B190E" stroke="#F59E0B" stroke-width="1.5" stroke-opacity="0.6" />
    <text x="640" y="552" font-size="18" font-weight="700" fill="#FDE68A" letter-spacing="2">CLEAN PREMIUM • AI PUPPY COMPANION</text>
    <text x="640" y="610" font-size="19" font-weight="500" fill="#DFC5AF" letter-spacing="0.5">Potty Training • Smart Daily Schedules • Veterinary Safety</text>
  </g>
</svg>
`;

function renderSvgToPng(svgString, outPath, width, height) {
  const resvg = new Resvg(svgString, {
    fitTo: {
      mode: 'width',
      value: width,
    },
  });
  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();
  fs.writeFileSync(outPath, pngBuffer);
  console.log(`Generated ${outPath} (${width}x${height}, ${pngBuffer.length} bytes)`);
}

renderSvgToPng(mobileSvg, path.join(outDir, 'puplume-mobile-preview.png'), 720, 1280);
renderSvgToPng(desktopSvg, path.join(outDir, 'puplume-desktop-preview.png'), 1280, 720);
console.log('Done generating screenshots!');
