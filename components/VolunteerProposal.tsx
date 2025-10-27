import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { format, addMonths, startOfMonth, endOfMonth, getDay, isSameDay } from 'date-fns';
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

interface VolunteerProposalProps {
  email: string;
  onProposalSent?: () => void;
}

export default function VolunteerProposal({ email, onProposalSent }: VolunteerProposalProps) {
  const [dates, setDates] = useState<Date[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [allShifts, setAllShifts] = useState<Shift[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [shiftsRes, volunteersRes] = await Promise.all([
        axios.get('/api/shifts'),
        axios.get('/api/volunteers')
      ]);
      setAllShifts(shiftsRes.data);
      setVolunteers(volunteersRes.data);
    } catch (error) {
      toast.error('שגיאה בטעינת הנתונים');
    } finally {
      setLoading(false);
    }
  };

  const nextMonth = addMonths(new Date(), 1);
  const minDate = startOfMonth(nextMonth);
  const maxDate = endOfMonth(nextMonth);

  const isWeekday = (date: Date) => {
    const day = getDay(date);
    // Sunday = 0, Monday = 1, Tuesday = 2, Wednesday = 3, Thursday = 4, Friday = 5, Saturday = 6
    // In Israel: work week is Sunday-Thursday
    // Enable: Sunday (0), Monday (1), Tuesday (2), Wednesday (3), Thursday (4)
    // Disable: Friday (5), Saturday (6)
    return day === 0 || day === 1 || day === 2 || day === 3 || day === 4;
  };

  const handlePropose = async () => {
    if (dates.length === 0) {
      toast.error('אנא בחר לפחות תאריך אחד');
      return;
    }

    setSubmitting(true);
    try {
      await axios.post('/api/shifts', {
        action: 'propose',
        dates: dates.map(d => format(d, 'yyyy-MM-dd')),
      });
      toast.success(`הצעות התנדבות נשלחו בהצלחה (${dates.length} תאריכים)`);
      setDates([]);
      await fetchData(); // Refresh the shifts display
      if (onProposalSent) {
        onProposalSent();
      }
    } catch (error) {
      toast.error('שגיאה בשליחת ההצעות');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDateClick = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const isSelected = dates.some(d => format(d, 'yyyy-MM-dd') === dateStr);
    
    if (isSelected) {
      setDates(dates.filter(d => format(d, 'yyyy-MM-dd') !== dateStr));
    } else {
      setDates([...dates, date]);
    }
  };

  const getVolunteerName = (volunteerEmail: string) => {
    const volunteer = volunteers.find(v => v.email === volunteerEmail);
    return volunteer?.name || volunteerEmail.split('@')[0];
  };

  const tileContent = ({ date }: { date: Date }) => {
    const shiftsOnDate = allShifts.filter((s) => isSameDay(new Date(s.date), date));
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

  if (loading) {
    return <div style={{ padding: '20px' }}>טוען...</div>;
  }

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '20px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{ marginTop: 0, marginBottom: '20px' }}>חודש הבא</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <Calendar
          locale="en-US"
          minDate={minDate}
          maxDate={maxDate}
          defaultActiveStartDate={nextMonth}
          tileDisabled={({ date }) => !isWeekday(date)}
          tileContent={tileContent}
          onClickDay={handleDateClick}
          tileClassName={({ date }) => {
            const dateStr = format(date, 'yyyy-MM-dd');
            return dates.some(d => format(d, 'yyyy-MM-dd') === dateStr) ? 'selected-date' : '';
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
        <div style={{ marginTop: '16px', fontSize: '0.9rem', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
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

      {dates.length > 0 && (
        <div style={{ marginBottom: '20px', padding: '12px', backgroundColor: '#e3f2fd', borderRadius: '6px' }}>
          <div style={{ marginBottom: '8px', fontWeight: '600' }}>נבחרו {dates.length} תאריכים:</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {dates.map((date, index) => (
              <div
                key={index}
                style={{
                  padding: '4px 8px',
                  backgroundColor: '#1976d2',
                  color: 'white',
                  borderRadius: '4px',
                  fontSize: '0.9rem'
                }}
              >
                {format(date, 'dd/MM/yyyy', { locale: he })}
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={handlePropose}
        disabled={dates.length === 0 || submitting}
        style={{
          backgroundColor: dates.length > 0 && !submitting ? '#1976d2' : '#ccc',
          color: 'white',
          border: 'none',
          padding: '12px 24px',
          borderRadius: '6px',
          cursor: dates.length > 0 && !submitting ? 'pointer' : 'not-allowed',
          fontSize: '1rem',
          fontWeight: '600'
        }}
      >
        {submitting ? 'שולח...' : `שלח ${dates.length > 0 ? `${dates.length} ` : ''}הצעות התנדבות`}
      </button>
    </div>
  );
}

