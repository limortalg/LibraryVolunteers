# מדריך התקנה מפורט

## שלב 1: הכנת Google Sheets

1. יצירת גיליון חדש ב-Google Sheets
2. יצירת שלושה טאבים:

### טאב 1: Volunteers
עמודות:
- A: Name
- B: Phone
- C: Email
- D: Monday
- E: Tuesday
- F: Wednesday
- G: Thursday
- H: Friday
- I: IsManager

שורה ראשונה: כותרות (Name, Phone, Email, Monday, Tuesday, Wednesday, Thursday, Friday, IsManager)

### טאב 2: Shifts
עמודות:
- A: Date
- B: VolunteerEmail
- C: Status
- D: MonthYear

שורה ראשונה: כותרות (Date, VolunteerEmail, Status, MonthYear)

### טאב 3: Proposals
עמודות:
- A: VolunteerEmail
- B: Date
- C: Status
- D: SubmittedAt

שורה ראשונה: כותרות (VolunteerEmail, Date, Status, SubmittedAt)

## שלב 2: יצירת Service Account

1. היכנס ל-Google Cloud Console
2. צור פרויקט חדש
3. הפעל את Google Sheets API
4. צור Service Account:
   - לך ל-IAM & Admin > Service Accounts
   - לחץ Create Service Account
   - תן שם ל-Service Account
   - לחץ Done
5. צור מפתח (Key):
   - לחץ על ה-Service Account שיצרת
   - לך לטאב Keys
   - לחץ Add Key > Create new key
   - בחר JSON והורד
6. שתף את הגיליון עם כתובת האימייל של ה-Service Account (ניתן למצוא ב-JSON שירדת)
7. העתק את המפתח הפרטי (private_key) מה-JSON לקובץ .env.local

## שלב 3: הגדרת Google OAuth

1. היכנס ל-Google Cloud Console
2. בחר את אותו פרויקט
3. הפעל את Google Identity API
4. צור OAuth Credentials
5. הוסף authorized redirect URIs:
   - http://localhost:3000/api/auth/callback/google (לפיתוח)
   - https://yourdomain.com/api/auth/callback/google (לייצור)

## שלב 4: התקנת התלויות

```bash
npm install
```

## שלב 5: הגדרת משתני סביבה

צור קובץ `.env.local` עם התוכן הבא:

```env
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_SHEETS_ID=your_spreadsheet_id
GOOGLE_SERVICE_ACCOUNT_EMAIL=your_service_account_email@...
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate_random_secret_here
CRON_SECRET=another_random_secret
```

## שלב 6: יצירת אייקונים ל-PWA

צור שתי תמונות:
- icon-192.png (192x192 pixels)
- icon-512.png (512x512 pixels)

הכנס אותן לתיקייה `public/`

## שלב 7: יצירת מבנה Google Sheets

אפשר ליצור את המבנה אוטומטית:

```bash
npm run setup-sheets
```

או להזין ידנית את הכותרות בגיליון (ראה את החלק הראשון במדריך זה).

## שלב 8: הפעלת השרת

```bash
npm run dev
```

פתח את הדפדפן בכתובת: http://localhost:3000

## שלב 9: הגדרת תזכורות (אופציונלי)

להגדרת תזכורות אוטומטיות:

1. השתמש ב-Vercel Cron Jobs או שירות דומה
2. הגדר שתי קריאות שבועיות:

**תזכורת שבועית (יום ראשון, 8:00):**
```
POST https://yourdomain.com/api/notifications/weekly
Authorization: Bearer YOUR_CRON_SECRET
```

**שליחת לוח זמנים חודשי:**
```
POST https://yourdomain.com/api/notifications/monthly
Authorization: Bearer YOUR_CRON_SECRET
```

## שימוש ראשוני

1. המתנדב הראשון שיתחבר יוגדר אוטומטית כמנהל
2. המנהל יכול להוסיף מתנדבים נוספים
3. מתנדבים יכולים להציע התנדבות באמצעות הלוח שנה
4. המנהל מאשר את ההצעות
5. מתנדבים מקבלים תזכורות באמצעות האפליקציה

## התקנה על טלפון נייד

1. פתח את האפליקציה בדפדפן הנייד
2. לחץ על תפריט הדפדפן
3. בחר "הוסף למסך הבית" או "Install App"
4. האפליקציה תופיע כאפליקציה עצמאית

