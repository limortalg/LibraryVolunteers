import { google } from 'googleapis';

// Development mode - use mock data when Google credentials are not configured
const USE_MOCK_DATA = !process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL === 'your_service_account_email@project.iam.gserviceaccount.com';

let sheets: any;
let SPREADSHEET_ID = '';

if (!USE_MOCK_DATA) {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  sheets = google.sheets({ version: 'v4', auth });
  SPREADSHEET_ID = process.env.GOOGLE_SHEETS_ID || '';
}

// Mock data for development
let mockVolunteers: Volunteer[] = [];
let mockShifts: Shift[] = [];

export interface Volunteer {
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

export interface Shift {
  date: string;
  volunteerEmail: string;
  status: 'proposed' | 'approved' | 'assigned';
  monthYear: string;
}

export async function getVolunteers(): Promise<Volunteer[]> {
  try {
    if (USE_MOCK_DATA) {
      return mockVolunteers;
    }

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Volunteers!A2:I',
    });

    const rows = response.data.values || [];
    return rows.map((row: any[]) => ({
      name: row[0] || '',
      phone: row[1] || '',
      email: row[2] || '',
      monday: row[3] === 'TRUE',
      tuesday: row[4] === 'TRUE',
      wednesday: row[5] === 'TRUE',
      thursday: row[6] === 'TRUE',
      friday: row[7] === 'TRUE',
      isManager: row[8] === 'TRUE',
    }));
  } catch (error) {
    console.error('Error getting volunteers:', error);
    return [];
  }
}

export async function addVolunteer(volunteer: Volunteer): Promise<boolean> {
  try {
    if (USE_MOCK_DATA) {
      mockVolunteers.push(volunteer);
      return true;
    }

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Volunteers!A:I',
      valueInputOption: 'RAW',
      requestBody: {
        values: [[
          volunteer.name,
          volunteer.phone,
          volunteer.email,
          volunteer.monday ? 'TRUE' : 'FALSE',
          volunteer.tuesday ? 'TRUE' : 'FALSE',
          volunteer.wednesday ? 'TRUE' : 'FALSE',
          volunteer.thursday ? 'TRUE' : 'FALSE',
          volunteer.friday ? 'TRUE' : 'FALSE',
          volunteer.isManager ? 'TRUE' : 'FALSE',
        ]],
      },
    });
    return true;
  } catch (error) {
    console.error('Error adding volunteer:', error);
    return false;
  }
}

export async function updateVolunteer(email: string, volunteer: Volunteer): Promise<boolean> {
  try {
    // Get all volunteers to check if this is the last manager
    const allVolunteers = await getVolunteers();
    const currentVolunteer = allVolunteers.find(v => v.email === email);
    
    // Prevent removing the last manager
    if (currentVolunteer?.isManager && !volunteer.isManager) {
      const managerCount = allVolunteers.filter(v => v.isManager).length;
      if (managerCount === 1) {
        throw new Error('Cannot remove the last manager');
      }
    }

    if (USE_MOCK_DATA) {
      const index = mockVolunteers.findIndex(v => v.email === email);
      if (index !== -1) {
        mockVolunteers[index] = volunteer;
        return true;
      }
      return false;
    }

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Volunteers!A:I',
    });

    const rows = response.data.values || [];
    const rowIndex = rows.findIndex((row) => row[2] === email);

    if (rowIndex !== -1) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `Volunteers!A${rowIndex + 2}:I${rowIndex + 2}`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [[
            volunteer.name,
            volunteer.phone,
            volunteer.email,
            volunteer.monday ? 'TRUE' : 'FALSE',
            volunteer.tuesday ? 'TRUE' : 'FALSE',
            volunteer.wednesday ? 'TRUE' : 'FALSE',
            volunteer.thursday ? 'TRUE' : 'FALSE',
            volunteer.friday ? 'TRUE' : 'FALSE',
            volunteer.isManager ? 'TRUE' : 'FALSE',
          ]],
        },
      });
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error updating volunteer:', error);
    return false;
  }
}

