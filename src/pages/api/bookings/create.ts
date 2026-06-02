import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const db = locals.runtime.env.DB;
    const ctx = locals.runtime.ctx;
    const body = await request.json();

    const { clientName, clientEmail, meetingSubject, startTime, endTime, opportunityId } = body;

    if (!clientName || !clientEmail || !startTime || !endTime) {
      return new Response(
        JSON.stringify({ error: 'Required tracking metadata is absent.' }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const bookingId = crypto.randomUUID();

    // Log the reservation securely within the D1 ledger
    await db.prepare(`
      INSERT INTO bookings (id, opportunity_id, client_name, client_email, meeting_subject, start_time, end_time, uk_gdpr_consent_logged)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1)
    `).bind(
      bookingId,
      opportunityId || null,
      clientName,
      clientEmail,
      meetingSubject || 'Strategic IT Infrastructure Consultation',
      startTime,
      endTime
    ).run();

    // Asynchronous background webhook notification sent straight to self-hosted n8n container
    const n8nEndpoint = 'https://automation.jsos.uk/webhook/v1/calendar-sync';
    
    ctx.waitUntil(
      fetch(n8nEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: 'booking.confirmed', bookingId, clientName, clientEmail, startTime, endTime })
      }).catch((err) => console.error('Background n8n link error context safely ignored:', err))
    );

    return new Response(
      JSON.stringify({ success: true, bookingId }), 
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: 'Database scheduling collision encountered.', details: error.message }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
