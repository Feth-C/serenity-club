// backend/src/models/MemberDocument.js

const db = require('../database/db');
const { computeDocumentStatus } = require('../utils/statusHelper');

module.exports = {

  // -----------------------------
  // Criar documento vinculado a um membro
  // -----------------------------
  create({ member_id, type, file_path, expiration_date, notes, status = 'active' }) {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO member_documents (member_id, type, file_path, expiration_date, notes, status)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      db.run(query, [member_id, type, file_path, expiration_date, notes, status], function (err) {
        if (err) return reject(err);
        resolve({ id: this.lastID });
      });
    });
  },

  // -----------------------------
  // Contar documentos por status
  // -----------------------------
  countByStatus(memberIds, days = 30, type = null) {
    return new Promise((resolve, reject) => {
      const placeholders = memberIds.map(() => '?').join(',');
      let query = `
        SELECT
          SUM(CASE WHEN expiration_date IS NULL OR DATE(expiration_date) > DATE('now', '+' || ? || ' days') THEN 1 ELSE 0 END) AS valid,
          SUM(CASE WHEN DATE(expiration_date) <= DATE('now', '+' || ? || ' days') AND DATE(expiration_date) >= DATE('now') THEN 1 ELSE 0 END) AS expiring,
          SUM(CASE WHEN DATE(expiration_date) < DATE('now') THEN 1 ELSE 0 END) AS expired
        FROM member_documents
        WHERE member_id IN (${placeholders})
      `;
      const params = [days, days, ...memberIds];

      if (type) {
        query += ' AND type = ?';
        params.push(type);
      }

      db.get(query, params, (err, row) => {
        if (err) return reject(err);
        resolve({
          valid: row.valid || 0,
          expiring: row.expiring || 0,
          expired: row.expired || 0
        });
      });
    });
  },

  // -----------------------------
  // Listar documentos de múltiplos membros (status direto do SQL)
  // -----------------------------
  findByMembers(memberIds, { status = null, type = null, days = 30 } = {}) {
    return new Promise((resolve, reject) => {
      const placeholders = memberIds.map(() => '?').join(',');

      let query = `
      SELECT md.*, m.name AS member_name,
        CASE
          WHEN md.expiration_date IS NULL
               OR DATE(md.expiration_date) > DATE('now', '+' || ? || ' days')
            THEN 'valid'
          WHEN DATE(md.expiration_date) <= DATE('now', '+' || ? || ' days')
               AND DATE(md.expiration_date) >= DATE('now')
            THEN 'expiring'
          ELSE 'expired'
        END AS status
      FROM member_documents md
      JOIN members m ON md.member_id = m.id
      WHERE md.member_id IN (${placeholders})
    `;

      const params = [days, days, ...memberIds];

      if (type) {
        query += ` AND md.type = ?`;
        params.push(type);
      }

      if (status) {
        query = `
        SELECT * FROM (${query})
        WHERE status = ?
      `;
        params.push(status);
      }

      query += ` ORDER BY md.created_at DESC`;

      db.all(query, params, (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });
  },

  // -----------------------------
  // Listagem global paginada
  // -----------------------------
  findAllPaginated({ page = 1, perPage = 10, filters = {} }) {
    return new Promise((resolve, reject) => {

      const offset = (page - 1) * perPage;
      const params = [];
      const where = [];

      let baseQuery = `
      FROM member_documents md
      JOIN members m ON m.id = md.member_id
    `;

      // 🔐 Escopos
      if (filters.manager_id) {
        where.push('m.manager_id = ?');
        params.push(filters.manager_id);
      }

      if (filters.user_id) {
        where.push('m.user_id = ?');
        params.push(filters.user_id);
      }

      // 📄 Tipo
      if (filters.type) {
        where.push('md.type = ?');
        params.push(filters.type);
      }

      // 📆 Status (calculado)
      if (filters.status === 'valid') {
        where.push(`
        md.expiration_date IS NULL
        OR DATE(md.expiration_date) > DATE('now', '+30 days')
      `);
      }

      if (filters.status === 'expiring') {
        where.push(`
        DATE(md.expiration_date) <= DATE('now', '+30 days')
        AND DATE(md.expiration_date) >= DATE('now')
      `);
      }

      if (filters.status === 'expired') {
        where.push(`DATE(md.expiration_date) < DATE('now')`);
      }

      const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

      // 🔢 Total
      const countQuery = `
      SELECT COUNT(*) as total
      ${baseQuery}
      ${whereSql}
    `;

      db.get(countQuery, params, (err, countRow) => {
        if (err) return reject(err);

        const totalItems = countRow.total;
        const totalPages = Math.max(1, Math.ceil(totalItems / perPage));

        // 📄 Dados
        const dataQuery = `
        SELECT
          md.*,
          m.name AS member_name,
          CASE
            WHEN md.expiration_date IS NULL OR DATE(md.expiration_date) > DATE('now', '+30 days') THEN 'valid'
            WHEN DATE(md.expiration_date) <= DATE('now', '+30 days') AND DATE(md.expiration_date) >= DATE('now') THEN 'expiring'
            ELSE 'expired'
          END AS status
        ${baseQuery}
        ${whereSql}
        ORDER BY md.id DESC
        LIMIT ? OFFSET ?
      `;

        db.all(
          dataQuery,
          [...params, perPage, offset],
          (err, rows) => {
            if (err) return reject(err);

            resolve({
              items: rows,
              page,
              perPage,
              totalItems,
              totalPages
            });
          }
        );
      });
    });
  },

  // -----------------------------
  // Documentos expirando (Admin / Manager / Member)
  // -----------------------------
  findAllExpiring(days = 30, type = null) {
    return new Promise((resolve, reject) => {
      let query = `
        SELECT md.*, m.name AS member_name,
          CASE
            WHEN md.expiration_date IS NULL OR DATE(md.expiration_date) > DATE('now', '+' || ? || ' days') THEN 'valid'
            WHEN DATE(md.expiration_date) <= DATE('now', '+' || ? || ' days') AND DATE(md.expiration_date) >= DATE('now') THEN 'expiring'
            ELSE 'expired'
          END AS status
        FROM member_documents md
        JOIN members m ON m.id = md.member_id
        WHERE md.expiration_date IS NOT NULL
      `;
      const params = [days, days];

      if (type) {
        query += ' AND md.type = ?';
        params.push(type);
      }

      db.all(query, params, (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });
  },

  findExpiringByManager(manager_id, days = 30, type = null) {
    return new Promise((resolve, reject) => {
      let query = `
        SELECT md.*, m.name AS member_name,
          CASE
            WHEN md.expiration_date IS NULL OR DATE(md.expiration_date) > DATE('now', '+' || ? || ' days') THEN 'valid'
            WHEN DATE(md.expiration_date) <= DATE('now', '+' || ? || ' days') AND DATE(md.expiration_date) >= DATE('now') THEN 'expiring'
            ELSE 'expired'
          END AS status
        FROM member_documents md
        JOIN members m ON m.id = md.member_id
        WHERE m.manager_id = ?
          AND md.expiration_date IS NOT NULL
      `;
      const params = [days, days, manager_id];

      if (type) {
        query += ' AND md.type = ?';
        params.push(type);
      }

      db.all(query, params, (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });
  },

  findExpiringByMember(member_id, days = 30, type = null) {
    return new Promise((resolve, reject) => {
      let query = `
        SELECT md.*,
          CASE
            WHEN md.expiration_date IS NULL OR DATE(md.expiration_date) > DATE('now', '+' || ? || ' days') THEN 'valid'
            WHEN DATE(md.expiration_date) <= DATE('now', '+' || ? || ' days') AND DATE(md.expiration_date) >= DATE('now') THEN 'expiring'
            ELSE 'expired'
          END AS status
        FROM member_documents md
        WHERE md.member_id = ?
          AND md.expiration_date IS NOT NULL
      `;
      const params = [days, days, member_id];

      if (type) {
        query += ' AND md.type = ?';
        params.push(type);
      }

      db.all(query, params, (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });
  },

  // -----------------------------
  // Buscar documentos por ID
  // -----------------------------
  findById(id) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM member_documents WHERE id = ?', [id], (err, row) => {
        if (err) return reject(err);
        resolve(row);
      });
    });
  },

  // -----------------------------
  // Buscar documentos do membro por ID
  // -----------------------------
  findByIdAndMember(id, member_id) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM member_documents WHERE id = ? AND member_id = ?', [id, member_id], (err, row) => {
        if (err) return reject(err);
        resolve(row);
      });
    });
  },

  // -----------------------------
  // Atualizar documento pelo ID
  // -----------------------------
  update(id, data) {
    return new Promise((resolve, reject) => {
      const allowed = ['member_id', 'type', 'file_path', 'expiration_date', 'notes', 'status'];
      const entries = Object.entries(data).filter(([key, val]) => allowed.includes(key) && val !== undefined);
      if (entries.length === 0) return resolve(0);

      const fields = entries.map(([key]) => `${key} = ?`).join(', ');
      const values = entries.map(([, val]) => val);

      db.run(`UPDATE member_documents SET ${fields} WHERE id = ?`, [...values, id], function (err) {
        if (err) return reject(err);
        resolve(this.changes);
      });
    });
  },

  // -----------------------------
  // Deletar documento pelo ID
  // -----------------------------
  delete(id) {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM member_documents WHERE id = ?', [id], function (err) {
        if (err) return reject(err);
        resolve(this.changes);
      });
    });
  }

};
