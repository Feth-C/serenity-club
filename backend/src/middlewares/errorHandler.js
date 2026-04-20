// backend/src/middlewares/errorHandler.js

const { ZodError } = require('zod');

module.exports = (err, req, res, next) => {
  // Erros de validação Zod
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: err.errors.map(e => ({
        path: e.path.join('.'),
        message: e.message
      }))
    });
  }

  // Erros operacionais (AppError)
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      error: err.message
    });
  }

  // Erro inesperado (bug)
  console.error('💥 Erro inesperado:', err);

  return res.status(500).json({
    error: 'Erro interno do servidor.'
  });
};
