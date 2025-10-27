import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]';
import { isFirstUser, addVolunteer, getVolunteers, updateVolunteer } from '@/lib/sheets';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.email) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'POST') {
    try {
      const volunteers = await getVolunteers();
      const existingVolunteer = volunteers.find(v => v.email === session.user.email);
      
      // If user doesn't exist or exists but is not a manager
      if (!existingVolunteer) {
        // Add first user as manager
        await addVolunteer({
          name: session.user.name || 'מנהל',
          phone: '',
          email: session.user.email,
          monday: true,
          tuesday: true,
          wednesday: true,
          thursday: true,
          friday: true,
          isManager: true,
        });
      } else if (!existingVolunteer.isManager && volunteers.length === 1) {
        // If they're the only volunteer and not a manager, make them a manager
        existingVolunteer.isManager = true;
        await updateVolunteer(session.user.email, existingVolunteer);
      }
      
      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: 'Setup failed' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

