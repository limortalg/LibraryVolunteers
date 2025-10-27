# 🚀 מדריך התחלה מהירה

## שלב 1: התקנת התלויות
```bash
npm install
```

## שלב 2: הגדרת Google Cloud

### א. יצירת פרויקט ב-Google Cloud Console
1. היכנס ל-https://console.cloud.google.com
2. צור פרויקט חדש
3. הפעל את Google Sheets API

### ב. יצירת Service Account
1. לך ל-IAM & Admin > Service Accounts
2. לחץ Create Service Account
3. תן שם ל-Service Account
4. לחץ Create and Continue
5. לחץ Done
6. לחץ על ה-Service Account שיצרת
7. לך לטאב Keys
8. לחץ Add Key > Create new key
9. בחר JSON והורד את הקובץ

### ג. יצירת OAuth Credentials
1. לך ל-APIs & Services > Credentials
2. לחץ Create Credentials > OAuth client ID
3. בחר Application type: Web application
4. הוסף Authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
5. לחץ Create
6. העתק את Client ID ו-Client Secret

### ד. יצירת Google Sheets
1. לך ל-https://sheets.google.com
2. צור גיליון חדש
3. העתק את ה-ID מה-URL (המחרוזת בין `/d/` ו-`/edit`)
4. שתף את הגיליון עם כתובת האימייל של ה-Service Account (ניתן למצוא ב-JSON שירדת)

## שלב 3: הגדרת משתני סביבה

צור קובץ `.env.local` עם התוכן הבא (החלף את הערכים שלך):

```env
# Google OAuth
GOOGLE_CLIENT_ID=הדבק_כאן_את_Client_ID
GOOGLE_CLIENT_SECRET=הדבק_כאן_את_Client_Secret

# Google Sheets API
GOOGLE_SHEETS_ID=הדבק_כאן_את_Sheet_ID
GOOGLE_SERVICE_ACCOUNT_EMAIL=הדבק_כאן_את_Service_Account_Email
GOOGLE_PRIVATE_KEY="הדבק_כאן_את_המפתח_הפרטי_מה-JSON"

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=הגרל_מחרוזת_אקראית_כלשהי
CRON_SECRET=הגרל_מחרוזת_אקראית_כלשהי_אחרת
```

הערה: עבור `GOOGLE_PRIVATE_KEY`, העתק את המפתח הפרטי מה-JSON שירדת (זה מתחיל ב-`-----BEGIN PRIVATE KEY-----`)

## שלב 4: יצירת מבנה Google Sheets

יש לך שתי אפשרויות:

### אפשרות א': אוטומטית (מומלץ)
```bash
npm run setup-sheets
```

### אפשרות ב': ידנית
1. פתח את הגיליון שיצרת
2. צור 3 טאבים (sheets):
   - **Volunteers**: הוסף כותרות בשורה 1: Name, Phone, Email, Monday, Tuesday, Wednesday, Thursday, Friday, IsManager
   - **Shifts**: הוסף כותרות בשורה 1: Date, VolunteerEmail, Status, MonthYear
   - **Proposals**: הוסף כותרות בשורה 1: VolunteerEmail, Date, Status, SubmittedAt

## שלב 5: יצירת אייקונים

צור שתי תמונות ריבועיות:
- `icon-192.png` (192x192 pixels)
- `icon-512.png` (512x512 pixels)

הכנס אותן לתיקייה `public/`

אפשרות מהירה: לך ל-https://www.favicon-generator.org או https://realfavicongenerator.net

## שלב 6: הפעלת האפליקציה

```bash
npm run dev
```

פתח את הדפדפן בכתובת: http://localhost:3000

## שלב 7: שימוש ראשוני

1. לחץ על "התחבר עם Google"
2. בחר את חשבון ה-Google שלך
3. אתה תוגדר אוטומטית כמנהל (המשתמש הראשון)
4. הוסף מתנדבים חדשים דרך פאנל המנהל
5. מתנדבים יכולים להציע התנדבות דרך הלוח שנה

## 🎉 סיימת!

האפליקציה פועלת! כעת תוכל:
- לנהל מתנדבים
- לאשר הצעות התנדבות
- לייצא משמרות ל-Google Calendar
- לקבל תזכורות

לקבלת עזרה נוספת, ראה את [USAGE.md](./USAGE.md)

