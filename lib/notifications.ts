import { getAllShifts, getVolunteers } from './sheets';

interface Shift {
  date: string;
  volunteerEmail: string;
  status: 'proposed' | 'approved' | 'assigned';
  monthYear: string;
}

export async function sendWeeklyReminders() {
  try {
    const shifts = await getAllShifts();
    const volunteers = await getVolunteers();
    
    const today = new Date();
    const thisSunday = new Date(today);
    thisSunday.setDate(today.getDate() + (7 - today.getDay()));
    thisSunday.setHours(8, 0, 0, 0);
    
    const nextSunday = new Date(thisSunday);
    nextSunday.setDate(thisSunday.getDate() + 7);
    
    const weeklyShifts = shifts.filter(shift => {
      const shiftDate = new Date(shift.date);
      return shiftDate >= thisSunday && shiftDate < nextSunday && shift.status === 'approved';
    });
    
    const shiftsByVolunteer: Record<string, Shift[]> = {};
    weeklyShifts.forEach(shift => {
      if (!shiftsByVolunteer[shift.volunteerEmail]) {
        shiftsByVolunteer[shift.volunteerEmail] = [];
      }
      shiftsByVolunteer[shift.volunteerEmail].push(shift);
    });
    
    // In a real implementation, you would send notifications here
    // For example, using SendGrid, Twilio, or another service
    for (const [email, volunteerShifts] of Object.entries(shiftsByVolunteer)) {
      const volunteer = volunteers.find(v => v.email === email);
      if (volunteer && volunteerShifts.length > 0) {
        console.log(`Sending reminder to ${volunteer.name} (${email})`);
        console.log(`Shifts: ${volunteerShifts.map(s => s.date).join(', ')}`);
        // TODO: Implement actual notification sending
      }
    }
    
    return { success: true, count: Object.keys(shiftsByVolunteer).length };
  } catch (error) {
    console.error('Error sending weekly reminders:', error);
    return { success: false, error };
  }
}

export async function sendMonthlySchedule() {
  try {
    const shifts = await getAllShifts();
    const volunteers = await getVolunteers();
    
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    
    const monthlyShifts = shifts.filter(shift => {
      const shiftDate = new Date(shift.date);
      return shiftDate.getMonth() === nextMonth.getMonth() && 
             shiftDate.getFullYear() === nextMonth.getFullYear() &&
             shift.status === 'approved';
    });
    
    const shiftsByVolunteer: Record<string, Shift[]> = {};
    monthlyShifts.forEach(shift => {
      if (!shiftsByVolunteer[shift.volunteerEmail]) {
        shiftsByVolunteer[shift.volunteerEmail] = [];
      }
      shiftsByVolunteer[shift.volunteerEmail].push(shift);
    });
    
    // In a real implementation, you would send notifications here
    for (const [email, volunteerShifts] of Object.entries(shiftsByVolunteer)) {
      const volunteer = volunteers.find(v => v.email === email);
      if (volunteer && volunteerShifts.length > 0) {
        console.log(`Sending monthly schedule to ${volunteer.name} (${email})`);
        console.log(`Shifts: ${volunteerShifts.map(s => s.date).join(', ')}`);
        // TODO: Implement actual notification sending
      }
    }
    
    return { success: true, count: Object.keys(shiftsByVolunteer).length };
  } catch (error) {
    console.error('Error sending monthly schedule:', error);
    return { success: false, error };
  }
}

