import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Resvg } from '@resvg/resvg-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.resolve(__dirname, '../public');

// 1. Transparent PupLume Logo SVG (NO background squircle, completely transparent)
const transparentSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
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
    <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>

  <!-- Transparent base: No background rect, pure PupLume mascot -->
  <g transform="translate(36, 44)">
    <!-- Head Base (Bronze/Brown Puppy Fur) -->
    <path d="M 220 80 C 130 80 70 140 70 240 C 70 330 140 380 220 380 C 300 380 370 330 370 240 C 370 140 310 80 220 80 Z" fill="url(#pupGrad)"/>

    <!-- Left Ear (floppy soft dark brown) -->
    <path d="M 120 120 C 60 140 30 210 40 290 C 45 320 70 340 95 325 C 115 310 135 250 140 200 Z" fill="#5F3E29"/>

    <!-- Right Ear (floppy soft dark brown) -->
    <path d="M 320 120 C 380 140 410 210 400 290 C 395 320 370 340 345 325 C 325 310 305 250 300 200 Z" fill="#5F3E29"/>

    <!-- Muzzle / Snout Cream Area -->
    <ellipse cx="220" cy="275" rx="85" ry="70" fill="#FFF9F2"/>

    <!-- Cute Dog Nose -->
    <path d="M 195 240 C 195 230 245 230 245 240 C 245 258 228 272 220 272 C 212 272 195 258 195 240 Z" fill="#2C211B"/>
    <!-- Nose highlight -->
    <ellipse cx="212" cy="238" rx="6" ry="3" fill="#FFFFFF" opacity="0.6"/>

    <!-- Mouth lines -->
    <path d="M 220 272 L 220 286" stroke="#2C211B" stroke-width="4" stroke-linecap="round"/>
    <path d="M 200 286 C 210 294 220 294 220 286 C 220 294 230 294 240 286" fill="none" stroke="#2C211B" stroke-width="4" stroke-linecap="round"/>

    <!-- Left Eye -->
    <circle cx="165" cy="205" r="14" fill="#2C211B"/>
    <circle cx="161" cy="201" r="5" fill="#FFFFFF"/>
    <!-- Right Eye -->
    <circle cx="275" cy="205" r="14" fill="#2C211B"/>
    <circle cx="271" cy="201" r="5" fill="#FFFFFF"/>

    <!-- Eyebrows / Expression markings -->
    <ellipse cx="160" cy="180" rx="14" ry="7" fill="#F3E7DA" opacity="0.9"/>
    <ellipse cx="280" cy="180" rx="14" ry="7" fill="#F3E7DA" opacity="0.9"/>

    <!-- Glowing Lume Star (PupLume Signature Sparkle) -->
    <g transform="translate(290, 45)" filter="url(#softGlow)">
      <path d="M 40 0 C 40 22 58 40 80 40 C 58 40 40 58 40 80 C 40 58 22 40 0 40 C 22 40 40 22 40 0 Z" fill="url(#lumeGrad)"/>
      <circle cx="40" cy="40" r="10" fill="#FFF9F2"/>
    </g>
  </g>
