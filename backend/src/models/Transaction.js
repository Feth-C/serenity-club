const db = require('../database/db');

module.exports = {

  // -----------------------------
  // Criar nova transação
  // -----------------------------
  create(data) {
    const sql = `
      INSERT INTO transactions
      (member_id, unit_id, type, category, amount, currency, date, description, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    return new Promise((resolve, reject) => {
      db.run(
        sql,
        [
          data.member_id,
          data.unit_id,
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
  // ADMIN → todas da unidade
  // -----------------------------
  findAllByUnit(unitId) {
    const sql = `
      SELECT
        t.*,
        m.name AS member_name,
        u.name AS created_by_name
      FROM transactions t
      LEFT JOIN members m ON m.id = t.member_id
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
  // MANAGER → apenas seus membros
  // -----------------------------
  findByManagerAndUnit(managerId, unitId) {
    const sql = `
      SELECT
        t.*,
        m.name AS member_name,
        u.name AS created_by_name
      FROM transactions t
      INNER JOIN members m ON m.id = t.member_id
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
  // Buscar por ID dentro da unidade
  // -----------------------------
  findByIdAndUnit(id, unitId) {
    const sql = `
      SELECT * FROM transactions
      WHERE id = ? AND unit_id = ?
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
      SET type = ?, category = ?, amount = ?, currency = ?, date = ?, description = ?
      WHERE id = ?
    `;
    return new Promise((resolve, reject) => {
      db.run(
        sql,
        [
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
      db.run(
        `DELETE FROM transactions WHERE id = ?`,
        [id],
        function (err) {
          if (err) return reject(err);
          resolve(this.changes);
        }
      );
    });
  }
};
