import type { VercelRequest, VercelResponse } from '@vercel/node';
import { renderPassportCardPng } from '../_ogPassportCard';

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

  // 1. Query Convex for live puppy details
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

  // 2. Fallbacks for demo or local setups if Convex doesn't have the record
  if (!puppyData) {
    const isGraxzo = cleanSlug.includes('graxzo') || cleanSlug.includes('graxo');
    const isLeo = cleanSlug.includes('leo');
    const isBella = cleanSlug.includes('bella');

    if (isGraxzo) {
      const displayName = cleanSlug.charAt(0).toUpperCase() + cleanSlug.slice(1);
      puppyData = {
        name: displayName,
        breed: 'German Shepherd',
        weightLbs: 14,
        birthDate: '2026-05-15',
        microchipNumber: `985-${cleanSlug.toUpperCase()}-2026`,
        temperament: 'Playful, affectionate & loyal',
        photoUrl: 'https://res.cloudinary.com/puplume/image/upload/v1792845578/puplume/pets/j76lqhakqxgczyplknen.jpg',
      };
    } else if (isLeo) {
      puppyData = {
        name: 'Leo',
        breed: 'Golden Retriever',
        weightLbs: 22,
        birthDate: '2026-04-10',
        microchipNumber: '985-LEO-2026-PUP',
        temperament: 'Friendly, energetic and loving',
      };
    } else if (isBella) {
      puppyData = {
        name: 'Bella',
        breed: 'French Bulldog',
        weightLbs: 16,
        birthDate: '2026-06-01',
        microchipNumber: '985-BELLA-2026-PUP',
        temperament: 'Curious, calm and affectionate',
      };
    } else {
      // General title-cased slug as pet name
      const formattedName = cleanSlug.charAt(0).toUpperCase() + cleanSlug.slice(1);
      puppyData = {
        name: formattedName,
        breed: 'Canine Companion',
        weightLbs: 15,
        microchipNumber: `985-${cleanSlug.toUpperCase()}-2026`,
        temperament: 'Loving, playful & curious',
      };
    }
  }

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
