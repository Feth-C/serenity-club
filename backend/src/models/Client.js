// backend/src/models/Client.js

const db = require('../database/db');

module.exports = {
  // -----------------------------
  // Criar novo cliente
  // -----------------------------
  create(unitId, name, email = null, phone = null) {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO clients (unit_id, name, email, phone)
        VALUES (?, ?, ?, ?)
      `;
      db.run(query, [unitId, name, email, phone], function (err) {
        if (err) return reject(err);
        resolve({ id: this.lastID });
      });
    });
  },

  // -----------------------------
  // Listar clientes por unidade
  // -----------------------------
  findAll(unitId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT id, unit_id, name, email, phone, created_at
        FROM clients
        WHERE unit_id = ?
        ORDER BY id DESC
      `;
      db.all(query, [unitId], (err, rows) => err ? reject(err) : resolve(rows));
    });
  },

  // -----------------------------
  // Buscar cliente por ID
  // -----------------------------
  getById(id) {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM clients WHERE id = ?`;
      db.get(query, [id], (err, row) => err ? reject(err) : resolve(row));
    });
  },

  // -----------------------------
  // Buscar cliente por nome na unidade
  // -----------------------------
  findByNameInUnit(name, unitId) {
    return new Promise((resolve, reject) => {
      const query = `
      SELECT * FROM clients
      WHERE unit_id = ?
      AND LOWER(name) = LOWER(?)
      LIMIT 1
    `;

      db.get(query, [unitId, name], (err, row) =>
        err ? reject(err) : resolve(row)
      );
    });
  },

  // -----------------------------
  // Atualizar cliente
  // -----------------------------
  update(id, data) {
    return new Promise((resolve, reject) => {
      const allowed = ['name', 'email', 'phone'];
      const entries = Object.entries(data).filter(([key]) => allowed.includes(key));
      if (!entries.length) return resolve(0);

      const fields = entries.map(([key]) => `${key} = ?`).join(', ');
      const values = entries.map(([, value]) => value);

      const query = `UPDATE clients SET ${fields} WHERE id = ?`;
      db.run(query, [...values, id], function (err) {
        if (err) return reject(err);
        resolve(this.changes);
      });
    });
  },

  // -----------------------------
  // Deletar cliente
  // -----------------------------
  delete(id) {
    return new Promise((resolve, reject) => {
      const query = `DELETE FROM clients WHERE id = ?`;
      db.run(query, [id], function (err) {
        if (err) return reject(err);
        resolve(this.changes);
      });
    });
  }
};
