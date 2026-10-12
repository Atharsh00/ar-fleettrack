-- ====================================================================
-- Database Schema: Fleet Expense & Revenue Management System
-- Multi-Profile Architecture & Advanced Accounting Logic
-- Compatible with PostgreSQL and SQLite
-- ====================================================================

-- 0. Profiles Table (Multi-Tenancy)
CREATE TABLE IF NOT EXISTS profiles (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 0.1 System Rules per Profile
CREATE TABLE IF NOT EXISTS system_rules (
    id TEXT PRIMARY KEY,
    profile_id TEXT NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
    default_driver_salary_percent NUMERIC(5, 2) DEFAULT 15.00,
    default_tds_percent NUMERIC(5, 2) DEFAULT 1.00,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 1. Truck Master Table
CREATE TABLE IF NOT EXISTS trucks (
    id TEXT PRIMARY KEY,
    profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    registration_number TEXT NOT NULL,
    model TEXT NOT NULL,
    capacity TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'IN_MAINTENANCE', 'INACTIVE')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(profile_id, registration_number)
);

-- 2. Client / Shipper Companies Table
CREATE TABLE IF NOT EXISTS companies (
    id TEXT PRIMARY KEY,
    profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    contact_person TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(profile_id, name)
);

-- 3. Drivers Table
CREATE TABLE IF NOT EXISTS drivers (
    id TEXT PRIMARY KEY,
    profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    license_number TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'ON_LEAVE', 'INACTIVE')),
    joining_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Trips Table
CREATE TABLE IF NOT EXISTS trips (
    id TEXT PRIMARY KEY,
    profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    from_location TEXT NOT NULL,
    to_location TEXT NOT NULL,
    additional_drops TEXT, -- JSON array of stops
    route TEXT,
    truck_id TEXT NOT NULL REFERENCES trucks(id) ON DELETE RESTRICT,
    company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE RESTRICT,
    driver_id TEXT NOT NULL REFERENCES drivers(id) ON DELETE RESTRICT,
    total_rent NUMERIC(12, 2) NOT NULL CHECK (total_rent >= 0),
    commission_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    is_tds_deducted BOOLEAN NOT NULL DEFAULT FALSE,
    tds_percent NUMERIC(5, 2) NOT NULL DEFAULT 1.00,
    tds_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    net_rent NUMERIC(12, 2) NOT NULL, -- total_rent - tds_amount - commission_amount
    driver_commission_percent NUMERIC(5, 2) NOT NULL DEFAULT 15.00,
    driver_commission NUMERIC(12, 2) NOT NULL, -- 15% of net_rent
    advance_received NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (advance_received >= 0),
    balance_pending NUMERIC(12, 2) NOT NULL, -- total_rent - advance_received - tds_amount
    status TEXT NOT NULL DEFAULT 'COMPLETED' CHECK (status IN ('COMPLETED', 'IN_TRANSIT', 'CANCELLED')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Truck Expenses Table
CREATE TABLE IF NOT EXISTS truck_expenses (
    id TEXT PRIMARY KEY,
    profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    truck_id TEXT NOT NULL REFERENCES trucks(id) ON DELETE CASCADE,
    category TEXT NOT NULL CHECK (category IN ('DIESEL', 'MAINTENANCE', 'TOLL', 'INSURANCE', 'PERMITS', 'SPARE_PARTS', 'OTHER')),
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    payment_method TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Driver Payments & Reimbursements Table
CREATE TABLE IF NOT EXISTS driver_payments (
    id TEXT PRIMARY KEY,
    profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    driver_id TEXT NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('SALARY_PAYOUT', 'DRIVER_EXPENSE')),
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    payment_method TEXT,
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Company Settlements Table
CREATE TABLE IF NOT EXISTS company_settlements (
    id TEXT PRIMARY KEY,
    profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    payment_method TEXT NOT NULL,
    reference_number TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_trips_profile ON trips(profile_id);
CREATE INDEX IF NOT EXISTS idx_trips_date ON trips(date);
CREATE INDEX IF NOT EXISTS idx_truck_expenses_profile ON truck_expenses(profile_id);
CREATE INDEX IF NOT EXISTS idx_driver_payments_profile ON driver_payments(profile_id);
CREATE INDEX IF NOT EXISTS idx_company_settlements_profile ON company_settlements(profile_id);
