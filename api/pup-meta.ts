import type { VercelRequest, VercelResponse } from '@vercel/node';
import fs from 'fs';
import path from 'path';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const rawSlug = String(req.query.slug || '').trim();
  const slug = rawSlug.toLowerCase();
  const baseUrl = 'https://puplumepet.vercel.app';

  let title = 'PupLume — AI Puppy Manager & Digital Pet Passport';
  let description = 'Verified digital pet passport and smart safety collar tag on PupLume.';
  // Default to the designed high-res OpenGraph card
  let imageUrl = `${baseUrl}/og-pup-preview.png?v=2`;
  const pageUrl = rawSlug ? `${baseUrl}/pup/${encodeURIComponent(rawSlug)}` : baseUrl;
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
          
          // Use the real designed preview card for Graxzo, or the universal designed passport card
          if (slug === 'graxzo' || pup.name.toLowerCase() === 'graxzo') {
            imageUrl = `${baseUrl}/og-graxzo.png?v=2`;
          } else {
            imageUrl = `${baseUrl}/og-pup-preview.png?v=2`;
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
    description = `No active puppy collar tag found for "${rawSlug}". The link might be mistyped or unregistered.`;
    imageUrl = `${baseUrl}/og-pup-not-found.png?v=2`;
  }

  // Detect whether this is a crawler or human browser
  const userAgent = String(req.headers['user-agent'] || '');
  const isCrawler = /facebookexternalhit|Facebot|Meta-External|Instagram|WhatsApp|Twitterbot|TelegramBot|Slackbot|Discordbot|LinkedInBot|Applebot|Googlebot|bingbot|Baiduspider|YandexBot/i.test(userAgent);

  // If request is from a human browser, attempt to serve the built index.html with meta tags injected
  if (!isCrawler) {
    try {
      const distIndexPath = path.join(process.cwd(), 'dist', 'index.html');
      if (fs.existsSync(distIndexPath)) {
        let indexHtml = fs.readFileSync(distIndexPath, 'utf8');

        // Inject dynamic tags into index.html
        indexHtml = indexHtml.replace(/<title>.*?<\/title>/, `<title>${escapeHtml(title)}</title>`);
        indexHtml = indexHtml.replace(/<meta property="og:title" content=".*?" \/>/, `<meta property="og:title" content="${escapeHtml(title)}" />`);
        indexHtml = indexHtml.replace(/<meta property="og:description" content=".*?" \/>/, `<meta property="og:description" content="${escapeHtml(description)}" />`);
        indexHtml = indexHtml.replace(/<meta property="og:url" content=".*?" \/>/, `<meta property="og:url" content="${escapeHtml(pageUrl)}" />`);
        indexHtml = indexHtml.replace(/<meta property="og:image" content=".*?" \/>/, `<meta property="og:image" content="${escapeHtml(imageUrl)}" />`);
        indexHtml = indexHtml.replace(/<meta property="og:image:secure_url" content=".*?" \/>/, `<meta property="og:image:secure_url" content="${escapeHtml(imageUrl)}" />`);
        indexHtml = indexHtml.replace(/<meta name="twitter:title" content=".*?" \/>/, `<meta name="twitter:title" content="${escapeHtml(title)}" />`);
        indexHtml = indexHtml.replace(/<meta name="twitter:description" content=".*?" \/>/, `<meta name="twitter:description" content="${escapeHtml(description)}" />`);
        indexHtml = indexHtml.replace(/<meta name="twitter:image" content=".*?" \/>/, `<meta name="twitter:image" content="${escapeHtml(imageUrl)}" />`);

        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600');
        return res.status(200).send(indexHtml);
      }
    } catch (e) {
      // Fallback to crawler HTML if dist/index.html is not accessible
    }
  }

  // Pure HTML response with complete OpenGraph & Twitter tags for Meta/Instagram/WhatsApp/Twitter
  const html = `<!doctype html>
<html lang="en" prefix="og: https://ogp.me/ns#">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <link rel="canonical" href="${escapeHtml(pageUrl)}" />
    
    <!-- OpenGraph / Instagram / WhatsApp / Facebook -->
    <meta property="og:site_name" content="PupLume" />
    <meta property="og:type" content="website" />
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
    <meta name="twitter:image:alt" content="${escapeHtml(title)}" />

    ${!isCrawler ? `<meta http-equiv="refresh" content="0;url=/pup/${encodeURIComponent(rawSlug)}" />` : ''}
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #FAF6F0; color: #2C211B; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 24px; text-align: center;">
    <div style="max-width: 500px; width: 100%; background: #FFFFFF; padding: 36px 28px; border-radius: 28px; box-shadow: 0 16px 36px rgba(44, 33, 27, 0.08); border: 2px solid #E8DDD3;">
      <img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(title)}" style="width: 100%; max-width: 440px; height: auto; border-radius: 20px; object-fit: cover; margin-bottom: 20px; border: 2px solid #8B5E3C; box-shadow: 0 8px 20px rgba(0,0,0,0.12);" />
      <h1 style="font-size: 24px; font-weight: 800; margin: 0 0 8px 0; color: #2C211B;">${escapeHtml(title)}</h1>
      <p style="color: #766A63; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0;">${escapeHtml(description)}</p>
      <a href="/pup/${encodeURIComponent(rawSlug)}" style="display: inline-block; background: #8B5E3C; color: #FFFFFF; padding: 14px 28px; border-radius: 16px; text-decoration: none; font-weight: 700; font-size: 14px; box-shadow: 0 4px 12px rgba(139, 94, 60, 0.3);">Open Digital Passport &rarr;</a>
    </div>
    <script>
      if (window.location.pathname.startsWith('/api/')) {
        window.location.replace('/pup/${encodeURIComponent(rawSlug)}');
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
