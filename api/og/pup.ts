import type { VercelRequest, VercelResponse } from '@vercel/node';
import { renderPassportCardPng, renderNotFoundCardPng } from '../_ogPassportCard';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const rawSlug = String(req.query.slug || req.query.tag || req.query.name || req.query.id || '').trim();
  const cleanSlug = rawSlug
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/^-+|-+$/g, '') || 'puppy';

  const hostHeader = req.headers['x-forwarded-host'] || req.headers.host || 'puplumepet.vercel.app';
  const host = Array.isArray(hostHeader) ? hostHeader[0] : hostHeader;

  let puppyData: any = null;

  // 1. Query Convex for live puppy details from the database
  try {
    const convexUrl = process.env.VITE_CONVEX_URL || 'https://energetic-partridge-407.convex.cloud';
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);

    const convexRes = await fetch(`${convexUrl}/api/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: 'puppies:getPublicPuppyByTag',
        args: { identifier: cleanSlug },
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (convexRes.ok) {
      const data = await convexRes.json();
      if (data && data.status === 'success' && data.value) {
        puppyData = data.value;
      }
    }
  } catch (err) {
    console.warn('[api/og/pup] Convex query error:', err);
  }

  // 2. If puppy does not exist in Convex database, render clean "Puppy Passport Not Found" graphic
  if (!puppyData) {
    try {
      const notFoundPng = await renderNotFoundCardPng(cleanSlug, host);
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600');
      return res.status(200).send(notFoundPng);
    } catch (err: any) {
      console.error('[api/og/pup] Error rendering not-found PNG:', err);
      return res.status(404).json({ error: 'Puppy not found' });
    }
  }

  // 3. Render dynamic passport card for the found puppy
  try {
    const pngBuffer = await renderPassportCardPng({
      name: puppyData.name,
      breed: puppyData.breed,
      weightLbs: puppyData.weightLbs,
      birthDate: puppyData.birthDate,
      photoUrl: puppyData.photoUrl,
      microchipNumber: puppyData.microchipNumber,
      temperament: puppyData.temperament,
      isLost: puppyData.isLost,
      rewardAmount: puppyData.rewardAmount,
      slug: cleanSlug,
      host,
    });

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=120, s-maxage=600, stale-while-revalidate=86400');
    return res.status(200).send(pngBuffer);
  } catch (err: any) {
    console.error('[api/og/pup] Error rendering card PNG:', err);
    return res.status(500).json({ error: 'Failed to generate puppy card image' });
  }
}
