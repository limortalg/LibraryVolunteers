import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { getVolunteers, addVolunteer, updateVolunteer, deleteVolunteer, isManager } from '@/lib/sheets';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.email) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    const volunteers = await getVolunteers();
    return res.status(200).json(volunteers);
  }

  if (req.method === 'POST') {
    const isUserManager = await isManager(session.user.email);
    if (!isUserManager) {
      return res.status(403).json({ error: 'Only managers can add volunteers' });
    }

    const success = await addVolunteer(req.body);
    return res.status(success ? 200 : 500).json({ success });
  }

  if (req.method === 'PUT') {
    const isUserManager = await isManager(session.user.email);
    if (!isUserManager) {
      return res.status(403).json({ error: 'Only managers can update volunteers' });
    }

    const { email, ...volunteerData } = req.body;
    try {
      const success = await updateVolunteer(email, volunteerData);
      if (!success) {
        return res.status(500).json({ error: 'Failed to update volunteer' });
      }
      return res.status(200).json({ success });
    } catch (error: any) {
      return res.status(400).json({ error: error.message || 'Failed to update volunteer' });
    }
  }

  if (req.method === 'DELETE') {
    const isUserManager = await isManager(session.user.email);
    if (!isUserManager) {
      return res.status(403).json({ error: 'Only managers can delete volunteers' });
    }

    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    try {
      const success = await deleteVolunteer(email);
      if (!success) {
        return res.status(500).json({ error: 'Failed to delete volunteer' });
      }
      return res.status(200).json({ success });
    } catch (error: any) {
      return res.status(400).json({ error: error.message || 'Failed to delete volunteer' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

