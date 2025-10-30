const { google } = require('googleapis');
require('dotenv').config({ path: '.env.local' });

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.NEXTAUTH_URL || 'http://localhost:3000';

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  `${REDIRECT_URI}/api/gmail/callback`
);

const scopes = [
  'https://www.googleapis.com/auth/gmail.send'
];

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: scopes,
  prompt: 'consent'
});

console.log('\n=== Gmail OAuth Setup ===\n');
console.log('1. Open this URL in your browser:');
console.log('\n' + authUrl + '\n');
console.log('2. Login with YOUR Gmail account and authorize');
console.log('3. You will be redirected to a URL like:');
console.log('   http://localhost:3000/api/gmail/callback?code=YOUR_CODE');
console.log('4. Copy the code from the URL (the part after code=)');
console.log('\n5. Then run: node scripts/exchange-gmail-token.js YOUR_CODE\n');

