import type { VercelRequest, VercelResponse } from '@vercel/node';
import { processAIChat } from '../../src/server/geminiService';
import {
  applyCorsHeaders,
  handlePreflight,
  readStreamWithLimit,
  sanitizeErrorMessage,
} from '../_utils';

export const config = {
  api: {
    bodyParser: false,
  },
};

const MAX_PAYLOAD_BYTES = 1024 * 1024; // 1MB payload limit

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
    // 3. Read body with size limits
    let rawBuffer: Buffer;
    try {
      rawBuffer = await readStreamWithLimit(req, MAX_PAYLOAD_BYTES);
    } catch {
      return res.status(413).json({ error: 'Payload size exceeds 1MB limit' });
    }

    let payload: any;
    try {
      payload = JSON.parse(rawBuffer.toString('utf8'));
    } catch {
      return res.status(400).json({ error: 'Malformed JSON payload' });
    }

    if (!payload || typeof payload !== 'object') {
      return res.status(400).json({ error: 'Invalid JSON payload: expected object' });
    }

    const { message, puppyContext } = payload;
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ error: 'Field "message" is required and cannot be empty' });
    }

    if (message.length > 8000) {
      return res.status(400).json({ error: 'Message exceeds maximum length of 8000 characters' });
    }

    // Sanitize and bound payload
    const safePayload = {
      message: message.trim(),
      puppyContext: puppyContext && typeof puppyContext === 'object' ? puppyContext : {},
      userId: typeof payload.userId === 'string' ? payload.userId.slice(0, 100) : undefined,
    };

    const result = await processAIChat(safePayload as any);
    return res.status(200).json(result);
  } catch (err: any) {
    console.error('[API ai/assistant] Error:', sanitizeErrorMessage(err));
    const safeMsg = sanitizeErrorMessage(
      err,
      'The AI assistant is temporarily unavailable. Please try again shortly.'
    );
    return res.status(500).json({ error: safeMsg });
  }
}
