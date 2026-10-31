import QRCode from 'qrcode';

export interface PupLumeQROptions {
  size?: number; // Target pixel width/height (e.g., 512, 1024)
  margin?: number; // Quiet zone in modules (default 3)
  darkColor?: string; // QR module dark color (default #2C211B)
  lightColor?: string; // Background color (default #FFFFFF)
  pupilColor?: string; // Finder eye center color (default #8B5E3C)
  badgeBg?: string; // Center logo badge background (default #FFF9F2)
  badgeBorder?: string; // Center logo badge border (default #8B5E3C)
}

/**
 * Generates an SVG string of PupLume's custom branded QR code
 * with the official PupLume dog & glowing star logo in the center.
 */
export function generatePupLumeQRSvg(url: string, options: PupLumeQROptions = {}): string {
  const darkColor = options.darkColor || '#2C211B';
  const lightColor = options.lightColor || '#FFFFFF';
  const pupilColor = options.pupilColor || '#8B5E3C';
  const badgeBg = options.badgeBg || '#FFF9F2';
  const badgeBorder = options.badgeBorder || '#8B5E3C';
  const margin = options.margin !== undefined ? options.margin : 3;

  // Error Correction Level 'H' (High) allows 30% recovery capacity
  const qr = QRCode.create(url, { errorCorrectionLevel: 'H' });
  const size = qr.modules.size;
  const totalSize = size + margin * 2;
  const scale = 20; // 20 units per module in SVG viewBox
  const canvasSize = totalSize * scale;

  // Center logo covers ~23% of width (well within 30% error correction limit)
  const logoModules = 8.5;
  const logoRadius = logoModules / 2;
  const centerIdx = (size - 1) / 2;

  function isFinderPattern(r: number, c: number): boolean {
    if (r <= 7 && c <= 7) return true; // Top-left
    if (r <= 7 && c >= size - 8) return true; // Top-right
    if (r >= size - 8 && c <= 7) return true; // Bottom-left
    return false;
  }

  function isLogoArea(r: number, c: number): boolean {
    const dr = r - centerIdx;
    const dc = c - centerIdx;
    return Math.abs(dr) <= logoRadius && Math.abs(dc) <= logoRadius;
  }

  const rects: string[] = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (isFinderPattern(r, c) || isLogoArea(r, c)) continue;
      if (qr.modules.get(r, c)) {
        const x = (c + margin) * scale;
        const y = (r + margin) * scale;
        const pad = scale * 0.04;
        const w = scale - pad * 2;
        const rx = scale * 0.28;
        rects.push(
          `<rect x="${x + pad}" y="${y + pad}" width="${w}" height="${w}" rx="${rx}" fill="${darkColor}" />`
        );
      }
    }
  }

  // Draw Custom Finder Patterns (Smooth rounded concentric eyes)
  function renderFinder(startR: number, startC: number): string {
    const x = (startC + margin) * scale;
    const y = (startR + margin) * scale;
    const s7 = 7 * scale;
    const s5 = 5 * scale;
    const s3 = 3 * scale;
    const off1 = 1 * scale;
    const off2 = 2 * scale;

    return `
      <rect x="${x}" y="${y}" width="${s7}" height="${s7}" rx="${scale * 1.5}" fill="${darkColor}" />
      <rect x="${x + off1}" y="${y + off1}" width="${s5}" height="${s5}" rx="${scale * 1.0}" fill="${lightColor}" />
      <rect x="${x + off2}" y="${y + off2}" width="${s3}" height="${s3}" rx="${scale * 0.8}" fill="${pupilColor}" />
    `;
  }

  const finders = [
    renderFinder(0, 0),
    renderFinder(0, size - 7),
    renderFinder(size - 7, 0),
  ].join('\n');

  // Center badge dimensions
  const badgeSize = logoModules * scale;
  const badgeX = (centerIdx + margin - logoModules / 2 + 0.5) * scale;
  const badgeY = (centerIdx + margin - logoModules / 2 + 0.5) * scale;
  const badgePadding = badgeSize * 0.08;
  const innerLogoSize = badgeSize - badgePadding * 2;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${canvasSize} ${canvasSize}" width="${canvasSize}" height="${canvasSize}">
  <defs>
    <linearGradient id="pupQrLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#A27046" />
      <stop offset="100%" stop-color="#734927" />
    </linearGradient>
    <linearGradient id="pupQrStarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FDE68A" />
      <stop offset="50%" stop-color="#F59E0B" />
      <stop offset="100%" stop-color="#8B5E3C" />
    </linearGradient>
    <filter id="pupQrBadgeShadow" x="-25%" y="-25%" width="150%" height="150%">
      <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#2C211B" flood-opacity="0.22" />
    </filter>
  </defs>

  <!-- Background Base -->
  <rect width="${canvasSize}" height="${canvasSize}" rx="${scale * 2.5}" fill="${lightColor}" />

  <!-- QR Code Modules -->
  <g class="qr-modules">
    ${rects.join('\n    ')}
  </g>

  <!-- Finder Patterns -->
  <g class="qr-finders">
    ${finders}
  </g>

  <!-- Center PupLume Badge Background -->
  <g filter="url(#pupQrBadgeShadow)">
    <rect x="${badgeX}" y="${badgeY}" width="${badgeSize}" height="${badgeSize}" rx="${badgeSize * 0.28}" fill="${badgeBg}" stroke="${badgeBorder}" stroke-width="${scale * 0.25}" />
  </g>

  <!-- PupLume Dog + Star Emblem -->
  <g transform="translate(${badgeX + badgePadding}, ${badgeY + badgePadding}) scale(${innerLogoSize / 100})">
    <g transform="translate(6, 4) scale(0.19)">
      <path d="M 220 80 C 130 80 70 140 70 240 C 70 330 140 380 220 380 C 300 380 370 330 370 240 C 370 140 310 80 220 80 Z" fill="url(#pupQrLogoGrad)" />
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
        <path d="M 40 0 C 40 22 58 40 80 40 C 58 40 40 58 40 80 C 40 58 22 40 0 40 C 22 40 40 22 40 0 Z" fill="url(#pupQrStarGrad)" />
        <circle cx="40" cy="40" r="10" fill="#FFF9F2" />
      </g>
    </g>
  </g>
