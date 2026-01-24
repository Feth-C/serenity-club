// backend/src/models/Agenda.js

const db = require('../database/db');

module.exports = {
  // -----------------------------
  // Criar nova agenda
  // -----------------------------
  create(unitId, clientId, startTime, endTime, status = 'scheduled', notes = null) {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO agendas (unit_id, client_id, start_time, end_time, status, notes)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      db.run(query, [unitId, clientId, startTime, endTime, status, notes], function(err) {
        if (err) return reject(err);
        resolve({ id: this.lastID });
      });
    });
  },

  // -----------------------------
  // Listar agendas por unidade
  // -----------------------------
  findAllByUnit(unitId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT a.id, a.unit_id, a.client_id, c.name AS client_name, a.start_time, a.end_time, a.status, a.notes, a.created_at
        FROM agendas a
        JOIN clients c ON c.id = a.client_id
        WHERE a.unit_id = ?
        ORDER BY a.start_time DESC
      `;
      db.all(query, [unitId], (err, rows) => err ? reject(err) : resolve(rows));
    });
  },

  // -----------------------------
  // Buscar agenda por ID
  // -----------------------------
  getById(id) {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM agendas WHERE id = ?`;
      db.get(query, [id], (err, row) => err ? reject(err) : resolve(row));
    });
  },

  // -----------------------------
  // Atualizar agenda
  // -----------------------------
  update(id, data) {
    return new Promise((resolve, reject) => {
      const allowed = ['start_time', 'end_time', 'status', 'notes'];
      const entries = Object.entries(data).filter(([key]) => allowed.includes(key));
      if (!entries.length) return resolve(0);

      const fields = entries.map(([key]) => `${key} = ?`).join(', ');
      const values = entries.map(([, value]) => value);

      const query = `UPDATE agendas SET ${fields} WHERE id = ?`;
      db.run(query, [...values, id], function(err) {
        if (err) return reject(err);
        resolve(this.changes);
      });
    });
  },

  // -----------------------------
  // Deletar agenda
  // -----------------------------
  delete(id) {
    return new Promise((resolve, reject) => {
      const query = `DELETE FROM agendas WHERE id = ?`;
      db.run(query, [id], function(err) {
        if (err) return reject(err);
        resolve(this.changes);
      });
    });
  }
};
