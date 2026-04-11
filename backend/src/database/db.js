// backend/src/database/db.js

const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// caminho final do banco
const dbPath = process.env.DB_PATH || path.join(__dirname, 'serenity_club.sqlite');

// diretório onde salvar o banco
const dbDir = path.dirname(dbPath);

// cria pasta se não existir
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

console.log("Database path:", dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Erro ao abrir banco:", err);
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