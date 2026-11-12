import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  applyCorsHeaders,
  handlePreflight,
  readStreamWithLimit,
  verifyPaddleWebhookSignature,
  sanitizeErrorMessage,
} from '../_utils';

// Disable default Vercel body parser to verify raw webhook HMAC signature
export const config = {
  api: {
    bodyParser: false,
  },
};

const MAX_PAYLOAD_BYTES = 1024 * 1024; // 1MB maximum webhook payload

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. CORS headers & OPTIONS preflight
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
    // 3. Read raw stream with strict size limit to prevent DoS
    let rawBodyBuffer: Buffer;
    try {
      rawBodyBuffer = await readStreamWithLimit(req, MAX_PAYLOAD_BYTES);
    } catch (sizeErr: any) {
      return res.status(413).json({ error: 'Payload too large (max 1MB)' });
    }

    if (!rawBodyBuffer || rawBodyBuffer.length === 0) {
      return res.status(400).json({ error: 'Empty payload received' });
    }

    // 4. Verify Paddle Webhook Signature with timing-safe comparison
    const signatureHeader =
      (req.headers['paddle-signature'] as string) ||
      (req.headers['Paddle-Signature'] as string) ||
      null;

    const secretKey = process.env.PADDLE_WEBHOOK_SECRET;

    // Strict validation: Webhook secret MUST be configured. Reject forged events!
    if (!secretKey || secretKey.trim().length === 0) {
      console.error('[Paddle Webhook] Insecure configuration: PADDLE_WEBHOOK_SECRET is missing');
      return res.status(500).json({ error: 'Webhook signature verification unavailable' });
    }

    const verification = verifyPaddleWebhookSignature(
      rawBodyBuffer,
      signatureHeader,
      secretKey,
      300 // 5-minute replay tolerance
    );

    if (!verification.isValid) {
      console.warn(`[Paddle Webhook] Rejected unauthorized event: ${verification.reason}`);
      return res.status(401).json({ error: 'Invalid webhook signature' });
    }

    // 5. Parse and validate JSON payload
    let payload: any;
    try {
      payload = JSON.parse(rawBodyBuffer.toString('utf8'));
    } catch (jsonErr) {
      return res.status(400).json({ error: 'Malformed JSON payload' });
    }

    if (!payload || typeof payload !== 'object' || !payload.event_type) {
      return res.status(422).json({ error: 'Invalid Paddle event schema' });
    }

    const eventType = String(payload.event_type);
    const eventId = payload.event_id ? String(payload.event_id) : undefined;
    console.log(`[Paddle Webhook] Verified event: ${eventType} (${eventId || 'no-id'})`);

    // 6. Forward verified event to Convex HTTP router if configured
    const convexUrl = process.env.CONVEX_SITE_URL || process.env.VITE_CONVEX_URL;
    if (convexUrl) {
      try {
        const httpSiteUrl = convexUrl.replace(/\.convex\.cloud\/?$/, '.convex.site');
        await fetch(`${httpSiteUrl}/paddle-webhook`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Paddle-Signature': signatureHeader || '',
          },
          body: rawBodyBuffer.toString('utf8'),
        });
      } catch (forwardErr) {
        console.warn('[Paddle Webhook] Note on Convex forwarding:', (forwardErr as Error)?.message);
      }
    }

    return res.status(200).json({
      received: true,
      eventType,
      eventId,
    });
  } catch (error: any) {
    console.error('[Paddle Webhook Error]:', error);
    const safeMsg = sanitizeErrorMessage(error, 'Webhook processing failed');
    return res.status(500).json({ error: safeMsg });
  }
}
