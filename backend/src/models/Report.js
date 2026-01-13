// backend/src/models/Report.js

const db = require('../database/db');

module.exports = {

    // -----------------------------
    // Resumo de documentos por manager
    // -----------------------------
    async documentsSummary(manager_id, days = 30, type = null) {
        return new Promise((resolve, reject) => {
            let query = `
        SELECT
          SUM(CASE 
                WHEN expiration_date IS NULL OR expiration_date > DATE('now', '+' || ? || ' days') THEN 1 
                ELSE 0 
              END) AS valid,
          SUM(CASE 
                WHEN expiration_date BETWEEN DATE('now') AND DATE('now', '+' || ? || ' days') THEN 1 
                ELSE 0 
              END) AS expiring,
          SUM(CASE 
                WHEN expiration_date < DATE('now') THEN 1 
                ELSE 0 
              END) AS expired
        FROM member_documents md
        JOIN members m ON m.id = md.member_id
        WHERE m.manager_id = ?
      `;

            const params = [days, days, manager_id];

            if (type) {
                query += ` AND md.type = ?`;
                params.push(type);
            }

            db.get(query, params, (err, row) => {
                if (err) return reject(err);
                resolve(row || { valid: 0, expiring: 0, expired: 0 });
            });
        });
    },

    // -----------------------------
    // Resumo de documentos por tipo
    // -----------------------------
    async documentsByType(manager_id, type, days = 30) {
        return new Promise((resolve, reject) => {
            let query = `
      SELECT md.type,
             SUM(CASE WHEN expiration_date IS NULL OR expiration_date > DATE('now', '+' || ? || ' days') THEN 1 ELSE 0 END) AS valid,
             SUM(CASE WHEN expiration_date BETWEEN DATE('now') AND DATE('now', '+' || ? || ' days') THEN 1 ELSE 0 END) AS expiring,
             SUM(CASE WHEN expiration_date < DATE('now') THEN 1 ELSE 0 END) AS expired
      FROM member_documents md
      JOIN members m ON m.id = md.member_id
      WHERE m.manager_id = ?
    `;
            const params = [days, days, manager_id];

            if (type) {
                query += ' AND md.type = ?';
                params.push(type);
            }

            query += ' GROUP BY md.type';

            db.all(query, params, (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            });
        });
    },

    // -----------------------------
    // Detalhe completo dos documentos
    // -----------------------------
    async documentsDetailed(manager_id, days = 30, type = null) {
        return new Promise((resolve, reject) => {
            let query = `
        SELECT md.*, m.name AS member_name
        FROM member_documents md
        JOIN members m ON m.id = md.member_id
        WHERE m.manager_id = ?
      `;

            const params = [manager_id];

            if (type) {
                query += ` AND md.type = ?`;
                params.push(type);
            }

            db.all(query, params, (err, rows) => {
                if (err) return reject(err);

                // Adiciona status em JS
                const detailed = { valid: [], expiring: [], expired: [] };
                const today = new Date();
                rows.forEach(doc => {
                    const diff = doc.expiration_date
                        ? Math.floor((new Date(doc.expiration_date) - today) / (1000 * 60 * 60 * 24))
                        : null;

                    let status = 'valid';
                    if (diff !== null) {
                        if (diff < 0) status = 'expired';
                        else if (diff <= days) status = 'expiring';
                    }

                    detailed[status].push(doc);
                });

                resolve(detailed);
            });
        });
    }

};
