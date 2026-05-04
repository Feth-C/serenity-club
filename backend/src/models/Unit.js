// backend/src/models/Unit.js

const db = require('../database/db');

module.exports = {
    create(name, type, description = null) {
        return new Promise((resolve, reject) => {
            const query = `
        INSERT INTO units (name, type, description, is_active)
        VALUES (?, ?, ?, 1)
      `;
            db.run(query, [name, type, description], function (err) {
                if (err) return reject(err);
                resolve({ id: this.lastID });
            });
        });
    },

    findAll() {
        return new Promise((resolve, reject) => {
            const query = `SELECT * FROM units ORDER BY name ASC`;
            db.all(query, [], (err, rows) => (err ? reject(err) : resolve(rows)));
        });
    },

    getById(id) {
        return new Promise((resolve, reject) => {
            const query = `SELECT * FROM units WHERE id = ?`;
            db.get(query, [id], (err, row) => (err ? reject(err) : resolve(row)));
        });
    },

    update(id, data) {
        return new Promise((resolve, reject) => {
            const allowed = ['name', 'type', 'description', 'is_active'];
            const entries = Object.entries(data).filter(([key]) => allowed.includes(key));
            if (!entries.length) return resolve(0);

            const fields = entries.map(([key]) => `${key} = ?`).join(', ');
            const values = entries.map(([, value]) => value);

            const query = `UPDATE units SET ${fields} WHERE id = ?`;
            db.run(query, [...values, id], function (err) {
                if (err) return reject(err);
                resolve(this.changes);
            });
        });
    }
};