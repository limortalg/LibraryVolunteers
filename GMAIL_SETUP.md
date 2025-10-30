# Gmail API Setup Instructions

## Step 1: Enable Gmail API
Go to: https://console.cloud.google.com/apis/library/gmail.googleapis.com
Click "Enable"

## Step 2: Update OAuth Consent Screen
1. Go to: https://console.cloud.google.com/apis/credentials/consent
2. Click "Edit App"
3. Go to "Scopes" tab
4. Click "Add or Remove Scopes"
5. Search for "Gmail API" and add: `https://www.googleapis.com/auth/gmail.send`
6. Click "Update" and "Save and Continue"

## Step 3: Add Redirect URI
1. Go to: https://console.cloud.google.com/apis/credentials
2. Click your OAuth 2.0 Client ID
3. Add redirect URI: `https://library-volunteers.vercel.app/api/gmail/callback`
4. Save

## Step 4: Authorize Gmail
Open this URL in your browser and login with your Gmail account:
https://accounts.google.com/o/oauth2/v2/auth?access_type=offline&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fgmail.send&prompt=consent&response_type=code&client_id=679082688651-7asanenc7en1e94b7od3mdrthcn3frm5.apps.googleusercontent.com&redirect_uri=https%3A%2F%2Flibrary-volunteers.vercel.app%2Fapi%2Fgmail%2Fcallback

You'll be redirected to a page showing your refresh token.

## Step 5: Add to Vercel
1. Go to Vercel dashboard > Settings > Environment Variables
2. Add: `GMAIL_REFRESH_TOKEN` = [your token from step 4]
3. Add: `GMAIL_FROM` = [your email address, e.g., yourname@gmail.com]
4. Redeploy the app

Done! The email notifications will now work.

