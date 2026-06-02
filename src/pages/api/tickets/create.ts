import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const db = locals.runtime.env.DB;
    const body = await request.json();
    
    const { clientId, assetId, title, description, priority } = body;

    if (!clientId || !title || !description || !priority) {
      return new Response(JSON.stringify({ error: 'Required ticket parameters are missing.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const ticketId = crypto.randomUUID();
    const now = new Date();
    
    let responseHours = 24;
    let resolutionHours = 72;

    // Enforce contractual SLA boundaries
    if (priority === 'Critical') {
      responseHours = 2;       // 2-Hour Critical Response Target
      resolutionHours = 8;     // 8-Hour Critical Resolution Target
    } else if (priority === 'High') {
      responseHours = 4;
      resolutionHours = 24;
    } else if (priority === 'Medium') {
      responseHours = 8;
      resolutionHours = 48;
    }

    const responseDeadline = new Date(now.getTime() + responseHours * 60 * 60 * 1000).toISOString();
    const resolutionDeadline = new Date(now.getTime() + resolutionHours * 60 * 60 * 1000).toISOString();

    // Persist ticket into the native D1 SQL ledger
    await db.prepare(`
      INSERT INTO tickets (id, client_id, asset_id, title, description, priority, status, sla_response_deadline, sla_resolution_deadline, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 'Open', ?, ?, DATETIME('now'))
    `).bind(ticketId, clientId, assetId || null, title, description, priority, responseDeadline, resolutionDeadline).run();

    return new Response(JSON.stringify({ 
      success: true, 
      ticketId, 
      slaResponseDeadline: responseDeadline, 
      slaResolutionDeadline: resolutionDeadline 
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: 'PSA routing system failure.', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