</svg>`;
}

/**
 * Returns a high-resolution PNG data URL of PupLume's custom QR code.
 * Falls back to an SVG data URL if canvas rendering is unavailable.
 */
export async function generatePupLumeQRDataUrl(
  url: string,
  options: PupLumeQROptions = {}
): Promise<string> {
  const targetSize = options.size || 800;
  const svgString = generatePupLumeQRSvg(url, options);

  if (typeof window === 'undefined' || typeof document === 'undefined') {
    // Server or non-DOM environment
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`;
  }

  return new Promise<string>((resolve) => {
    try {
      const img = new Image();
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const blobUrl = URL.createObjectURL(svgBlob);

      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = targetSize;
          canvas.height = targetSize;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            URL.revokeObjectURL(blobUrl);
            resolve(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`);
            return;
          }

          // Draw white background then image
          ctx.fillStyle = options.lightColor || '#FFFFFF';
          ctx.fillRect(0, 0, targetSize, targetSize);
          ctx.drawImage(img, 0, 0, targetSize, targetSize);
          URL.revokeObjectURL(blobUrl);

          const pngData = canvas.toDataURL('image/png');
          resolve(pngData);
        } catch (e) {
          URL.revokeObjectURL(blobUrl);
          resolve(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`);
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(blobUrl);
        resolve(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`);
      };

      img.src = blobUrl;
    } catch (err) {
      resolve(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`);
    }
  });
}

/**
 * Downloads PupLume's custom branded QR code as a high-resolution PNG file.
 */
export async function downloadPupLumeQR(
  url: string,
  fileName: string = 'puplume-collar-qr.png',
  options: PupLumeQROptions = {}
): Promise<void> {
  const dataUrl = await generatePupLumeQRDataUrl(url, { size: 1024, ...options });
  if (typeof document !== 'undefined') {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = fileName.endsWith('.png') ? fileName : `${fileName}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}
