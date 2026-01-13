// backend/src/models/Member.js

const db = require('../database/db');

module.exports = {

  // -----------------------------
  // ADMIN → lista todos
  // -----------------------------
  findAll(status = null) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT id, manager_id, user_id, name, email, phone,
               passport_number, passport_expiration,
               police_clearance_expiration, notes, status
        FROM members
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
  // MANAGER → apenas os próprios
  // -----------------------------
  findByManager(manager_id, status = null) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT id, manager_id, user_id, name, email, phone,
               passport_number, passport_expiration,
               police_clearance_expiration, notes, status
        FROM members
        WHERE manager_id = ?
        AND (? IS NULL OR status = ?)
        ORDER BY id DESC
      `;
      db.all(query, [manager_id, status, status], (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });
  },

  // -----------------------------
  // MEMBER → próprio registro
  // -----------------------------
  findByUserId(userId) {
    return new Promise((resolve, reject) => {
      db.get(`SELECT * FROM members WHERE user_id = ?`, [userId], (err, row) => {
        if (err) return reject(err);
        resolve(row);
      });
    });
  },

  findById(id) {
    return new Promise((resolve, reject) => {
      db.get(`SELECT * FROM members WHERE id = ?`, [id], (err, row) => {
        if (err) return reject(err);
        resolve(row);
      });
    });
  },

  create(data) {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO members
        (manager_id, user_id, name, email, phone,
         passport_number, passport_expiration,
         police_clearance_expiration, notes, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      db.run(query, [
        data.manager_id ?? null,
        data.user_id ?? null,
        data.name,
        data.email,
        data.phone,
        data.passport_number,
        data.passport_expiration,
        data.police_clearance_expiration,
        data.notes,
        data.status || 'active'
      ], function (err) {
        if (err) return reject(err);
        resolve({ id: this.lastID });
      });
    });
  },

  update(id, data) {
    return new Promise((resolve, reject) => {
      const allowed = [
        'name', 'email', 'phone',
        'passport_number', 'passport_expiration',
        'police_clearance_expiration', 'notes',
        'user_id', 'status'
      ];
      const entries = Object.entries(data).filter(([k]) => allowed.includes(k));
      if (!entries.length) return resolve(0);

      const fields = entries.map(([k]) => `${k} = ?`).join(', ');
      const values = entries.map(([, v]) => v);

      db.run(`UPDATE members SET ${fields} WHERE id = ?`,
        [...values, id],
        function (err) {
          if (err) return reject(err);
          resolve(this.changes);
        }
      );
    });
  },

  delete(id) {
    return new Promise((resolve, reject) => {
      db.run(`DELETE FROM members WHERE id = ?`, [id], function (err) {
        if (err) return reject(err);
        resolve(this.changes);
      });
    });
  }
};
