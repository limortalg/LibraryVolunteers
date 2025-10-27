import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import SignInButton from '@/components/SignInButton';
import Dashboard from '@/components/Dashboard';
import Loading from '@/components/Loading';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    setLoading(false);
  }, [status]);

  if (loading) {
    return <Loading />;
  }

  if (!session) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        padding: '20px'
      }}>
        <h1 style={{ marginBottom: '20px', fontSize: '2rem' }}>Library Shifts Manager</h1>
        <p style={{ marginBottom: '30px', textAlign: 'center' }}>
          Volunteer shift management system
        </p>
        <SignInButton />
      </div>
    );
  }

  return <Dashboard />;
}

