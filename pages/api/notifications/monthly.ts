import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { sendMonthlySchedule } from '@/lib/notifications';
import { isManager } from '@/lib/sheets';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Only managers can send notifications
  const userEmail = session.user.email;
  const userIsManager = await isManager(userEmail);
  if (!userIsManager) {
    return res.status(403).json({ error: 'Only managers can send notifications' });
  }

  const result = await sendMonthlySchedule();
  return res.status(200).json(result);
}

