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
  // Listar transações da unidade com filtros e paginação
  // -----------------------------
  findAllByUnit(unitId, { page = 1, perPage = 10, type, category, payer_name, member_id, start_date, end_date, currency } = {}) {
    const offset = (page - 1) * perPage;

    let where = `WHERE t.unit_id = ?`;
    const params = [unitId];

    if (type) params.push(type), where += ' AND t.type = ?';
    if (category) params.push(category), where += ' AND t.category = ?';
    if (currency) params.push(currency), where += ' AND t.currency = ?';
    if (member_id) params.push(member_id), where += ' AND t.member_id = ?';
    if (start_date) params.push(start_date), where += ' AND t.date >= ?';
    if (end_date) params.push(end_date), where += ' AND t.date <= ?';

    // PAYER_NAME filter precisa de join
    if (payer_name) {
      const search = `%${payer_name}%`;
      where += ` AND (
        (t.payer_type='member' AND m.name LIKE ?)
        OR (t.payer_type='client' AND c.name LIKE ?)
        OR (t.payer_type='ad-hoc' AND t.custom_payer_name LIKE ?)
      )`;
      params.push(search, search, search);
    }

    const dataQuery = `
      SELECT t.*, 
        u.name AS created_by_name,
        m.name AS member_name,
        c.name AS client_name,
        CASE
          WHEN t.payer_type='member' THEN m.name
          WHEN t.payer_type='client' THEN c.name
          WHEN t.payer_type='ad-hoc' THEN t.custom_payer_name
          ELSE 'Sconosciuto'
        END AS payer_name
      FROM transactions t
      LEFT JOIN members m ON m.id = t.member_id
      LEFT JOIN clients c ON c.id = t.client_id
      LEFT JOIN users u ON u.id = t.created_by
      ${where}
      ORDER BY t.date DESC
      LIMIT ? OFFSET ?
    `;

    const countQuery = `
      SELECT COUNT(*) AS total
      FROM transactions t
      LEFT JOIN members m ON m.id = t.member_id
      LEFT JOIN clients c ON c.id = t.client_id
      ${where}
    `;

    return new Promise((resolve, reject) => {
      db.get(countQuery, params, (err, countRow) => {
        if (err) return reject(err);

        const totalItems = countRow.total;
        const totalPages = Math.ceil(totalItems / perPage);

        db.all(dataQuery, [...params, perPage, offset], (err2, rows) => {
          if (err2) return reject(err2);
          resolve({ items: rows || [], page, totalPages, totalItems });
        });
      });
    });
  },

  // -----------------------------
  // Transações dos membros do manager com filtros e paginação
  // -----------------------------
  findByManagerAndUnit(managerId, unitId, { page = 1, perPage = 10, type, category, payer_name, member_id, start_date, end_date, currency } = {}) {
    const offset = (page - 1) * perPage;

    let where = `WHERE m.manager_id = ? AND t.unit_id = ?`;
    const params = [managerId, unitId];

    if (type) params.push(type), where += ' AND t.type = ?';
    if (category) params.push(category), where += ' AND t.category = ?';
    if (currency) params.push(currency), where += ' AND t.currency = ?';
    if (member_id) params.push(member_id), where += ' AND t.member_id = ?';
    if (start_date) params.push(start_date), where += ' AND t.date >= ?';
    if (end_date) params.push(end_date), where += ' AND t.date <= ?';

    if (payer_name) {
      const search = `%${payer_name}%`;
      where += ` AND (
        (t.payer_type='member' AND m.name LIKE ?)
        OR (t.payer_type='client' AND c.name LIKE ?)
        OR (t.payer_type='ad-hoc' AND t.custom_payer_name LIKE ?)
      )`;
      params.push(search, search, search);
    }

    const dataQuery = `
      SELECT t.*,
        u.name AS created_by_name,
        m.name AS member_name,
        c.name AS client_name,
        CASE
          WHEN t.payer_type='member' THEN m.name
          WHEN t.payer_type='client' THEN c.name
          WHEN t.payer_type='ad-hoc' THEN t.custom_payer_name
          ELSE 'Sconosciuto'
        END AS payer_name
      FROM transactions t
      INNER JOIN members m ON m.id = t.member_id
      LEFT JOIN clients c ON c.id = t.client_id
      LEFT JOIN users u ON u.id = t.created_by
      ${where}
      ORDER BY t.date DESC
      LIMIT ? OFFSET ?
    `;

    const countQuery = `
      SELECT COUNT(*) AS total
      FROM transactions t
      INNER JOIN members m ON m.id = t.member_id
      LEFT JOIN clients c ON c.id = t.client_id
      ${where}
    `;

    return new Promise((resolve, reject) => {
      db.get(countQuery, params, (err, countRow) => {
        if (err) return reject(err);
        const totalItems = countRow.total;
        const totalPages = Math.ceil(totalItems / perPage);

        db.all(dataQuery, [...params, perPage, offset], (err2, rows) => {
          if (err2) return reject(err2);
          resolve({ items: rows || [], page, totalPages, totalItems });
        });
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
  // Buscar por Stats
  // -----------------------------
  getStats(unitId, { type, category, payer_name, member_id, start_date, end_date, currency } = {}) {
    let where = `WHERE t.unit_id = ?`;
    const params = [unitId];

    if (type) params.push(type), where += ' AND t.type = ?';
    if (category) params.push(category), where += ' AND t.category = ?';
    if (currency) params.push(currency), where += ' AND t.currency = ?';
    if (member_id) params.push(member_id), where += ' AND t.member_id = ?';
    if (start_date) params.push(start_date), where += ' AND t.date >= ?';
    if (end_date) params.push(end_date), where += ' AND t.date <= ?';

    if (payer_name) {
      const search = `%${payer_name}%`;
      where += ` AND ((t.payer_type='member' AND m.name LIKE ?) OR (t.payer_type='client' AND c.name LIKE ?) OR (t.payer_type='ad-hoc' AND t.custom_payer_name LIKE ?))`;
      params.push(search, search, search);
    }

    const sql = `
      SELECT 
        t.currency,
        SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END) as total_income,
        SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END) as total_expense
      FROM transactions t
      LEFT JOIN members m ON m.id = t.member_id
      LEFT JOIN clients c ON c.id = t.client_id
      ${where}
      GROUP BY t.currency
    `;

    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) return reject(err);
        resolve(rows || []);
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