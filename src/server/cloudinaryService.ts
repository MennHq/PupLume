import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Strictly load secrets from environment variables with no hardcoded fallback strings
const cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
const api_key = process.env.CLOUDINARY_API_KEY;
const api_secret = process.env.CLOUDINARY_API_SECRET;

if (!cloud_name || !api_key || !api_secret) {
  console.warn('[CloudinaryService] Warning: CLOUDINARY credentials missing from process.env.');
}

cloudinary.config({
  cloud_name: cloud_name || '',
  api_key: api_key || '',
  api_secret: api_secret || '',
  secure: true,
});

export interface UploadOptions {
  folder?: string;
  publicId?: string;
  tags?: string[];
  transformation?: any[];
  previousImageUrl?: string;
  previousPublicId?: string;
}

/**
 * Robustly extracts the public_id from a Cloudinary URL or returns the public_id directly.
 * Skips transformations (e.g. c_fill,w_300), version tags (v123456789), and protects system brand assets.
 */
export function extractCloudinaryPublicId(urlOrPublicId: string): string | null {
  if (!urlOrPublicId) return null;
  if (!urlOrPublicId.startsWith('http://') && !urlOrPublicId.startsWith('https://')) {
    return urlOrPublicId;
  }
  if (!urlOrPublicId.includes('cloudinary.com')) return null;

  try {
    const urlObj = new URL(urlOrPublicId);
    const pathname = urlObj.pathname;
    const uploadIndex = pathname.indexOf('/upload/');
    if (uploadIndex === -1) return null;

    let rest = pathname.substring(uploadIndex + '/upload/'.length);
    const parts = rest.split('/');
    let startIndex = 0;
    while (startIndex < parts.length) {
      const part = parts[startIndex];
      if (/^v\d+$/.test(part)) {
        startIndex++;
        break;
      } else if (part.includes(',') || /^[a-z]_[a-z0-9_-]+$/i.test(part)) {
        startIndex++;
      } else {
        break;
      }
    }

    const publicIdWithExt = parts.slice(startIndex).join('/');
    const lastDotIndex = publicIdWithExt.lastIndexOf('.');
    const publicId = lastDotIndex !== -1 ? publicIdWithExt.substring(0, lastDotIndex) : publicIdWithExt;

    if (!publicId) return null;
    // Protect system branding assets from accidental or malicious deletion
    if (
      publicId === 'PupLume' ||
      publicId === 'PupCollar' ||
      publicId.startsWith('branding/') ||
      publicId.startsWith('system/') ||
      publicId.startsWith('assets/')
    ) {
      return null;
    }
    return publicId;
  } catch {
    return null;
  }
}

/**
 * Permanently deletes an image from Cloudinary by its public ID or full HTTPS URL.
 */
export async function deleteFromCloudinary(urlOrPublicId: string): Promise<{ success: boolean; result?: any }> {
  try {
    const publicId = extractCloudinaryPublicId(urlOrPublicId);
    if (!publicId) {
      return { success: false, result: 'not_cloudinary_or_protected' };
    }

    const res = await cloudinary.uploader.destroy(publicId, {
      invalidate: true,
      resource_type: 'image',
    });
    console.log(`[Cloudinary] Cleaned up previous image: ${publicId}`, res);
    return { success: res.result === 'ok', result: res.result };
  } catch (err: any) {
    console.warn(`[Cloudinary] Warning: Failed to delete previous image ${urlOrPublicId}:`, err?.message);
    return { success: false, result: err?.message };
  }
}

export async function uploadToCloudinary(
  fileData: string,
  options: UploadOptions = {}
): Promise<{ url: string; publicId: string; width?: number; height?: number; format?: string }> {
  try {
    if (!fileData) {
      throw new Error('No image data provided for upload');
    }

    const folder = options.folder || 'puplume/pets';
    const uploadResult: UploadApiResponse = await cloudinary.uploader.upload(fileData, {
      folder,
      resource_type: 'auto',
      tags: options.tags || ['puplume', 'pets'],
      transformation: options.transformation || [
        { quality: 'auto', fetch_format: 'auto' }
      ]
    });

    const result = {
      url: uploadResult.secure_url || uploadResult.url,
      publicId: uploadResult.public_id,
      width: uploadResult.width,
      height: uploadResult.height,
      format: uploadResult.format,
    };

    // If previous image URL was provided, automatically delete the old photo from Cloudinary!
    const previousTarget = options.previousImageUrl || options.previousPublicId;
    if (previousTarget) {
      deleteFromCloudinary(previousTarget).catch((delErr) => {
        console.debug('[Cloudinary] Note on previous image cleanup:', delErr?.message);
      });
    }

    return result;
  } catch (error: any) {
    console.error('[Cloudinary] Upload failed:', error);
    throw new Error(error?.message || 'Failed to upload image to Cloudinary');
  }
}
