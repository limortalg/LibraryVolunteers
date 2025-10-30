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
  managerMode?: boolean;
  onApproveShift?: (date: string, volunteerEmail: string) => void;
  onRejectShift?: (date: string, volunteerEmail: string) => void;
  onPickDate?: (isoDate: string) => void;
  title?: string;
  activeStartDate?: Date;
  minDate?: Date;
  maxDate?: Date;
  onShiftsChanged?: () => void;
}

export default function MyCalendar({ email, showCurrentMonth = false, managerMode = false, onApproveShift, onRejectShift, onPickDate, title, activeStartDate, minDate, maxDate, onShiftsChanged }: CalendarProps) {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [assignVolunteerEmail, setAssignVolunteerEmail] = useState<string>('');

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

  const isPastLocal = (d: Date) => {
    const today = new Date(); today.setHours(0,0,0,0);
    const pick = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    return pick < today;
  };

  const hasMyShiftOn = (d: Date) => {
    return shifts.some(s => s.volunteerEmail === email && isSameDay(new Date(s.date), d));
  };

  const activateShift = async (shift: Shift) => {
    const d = new Date(shift.date);
    if (isPastLocal(d)) { toast.error('אי אפשר לשנות משמרות בתאריכים שעברו'); return; }
    const iso = toIsoLocal(new Date(d.getFullYear(), d.getMonth(), d.getDate()));
    try {
      if (shift.status === 'proposed') {
        await axios.post('/api/shifts', { action: 'approve', date: iso, volunteerEmail: shift.volunteerEmail });
        toast.success('המשמרת אושרה');
      } else {
        await axios.post('/api/shifts', { action: 'reject', date: iso, volunteerEmail: shift.volunteerEmail });
        toast.success('המשמרת נמחקה');
      }
      await fetchData();
      onShiftsChanged && onShiftsChanged();
    } catch {
      toast.error('שגיאה בפעולה');
    }
  };

  const deleteShiftDirect = async (shift: Shift) => {
    const d = new Date(shift.date);
    if (isPastLocal(d)) { toast.error('אי אפשר לשנות משמרות בתאריכים שעברו'); return; }
    const iso = toIsoLocal(new Date(d.getFullYear(), d.getMonth(), d.getDate()));
    try {
      await axios.post('/api/shifts', { action: 'reject', date: iso, volunteerEmail: shift.volunteerEmail });
      toast.success('המשמרת נמחקה');
      await fetchData();
      onShiftsChanged && onShiftsChanged();
    } catch {
      toast.error('שגיאה במחיקה');
    }
  };

  const tileContent = ({ date }: { date: Date }) => {
    const shiftsOnDate = shifts.filter((s) => isSameDay(new Date(s.date), date));
    
    const myShifts = shiftsOnDate.filter(s => s.volunteerEmail === email);
    const otherShifts = shiftsOnDate.filter(s => s.volunteerEmail !== email);
    
    const makeChipCommon = {
      borderRadius: '4px',
      padding: '2px 4px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 'bold' as const,
      whiteSpace: 'nowrap' as const,
      maxWidth: '100%',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      cursor: managerMode ? 'pointer' : 'default',
      userSelect: 'none' as const,
    };

    // For empty dates, no inline UI; manager selects date via clicking the day
    const isPastDay = isPastLocal(date);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'center', fontSize: '0.65rem' }}>
        {/* My shift chip with inline actions */}
        {myShifts.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div
              onClick={() => {
                const s = myShifts[0];
                setSelectedDate(new Date(s.date));
                setSelectedShift(s);
              }}
              style={{
                backgroundColor: myShifts[0].status === 'approved' ? '#4caf50' : '#ff9800',
                color: 'white',
                border: '2px solid #1976d2',
                ...makeChipCommon,
              }}
              title={getVolunteerName(myShifts[0].volunteerEmail)}
            >
              אני
            </div>
            {managerMode && !isPastDay && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', alignItems: 'stretch' }}>
                {myShifts[0].status === 'proposed' && (
                  <button
                    onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); activateShift(myShifts[0]); }}
                    title="אשר"
                    style={{ background: '#4caf50', color: 'white', border: 'none', padding: '0 4px', borderRadius: '4px', lineHeight: '14px', cursor: 'pointer', fontSize: '10px' }}
                  >✓</button>
                )}
                <button
                  onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); deleteShiftDirect(myShifts[0]); }}
                  title="מחק"
                  style={{ background: '#f44336', color: 'white', border: 'none', padding: '0 4px', borderRadius: '4px', lineHeight: '14px', cursor: 'pointer', fontSize: '10px' }}
                >🗑</button>
              </div>
            )}
          </div>
        )}
        {/* Other shifts chips with inline actions */}
        {otherShifts.slice(0, 2).map((shift, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div
              onClick={() => {
                setSelectedDate(new Date(shift.date));
                setSelectedShift(shift);
              }}
              style={{
                backgroundColor: shift.status === 'approved' ? '#81c784' : '#ffb74d',
                color: 'white',
                ...makeChipCommon,
              }}
              title={getVolunteerName(shift.volunteerEmail)}
            >
              {getVolunteerName(shift.volunteerEmail).substring(0, 4)}
            </div>
            {managerMode && !isPastDay && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', alignItems: 'stretch' }}>
                {shift.status === 'proposed' && (
                  <button
                    onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); activateShift(shift); }}
                    title="אשר"
                    style={{ background: '#4caf50', color: 'white', border: 'none', padding: '0 4px', borderRadius: '4px', lineHeight: '14px', cursor: 'pointer', fontSize: '10px' }}
                  >✓</button>
                )}
                <button
                  onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); deleteShiftDirect(shift); }}
                  title="מחק"
                  style={{ background: '#f44336', color: 'white', border: 'none', padding: '0 4px', borderRadius: '4px', lineHeight: '14px', cursor: 'pointer', fontSize: '10px' }}
                >🗑</button>
              </div>
            )}
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
        <h2 style={{ margin: 0 }}>{title || (showCurrentMonth ? 'חודש נוכחי' : 'לוח משמרות')}</h2>
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
        activeStartDate={activeStartDate}
        minDate={minDate}
        maxDate={maxDate}
        onClickDay={(date) => {
          const dow = date.getDay();
          if (dow === 5 || dow === 6) return; // ignore Fri/Sat
          // Block past dates
          const today = new Date(); today.setHours(0,0,0,0);
          const picked = new Date(date.getFullYear(), date.getMonth(), date.getDate());
          if (picked < today) { toast.error('אי אפשר לשנות משמרות בתאריכים שעברו'); return; }
          setSelectedDate(picked);
          setSelectedShift(null);
        }}
        {...(showCurrentMonth && !managerMode && !minDate && !maxDate && {
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

      {/* Actions area based on selection */}
      <div style={{ marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
        {selectedShift ? (
          <>
            <span style={{ marginLeft: '8px' }}>
              {new Date(selectedShift.date).toLocaleDateString('he-IL')} — {getVolunteerName(selectedShift.volunteerEmail)}
            </span>
            {managerMode && selectedShift.status === 'proposed' && (
              <button
                onClick={() => {
                  const pick = new Date(new Date(selectedShift.date).getFullYear(), new Date(selectedShift.date).getMonth(), new Date(selectedShift.date).getDate());
                  const today = new Date(); today.setHours(0,0,0,0);
                  if (pick < today) { toast.error('אי אפשר לשנות משמרות בתאריכים שעברו'); return; }
                  onApproveShift && onApproveShift(toIsoLocal(pick), selectedShift.volunteerEmail);
                }}
                style={{ background: '#4caf50', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer' }}
              >
                אשר
              </button>
            )}
            {managerMode && (
              <button
                onClick={() => {
                  const pick = new Date(new Date(selectedShift.date).getFullYear(), new Date(selectedShift.date).getMonth(), new Date(selectedShift.date).getDate());
                  const today = new Date(); today.setHours(0,0,0,0);
                  if (pick < today) { toast.error('אי אפשר לשנות משמרות בתאריכים שעברו'); return; }
                  onRejectShift && onRejectShift(toIsoLocal(pick), selectedShift.volunteerEmail);
                }}
                style={{ background: '#f44336', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer' }}
              >
                מחק
              </button>
            )}
          </>
        ) : selectedDate ? (
          <>
            <span style={{ marginLeft: '8px' }}>{selectedDate.toLocaleDateString('he-IL')}</span>
            {!hasMyShiftOn(selectedDate) && (
            <button
              onClick={async () => {
                try {
                  const today = new Date(); today.setHours(0,0,0,0);
                  const sel = new Date(selectedDate!.getFullYear(), selectedDate!.getMonth(), selectedDate!.getDate());
                  if (sel < today) { toast.error('אי אפשר לשנות משמרות בתאריכים שעברו'); return; }
                  await axios.post('/api/shifts', { action: 'propose', date: toIsoLocal(sel) });
                  await fetchData();
                  toast.success('ההצעה נשלחה');
                  onShiftsChanged && onShiftsChanged();
                } catch {
                  toast.error('שגיאה בשליחת ההצעה');
                }
              }}
              style={{ background: '#ff9800', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer' }}
            >
              הצע משמרת
            </button>
            )}
            {managerMode && (
              <>
                <select
                  value={assignVolunteerEmail}
                  onChange={(e) => setAssignVolunteerEmail(e.target.value)}
                  style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ddd' }}
                >
                  <option value="">בחר מתנדב</option>
                  {volunteers.map(v => (
                    <option key={v.email} value={v.email}>{v.name} - {v.email}</option>
                  ))}
                </select>
                <button
                  onClick={async () => {
                    if (!assignVolunteerEmail) { toast.error('בחר מתנדב'); return; }
                    const today = new Date(); today.setHours(0,0,0,0);
                    const sel = new Date(selectedDate!.getFullYear(), selectedDate!.getMonth(), selectedDate!.getDate());
                    if (sel < today) { toast.error('אי אפשר לשנות משמרות בתאריכים שעברו'); return; }
                    try {
                      await axios.post('/api/shifts', { action: 'assign', date: toIsoLocal(sel), volunteerEmail: assignVolunteerEmail });
                      setAssignVolunteerEmail('');
                      await fetchData();
                      toast.success('המשמרת הוקצתה');
                      onShiftsChanged && onShiftsChanged();
                    } catch {
                      toast.error('שגיאה בהקצאה');
                    }
                  }}
                  style={{ background: '#1976d2', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer' }}
                >
                  הקצה משמרת
                </button>
              </>
            )}
          </>
        ) : null}
      </div>

      {/* context menu removed in favor of selection actions */}

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

function toIsoLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

