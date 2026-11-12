import type { VercelRequest, VercelResponse } from '@vercel/node';
import fs from 'fs';
import path from 'path';

function escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const hostHeader = req.headers['x-forwarded-host'] || req.headers.host || 'puplumepet.vercel.app';
  const host = Array.isArray(hostHeader) ? hostHeader[0] : hostHeader;

  // Extract slug from query or path
  let rawSlug = String(req.query.slug || '').trim();
  if (!rawSlug && req.url) {
    const urlParts = req.url.split('?')[0].split('/').filter(Boolean);
    if (urlParts[0] === 'pup' || urlParts[0] === 'safety') {
      rawSlug = urlParts[1] || '';
    } else if (urlParts[0] && !urlParts[0].startsWith('api')) {
      rawSlug = urlParts[0];
    }
  }

  const cleanSlug = rawSlug
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/^-+|-+$/g, '') || 'puppy';

  const baseUrl = `https://${host}`;
  const pageUrl = `${baseUrl}/${encodeURIComponent(cleanSlug)}`;
  const ogImageUrl = `${baseUrl}/api/og/pup?slug=${encodeURIComponent(cleanSlug)}&v=4`;

  let title = 'PupLume — Verified Digital Pet Passport';
  let description = 'Verified digital pet passport and smart safety collar tag on PupLume 🐾';
  let pup: any = null;

  // 1. Query Convex database for puppy profile
  try {
    const convexUrl = process.env.VITE_CONVEX_URL || 'https://energetic-partridge-407.convex.cloud';
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);

    const response = await fetch(`${convexUrl}/api/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: 'puppies:getPublicPuppyByTag',
        args: { identifier: cleanSlug },
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (response.ok) {
      const data = await response.json();
      if (data && data.status === 'success' && data.value) {
        pup = data.value;
      }
    }
  } catch (err) {
    console.warn('[pup-meta] Error querying Convex for puppy:', err);
  }

  // 2. Demo fallback if puppy isn't in Convex yet
  if (!pup) {
    const isGraxzo = cleanSlug.includes('graxzo') || cleanSlug.includes('graxo');
    const isLeo = cleanSlug.includes('leo');
    const isBella = cleanSlug.includes('bella');

    if (isGraxzo) {
      const displayName = cleanSlug.charAt(0).toUpperCase() + cleanSlug.slice(1);
      pup = {
        name: displayName,
        breed: 'German Shepherd',
        isLost: false,
      };
    } else if (isLeo) {
      pup = {
        name: 'Leo',
        breed: 'Golden Retriever',
        isLost: false,
      };
    } else if (isBella) {
      pup = {
        name: 'Bella',
        breed: 'French Bulldog',
        isLost: false,
      };
    } else if (cleanSlug && cleanSlug !== 'puppy') {
      const displayName = cleanSlug.charAt(0).toUpperCase() + cleanSlug.slice(1);
      pup = {
        name: displayName,
        breed: 'Canine Companion',
        isLost: false,
      };
    }
  }

  if (pup) {
    if (pup.isLost) {
      title = `🚨 MISSING PUPPY ALERT: ${pup.name}`;
      const rewardText = pup.rewardAmount ? ` Reward: $${pup.rewardAmount}!` : '';
      description = `EMERGENCY: ${pup.name} is reported missing!${rewardText} Check live safety & contact information on PupLume.`;
    } else {
      title = `${pup.name}'s PupLume Pet Passport 🐾`;
      const breedText = pup.breed ? ` (${pup.breed})` : '';
      description = `Meet ${pup.name}!${breedText}. Verified digital pet passport & safety collar tag on PupLume.`;
    }
  }

  // 3. Crawler detection
  const userAgent = String(req.headers['user-agent'] || '');
  const isCrawler = /facebookexternalhit|Facebot|Meta-External|Instagram|WhatsApp|Twitterbot|Xbot|TelegramBot|Slackbot|Discordbot|LinkedInBot|Applebot|Googlebot|bingbot|Baiduspider|YandexBot/i.test(userAgent);

  // If request is from a social crawler, return rich SEO meta tags immediately
  if (isCrawler) {
    const crawlerHtml = `<!doctype html>
<html lang="en" prefix="og: https://ogp.me/ns#">
  <head>
    <meta charset="UTF-8" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <meta name="robots" content="index, follow, max-image-preview:large" />

    <!-- OpenGraph Meta Tags -->
    <meta property="og:site_name" content="PupLume" />
    <meta property="og:type" content="profile" />
    <meta property="og:url" content="${escapeHtml(pageUrl)}" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:image" content="${escapeHtml(ogImageUrl)}" />
    <meta property="og:image:secure_url" content="${escapeHtml(ogImageUrl)}" />
    <meta property="og:image:type" content="image/png" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${escapeHtml(title)}" />

    <!-- Twitter Card Meta Tags (Explicit for X / Twitter) -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:site" content="@puplume" />
    <meta name="twitter:domain" content="${escapeHtml(host)}" />
    <meta name="twitter:url" content="${escapeHtml(pageUrl)}" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${escapeHtml(ogImageUrl)}" />
    <meta name="twitter:image:alt" content="${escapeHtml(title)}" />
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #FFF9F2; color: #2C211B; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 24px; box-sizing: border-box; text-align: center;">
    <div style="max-width: 520px; background: #FFFFFF; border-radius: 28px; padding: 32px; box-shadow: 0 12px 36px rgba(74, 46, 27, 0.08); border: 1.5px solid #F0E6DA;">
      <img src="${escapeHtml(ogImageUrl)}" alt="${escapeHtml(title)}" style="width: 100%; border-radius: 20px; margin-bottom: 24px; display: block;" />
      <h1 style="font-size: 24px; font-weight: 800; margin: 0 0 12px 0; color: #2C211B;">${escapeHtml(title)}</h1>
      <p style="font-size: 15px; color: #6F5E53; line-height: 1.5; margin: 0 0 24px 0;">${escapeHtml(description)}</p>
      <a href="/${encodeURIComponent(cleanSlug)}" style="display: inline-block; background: #8B5E3C; color: #FFFFFF; padding: 14px 28px; border-radius: 16px; text-decoration: none; font-weight: 700; font-size: 15px; box-shadow: 0 4px 14px rgba(139, 94, 60, 0.3);">Open Digital Passport &rarr;</a>
    </div>
  </body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600');
    return res.status(200).send(crawlerHtml);
  }

  // 4. For human browsers: serve index.html with meta tags injected
  try {
    const cwd = process.cwd();
    const distIndexPath = path.join(cwd, 'dist', 'index.html');
    const rootIndexPath = path.join(cwd, 'index.html');
    const targetFile = fs.existsSync(distIndexPath) ? distIndexPath : rootIndexPath;

    if (fs.existsSync(targetFile)) {
      let indexHtml = fs.readFileSync(targetFile, 'utf8');

      // Replace or inject title and meta tags
      indexHtml = indexHtml.replace(/<title>.*?<\/title>/i, `<title>${escapeHtml(title)}</title>`);
      indexHtml = indexHtml.replace(/<meta\s+property="og:title"\s+content=".*?"\s*\/?>/i, `<meta property="og:title" content="${escapeHtml(title)}" />`);
      indexHtml = indexHtml.replace(/<meta\s+property="og:description"\s+content=".*?"\s*\/?>/i, `<meta property="og:description" content="${escapeHtml(description)}" />`);
      indexHtml = indexHtml.replace(/<meta\s+property="og:url"\s+content=".*?"\s*\/?>/i, `<meta property="og:url" content="${escapeHtml(pageUrl)}" />`);
      indexHtml = indexHtml.replace(/<meta\s+property="og:image"\s+content=".*?"\s*\/?>/i, `<meta property="og:image" content="${escapeHtml(ogImageUrl)}" />`);
      indexHtml = indexHtml.replace(/<meta\s+property="og:image:secure_url"\s+content=".*?"\s*\/?>/i, `<meta property="og:image:secure_url" content="${escapeHtml(ogImageUrl)}" />`);
      indexHtml = indexHtml.replace(/<meta\s+property="og:image:alt"\s+content=".*?"\s*\/?>/i, `<meta property="og:image:alt" content="${escapeHtml(title)}" />`);

      indexHtml = indexHtml.replace(/<meta\s+name="twitter:title"\s+content=".*?"\s*\/?>/i, `<meta name="twitter:title" content="${escapeHtml(title)}" />`);
      indexHtml = indexHtml.replace(/<meta\s+name="twitter:description"\s+content=".*?"\s*\/?>/i, `<meta name="twitter:description" content="${escapeHtml(description)}" />`);
      indexHtml = indexHtml.replace(/<meta\s+name="twitter:image"\s+content=".*?"\s*\/?>/i, `<meta name="twitter:image" content="${escapeHtml(ogImageUrl)}" />`);
      indexHtml = indexHtml.replace(/<meta\s+name="twitter:image:alt"\s+content=".*?"\s*\/?>/i, `<meta name="twitter:image:alt" content="${escapeHtml(title)}" />`);

      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
      return res.status(200).send(indexHtml);
    }
  } catch (err) {
    console.error('[pup-meta] Error reading or modifying index.html:', err);
  }

  // Fallback redirect to client app
  return res.redirect(`/${encodeURIComponent(cleanSlug)}`);
}
