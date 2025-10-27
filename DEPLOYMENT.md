# Deployment Guide - Library Volunteers Management System

This guide will help you deploy the Library Volunteers Management System to production with Google Sheets integration.

## Quick Start

1. **Follow the Google Setup** (5-10 minutes)
2. **Configure Environment Variables** (2 minutes)
3. **Deploy to Vercel** (5 minutes)
4. **Set up Sheets Structure** (1 minute)

Total time: ~15 minutes

---

## Part 1: Google Cloud Setup

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Create Project"
3. Name it (e.g., "Library Volunteers")
4. Click "Create"

### Step 2: Enable Required APIs

1. In your project, go to **APIs & Services** > **Library**
2. Search for and enable:
   - **Google Sheets API**
   - **Google Identity API**

### Step 3: Create OAuth Credentials (for user login)

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. If prompted, configure OAuth consent screen:
   - User Type: **External**
   - App name: Library Volunteers
   - Support email: your email
   - Scopes: Keep defaults
   - Save and continue
4. Create OAuth client:
   - Application type: **Web application**
   - Name: Library Volunteers Web
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google` (for testing)
     - `https://yourdomain.com/api/auth/callback/google` (for production)
   - Click **Create**
5. **Copy the Client ID and Client Secret** - you'll need these

### Step 4: Create Service Account (for Google Sheets access)

1. Go to **IAM & Admin** > **Service Accounts**
2. Click **Create Service Account**
3. Fill in:
   - Name: `library-sheets-service`
   - Description: Service account for Library Volunteers
4. Click **Create and Continue**
5. Skip the optional fields and click **Done**
6. Click on the newly created service account
7. Go to **Keys** tab
8. Click **Add Key** > **Create new key**
9. Select **JSON** and click **Create**
10. **Download the JSON file** - you'll need this

### Step 5: Create Google Sheet

