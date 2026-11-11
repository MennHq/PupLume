/**
 * Production-Ready Image Upload & Optimization Service
 * 
 * Architecture:
 * 1. Validates allowed formats (JPG, PNG, WebP) and 10 MB size limit.
 * 2. Obtains temporary authenticated upload URL from Convex.
 * 3. Stages the uncompressed original in Convex temporary File Storage.
 * 4. Calls Convex Node.js Action (`images:processAndStoreImage`) where Sharp:
 *    - Validates decoded image format on server (rejecting spoofed MIME types)
 *    - Auto-orients image via EXIF
 *    - Applies user crop coordinates (if profile picture)
 *    - Resizes to optimal dimensions (800x800 square for profile, max 1600 inside for general)
 *    - Strips EXIF/GPS metadata
 *    - Converts to lossy WebP (quality 82, effort 4)
 * 5. Official Cloudinary Node.js SDK uploads optimized WebP to permanent Cloudinary storage.
 * 6. Records references in Convex database.
 * 7. Automatically deletes temporary Convex file and old Cloudinary image.
 */

import { convex } from './convex';
import { api } from '../../convex/_generated/api';
import { storage } from './storage';
import { Id } from '../../convex/_generated/dataModel';

export interface UploadResult {
  url: string;
  publicId?: string;
  width?: number;
  height?: number;
  format?: string;
  size?: number;
}

export interface UploadImageOptions {
  folder?: string;
  tags?: string[];
  userId?: string;
  targetType?: 'puppy_profile' | 'user_avatar' | 'journal' | 'document' | 'general';
  targetId?: string;
  previousImageUrl?: string;
  previousPublicId?: string;
  crop?: {
    left: number;
    top: number;
    width: number;
    height: number;
  };
  onProgress?: (phase: 'validating' | 'uploading' | 'processing' | 'saving') => void;
}

export function readFileAsDataUrl(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

function dataURItoBlob(dataURI: string): Blob {
  const byteString = atob(dataURI.split(',')[1]);
  const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: mimeString });
}

/**
 * Uploads an image through the production Convex + Sharp + Cloudinary pipeline.
 */
