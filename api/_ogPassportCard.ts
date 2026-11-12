import fs from 'fs';
import path from 'path';
import QRCode from 'qrcode';
import { Resvg } from '@resvg/resvg-js';
import sharp from 'sharp';

export interface PassportCardOptions {
  name: string;
  breed?: string;
  weightLbs?: number;
  birthDate?: string;
  ageWeeks?: number;
  photoUrl?: string;
  microchipNumber?: string;
  temperament?: string;
  isLost?: boolean;
  rewardAmount?: string;
  slug: string;
  host?: string;
}

// Clean PupLume Mascot Vector (Scale = 0.12 for header)
function renderMascot(scale = 0.12): string {
  return `
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
}

function escapeXml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function calculateAgeText(birthDate?: string, ageWeeks?: number): string {
  if (ageWeeks && ageWeeks > 0) {
    if (ageWeeks < 16) return `${ageWeeks} Weeks Old`;
    const months = Math.round(ageWeeks / 4.345);
    if (months < 12) return `${months} Months Old`;
    const years = (months / 12).toFixed(1).replace('.0', '');
    return `${years} Years Old`;
  }
  if (birthDate) {
    const bDate = new Date(birthDate);
    if (!isNaN(bDate.getTime())) {
      const diffMs = Date.now() - bDate.getTime();
      const diffWeeks = Math.max(1, Math.floor(diffMs / (1000 * 60 * 60 * 24 * 7)));
      if (diffWeeks < 16) return `${diffWeeks} Weeks Old`;
      const months = Math.round(diffWeeks / 4.345);
      if (months < 12) return `${months} Months Old`;
      const years = (months / 12).toFixed(1).replace('.0', '');
      return `${years} Years Old`;
    }
  }
  return '6 Months Old';
}

/**
 * Resolves pet image to base64 Data URI with local fallbacks
 */
async function resolvePhotoDataUri(photoUrl?: string, petName?: string): Promise<string> {
  const cwd = process.cwd();

  // 1. Try remote fetch if valid URL provided
  if (photoUrl && photoUrl.startsWith('http')) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(photoUrl, { signal: controller.signal });
      clearTimeout(timeout);

      if (res.ok) {
        const contentType = res.headers.get('content-type') || 'image/jpeg';
        const buffer = await res.arrayBuffer();
        const b64 = Buffer.from(buffer).toString('base64');
        return `data:${contentType};base64,${b64}`;
      }
    } catch (err) {
      console.warn('[ogPassportCard] Failed to fetch remote photo, using local fallback:', err);
    }
  }

  // 2. Check local fallback images in public/
  const possibleLocalFiles = [
    path.join(cwd, 'public', 'warm-dog-test.png'),
    path.join(cwd, 'public', 'og-graxzo.png'),
    path.join(cwd, 'public', 'og-pup-preview.png'),
  ];

  for (const file of possibleLocalFiles) {
    if (fs.existsSync(file)) {
      try {
        const buf = fs.readFileSync(file);
        return `data:image/png;base64,${buf.toString('base64')}`;
      } catch {}
    }
  }

  // 3. Fallback placeholder puppy portrait SVG
  const nameInitial = (petName || 'P').charAt(0).toUpperCase();
  const fallbackSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="390" height="434" viewBox="0 0 390 434">
      <defs>
        <linearGradient id="avatarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#EAD9C9"/>
          <stop offset="100%" stop-color="#CBB5A1"/>
        </linearGradient>
      </defs>
      <rect width="390" height="434" fill="url(#avatarGrad)"/>
      <circle cx="195" cy="180" r="80" fill="#8B5E3C" opacity="0.3"/>
      <text x="195" y="210" font-family="Outfit" font-size="80" font-weight="900" fill="#FFFFFF" text-anchor="middle">${nameInitial}</text>
      <text x="195" y="300" font-family="Outfit" font-size="20" font-weight="700" fill="#5F3E29" text-anchor="middle">PupLume Pet</text>
    </svg>
  `;
  return `data:image/svg+xml;utf8,${encodeURIComponent(fallbackSvg)}`;
}

/**
 * Generates the full 1200 x 630 SVG document for the puppy passport card
 */
