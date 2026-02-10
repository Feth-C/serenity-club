// backend/src/models/Transaction.js

const db = require('../database/db');

module.exports = {

  // -----------------------------
  // Criar nova transação
  // -----------------------------
  create(data) {
    const sql = `
    INSERT INTO transactions
    (unit_id, payer_type, member_id, client_id, custom_payer_name,
     type, category, amount, currency, date, description, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

    return new Promise((resolve, reject) => {
      db.run(
        sql,
        [
          data.unit_id,
          data.payer_type || null,
          data.member_id || null,
          data.client_id || null,
          data.custom_payer_name || null,
          data.type,
          data.category,
          data.amount,
          data.currency,
          data.date,
          data.description,
          data.created_by
        ],
        function (err) {
          if (err) return reject(err);
          resolve({ id: this.lastID });
        }
      );
    });
  },

  // -----------------------------
  // Listar todas as transações da unidade
  // -----------------------------
  findAllByUnit(unitId) {
    const sql = `
      SELECT
        t.*,
        u.name AS created_by_name,
        m.name AS member_name,
        c.name AS client_name,
        CASE
          WHEN t.payer_type = 'member' THEN m.name
          WHEN t.payer_type = 'client' THEN c.name
          WHEN t.payer_type = 'ad-hoc' THEN t.custom_payer_name
          ELSE 'Sconosciuto'
        END AS payer_name
      FROM transactions t
      LEFT JOIN members m ON m.id = t.member_id
      LEFT JOIN clients c ON c.id = t.client_id
      LEFT JOIN users u ON u.id = t.created_by
      WHERE t.unit_id = ?
      ORDER BY t.date DESC
    `;
    return new Promise((resolve, reject) => {
      db.all(sql, [unitId], (err, rows) => {
        if (err) return reject(err);
        resolve(rows || []);
      });
    });
  },

  // -----------------------------
  // Apenas transações dos membros do manager
  // -----------------------------
  findByManagerAndUnit(managerId, unitId) {
    const sql = `
      SELECT
        t.*,
        u.name AS created_by_name,
        m.name AS member_name,
        c.name AS client_name,
        CASE
          WHEN t.payer_type = 'member' THEN m.name
          WHEN t.payer_type = 'client' THEN c.name
          WHEN t.payer_type = 'ad-hoc' THEN t.custom_payer_name
          ELSE 'Sconosciuto'
        END AS payer_name
      FROM transactions t
      INNER JOIN members m ON m.id = t.member_id
      LEFT JOIN clients c ON c.id = t.client_id
      LEFT JOIN users u ON u.id = t.created_by
      WHERE m.manager_id = ?
        AND t.unit_id = ?
      ORDER BY t.date DESC
    `;
    return new Promise((resolve, reject) => {
      db.all(sql, [managerId, unitId], (err, rows) => {
        if (err) return reject(err);
        resolve(rows || []);
      });
    });
  },

  // -----------------------------
  // Buscar transação por ID
  // -----------------------------
  findByIdAndUnit(id, unitId) {
    const sql = `
      SELECT
        t.*,
        u.name AS created_by_name,
        m.name AS member_name,
        c.name AS client_name,
        CASE
          WHEN t.payer_type = 'member' THEN m.name
          WHEN t.payer_type = 'client' THEN c.name
          WHEN t.payer_type = 'ad-hoc' THEN t.custom_payer_name
          ELSE 'Sconosciuto'
        END AS payer_name
      FROM transactions t
      LEFT JOIN members m ON m.id = t.member_id
      LEFT JOIN clients c ON c.id = t.client_id
      LEFT JOIN users u ON u.id = t.created_by
      WHERE t.id = ? AND t.unit_id = ?
    `;
    return new Promise((resolve, reject) => {
      db.get(sql, [id, unitId], (err, row) => {
        if (err) return reject(err);
        resolve(row || null);
      });
    });
  },

  // -----------------------------
  // Atualizar transação
  // -----------------------------
  update(id, data) {
    const sql = `
      UPDATE transactions
      SET payer_type = ?,
          member_id = ?,
          client_id = ?,
          custom_payer_name = ?,
          type = ?,
          category = ?,
          amount = ?,
          currency = ?,
          date = ?,
          description = ?
      WHERE id = ?
    `;
    return new Promise((resolve, reject) => {
      db.run(
        sql,
        [
          data.payer_type || null,
          data.member_id || null,
          data.client_id || null,
          data.custom_payer_name || null,
          data.type,
          data.category,
          data.amount,
          data.currency,
          data.date,
          data.description,
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
  // Deletar transação
  // -----------------------------
  delete(id) {
    return new Promise((resolve, reject) => {
      db.run(`DELETE FROM transactions WHERE id = ?`, [id], function (err) {
        if (err) return reject(err);
        resolve(this.changes);
      });
    });
  }
};
