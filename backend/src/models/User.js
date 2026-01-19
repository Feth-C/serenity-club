// backend/src/models/User.js

const db = require('../database/db');

module.exports = {
  // -----------------------------
  // Criar novo usuário
  // -----------------------------
  create(name, email, passwordHash, role, status = 'active') {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO users (name, email, password_hash, role, status)
        VALUES (?, ?, ?, ?, ?)
      `;
      db.run(query, [name, email, passwordHash, role, status], function (err) {
        if (err) return reject(err);
        resolve({ id: this.lastID });
      });
    });
  },

  // -----------------------------
  // Buscar usuário pelo email
  // -----------------------------
  findByEmail(email) {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM users WHERE email = ?`;
      db.get(query, [email], (err, row) => err ? reject(err) : resolve(row));
    });
  },

  // -----------------------------
  // Buscar usuário pelo ID
  // -----------------------------
  getById(id) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT id, name, email, role, status, created_at
        FROM users
        WHERE id = ?
      `;
      db.get(query, [id], (err, row) => err ? reject(err) : resolve(row));
    });
  },

  // -----------------------------
  // Listar todos usuários (opcional status)
  // -----------------------------
  findAll(status = null) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT id, name, email, role, status, created_at
        FROM users
        WHERE (? IS NULL OR status = ?)
        ORDER BY id DESC
      `;
      db.all(query, [status, status], (err, rows) => err ? reject(err) : resolve(rows));
    });
  },

  // -----------------------------
  // Buscar unidades do usuário
  // -----------------------------
  getUnits(userId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT u.id, u.name, u.type, uu.role AS unit_role
        FROM user_units uu
        JOIN units u ON u.id = uu.unit_id
        WHERE uu.user_id = ? AND uu.is_active = 1 AND u.is_active = 1
      `;
      db.all(query, [userId], (err, rows) => err ? reject(err) : resolve(rows));
    });
  },

  // -----------------------------
  // Atualizar usuário
  // -----------------------------
  update(id, data) {
    return new Promise((resolve, reject) => {
      const allowed = ['name', 'email', 'status', 'role'];
      const entries = Object.entries(data).filter(([key]) => allowed.includes(key));
      if (!entries.length) return resolve(0);

      const fields = entries.map(([key]) => `${key} = ?`).join(', ');
      const values = entries.map(([, value]) => value);

      const query = `UPDATE users SET ${fields} WHERE id = ?`;
      db.run(query, [...values, id], function (err) {
        if (err) return reject(err);
        resolve(this.changes);
      });
    });
  },

  // -----------------------------
  // Deletar usuário
  // -----------------------------
  delete(id) {
    return new Promise((resolve, reject) => {
      const query = `DELETE FROM users WHERE id = ?`;
      db.run(query, [id], function (err) {
        if (err) return reject(err);
        resolve(this.changes);
      });
    });
  },
};
