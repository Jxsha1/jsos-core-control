CREATE TABLE IF NOT EXISTS clients (
    id TEXT PRIMARY KEY,
    company_name TEXT NOT NULL,
    contact_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    infrastructure_notes TEXT,
    status TEXT DEFAULT 'New Prospect',
    gdpr_status TEXT DEFAULT 'Compliant',
    dpo_sign_off_status INTEGER DEFAULT 1,
    is_archived INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS opportunities (
    id TEXT PRIMARY KEY,
    client_id TEXT REFERENCES clients(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    is_flat_fee INTEGER DEFAULT 1,
    flat_fee_amount REAL DEFAULT 0,
    is_recurring INTEGER DEFAULT 0,
    recurring_interval TEXT,
    recurring_amount REAL DEFAULT 0,
    gross_value REAL NOT NULL,
    stage TEXT DEFAULT 'Discovery',
    price_history TEXT,
    is_archived INTEGER DEFAULT 0,
    last_optimised DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS invoices (
    id TEXT PRIMARY KEY,
    client_id TEXT REFERENCES clients(id) ON DELETE RESTRICT,
    opportunity_id TEXT REFERENCES opportunities(id) ON DELETE SET NULL,
    invoice_number TEXT UNIQUE NOT NULL,
    item_description TEXT,
    is_flat_fee INTEGER DEFAULT 1,
    flat_fee_amount REAL DEFAULT 0,
    is_recurring INTEGER DEFAULT 0,
    recurring_interval TEXT,
    recurring_amount REAL DEFAULT 0,
    amount_due REAL NOT NULL,
    currency TEXT DEFAULT 'GBP',
    status TEXT DEFAULT 'Generated',
    issued_date TEXT NOT NULL,
    due_date TEXT NOT NULL,
    sent_date TEXT,
    paid_date TEXT,
    r2_archive_url TEXT,
    is_archived INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS availability_rules (
    id TEXT PRIMARY KEY,
    day_of_week INTEGER NOT NULL CHECK(day_of_week BETWEEN 0 AND 6),
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    slot_duration_minutes INTEGER DEFAULT 30
);

CREATE TABLE IF NOT EXISTS bookings (
    id TEXT PRIMARY KEY,
    opportunity_id TEXT REFERENCES opportunities(id) ON DELETE SET NULL,
    client_name TEXT NOT NULL,
    client_email TEXT NOT NULL,
    meeting_subject TEXT NOT NULL DEFAULT 'Strategic IT Consultation',
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    status TEXT DEFAULT 'Scheduled',
    uk_gdpr_consent_logged INTEGER DEFAULT 1,
    is_archived INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tickets (
    id TEXT PRIMARY KEY,
    client_id TEXT REFERENCES clients(id) ON DELETE CASCADE,
    asset_id TEXT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    priority TEXT DEFAULT 'Medium',
    status TEXT DEFAULT 'Open',
    sla_deadline TEXT,
    sla_response_deadline TEXT,
    sla_resolution_deadline TEXT,
    is_archived INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
