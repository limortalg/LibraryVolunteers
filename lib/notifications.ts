import { getAllShifts, getVolunteers } from './sheets';
import { google } from 'googleapis';

interface Shift {
  date: string;
  volunteerEmail: string;
  status: 'proposed' | 'approved' | 'assigned';
  monthYear: string;
}

function generateMonthlyCalendarHTML(
  month: Date,
  allShifts: Shift[],
  emailToName: Record<string, string>,
  recipientEmail: string
): string {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const byDate: Record<string, Shift[]> = {};
  for (const s of allShifts) {
    const d = new Date(s.date);
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    if (!byDate[key]) byDate[key] = [];
    byDate[key].push(s);
  }
  // Only Sunday-Thursday (no Friday/Saturday)
  const weekdayNames = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳']; // Sun..Thu in he-IL
  const title = month.toLocaleDateString('he-IL', { month: 'long', year: 'numeric' });

  // For each weekday (Sun..Thu = 0..4), find the first date number in the month that falls on that weekday
  const firstDateForWeekday: number[] = [];
  for (let wd = 0; wd <= 4; wd++) {
    let first = -1;
    for (let d = 1; d <= 7; d++) {
      const g = new Date(year, monthIndex, d).getDay(); // 0=Sun..6=Sat
      if (g === wd) { first = d; break; }
    }
    firstDateForWeekday[wd] = first; // could be -1 when the month starts Fri/Sat and wd not found within 1..7? No, all 0..6 appear within 1..7
  }

  let html = '';
  html += `<div style="font-family: Arial, Helvetica, sans-serif; direction: rtl; text-align: right;">`;
  html += `<h2 style="margin: 0 0 8px 0;">לוח משמרות חודש ${title}</h2>`;
  html += `<div style="margin:0 0 6px 0; font-size: 13px;">`
       +  `<span style="display:inline-block; padding:2px 6px; background:#fff3cd; border:1px solid #ffeeba;">המשמרות שלך מסומנות</span>`
       +  `</div>`;

  html += `<table style="border-collapse: collapse; width: 100%; max-width: 560px; table-layout: fixed; font-size: 11px;">\n`
       +  `  <thead>\n`
       +  `    <tr>` + weekdayNames.map(name => `<th style="border:1px solid #ddd; padding:3px; background:#f7f7f7;">${name}</th>`).join('') + `</tr>\n`
       +  `  </thead>\n`
       +  `  <tbody>`;

  // Render up to 6 rows (weeks). Each cell for column wd has date = firstDateForWeekday[wd] + 7*week
  for (let week = 0; week < 6; week++) {
    let row = '<tr>';
    for (let wd = 0; wd < 5; wd++) {
      const base = firstDateForWeekday[wd];
      const dateNum = base + 7 * week;
      if (base < 1 || dateNum > daysInMonth) {
        row += `<td style="border:1px solid #ddd; padding:3px; vertical-align: top; height:34px; background:#fafafa;"></td>`;
      } else {
        const key = `${year}-${monthIndex}-${dateNum}`;
        const items = (byDate[key] || []).sort((a, b) => (emailToName[a.volunteerEmail] || '').localeCompare(emailToName[b.volunteerEmail] || ''));
        const preferred = items.find(s => s.volunteerEmail === recipientEmail) || items[0];
        const name = preferred ? (emailToName[preferred.volunteerEmail] || preferred.volunteerEmail) : '';
        const isMine = preferred ? preferred.volunteerEmail === recipientEmail : false;
        const badgeStyle = isMine ? 'background:#fff3cd; border-radius:3px; padding:1px 4px;' : '';
        row += `<td style="border:1px solid #ddd; padding:3px; vertical-align: top; height:34px;">\n`
            +  `  <div style="font-weight:bold;">${dateNum}</div>\n`
            +  `  <div><span style="${badgeStyle}">&nbsp;${name || '—'}</span></div>\n`
            +  `</td>`;
      }
    }
    row += '</tr>';
    html += row;
    // stop when the next week's earliest date would exceed month length
    const minNext = Math.min(...firstDateForWeekday.map(b => b + 7 * (week + 1)));
    if (minNext > daysInMonth) break;
  }

  html += `</tbody></table></div>`;
  return html;
}

