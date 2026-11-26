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
  const commaIdx = dataURI.indexOf(',');
  if (commaIdx === -1) {
    throw new Error('Invalid image data URI.');
  }
  const header = dataURI.slice(0, commaIdx);
  const body = dataURI.slice(commaIdx + 1);
  const mimeMatch = header.match(/data:([^;]+)/i);
  const mimeString = mimeMatch ? mimeMatch[1] : 'image/jpeg';

  if (/;base64/i.test(header)) {
    const byteString = atob(body);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  }

  return new Blob([decodeURIComponent(body)], { type: mimeString });
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, errorMessage: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
    ),
  ]);
}

/**
 * Browser-side image crop & compression fallback using HTML5 Canvas.
 * Used if server-side processing is unreachable, offline, or times out.
 */
export async function optimizeImageInBrowser(
  fileOrBlob: Blob,
  crop?: { left: number; top: number; width: number; height: number },
  maxDimension: number = 800
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return reject(new Error('Browser environment required for client compression.'));
    }
    const url = URL.createObjectURL(fileOrBlob);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      try {
        const canvas = document.createElement('canvas');
        let srcX = 0;
        let srcY = 0;
        let srcWidth = img.naturalWidth || img.width;
        let srcHeight = img.naturalHeight || img.height;

        if (crop && crop.width > 0 && crop.height > 0) {
          srcX = Math.max(0, Math.min(crop.left, srcWidth - 1));
          srcY = Math.max(0, Math.min(crop.top, srcHeight - 1));
          srcWidth = Math.max(1, Math.min(crop.width, srcWidth - srcX));
          srcHeight = Math.max(1, Math.min(crop.height, srcHeight - srcY));
        }

        // Maintain aspect ratio or square inside maxDimension
        let destWidth = srcWidth;
        let destHeight = srcHeight;
        if (destWidth > maxDimension || destHeight > maxDimension) {
          if (destWidth >= destHeight) {
            destHeight = Math.round((destHeight * maxDimension) / destWidth);
            destWidth = maxDimension;
          } else {
            destWidth = Math.round((destWidth * maxDimension) / destHeight);
            destHeight = maxDimension;
          }
        }

        canvas.width = Math.max(1, destWidth);
        canvas.height = Math.max(1, destHeight);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(url);
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, srcX, srcY, srcWidth, srcHeight, 0, 0, canvas.width, canvas.height);

        // Convert to WebP or fallback to JPEG
        let dataUrl = canvas.toDataURL('image/webp', 0.85);
        if (!dataUrl || dataUrl.startsWith('data:image/png')) {
          dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        }
        resolve(dataUrl);
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(err);
    };
    img.src = url;
  });
}

/**
 * Tier-2 Cloud Fallback: Uploads browser-optimized WebP directly through /api/upload
 * (Vercel serverless Cloudinary endpoint) so images are ALWAYS hosted on Cloudinary
 * even if Convex Sharp action fails, times out, or encounters an exotic format.
 */
async function uploadOptimizedViaApi(
  dataUrl: string,
  options: UploadImageOptions,
  previousPublicId?: string
): Promise<UploadResult> {
  const folder =
    options.folder ||
    (options.targetType === 'puppy_profile' || options.targetType === 'user_avatar'
      ? 'puplume/pets'
      : 'puplume/uploads');

  const response = await withTimeout(
    fetch('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        file: dataUrl,
        folder,
        tags: options.tags || ['puplume', options.targetType || 'pets'],
        previousImageUrl:
          options.previousImageUrl && options.previousImageUrl.startsWith('http')
            ? options.previousImageUrl
            : undefined,
        previousPublicId,
      }),
    }),
    20000,
    'Cloudinary API upload timed out'
  );

  let payload: any = null;
  try {
    payload = await response.json();
  } catch {
    throw new Error(`Upload server returned invalid response (${response.status}).`);
  }

  if (!response.ok || !payload?.success || !payload?.url || !String(payload.url).startsWith('http')) {
    throw new Error(payload?.error || `Cloudinary API upload failed (${response.status}).`);
  }

  return {
    url: payload.url,
    publicId: payload.publicId,
    width: payload.width,
    height: payload.height,
    format: payload.format || 'webp',
    size: dataUrl.length,
  };
}

