// backend/src/middlewares/role.js

const AppError = require('../errors/AppError');

/**
 * Uso:
 * role('admin')
 * role(['admin', 'manager'])
 * role(['admin', 'member'], { allowSelf: true, selfParam: 'id' })
 */
const role = (allowedRoles, options = {}) => {
  if (!Array.isArray(allowedRoles)) allowedRoles = [allowedRoles];

  return (req, res, next) => {
    const user = req.user; // { id, role }
    if (!user || !user.role) throw new AppError('Ruolo utente non definito.', 403);

    // Admin sempre autorizado
    if (user.role === 'admin') return next();

    // Role permitida
    if (allowedRoles.includes(user.role)) return next();

    // Acesso ao próprio recurso (quando explicitamente permitido)
    if (options.allowSelf && options.selfParam) {
      const resourceId = Number(req.params[options.selfParam]);
      if (resourceId && resourceId === user.id) return next();
    }

    throw new AppError('Accesso negato.', 403);
  };
};

module.exports = role;
