-- ====================================================================
-- JSOS CORE CONTROL: RELATIONAL DATA ENGINE SCHEMA
-- Authorised Framework: England & Wales Governance
-- Data Protection Officer Validation Layer: Joshua Stevens (UK GDPR)
-- ====================================================================

-- 1. CRM & CLIENT PROFILE MANAGEMENT
CREATE TABLE IF NOT EXISTS clients (
    id TEXT PRIMARY KEY,
    company_name TEXT NOT NULL,
    contact_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    infrastructure_notes TEXT, -- Stores historical hardware audit data
    gdpr_status TEXT DEFAULT 'Compliant' CHECK(gdpr_status IN ('Compliant', 'Review_Required', 'Non_Compliant')),
    dpo_sign_off_status INTEGER DEFAULT 1, -- 0 = Pending, 1 = Verified by Joshua Stevens
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. SALES PIPELINE & ACQUISITION TRACKER
CREATE TABLE IF NOT EXISTS opportunities (
    id TEXT PRIMARY KEY,
    client_id TEXT REFERENCES clients(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    gross_value REAL NOT NULL,
    stage TEXT CHECK(stage IN ('Lead', 'Proposal', 'Negotiation', 'Won', 'Lost')) DEFAULT 'Lead',
    last_optimised DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. FINANCIAL LEDGER & INVOICE TRACKING
CREATE TABLE IF NOT EXISTS invoices (
    id TEXT PRIMARY KEY,
    client_id TEXT REFERENCES clients(id) ON DELETE RESTRICT,
    invoice_number TEXT UNIQUE NOT NULL,
    amount_due REAL NOT NULL,
    currency TEXT DEFAULT 'GBP',
    status TEXT CHECK(status IN ('Draft', 'Sent', 'Paid', 'Overdue')) DEFAULT 'Draft',
    issued_date DATE NOT NULL,
    due_date DATE NOT NULL,
    r2_archive_url TEXT -- Points to the immutable PDF securely preserved in R2
);

-- 4. CALENDAR AVAILABILITY WINDOW RULES (Native Scheduling Engine)
CREATE TABLE IF NOT EXISTS availability_rules (
    id TEXT PRIMARY KEY,
    day_of_week INTEGER NOT NULL CHECK(day_of_week BETWEEN 0 AND 6), -- 0 = Sunday, 6 = Saturday
    start_time TEXT NOT NULL, -- Format: 'HH:MM' (24-hour style)
    end_time TEXT NOT NULL,   -- Format: 'HH:MM' (24-hour style)
    slot_duration_minutes INTEGER DEFAULT 30
);

-- 5. MEETING BOOKINGS MATRIX
CREATE TABLE IF NOT EXISTS bookings (
    id TEXT PRIMARY KEY,
    opportunity_id TEXT REFERENCES opportunities(id) ON DELETE SET NULL,
    client_name TEXT NOT NULL,
    client_email TEXT NOT NULL,
    meeting_subject TEXT NOT NULL DEFAULT 'Strategic IT Consultation',
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    status TEXT CHECK(status IN ('Scheduled', 'Completed', 'Cancelled')) DEFAULT 'Scheduled',
    uk_gdpr_consent_logged INTEGER CHECK(uk_gdpr_consent_logged IN (0, 1)) DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
