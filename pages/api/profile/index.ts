import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { isManager, isFirstUser } from '@/lib/sheets';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.email) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    const managerStatus = await isManager(session.user.email);
    const isFirst = await isFirstUser(session.user.email);
    
    return res.status(200).json({
      email: session.user.email,
      name: session.user.name,
      isManager: managerStatus || isFirst,
      isFirst,
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

