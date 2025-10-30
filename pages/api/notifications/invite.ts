import type { NextApiRequest, NextApiResponse } from 'next';
import { sendInvite } from '@/lib/notifications';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, volunteerName } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const result = await sendInvite(email, volunteerName);
  return res.status(200).json(result);
}