/**
 * Uploads an image through the production Convex + Sharp + Cloudinary pipeline,
 * automatically falling back to browser-optimized /api/upload (also Cloudinary-hosted).
 * Never silently returns an unhosted data: base64 URL.
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

  // 1. Format validation: JPG/JPEG, PNG, WebP, GIF, AVIF
  options.onProgress?.('validating');
  const mimeType = (fileBlob.type || '').toLowerCase();
  const validMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
  const ext = fileName.toLowerCase().split('.').pop() || '';
  const validExts = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif'];

  if (mimeType && !validMimes.includes(mimeType) && !validExts.includes(ext)) {
    throw new Error('Only JPG, PNG, WebP, GIF, and AVIF images are allowed. Please select a supported file format.');
  }

  // 2. Enforce 10 MB maximum original size
  const MAX_SIZE_BYTES = 10 * 1024 * 1024;
  if (fileBlob.size > MAX_SIZE_BYTES) {
    const sizeMb = (fileBlob.size / (1024 * 1024)).toFixed(1);
    throw new Error(`Original image (${sizeMb} MB) exceeds the 10 MB limit. Please select an image under 10 MB.`);
  }

  // Resolve user ID & previous Cloudinary publicId
  const effectiveUserId = options.userId || storage.getCurrentUserId() || 'anonymous_user';
  const previousPublicId =
    options.previousPublicId ||
    (options.previousImageUrl ? extractPublicId(options.previousImageUrl) : undefined);

  // Tier 1: Convex Temporary Storage + Sharp + Cloudinary Node Action
  try {
    options.onProgress?.('uploading');
    const uploadUrl = await withTimeout(
      convex.mutation(api.imageMutations.generateUploadUrl, {
        userId: effectiveUserId,
      }),
      10000,
      'Convex upload URL request timed out'
    );

    const postRes = await withTimeout(
      fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Content-Type': mimeType || 'image/jpeg',
        },
        body: fileBlob,
      }),
      15000,
      'Temporary storage upload timed out'
    );

    if (!postRes.ok) {
      throw new Error(`Failed to upload to temporary storage (${postRes.status}).`);
    }

    const { storageId } = await postRes.json();
    if (!storageId) {
      throw new Error('No storage ID returned from temporary staging.');
    }

    options.onProgress?.('processing');
    const result = await withTimeout(
      convex.action(api.images.processAndStoreImage, {
        storageId: storageId as Id<'_storage'>,
        userId: effectiveUserId,
        targetType: options.targetType || 'general',
        targetId: options.targetId,
        crop: options.crop,
        folder: options.folder || (options.targetType === 'puppy_profile' ? 'puplume/pets' : 'puplume/uploads'),
        previousPublicId,
      }),
      25000,
      'Cloudinary image processing timed out'
    );

    if (!result?.secureUrl || !result.secureUrl.startsWith('http')) {
      throw new Error('Convex upload completed without a valid Cloudinary HTTPS URL.');
    }

    options.onProgress?.('saving');
    return {
      url: result.secureUrl,
      publicId: result.publicId,
      width: result.width,
      height: result.height,
      format: result.format,
      size: result.size,
    };
  } catch (serverPipelineErr: any) {
    console.warn('[Upload Pipeline] Convex pipeline failed, falling back to /api/upload Cloudinary endpoint:', serverPipelineErr);

    // Tier 2: Browser crop/compress (<300KB WebP) -> /api/upload (Cloudinary Node SDK)
    options.onProgress?.('processing');
    const isProfileTarget = options.targetType === 'puppy_profile' || options.targetType === 'user_avatar';
    const maxDim = isProfileTarget ? 800 : 1600;
    try {
      const optimizedDataUrl = await optimizeImageInBrowser(fileBlob, options.crop, maxDim);
      options.onProgress?.('uploading');
      const apiResult = await uploadOptimizedViaApi(optimizedDataUrl, options, previousPublicId);
      options.onProgress?.('saving');
      return apiResult;
    } catch (apiFallbackErr: any) {
      console.error('[Upload Pipeline] Both Convex and /api/upload Cloudinary uploads failed:', apiFallbackErr);
      const isOffline = typeof navigator !== 'undefined' && !navigator.onLine;
      throw new Error(
        isOffline
          ? 'You appear to be offline. Please reconnect to upload this photo to Cloudinary.'
          : apiFallbackErr?.message || serverPipelineErr?.message || 'Cloudinary upload failed. Please try again.'
      );
    }
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
