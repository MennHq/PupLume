import type { VercelRequest, VercelResponse } from '@vercel/node';
import { uploadToCloudinary } from '../src/server/cloudinaryService';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { file, folder, tags, previousImageUrl, previousPublicId } = req.body || {};
    if (!file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const result = await uploadToCloudinary(file, {
      folder,
      tags,
      previousImageUrl,
      previousPublicId,
    });
    return res.status(200).json({ success: true, ...result });
  } catch (error: any) {
    console.error('[API upload] Error:', error);
    return res.status(500).json({ error: error?.message || 'Cloudinary upload failed' });
  }
}
