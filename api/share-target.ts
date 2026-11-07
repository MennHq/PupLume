import type { VercelRequest, VercelResponse } from '@vercel/node';
import Busboy from 'busboy';

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
      try {
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
      } catch (bbErr) {
        reject(bbErr);
      }
    });

    const photoTitle = title || text || 'Puppy Photo Memory';

    if (fileBuffer) {
      const base64Data = `data:${mimeType};base64,${(fileBuffer as Buffer).toString('base64')}`;

      // Return client-side script that populates the PWA cache and redirects to journal
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.end(`<!DOCTYPE html>
<html>
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
        console.warn('Cache write error:', e);
      }
      window.location.replace('/journal?action=shared-media');
    })();
  </script>
</body>
</html>`);
    }

    // No file buffer received
    res.writeHead(303, { Location: '/journal?action=shared-media' });
    return res.end();
  } catch (err: any) {
    console.error('[ShareTarget API] Error processing share request:', err);
    res.writeHead(303, { Location: '/journal?action=shared-media' });
    return res.end();
  }
}
