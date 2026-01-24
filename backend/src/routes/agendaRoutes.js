// backend/src/routes/agendaRoutes.js

const express = require('express');
const router = express.Router();
const AgendaController = require('../controllers/AgendaController');
const auth = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const unitContext = require('../middlewares/unitContext');
const { agendaCreateSchema, agendaUpdateSchema } = require('../validators/agendaSchema');

// -----------------------------
// Todas as rotas protegidas
// -----------------------------
router.use(auth);

// -----------------------------
// CRUD de Agendas
// -----------------------------
router.post('/', validate(agendaCreateSchema), unitContext, AgendaController.create);
router.get('/', unitContext, AgendaController.list);
router.get('/:id', unitContext, AgendaController.get);
router.put('/:id', validate(agendaUpdateSchema), unitContext, AgendaController.update);
router.delete('/:id', unitContext, AgendaController.delete);

module.exports = router;
