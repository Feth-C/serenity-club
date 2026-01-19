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
  unit_id INTEGER,
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
  FOREIGN KEY(created_by) REFERENCES users(id),  
  FOREIGN KEY(unit_id) REFERENCES units(id)
)
`);

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
// UNIT SEED (default)
// -----------------------------
db.run(`
  INSERT INTO units (name, type, description)
  SELECT 'Serenity Club', 'club', 'Unità principale'
  WHERE NOT EXISTS (SELECT 1 FROM units)
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
// USER_UNITS AUTO LINK (todos usuários)
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