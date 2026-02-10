// backend/src/models/Client.js

const db = require('../database/db');

module.exports = {

  // -----------------------------
  // Criar novo cliente
  // -----------------------------
  create({ unitId, name, contact = null, email = null, address = null, notes = null, createdBy }) {
    const sql = `
      INSERT INTO clients (unit_id, name, contact, email, address, notes, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    return new Promise((resolve, reject) => {
      db.run(
        sql,
        [unitId, name, contact, email, address, notes, createdBy],
        function (err) {
          if (err) return reject(err);
          resolve({ id: this.lastID });
        }
      );
    });
  },

  // -----------------------------
  // Buscar todos os clientes
  // -----------------------------
  findAll(unitId) {
    const sql = `
      SELECT *
      FROM clients
      WHERE unit_id = ?
      ORDER BY name ASC
    `;
    return new Promise((resolve, reject) => {
      db.all(sql, [unitId], (err, rows) => {
        if (err) return reject(err);
        resolve(rows || []);
      });
    });
  },

  // -----------------------------
  // Buscar cliente por ID
  // -----------------------------
  findById(id) {
    const sql = `SELECT * FROM clients WHERE id = ?`;
    return new Promise((resolve, reject) => {
      db.get(sql, [id], (err, row) => {
        if (err) return reject(err);
        resolve(row || null);
      });
    });
  },

  // -----------------------------
  // Buscar por nome dentro da unidade
  // -----------------------------
  findByNameInUnit(name, unitId) {
    const sql = `
    SELECT *
    FROM clients
    WHERE unit_id = ?
      AND name = ?
    LIMIT 1
  `;

    return new Promise((resolve, reject) => {
      db.get(sql, [unitId, name], (err, row) => {
        if (err) return reject(err);
        resolve(row || null);
      });
    });
  },

  // -----------------------------
  // Atualizar cliente
  // -----------------------------
  update(id, data) {
    const sql = `
      UPDATE clients
      SET name = ?, contact = ?, email = ?, address = ?, notes = ?
      WHERE id = ?
    `;
    return new Promise((resolve, reject) => {
      db.run(
        sql,
        [
          data.name,
          data.contact || null,
          data.email || null,
          data.address || null,
          data.notes || null,
          id
        ],
        function (err) {
          if (err) return reject(err);
          resolve(this.changes);
        }
      );
    });
  },

  // -----------------------------
  // Deletar cliente
  // -----------------------------
  delete(id) {
    return new Promise((resolve, reject) => {
      db.run(`DELETE FROM clients WHERE id = ?`, [id], function (err) {
        if (err) return reject(err);
        resolve(this.changes);
      });
    });
  }
};
