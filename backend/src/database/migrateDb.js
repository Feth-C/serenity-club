// backend/src/database/migrateDb.js

const db = require('./db');

// -----------------------------
// UNITS
// -----------------------------
db.run(`
  CREATE TABLE IF NOT EXISTS units (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('club','personal','rental','other')),
    description TEXT,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// -----------------------------
// USERS
// -----------------------------
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin','manager','employee','member')) DEFAULT 'member',
    status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// -----------------------------
// USER_UNITS
// -----------------------------
db.run(`
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
  )
`);

// -----------------------------
// MEMBERS
// -----------------------------
db.run(`
  CREATE TABLE IF NOT EXISTS members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
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
    FOREIGN KEY(manager_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  )
`);

// -----------------------------
// EMPLOYEES
// -----------------------------
db.run(`
  CREATE TABLE IF NOT EXISTS employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    manager_id INTEGER,
    user_id INTEGER UNIQUE,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    role TEXT DEFAULT 'employee',
    status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(manager_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  )
`);

// -----------------------------
// CLIENTS
// -----------------------------
db.run(`
  CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    unit_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    contact TEXT,
    email TEXT,
    address TEXT,
    notes TEXT,
    status TEXT DEFAULT 'active',
    created_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(unit_id) REFERENCES units(id),
    FOREIGN KEY(created_by) REFERENCES users(id),
    UNIQUE(unit_id, name)
  )
`);

// -----------------------------
// DOCUMENTS
// -----------------------------
db.run(`
  CREATE TABLE IF NOT EXISTS documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    unit_id INTEGER NOT NULL,
    owner_type TEXT NOT NULL CHECK(owner_type IN ('manager','member','employee','unit')),
    owner_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    expiration_date DATE,
    notes TEXT,
    is_active INTEGER DEFAULT 1,
    file_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
	  mime_type	TEXT NOT NULL,
	  file_size	INTEGER,
    created_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(unit_id) REFERENCES units(id),
    FOREIGN KEY(created_by) REFERENCES users(id)
  )
`);

// -----------------------------
// SESSIONS
// -----------------------------
db.run(`
  CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    unit_id INTEGER NOT NULL,
    member_id INTEGER,
    client_id INTEGER,
    client_name TEXT,
    contact TEXT,
    address TEXT,
    visit_type TEXT NOT NULL CHECK (visit_type IN ('first','return')),
    start_time DATETIME NOT NULL,
    planned_minutes INTEGER NOT NULL,
    expected_end_time DATETIME NOT NULL,
    actual_end_time DATETIME,
    status TEXT NOT NULL CHECK (status IN ('open','closed','cancelled')) DEFAULT 'open',
    currency TEXT NOT NULL DEFAULT 'EUR',
    planned_amount NUMERIC,
    final_amount NUMERIC,
    paid_amount NUMERIC DEFAULT 0,
    payment_method TEXT,
    notes TEXT,
    google_event_id TEXT,
    created_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY("client_id") REFERENCES "clients"("id"),
	  FOREIGN KEY("created_by") REFERENCES "users"("id"),
	  FOREIGN KEY("member_id") REFERENCES "members"("id"),
	  FOREIGN KEY("unit_id") REFERENCES "units"("id")
  )
`);

// -----------------------------
// TRANSACTIONS
// -----------------------------
db.run(`
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
    FOREIGN KEY(member_id) REFERENCES members(id),
    FOREIGN KEY(client_id) REFERENCES clients(id),
    FOREIGN KEY(created_by) REFERENCES users(id),
    FOREIGN KEY(unit_id) REFERENCES units(id)
  )
`);

// -----------------------------
// REPORTS (tipos de relatórios)
// -----------------------------
db.run(`
  CREATE TABLE IF NOT EXISTS reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL CHECK(type IN ('summary','detailed')),
    description TEXT,
    default_export_format TEXT DEFAULT 'pdf',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// -----------------------------
// REPORTS_LOG (histórico de geração)
// -----------------------------
db.run(`
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
  )
`);

// -----------------------------
// SEED REPORT TYPES (ESSENCIAL PARA O SISTEMA DE RELATÓRIOS)
// -----------------------------
db.run(`
  INSERT INTO reports (name, slug, type, description)
  SELECT 'Relatório de Sessões', 'sessions', 'detailed', 'Histórico de sessões por período'
  WHERE NOT EXISTS (SELECT 1 FROM reports WHERE slug = 'sessions')
`);

db.run(`
  INSERT INTO reports (name, slug, type, description)
  SELECT 'Relatório Financeiro', 'financial', 'summary', 'Resumo financeiro por período'
  WHERE NOT EXISTS (SELECT 1 FROM reports WHERE slug = 'financial')
`);

db.run(`
  INSERT INTO reports (name, slug, type, description)
  SELECT 'Relatório Operacional', 'operational', 'summary', 'Indicadores operacionais de sessões'
  WHERE NOT EXISTS (SELECT 1 FROM reports WHERE slug = 'operational')
`);

// -----------------------------
// SEED UNIT DEFAULT
// -----------------------------
db.run(`
  INSERT INTO units (name, type, description)
  SELECT 'Serenity Club', 'club', 'Unità principale'
  WHERE NOT EXISTS (SELECT 1 FROM units)
`);

// -----------------------------
// LINK USERS → DEFAULT UNIT
// -----------------------------
db.run(`
  INSERT INTO user_units (user_id, unit_id, role)
  SELECT 
    u.id,
    (SELECT id FROM units ORDER BY id LIMIT 1),
    CASE 
      WHEN u.role = 'admin' THEN 'admin'
      WHEN u.role = 'manager' THEN 'manager'
      ELSE 'member'
    END
  FROM users u
  WHERE NOT EXISTS (
    SELECT 1 
    FROM user_units uu 
    WHERE uu.user_id = u.id
      AND uu.unit_id = (SELECT id FROM units ORDER BY id LIMIT 1)
  )
`);

console.log('✅ Migrazione database completata');
