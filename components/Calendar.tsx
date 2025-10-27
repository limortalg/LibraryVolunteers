import { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import axios from 'axios';
import toast from 'react-hot-toast';
import { format, isSameDay, startOfMonth, endOfMonth } from 'date-fns';
import { he, enUS } from 'date-fns/locale';

interface Shift {
  date: string;
  volunteerEmail: string;
  status: 'proposed' | 'approved' | 'assigned';
  monthYear: string;
}

interface Volunteer {
  name: string;
  email: string;
}

interface CalendarProps {
  email: string;
  showCurrentMonth?: boolean;
}

export default function MyCalendar({ email, showCurrentMonth = false }: CalendarProps) {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email]);

  const fetchData = async () => {
    try {
      const [shiftsRes, volunteersRes] = await Promise.all([
        axios.get('/api/shifts'),
        axios.get('/api/volunteers')
      ]);
      setShifts(shiftsRes.data);
      setVolunteers(volunteersRes.data);
    } catch (error) {
      toast.error('שגיאה בטעינת הנתונים');
    } finally {
      setLoading(false);
    }
  };

  const getVolunteerName = (volunteerEmail: string) => {
    const volunteer = volunteers.find(v => v.email === volunteerEmail);
    return volunteer?.name || volunteerEmail.split('@')[0];
  };

  const tileContent = ({ date }: { date: Date }) => {
    const shiftsOnDate = shifts.filter((s) => isSameDay(new Date(s.date), date));
    if (shiftsOnDate.length === 0) return null;
    
    const myShifts = shiftsOnDate.filter(s => s.volunteerEmail === email);
    const otherShifts = shiftsOnDate.filter(s => s.volunteerEmail !== email);
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'center', fontSize: '0.65rem' }}>
        {myShifts.length > 0 && (
          <div style={{
            backgroundColor: myShifts[0].status === 'approved' ? '#4caf50' : '#ff9800',
            color: 'white',
            borderRadius: '4px',
            padding: '2px 4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            border: '2px solid #1976d2',
            whiteSpace: 'nowrap',
            maxWidth: '100%',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            אני
          </div>
        )}
        {otherShifts.slice(0, 2).map((shift, idx) => (
          <div
            key={idx}
            style={{
              backgroundColor: shift.status === 'approved' ? '#81c784' : '#ffb74d',
              color: 'white',
              borderRadius: '4px',
              padding: '2px 4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              whiteSpace: 'nowrap',
              maxWidth: '100%',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
            title={getVolunteerName(shift.volunteerEmail)}
          >
            {getVolunteerName(shift.volunteerEmail).substring(0, 4)}
          </div>
        ))}
        {otherShifts.length > 2 && (
          <div style={{
            backgroundColor: '#9e9e9e',
            color: 'white',
            borderRadius: '4px',
            padding: '2px 4px',
            fontSize: '0.6rem',
            fontWeight: 'bold'
          }}>
            +{otherShifts.length - 2}
          </div>
        )}
      </div>
    );
  };

  const exportToGoogleCalendar = () => {
    const myApprovedShifts = shifts.filter(s => s.status === 'approved' && s.volunteerEmail === email);
    if (myApprovedShifts.length === 0) {
      toast.error('אין משמרות מאושרות שלך לייצא');
      return;
    }

    myApprovedShifts.forEach(shift => {
      const startDate = new Date(shift.date);
      startDate.setHours(17, 0, 0);
      const endDate = new Date(shift.date);
      endDate.setHours(19, 0, 0);

      const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=משמרת%20ספריה&dates=${startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z&details=משמרת%20ספריה%20יישובית`;
      
      window.open(googleCalendarUrl, '_blank');
    });

    toast.success('נפתחו חלונות חדשים לייצוא ל-Google Calendar');
  };

  if (loading) {
    return <div>טוען...</div>;
  }

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '20px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0 }}>{showCurrentMonth ? 'חודש נוכחי' : 'לוח משמרות'}</h2>
        {shifts.filter(s => s.status === 'approved' && s.volunteerEmail === email).length > 0 && (
          <button
            onClick={exportToGoogleCalendar}
            style={{
              backgroundColor: '#1976d2',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            ייצא ל-Google Calendar
          </button>
        )}
      </div>
      
      <Calendar
        locale="en-US"
        tileContent={tileContent}
        {...(showCurrentMonth && {
          minDate: startOfMonth(new Date()),
          maxDate: endOfMonth(new Date()),
        })}
        tileDisabled={({ date }) => {
          const day = date.getDay();
          // Disable Friday (5) and Saturday (6) - library only open Sunday-Thursday
          return day === 5 || day === 6;
        }}
        formatShortWeekday={(locale, date) => {
          const day = date.getDay();
          const days = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'];
          return days[day];
        }}
        formatWeekday={(locale, date) => {
          const day = date.getDay();
          const days = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'];
          return days[day];
        }}
      />

      <div style={{ marginTop: '20px', fontSize: '0.9rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '40px', height: '16px', backgroundColor: '#ff9800', borderRadius: '4px', border: '2px solid #1976d2' }}></div>
            <span>מוצע שלי</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '40px', height: '16px', backgroundColor: '#4caf50', borderRadius: '4px', border: '2px solid #1976d2' }}></div>
            <span>מאושר שלי</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '40px', height: '16px', backgroundColor: '#ffb74d', borderRadius: '4px' }}></div>
            <span>הצעות אחרות</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '40px', height: '16px', backgroundColor: '#81c784', borderRadius: '4px' }}></div>
            <span>מאושרות אחרות</span>
          </div>
        </div>
      </div>
    </div>
  );
}

