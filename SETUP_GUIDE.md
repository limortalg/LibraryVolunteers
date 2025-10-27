# Step-by-Step Setup Guide

Follow these steps in order. Don't skip ahead!

## 🔴 IMPORTANT: Keep a notepad ready to copy values

As you go through these steps, copy and save:
- Client ID
- Client Secret  
- Service Account Email
- Private Key
- Spreadsheet ID

---

## Step 1: Google Cloud Console Setup

### 1.1 Create a Project

1. Open: https://console.cloud.google.com/
2. If you see a project dropdown at the top, click it
3. Click **"New Project"**
4. Name: `Library Volunteers` (or any name you like)
5. Click **"Create"**
6. Wait for it to finish (about 10 seconds)
7. Select the new project from the dropdown at the top

**✅ Checkpoint:** You should see "Library Volunteers" (or your project name) at the top of the page

---

## Step 2: Enable APIs

### 2.1 Enable Google Sheets API

1. In the search bar at the top, type: `Google Sheets API`
2. Click on **"Google Sheets API"**
3. Click the blue **"Enable"** button
4. Wait for it to enable (check for green checkmark)

### 2.2 Enable Google Identity API

1. Search for: `Google Identity API`
2. Click on **"Google Identity API"**
3. Click **"Enable"**
4. Wait for it to enable