export async function generatePassportCardSvg(options: PassportCardOptions): Promise<string> {
  const {
    name,
    breed = 'Friendly Canine',
    weightLbs = 12,
    birthDate,
    ageWeeks,
    photoUrl,
    microchipNumber,
    temperament = 'Playful, affectionate & loyal',
    isLost = false,
    rewardAmount,
    slug,
    host = 'puplumepet.vercel.app',
  } = options;

  const cleanName = name || 'Puppy';
  const cleanSlug = slug.toLowerCase().trim();
  const publicUrl = `https://${host}/${encodeURIComponent(cleanSlug)}`;
  const displayHost = host.replace(/^https?:\/\//, '');

  const [photoDataUri, qrDataUri] = await Promise.all([
    resolvePhotoDataUri(photoUrl, cleanName),
    QRCode.toDataURL(publicUrl, {
      margin: 1,
      width: 180,
      color: {
        dark: '#1C140E',
        light: '#FFFFFF',
      },
    }).catch(() => ''),
  ]);

  const ageText = calculateAgeText(birthDate, ageWeeks);
  const passportNumber = `PL-985-${cleanSlug.toUpperCase()}-2026`;
  const chipId = microchipNumber || `985-${cleanSlug.toUpperCase()}-PUP`;

  // Status highlights
  let pill1Bg = '#F0FDF4';
  let pill1Border = '#DCFCE7';
  let pill1Dot = '#16A34A';
  let pill1Text = '#15803D';
  let pill1Label = 'Active Collar Tag';

  let pill2Bg = '#FEF3C7';
  let pill2Border = '#FDE68A';
  let pill2Dot = '#D97706';
  let pill2Text = '#B45309';
  let pill2Label = 'Fully Vaccinated';

  let pill3Bg = '#F0F9FF';
  let pill3Border = '#E0F2FE';
  let pill3Dot = '#0284C7';
  let pill3Text = '#0369A1';
  let pill3Label = 'Emergency Ready';

  if (isLost) {
    pill1Bg = '#FEF2F2';
    pill1Border = '#FECACA';
    pill1Dot = '#DC2626';
    pill1Text = '#B91C1C';
    pill1Label = '🚨 REPORTED MISSING';

    pill2Bg = '#FFFBEB';
    pill2Border = '#FDE68A';
    pill2Dot = '#D97706';
    pill2Text = '#B45309';
    pill2Label = rewardAmount ? `Reward: $${rewardAmount}` : 'Reward Offered';

    pill3Bg = '#FEF2F2';
    pill3Border = '#FECACA';
    pill3Dot = '#DC2626';
    pill3Text = '#991B1B';
    pill3Label = 'Scan Immediately';
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
    <defs>
      <linearGradient id="canvasGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FBF9F6"/>
        <stop offset="50%" stop-color="#F5EFE8"/>
        <stop offset="100%" stop-color="#EAE2D6"/>
      </linearGradient>

      <radialGradient id="peachGlow" cx="20%" cy="25%" r="75%">
        <stop offset="0%" stop-color="#FCDDC7" stop-opacity="0.45"/>
        <stop offset="100%" stop-color="#F5EFE8" stop-opacity="0"/>
      </radialGradient>

      <!-- Soft, luxury drop shadow for card -->
      <filter id="passDropShadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="16" stdDeviation="24" flood-color="#3A2818" flood-opacity="0.09"/>
        <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#3A2818" flood-opacity="0.04"/>
      </filter>

      <!-- Crisp squircle clipping for hero pet photo -->
      <clipPath id="ogPhotoSquircle">
        <rect width="390" height="434" rx="26"/>
      </clipPath>
    </defs>

    <!-- 1. Warm Canvas Ground -->
    <rect width="1200" height="630" fill="url(#canvasGrad)"/>
    <rect width="1200" height="630" fill="url(#peachGlow)"/>

    <!-- 2. Top Canvas Brand Header -->
    <g transform="translate(64, 26)">
      ${renderMascot(0.12)}
      <text x="54" y="27" font-family="Grandstander" font-size="28" font-weight="900" fill="#241912">
        Pup<tspan fill="#8B5E3C">Lume</tspan>
      </text>
      <text x="176" y="24" font-family="Outfit" font-size="11" font-weight="700" fill="#8C7A6D" letter-spacing="2">
        DIGITAL PET PASSPORT
      </text>
    </g>

    <!-- Top Right: Verified Smart Tag Pill -->
    <g transform="translate(1136, 26)">
      <rect x="-170" y="2" width="170" height="30" rx="15" fill="#EAE0D4"/>
      <circle cx="-152" cy="17" r="4.5" fill="#087E61"/>
      <text x="-138" y="21" font-family="Outfit" font-size="11" font-weight="800" fill="#241912" letter-spacing="1">
        VERIFIED SMART TAG
      </text>
    </g>

    <!-- 3. THE MASTER DIGITAL PASSPORT CARD (1072 x 494 px, centered at x=64, y=72) -->
    <g transform="translate(64, 72)" filter="url(#passDropShadow)">
      <!-- Card Container with subtle warm border -->
      <rect width="1072" height="494" rx="28" fill="#FFFFFF" stroke="#EDE5DC" stroke-width="1.5"/>

      <!-- LEFT: Hero Pet Photo (390 x 434 px at x=30, y=30) -->
      <g transform="translate(30, 30)">
        <g clip-path="url(#ogPhotoSquircle)">
          <rect width="390" height="434" fill="#EFE8DE"/>
          <image href="${photoDataUri}" width="390" height="434" preserveAspectRatio="xMidYMid slice"/>
        </g>
        <!-- Crisp photo inner border -->
        <rect width="390" height="434" rx="26" fill="none" stroke="#FFFFFF" stroke-width="2" opacity="0.9"/>

        <!-- Sleek Floating Verified Badge -->
        <g transform="translate(18, 368)">
          <rect width="216" height="48" rx="24" fill="#1C140E" opacity="0.92"/>
          <circle cx="24" cy="24" r="12" fill="#059669"/>
          <text x="24" y="28" font-size="13" text-anchor="middle" fill="#FFFFFF" font-family="Outfit" font-weight="900">✓</text>
          <text x="46" y="22" font-family="Outfit" font-size="11" font-weight="800" fill="#FFFFFF" letter-spacing="0.5">
            VERIFIED CANINE
          </text>
          <text x="46" y="36" font-family="Outfit" font-size="9" font-weight="700" fill="#A7F3D0" letter-spacing="1">
            PUPLUME COLLAR SECURED
          </text>
        </g>
      </g>

      <!-- RIGHT: Editorial Passport Profile (x=452 to x=1042, width=590px) -->
      <g transform="translate(452, 38)">
        
        <!-- Row 1: Micro-Header & Official ID -->
        <g>
          <text x="0" y="0" font-family="Outfit" font-size="11" font-weight="700" fill="#998778" letter-spacing="1.5">
            OFFICIAL PASSPORT
          </text>
          <text x="136" y="0" font-family="Outfit" font-size="12" font-weight="800" fill="#8B5E3C" letter-spacing="1">
            // NO. ${escapeXml(passportNumber)}
          </text>
          <!-- Tactile NFC Chip Symbol -->
          <g transform="translate(540, -10)">
            <rect width="40" height="26" rx="6" fill="#FDF6EA" stroke="#D5B895" stroke-width="1.2"/>
            <path d="M 12 13 L 28 13 M 20 6 L 20 20" stroke="#8B5E3C" stroke-width="1.2"/>
          </g>
        </g>

        <!-- Row 2: Pet Name in Grandstander Black / Architectural Outfit -->
        <g transform="translate(0, 56)">
          <text x="0" y="0" font-family="Grandstander" font-size="64" font-weight="900" fill="#1C140E" letter-spacing="-1.5">
            ${escapeXml(cleanName)}<tspan fill="#8B5E3C">.</tspan>
          </text>
          <text x="2" y="32" font-family="Outfit" font-size="20" font-weight="600" fill="#6A5A4D">
            ${escapeXml(breed)} • ${weightLbs} lbs • ${escapeXml(ageText)}
          </text>
        </g>

        <!-- Row 3: Status Highlights (High-Visibility Pills) -->
        <g transform="translate(0, 126)">
          <!-- Pill 1 -->
          <g transform="translate(0, 0)">
            <rect width="160" height="34" rx="17" fill="${pill1Bg}" stroke="${pill1Border}" stroke-width="1.2"/>
            <circle cx="17" cy="17" r="4.5" fill="${pill1Dot}"/>
            <text x="28" y="22" font-family="Outfit" font-size="12" font-weight="700" fill="${pill1Text}">
              ${escapeXml(pill1Label)}
            </text>
          </g>
          <!-- Pill 2 -->
          <g transform="translate(170, 0)">
            <rect width="150" height="34" rx="17" fill="${pill2Bg}" stroke="${pill2Border}" stroke-width="1.2"/>
            <circle cx="17" cy="17" r="4.5" fill="${pill2Dot}"/>
            <text x="28" y="22" font-family="Outfit" font-size="12" font-weight="700" fill="${pill2Text}">
              ${escapeXml(pill2Label)}
            </text>
          </g>
          <!-- Pill 3 -->
          <g transform="translate(330, 0)">
            <rect width="156" height="34" rx="17" fill="${pill3Bg}" stroke="${pill3Border}" stroke-width="1.2"/>
            <circle cx="17" cy="17" r="4.5" fill="${pill3Dot}"/>
            <text x="28" y="22" font-family="Outfit" font-size="12" font-weight="700" fill="${pill3Text}">
              ${escapeXml(pill3Label)}
            </text>
          </g>
        </g>

        <!-- Clean Divider Line -->
        <line x1="0" y1="188" x2="580" y2="188" stroke="#EFE6DC" stroke-width="1.2"/>

        <!-- Row 4: 2-Column Passport Details Grid -->
        <g transform="translate(0, 214)">
          <g>
            <text x="0" y="0" font-family="Outfit" font-size="10" font-weight="700" fill="#9C897A" letter-spacing="1.5">
              MICROCHIP ID
            </text>
            <text x="0" y="22" font-family="Outfit" font-size="15" font-weight="800" fill="#241912">
              ${escapeXml(chipId)}
            </text>
          </g>
          <g transform="translate(290, 0)">
            <text x="0" y="0" font-family="Outfit" font-size="10" font-weight="700" fill="#9C897A" letter-spacing="1.5">
              CARE &amp; TEMPERAMENT
            </text>
            <text x="0" y="22" font-family="Outfit" font-size="14" font-weight="600" fill="#241912">
              ${escapeXml(temperament.length > 32 ? temperament.slice(0, 32) + '...' : temperament)}
            </text>
          </g>
        </g>

        <!-- Row 5: Bottom Integrated Collar Scan Capsule (580 x 86 px at y=278) -->
        <g transform="translate(0, 278)">
          <rect width="580" height="86" rx="20" fill="#FAF6F0" stroke="#EDE4D8" stroke-width="1.2"/>
          
          <!-- Scannable QR Matrix Box -->
          <g transform="translate(15, 13)">
            <rect width="60" height="60" rx="12" fill="#FFFFFF" stroke="#E2D7C8" stroke-width="1"/>
            ${qrDataUri ? `<image href="${qrDataUri}" x="4" y="4" width="52" height="52" preserveAspectRatio="xMidYMid meet" />` : ''}
          </g>

          <g transform="translate(88, 36)">
            <text x="0" y="0" font-family="Outfit" font-size="15" font-weight="800" fill="#1C140E">
              Scan Collar Tag to Connect Instantly
            </text>
            <text x="0" y="18" font-family="Outfit" font-size="12" font-weight="500" fill="#756455">
              Direct access to live emergency contacts, diet &amp; vet records
            </text>
          </g>

          <!-- Security Lock Badge -->
          <g transform="translate(534, 29)">
            <circle cx="14" cy="14" r="14" fill="#EAE0D4"/>
            <path d="M 10 13 L 10 11 C 10 9 12 7 14 7 C 16 7 18 9 18 11 L 18 13 M 9 13 L 19 13 L 19 20 L 9 20 Z" fill="none" stroke="#5F4B3C" stroke-width="1.5"/>
          </g>
        </g>
      </g>
    </g>

    <!-- 4. Bottom Canvas Footer -->
    <g transform="translate(64, 604)">
      <text x="0" y="0" font-family="Outfit" font-size="13" font-weight="800" fill="#2C211B">
        ${escapeXml(displayHost)}/${escapeXml(cleanSlug)}
      </text>
      <text x="960" y="0" font-family="Outfit" font-size="12" font-weight="700" fill="#8B5E3C">
        Care, connected. 🐾
      </text>
    </g>
  </svg>`;
}

/**
 * Renders the 1200x630 OpenGraph passport card into a high-res PNG Buffer
 */
export async function renderPassportCardPng(options: PassportCardOptions): Promise<Buffer> {
  const svg = await generatePassportCardSvg(options);
  const cwd = process.cwd();

  const fontFiles = [
    path.join(cwd, 'fonts', 'Grandstander-Black.ttf'),
    path.join(cwd, 'fonts', 'Grandstander-Bold.ttf'),
    path.join(cwd, 'fonts', 'Outfit-900.ttf'),
    path.join(cwd, 'fonts', 'Outfit-800.ttf'),
    path.join(cwd, 'fonts', 'Outfit-700.ttf'),
    path.join(cwd, 'fonts', 'Outfit-600.ttf'),
    path.join(cwd, 'fonts', 'Outfit-400.ttf'),
  ].filter((f) => fs.existsSync(f));

  try {
    const resvg = new Resvg(svg, {
      fitTo: { mode: 'width', value: 1200 },
      font: {
        fontFiles,
        loadSystemFonts: false,
        defaultFontFamily: 'Outfit',
      },
    });
    return resvg.render().asPng();
  } catch (err) {
    console.warn('[ogPassportCard] Resvg failed, falling back to Sharp:', err);
    return await sharp(Buffer.from(svg)).png().toBuffer();
  }
}
