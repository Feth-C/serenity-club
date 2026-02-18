// backend/src/models/Member.js

const db = require('../database/db');

module.exports = {
  // -----------------------------
  // ADMIN → lista todos da unidade
  // -----------------------------
  findAllByUnit(unitId, status = null) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT
          id, manager_id, user_id, name, email, phone,
          passport_number, passport_expiration,
          police_clearance_expiration, notes, status, unit_id
        FROM members
        WHERE unit_id = ?
        AND (? IS NULL OR status = ?)
        ORDER BY id DESC
      `;
      db.all(query, [unitId, status, status], (err, rows) => {
        if (err) return reject(err);
        resolve(rows || []);
      });
    });
  },

  // -----------------------------
  // MANAGER → apenas os próprios da unidade
  // -----------------------------
  findByManagerAndUnit(manager_id, unitId, status = null) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT
          id, manager_id, user_id, name, email, phone,
          passport_number, passport_expiration,
          police_clearance_expiration, notes, status, unit_id
        FROM members
        WHERE manager_id = ?
        AND unit_id = ?
        AND (? IS NULL OR status = ?)
        ORDER BY id DESC
      `;
      db.all(query, [manager_id, unitId, status, status], (err, rows) => {
        if (err) return reject(err);
        resolve(rows || []);
      });
    });
  },

  // -----------------------------
  // MEMBER → próprio registro na unidade
  // -----------------------------
  findByUserAndUnit(userId, unitId) {
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT * FROM members WHERE user_id = ? AND unit_id = ?`,
        [userId, unitId],
        (err, row) => {
          if (err) return reject(err);
          resolve(row || null);
        }
      );
    });
  },

  // -----------------------------
  // Buscar por ID dentro da unidade
  // -----------------------------
  findByIdAndUnit(id, unitId) {
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT * FROM members WHERE id = ? AND unit_id = ?`,
        [id, unitId],
        (err, row) => {
          if (err) return reject(err);
          resolve(row || null);
        }
      );
    });
  },

  // -----------------------------
  // Criar membro
  // -----------------------------
  create(data) {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO members
        (manager_id, user_id, name, email, phone,
         passport_number, passport_expiration,
         police_clearance_expiration, notes, status, unit_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      db.run(
        query,
        [
          data.manager_id ?? null,
          data.user_id ?? null,
          data.name,
          data.email,
          data.phone,
          data.passport_number,
          data.passport_expiration,
          data.police_clearance_expiration,
          data.notes,
          data.status || 'active',
          data.unit_id
        ],
        function (err) {
          if (err) return reject(err);
          resolve({ id: this.lastID });
        }
      );
    });
  },

  // -----------------------------
  // Atualizar membro
  // -----------------------------
  update(id, data) {
    return new Promise((resolve, reject) => {
      const allowedFields = [
        'name',
        'email',
        'phone',
        'passport_number',
        'passport_expiration',
        'police_clearance_expiration',
        'notes',
        'user_id',
        'status',
        'manager_id'
      ];

      const entries = Object.entries(data).filter(
        ([key]) => allowedFields.includes(key)
      );

      if (!entries.length) return resolve(0);

      const fields = entries.map(([key]) => `${key} = ?`).join(', ');
      const values = entries.map(([, value]) => value);

      db.run(
        `UPDATE members SET ${fields} WHERE id = ?`,
        [...values, id],
        function (err) {
          if (err) return reject(err);
          resolve(this.changes);
        }
      );
    });
  },

  // -----------------------------
  // Deletar membro
  // -----------------------------
  delete(id) {
    return new Promise((resolve, reject) => {
      db.run(`DELETE FROM members WHERE id = ?`, [id], function (err) {
        if (err) return reject(err);
        resolve(this.changes);
      });
    });
  }
};
