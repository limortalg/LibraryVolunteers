import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface Volunteer {
  name: string;
  phone: string;
  email: string;
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  isManager: boolean;
}

interface Shift {
  date: string;
  volunteerEmail: string;
  status: 'proposed' | 'approved' | 'assigned';
  monthYear: string;
}

interface ManagerPanelProps {
  onShiftsChanged?: () => void;
}

export default function ManagerPanel({ onShiftsChanged }: ManagerPanelProps) {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [proposedShifts, setProposedShifts] = useState<Shift[]>([]);
  const [allShifts, setAllShifts] = useState<Shift[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingVolunteer, setEditingVolunteer] = useState<string | null>(null);
  const [newVolunteer, setNewVolunteer] = useState({
    name: '',
    phone: '',
    email: '',
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    isManager: false,
  });

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    try {
      const [volunteersRes, shiftsRes] = await Promise.all([
        axios.get('/api/volunteers'),
        axios.get('/api/shifts'),
      ]);
      setVolunteers(volunteersRes.data);
      setAllShifts(shiftsRes.data);
      setProposedShifts(shiftsRes.data.filter((s: Shift) => s.status === 'proposed'));
    } catch (error) {
      toast.error('שגיאה בטעינת הנתונים');
    }
  };


  const handleAddVolunteer = async () => {
    // Validate required fields
    if (!newVolunteer.name.trim()) {
      toast.error('שם המתנדב הוא שדה חובה');
      return;
    }
    if (!newVolunteer.phone.trim()) {
      toast.error('מספר טלפון הוא שדה חובה');
      return;
    }
    if (!newVolunteer.email.trim()) {
      toast.error('אימייל הוא שדה חובה');
      return;
    }

    try {
      await axios.post('/api/volunteers', newVolunteer);
      toast.success('המתנדב נוסף בהצלחה');
      setNewVolunteer({
        name: '',
        phone: '',
        email: '',
        monday: false,
        tuesday: false,
        wednesday: false,
        thursday: false,
        friday: false,
        isManager: false,
      });
      setShowAddForm(false);
      fetchData();
      if (onShiftsChanged) {
        onShiftsChanged();
      }
    } catch (error) {
      toast.error('שגיאה בהוספת המתנדב');
    }
  };

  const handleEditVolunteer = (volunteer: Volunteer) => {
    setEditingVolunteer(volunteer.email);
    setNewVolunteer(volunteer);
  };

  const handleUpdateVolunteer = async () => {
    if (!editingVolunteer) return;
    
    // Validate required fields
    if (!newVolunteer.name.trim()) {
      toast.error('שם המתנדב הוא שדה חובה');
      return;
    }
    if (!newVolunteer.phone.trim()) {
      toast.error('מספר טלפון הוא שדה חובה');
      return;
    }
    
    try {
      // Remove email from newVolunteer to avoid duplicate, then add it back separately
      const { email: _, ...rest } = newVolunteer;
      await axios.put('/api/volunteers', {
        ...rest,
        email: editingVolunteer,
      });
      toast.success('המתנדב עודכן בהצלחה');
      setEditingVolunteer(null);
      setShowAddForm(false);
      setNewVolunteer({
        name: '',
        phone: '',
        email: '',
        monday: false,
        tuesday: false,
        wednesday: false,
        thursday: false,
        friday: false,
        isManager: false,
      });
      fetchData();
      if (onShiftsChanged) {
        onShiftsChanged();
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'שגיאה בעדכון המתנדב';
      toast.error(errorMessage);
    }
  };

  const handleCancelEdit = () => {
    setEditingVolunteer(null);
    setShowAddForm(false);
    setNewVolunteer({
      name: '',
      phone: '',
      email: '',
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false,
      isManager: false,
    });
  };

  const handleDeleteVolunteer = async (volunteerEmail: string) => {
    if (!confirm('האם אתה בטוח שברצונך למחוק מתנדב זה?')) {
      return;
    }

    try {
      await axios.delete('/api/volunteers', { data: { email: volunteerEmail } });
      toast.success('המתנדב נמחק בהצלחה');
      fetchData();
      if (onShiftsChanged) {
        onShiftsChanged();
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'שגיאה במחיקת המתנדב';
      toast.error(errorMessage);
    }
  };

  const handleApproveShift = async (date: string, volunteerEmail: string) => {
    try {
      await axios.post('/api/shifts', {
        action: 'approve',
        date,
        volunteerEmail,
      });
      toast.success('המשמרת אושרה');
      fetchData();
      if (onShiftsChanged) {
        onShiftsChanged();
      }
    } catch (error) {
      toast.error('שגיאה באישור המשמרת');
    }
  };

  const handleRejectShift = async (date: string, volunteerEmail: string) => {
    if (!confirm('האם אתה בטוח שברצונך לדחות/למחוק משמרת זו?')) {
      return;
    }

    try {
      await axios.post('/api/shifts', {
        action: 'reject',
        date,
        volunteerEmail,
      });
      toast.success('המשמרת נדחתה/נמחקה');
      fetchData();
      if (onShiftsChanged) {
        onShiftsChanged();
      }
    } catch (error) {
      toast.error('שגיאה בדחיית המשמרת');
    }
  };

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '20px',
      marginBottom: '20px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{ marginTop: 0 }}>פאנל מנהל</h2>

      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          style={{
            backgroundColor: '#1976d2',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '6px',
            cursor: 'pointer',
            marginBottom: '10px'
          }}
        >
          {showAddForm ? 'ביטול' : 'הוסף מתנדב חדש'}
        </button>

        {(showAddForm || editingVolunteer) && (
          <div style={{
            padding: '16px',
            backgroundColor: '#f5f5f5',
            borderRadius: '6px',
            marginTop: '10px'
          }}>
            <h4 style={{ marginTop: 0, marginBottom: '12px' }}>
              {editingVolunteer ? 'עריכת מתנדב' : 'הוספת מתנדב חדש'}
            </h4>
            <input
              type="text"
              placeholder="שם מלא"
              value={newVolunteer.name}
              onChange={(e) => setNewVolunteer({ ...newVolunteer, name: e.target.value })}
              style={{ width: '100%', padding: '8px', marginBottom: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
            />
            <input
              type="tel"
              placeholder="מספר טלפון"
              value={newVolunteer.phone}
              onChange={(e) => setNewVolunteer({ ...newVolunteer, phone: e.target.value })}
              style={{ width: '100%', padding: '8px', marginBottom: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
            />
            <input
              type="email"
              placeholder="אימייל"
              value={newVolunteer.email}
              onChange={(e) => setNewVolunteer({ ...newVolunteer, email: e.target.value })}
              disabled={!!editingVolunteer}
              style={{ width: '100%', padding: '8px', marginBottom: '8px', borderRadius: '4px', border: '1px solid #ddd', backgroundColor: editingVolunteer ? '#e0e0e0' : 'white' }}
            />
            <div style={{ marginBottom: '8px' }}>
              <label>
                <input
                  type="checkbox"
                  checked={newVolunteer.monday}
                  onChange={(e) => setNewVolunteer({ ...newVolunteer, monday: e.target.checked })}
                />
                {' '}יום ראשון
              </label>
              {' '}
              <label>
                <input
                  type="checkbox"
                  checked={newVolunteer.tuesday}
                  onChange={(e) => setNewVolunteer({ ...newVolunteer, tuesday: e.target.checked })}
                />
                {' '}יום שני
              </label>
              {' '}
              <label>
                <input
                  type="checkbox"
                  checked={newVolunteer.wednesday}
                  onChange={(e) => setNewVolunteer({ ...newVolunteer, wednesday: e.target.checked })}
                />
                {' '}יום שלישי
              </label>
              {' '}
              <label>
                <input
                  type="checkbox"
                  checked={newVolunteer.thursday}
                  onChange={(e) => setNewVolunteer({ ...newVolunteer, thursday: e.target.checked })}
                />
                {' '}יום רביעי
              </label>
              {' '}
              <label>
                <input
                  type="checkbox"
                  checked={newVolunteer.friday}
                  onChange={(e) => setNewVolunteer({ ...newVolunteer, friday: e.target.checked })}
                />
                {' '}יום חמישי
              </label>
            </div>
            <label>
              <input
                type="checkbox"
                checked={newVolunteer.isManager}
                onChange={(e) => setNewVolunteer({ ...newVolunteer, isManager: e.target.checked })}
              />
              {' '}הגדר כמנהל
            </label>
            <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
              <button
                onClick={editingVolunteer ? handleUpdateVolunteer : handleAddVolunteer}
                style={{
                  backgroundColor: '#4caf50',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                {editingVolunteer ? 'עדכן' : 'שמור'}
              </button>
              {editingVolunteer && (
                <button
                  onClick={handleCancelEdit}
                  style={{
                    backgroundColor: '#757575',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#424242'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#757575'}
                >
                  ביטול
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>רשימת מתנדבים ({volunteers.length})</h3>
        {volunteers.length === 0 ? (
          <p>אין מתנדבים רשומים</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {volunteers.map((volunteer, index) => (
              <div
                key={index}
                style={{
                  padding: '12px',
                  backgroundColor: editingVolunteer === volunteer.email ? '#e3f2fd' : '#f5f5f5',
                  borderRadius: '6px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <strong>{volunteer.name}</strong> - {volunteer.email}
                  {volunteer.isManager && (
                    <span style={{ marginRight: '8px', color: '#1976d2', fontWeight: 'bold' }}>[מנהל]</span>
                  )}
                  <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '4px' }}>
                    ימים: {[
                      volunteer.monday && 'ראשון',
                      volunteer.tuesday && 'שני',
                      volunteer.wednesday && 'שלישי',
                      volunteer.thursday && 'רביעי',
                      volunteer.friday && 'חמישי'
                    ].filter(Boolean).join(', ') || 'אין'}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => handleEditVolunteer(volunteer)}
                    disabled={!!editingVolunteer}
                    style={{
                      backgroundColor: editingVolunteer ? '#ccc' : '#ff9800',
                      color: 'white',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '4px',
                      cursor: editingVolunteer ? 'not-allowed' : 'pointer'
                    }}
                  >
                    ערוך
                  </button>
                  <button
                    onClick={() => handleDeleteVolunteer(volunteer.email)}
                    disabled={!!editingVolunteer}
                    style={{
                      backgroundColor: editingVolunteer ? '#ccc' : '#f44336',
                      color: 'white',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '4px',
                      cursor: editingVolunteer ? 'not-allowed' : 'pointer'
                    }}
                  >
                    מחק
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3>ניהול משמרות</h3>
        {allShifts.length === 0 ? (
          <p>אין משמרות רשומות</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {allShifts.map((shift, index) => {
              const volunteer = volunteers.find(v => v.email === shift.volunteerEmail);
              return (
                <div
                  key={index}
                  style={{
                    padding: '12px',
                    backgroundColor: shift.status === 'approved' ? '#d4edda' : '#fff3cd',
                    borderRadius: '6px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <strong>{volunteer?.name || shift.volunteerEmail}</strong> - {new Date(shift.date).toLocaleDateString('he-IL')}
                    <span style={{ marginRight: '8px', color: shift.status === 'approved' ? '#155724' : '#856404', fontWeight: 'bold' }}>
                      [{shift.status === 'approved' ? 'מאושר' : 'מוצע'}]
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {shift.status === 'proposed' && (
                      <button
                        onClick={() => handleApproveShift(shift.date, shift.volunteerEmail)}
                        style={{
                          backgroundColor: '#4caf50',
                          color: 'white',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        אישר
                      </button>
                    )}
                    <button
                      onClick={() => handleRejectShift(shift.date, shift.volunteerEmail)}
                      style={{
                        backgroundColor: '#f44336',
                        color: 'white',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      דחה/מחק
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

