// backend/src/models/Employee.js

const db = require('../database/db');

module.exports = {
  // -----------------------------
  // Criar um novo funcionário
  // -----------------------------
  create({ manager_id, user_id, name, email, phone, role, status = 'active' }) {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO employees
        (manager_id, user_id, name, email, phone, role, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      db.run(query, [manager_id, user_id, name, email, phone, role, status], function (err) {
        if (err) return reject(err);
        resolve({ id: this.lastID });
      });
    });
  },

  // -----------------------------
  // Listar funcionários do manager
  // -----------------------------
  findAll(filters = {}) {
    return new Promise((resolve, reject) => {
      let query = `
      SELECT id, name, email, phone, role, user_id, status, manager_id, created_at
      FROM employees
      WHERE 1=1
    `;
      const params = [];

      if (filters.manager_id) {
        query += ` AND manager_id = ?`;
        params.push(filters.manager_id);
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
  // Buscar funcionário pelo ID
  // -----------------------------
  findById(id) {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM employees WHERE id = ?`;
      db.get(query, [id], (err, row) => {
        if (err) return reject(err);
        resolve(row);
      });
    });
  },

  // -----------------------------
  // Atualizar dados (update parcial)
  // -----------------------------
  update(id, data) {
    return new Promise((resolve, reject) => {
      // Filtra apenas campos enviados
      const allowed = ['name', 'email', 'phone', 'role', 'user_id', 'status'];
      const entries = Object.entries(data).filter(([key]) => allowed.includes(key));

      if (entries.length === 0) return resolve(0); // nada para atualizar

      const fields = entries.map(([key]) => `${key} = ?`).join(', ');
      const values = entries.map(([, value]) => value);

      const query = `UPDATE employees SET ${fields} WHERE id = ?`;

      db.run(query, [...values, id], function (err) {
        if (err) return reject(err);
        resolve(this.changes);
      });
    });
  },

  // -----------------------------
  // Deletar funcionário
  // -----------------------------
  delete(id) {
    return new Promise((resolve, reject) => {
      const query = `DELETE FROM employees WHERE id = ?`;
      db.run(query, [id], function (err) {
        if (err) return reject(err);
        resolve(this.changes);
      });
    });
  }
};
