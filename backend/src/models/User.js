// backend/src/models/User.js

const db = require('../database/db');

// Funções simples para usar a tabela a partir do código
module.exports = {

  // -----------------------------
  // Criar um novo usuário
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
  // Listar usuários
  // -----------------------------
  findAll(status = null) {
    return new Promise((resolve, reject) => {
      const query = `
      SELECT id, name, email, role, status, created_at
      FROM users
      WHERE (? IS NULL OR status = ?)
      ORDER BY id DESC
    `;
      db.all(query, [status, status], (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });
  },

  // -----------------------------
  // Buscar usuário pelo email (login)
  // -----------------------------
  findByEmail(email) {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM users WHERE email = ?`;
      db.get(query, [email], (err, row) => {
        if (err) return reject(err);
        resolve(row);
      });
    });
  },

  // -----------------------------
  // Buscar usuário pelo id (rotas protegidas)
  // -----------------------------
  getById(id) {
    return new Promise((resolve, reject) => {
      const query = `
                SELECT id, name, email, role, status, created_at
                FROM users
                WHERE id = ?
            `;
      db.get(query, [id], (err, row) => {
        if (err) return reject(err);
        resolve(row);
      });
    });
  },

  // -----------------------------
  // Atualizar usuário pelo ID
  // -----------------------------
  update(id, data) {
    return new Promise((resolve, reject) => {
      const allowed = ['name', 'email', 'status'];
      const entries = Object.entries(data).filter(([key]) => allowed.includes(key));

      if (entries.length === 0) return resolve(0); // nada para atualizar

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
  // Deletar usuário pelo ID
  // -----------------------------
  delete(id) {
    return new Promise((resolve, reject) => {
      const query = `DELETE FROM users WHERE id = ?`;
      db.run(query, [id], function (err) {
        if (err) return reject(err);
        resolve(this.changes);
      });
    });
  }

};
