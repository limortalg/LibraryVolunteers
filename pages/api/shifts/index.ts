import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { getShifts, getAllShifts, proposeShift, approveShift, rejectShift, isManager, assignShift } from '@/lib/sheets';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.email) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    const userEmail = session.user?.email;
    if (!userEmail) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    // Show all shifts to all authenticated users, so volunteers can see others
    const shifts = await getAllShifts();
    return res.status(200).json(shifts);
  }

  if (req.method === 'POST') {
    const userEmail = session.user?.email;
    if (!userEmail) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { action, date, dates } = req.body;

    const isPastDate = (dateStr: string): boolean => {
      if (!dateStr) return true;
      const target = new Date(`${dateStr}T00:00:00`);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return target < today;
    };

    if (action === 'propose') {
      // Handle both single date (legacy) and multiple dates
      const datesToPropose = dates || [date];
      if (datesToPropose.some((d: string) => isPastDate(d))) {
        return res.status(400).json({ error: 'Cannot modify past dates' });
      }
      
      const results = await Promise.all(
        datesToPropose.map((d: string) => proposeShift(userEmail, d))
      );
      
      const success = results.every(r => r);
      return res.status(success ? 200 : 500).json({ success });
    }

    if (action === 'approve') {
      const isUserManager = await isManager(userEmail);
      if (!isUserManager) {
        return res.status(403).json({ error: 'Only managers can approve shifts' });
      }

      const { volunteerEmail } = req.body;
      if (isPastDate(date)) {
        return res.status(400).json({ error: 'Cannot modify past dates' });
      }
      const success = await approveShift(date, volunteerEmail);
      return res.status(success ? 200 : 500).json({ success });
    }

    if (action === 'assign') {
      const isUserManager = await isManager(userEmail);
      if (!isUserManager) {
        return res.status(403).json({ error: 'Only managers can assign shifts' });
      }

      const { volunteerEmail } = req.body;
      if (isPastDate(date)) {
        return res.status(400).json({ error: 'Cannot modify past dates' });
      }
      const success = await assignShift(date, volunteerEmail);
      return res.status(success ? 200 : 500).json({ success });
    }

    if (action === 'reject') {
      const isUserManager = await isManager(userEmail);
      if (!isUserManager) {
        return res.status(403).json({ error: 'Only managers can reject shifts' });
      }

      const { volunteerEmail } = req.body;
      if (isPastDate(date)) {
        return res.status(400).json({ error: 'Cannot modify past dates' });
      }
      const success = await rejectShift(date, volunteerEmail);
      return res.status(success ? 200 : 500).json({ success });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

