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
  const folder = options.folder || 'puplume/pets';
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'puplume';
  const apiKey = import.meta.env.VITE_CLOUDINARY_API_KEY || '676714719837168';
  const apiSecret = 'OdMstlADoBFXHObvTBGhUR091Lk';

  // Attempt direct signed upload to Cloudinary (fastest, supports large files, no serverless limits)
  try {
    const timestamp = Math.round(Date.now() / 1000);
    const strToSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
    
    // Compute SHA-1 signature using browser-native WebCrypto
    const encoder = new TextEncoder();
    const hashBuf = await crypto.subtle.digest('SHA-1', encoder.encode(strToSign));
    const signature = Array.from(new Uint8Array(hashBuf))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    const formData = new FormData();
    if (fileOrBase64 instanceof Blob || fileOrBase64 instanceof File) {
      formData.append('file', fileOrBase64);
    } else {
      formData.append('file', fileOrBase64);
    }
    formData.append('api_key', apiKey);
    formData.append('timestamp', timestamp.toString());
    formData.append('folder', folder);
    formData.append('signature', signature);

    const directRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData,
    });

    if (directRes.ok) {
      const data = await directRes.json();
      if (data?.secure_url || data?.url) {
        // If there was a previous image, asynchronously trigger delete
        const previousTarget = options.previousImageUrl || options.previousPublicId;
        if (previousTarget) {
          deleteImageFromCloudinary(previousTarget).catch(() => {});
        }
        return {
          url: data.secure_url || data.url,
          publicId: data.public_id,
          width: data.width,
          height: data.height,
          format: data.format,
        };
      }
    }
  } catch (directErr) {
    console.warn('[Cloudinary Direct Upload] Direct upload error, trying proxy fallback:', directErr);
  }

  // Fallback to server-side proxy endpoint
  let base64Data: string;
  if (typeof fileOrBase64 === 'string') {
    base64Data = fileOrBase64;
  } else {
    base64Data = await readFileAsDataUrl(fileOrBase64);
  }

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
