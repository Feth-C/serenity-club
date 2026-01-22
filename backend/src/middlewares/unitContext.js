// backend/src/middlewares/unitContext.js

const db = require('../database/db');
const AppError = require('../errors/AppError');

module.exports = (req, res, next) => {
  const userId = req.userId;
  if (!userId) {
    throw new AppError('Usuário não autenticado.', 401);
  }

  // Unidade ativa pode vir do header ou query
  const unitIdRaw = req.headers['x-unit-id'] || req.query.unit_id;
  const unitId = unitIdRaw ? Number(unitIdRaw) : null;

  if (!unitId) {
    throw new AppError('Unidade ativa não informada.', 400);
  }

  const sql = `
    SELECT 1
    FROM user_units
    WHERE user_id = ?
      AND unit_id = ?
      AND is_active = 1
    LIMIT 1
  `;

  db.get(sql, [userId, unitId], (err, row) => {
    if (err) return next(err);

    if (!row) {
      throw new AppError('Usuário não possui acesso a esta unidade.', 403);
    }

    // Contexto de unidade resolvido
    req.activeUnitId = unitId;

    next();
  });
};
