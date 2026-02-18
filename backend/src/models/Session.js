// backend/src/models/Session.js

const db = require('../database/db');

const addMinutes = (date, minutes) =>
  new Date(new Date(date).getTime() + minutes * 60000).toISOString();

module.exports = {

  // -----------------------------
  // Criar nova sessão
  // -----------------------------
  create({
    unitId,
    clientId = null,
    clientName = null,
    contact = null,
    email = null,
    address = null,
    visitType = 'first',
    startTime,
    plannedMinutes,
    plannedAmount = null,
    currency = 'EUR',
    notes = null,
    createdBy
  }) {
    return new Promise((resolve, reject) => {
      const expectedEndTime = addMinutes(startTime, plannedMinutes);

      const query = `
      INSERT INTO sessions (
        unit_id,
        client_id,
        client_name,
        contact,
        email,
        address,
        visit_type,
        start_time,
        planned_minutes,
        expected_end_time,
        planned_amount,
        currency,
        notes,
        created_by
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

      db.run(
        query,
        [
          unitId,
          clientId,
          clientName,
          contact,
          email,
          address,
          visitType,
          startTime,
          plannedMinutes,
          expectedEndTime,
          plannedAmount,
          currency,
          notes,
          createdBy
        ],
        function (err) {
          if (err) return reject(err);
          resolve({ id: this.lastID });
        }
      );
    });
  },

  // -----------------------------
  // Buscar sessões abertas por unidade
  // -----------------------------
  findOpenByUnit(unitId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT *
        FROM sessions
        WHERE unit_id = ?
          AND status = 'open'
        ORDER BY start_time ASC
      `;

      db.all(query, [unitId], (err, rows) =>
        err ? reject(err) : resolve(rows)
      );
    });
  },

  // -----------------------------
  // Buscar histórico: fechadas + canceladas por unidade
  // -----------------------------
  findHistoryByUnit(unitId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT *
        FROM sessions
        WHERE unit_id = ?
          AND status IN ('closed', 'cancelled')
        ORDER BY start_time DESC
      `;

      db.all(query, [unitId], (err, rows) =>
        err ? reject(err) : resolve(rows)
      );
    });
  },

  // -----------------------------
  // Buscar sessão por ID (sempre validar unit no controller)
  // -----------------------------
  getById(id) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT *
        FROM sessions
        WHERE id = ?
        LIMIT 1
      `;

      db.get(query, [id], (err, row) =>
        err ? reject(err) : resolve(row)
      );
    });
  },

  // -----------------------------
  // Atualizar Sessão
  // -----------------------------
  updateOpenSession(id, unitId, data) {
    return new Promise((resolve, reject) => {
      const fields = [];
      const values = [];

      if (
        typeof data.start_time === 'string' &&
        typeof data.planned_minutes === 'number'
      ) {
        data.expected_end_time = addMinutes(
          data.start_time,
          data.planned_minutes
        );
      }

      for (const key in data) {
        if (data[key] !== undefined) {
          fields.push(`${key} = ?`);
          values.push(data[key]);
        }
      }

      if (!fields.length) return resolve(0);

      const query = `
      UPDATE sessions
      SET ${fields.join(', ')}
      WHERE id = ?
        AND unit_id = ?
        AND status = 'open'
    `;

      values.push(id, unitId);

      db.run(query, values, function (err) {
        if (err) return reject(err);
        resolve(this.changes);
      });
    });
  },

  // -----------------------------
  // Atualiza o Calendario do Google
  // -----------------------------
  updateGoogleEventId(id, eventId) {
    return new Promise((resolve, reject) => {
      db.run(
        `UPDATE sessions SET google_event_id = ? WHERE id = ?`,
        [eventId, id],
        function (err) {
          if (err) return reject(err);
          resolve(this.changes);
        }
      );
    });
  },

  // -----------------------------
  // Atualiza o Status da Sessão
  // -----------------------------
  updateStatus(id, status) {
    return new Promise((resolve, reject) => {
      db.run(
        `UPDATE sessions SET status = ? WHERE id = ?`,
        [status, id],
        function (err) {
          if (err) return reject(err);
          resolve(this.changes);
        }
      );
    });
  },

  // -----------------------------
  // Fechar sessão (manual ou automática)
  // -----------------------------
  close({
    id,
    actualEndTime,
    finalAmount,
    paidAmount = 0,
    paymentMethod = null,
    notes = null
  }) {
    return new Promise((resolve, reject) => {
      const query = `
        UPDATE sessions
        SET status = 'closed',
            actual_end_time = ?,
            final_amount = ?,
            paid_amount = ?,
            payment_method = ?,
            notes = ?
        WHERE id = ?
          AND status = 'open'
      `;

      db.run(
        query,
        [
          actualEndTime,
          finalAmount,
          paidAmount,
          paymentMethod,
          notes,
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
  // Buscar sessões que deveriam estar fechadas
  // (para job automático)
  // -----------------------------
  findExpiredOpenSessions(now) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT *
        FROM sessions
        WHERE status = 'open'
          AND expected_end_time <= ?
      `;

      db.all(query, [now], (err, rows) =>
        err ? reject(err) : resolve(rows)
      );
    });
  }
};

