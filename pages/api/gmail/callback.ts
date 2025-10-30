import type { NextApiRequest, NextApiResponse } from 'next';
import { google } from 'googleapis';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const code = req.query.code as string;

  if (!code) {
    return res.status(400).send('No code provided');
  }

  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/gmail/callback`
    );

    const { tokens } = await oauth2Client.getToken(code);

    res.send(`
      <html>
        <head><title>Gmail Token</title></head>
        <body style="font-family: Arial; padding: 40px;">
          <h2>✅ Success! Gmail Authorization Complete</h2>
          <p>Your refresh token:</p>
          <textarea style="width: 100%; height: 100px; font-family: monospace;">${tokens.refresh_token}</textarea>
          <p style="margin-top: 20px;"><strong>Next steps:</strong></p>
          <ol>
            <li>Copy the refresh token above</li>
            <li>Add it to Vercel Environment Variables as <code>GMAIL_REFRESH_TOKEN</code></li>
            <li>Also add <code>GMAIL_FROM</code> = your email address (e.g., yourname@gmail.com)</li>
            <li>Deploy the app</li>
          </ol>
        </body>
      </html>
    `);
  } catch (error) {
    res.status(400).send(`Error: ${error}`);
  }
}