**✅ Checkpoint:** Both APIs should be enabled (you'll see them with "Enabled" status)

---

## Step 3: Create OAuth Credentials (for User Login)

### 3.1 Configure OAuth Consent Screen

1. Search for: `OAuth consent screen`
2. Click **"OAuth consent screen"**
3. User Type: Select **"External"**
4. Click **"Create"**
5. Fill in:
   - App name: `Library Volunteers`
   - User support email: Your email
   - Developer contact email: Your email
6. Click **"Save and Continue"**
7. On the next screen (Scopes), click **"Save and Continue"** (don't add anything)
8. On Test users screen, click **"Save and Continue"** (skip for now)
9. On Summary screen, click **"Back to Dashboard"**

**✅ Checkpoint:** You should see "OAuth consent screen" configured

### 3.2 Create OAuth Client

1. Search for: `Credentials`
2. Click **"Credentials"**
3. Click **"+ Create Credentials"** dropdown
4. Select **"OAuth client ID"**
5. Application type: **"Web application"**
6. Name: `Library Volunteers Web`
7. Authorized redirect URIs:
   - Click **"+ Add URI"**
   - Add: `http://localhost:3000/api/auth/callback/google`
   - Click **"+ Add URI"** again
   - Add: `https://YOUR_DOMAIN.vercel.app/api/auth/callback/google` (replace YOUR_DOMAIN with what you'll use, e.g., `library-volunteers`)
8. Click **"Create"**
9. **⚠️ IMPORTANT:** Copy these values (you won't see them again):
   - **Client ID** - Copy this!
   - **Client Secret** - Copy this!
10. Click **"OK"**

**✅ Checkpoint:** You have Client ID and Client Secret copied

---

## Step 4: Create Service Account (for Google Sheets Access)

### 4.1 Create Service Account

1. Search for: `Service Accounts`
2. Click **"Service Accounts"**
3. Click **"+ Create Service Account"**
4. Fill in:
   - Service account name: `library-sheets-service`
   - Description: `Service account for Library Volunteers app`
5. Click **"Create and Continue"**
6. Skip role assignment (leave empty)
7. Click **"Continue"**
8. Click **"Done"**

**✅ Checkpoint:** You should see "library-sheets-service" in the list

### 4.2 Create Key

1. Click on the service account email (starts with `library-sheets-service@...`)
2. Go to **"Keys"** tab
3. Click **"Add Key"** > **"Create new key"**
4. Select **"JSON"**
5. Click **"Create"**
6. A JSON file will download automatically
7. **⚠️ IMPORTANT:** Open the JSON file and save these values:
   - **`client_email`** - Copy this!
   - **`private_key`** - Copy this ENTIRE thing (keep all the `\n` characters)

**✅ Checkpoint:** You have client_email and private_key copied

---

## Step 5: Create Google Sheet

### 5.1 Create Spreadsheet

1. Go to: https://sheets.google.com/
2. Click **"Blank"** to create a new spreadsheet
3. Name it: `Library Volunteers`
4. Click **"Share"** button (top right)
5. Add the service account email (the `client_email` from the JSON file)
6. Give it **"Editor"** permissions
7. Click **"Send"**
8. **⚠️ IMPORTANT:** Copy the Spreadsheet ID from the URL:
   - URL looks like: `https://docs.google.com/spreadsheets/d/1a2b3c4d5e6f7g8h9i0j/edit`
   - The ID is: `1a2b3c4d5e6f7g8h9i0j` (everything between `/d/` and `/edit`)

**✅ Checkpoint:** You have the Spreadsheet ID copied

---

## Step 6: Configure Environment Variables

### 6.1 Create .env.local file

Open your project folder and create a file named `.env.local`

### 6.2 Add Variables

Copy this template and fill in YOUR values:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=PASTE_YOUR_CLIENT_ID_HERE
GOOGLE_CLIENT_SECRET=PASTE_YOUR_CLIENT_SECRET_HERE

# Google Sheets Configuration
GOOGLE_SHEETS_ID=PASTE_YOUR_SPREADSHEET_ID_HERE
GOOGLE_SERVICE_ACCOUNT_EMAIL=PASTE_YOUR_CLIENT_EMAIL_HERE
GOOGLE_PRIVATE_KEY="PASTE_YOUR_PRIVATE_KEY_HERE"

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate_random_secret_here
CRON_SECRET=generate_random_secret_here
```

### 6.3 Generate Secrets

Run these commands in your terminal:

```bash
# Generate NEXTAUTH_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Generate CRON_SECRET  
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Copy the output for each secret.

**✅ Checkpoint:** You have a complete `.env.local` file with all values filled in

---

## Step 7: Set Up Sheets Structure

### 7.1 Run Setup Script

```bash
npm run setup-sheets
```

This will create the required sheets with headers in your Google Sheet.

**✅ Checkpoint:** Script completes without errors

---

## Step 8: Test Locally

### 8.1 Start the Server

```bash
npm run dev
```

### 8.2 Open Browser

Go to: http://localhost:3000

### 8.3 Test Login

1. Click "Sign in with Google"
2. Sign in with your Google account
3. You should see the dashboard
4. Try adding a volunteer
5. Check your Google Sheet - data should appear!

**✅ Checkpoint:** Everything works and data appears in Google Sheets

---

## Step 9: Deploy to Vercel

### 9.1 Install Vercel CLI

```bash
npm i -g vercel
```

### 9.2 Login to Vercel

```bash
vercel login
```

Follow the prompts to login with GitHub.

### 9.3 Deploy

```bash
vercel
```

Answer the prompts:
- Set up and deploy: **Yes**
- Which scope: Choose your account
- Link to existing project: **No**
- Project name: `library-volunteers` (or any name)
- Directory: **./**
- Override settings: **No**

### 9.4 Add Environment Variables in Vercel

1. Go to: https://vercel.com/dashboard
2. Click on your project
3. Go to **Settings** > **Environment Variables**
4. Add each variable from your `.env.local`:
   - Click **"Add New"**
   - Name: `GOOGLE_CLIENT_ID`
   - Value: Your client ID
   - Environment: All environments
   - Click **"Save"**
5. Repeat for ALL variables:
   - `GOOGLE_CLIENT_SECRET`
   - `GOOGLE_SHEETS_ID`
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `GOOGLE_PRIVATE_KEY`
   - `NEXTAUTH_URL` (set to your Vercel URL like `https://library-volunteers.vercel.app`)
   - `NEXTAUTH_SECRET`
   - `CRON_SECRET`

### 9.5 Redeploy

```bash
vercel --prod
```

**✅ Checkpoint:** Your app is live on Vercel!

---

## Step 10: Final Configuration

### 10.1 Update OAuth Redirect URI

1. Go back to Google Cloud Console
2. Search for: `Credentials`
3. Click on your OAuth client
4. Add a new redirect URI: `https://YOUR_APP.vercel.app/api/auth/callback/google`
5. Click **"Save"**

### 10.2 Update NEXTAUTH_URL in Vercel

1. Go to Vercel dashboard
2. Settings > Environment Variables
3. Edit `NEXTAUTH_URL`
4. Set it to your Vercel URL: `https://YOUR_APP.vercel.app`
5. Save

### 10.3 Redeploy

Vercel should auto-redeploy, or run:
```bash
vercel --prod
```

---

## 🎉 Done!

Your app is now deployed and working with Google Sheets!

**Next Steps:**
- Share the Vercel URL with your volunteers
- First person to login becomes the manager
- Managers can add volunteers and approve shifts
- Volunteers can propose shifts and see their calendar

**Need Help?**
- Check the terminal logs for errors
- Check Vercel deployment logs
- Verify all environment variables are set correctly

