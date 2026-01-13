// backend/src/database/db.js

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// -----------------------------
// Caminho onde o banco ficará armazenado
// -----------------------------
const dbPath = path.resolve(__dirname, 'serenity_club.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Errore durante l\'apertura del database:', err);
  } else {
    console.log('Database connesso correttamente.');
    db.run('PRAGMA foreign_keys = ON;'); // ativa integridade referencial
  }
});

// -----------------------------
// Exporta a conexão para os models
// -----------------------------
module.exports = db;

