// backend/src/models/Transaction.js

const db = require('../database/db');

const Transaction = {

    // -----------------------------
    // Criar nova transação
    // -----------------------------
    async create({ member_id, type, category, amount, currency, date, description, created_by }) {
        const sql = `
      INSERT INTO transactions
      (member_id, type, category, amount, currency, date, description, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

        return new Promise((resolve, reject) => {
            db.run(sql, [member_id, type, category, amount, currency, date, description, created_by], function (err) {
                if (err) return reject(err);
                resolve({ id: this.lastID });
            });
        });
    },

    // -----------------------------
    // Listar todas as transações (sempre array)
    // -----------------------------
    async findAll() {
        const sql = `
      SELECT
        t.*,
        m.name AS member_name,
        u.name AS created_by_name
      FROM transactions t
      LEFT JOIN members m ON m.id = t.member_id
      LEFT JOIN users u ON u.id = t.created_by
      ORDER BY t.date DESC
    `;

        return new Promise((resolve, reject) => {
            db.all(sql, [], (err, rows) => {
                if (err) return reject(err);
                resolve(rows || []); // 🔹 sempre array
            });
        });
    },

    // -----------------------------
    // Buscar transação por ID (sempre objeto ou null)
    // -----------------------------
    async findById(id) {
        const sql = `
      SELECT
        t.*,
        m.name AS member_name,
        u.name AS created_by_name
      FROM transactions t
      LEFT JOIN members m ON m.id = t.member_id
      LEFT JOIN users u ON u.id = t.created_by
      WHERE t.id = ?
      LIMIT 1
    `;

        return new Promise((resolve, reject) => {
            db.get(sql, [id], (err, row) => {
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
                resolve({ changes: this.changes }); // 🔹 número de linhas alteradas
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
                resolve({ changes: this.changes }); // 🔹 número de linhas deletadas
            });
        });
    }
};

module.exports = Transaction;
