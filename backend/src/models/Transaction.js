// backend/src/models/Transaction.js

const db = require('../database/db');

const Transaction = {

  // -----------------------------
  // Criar nova transação
  // -----------------------------
  async create({ member_id, unit_id, type, category, amount, currency, date, description, created_by }) {
    const sql = `
      INSERT INTO transactions
      (member_id, unit_id, type, category, amount, currency, date, description, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    return new Promise((resolve, reject) => {
      db.run(sql, [member_id, unit_id, type, category, amount, currency, date, description, created_by], function (err) {
        if (err) return reject(err);
        resolve({ id: this.lastID });
      });
    });
  },

  // -----------------------------
  // Listar todas as transações com controle de acesso
  // -----------------------------
  async findAll({ user_id, unit_id = null, member_id = null } = {}) {
    // Para restringir transações às unidades do usuário
    let sql = `
      SELECT
        t.*,
        m.name AS member_name,
        u.name AS created_by_name
      FROM transactions t
      LEFT JOIN members m ON m.id = t.member_id
      LEFT JOIN users u ON u.id = t.created_by
      INNER JOIN user_units uu ON uu.unit_id = t.unit_id AND uu.user_id = ?
      WHERE 1=1
    `;

    const params = [user_id];

    if (unit_id) {
      sql += ` AND t.unit_id = ?`;
      params.push(unit_id);
    }

    if (member_id) {
      sql += ` AND t.member_id = ?`;
      params.push(member_id);
    }

    sql += ` ORDER BY t.date DESC`;

    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) return reject(err);
        resolve(rows || []);
      });
    });
  },

  // -----------------------------
  // Buscar transação por ID (apenas se usuário tem acesso)
  // -----------------------------
  async findById(id, user_id) {
    const sql = `
      SELECT
        t.*,
        m.name AS member_name,
        u.name AS created_by_name
      FROM transactions t
      LEFT JOIN members m ON m.id = t.member_id
      LEFT JOIN users u ON u.id = t.created_by
      INNER JOIN user_units uu ON uu.unit_id = t.unit_id AND uu.user_id = ?
      WHERE t.id = ?
      LIMIT 1
    `;
    return new Promise((resolve, reject) => {
      db.get(sql, [user_id, id], (err, row) => {
        if (err) return reject(err);
        resolve(row || null);
      });
    });
  },

  // -----------------------------
  // Atualizar transação
  // -----------------------------
  async update(id, { type, category, amount, currency, date, description }) {
    const sql = `
      UPDATE transactions
      SET type = ?, category = ?, amount = ?, currency = ?, date = ?, description = ?
      WHERE id = ?
    `;
    return new Promise((resolve, reject) => {
      db.run(sql, [type, category, amount, currency, date, description, id], function (err) {
        if (err) return reject(err);
        resolve({ changes: this.changes });
      });
    });
  },

  // -----------------------------
  // Deletar transação
  // -----------------------------
  async delete(id) {
    const sql = `DELETE FROM transactions WHERE id = ?`;
    return new Promise((resolve, reject) => {
      db.run(sql, [id], function (err) {
        if (err) return reject(err);
        resolve({ changes: this.changes });
      });
    });
  }

};

module.exports = Transaction;
