import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const slug = String(req.query.slug || '').trim();
  const baseUrl = 'https://puplumepet.vercel.app';

  let title = 'PupLume — AI Puppy Manager & Digital Pet Passport';
  let description = 'Verified digital pet passport and smart safety collar tag on PupLume.';
  let imageUrl = `${baseUrl}/og-pup-preview.png`;
  const pageUrl = slug ? `${baseUrl}/pup/${encodeURIComponent(slug)}` : baseUrl;
  let found = false;

  if (slug) {
    try {
      const convexUrl = process.env.VITE_CONVEX_URL || 'https://energetic-partridge-407.convex.cloud';
      const response = await fetch(`${convexUrl}/api/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: 'puppies:getPublicPuppyByTag',
          args: { identifier: slug },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.status === 'success' && data.value) {
          const pup = data.value;
          found = true;
          title = `${pup.name}'s PupLume Pet Passport 🐾`;
          const breedText = pup.breed ? ` (${pup.breed})` : '';
          const temperText = pup.temperament ? ` • ${pup.temperament}` : '';
          description = `Meet ${pup.name}!${breedText}${temperText}. Verified digital pet passport & safety collar tag on PupLume.`;
          if (pup.photoUrl) {
            imageUrl = pup.photoUrl;
          }
        }
      }
    } catch (err) {
      console.error('Error querying Convex for OG preview:', err);
    }
  }

  // If not found and a slug was provided
  if (!found && slug) {
    title = 'Puppy Passport Not Found — PupLume';
    description = `No active puppy collar tag found for "${slug}". The link might be mistyped or unregistered.`;
    imageUrl = `${baseUrl}/og-pup-not-found.png`;
  }

  const userAgent = String(req.headers['user-agent'] || '');
  const isScraper = /facebookexternalhit|Facebot|Instagram|WhatsApp|Twitterbot|TelegramBot|Slackbot|Discordbot|LinkedInBot|Applebot|Googlebot|bingbot/i.test(userAgent);

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    
    <!-- OpenGraph / Instagram / WhatsApp / Facebook -->
    <meta property="og:site_name" content="PupLume" />
    <meta property="og:type" content="profile" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:url" content="${escapeHtml(pageUrl)}" />
    <meta property="og:image" content="${escapeHtml(imageUrl)}" />
    <meta property="og:image:secure_url" content="${escapeHtml(imageUrl)}" />
    <meta property="og:image:type" content="image/png" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${escapeHtml(title)}" />

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:site" content="@puplume" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${escapeHtml(imageUrl)}" />

    ${!isScraper ? `<meta http-equiv="refresh" content="0;url=/pup/${encodeURIComponent(slug)}" />` : ''}
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #FAF6F0; color: #2C211B; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 24px; text-align: center;">
    <div style="max-width: 440px; width: 100%; background: #FFFFFF; padding: 36px 28px; border-radius: 28px; box-shadow: 0 16px 36px rgba(44, 33, 27, 0.08); border: 2px solid #E8DDD3;">
      <img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(title)}" style="width: 140px; height: 140px; border-radius: 24px; object-fit: cover; margin-bottom: 20px; border: 3px solid #8B5E3C; box-shadow: 0 8px 20px rgba(0,0,0,0.12);" />
      <h1 style="font-size: 24px; font-weight: 800; margin: 0 0 8px 0; color: #2C211B;">${escapeHtml(title)}</h1>
      <p style="color: #766A63; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0;">${escapeHtml(description)}</p>
      <a href="/pup/${encodeURIComponent(slug)}" style="display: inline-block; background: #8B5E3C; color: #FFFFFF; padding: 14px 28px; border-radius: 16px; text-decoration: none; font-weight: 700; font-size: 14px; box-shadow: 0 4px 12px rgba(139, 94, 60, 0.3);">Open Digital Passport &rarr;</a>
    </div>
    <script>
      if (window.location.pathname.startsWith('/api/')) {
        window.location.replace('/pup/${encodeURIComponent(slug)}');
      }
    </script>
  </body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600');
  res.status(200).send(html);
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
