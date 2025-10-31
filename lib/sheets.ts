import { google } from 'googleapis';

// Development mode - use mock data when Google credentials are not configured
const USE_MOCK_DATA = !process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL === 'your_service_account_email@project.iam.gserviceaccount.com';

let sheets: any;
let SPREADSHEET_ID = '';

if (!USE_MOCK_DATA) {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim(),
      private_key: process.env.GOOGLE_PRIVATE_KEY?.trim().replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  sheets = google.sheets({ version: 'v4', auth });
  SPREADSHEET_ID = process.env.GOOGLE_SHEETS_ID?.trim() || '';
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
    return rows
      .filter((row: any[]) => row && row[2] && row[2].trim()) // Filter out empty rows (need at least an email)
      .map((row: any[]) => ({
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
    // Find by email (column 2, index 2 in the row array)
    // rows[0] is header (sheet row 1), rows[1] is first volunteer (sheet row 2), etc.
    const rowIndex = rows.findIndex((row: any[]) => row[2] === email);

    if (rowIndex !== -1 && rowIndex > 0) {
      // rowIndex is 0-based in array (0 = header, 1 = first volunteer)
      // Sheet row number = rowIndex + 1 (header is row 1, first volunteer is row 2)
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `Volunteers!A${rowIndex + 1}:I${rowIndex + 1}`,
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
    // Find by email (column 2, index 2 in the row array)
    // rows[0] is header (sheet row 1), rows[1] is first volunteer (sheet row 2), etc.
    const rowIndex = rows.findIndex((row: any[]) => row[2] === email);

    if (rowIndex !== -1 && rowIndex > 0) {
      // rowIndex is 0-based in array (0 = header, 1 = first volunteer)
      // Sheet row number = rowIndex + 1 (header is row 1, first volunteer is row 2)
      // Actually delete the row instead of just clearing it
      const sheetRowNumber = rowIndex + 1; // Convert array index to sheet row number
      
      // Get the sheet ID for the Volunteers sheet
      const spreadsheet = await sheets.spreadsheets.get({
        spreadsheetId: SPREADSHEET_ID,
      });
      const volunteersSheet = spreadsheet.data.sheets?.find(
        (sheet: any) => sheet.properties.title === 'Volunteers'
      );
      const sheetId = volunteersSheet?.properties.sheetId || 0;
      
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: {
          requests: [{
            deleteDimension: {
              range: {
                sheetId: sheetId,
                dimension: 'ROWS',
                startIndex: sheetRowNumber - 1, // 0-based index (sheet row 2 = index 1)
                endIndex: sheetRowNumber, // endIndex is exclusive
              },
            },
          }],
        },
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
      .filter((row: any[]) => row[1] === email)
      .map((row: any[]) => ({
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
    return rows
      .filter((row: any[]) => row && row[0] && row[1]) // Filter out empty rows (need at least date and email)
      .map((row: any[]) => ({
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
      range: 'Shifts!A2:D',
    });

    const rows = response.data.values || [];
    const rowIndex = rows.findIndex((row: any[]) => row[0] === date && row[1] === email);

    if (rowIndex !== -1) {
      const originalRow = rows[rowIndex];
      const monthYear = originalRow[3] || '';
      
      // rowIndex is 0-based in the data rows (starting from row 2)
      // So actual spreadsheet row = rowIndex + 2
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `Shifts!A${rowIndex + 2}:D${rowIndex + 2}`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [[date, email, 'approved', monthYear]],
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

export async function assignShift(date: string, email: string): Promise<boolean> {
  try {
    if (USE_MOCK_DATA) {
      const existing = mockShifts.find(s => s.date === date && s.volunteerEmail === email);
      const monthYear = new Date(date).toLocaleDateString('he-IL', { year: 'numeric', month: 'long' });
      if (existing) {
        existing.status = 'approved';
      } else {
        mockShifts.push({ date, volunteerEmail: email, status: 'approved', monthYear });
      }
      return true;
    }

    // Try to find existing row to update
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Shifts!A2:D',
    });

    const rows = response.data.values || [];
    const rowIndex = rows.findIndex((row: any[]) => row[0] === date && row[1] === email);
    if (rowIndex !== -1) {
      const monthYear = rows[rowIndex][3] || new Date(date).toLocaleDateString('he-IL', { year: 'numeric', month: 'long' });
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `Shifts!A${rowIndex + 2}:D${rowIndex + 2}`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [[date, email, 'approved', monthYear]],
        },
      });
      return true;
    }

    // Append new approved shift if not existing
    const monthYear = new Date(date).toLocaleDateString('he-IL', { year: 'numeric', month: 'long' });
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Shifts!A:D',
      valueInputOption: 'RAW',
      requestBody: {
        values: [[date, email, 'approved', monthYear]],
      },
    });
    return true;
  } catch (error) {
    console.error('Error assigning shift:', error);
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
      range: 'Shifts!A2:D',
    });

    const rows = response.data.values || [];
    const normalized = (s: any) => (typeof s === 'string' ? s.trim() : s);
    // Try exact match, then fallback to ISO normalization
    let rowIndex = rows.findIndex((row: any[]) => normalized(row[0]) === date && normalized(row[1]) === email);
    if (rowIndex === -1) {
      const dateIso = new Date(date).toISOString().slice(0, 10);
      rowIndex = rows.findIndex((row: any[]) => {
        const rowDate = typeof row[0] === 'string' ? row[0].trim() : row[0];
        const rowIso = rowDate ? new Date(rowDate).toISOString().slice(0, 10) : '';
        return rowIso === dateIso && normalized(row[1]) === email;
      });
    }

    if (rowIndex !== -1) {
      // rowIndex is 0-based in data rows (starting from row 2)
      // So actual spreadsheet row = rowIndex + 2 (header is row 1)
      // Actually delete the row instead of just clearing it
      const sheetRowNumber = rowIndex + 2;
      
      // Get the sheet ID for the Shifts sheet
      const spreadsheet = await sheets.spreadsheets.get({
        spreadsheetId: SPREADSHEET_ID,
      });
      const shiftsSheet = spreadsheet.data.sheets?.find(
        (sheet: any) => sheet.properties.title === 'Shifts'
      );
      const sheetId = shiftsSheet?.properties.sheetId || 0;
      
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: {
          requests: [{
            deleteDimension: {
              range: {
                sheetId: sheetId,
                dimension: 'ROWS',
                startIndex: sheetRowNumber - 1, // 0-based index (sheet row 2 = index 1)
                endIndex: sheetRowNumber, // endIndex is exclusive
              },
            },
          }],
        },
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

