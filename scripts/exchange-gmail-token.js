const { google } = require('googleapis');
require('dotenv').config({ path: '.env.local' });

const code = process.argv[2];

if (!code) {
  console.log('Usage: node scripts/exchange-gmail-token.js YOUR_CODE');
  console.log('Get the code from the callback URL after authorizing Gmail');
  process.exit(1);
}

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.NEXTAUTH_URL || 'http://localhost:3000';

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  `${REDIRECT_URI}/api/gmail/callback`
);

oauth2Client.getToken(code, (err, token) => {
  if (err) {
    console.error('Error getting token:', err);
    return;
  }

  console.log('\n=== SUCCESS! ===\n');
  console.log('Add this to your .env.local file:');
  console.log('\nGMAIL_REFRESH_TOKEN=' + token.refresh_token + '\n');
  console.log('Also add this environment variable to Vercel:');
  console.log('1. Go to Vercel dashboard > Settings > Environment Variables');
  console.log('2. Add: GMAIL_REFRESH_TOKEN = ' + token.refresh_token);
  console.log('\n');
});

