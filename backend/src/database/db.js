// backend/src/database/db.js

const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");

const dbPath = process.env.DB_PATH || path.join(__dirname, "serenity_club.sqlite");

const dbDir = path.dirname(dbPath);

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

console.log("📦 Database path:", dbPath);

const sqlite = new Database(dbPath);

sqlite.exec(`
  PRAGMA foreign_keys = ON;
  PRAGMA journal_mode = WAL;
`);

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