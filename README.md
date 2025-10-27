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

להגדרה מפורטת ומדריך מלא, ראה את הקובץ [SETUP.md](./SETUP.md)

### התקנה מהירה:

1. התקן את התלויות:
```bash
npm install
```

2. הגדר משתני סביבה ב-`.env.local` (ראה `.env.local.example`)

3. צור אייקונים ל-PWA (192x192 ו-512x512 pixels) והכנס ל-`public/`

4. הפעל את השרת:
```bash
npm run dev
```

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

