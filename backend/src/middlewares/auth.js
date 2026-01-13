// backend/src/middlewares/auth.js

const jwt = require('jsonwebtoken');
const AppError = require('../errors/AppError');

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET não definido no .env');
}

module.exports = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new AppError('Token não fornecido.', 401);
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new AppError('Token inválido.', 401);
    }

    const token = parts[1];

    // Decodifica o JWT
    const decoded = jwt.verify(token, JWT_SECRET);

    // Define tanto req.user quanto req.userId / req.userRole
    req.user = { id: decoded.id, role: decoded.role };
    req.userId = decoded.id;
    req.userRole = decoded.role;

    next();
  } catch (err) {
    // Se o erro for de JWT
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token inválido.' });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado.' });
    }

    // Outros erros
    next(err);
  }
};
