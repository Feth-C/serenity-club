// backend/src/database/migrateDb.js

const db = require("./db");

function migrate() {

  console.log("🚀 Running database migrations...");

  db.exec(`

  PRAGMA foreign_keys = ON;
  PRAGMA journal_mode = WAL;

  -- USERS
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('admin','manager','employee','member')) DEFAULT 'member',
    status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- UNITS
  CREATE TABLE IF NOT EXISTS units (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('club','personal','rental','other')),
    description TEXT,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- MEMBERS
  CREATE TABLE IF NOT EXISTS members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    unit_id INTEGER NOT NULL,
    manager_id INTEGER,
    user_id INTEGER UNIQUE,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    passport_number TEXT,
    passport_expiration DATE,
    police_clearance_expiration DATE,
    notes TEXT,
    status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(unit_id) REFERENCES units(id),
    FOREIGN KEY(manager_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  -- EMPLOYEES
  CREATE TABLE IF NOT EXISTS employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    unit_id INTEGER NOT NULL,
    manager_id INTEGER,
    user_id INTEGER UNIQUE,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    role TEXT DEFAULT 'employee',
    status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(unit_id) REFERENCES units(id),
    FOREIGN KEY(manager_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  -- DOCUMENTS
  CREATE TABLE IF NOT EXISTS documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    unit_id INTEGER,
    owner_type TEXT NOT NULL CHECK(owner_type IN ('manager','member','employee','unit')),
    owner_id INTEGER,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    expiration_date DATE,
    notes TEXT,
    is_active INTEGER DEFAULT 1,
    file_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    created_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(unit_id) REFERENCES units(id) ON DELETE CASCADE,
    FOREIGN KEY(created_by) REFERENCES users(id) ON DELETE SET NULL
  );

  -- CLIENTS
  CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    unit_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    address TEXT,
    notes TEXT,
    status TEXT DEFAULT 'active',
    created_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(unit_id) REFERENCES units(id) ON DELETE CASCADE,
    FOREIGN KEY(created_by) REFERENCES users(id)
  );

  -- SESSIONS
  CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    unit_id INTEGER NOT NULL,
    member_id INTEGER,
    client_id INTEGER,
    client_name TEXT,
    contact TEXT,
    email TEXT,
    address TEXT,
    visit_type TEXT NOT NULL CHECK(visit_type IN('first','return')),
    start_time DATETIME NOT NULL,
    planned_minutes INTEGER NOT NULL,
    expected_end_time DATETIME NOT NULL,
    actual_end_time DATETIME,
    status TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open','closed','cancelled')),
    currency TEXT NOT NULL DEFAULT 'EUR',
    planned_amount NUMERIC,
    final_amount NUMERIC,
    paid_amount NUMERIC DEFAULT 0,
    payment_method TEXT,
    google_event_id TEXT,
    notes TEXT,
    created_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(unit_id) REFERENCES units(id) ON DELETE CASCADE,
    FOREIGN KEY(member_id) REFERENCES members(id) ON DELETE CASCADE,
    FOREIGN KEY(client_id) REFERENCES clients(id) ON DELETE CASCADE,
    FOREIGN KEY(created_by) REFERENCES users(id)
  );

  -- TRANSACTIONS
  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    unit_id INTEGER,
    member_id INTEGER,
    client_id INTEGER,
    payer_type TEXT CHECK(payer_type IN ('member','client','ad-hoc')),
    custom_payer_name TEXT,
    type TEXT NOT NULL CHECK(type IN ('income','expense')),
    category TEXT,
    currency TEXT NOT NULL DEFAULT 'EUR',
    amount NUMERIC NOT NULL,
    date DATE NOT NULL,
    description TEXT,
    created_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(unit_id) REFERENCES units(id),
    FOREIGN KEY(member_id) REFERENCES members(id),
    FOREIGN KEY(client_id) REFERENCES clients(id),
    FOREIGN KEY(created_by) REFERENCES users(id)
  );

  -- REPORTS
  CREATE TABLE IF NOT EXISTS reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL CHECK(type IN ('summary','detailed')),
    description TEXT,
    default_export_format TEXT DEFAULT 'pdf',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- REPORTS LOG
  CREATE TABLE IF NOT EXISTS reports_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_id INTEGER NOT NULL,
    unit_id INTEGER NOT NULL,
    generated_by INTEGER NOT NULL,
    start_date DATE,
    end_date DATE,
    export_format TEXT NOT NULL CHECK(export_format IN ('pdf','csv')),
    file_path TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(report_id) REFERENCES reports(id) ON DELETE CASCADE,
    FOREIGN KEY(unit_id) REFERENCES units(id),
    FOREIGN KEY(generated_by) REFERENCES users(id)
  );

  -- USER UNITS
  CREATE TABLE IF NOT EXISTS user_units (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    unit_id INTEGER NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('admin','manager','member')) DEFAULT 'member',
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, unit_id),
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(unit_id) REFERENCES units(id) ON DELETE CASCADE
  );

  `);

  const unit = db.prepare(`SELECT id FROM units LIMIT 1`).get();

  if (!unit) {
    db.prepare(`
      INSERT INTO units (name, type, description)
      VALUES ('Serenity Club','club','Unità principale')
    `).run();
  }

  console.log("✅ Database migrations completed");
}

module.exports = { migrate };