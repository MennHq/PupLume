import fs from 'fs';
import path from 'path';
import QRCode from 'qrcode';
import { Resvg } from '@resvg/resvg-js';

const ARTIFACT_DIR = 'C:/Users/AHSAN HAROON/.gemini/antigravity/brain/94d34865-582d-40a1-bd75-dc162f8a0fb4';
const PUBLIC_DIR = path.resolve('public');

async function main() {
  console.log('Generating PupLume Instagram Story & Preview Designs...');

  const qrSvgRaw = await QRCode.toString('https://puplume.com/leo', {
    type: 'svg',
    margin: 1,
    color: {
      dark: '#2C211B',
      light: '#FFFFFF'
    }
  });

  // Extract inner svg content or embed safely
  const qrBase64 = Buffer.from(qrSvgRaw).toString('base64');
  const qrDataUri = `data:image/svg+xml;base64,${qrBase64}`;

  // -------------------------------------------------------------
  // Variant A: The Editorial Pet Passport (Warm Skin / Organic Modern)
  // -------------------------------------------------------------
  const variantASvg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1920" width="1080" height="1920">
    <defs>
      <linearGradient id="bgGradA" x1="0" y1="0" x2="0" y2="1920" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#FFFDF9" />
        <stop offset="40%" stop-color="#FFF9F2" />
        <stop offset="80%" stop-color="#FAF3E8" />
        <stop offset="100%" stop-color="#F5EBE1" />
      </linearGradient>

      <radialGradient id="orb1A" cx="300" cy="400" r="600" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#FCDDC7" stop-opacity="0.45" />
        <stop offset="100%" stop-color="#FFF9F2" stop-opacity="0" />
      </radialGradient>

      <radialGradient id="orb2A" cx="800" cy="1500" r="700" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#FDE68A" stop-opacity="0.35" />
        <stop offset="100%" stop-color="#FFF9F2" stop-opacity="0" />
      </radialGradient>

      <linearGradient id="logoGrad" x1="0" y1="0" x2="54" y2="54" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#A27046" />
        <stop offset="100%" stop-color="#734927" />
      </linearGradient>

      <linearGradient id="btnGrad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#8B5E3C" />
        <stop offset="100%" stop-color="#6F4629" />
      </linearGradient>

      <filter id="cardShadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="16" stdDeviation="24" flood-color="#2C211B" flood-opacity="0.10" />
      </filter>

      <filter id="photoShadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="20" stdDeviation="30" flood-color="#2C211B" flood-opacity="0.12" />
      </filter>

      <clipPath id="photoClip">
        <rect x="100" y="240" width="880" height="800" rx="44" />
      </clipPath>
    </defs>

    <!-- Background -->
    <rect width="1080" height="1920" fill="url(#bgGradA)" />
    <rect width="1080" height="1920" fill="url(#orb1A)" />
    <rect width="1080" height="1920" fill="url(#orb2A)" />

    <!-- Top Brand Header Bar -->
    <g transform="translate(540, 130)">
      <!-- Logo Squircle -->
      <rect x="-140" y="-32" width="56" height="56" rx="18" fill="url(#logoGrad)" />
      <!-- Logo Paw inside squircle -->
      <circle cx="-112" cy="-4" r="14" fill="#FFF9F2" />
      <circle cx="-98" cy="-20" r="6" fill="#F59E0B" />

      <!-- Wordmark -->
      <text x="-70" y="8" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-weight="900" font-size="46" fill="#2C211B">Pup<tspan fill="#8B5E3C">Lume</tspan></text>
      <!-- Subtitle -->
      <text x="0" y="46" text-anchor="middle" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-weight="800" font-size="16" letter-spacing="3" fill="#766A63">VERIFIED DIGITAL PET PASSPORT</text>
    </g>

    <!-- Hero Photo Container -->
    <g filter="url(#photoShadow)">
      <rect x="100" y="240" width="880" height="800" rx="44" fill="#F5EBE1" stroke="#EADCCF" stroke-width="2" />
    </g>

    <!-- Pet Photo Artwork -->
    <g clip-path="url(#photoClip)">
      <rect x="100" y="240" width="880" height="800" fill="#EBD9C8" />
      <!-- Stylized Golden Retriever Illustration -->
      <circle cx="540" cy="580" r="260" fill="#E6A868" />
      <circle cx="540" cy="620" r="200" fill="#F3C28A" />
      <!-- Ears -->
      <ellipse cx="360" cy="540" rx="70" ry="140" fill="#C98B4B" transform="rotate(-15 360 540)" />
      <ellipse cx="720" cy="540" rx="70" ry="140" fill="#C98B4B" transform="rotate(15 720 540)" />
      <!-- Snout & Nose -->
      <ellipse cx="540" cy="660" rx="80" ry="60" fill="#FFF2DF" />
      <ellipse cx="540" cy="640" rx="34" ry="24" fill="#2C211B" />
      <path d="M540,664 L540,690 Q540,705 520,705 M540,690 Q540,705 560,705" stroke="#2C211B" stroke-width="5" fill="none" stroke-linecap="round" />
      <!-- Eyes -->
      <circle cx="460" cy="550" r="18" fill="#2C211B" />
      <circle cx="465" cy="545" r="6" fill="#FFFFFF" />
      <circle cx="620" cy="550" r="18" fill="#2C211B" />
      <circle cx="625" cy="545" r="6" fill="#FFFFFF" />
      <!-- Cheeks -->
      <ellipse cx="430" cy="600" rx="20" ry="12" fill="#F29F80" opacity="0.6" />
      <ellipse cx="650" cy="600" rx="20" ry="12" fill="#F29F80" opacity="0.6" />
      <!-- Collar -->
      <rect x="420" y="790" width="240" height="40" rx="20" fill="#8B5E3C" />
      <circle cx="540" cy="830" r="22" fill="#F59E0B" />
      <circle cx="540" cy="830" r="14" fill="#FEF3C7" />
    </g>

    <!-- Verified Badge -->
    <g transform="translate(915, 295)">
      <circle cx="0" cy="0" r="36" fill="#059669" filter="url(#cardShadow)" />
      <circle cx="0" cy="0" r="36" fill="none" stroke="#FFFFFF" stroke-width="4" />
      <path d="M-12,-2 L-4,8 L14,-10" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="none" />
    </g>

    <!-- Pet Details Section -->
    <g transform="translate(100, 1100)">
      <!-- Name -->
      <text x="0" y="0" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-weight="900" font-size="76" fill="#2C211B">Milo</text>
      <!-- Breed & Bio -->
      <text x="0" y="52" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-weight="700" font-size="34" fill="#8B5E3C">Golden Retriever • Male • 18 lbs</text>
      <!-- Verified Status Pills -->
      <g transform="translate(0, 80)">
        <rect x="0" y="0" width="310" height="44" rx="22" fill="#ECFDF5" stroke="#A7F3D0" stroke-width="1.5" />
        <text x="24" y="28" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-weight="800" font-size="18" fill="#065F46">🛡️ Smart Collar Tag Active</text>

        <rect x="325" y="0" width="220" height="44" rx="22" fill="#FEF3C7" stroke="#FDE68A" stroke-width="1.5" />
        <text x="345" y="28" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-weight="800" font-size="18" fill="#92400E">💉 All Vaccines Up-to-Date</text>
      </g>
    </g>

    <!-- Scannable Passport & QR Card -->
    <g transform="translate(100, 1310)" filter="url(#cardShadow)">
      <rect x="0" y="0" width="880" height="340" rx="36" fill="#FFFFFF" stroke="#E8DDD3" stroke-width="2" />

      <!-- QR Code on left -->
      <g transform="translate(45, 45)">
        <rect x="0" y="0" width="250" height="250" rx="20" fill="#FFF9F2" stroke="#E8DDD3" stroke-width="1.5" />
        <image href="${qrDataUri}" x="15" y="15" width="220" height="220" />
      </g>

      <!-- Passport Data on right -->
      <g transform="translate(330, 70)">
        <text x="0" y="0" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-weight="800" font-size="16" letter-spacing="2" fill="#8B5E3C">DIGITAL PASSPORT ID</text>
        <text x="0" y="32" font-family="monospace" font-weight="900" font-size="32" fill="#2C211B">#PL-84920-MILO</text>

        <text x="0" y="74" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-weight="600" font-size="18" fill="#766A63">Microchip: <tspan font-weight="800" fill="#2C211B">985 141 002 348 910</tspan></text>
        <text x="0" y="104" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-weight="600" font-size="18" fill="#766A63">Emergency: <tspan font-weight="800" fill="#2C211B">Owner Contact 24/7</tspan></text>

        <rect x="0" y="134" width="480" height="54" rx="16" fill="url(#btnGrad)" />
        <text x="240" y="168" text-anchor="middle" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-weight="800" font-size="20" fill="#FFFFFF">📷 Scan or Tap to View Passport →</text>
      </g>
    </g>

    <!-- Bottom Instagram Link Sticker Helper -->
    <g transform="translate(540, 1750)">
      <rect x="-240" y="0" width="480" height="56" rx="28" fill="#FFFFFF" stroke="#E8DDD3" stroke-width="1.5" filter="url(#cardShadow)" />
      <!-- Instagram Gradient Icon -->
      <circle cx="-195" cy="28" r="16" fill="#E1306C" />
      <rect x="-205" y="18" width="20" height="20" rx="5" fill="none" stroke="#FFFFFF" stroke-width="2.5" />
      <circle cx="-195" cy="28" r="4.5" fill="none" stroke="#FFFFFF" stroke-width="2" />
      <text x="-165" y="36" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-weight="800" font-size="18" fill="#2C211B">puplume.com/leo</text>
      <text x="145" y="36" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-weight="800" font-size="16" fill="#8B5E3C">LINK ↗</text>
    </g>

    <text x="540" y="1845" text-anchor="middle" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-weight="700" font-size="16" fill="#766A63">Powered by PupLume • The AI Companion for Happy Puppies</text>
  </svg>
  `;

  // -------------------------------------------------------------
  // Variant B: The Vibrant Sunset Story (Social / Energetic)
  // -------------------------------------------------------------
  const variantBSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1920" width="1080" height="1920">
    <defs>
      <linearGradient id="bgGradB" x1="0" y1="0" x2="1080" y2="1920" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#FFF5EB" />
        <stop offset="35%" stop-color="#FED7AA" />
        <stop offset="70%" stop-color="#FDE68A" />
        <stop offset="100%" stop-color="#FFF9F2" />
      </linearGradient>

      <radialGradient id="sunBurst" cx="540" cy="500" r="700" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#F59E0B" stop-opacity="0.30" />
        <stop offset="100%" stop-color="#F59E0B" stop-opacity="0" />
      </radialGradient>

      <filter id="stickerShadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#7C2D12" flood-opacity="0.18" />
      </filter>

      <clipPath id="circleClip">
        <circle cx="540" cy="580" r="300" />
      </clipPath>
    </defs>

    <rect width="1080" height="1920" fill="url(#bgGradB)" />
    <rect width="1080" height="1920" fill="url(#sunBurst)" />

    <!-- Top Badge -->
    <g transform="translate(540, 110)">
      <rect x="-180" y="0" width="360" height="48" rx="24" fill="#8B5E3C" />
      <text x="0" y="31" text-anchor="middle" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-weight="900" font-size="20" letter-spacing="2" fill="#FFF9F2">✨ PUPLUME STORY SPOTLIGHT</text>
    </g>

    <!-- Circular Hero Photo with Ring -->
    <g filter="url(#stickerShadow)">
      <circle cx="540" cy="580" r="315" fill="#FFFFFF" />
      <circle cx="540" cy="580" r="306" fill="#F59E0B" stroke="#D97706" stroke-width="4" stroke-dasharray="16 8" />
    </g>

    <g clip-path="url(#circleClip)">
      <rect x="240" y="280" width="600" height="600" fill="#EBD9C8" />
      <circle cx="540" cy="580" r="230" fill="#E6A868" />
      <ellipse cx="380" cy="550" rx="60" ry="120" fill="#C98B4B" transform="rotate(-15 380 550)" />
      <ellipse cx="700" cy="550" rx="60" ry="120" fill="#C98B4B" transform="rotate(15 700 550)" />
      <ellipse cx="540" cy="650" rx="75" ry="55" fill="#FFF2DF" />
      <ellipse cx="540" cy="635" rx="30" ry="20" fill="#2C211B" />
      <circle cx="470" cy="550" r="16" fill="#2C211B" />
      <circle cx="610" cy="550" r="16" fill="#2C211B" />
    </g>

    <!-- Floating Achievement Stickers -->
    <g transform="translate(140, 360)" filter="url(#stickerShadow)" transform-origin="center">
      <rect x="0" y="0" width="220" height="64" rx="20" fill="#FEF3C7" stroke="#F59E0B" stroke-width="3" transform="rotate(-10)" />
      <text x="110" y="42" text-anchor="middle" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-weight="900" font-size="22" fill="#92400E" transform="rotate(-10)">🏆 100% GOOD BOY</text>
    </g>

    <g transform="translate(720, 720)" filter="url(#stickerShadow)">
      <rect x="0" y="0" width="230" height="64" rx="20" fill="#ECFDF5" stroke="#10B981" stroke-width="3" transform="rotate(8)" />
      <text x="115" y="42" text-anchor="middle" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-weight="900" font-size="22" fill="#065F46" transform="rotate(8)">⭐ ACADEMY STAR</text>
    </g>

    <!-- Main Name Title -->
    <g transform="translate(540, 990)">
      <text x="0" y="0" text-anchor="middle" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-weight="900" font-size="96" fill="#2C211B">Meet Milo! 🐾</text>
      <text x="0" y="55" text-anchor="middle" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-weight="800" font-size="34" fill="#8B5E3C">Golden Retriever Puppy</text>
    </g>

    <!-- Personality & Bio Badges -->
    <g transform="translate(540, 1140)">
      <rect x="-380" y="0" width="240" height="52" rx="26" fill="#FFFFFF" stroke="#E8DDD3" stroke-width="2" filter="url(#stickerShadow)" />
      <text x="-260" y="34" text-anchor="middle" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-weight="800" font-size="20" fill="#2C211B">🎾 Ball Fetcher</text>

      <rect x="-120" y="0" width="240" height="52" rx="26" fill="#FFFFFF" stroke="#E8DDD3" stroke-width="2" filter="url(#stickerShadow)" />
      <text x="0" y="34" text-anchor="middle" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-weight="800" font-size="20" fill="#2C211B">🦴 Peanut Butter</text>

      <rect x="140" y="0" width="240" height="52" rx="26" fill="#FFFFFF" stroke="#E8DDD3" stroke-width="2" filter="url(#stickerShadow)" />
      <text x="260" y="34" text-anchor="middle" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-weight="800" font-size="20" fill="#2C211B">💤 Cuddle Bug</text>
    </g>

    <!-- Interactive Story Tap Card with QR -->
    <g transform="translate(100, 1260)" filter="url(#stickerShadow)">
      <rect x="0" y="0" width="880" height="380" rx="44" fill="#FFFFFF" stroke="#F59E0B" stroke-width="3" />
      <rect x="12" y="12" width="856" height="60" rx="32" fill="#FEF3C7" />
      <text x="440" y="50" text-anchor="middle" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-weight="900" font-size="22" letter-spacing="1" fill="#92400E">🐾 SCAN OR USE INSTAGRAM LINK STICKER</text>

      <g transform="translate(50, 95)">
        <image href="${qrDataUri}" x="0" y="0" width="250" height="250" />
      </g>

      <g transform="translate(330, 130)">
        <text x="0" y="0" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-weight="900" font-size="34" fill="#2C211B">Milo's Smart Pet Card</text>
        <text x="0" y="40" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-weight="600" font-size="22" fill="#766A63">Tap to see vaccine records,</text>
        <text x="0" y="70" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-weight="600" font-size="22" fill="#766A63">training badges &amp; contact info.</text>

        <rect x="0" y="105" width="480" height="64" rx="20" fill="#8B5E3C" />
        <text x="240" y="146" text-anchor="middle" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-weight="900" font-size="22" fill="#FFF9F2">Open Verified Passport →</text>
      </g>
    </g>

    <!-- Bottom Footer -->
    <g transform="translate(540, 1780)">
      <text x="0" y="0" text-anchor="middle" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-weight="900" font-size="30" fill="#2C211B">PupLume.pet</text>
      <text x="0" y="32" text-anchor="middle" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-weight="700" font-size="18" fill="#8B5E3C">Get the app on iOS &amp; Android</text>
    </g>
  </svg>
  `;

  // -------------------------------------------------------------
  // Variant C: Minimalist Swiss Luxury (Editorial Clean)
  // -------------------------------------------------------------
  const variantCSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1920" width="1080" height="1920">
    <defs>
      <filter id="cleanShadow" x="-5%" y="-5%" width="110%" height="110%">
        <feDropShadow dx="0" dy="8" stdDeviation="18" flood-color="#2C211B" flood-opacity="0.08" />
      </filter>
      <clipPath id="swissPhotoClip">
        <rect x="100" y="260" width="880" height="720" rx="28" />
      </clipPath>
    </defs>

    <rect width="1080" height="1920" fill="#FBF8F4" />

    <!-- Subtle Technical Grid Lines -->
    <line x1="100" y1="180" x2="980" y2="180" stroke="#E8DDD3" stroke-width="1.5" />
    <line x1="100" y1="1030" x2="980" y2="1030" stroke="#E8DDD3" stroke-width="1.5" />
    <line x1="100" y1="1680" x2="980" y2="1680" stroke="#E8DDD3" stroke-width="1.5" />

    <!-- Top Grid Header -->
    <g transform="translate(100, 130)">
      <text x="0" y="0" font-family="monospace" font-weight="900" font-size="28" fill="#2C211B">PUPLUME // DIGITAL REGISTRY</text>
      <text x="880" y="0" text-anchor="end" font-family="monospace" font-weight="700" font-size="22" fill="#8B5E3C">SERIES 2026.4</text>
    </g>

    <!-- Photo Container -->
    <g clip-path="url(#swissPhotoClip)">
      <rect x="100" y="260" width="880" height="720" fill="#EADCCF" />
      <circle cx="540" cy="620" r="230" fill="#DFCEBE" />
      <ellipse cx="400" cy="580" rx="60" ry="110" fill="#C5B19E" transform="rotate(-15 400 580)" />
      <ellipse cx="680" cy="580" rx="60" ry="110" fill="#C5B19E" transform="rotate(15 680 580)" />
      <ellipse cx="540" cy="670" rx="70" ry="50" fill="#F4EAE0" />
      <ellipse cx="540" cy="655" rx="28" ry="18" fill="#2C211B" />
      <circle cx="475" cy="575" r="14" fill="#2C211B" />
      <circle cx="605" cy="575" r="14" fill="#2C211B" />
    </g>

    <!-- Official Badge -->
    <g transform="translate(140, 300)">
      <rect x="0" y="0" width="260" height="42" rx="8" fill="#2C211B" />
      <text x="130" y="27" text-anchor="middle" font-family="monospace" font-weight="800" font-size="16" letter-spacing="1.5" fill="#FFF9F2">GOVERNMENT VERIFIED ID</text>
    </g>

    <!-- Data Specification Grid Table -->
    <g transform="translate(100, 1070)">
      <!-- Name -->
      <text x="0" y="40" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-weight="900" font-size="64" fill="#2C211B">MILO</text>
      <text x="880" y="40" text-anchor="end" font-family="monospace" font-weight="800" font-size="28" fill="#059669">● ACTIVE ON COLLAR</text>

      <line x1="0" y1="70" x2="880" y2="70" stroke="#E8DDD3" stroke-width="1.5" />

      <!-- Row 1 -->
      <g transform="translate(0, 120)">
        <text x="0" y="0" font-family="monospace" font-weight="700" font-size="18" fill="#766A63">BREED</text>
        <text x="0" y="32" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-weight="800" font-size="28" fill="#2C211B">Golden Retriever</text>

        <text x="350" y="0" font-family="monospace" font-weight="700" font-size="18" fill="#766A63">SEX / WEIGHT</text>
        <text x="350" y="32" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-weight="800" font-size="28" fill="#2C211B">Male / 18.2 lbs</text>

        <text x="650" y="0" font-family="monospace" font-weight="700" font-size="18" fill="#766A63">AGE</text>
        <text x="650" y="32" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-weight="800" font-size="28" fill="#2C211B">4 Months</text>
      </g>

      <line x1="0" y1="180" x2="880" y2="180" stroke="#E8DDD3" stroke-width="1.5" />

      <!-- Row 2 -->
      <g transform="translate(0, 230)">
        <text x="0" y="0" font-family="monospace" font-weight="700" font-size="18" fill="#766A63">MICROCHIP RFID</text>
        <text x="0" y="32" font-family="monospace" font-weight="900" font-size="26" fill="#2C211B">985-141-002348-A</text>

        <text x="350" y="0" font-family="monospace" font-weight="700" font-size="18" fill="#766A63">VET CLINIC</text>
        <text x="350" y="32" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-weight="800" font-size="28" fill="#2C211B">Mission Pet Hospital</text>

        <text x="650" y="0" font-family="monospace" font-weight="700" font-size="18" fill="#766A63">VACCINES</text>
        <text x="650" y="32" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-weight="800" font-size="28" fill="#059669">Verified ✓</text>
      </g>
    </g>

    <!-- Scan Card -->
    <g transform="translate(100, 1370)" filter="url(#cleanShadow)">
      <rect x="0" y="0" width="880" height="270" rx="20" fill="#FFFFFF" stroke="#2C211B" stroke-width="3" />
      <g transform="translate(35, 35)">
        <image href="${qrDataUri}" x="0" y="0" width="200" height="200" />
      </g>
      <g transform="translate(280, 75)">
        <text x="0" y="0" font-family="monospace" font-weight="800" font-size="18" letter-spacing="1.5" fill="#8B5E3C">INSTANT SCAN ACCESS</text>
        <text x="0" y="36" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-weight="900" font-size="32" fill="#2C211B">Scan To View Pet Passport</text>
        <text x="0" y="72" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-weight="600" font-size="20" fill="#766A63">Instant reunification info &amp; medical records.</text>
      </g>
    </g>

    <!-- Footer -->
    <g transform="translate(100, 1750)">
      <text x="0" y="0" font-family="monospace" font-weight="700" font-size="20" fill="#766A63">WWW.PUPLUME.PET</text>
      <text x="880" y="0" text-anchor="end" font-family="monospace" font-weight="700" font-size="20" fill="#766A63">DESIGNED WITH DISCIPLINE</text>
    </g>
  </svg>
  `;

  // Write SVGs to public and artifacts
  fs.writeFileSync(path.join(PUBLIC_DIR, 'instagram-story-variant-a.svg'), variantASvg, 'utf-8');
  fs.writeFileSync(path.join(PUBLIC_DIR, 'instagram-story-variant-b.svg'), variantBSvg, 'utf-8');
  fs.writeFileSync(path.join(PUBLIC_DIR, 'instagram-story-variant-c.svg'), variantCSvg, 'utf-8');

  fs.writeFileSync(path.join(ARTIFACT_DIR, 'instagram-story-variant-a.svg'), variantASvg, 'utf-8');
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'instagram-story-variant-b.svg'), variantBSvg, 'utf-8');
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'instagram-story-variant-c.svg'), variantCSvg, 'utf-8');

  // Convert SVGs to high-res PNGs with Resvg
  console.log('Rendering 1080x1920 PNGs...');
  const renderPng = (svgStr: string, outFileName: string) => {
    const resvg = new Resvg(svgStr, {
      fitTo: { mode: 'width', value: 1080 }
    });
    const pngData = resvg.render();
    const pngBuffer = pngData.asPng();

    fs.writeFileSync(path.join(PUBLIC_DIR, outFileName), pngBuffer);
    fs.writeFileSync(path.join(ARTIFACT_DIR, outFileName), pngBuffer);
    console.log(`Saved ${outFileName} (${(pngBuffer.length / 1024).toFixed(1)} KB)`);
  };

  renderPng(variantASvg, 'instagram-story-variant-a.png');
  renderPng(variantBSvg, 'instagram-story-variant-b.png');
  renderPng(variantCSvg, 'instagram-story-variant-c.png');

  console.log('All 3 design variants rendered successfully!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