export async function deleteVolunteer(email: string): Promise<boolean> {
  try {
    if (USE_MOCK_DATA) {
      const index = mockVolunteers.findIndex(v => v.email === email);
      if (index !== -1) {
        mockVolunteers.splice(index, 1);
        return true;
      }
      return false;
    }

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Volunteers!A:I',
    });

    const rows = response.data.values || [];
    const rowIndex = rows.findIndex((row) => row[2] === email);

    if (rowIndex !== -1) {
      await sheets.spreadsheets.values.clear({
        spreadsheetId: SPREADSHEET_ID,
        range: `Volunteers!A${rowIndex + 2}:I${rowIndex + 2}`,
      });
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting volunteer:', error);
    return false;
  }
}

export async function getShifts(email: string): Promise<Shift[]> {
  try {
    if (USE_MOCK_DATA) {
      return mockShifts.filter(s => s.volunteerEmail === email);
    }

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Shifts!A2:D',
    });

    const rows = response.data.values || [];
    return rows
      .filter((row) => row[1] === email)
      .map((row) => ({
        date: row[0] || '',
        volunteerEmail: row[1] || '',
        status: row[2] as 'proposed' | 'approved' | 'assigned',
        monthYear: row[3] || '',
      }));
  } catch (error) {
    console.error('Error getting shifts:', error);
    return [];
  }
}

export async function getAllShifts(): Promise<Shift[]> {
  try {
    if (USE_MOCK_DATA) {
      return mockShifts;
    }

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Shifts!A2:D',
    });

    const rows = response.data.values || [];
    return rows.map((row: any[]) => ({
      date: row[0] || '',
      volunteerEmail: row[1] || '',
      status: row[2] as 'proposed' | 'approved' | 'assigned',
      monthYear: row[3] || '',
    }));
  } catch (error) {
    console.error('Error getting all shifts:', error);
    return [];
  }
}

export async function proposeShift(email: string, date: string): Promise<boolean> {
  try {
    if (USE_MOCK_DATA) {
      const monthYear = new Date(date).toLocaleDateString('he-IL', { year: 'numeric', month: 'long' });
      mockShifts.push({
        date,
        volunteerEmail: email,
        status: 'proposed',
        monthYear,
      });
      return true;
    }

    const monthYear = new Date(date).toLocaleDateString('he-IL', { year: 'numeric', month: 'long' });
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Shifts!A:D',
      valueInputOption: 'RAW',
      requestBody: {
        values: [[date, email, 'proposed', monthYear]],
      },
    });
    return true;
  } catch (error) {
    console.error('Error proposing shift:', error);
    return false;
  }
}

export async function approveShift(date: string, email: string): Promise<boolean> {
  try {
    if (USE_MOCK_DATA) {
      const shift = mockShifts.find(s => s.date === date && s.volunteerEmail === email);
      if (shift) {
        shift.status = 'approved';
        return true;
      }
      return false;
    }

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Shifts!A:D',
    });

    const rows = response.data.values || [];
    const rowIndex = rows.findIndex((row) => row[0] === date && row[1] === email);

    if (rowIndex !== -1) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `Shifts!C${rowIndex + 2}`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [['approved']],
        },
      });
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error approving shift:', error);
    return false;
  }
}

export async function rejectShift(date: string, email: string): Promise<boolean> {
  try {
    if (USE_MOCK_DATA) {
      const index = mockShifts.findIndex(s => s.date === date && s.volunteerEmail === email);
      if (index !== -1) {
        mockShifts.splice(index, 1);
        return true;
      }
      return false;
    }

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Shifts!A:D',
    });

    const rows = response.data.values || [];
    const rowIndex = rows.findIndex((row) => row[0] === date && row[1] === email);

    if (rowIndex !== -1) {
      await sheets.spreadsheets.values.clear({
        spreadsheetId: SPREADSHEET_ID,
        range: `Shifts!A${rowIndex + 2}:D${rowIndex + 2}`,
      });
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error rejecting shift:', error);
    return false;
  }
}

export async function isFirstUser(email: string): Promise<boolean> {
  try {
    const volunteers = await getVolunteers();
    return volunteers.length === 0;
  } catch (error) {
    console.error('Error checking first user:', error);
    return false;
  }
}

export async function isManager(email: string): Promise<boolean> {
  try {
    const volunteers = await getVolunteers();
    const volunteer = volunteers.find((v) => v.email === email);
    return volunteer?.isManager || false;
  } catch (error) {
    console.error('Error checking manager status:', error);
    return false;
  }
}