export async function sendWeeklyReminders() {
  try {
    const shifts = await getAllShifts();
    const volunteers = await getVolunteers();
    
    const today = new Date();
    const thisSunday = new Date(today);
    thisSunday.setDate(today.getDate() + (7 - today.getDay()));
    thisSunday.setHours(8, 0, 0, 0);
    
    const nextSunday = new Date(thisSunday);
    nextSunday.setDate(thisSunday.getDate() + 7);
    
    const weeklyShifts = shifts.filter(shift => {
      const shiftDate = new Date(shift.date);
      return shiftDate >= thisSunday && shiftDate < nextSunday && shift.status === 'approved';
    });
    
    const shiftsByVolunteer: Record<string, Shift[]> = {};
    weeklyShifts.forEach(shift => {
      if (!shiftsByVolunteer[shift.volunteerEmail]) {
        shiftsByVolunteer[shift.volunteerEmail] = [];
      }
      shiftsByVolunteer[shift.volunteerEmail].push(shift);
    });
    
    // Send actual email notifications
    for (const [email, volunteerShifts] of Object.entries(shiftsByVolunteer)) {
      const volunteer = volunteers.find(v => v.email === email);
      if (volunteer && volunteerShifts.length > 0) {
        const shiftDates = volunteerShifts.map(s => new Date(s.date).toLocaleDateString('he-IL')).join(', ');
        const subject = 'תזכורת משמרות השבוע';
        const body = `<h2>שלום ${volunteer.name}!</h2><p>זוהי תזכורת למשמרות שלך השבוע:</p><ul>${volunteerShifts.map(s => `<li>${new Date(s.date).toLocaleDateString('he-IL')}</li>`).join('')}</ul><p>תודה על ההתנדבות!</p>`;
        await sendEmail(email, subject, body);
      }
    }
    
    return { success: true, count: Object.keys(shiftsByVolunteer).length };
  } catch (error) {
    console.error('Error sending weekly reminders:', error);
    return { success: false, error };
  }
}

export async function sendMonthlySchedule() {
  try {
    const shifts = await getAllShifts();
    const volunteers = await getVolunteers();
    
    // Set to first day of current month, then add 1 month to get first day of next month
    // This avoids date overflow issues (e.g., Oct 31 -> Nov 31 would become Dec 1)
    const nextMonth = new Date();
    nextMonth.setDate(1);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    // Keep only approved shifts of next month
    const monthlyShifts = shifts.filter(shift => {
      const shiftDate = new Date(shift.date);
      return shiftDate.getMonth() === nextMonth.getMonth() && 
             shiftDate.getFullYear() === nextMonth.getFullYear() &&
             shift.status === 'approved';
    });
    
    // Helper maps
    const emailToName: Record<string, string> = {};
    for (const v of volunteers) emailToName[v.email] = v.name;
    
    // Build a month calendar for all shifts; highlight recipient's shifts
    // (calendar HTML generated via top-level helper)
 
    // Send actual email notifications
    let sentCount = 0;
    for (const volunteer of volunteers) {
      const subject = `לוח משמרות חודש ${nextMonth.toLocaleDateString('he-IL', { month: 'long', year: 'numeric' })}`;
      const calendarHtml = generateMonthlyCalendarHTML(nextMonth, monthlyShifts, emailToName, volunteer.email);
      const body = `<p>שלום ${volunteer.name}!</p><p>להלן לוח המשמרות המלא לחודש הבא. המשמרות שלך מסומנות.</p>${calendarHtml}<p style=\"margin-top:12px;\">תודה על ההתנדבות!</p>`;
      await sendEmail(volunteer.email, subject, body);
      sentCount++;
    }
    
    return { success: true, count: sentCount };
  } catch (error) {
    console.error('Error sending monthly schedule:', error);
    return { success: false, error };
  }
}

export async function sendProposalReminder() {
  try {
    const volunteers = await getVolunteers();
    
    // Send actual email notifications
    // Set to first day of current month, then add 1 month to get first day of next month
    // This avoids date overflow issues (e.g., Oct 31 -> Nov 31 would become Dec 1)
    const nextMonth = new Date();
    nextMonth.setDate(1);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const nextMonthName = nextMonth.toLocaleDateString('he-IL', { month: 'long', year: 'numeric' });
    
    for (const volunteer of volunteers) {
      const subject = `תזכורת: נא להציע משמרות לחודש הבא`;
      const baseUrl = process.env.NEXTAUTH_URL?.trim() || 'http://localhost:3000';
      const urlWithCacheBust = `${baseUrl}?v=${Date.now()}`;
      const body = `<h2>שלום ${volunteer.name}!</h2><p>זוהי תזכורת להציע משמרות לחודש ${nextMonthName}.</p><p>אנא התחבר/י למערכת והציע/י את המשמרות הזמינים לך:</p><p><a href="${urlWithCacheBust}">התחבר למערכת</a></p><p>תודה!</p>`;
      await sendEmail(volunteer.email, subject, body);
    }
    
    return { success: true, count: volunteers.length };
  } catch (error) {
    console.error('Error sending proposal reminder:', error);
    return { success: false, error };
  }
}

