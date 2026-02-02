// backend/src/routes/sessionRoutes.js

const express = require('express');
const SessionController = require('../controllers/SessionController');
const auth = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const unitContext = require('../middlewares/unitContext');
const { sessionCreateSchema, sessionUpdateSchema, sessionCloseSchema } = require('../validators/sessionSchema');

const router = express.Router();

// todas as rotas de sessão exigem autenticação
router.use(auth);
router.use(unitContext);

// --------------------------------------------------
// Criar nova sessão
// POST /sessions
// --------------------------------------------------
router.post('/', validate(sessionCreateSchema), SessionController.create);

// --------------------------------------------------
// Listar sessões abertas da unit ativa
// GET /sessions/open
// --------------------------------------------------
router.get('/open', SessionController.listOpen);

// --------------------------------------------------
// Buscar sessão por ID
// GET /sessions/:id
// --------------------------------------------------
router.get('/:id', SessionController.get);

// --------------------------------------------------
// Atualizar tempo planejado
// PUT /sessions/:id/time
// --------------------------------------------------
router.put('/:id', validate(sessionUpdateSchema), SessionController.update);

// --------------------------------------------------
// Fechar sessão manualmente
// PUT /sessions/:id/close
// --------------------------------------------------
router.put('/:id/close', validate(sessionCloseSchema), SessionController.close);

module.exports = router;
