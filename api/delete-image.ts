import type { VercelRequest, VercelResponse } from '@vercel/node';
import { deleteFromCloudinary } from '../src/server/cloudinaryService';
import {
  applyCorsHeaders,
  handlePreflight,
  readStreamWithLimit,
  sanitizeErrorMessage,
} from './_utils';

export const config = {
  api: {
    bodyParser: false,
  },
};

const MAX_PAYLOAD_BYTES = 100 * 1024; // 100KB maximum for delete requests

const PROTECTED_TARGETS = [
  'puplume_logo',
  'pupcollar_logo',
  'branding/',
  'system/',
  'assets/',
  'og-',
  'favicon',
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

  try {
    // 3. Read body with size bounds
    let rawBuffer: Buffer;
    try {
      rawBuffer = await readStreamWithLimit(req, MAX_PAYLOAD_BYTES);
    } catch {
      return res.status(413).json({ error: 'Payload size exceeds 100KB limit' });
    }

    let body: any;
    try {
      body = JSON.parse(rawBuffer.toString('utf8'));
    } catch {
      return res.status(400).json({ error: 'Malformed JSON payload' });
    }

    const { url, publicId } = body || {};
    const rawTarget = url || publicId;

    if (!rawTarget || typeof rawTarget !== 'string' || rawTarget.trim().length === 0) {
      return res.status(400).json({ error: 'No image url or publicId provided' });
    }

    const target = rawTarget.trim();

    if (target.length > 1024) {
      return res.status(400).json({ error: 'Target identifier is too long' });
    }

    // Protect system assets (exact brand names or protected asset paths)
    const lowerTarget = target.toLowerCase();
    if (lowerTarget === 'puplume' || lowerTarget === 'pupcollar') {
      return res.status(403).json({ error: 'Deletion of protected assets is prohibited' });
    }
    for (const protectedPrefix of PROTECTED_TARGETS) {
      if (lowerTarget.includes(protectedPrefix)) {
        return res.status(403).json({ error: 'Deletion of protected assets is prohibited' });
      }
    }

    // 4. Perform Cloudinary Deletion
    const result = await deleteFromCloudinary(target);
    return res.status(200).json({
      success: result.success,
      result: result.result || (result.success ? 'ok' : 'failed'),
    });
  } catch (error: any) {
    console.error('[API delete-image] Error:', error);
    const safeError = sanitizeErrorMessage(error, 'Image deletion failed');
    return res.status(500).json({ error: safeError });
  }
}