export async function sendEmail(to: string, subject: string, body: string) {
  try {
    // Check if we have a Gmail refresh token
    if (!process.env.GMAIL_REFRESH_TOKEN) {
      console.log('Gmail refresh token not configured. Emails will not be sent.');
      return { success: false, error: 'Gmail refresh token not configured' };
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID?.trim(),
      process.env.GOOGLE_CLIENT_SECRET?.trim(),
      process.env.NEXTAUTH_URL?.trim() || 'http://localhost:3000'
    );

    // Set refresh token to get access token
    oauth2Client.setCredentials({
      refresh_token: process.env.GMAIL_REFRESH_TOKEN.trim(),
    });

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    // Ensure fromEmail is properly trimmed and has no newlines
    const fromEmail = (process.env.GMAIL_FROM || 'noreply@library.com').trim().replace(/\r?\n/g, '');
    
    // Clean up body HTML
    const cleanBody = body.trim();
    // Wrap body to enforce RTL rendering in email clients
    const wrappedBody = `<!DOCTYPE html><html lang="he" dir="rtl"><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8" /></head><body style="direction: rtl; text-align: right; font-family: Arial, Helvetica, sans-serif;">${cleanBody}</body></html>`;
    
    // Encode Hebrew subject using RFC 2047 Base64 (simpler and more reliable)
    const encodedSubject = `=?UTF-8?B?${Buffer.from(subject, 'utf-8').toString('base64')}?=`;
    
    // Create email in RFC 822 format
    const date = new Date().toUTCString();
    
    // Build complete message with explicit CRLF line endings
    // Gmail is very strict about the format - RFC 5322 compliant
    // Ensure all values are trimmed to avoid extra whitespace
    const cleanTo = to.trim().replace(/\r?\n/g, '');
    const cleanSubject = encodedSubject.trim().replace(/\r?\n/g, '');
    
    const messageParts: string[] = [];
    messageParts.push(`From: ${fromEmail}\r\n`);
    messageParts.push(`To: ${cleanTo}\r\n`);
    messageParts.push(`Subject: ${cleanSubject}\r\n`);
    messageParts.push(`Date: ${date}\r\n`);
    messageParts.push(`Message-ID: <${Date.now()}-${Math.random().toString(36).substring(2, 15)}@library>\r\n`);
    messageParts.push(`MIME-Version: 1.0\r\n`);
    messageParts.push(`Content-Type: text/html; charset=UTF-8\r\n`);
    messageParts.push(`Content-Language: he\r\n`);
    messageParts.push(`Content-Transfer-Encoding: 8bit\r\n`);
    messageParts.push(`\r\n`); // BLANK LINE - separates headers from body
    messageParts.push(wrappedBody); // Body starts here
    
    const message = messageParts.join('');

    // Gmail API requires standard base64 encoding (NOT base64url)
    // Make sure to encode from UTF-8 and convert to base64 with padding
    const messageBuffer = Buffer.from(message, 'utf-8');
    const encodedMessage = messageBuffer.toString('base64');

    // Log the message format for debugging
    const headerEndIndex = message.indexOf('\r\n\r\n');
    const headers = message.substring(0, headerEndIndex);
    const headerLines = headers.split('\r\n').filter(line => line.length > 0);
    
    // Check for any issues
    const hasExtraBlankLines = /\r\n\r\n/.test(headers);
    const fromEmailBytes = Array.from(fromEmail).map(c => c.charCodeAt(0));
    
    console.log('=== EMAIL DEBUG INFO ===');
    console.log('From email value:', JSON.stringify(fromEmail));
    console.log('From email bytes:', fromEmailBytes);
    console.log('Header count:', headerLines.length);
    console.log('Headers:');
    headerLines.forEach((line, i) => {
      const bytes = Array.from(line).map(c => c.charCodeAt(0));
      console.log(`  ${i + 1}. ${JSON.stringify(line)} (bytes: ${bytes.join(',')})`);
    });
    console.log('Has extra blank lines in headers:', hasExtraBlankLines);
    console.log('Has proper header-body separator (double CRLF):', headerEndIndex !== -1);
    console.log('Message length:', message.length);
    console.log('Body length:', message.length - headerEndIndex - 4);
    console.log('Base64 encoded length:', encodedMessage.length);
    console.log('Base64 ends with padding:', encodedMessage.endsWith('='));
    console.log('First 200 chars of base64:', encodedMessage.substring(0, 200));
    
    await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
      },
    });

    console.log(`Email sent successfully to ${to}`);
    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function sendInvite(email: string, volunteerName?: string) {
  try {
    const subject = 'הזמנה להתנדבות בספריה';
    const baseUrl = process.env.NEXTAUTH_URL?.trim() || 'http://localhost:3000';
    const urlWithCacheBust = `${baseUrl}?v=${Date.now()}`;
    const body = `<h2>שלום ${volunteerName || ''}!</h2><p>הוזמנת להצטרף למערכת ניהול המשמרות של הספריה.</p><p>אנא התחבר/י דרך: <a href="${urlWithCacheBust}">${baseUrl}</a></p><p>ניתן להתחבר באמצעות חשבון Google שלך.</p><p>תודה!</p>`;
    return await sendEmail(email, subject, body);
  } catch (error) {
    console.error('Error sending invite:', error);
    return { success: false, error };
  }
}

