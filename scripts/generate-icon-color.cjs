const { Resvg } = require('@resvg/resvg-js');
const fs = require('fs');
const path = require('path');

const publicDir = path.resolve(__dirname, '../public');

// 540x540 Transparent Canvas - Google Antigravity style rich bottom sheet hero graphic
const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 540 540" width="540" height="540">
  <defs>
    <!-- PupLume Signature Bronze Fur Gradient -->
    <linearGradient id="pupGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#A27046"/>
      <stop offset="45%" stop-color="#8B5E3C"/>
      <stop offset="100%" stop-color="#6F4321"/>
    </linearGradient>

    <!-- Glowing Lume Star Gradient -->
    <linearGradient id="lumeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FEF08A"/>
      <stop offset="40%" stop-color="#F59E0B"/>
      <stop offset="100%" stop-color="#D97706"/>
    </linearGradient>

    <!-- Star Glow Filter -->
    <filter id="starGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="10" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>

    <!-- Ambient Depth Shadow -->
    <filter id="depthShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="16" stdDeviation="18" flood-color="#1B130E" flood-opacity="0.22"/>
    </filter>
  </defs>

  <!-- Centered Mascot Emblem (Transparent Background) -->
  <g transform="translate(10.4, 19.25) scale(1.18)" filter="url(#depthShadow)">
    <!-- Puppy Head Silhouette -->
    <path
      d="M 220 80 C 130 80 70 140 70 240 C 70 330 140 380 220 380 C 300 380 370 330 370 240 C 370 140 310 80 220 80 Z"
      fill="url(#pupGrad)"
    />

    <!-- Floppy Left Ear (Rich Chocolate) -->
    <path
      d="M 120 120 C 60 140 30 210 40 290 C 45 320 70 340 95 325 C 115 310 135 250 140 200 Z"
      fill="#5F3E29"
    />

    <!-- Floppy Right Ear (Rich Chocolate) -->
    <path
      d="M 320 120 C 380 140 410 210 400 290 C 395 320 370 340 345 325 C 325 310 305 250 300 200 Z"
      fill="#5F3E29"
    />

    <!-- Snout (Warm Cream) -->
    <ellipse cx="220" cy="275" rx="85" ry="70" fill="#FFF9F2" />

    <!-- Cute Dog Nose -->
    <path
      d="M 195 240 C 195 230 245 230 245 240 C 245 258 228 272 220 272 C 212 272 195 258 195 240 Z"
      fill="#2C211B"
    />
    <!-- Nose Highlight -->
    <ellipse cx="212" cy="238" rx="6" ry="3" fill="#FFFFFF" opacity="0.6" />

    <!-- Left Eye & Sparkle -->
    <circle cx="165" cy="205" r="14" fill="#2C211B" />
    <circle cx="161" cy="201" r="5" fill="#FFFFFF" />

    <!-- Right Eye & Sparkle -->
    <circle cx="275" cy="205" r="14" fill="#2C211B" />
    <circle cx="271" cy="201" r="5" fill="#FFFFFF" />

    <!-- Radiant Glowing Lume Star -->
    <g transform="translate(295, 45)" filter="url(#starGlow)">
      <path
        d="M 40 0 C 40 22 58 40 80 40 C 58 40 40 58 40 80 C 40 58 22 40 0 40 C 22 40 40 22 40 0 Z"
        fill="url(#lumeGrad)"
      />
      <circle cx="40" cy="40" r="10" fill="#FFF9F2" />
    </g>
  </g>
</svg>
`;

const resvg = new Resvg(svg, {
  fitTo: { mode: 'width', value: 540 }
});
const pngData = resvg.render().asPng();

fs.writeFileSync(path.join(publicDir, 'icon-color.png'), pngData);
console.log('Successfully generated public/icon-color.png (size: ' + pngData.length + ' bytes)');
