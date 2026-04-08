// backend/src/database/db.js

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// diretório onde salvar o banco
const dataDir = process.env.APP_DATA_PATH || __dirname;

// cria pasta se não existir
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// caminho final do banco
const dbPath = path.join(dataDir, 'serenity_club.sqlite');

console.log("Database path:", dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Errore durante l'apertura del database:", err);
  } else {
    console.log("Database connesso correttamente.");
  }
});

// configurações do sqlite
db.serialize(() => {
  db.run("PRAGMA foreign_keys = ON;");
  db.run("PRAGMA journal_mode = WAL;");
});

module.exports = db;