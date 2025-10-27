# Quick Setup Checklist

Use this as a quick reference while setting up. Check off each item as you complete it.

## Pre-Setup
- [ ] Have a Google account ready
- [ ] Have a notepad or text editor ready to copy values
- [ ] Project is cloned/downloaded
- [ ] `npm install` completed

## Google Cloud Setup
- [ ] Created project in Google Cloud Console
- [ ] Enabled Google Sheets API
- [ ] Enabled Google Identity API
- [ ] Configured OAuth consent screen
- [ ] Created OAuth client credentials
- [ ] **SAVED: Client ID**
- [ ] **SAVED: Client Secret**
- [ ] Created Service Account
- [ ] Created Service Account Key (JSON)
- [ ] **SAVED: client_email**
- [ ] **SAVED: private_key**

## Google Sheets Setup
- [ ] Created new Google Sheet
- [ ] Named it "Library Volunteers"
- [ ] Shared with service account email
- [ ] **SAVED: Spreadsheet ID**

## Local Configuration
- [ ] Created `.env.local` file
- [ ] Added all environment variables
- [ ] Generated NEXTAUTH_SECRET
- [ ] Generated CRON_SECRET
- [ ] Ran `npm run setup-sheets`
- [ ] Tested locally with `npm run dev`
- [ ] Verified data appears in Google Sheets

## Deployment
- [ ] Installed Vercel CLI
- [ ] Logged into Vercel
- [ ] Deployed with `vercel`
- [ ] Added all environment variables in Vercel dashboard
- [ ] Set NEXTAUTH_URL to production URL
- [ ] Redeployed with `vercel --prod`
- [ ] Updated OAuth redirect URI in Google Cloud Console
- [ ] Tested production deployment

## Post-Deployment
- [ ] First user logged in (becomes manager)
- [ ] Manager added volunteers
- [ ] Volunteers tested proposing shifts
- [ ] Manager tested approving shifts
- [ ] Shared app URL with volunteers

---

## Quick Command Reference

```bash
# Generate secrets
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Set up sheets structure
npm run setup-sheets

# Run locally
npm run dev

# Deploy to Vercel
vercel --prod

# Check deployment logs
vercel logs
```

---

## Important URLs

**Google Cloud Console:**
- https://console.cloud.google.com/

**Google Sheets:**
- https://sheets.google.com/

**Vercel Dashboard:**
- https://vercel.com/dashboard

**Local Development:**
- http://localhost:3000

---

## Troubleshooting

**"Unauthorized" errors:**
→ Service account doesn't have access to Google Sheet

**OAuth redirect URI mismatch:**
→ Add your production URL to Google Cloud Console

**Environment variables not working:**
→ Verify names match exactly in Vercel dashboard

**Sheets not updating:**
→ Check service account permissions

**Can't login:**
→ Verify OAuth credentials are correct

