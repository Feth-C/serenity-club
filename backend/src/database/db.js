// backend/src/database/db.js

const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");

/**
 * Gestione Backup Automatico (Rotazione 7 giorni)
 * Usa VACUUM INTO per garantire che i dati del file WAL siano inclusi.
 */
function runAutomaticBackup(sqliteInstance, currentDbPath) {
  try {
    // Verifiche di sicurezza dei parametri
    if (!sqliteInstance || !currentDbPath) return;

    const days = ["domenica", "lunedì", "martedì", "mercoledì", "giovedì", "venerdì", "sabato"];
    const today = days[new Date().getDay()];

    const backupDir = path.join(path.dirname(currentDbPath), "backup_automatico");

    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const backupPath = path.join(backupDir, `serenity_backup_${today}.sqlite`);

    // Il comando 'VACUUM INTO' richiede che il file di destinazione NON esista.
    if (fs.existsSync(backupPath)) {
      try {
        fs.unlinkSync(backupPath);
      } catch (e) {
        // Se il file è bloccato (EBUSY), saltiamo il backup per questo riavvio
        if (e.code === 'EBUSY') {
          console.warn(`[BACKUP] File occupato, salto il backup automatico: ${today}`);
          return;
        }
        throw e;
      }
    }

    // Esegue il backup a caldo (hot backup) includendo i dati in memoria/WAL
    sqliteInstance.exec(`VACUUM INTO '${backupPath.replace(/'/g, "''")}'`);

    console.log(`[BACKUP] Salvataggio automatico completato per: ${today}`);
  } catch (error) {
    console.error("[BACKUP ERROR] Errore durante il backup automatico:", error);
  }
}

// ========================
// CONFIGURAZIONE PERCORSO DB
// ========================
const dbPath = process.env.DB_PATH || path.join(__dirname, "serenity_club.sqlite");
const dbDir = path.dirname(dbPath);

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

console.log("📦 Database path:", dbPath);

// 1. Inizializza la connessione
const sqlite = new Database(dbPath);

// 2. Configura il database
sqlite.exec(`
    PRAGMA foreign_keys = ON;
    PRAGMA journal_mode = WAL;
`);

// 3. Esegue il backup automatico (passando istanza e percorso correttamente)
runAutomaticBackup(sqlite, dbPath);

const db = {
  run(sql, params = [], cb) {
    try {
      const stmt = sqlite.prepare(sql);
      const result = stmt.run(...params);
      if (cb) {
        cb.call(
          { lastID: result.lastInsertRowid, changes: result.changes },
          null
        );
      }
      return result;
    } catch (err) {
      if (cb) cb(err);
      else throw err;
    }
  },

  get(sql, params = [], cb) {
    try {
      const stmt = sqlite.prepare(sql);
      const row = stmt.get(...params);
      if (cb) cb(null, row);
      return row;
    } catch (err) {
      if (cb) cb(err);
      else throw err;
    }
  },

  all(sql, params = [], cb) {
    try {
      const stmt = sqlite.prepare(sql);
      const rows = stmt.all(...params);
      if (cb) cb(null, rows);
      return rows;
    } catch (err) {
      if (cb) cb(err);
      else throw err;
    }
  },

  exec(sql) {
    return sqlite.exec(sql);
  },

  prepare(sql) {
    return sqlite.prepare(sql);
  }
};

module.exports = db;