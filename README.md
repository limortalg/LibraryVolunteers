# 📚 מערכת ניהול משמרות ספריה

אפליקציית PWA מודרנית מבוססת Google Sheets לניהול משמרות מתנדבי ספריה יישובית.

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![PWA](https://img.shields.io/badge/PWA-ready-green)

## תכונות

- 📱 אפליקציית PWA שניתן להתקין על טלפון נייד
- 🔐 התחברות עם חשבון Google
- 📅 לוח שנה מצומצם לצפייה במשמרות
- 📤 ייצוא משמרות ל-Google Calendar
- ✅ הצעת התנדבות לחודש הבא
- 👥 ניהול מתנדבים (למנהלים בלבד)
- ✉️ הודעות תזכורת אוטומטיות

## התקנה

### לפיתוח מקומי (Development)

להגדרה מפורטת ומדריך מלא, ראה את הקובץ [SETUP.md](./SETUP.md)

**התקנה מהירה:**
```bash
npm install
npm run dev
```

האפליקציה תרוץ בכתובת: http://localhost:3000

### לפריסה לייצור (Production)

למדריך פריסה מפורט כולל הגדרת Google Sheets ו-OAuth, ראה את הקובץ [DEPLOYMENT.md](./DEPLOYMENT.md)

**פריסה מהירה ל-Vercel:**
```bash
# התקן Vercel CLI
npm i -g vercel

# התחבר ל-Vercel
vercel login

# פרוס
vercel
```

**⚠️ חשוב**: לפני הפריסה, הקפד להגדיר:
1. משתני סביבה (ראה `.env.example`)
2. Google OAuth credentials
3. Google Service Account
4. Google Sheets עם מבנה נכון

## הגדרת Google Sheets

יצור גיליון עם הטבלאות הבאות:

### Sheet 1: Volunteers (מתנדבים)
עמודות: Name, Phone, Monday, Tuesday, Wednesday, Thursday, Friday, IsManager, Email

### Sheet 2: Shifts (משמרות)
עמודות: Date, VolunteerEmail, Status, MonthYear

### Sheet 3: Proposals (הצעות התנדבות)
עמודות: VolunteerEmail, Date, Status, SubmittedAt

## שימוש

למדריך שימוש מפורט, ראה את הקובץ [USAGE.md](./USAGE.md)

### התחלה מהירה:
1. המתנדב הראשון שיתחבר יוגדר כמנהל
2. מנהלים יכולים להוסיף מתנדבים ולאשר שיבוצים
3. מתנדבים יכולים להציע התנדבות ולראות את המשמרות שלהם

## תכונות

- 📱 **PWA מלא** - התקנה על טלפון נייד
- 🔐 **אימות Google** - התחברות מאובטחת
- 📅 **לוח שנה מצומצם** - תצוגה ברורה של משמרות
- 📤 **ייצוא ל-Google Calendar** - סנכרון אוטומטי
- ✅ **מערכת הצעות** - מתנדבים מציעים, מנהלים מאשרים
- 👥 **ניהול מתנדבים לאימות מתנדבים**
- 🎫 **הרשאות דינמיות** - המשתמש הראשון = מנהל
- ✉️ **תזכורות אוטומטיות** - שבועיות וחודשיות

