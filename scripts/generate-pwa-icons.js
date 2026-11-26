import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Resvg } from '@resvg/resvg-js';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.resolve(__dirname, '../public');

// Shared PupLume mascot artwork centered in a 512x512 coordinate space
const mascotInnerMarkup = `
  <g transform="translate(36, 44)">
    <!-- Head Base (Warm PupLume Bronze Fur) -->
    <path d="M 220 80 C 130 80 70 140 70 240 C 70 330 140 380 220 380 C 300 380 370 330 370 240 C 370 140 310 80 220 80 Z" fill="url(#pupGrad)"/>

    <!-- Left Ear (Floppy Chocolate Brown) -->
    <path d="M 120 120 C 60 140 30 210 40 290 C 45 320 70 340 95 325 C 115 310 135 250 140 200 Z" fill="#5F3E29"/>

    <!-- Right Ear (Floppy Chocolate Brown) -->
    <path d="M 320 120 C 380 140 410 210 400 290 C 395 320 370 340 345 325 C 325 310 305 250 300 200 Z" fill="#5F3E29"/>

    <!-- Muzzle / Snout Cream Area -->
    <ellipse cx="220" cy="275" rx="85" ry="70" fill="#FFF9F2"/>

    <!-- Cute Dog Nose -->
    <path d="M 195 240 C 195 230 245 230 245 240 C 245 258 228 272 220 272 C 212 272 195 258 195 240 Z" fill="#2C211B"/>
    <!-- Nose Highlight -->
    <ellipse cx="212" cy="238" rx="6" ry="3" fill="#FFFFFF" opacity="0.6"/>

    <!-- Mouth Lines -->
    <path d="M 220 272 L 220 286" stroke="#2C211B" stroke-width="4" stroke-linecap="round"/>
    <path d="M 200 286 C 210 294 220 294 220 286 C 220 294 230 294 240 286" fill="none" stroke="#2C211B" stroke-width="4" stroke-linecap="round"/>

    <!-- Left Eye -->
    <circle cx="165" cy="205" r="14" fill="#2C211B"/>
    <circle cx="161" cy="201" r="5" fill="#FFFFFF"/>
    <!-- Right Eye -->
    <circle cx="275" cy="205" r="14" fill="#2C211B"/>
    <circle cx="271" cy="201" r="5" fill="#FFFFFF"/>

    <!-- Eyebrows / Expression Markings -->
    <ellipse cx="160" cy="180" rx="14" ry="7" fill="#F3E7DA" opacity="0.9"/>
    <ellipse cx="280" cy="180" rx="14" ry="7" fill="#F3E7DA" opacity="0.9"/>

    <!-- Glowing Lume Star (PupLume Signature Sparkle) -->
    <g transform="translate(290, 45)" filter="url(#softGlow)">
      <path d="M 40 0 C 40 22 58 40 80 40 C 58 40 40 58 40 80 C 40 58 22 40 0 40 C 22 40 40 22 40 0 Z" fill="url(#lumeGrad)"/>
      <circle cx="40" cy="40" r="10" fill="#FFF9F2"/>
    </g>
  </g>
`;

const sharedDefs = `
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFF9F2"/>
      <stop offset="100%" stop-color="#F3E7DA"/>
    </linearGradient>
    <linearGradient id="pupGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#A27046"/>
      <stop offset="50%" stop-color="#8B5E3C"/>
      <stop offset="100%" stop-color="#734927"/>
    </linearGradient>
    <linearGradient id="lumeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FDE68A"/>
      <stop offset="45%" stop-color="#F59E0B"/>
      <stop offset="100%" stop-color="#D97706"/>
    </linearGradient>
    <filter id="softGlow" x="-25%" y="-25%" width="150%" height="150%">
      <feGaussianBlur stdDeviation="8" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>
`;

// 1. Standard App Icon SVG (Warm Cream Squircle + Authentic Brown PupLume Mascot)
const standardSquircleSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
${sharedDefs}
  <!-- Warm Cream Squircle App Tile -->
  <rect width="512" height="512" rx="124" fill="url(#bgGrad)"/>
  <rect width="504" height="504" x="4" y="4" rx="120" fill="none" stroke="#E8DDD3" stroke-width="6"/>
${mascotInnerMarkup}
</svg>`;

// 2. Maskable Icon SVG (Full-Bleed Opaque Warm Cream + Mascot inside W3C 80% Safe Zone)
const maskableSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
${sharedDefs}
  <!-- Full-bleed opaque background so Android/OS adaptive masks crop cleanly -->
  <rect width="512" height="512" fill="url(#bgGrad)"/>
  <!-- Centered scaled artwork within the 80% safe circle -->
  <g transform="translate(64, 64) scale(0.75)">
${mascotInnerMarkup}
  </g>
</svg>`;

// 3. Apple Touch Icon SVG (Full-Bleed Opaque Warm Cream — iOS applies squircle mask & forbids alpha)
const appleTouchSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
${sharedDefs}
  <rect width="512" height="512" fill="url(#bgGrad)"/>
  <g transform="translate(30.72, 30.72) scale(0.88)">
