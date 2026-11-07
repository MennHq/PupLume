import type { VercelRequest, VercelResponse } from '@vercel/node';
import Busboy from 'busboy';
import { uploadToCloudinary } from '../src/server/cloudinaryService';

// Disable default Vercel body parser so busboy can stream the multipart/form-data
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // If GET request, cleanly redirect to journal
  if (req.method !== 'POST') {
    res.writeHead(303, { Location: '/journal?action=shared-media' });
    return res.end();
  }

  const contentType = req.headers['content-type'] || '';
  if (!contentType.includes('multipart/form-data')) {
    res.writeHead(303, { Location: '/journal?action=shared-media' });
    return res.end();
  }

  try {
    let fileBuffer: Buffer | null = null;
    let mimeType = 'image/jpeg';
    let title = '';
    let text = '';

    await new Promise<void>((resolve, reject) => {
      const busboy = Busboy({ headers: req.headers });

      busboy.on('file', (_name, file, info) => {
        mimeType = info.mimeType || 'image/jpeg';
        const chunks: Buffer[] = [];
        file.on('data', (data) => chunks.push(data));
        file.on('end', () => {
          fileBuffer = Buffer.concat(chunks);
        });
      });

      busboy.on('field', (name, val) => {
        if (name === 'title') title = val;
        if (name === 'text') text = val;
      });

      busboy.on('finish', () => resolve());
      busboy.on('error', (err) => reject(err));

      req.pipe(busboy);
    });

    const photoTitle = title || text || 'Puppy Photo Memory';

    // 1. Try uploading to Cloudinary
    if (fileBuffer) {
      const base64Data = `data:${mimeType};base64,${(fileBuffer as Buffer).toString('base64')}`;
      try {
        const uploadResult = await uploadToCloudinary(base64Data, {
          folder: 'puplume/journal',
          tags: ['puplume', 'share-target', 'journal']
        });

        if (uploadResult?.url) {
          const redirectUrl = `/journal?action=shared-media&sharedPhotoUrl=${encodeURIComponent(
            uploadResult.url
          )}&title=${encodeURIComponent(photoTitle)}`;
          res.writeHead(303, { Location: redirectUrl });
          return res.end();
        }
      } catch (cloudErr) {
        console.warn('[ShareTarget API] Cloudinary upload fallback to client cache:', cloudErr);
      }

      // 2. Fallback: Return client-side script that populates the PWA cache and redirects
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.end(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
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
    }
  </style>
</head>
<body>
  <h2>Importing shared photo into PupLume...</h2>
  <script>
    (async function() {
      try {
        var base64 = ${JSON.stringify(base64Data)};
        var res = await fetch(base64);
        var blob = await res.blob();
        if ('caches' in window) {
          var cache = await caches.open('puplume-shared-media');
          await cache.put('/shared-media-latest', new Response(blob, {
            headers: {
              'content-type': ${JSON.stringify(mimeType)},
              'x-shared-title': encodeURIComponent(${JSON.stringify(photoTitle)})
            }
          }));
        }
      } catch(e) {
        console.warn('Cache write note:', e);
      }
      window.location.replace('/journal?action=shared-media');
    })();
  </script>
</body>
</html>`);
    }

    // No file was included in the share
    res.writeHead(303, { Location: '/journal?action=shared-media' });
    return res.end();
  } catch (err: any) {
    console.error('[ShareTarget API] Error processing share request:', err);
    res.writeHead(303, { Location: '/journal?action=shared-media' });
    return res.end();
  }
}
