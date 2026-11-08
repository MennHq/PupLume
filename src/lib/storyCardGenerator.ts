import { PuppyProfile } from '../types';
import { generatePupLumeQRDataUrl } from './qrCodeGenerator';

/**
 * Helper to draw a rounded rectangle on Canvas 2D context
 * compatible across all mobile browsers and webviews.
 */
function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/**
 * Loads an image with CORS anonymous handling and safe fallback.
 */
function loadImageSafe(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => {
      // Fallback: try loading without CORS in case local/data URI
      const fallback = new Image();
      fallback.onload = () => resolve(fallback);
      fallback.onerror = () => reject(new Error('Failed to load image: ' + src));
      fallback.src = src;
    };
    img.src = src;
  });
}

/**
 * Generates a Spotify-style 9:16 (1080x1920) Instagram Story card for a puppy profile.
 * Returns a high-res PNG Blob ready for Web Share API or download.
 */
export async function generatePuppyStoryBlob(
  puppy: PuppyProfile,
  profileUrl: string
): Promise<Blob> {
  const width = 1080;
  const height = 1920;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Unable to create 2D canvas context');
  }

  // 1. Sleek Spotify-style vertical gradient background
  const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
  bgGrad.addColorStop(0, '#1E140E');
  bgGrad.addColorStop(0.35, '#352115');
  bgGrad.addColorStop(0.7, '#24160E');
  bgGrad.addColorStop(1, '#120B07');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. Ambient glowing color orbs behind card for depth
  const orb1 = ctx.createRadialGradient(width * 0.3, height * 0.35, 50, width * 0.3, height * 0.35, 450);
  orb1.addColorStop(0, 'rgba(217, 119, 6, 0.25)'); // Amber glow
  orb1.addColorStop(1, 'rgba(217, 119, 6, 0)');
  ctx.fillStyle = orb1;
  ctx.fillRect(0, 0, width, height);

  const orb2 = ctx.createRadialGradient(width * 0.7, height * 0.6, 60, width * 0.7, height * 0.6, 500);
  orb2.addColorStop(0, 'rgba(139, 94, 60, 0.35)'); // Warm brown glow
  orb2.addColorStop(1, 'rgba(139, 94, 60, 0)');
  ctx.fillStyle = orb2;
  ctx.fillRect(0, 0, width, height);

  // 3. Top branding bar (PupLume digital pet passport)
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Brand Header
  ctx.font = 'bold 32px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = '#E8DDD3';
  ctx.letterSpacing = '6px';
  ctx.fillText('PUPLUME DIGITAL PASSPORT', width / 2, 160);
  ctx.letterSpacing = '0px';

  // Subtitle
  ctx.font = '500 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = '#A8988D';
  ctx.fillText('Verified Pet Identity & Safety Passport', width / 2, 205);

  // 4. Floating Spotify-style Card
  const cardW = 860;
  const cardH = 1180;
  const cardX = (width - cardW) / 2; // 110
  const cardY = 270;
  const cardRadius = 40;

  // Card shadow
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
  ctx.shadowBlur = 45;
  ctx.shadowOffsetY = 24;
  ctx.fillStyle = '#FAF6F0';
  drawRoundedRect(ctx, cardX, cardY, cardW, cardH, cardRadius);
  ctx.fill();
  ctx.restore();

  // Subtle border on card
  ctx.strokeStyle = '#E8DDD3';
  ctx.lineWidth = 3;
  drawRoundedRect(ctx, cardX, cardY, cardW, cardH, cardRadius);
  ctx.stroke();

  // 5. Pet Photo inside the Card
  const photoMargin = 40;
  const photoW = cardW - photoMargin * 2; // 780
  const photoH = 680;
  const photoX = cardX + photoMargin;
  const photoY = cardY + photoMargin;
  const photoRadius = 28;

  // Clip photo to rounded rectangle
  ctx.save();
  drawRoundedRect(ctx, photoX, photoY, photoW, photoH, photoRadius);
  ctx.clip();

  let photoDrawn = false;
  if (puppy.photoUrl) {
    try {
      const petImg = await loadImageSafe(puppy.photoUrl);
      // Cover fit inside photo box
      const scale = Math.max(photoW / petImg.width, photoH / petImg.height);
      const scaledW = petImg.width * scale;
      const scaledH = petImg.height * scale;
      const ox = photoX + (photoW - scaledW) / 2;
      const oy = photoY + (photoH - scaledH) / 2;
      ctx.drawImage(petImg, ox, oy, scaledW, scaledH);
      photoDrawn = true;
    } catch {
      // Photo failed to load, fallback to styled avatar box
      photoDrawn = false;
    }
  }

  if (!photoDrawn) {
    // Beautiful placeholder gradient
    const phGrad = ctx.createLinearGradient(photoX, photoY, photoX, photoY + photoH);
    phGrad.addColorStop(0, '#F3E7DA');
    phGrad.addColorStop(1, '#DFCABA');
    ctx.fillStyle = phGrad;
    ctx.fillRect(photoX, photoY, photoW, photoH);

    ctx.font = 'bold 120px sans-serif';
    ctx.fillStyle = '#8B5E3C';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🐾', photoX + photoW / 2, photoY + photoH / 2);
  }
  ctx.restore();

  // Thin inner border on photo
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
  ctx.lineWidth = 2;
  drawRoundedRect(ctx, photoX, photoY, photoW, photoH, photoRadius);
  ctx.stroke();

  // 6. Text info under photo inside the card
  const textStartY = photoY + photoH + 50;

  // Pet Name
  ctx.textAlign = 'left';
  ctx.fillStyle = '#2C211B';
  ctx.font = 'bold 56px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  const displayName = puppy.name.length > 18 ? puppy.name.slice(0, 16) + '...' : puppy.name;
  ctx.fillText(displayName, cardX + photoMargin, textStartY);

  // Breed & Pet Details
  ctx.fillStyle = '#8B5E3C';
  ctx.font = '600 32px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  const details = [puppy.breed, puppy.sex ? (puppy.sex === 'male' ? 'Male' : 'Female') : null]
    .filter(Boolean)
    .join(' • ');
  ctx.fillText(details || 'Puppy', cardX + photoMargin, textStartY + 48);

  // Pet Tag / Status Pill inside card
  const pillY = textStartY + 95;
  const pillH = 48;
  const pillW = 280;
  ctx.fillStyle = '#F3E7DA';
  drawRoundedRect(ctx, cardX + photoMargin, pillY, pillW, pillH, 24);
  ctx.fill();

  ctx.fillStyle = '#5F3E29';
  ctx.font = 'bold 22px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('🐾 DIGITAL PASSPORT', cardX + photoMargin + pillW / 2, pillY + pillH / 2 + 1);

  // 7. Embedded Branded QR Code at the bottom right of the card
  try {
    const qrDataUrl = await generatePupLumeQRDataUrl(profileUrl, { size: 360 });
    const qrImg = await loadImageSafe(qrDataUrl);
    const qrSize = 180;
    const qrX = cardX + cardW - photoMargin - qrSize;
    const qrY = photoY + photoH + 28;

    // QR container box
    ctx.save();
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.12)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 4;
    drawRoundedRect(ctx, qrX - 8, qrY - 8, qrSize + 16, qrSize + 16, 20);
    ctx.fill();
    ctx.restore();

    ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

    // QR Label
    ctx.fillStyle = '#766A63';
    ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SCAN PASSPORT', qrX + qrSize / 2, qrY + qrSize + 18);
  } catch {
    // Graceful QR fallback if offline
  }

  // 8. Instagram Sticker / Tap to Open prompt footer
  const footerY = cardY + cardH + 70;

  // Instagram Story Link Sticker Pill graphic
  const stickerW = 540;
  const stickerH = 88;
  const stickerX = (width - stickerW) / 2;

  // Glowing Spotify/Instagram style link sticker
  ctx.save();
  ctx.shadowColor = 'rgba(255, 255, 255, 0.18)';
  ctx.shadowBlur = 20;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
  drawRoundedRect(ctx, stickerX, footerY, stickerW, stickerH, 44);
  ctx.fill();
  ctx.restore();

  // Sticker text
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#1E140E';
  ctx.font = 'bold 28px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('🔗 Tap Link to View Passport', width / 2, footerY + stickerH / 2);

  // Bottom caption
  ctx.fillStyle = '#A8988D';
  ctx.font = '500 22px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('Created with PupLume • The Smart Dog Companion', width / 2, footerY + stickerH + 55);

  // Return canvas as PNG Blob
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('Canvas toBlob returned null'));
      }
    }, 'image/png');
  });
}
