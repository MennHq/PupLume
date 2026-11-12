import type { VercelRequest, VercelResponse } from '@vercel/node';
import { uploadToCloudinary } from '../src/server/cloudinaryService';
import {
  applyCorsHeaders,
  handlePreflight,
  parseMultipartUpload,
  readStreamWithLimit,
  sanitizeErrorMessage,
} from './_utils';

// Disable default bodyParser to allow streaming Busboy multipart & bounded JSON reads
export const config = {
  api: {
    bodyParser: false,
  },
};

const MAX_JSON_PAYLOAD_BYTES = 15 * 1024 * 1024; // 15MB limit for base64 image data
const MAX_MULTIPART_FILE_BYTES = 10 * 1024 * 1024; // 10MB limit for raw image files

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/heic',
  'image/heif',
  'image/avif',
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. CORS headers & preflight handling
  applyCorsHeaders(res, 'POST, OPTIONS');
  if (handlePreflight(req, res, 'POST, OPTIONS')) {
    return;
  }

  // 2. HTTP Method validation
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const contentType = (req.headers['content-type'] as string) || '';

  try {
    let fileData: string = '';
    let folder: string = 'puplume/pets';
    let tags: string[] = ['puplume', 'pets'];
    let previousImageUrl: string | undefined;
    let previousPublicId: string | undefined;

    // 3. Handle Multipart / Form-Data (Busboy Stream Parsing)
    if (contentType.includes('multipart/form-data')) {
      const parsed = await parseMultipartUpload(req, {
        maxFileSize: MAX_MULTIPART_FILE_BYTES,
        allowedMimeTypes: ALLOWED_MIME_TYPES,
        maxFields: 10,
      });

      if (!parsed.file || !parsed.file.buffer || parsed.file.buffer.length === 0) {
        return res.status(400).json({ error: 'No image file uploaded in request' });
      }

      // Convert buffer into base64 data URI for Cloudinary SDK
      const mime = parsed.file.mimeType || 'image/jpeg';
      fileData = `data:${mime};base64,${parsed.file.buffer.toString('base64')}`;

      // Free buffer memory immediately
      (parsed.file as any).buffer = null;

      if (parsed.fields.folder && typeof parsed.fields.folder === 'string') {
        const sanitizedFolder = parsed.fields.folder.replace(/[^a-zA-Z0-9_\-\/]/g, '').slice(0, 100);
        if (sanitizedFolder) folder = sanitizedFolder;
      }

      if (parsed.fields.tags) {
        tags = parsed.fields.tags
          .split(',')
          .map((t) => t.trim().slice(0, 50))
          .filter(Boolean);
      }

      if (parsed.fields.previousImageUrl && typeof parsed.fields.previousImageUrl === 'string') {
        previousImageUrl = parsed.fields.previousImageUrl.slice(0, 500);
      }

      if (parsed.fields.previousPublicId && typeof parsed.fields.previousPublicId === 'string') {
        previousPublicId = parsed.fields.previousPublicId.slice(0, 300);
      }
    }
    // 4. Handle Application / JSON
    else if (contentType.includes('application/json')) {
      let rawJsonBuffer: Buffer;
      try {
        rawJsonBuffer = await readStreamWithLimit(req, MAX_JSON_PAYLOAD_BYTES);
      } catch (err: any) {
        return res.status(413).json({ error: 'Payload size exceeds 15MB limit' });
      }

      let body: any;
      try {
        body = JSON.parse(rawJsonBuffer.toString('utf8'));
      } catch {
        return res.status(400).json({ error: 'Malformed JSON payload' });
      }

      if (!body || typeof body !== 'object') {
        return res.status(400).json({ error: 'Invalid JSON body format' });
      }

      if (!body.file || typeof body.file !== 'string' || body.file.trim().length === 0) {
        return res.status(400).json({ error: 'No image file or data URI provided' });
      }

      fileData = body.file.trim();

      if (body.folder && typeof body.folder === 'string') {
        const sanitizedFolder = body.folder.replace(/[^a-zA-Z0-9_\-\/]/g, '').slice(0, 100);
        if (sanitizedFolder) folder = sanitizedFolder;
      }

      if (Array.isArray(body.tags)) {
        tags = body.tags
          .filter((t: any) => typeof t === 'string')
          .map((t: string) => t.trim().slice(0, 50))
          .filter(Boolean);
      }

      if (body.previousImageUrl && typeof body.previousImageUrl === 'string') {
        previousImageUrl = body.previousImageUrl.slice(0, 500);
      }

      if (body.previousPublicId && typeof body.previousPublicId === 'string') {
        previousPublicId = body.previousPublicId.slice(0, 300);
      }
    } else {
      return res.status(415).json({
        error: 'Unsupported Media Type: expected multipart/form-data or application/json',
      });
    }

    // 5. Cloudinary Upload Execution
    const result = await uploadToCloudinary(fileData, {
      folder,
      tags: tags.length > 0 ? tags : ['puplume', 'pets'],
      previousImageUrl,
      previousPublicId,
    });

    // Clear fileData reference to allow garbage collection
    fileData = '';

    return res.status(200).json({
      success: true,
      url: result.url,
      publicId: result.publicId,
      width: result.width,
      height: result.height,
      format: result.format,
    });
  } catch (error: any) {
    console.error('[API upload] Error:', error);
    const safeError = sanitizeErrorMessage(error, 'Image upload failed. Please try again.');
    return res.status(500).json({ error: safeError });
  }
}
