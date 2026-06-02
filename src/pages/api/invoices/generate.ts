import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const db = locals.runtime.env.DB;
    const r2 = locals.runtime.env.INVOICE_VAULT;
    const body = await request.json();

    const { clientId, invoiceNumber, lineItems } = body; 
    // Example lineItems format: [{ description: "Out-of-scope Network Migration", cost: 450.00 }]

    if (!clientId || !invoiceNumber || !lineItems || !Array.isArray(lineItems)) {
      return new Response(JSON.stringify({ error: 'Invalid financial data payload.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Compute direct ledger balances
    const totalAmount = lineItems.reduce((sum: number, item: any) => sum + (item.cost || 0), 0);

    // Initialise 14-day standard corporate payment cycle parameters
    const issuedDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(issuedDate.getDate() + 14);

    const issuedStr = issuedDate.toISOString().split('T')[0];
    const dueStr = dueDate.toISOString().split('T')[0];
    
    const invoiceId = crypto.randomUUID();
    const r2StorageKey = `archives/${invoiceId}.json`;

    // 1. Generate and render the text/structured payload bundle representing the invoice contents
    const invoicePayload = {
      id: invoiceId,
      invoiceNumber,
      clientId,
      totalAmount,
      currency: 'GBP',
      issuedDate: issuedStr,
      dueDate: dueStr,
      breakdown: lineItems,
      complianceNotice: 'Regulated under England & Wales Jurisdiction. DPO Audit Verification: Joshua Stevens.'
    };

    // 2. Stream payload securely to Cloudflare R2 Vault
    await r2.put(r2StorageKey, JSON.stringify(invoicePayload, null, 2), {
      customMetadata: { clientId, invoiceNumber },
      contentType: 'application/json'
    });

    const r2PublicUrlTarget = `/vault/access/invoices/${invoiceId}`;

    // 3. Register the formal asset record into the D1 relational database
    await db.prepare(`
      INSERT INTO invoices (id, client_id, invoice_number, amount_due, currency, status, issued_date, due_date, r2_archive_url)
      VALUES (?, ?, ?, ?, 'GBP', 'Sent', ?, ?, ?)
    `).bind(invoiceId, clientId, invoiceNumber, totalAmount, issuedStr, dueStr, r2PublicUrlTarget).run();

    return new Response(JSON.stringify({ 
      success: true, 
      invoiceId, 
      amountDue: totalAmount, 
      paymentTerms: '14 Days Net',
      dueDate: dueStr,
      vaultStorageReference: r2StorageKey
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: 'Automated ledger compilation halted.', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
