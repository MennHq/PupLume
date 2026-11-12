import type { VercelRequest, VercelResponse } from '@vercel/node';
import pupHandler from './og/pup';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  return pupHandler(req, res);
}
