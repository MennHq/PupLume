import type { VercelRequest, VercelResponse } from '@vercel/node';
import { deleteFromCloudinary } from '../src/server/cloudinaryService';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { url, publicId } = req.body || {};
    const target = url || publicId;
    if (!target) {
      return res.status(400).json({ error: 'No image url or publicId provided' });
    }

    const result = await deleteFromCloudinary(target);
    return res.status(200).json(result);
  } catch (error: any) {
    console.error('[API delete-image] Error:', error);
    return res.status(500).json({ error: error?.message || 'Cloudinary delete failed' });
  }
}