export async function uploadImageToCloudinary(
  fileOrBase64: File | Blob | string,
  options: UploadImageOptions = {}
): Promise<UploadResult> {
  // Convert string to Blob if necessary
  let fileBlob: Blob;
  let fileName = 'upload.jpg';

  if (typeof fileOrBase64 === 'string') {
    if (fileOrBase64.startsWith('data:')) {
      fileBlob = dataURItoBlob(fileOrBase64);
    } else {
      // If it's already a remote HTTP URL, return as-is
      return { url: fileOrBase64 };
    }
  } else {
    fileBlob = fileOrBase64;
    if (fileOrBase64 instanceof File) {
      fileName = fileOrBase64.name;
    }
  }

  // 1. Format validation: strictly JPG/JPEG, PNG, WebP
  options.onProgress?.('validating');
  const mimeType = (fileBlob.type || '').toLowerCase();
  const validMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const ext = fileName.toLowerCase().split('.').pop() || '';
  const validExts = ['jpg', 'jpeg', 'png', 'webp'];

  if (mimeType && !validMimes.includes(mimeType) && !validExts.includes(ext)) {
    throw new Error('Only JPG, PNG, and WebP images are allowed. Please select a supported file format.');
  }

  // 2. Enforce 10 MB maximum original size
  const MAX_SIZE_BYTES = 10 * 1024 * 1024;
  if (fileBlob.size > MAX_SIZE_BYTES) {
    const sizeMb = (fileBlob.size / (1024 * 1024)).toFixed(1);
    throw new Error(`Original image (${sizeMb} MB) exceeds the 10 MB limit. Please select an image under 10 MB.`);
  }

  // Resolve user ID
  const effectiveUserId = options.userId || storage.getCurrentUserId() || 'anonymous_user';

  // 3. Stage uncompressed original in Convex temporary File Storage
  options.onProgress?.('uploading');
  let uploadUrl: string;
  try {
    uploadUrl = await convex.mutation(api.imageMutations.generateUploadUrl, {
      userId: effectiveUserId,
    });
  } catch (err: any) {
    console.error('[Upload Pipeline] Could not generate Convex upload URL:', err);
    throw new Error('Server connection error. Please verify your connection.');
  }

  const postRes = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      'Content-Type': mimeType || 'image/jpeg',
    },
    body: fileBlob,
  });

  if (!postRes.ok) {
    throw new Error(`Failed to upload to temporary storage (${postRes.status}).`);
  }

  const { storageId } = await postRes.json();
  if (!storageId) {
    throw new Error('No storage ID returned from temporary staging.');
  }

  // 4. Server-Side Sharp Processing + Cloudinary Upload via Node.js Action
  options.onProgress?.('processing');
  try {
    const previousPublicId = options.previousPublicId || (
      options.previousImageUrl ? extractPublicId(options.previousImageUrl) : undefined
    );

    const result = await convex.action(api.images.processAndStoreImage, {
      storageId: storageId as Id<'_storage'>,
      userId: effectiveUserId,
      targetType: options.targetType || 'general',
      targetId: options.targetId,
      crop: options.crop,
      folder: options.folder || (options.targetType === 'puppy_profile' ? 'puplume/pets' : 'puplume/uploads'),
      previousPublicId,
    });

    options.onProgress?.('saving');
    return {
      url: result.secureUrl,
      publicId: result.publicId,
      width: result.width,
      height: result.height,
      format: result.format,
      size: result.size,
    };
  } catch (procErr: any) {
    console.error('[Upload Pipeline] Sharp / Cloudinary processing error:', procErr);
    throw new Error(procErr.message || 'Image processing failed. Please ensure the file is a valid image.');
  }
}

/**
 * Helper to extract Cloudinary public ID from a standard Cloudinary URL
 */
function extractPublicId(url: string): string | undefined {
  if (!url || !url.includes('cloudinary.com')) return undefined;
  try {
    const parts = url.split('/upload/');
    if (parts.length < 2) return undefined;
    const afterUpload = parts[1];
    // Remove version like v123456789/ if present
    const withoutVersion = afterUpload.replace(/^v\d+\//, '');
    // Remove file extension
    const withoutExt = withoutVersion.replace(/\.[^/.]+$/, '');
    return withoutExt;
  } catch (_) {
    return undefined;
  }
}

/**
 * Optimizes a Cloudinary image URL with auto format and auto quality
 */
export function getOptimizedCloudinaryUrl(
  url: string,
  options?: { width?: number; height?: number; crop?: string }
): string {
  if (!url || !url.includes('cloudinary.com')) {
    return url;
  }

  const parts = url.split('/upload/');
  if (parts.length !== 2) return url;

  const transforms: string[] = ['f_auto', 'q_auto'];
  if (options?.width) transforms.push(`w_${options.width}`);
  if (options?.height) transforms.push(`h_${options.height}`);
  if (options?.crop) transforms.push(`c_${options.crop}`);

  return `${parts[0]}/upload/${transforms.join(',')}/${parts[1]}`;
}

/**
 * Permanently deletes an image from Cloudinary via authenticated server-side action
 */
export async function deleteImageFromCloudinary(urlOrPublicId: string): Promise<boolean> {
  if (!urlOrPublicId) return false;
  const publicId = urlOrPublicId.includes('http') ? extractPublicId(urlOrPublicId) : urlOrPublicId;
  if (!publicId) return false;

  const currentUserId = storage.getCurrentUserId() || 'anonymous_user';

  try {
    const result = await convex.action(api.images.deleteImage, {
      publicId,
      userId: currentUserId,
    });
    return Boolean(result.success);
  } catch (err) {
    console.warn('[Cloudinary Client] Failed to delete image:', err);
    return false;
  }
}
