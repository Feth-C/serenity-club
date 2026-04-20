// backend/src/routes/sessionRoutes.js

const express = require('express');
const SessionController = require('../controllers/SessionController');
const auth = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const unitContext = require('../middlewares/unitContext');
const { sessionCreateSchema, sessionUpdateSchema, sessionCloseSchema } = require('../validators/sessionSchema');

const router = express.Router();

// Todas as rotas de sessão exigem autenticação e unidade ativa
router.use(auth);
router.use(unitContext);

// Criar nova sessão
router.post('/', validate(sessionCreateSchema), SessionController.create);

// Listar sessões abertas
router.get('/open', SessionController.listOpen);

// Histórico de sessões (fechadas + canceladas)
router.get('/history', SessionController.listHistory);

// Buscar sessão por ID
router.get('/:id', SessionController.get);

// Atualizar sessão
router.put('/:id', validate(sessionUpdateSchema), SessionController.update);

// Fechar sessão manualmente
router.put('/:id/close', validate(sessionCloseSchema), SessionController.close);

// Cancelar sessão
router.put('/:id/cancel', SessionController.cancel);

module.exports = router;