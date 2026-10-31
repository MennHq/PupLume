/**
 * Client-side Cloudinary Upload Utility
 * Uploads photos (puppy avatar, journal photos, health docs, etc.) directly via the server-side Cloudinary proxy
 * and returns permanent HTTPS Cloudinary URLs to store in the database.
 */

export interface UploadResult {
  url: string;
  publicId?: string;
  width?: number;
  height?: number;
  format?: string;
}

export function readFileAsDataUrl(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

export async function uploadImageToCloudinary(
  fileOrBase64: File | Blob | string,
  options: {
    folder?: string;
    tags?: string[];
    previousImageUrl?: string;
    previousPublicId?: string;
  } = {}
): Promise<UploadResult> {
  let base64Data: string;

  if (typeof fileOrBase64 === 'string') {
    base64Data = fileOrBase64;
  } else {
    base64Data = await readFileAsDataUrl(fileOrBase64);
  }

  const folder = options.folder || 'puplume/pets';

  try {
    const response = await fetch('/api/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        file: base64Data,
        folder,
        tags: options.tags || ['puplume'],
        previousImageUrl: options.previousImageUrl,
        previousPublicId: options.previousPublicId,
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `Upload failed with status ${response.status}`);
    }

    const data = await response.json();
    if (!data.url) {
      throw new Error('No image URL returned from Cloudinary');
    }

    return {
      url: data.url,
      publicId: data.publicId,
      width: data.width,
      height: data.height,
      format: data.format,
    };
  } catch (error: any) {
    console.error('[Cloudinary Client] Error uploading to Cloudinary:', error);
    throw error;
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
 * Permanently deletes an image from Cloudinary (called when user removes or swaps photos)
 */
export async function deleteImageFromCloudinary(urlOrPublicId: string): Promise<boolean> {
  if (!urlOrPublicId) return false;
  try {
    const response = await fetch('/api/cloudinary/delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: urlOrPublicId }),
    });
    const data = await response.json().catch(() => ({}));
    return Boolean(data.success);
  } catch (err) {
    console.warn('[Cloudinary Client] Failed to delete image:', err);
    return false;
  }
}
