import { useSession, signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import Calendar from './Calendar';
import ManagerPanel from './ManagerPanel';
import { addMonths, startOfMonth, endOfMonth } from 'date-fns';

interface Profile {
  email: string;
  name: string;
  isManager: boolean;
  isFirst: boolean;
}

export default function Dashboard() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    if (session?.user?.email) {
      fetchProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const fetchProfile = async () => {
    try {
      const response = await axios.get('/api/profile');
      setProfile(response.data);
      
      // Auto-setup first user as manager
      if (response.data.isFirst) {
        await axios.post('/api/setup');
        await fetchProfile(); // Refresh profile
      }
    } catch (error) {
      toast.error('שגיאה בטעינת הפרופיל');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '20px' }}>טוען...</div>;
  }

  const handleProposalSent = () => {
    // Trigger refresh in both calendars
    setRefreshTrigger(prev => prev + 1);
  };

  const handleShiftsChanged = () => {
    // Trigger refresh in both calendars
    setRefreshTrigger(prev => prev + 1);
  };

  const handleApproveShift = async (date: string, volunteerEmail: string) => {
    try {
      await axios.post('/api/shifts', { action: 'approve', date, volunteerEmail });
      setRefreshTrigger(prev => prev + 1);
    } catch (e) {
      // no-op UI toast here to keep component lean
    }
  };

  const handleRejectShift = async (date: string, volunteerEmail: string) => {
    try {
      await axios.post('/api/shifts', { action: 'reject', date, volunteerEmail });
      setRefreshTrigger(prev => prev + 1);
    } catch (e) {
      // no-op
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <header style={{
        backgroundColor: '#1976d2',
        color: 'white',
        padding: '16px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem' }}>לוח בקרה - משמרות ספריה</h1>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span>{profile?.name}</span>
          {profile?.isManager && (
            <span style={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              padding: '4px 12px',
              borderRadius: '12px',
              fontSize: '0.85rem'
            }}>
              מנהל
            </span>
          )}
          <button
            onClick={() => signOut()}
            style={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            התנתק
          </button>
        </div>
      </header>

      <main style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
        {profile?.isManager && <ManagerPanel key={refreshTrigger} onShiftsChanged={handleShiftsChanged} />}
        
        <div className="calendar-container" style={{ 
          display: 'flex',
          flexDirection: 'row',
          gap: '20px',
          marginBottom: '20px'
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Calendar
              key={`curr-${refreshTrigger}`}
              email={profile?.email || ''}
              showCurrentMonth={true}
              managerMode={!!profile?.isManager}
              onApproveShift={handleApproveShift}
              onRejectShift={handleRejectShift}
              title="לוח משמרות"
              onShiftsChanged={handleShiftsChanged}
            />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Calendar
              key={`next-${refreshTrigger}`}
              email={profile?.email || ''}
              showCurrentMonth={false}
              managerMode={!!profile?.isManager}
              onApproveShift={handleApproveShift}
              onRejectShift={handleRejectShift}
              title="החודש הבא"
              activeStartDate={startOfMonth(addMonths(new Date(), 1))}
              minDate={startOfMonth(addMonths(new Date(), 1))}
              maxDate={endOfMonth(addMonths(new Date(), 1))}
              onShiftsChanged={handleShiftsChanged}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

