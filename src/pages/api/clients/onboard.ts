import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const db = locals.runtime.env.DB;
    const body = await request.json();
    
    const { 
      companyName, 
      contactName, 
      email, 
      phone, 
      infrastructureNotes, 
      gdprStatus 
    } = body;

    // Rigid risk-mitigation validation check
    if (!companyName || !contactName || !email) {
      return new Response(
        JSON.stringify({ error: 'Mandatory client registration fields are missing.' }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const clientId = crypto.randomUUID();

    // Inserts structured record directly into Cloudflare D1 SQL layer
    await db.prepare(`
      INSERT INTO clients (id, company_name, contact_name, email, phone, infrastructure_notes, gdpr_status, dpo_sign_off_status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1)
    `).bind(
      clientId, 
      companyName, 
      contactName, 
      email, 
      phone || null, 
      infrastructureNotes || 'No initial infrastructure documentation appended.', 
      gdprStatus || 'Compliant'
    ).run();

    return new Response(
      JSON.stringify({ success: true, clientId, message: 'Client profile secure record created at the edge.' }), 
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: 'Data isolation operational failure.', details: error.message }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
