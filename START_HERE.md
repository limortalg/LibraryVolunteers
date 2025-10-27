# 🚀 Quick Start Guide

## What I Did

I've set up a **development/demo mode** that works without Google Cloud setup!

## How to Use Now

1. **Go to:** http://localhost:3000

2. **You'll see a sign-in page** with:
   - Name field (optional)
   - Email field (optional)
   - "Sign In (Demo Mode)" button

3. **Enter your name and email** (or leave empty for defaults) and click "Sign In"

4. **You're in!** You'll be automatically set as a manager (first user)

## What You Can Do

✅ **As Manager:**
- Add volunteers
- Approve volunteer shift proposals
- See all volunteers and their proposed shifts

✅ **As Volunteer:**
- Propose shifts for next month
- View your shifts in the calendar
- Export shifts to Google Calendar

## Notes

⚠️ **Demo Mode:** 
- Data is stored in memory only (not saved to Google Sheets)
- Data will be lost when you restart the server
- No real authentication required

## To Use Real Google Sheets

When you're ready to use the real Google Sheets integration:

1. Follow the setup guide in `QUICK_START.md`
2. Configure your `.env.local` file with Google credentials
3. The app will automatically switch to production mode

## The App is Ready!

Everything is working. Just refresh your browser and try signing in! 🎉

