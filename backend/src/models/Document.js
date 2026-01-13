// backend/src/models/Document.js

const db = require('../database/db');

module.exports = {

  // -----------------------------
  // Criar documento
  // -----------------------------
  create({
    name,
    type,
    expiration_date,
    owner_type,
    owner_id,
    file_path,
    notes = null,
    status = 'valid' // status padrão
  }) {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO documents
        (name, type, expiration_date, owner_type, owner_id, file_path, notes, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;

      db.run(
        query,
        [name, type, expiration_date, owner_type, owner_id, file_path, notes, status],
        function (err) {
          if (err) return reject(err);
          resolve({ id: this.lastID });
        }
      );
    });
  },

  // -----------------------------
  // Listar documentos (com filtros)
  // -----------------------------
  findAll(filters = {}) {
    return new Promise((resolve, reject) => {
      let query = `
        SELECT *
        FROM documents
        WHERE 1=1
      `;
      const params = [];

      // Filtros disponíveis
      if (filters.owner_type) {
        query += ` AND owner_type = ?`;
        params.push(filters.owner_type);
      }

      if (filters.owner_id) {
        query += ` AND owner_id = ?`;
        params.push(filters.owner_id);
      }

      if (filters.type) {
        query += ` AND type = ?`;
        params.push(filters.type);
      }

      if (filters.status) {
        query += ` AND status = ?`;
        params.push(filters.status);
      }

      query += ` ORDER BY id DESC`;

      db.all(query, params, (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });
  },

  // -----------------------------
  // Buscar documento por ID
  // -----------------------------
  findById(id) {
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT * FROM documents WHERE id = ?`,
        [id],
        (err, row) => {
          if (err) return reject(err);
          resolve(row);
        }
      );
    });
  },

  // -----------------------------
  // Atualizar documento (parcial)
  // -----------------------------
  update(id, data) {
    return new Promise((resolve, reject) => {
      const allowed = [
        'name',
        'type',
        'expiration_date',
        'owner_type',
        'owner_id',
        'file_path',
        'notes',
        'status'
      ];

      const entries = Object.entries(data).filter(
        ([key, val]) => allowed.includes(key) && val !== undefined
      );

      if (!entries.length) return resolve(0);

      const fields = entries.map(([key]) => `${key} = ?`).join(', ');
      const values = entries.map(([, val]) => val);

      const query = `UPDATE documents SET ${fields} WHERE id = ?`;

      db.run(query, [...values, id], function (err) {
        if (err) return reject(err);
        resolve(this.changes);
      });
    });
  },

  // -----------------------------
  // Deletar documento
  // -----------------------------
  delete(id) {
    return new Promise((resolve, reject) => {
      db.run(
        `DELETE FROM documents WHERE id = ?`,
        [id],
        function (err) {
          if (err) return reject(err);
          resolve(this.changes);
        }
      );
    });
  }
};
