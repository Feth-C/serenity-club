// backend/src/models/Report.js

const db = require('../database/db');

module.exports = {

    sessionsByPeriod({ unitId, startDate, endDate }) {
        return new Promise((resolve, reject) => {
            db.all(
                `SELECT * FROM sessions
         WHERE unit_id = ? AND start_time BETWEEN ? AND ?
         ORDER BY start_time ASC`,
                [unitId, startDate, endDate],
                (err, rows) => err ? reject(err) : resolve(rows)
            );
        });
    },

    financialReport({ unitId, startDate, endDate }) {
        return new Promise((resolve, reject) => {
            db.all(
                `SELECT status, COUNT(*) as total_sessions, SUM(final_amount) as total_revenue, SUM(paid_amount) as total_paid
         FROM sessions
         WHERE unit_id = ? AND start_time BETWEEN ? AND ? AND status = 'closed'
         GROUP BY status`,
                [unitId, startDate, endDate],
                (err, rows) => err ? reject(err) : resolve(rows)
            );
        });
    },

    operationalReport({ unitId, startDate, endDate }) {
        return new Promise((resolve, reject) => {
            db.all(
                `SELECT status, COUNT(*) as total, AVG(planned_minutes) as avg_duration
         FROM sessions
         WHERE unit_id = ? AND start_time BETWEEN ? AND ?
         GROUP BY status`,
                [unitId, startDate, endDate],
                (err, rows) => err ? reject(err) : resolve(rows)
            );
        });
    }

};