${mascotInnerMarkup}
  </g>
</svg>`;

// 4. Compact 192px SVG variant for puplume-icon-192.svg
const icon192Svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="192" height="192">
${sharedDefs}
  <rect width="512" height="512" rx="124" fill="url(#bgGrad)"/>
  <rect width="504" height="504" x="4" y="4" rx="120" fill="none" stroke="#E8DDD3" stroke-width="6"/>
${mascotInnerMarkup}
</svg>`;

function renderSvgToPngBuffer(svgStr, width) {
  const resvg = new Resvg(svgStr, {
    fitTo: {
      mode: 'width',
      value: width,
    },
  });
  return resvg.render().asPng();
}

/**
 * Wraps PNG buffers into a valid multi-resolution Windows/Browser .ico file.
 */
function buildIcoFromPngs(entries) {
  const count = entries.length;
  const headerSize = 6;
  const dirEntrySize = 16;
  let offset = headerSize + count * dirEntrySize;

  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0); // Reserved
  header.writeUInt16LE(1, 2); // Type: 1 = ICO
  header.writeUInt16LE(count, 4);

  const dirBuffers = [];
  const dataBuffers = [];

  for (const { size, buffer } of entries) {
    const dir = Buffer.alloc(dirEntrySize);
    dir.writeUInt8(size >= 256 ? 0 : size, 0); // Width
    dir.writeUInt8(size >= 256 ? 0 : size, 1); // Height
    dir.writeUInt8(0, 2); // Color palette
    dir.writeUInt8(0, 3); // Reserved
    dir.writeUInt16LE(1, 4); // Color planes
    dir.writeUInt16LE(32, 6); // Bits per pixel
    dir.writeUInt32LE(buffer.length, 8); // Image size
    dir.writeUInt32LE(offset, 12); // Offset
    dirBuffers.push(dir);
    dataBuffers.push(buffer);
    offset += buffer.length;
  }

  return Buffer.concat([header, ...dirBuffers, ...dataBuffers]);
}

async function main() {
  console.log('Generating authentic PupLume PWA & browser icons...');

  // Write SVG sources
  fs.writeFileSync(path.join(publicDir, 'icon.svg'), standardSquircleSvg);
  fs.writeFileSync(path.join(publicDir, 'puplume-icon-512.svg'), standardSquircleSvg);
  fs.writeFileSync(path.join(publicDir, 'puplume-icon-192.svg'), icon192Svg);
  fs.writeFileSync(path.join(publicDir, 'puplume-maskable-512.svg'), maskableSvg);

  // 1. Standard 512x512
  const png512 = renderSvgToPngBuffer(standardSquircleSvg, 512);
  fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), png512);
  fs.writeFileSync(path.join(publicDir, 'icon-512.png'), png512);

  // 2. Standard 192x192
  const png192 = renderSvgToPngBuffer(standardSquircleSvg, 192);
  fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), png192);
  fs.writeFileSync(path.join(publicDir, 'icon-192.png'), png192);

  // 3. Maskable 512x512 & 192x192 (Opaque full-bleed warm cream + centered brown mascot)
  const rawMaskable512 = renderSvgToPngBuffer(maskableSvg, 512);
  const opaqueMaskable512 = await sharp(rawMaskable512).flatten({ background: '#FFF9F2' }).png().toBuffer();
  fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), opaqueMaskable512);

  const rawMaskable192 = renderSvgToPngBuffer(maskableSvg, 192);
  const opaqueMaskable192 = await sharp(rawMaskable192).flatten({ background: '#FFF9F2' }).png().toBuffer();
  fs.writeFileSync(path.join(publicDir, 'pwa-maskable-192x192.png'), opaqueMaskable192);

  // 4. Apple Touch Icon 180x180 (Opaque full-bleed warm cream — zero alpha so iOS never adds black box)
  const rawApple = renderSvgToPngBuffer(appleTouchSvg, 180);
  const opaqueApple = await sharp(rawApple).flatten({ background: '#FFF9F2' }).png().toBuffer();
  fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), opaqueApple);

  // 5. Crisp Favicons (64x64 PNG + multi-size valid ICO)
  const favicon16 = renderSvgToPngBuffer(standardSquircleSvg, 16);
  const favicon32 = renderSvgToPngBuffer(standardSquircleSvg, 32);
  const favicon48 = renderSvgToPngBuffer(standardSquircleSvg, 48);
  const favicon64 = renderSvgToPngBuffer(standardSquircleSvg, 64);

  fs.writeFileSync(path.join(publicDir, 'favicon.png'), favicon64);
  fs.writeFileSync(
    path.join(publicDir, 'favicon.ico'),
    buildIcoFromPngs([
      { size: 16, buffer: favicon16 },
      { size: 32, buffer: favicon32 },
      { size: 48, buffer: favicon48 },
    ])
  );

  console.log('Successfully generated all authentic PupLume PWA icons!');
}

main().catch((err) => {
  console.error('Icon generation failed:', err);
  process.exit(1);
});