</svg>`;

// 2. Maskable Icon with Full-Bleed PupLume Bronze & Brown Theme
const maskableSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="mBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#8B5E3C"/>
      <stop offset="100%" stop-color="#5F3E29"/>
    </linearGradient>
    <linearGradient id="mPupGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFF9F2"/>
      <stop offset="100%" stop-color="#F3E7DA"/>
    </linearGradient>
    <linearGradient id="mLumeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FDE68A"/>
      <stop offset="50%" stop-color="#F59E0B"/>
      <stop offset="100%" stop-color="#D97706"/>
    </linearGradient>
  </defs>

  <!-- Full-bleed background for maskable safe margin in PupLume Bronze -->
  <rect width="512" height="512" fill="url(#mBgGrad)"/>

  <!-- Centered scaled artwork within the safe zone (80% circle) -->
  <g transform="translate(64, 64) scale(0.75)">
    <g transform="translate(36, 44)">
      <!-- Head Base -->
      <path d="M 220 80 C 130 80 70 140 70 240 C 70 330 140 380 220 380 C 300 380 370 330 370 240 C 370 140 310 80 220 80 Z" fill="url(#mPupGrad)"/>

      <!-- Left Ear -->
      <path d="M 120 120 C 60 140 30 210 40 290 C 45 320 70 340 95 325 C 115 310 135 250 140 200 Z" fill="#E8DDD3"/>

      <!-- Right Ear -->
      <path d="M 320 120 C 380 140 410 210 400 290 C 395 320 370 340 345 325 C 325 310 305 250 300 200 Z" fill="#E8DDD3"/>

      <!-- Muzzle / Snout -->
      <ellipse cx="220" cy="275" rx="85" ry="70" fill="#FFFFFF"/>

      <!-- Cute Dog Nose -->
      <path d="M 195 240 C 195 230 245 230 245 240 C 245 258 228 272 220 272 C 212 272 195 258 195 240 Z" fill="#2C211B"/>
      <ellipse cx="212" cy="238" rx="6" ry="3" fill="#FFFFFF" opacity="0.6"/>

      <!-- Mouth lines -->
      <path d="M 220 272 L 220 286" stroke="#2C211B" stroke-width="4" stroke-linecap="round"/>
      <path d="M 200 286 C 210 294 220 294 220 286 C 220 294 230 294 240 286" fill="none" stroke="#2C211B" stroke-width="4" stroke-linecap="round"/>

      <!-- Eyes -->
      <circle cx="165" cy="205" r="14" fill="#2C211B"/>
      <circle cx="161" cy="201" r="5" fill="#FFFFFF"/>
      <circle cx="275" cy="205" r="14" fill="#2C211B"/>
      <circle cx="271" cy="201" r="5" fill="#FFFFFF"/>

      <!-- Eyebrows -->
      <ellipse cx="160" cy="180" rx="14" ry="7" fill="#8B5E3C" opacity="0.4"/>
      <ellipse cx="280" cy="180" rx="14" ry="7" fill="#8B5E3C" opacity="0.4"/>

      <!-- Lume Sparkle Star -->
      <g transform="translate(290, 45)">
        <path d="M 40 0 C 40 22 58 40 80 40 C 58 40 40 58 40 80 C 40 58 22 40 0 40 C 22 40 40 22 40 0 Z" fill="url(#mLumeGrad)"/>
        <circle cx="40" cy="40" r="10" fill="#FFFFFF"/>
      </g>
    </g>
  </g>
</svg>`;

fs.writeFileSync(path.join(publicDir, 'icon.svg'), transparentSvg);
fs.writeFileSync(path.join(publicDir, 'puplume-icon-512.svg'), transparentSvg);
fs.writeFileSync(path.join(publicDir, 'puplume-maskable-512.svg'), maskableSvg);

function renderSvgToPng(svgStr, width, height) {
  const resvg = new Resvg(svgStr, {
    fitTo: {
      mode: 'width',
      value: width,
    },
  });
  const pngData = resvg.render();
  return pngData.asPng();
}

console.log('Rendering transparent PupLume icons without background...');

// 1. Standard 512x512 Transparent
const png512 = renderSvgToPng(transparentSvg, 512, 512);
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), png512);
fs.writeFileSync(path.join(publicDir, 'icon-512.png'), png512);

// 2. Standard 192x192 Transparent
const png192 = renderSvgToPng(transparentSvg, 192, 192);
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), png192);
fs.writeFileSync(path.join(publicDir, 'icon-192.png'), png192);

// 3. Apple Touch Icon 180x180
const pngApple = renderSvgToPng(transparentSvg, 180, 180);
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), pngApple);

// 4. Maskable 512x512 (Full-bleed Bronze theme)
const pngMaskable512 = renderSvgToPng(maskableSvg, 512, 512);
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), pngMaskable512);

// 5. Favicon 32x32 Transparent
const favicon32 = renderSvgToPng(transparentSvg, 32, 32);
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), favicon32);
fs.writeFileSync(path.join(publicDir, 'favicon.png'), favicon32);

console.log('Successfully generated all transparent PWA icons with PupLume theme!');
