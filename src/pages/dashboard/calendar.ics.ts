import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ locals }) => {
  try {
    const db = locals.runtime.env.DB;
    const bookedMeetings = (await db.prepare("SELECT * FROM bookings WHERE is_archived = 0").all()).results || [];

    const icsLines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//JSOS//Operations Calendar Feed//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'X-WR-CALNAME:JSOS Core Schedule'
    ];

    for (const meeting of bookedMeetings) {
      const cleanSubject = meeting.meeting_subject.replace(/[,;]/g, '\\$&');
      const cleanName = meeting.client_name.replace(/[,;]/g, '\\$&');
      
      const icsStart = meeting.start_time.replace(/[-:]/g, '').split('.')[0] + 'Z';
      const icsEnd = meeting.end_time.replace(/[-:]/g, '').split('.')[0] + 'Z';

      icsLines.push('BEGIN:VEVENT');
      icsLines.push(`UID:${meeting.id}@jsos.uk`);
      icsLines.push(`DTSTAMP:${icsStart}`);
      icsLines.push(`DTSTART:${icsStart}`);
      icsLines.push(`DTEND:${icsEnd}`);
      icsLines.push(`SUMMARY:${cleanSubject}`);
      icsLines.push(`DESCRIPTION:Participant: ${cleanName} \\nEmail: ${meeting.client_email} \\nStatus: ${meeting.status}`);
      icsLines.push('END:VEVENT');
    }

    icsLines.push('END:VCALENDAR');

    return new Response(icsLines.join('\r\n'), {
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'inline; filename="jsos-calendar.ics"',
        'Cache-Control': 'max-age=600'
      }
    });
  } catch (err) {
    return new Response('Calendar generation tracking exception occurred', { status: 500 });
  }
};
