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
 * Pure Warm Skin / Cream Tone (No Dark Brown Background, No Clunky Separate Boxes).
 * Uses PupLume brand Grandstander typography and official brand identity.
 * Returns a high-res PNG Blob ready for Web Share API or download.
 */
export async function generatePuppyStoryBlob(
  puppy: PuppyProfile,
  profileUrl: string
): Promise<Blob> {
  const width = 1080;
  const height = 1920;

  // Ensure Grandstander font is loaded if running in browser
  if (typeof document !== 'undefined' && (document as any).fonts) {
    try {
      await Promise.all([
        (document as any).fonts.load('900 64px Grandstander'),
        (document as any).fonts.load('700 36px Grandstander'),
        (document as any).fonts.load('500 24px Grandstander'),
      ]);
    } catch {
      // Continue with fallback font
    }
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Unable to create 2D canvas context');
  }

  // 1. Pure Warm Skin / Cream Tone Background (Zero Dark Brown)
  const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
  bgGrad.addColorStop(0, '#FFFDF9');
  bgGrad.addColorStop(0.4, '#FFF9F2');
  bgGrad.addColorStop(0.8, '#FAF3E8');
  bgGrad.addColorStop(1, '#F6ECE1');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. Warm ambient radiant orbs for luxurious depth
  const orb1 = ctx.createRadialGradient(width * 0.25, height * 0.2, 80, width * 0.25, height * 0.2, 550);
  orb1.addColorStop(0, 'rgba(252, 221, 199, 0.45)');
  orb1.addColorStop(1, 'rgba(255, 249, 242, 0)');
  ctx.fillStyle = orb1;
  ctx.fillRect(0, 0, width, height);

  const orb2 = ctx.createRadialGradient(width * 0.8, height * 0.75, 100, width * 0.8, height * 0.75, 600);
  orb2.addColorStop(0, 'rgba(253, 230, 138, 0.35)');
  orb2.addColorStop(1, 'rgba(255, 249, 242, 0)');
  ctx.fillStyle = orb2;
  ctx.fillRect(0, 0, width, height);

  // 3. Top Branding Bar (Seamless directly on skin tone, no box)
  const topY = 130;

  // Squircle Logo Mark (54x54)
  const logoX = width / 2 - 145;
  const logoY = topY - 32;
  ctx.save();
  drawRoundedRect(ctx, logoX, logoY, 54, 54, 18);
  const logoGrad = ctx.createLinearGradient(logoX, logoY, logoX + 54, logoY + 54);
  logoGrad.addColorStop(0, '#A27046');
  logoGrad.addColorStop(1, '#734927');
  ctx.fillStyle = logoGrad;
  ctx.fill();

  // White puppy face center inside squircle
  ctx.beginPath();
  ctx.arc(logoX + 27, logoY + 28, 14, 0, Math.PI * 2);
  ctx.fillStyle = '#FFF9F2';
  ctx.fill();
  // Golden star over right ear
  ctx.beginPath();
  ctx.arc(logoX + 41, logoY + 12, 6, 0, Math.PI * 2);
  ctx.fillStyle = '#F59E0B';
  ctx.fill();
  ctx.restore();

  // Wordmark: PupLume in Grandstander
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.font = '900 48px "Grandstander", -apple-system, sans-serif';
  ctx.fillStyle = '#2C211B';
  ctx.fillText('Pup', logoX + 66, topY - 4);
  const pupWidth = ctx.measureText('Pup').width;
  ctx.fillStyle = '#8B5E3C';
  ctx.fillText('Lume', logoX + 66 + pupWidth, topY - 4);

  // Sub-header tagline
  ctx.textAlign = 'center';
  ctx.font = '800 18px "Grandstander", -apple-system, sans-serif';
  ctx.fillStyle = '#766A63';
  ctx.fillText('VERIFIED DIGITAL PET PASSPORT', width / 2, topY + 44);

  // 4. Hero Pet Photo (Seamless, Beautiful Borderless Organic Cutout - Zero Card Box)
  const photoW = 880;
  const photoH = 820;
  const photoX = (width - photoW) / 2; // 100
  const photoY = 240;
  const photoRadius = 40;

  // Soft shadow directly under photo
  ctx.save();
  ctx.shadowColor = 'rgba(44, 33, 27, 0.12)';
  ctx.shadowBlur = 32;
  ctx.shadowOffsetY = 16;
  ctx.fillStyle = '#FFFFFF';
  drawRoundedRect(ctx, photoX, photoY, photoW, photoH, photoRadius);
  ctx.fill();
  ctx.restore();

  // Clip photo directly
  ctx.save();
  drawRoundedRect(ctx, photoX, photoY, photoW, photoH, photoRadius);
  ctx.clip();

  let photoDrawn = false;
  if (puppy.photoUrl) {
    try {
      const petImg = await loadImageSafe(puppy.photoUrl);
      const scale = Math.max(photoW / petImg.width, photoH / petImg.height);
      const scaledW = petImg.width * scale;
      const scaledH = petImg.height * scale;
      const ox = photoX + (photoW - scaledW) / 2;
      const oy = photoY + (photoH - scaledH) / 2;
      ctx.drawImage(petImg, ox, oy, scaledW, scaledH);
      photoDrawn = true;
    } catch {
      photoDrawn = false;
    }
  }

  if (!photoDrawn) {
    const phGrad = ctx.createLinearGradient(photoX, photoY, photoX, photoY + photoH);
    phGrad.addColorStop(0, '#FFF9F2');
    phGrad.addColorStop(1, '#F3E7DA');
    ctx.fillStyle = phGrad;
    ctx.fillRect(photoX, photoY, photoW, photoH);

    ctx.font = '140px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🐶', photoX + photoW / 2, photoY + photoH / 2);
  }
  ctx.restore();

  // Emerald Verified Badge on top right of photo
  const badgeCx = photoX + photoW - 55;
  const badgeCy = photoY + 55;
  ctx.save();
  ctx.beginPath();
  ctx.arc(badgeCx, badgeCy, 34, 0, Math.PI * 2);
  ctx.fillStyle = '#059669';
  ctx.shadowColor = 'rgba(5, 150, 105, 0.35)';
  ctx.shadowBlur = 16;
  ctx.shadowOffsetY = 4;
  ctx.fill();
  ctx.restore();

  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(badgeCx, badgeCy, 34, 0, Math.PI * 2);
  ctx.stroke();

  ctx.font = 'bold 30px sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('✓', badgeCx, badgeCy + 2);

  // 5. Pet Identity Details (Flowing Directly on the Skin Tone Canvas - No Boxes)
  const infoStartY = photoY + photoH + 60;

  // Pet Name in Grandstander
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#2C211B';
  ctx.font = '900 76px "Grandstander", -apple-system, sans-serif';
  const displayName = puppy.name.length > 18 ? puppy.name.slice(0, 16) + '...' : puppy.name;
  ctx.fillText(displayName, photoX, infoStartY);

  // Breed & Details
  ctx.fillStyle = '#8B5E3C';
  ctx.font = '700 36px "Grandstander", -apple-system, sans-serif';
  const details = [
    puppy.breed,
    puppy.sex ? (puppy.sex === 'male' ? 'Male' : 'Female') : null,
    puppy.weightLbs ? `${puppy.weightLbs} lbs` : null
  ].filter(Boolean).join(' • ');
  ctx.fillText(details || 'Puppy Companion', photoX, infoStartY + 52);

  // Status highlights
  ctx.font = '800 24px "Grandstander", -apple-system, sans-serif';
  ctx.fillStyle = '#2E7D32';
  ctx.fillText('🛡️ Smart Collar Tag Active   •   💉 Vaccinated', photoX, infoStartY + 106);

  // Temperament or Care Note
  if (puppy.temperament) {
    ctx.font = '600 24px "Grandstander", -apple-system, sans-serif';
    ctx.fillStyle = '#766A63';
    ctx.fillText(`“${puppy.temperament}”`, photoX, infoStartY + 152);
  }

  // 6. Seamless Scannable QR Code Tag (Bottom Right)
  try {
    const qrDataUrl = await generatePupLumeQRDataUrl(profileUrl, { size: 360 });
    const qrImg = await loadImageSafe(qrDataUrl);
    const qrSize = 190;
    const qrX = photoX + photoW - qrSize;
    const qrY = infoStartY - 60;

    // Draw QR code cleanly with subtle soft shadow
    ctx.save();
    ctx.shadowColor = 'rgba(44, 33, 27, 0.08)';
    ctx.shadowBlur = 18;
    ctx.shadowOffsetY = 8;
    ctx.fillStyle = '#FFFFFF';
    drawRoundedRect(ctx, qrX - 12, qrY - 12, qrSize + 24, qrSize + 24, 28);
    ctx.fill();
    ctx.restore();

    ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

    // QR Subtitle
    ctx.font = '800 16px "Grandstander", -apple-system, sans-serif';
    ctx.fillStyle = '#5F3E29';
    ctx.textAlign = 'center';
    ctx.fillText('SCAN TAG', qrX + qrSize / 2, qrY + qrSize + 30);
  } catch {
    // Graceful fallback
  }

  // 7. Instagram Story Tap-to-Open Callout (Bottom Bar)
  const footerY = height - 240;

  // Clean pill sticker
  const stickerW = 680;
  const stickerH = 92;
  const stickerX = (width - stickerW) / 2;

  ctx.save();
  ctx.shadowColor = 'rgba(44, 33, 27, 0.08)';
  ctx.shadowBlur = 20;
  ctx.shadowOffsetY = 6;
  ctx.fillStyle = '#FFFFFF';
  drawRoundedRect(ctx, stickerX, footerY, stickerW, stickerH, 46);
  ctx.fill();
  ctx.restore();

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#2C211B';
  ctx.font = '800 28px "Grandstander", -apple-system, sans-serif';
  ctx.fillText('🔗 Tap Link to Open Digital Passport', width / 2, footerY + stickerH / 2);

  // Bottom brand domain
  ctx.fillStyle = '#8B5E3C';
  ctx.font = '900 26px "Grandstander", -apple-system, sans-serif';
  ctx.fillText('puplumepet.vercel.app', width / 2, footerY + stickerH + 60);

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
