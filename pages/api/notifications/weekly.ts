import type { NextApiRequest, NextApiResponse } from 'next';
import { sendWeeklyReminders } from '@/lib/notifications';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check for authorization (you should add proper auth here)
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const result = await sendWeeklyReminders();
  return res.status(200).json(result);
}