1. Go to [Google Sheets](https://sheets.google.com/)
2. Create a new spreadsheet
3. Name it: "Library Volunteers"
4. **Share the sheet** with the service account email (found in the JSON file you downloaded)
   - Click **Share** button
   - Add the service account email
   - Give it **Editor** permissions
5. **Copy the Spreadsheet ID** from the URL:
   ```
   https://docs.google.com/spreadsheets/d/SPREADSHEET_ID_HERE/edit
   ```

---

## Part 2: Configure Environment Variables

### For Local Development

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Open `.env.local` and fill in the values:

   **From OAuth Credentials:**
   - `GOOGLE_CLIENT_ID` - Your OAuth Client ID
   - `GOOGLE_CLIENT_SECRET` - Your OAuth Client Secret

   **From Service Account JSON:**
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL` - The `client_email` field
   - `GOOGLE_PRIVATE_KEY` - The `private_key` field (keep quotes and `\n` characters)

   **From Google Sheet:**
   - `GOOGLE_SHEETS_ID` - The Spreadsheet ID from the URL

   **Generate these secrets:**
   ```bash
   # Generate NEXTAUTH_SECRET
   openssl rand -base64 32
   
   # Generate CRON_SECRET
   openssl rand -base64 32
   ```

3. Save the file

### Example `.env.local`:

```env
GOOGLE_CLIENT_ID=123456789-abcdefgh.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnopqrstuvwx
GOOGLE_SHEETS_ID=1a2b3c4d5e6f7g8h9i0j
GOOGLE_SERVICE_ACCOUNT_EMAIL=library-sheets-service@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=YourRandomSecret32Characters
CRON_SECRET=AnotherRandomSecret32Characters
```

---

## Part 3: Set Up Google Sheets Structure

Run the setup script to create the required sheets:

```bash
npm run setup-sheets
```

This will create three sheets with headers:
- **Volunteers** - Name, Phone, Email, Monday-Sunday, IsManager
- **Shifts** - Date, VolunteerEmail, Status, MonthYear
- **Proposals** - VolunteerEmail, Date, Status, SubmittedAt

**Or manually create the sheets** (see SETUP.md for column details)

---

## Part 4: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard

1. Go to [Vercel](https://vercel.com/)
2. Sign in with GitHub
3. Click **Add New Project**
4. Import your GitHub repository
5. Configure environment variables in Vercel:
   - Go to **Settings** > **Environment Variables**
   - Add all variables from your `.env.local`
   - ⚠️ **Important**: Set `NEXTAUTH_URL` to your production domain
6. Click **Deploy**

### Option B: Deploy via CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Follow the prompts
```

### Configure Environment Variables in Vercel

In your Vercel project settings, add:

```
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_SHEETS_ID=your_spreadsheet_id
GOOGLE_SERVICE_ACCOUNT_EMAIL=your_service_account_email
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
NEXTAUTH_URL=https://yourdomain.vercel.app
NEXTAUTH_SECRET=your_secret
CRON_SECRET=your_cron_secret
```

⚠️ **Important**: After deployment, update your OAuth redirect URI in Google Cloud Console to include your Vercel domain.

---

## Part 5: Set Up Cron Jobs (Optional - for notifications)

### Option A: Vercel Cron Jobs

1. Go to your Vercel project
2. Go to **Settings** > **Cron Jobs**
3. Add two cron jobs:

**Weekly Reminder (Every Sunday at 8:00 AM):**
```json
{
  "path": "/api/notifications/weekly",
  "schedule": "0 8 * * 0"
}
```

**Monthly Schedule (1st of each month at 9:00 AM):**
```json
{
  "path": "/api/notifications/monthly",
  "schedule": "0 9 1 * *"
}
```

### Option B: External Cron Service

Use a service like cron-job.org or EasyCron:

- **URL**: `https://yourdomain.com/api/notifications/weekly`
- **Method**: POST
- **Headers**: `Authorization: Bearer YOUR_CRON_SECRET`
- **Schedule**: Every Sunday at 8:00 AM

---

## Part 6: Testing

1. **Test locally:**
   ```bash
   npm run dev
   ```
   Open http://localhost:3000

2. **Test authentication:**
   - Click "Sign in with Google"
   - First user becomes a manager automatically

3. **Test sheets:**
   - Add a volunteer
   - Check Google Sheets - data should appear

4. **Test production:**
   - Visit your Vercel URL
   - Login with Google
   - Verify everything works

---

## Troubleshooting

### Issue: "Unauthorized" errors

**Solution**: Make sure the service account email has Editor access to the Google Sheet.

### Issue: OAuth redirect URI mismatch

**Solution**: Add your production URL to Google Cloud Console OAuth settings:
1. Go to Google Cloud Console > APIs & Services > Credentials
2. Edit your OAuth 2.0 Client
3. Add redirect URI: `https://yourdomain.com/api/auth/callback/google`

### Issue: Environment variables not working

**Solution**: 
- Make sure variable names match exactly
- For multiline values (like private key), keep quotes and `\n`
- Redeploy after changing environment variables

### Issue: Sheets structure not created

**Solution**: Run the setup script:
```bash
npm run setup-sheets
```

Or manually create the sheets as described in SETUP.md

---

## Security Checklist

- [ ] Environment variables are set in Vercel
- [ ] `NEXTAUTH_SECRET` is a random 32+ character string
- [ ] `CRON_SECRET` is a random 32+ character string
- [ ] `.env.local` is in `.gitignore` (not committed)
- [ ] Service account has only necessary permissions
- [ ] OAuth consent screen is configured
- [ ] Redirect URIs are correct for your domain

---

## Post-Deployment

1. **First Login**: The first volunteer who logs in becomes a manager
2. **Add Volunteers**: Manager can add volunteers via the dashboard
3. **Share Access**: Share the app URL with your volunteers
4. **Mobile Install**: Volunteers can install as PWA on their phones

---

## Support

If you encounter issues:
1. Check the Vercel deployment logs
2. Check Google Cloud Console for API errors
3. Verify all environment variables are set correctly
4. Ensure Google Sheets has the correct structure

---

## Quick Reference

### Local Development
```bash
npm run dev          # Start dev server
npm run setup-sheets # Set up Google Sheets structure
```

### Production Deployment
```bash
vercel              # Deploy to Vercel
vercel env add     # Add environment variables
```

### Google Setup URLs
- [Google Cloud Console](https://console.cloud.google.com/)
- [Google Sheets](https://sheets.google.com/)
- [Vercel Dashboard](https://vercel.com/dashboard)

