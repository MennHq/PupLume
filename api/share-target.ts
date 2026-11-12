import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  parseMultipartUpload,
  safeJsonScriptEmbed,
  sanitizeErrorMessage,
} from './_utils';

// Disable default Vercel body parser so busboy can stream the multipart/form-data
export const config = {
  api: {
    bodyParser: false,
  },
};

const REDIRECT_URL = '/journal?action=shared-media';
const MAX_SHARE_FILE_BYTES = 10 * 1024 * 1024; // 10MB limit

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
  // If GET or not POST request, cleanly redirect to journal
  if (req.method !== 'POST') {
    res.writeHead(303, { Location: REDIRECT_URL });
    return res.end();
  }

  const contentType = (req.headers['content-type'] as string) || '';
  if (!contentType.includes('multipart/form-data')) {
    res.writeHead(303, { Location: REDIRECT_URL });
    return res.end();
  }

  try {
    const parsed = await parseMultipartUpload(req, {
      maxFileSize: MAX_SHARE_FILE_BYTES,
      allowedMimeTypes: ALLOWED_MIME_TYPES,
      maxFields: 10,
    });

    const file = parsed.file;
    const title = (parsed.fields.title || '').trim().slice(0, 200);
    const text = (parsed.fields.text || '').trim().slice(0, 500);
    const photoTitle = title || text || 'Puppy Photo Memory';

    if (file && file.buffer && file.buffer.length > 0) {
      const mimeType = file.mimeType || 'image/jpeg';
      const base64Data = `data:${mimeType};base64,${file.buffer.toString('base64')}`;

      // Free buffer memory immediately
      (file as any).buffer = null;

      // Safe JSON embeds for script tag to prevent reflected XSS
      const safeBase64 = safeJsonScriptEmbed(base64Data);
      const safeMime = safeJsonScriptEmbed(mimeType);
      const safeTitle = safeJsonScriptEmbed(photoTitle);

      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'SAMEORIGIN');

      return res.end(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Opening PupLume...</title>
  <style>
    body {
      background: #FFF9F2;
      color: #8B5E3C;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      margin: 0;
      text-align: center;
      padding: 20px;
    }
  </style>
</head>
<body>
  <p>Importing shared photo into PupLume...</p>
  <script>
    (async function() {
      try {
        var base64 = ${safeBase64};
        var res = await fetch(base64);
        var blob = await res.blob();
        if ('caches' in window) {
          var cache = await caches.open('puplume-shared-media');
          await cache.put('/shared-media-latest', new Response(blob, {
            headers: {
              'content-type': ${safeMime},
              'x-shared-title': encodeURIComponent(${safeTitle})
            }
          }));
        }
      } catch(e) {
        console.warn('Cache write error:', e);
      }
      window.location.replace(${safeJsonScriptEmbed(REDIRECT_URL)});
    })();
  </script>
</body>
</html>`);
    }

    // No valid file buffer received
    res.writeHead(303, { Location: REDIRECT_URL });
    return res.end();
  } catch (err: any) {
    console.error('[ShareTarget API] Error processing share request:', sanitizeErrorMessage(err));
    res.writeHead(303, { Location: REDIRECT_URL });
    return res.end();
  }
}
