/**
 * Script to create Google Sheets with required structure
 * Run this with: node scripts/create-sheets.js
 * Make sure to set GOOGLE_SHEETS_ID in .env.local first
 */

const { google } = require('googleapis');
require('dotenv').config({ path: '.env.local' });

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });
const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_ID;

async function createSheets() {
  try {
    console.log('Creating sheets structure...');

    // Create Volunteers sheet
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Volunteers!A1:I1',
      valueInputOption: 'RAW',
      requestBody: {
        values: [['Name', 'Phone', 'Email', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'IsManager']],
      },
    });

    // Create Shifts sheet
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Shifts!A1:D1',
      valueInputOption: 'RAW',
      requestBody: {
        values: [['Date', 'VolunteerEmail', 'Status', 'MonthYear']],
      },
    });

    // Create Proposals sheet
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Proposals!A1:D1',
      valueInputOption: 'RAW',
      requestBody: {
        values: [['VolunteerEmail', 'Date', 'Status', 'SubmittedAt']],
      },
    });

    console.log('✓ Sheets structure created successfully!');
    console.log('');
    console.log('Created sheets:');
    console.log('  - Volunteers (with headers)');
    console.log('  - Shifts (with headers)');
    console.log('  - Proposals (with headers)');
  } catch (error) {
    console.error('Error creating sheets:', error.message);
    process.exit(1);
  }
}

createSheets();

