// backend/src/database/migrateDb.js

const db = require('./db');

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
// MEMBERS
// -----------------------------
db.run(`
  CREATE TABLE IF NOT EXISTS members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    manager_id INTEGER, -- agora opcional
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
// DOCUMENTS
// -----------------------------
db.run(`
  CREATE TABLE IF NOT EXISTS documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    owner_type TEXT NOT NULL,      -- "member" ou "employee"
    owner_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    expiration_date DATE,
    notes TEXT,
    status TEXT DEFAULT 'active',
    file_path TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// -----------------------------
// EMPLOYEES
// -----------------------------
db.run(`
  CREATE TABLE IF NOT EXISTS employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    manager_id INTEGER, -- opcional para admin criar
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
// REPORTS
// -----------------------------
db.run(`
CREATE TABLE IF NOT EXISTS reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL,         -- "summary" ou "detailed"
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
`);

// -----------------------------
// TRANSACTIONS
// -----------------------------
db.run(`
CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  member_id INTEGER,
  type TEXT NOT NULL CHECK(type IN ('income','expense')),
  category TEXT,
  currency TEXT NOT NULL DEFAULT 'EUR',
  amount NUMERIC NOT NULL,
  date DATE NOT NULL,
  description TEXT,
  created_by INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(member_id) REFERENCES members(id),
  FOREIGN KEY(created_by) REFERENCES users(id)
)
`);

console.log('✅ Migrazione database completata');