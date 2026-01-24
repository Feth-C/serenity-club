// backend/src/routes/clientRoutes.js

const express = require('express');
const router = express.Router();
const ClientController = require('../controllers/ClientController');
const auth = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const unitContext = require('../middlewares/unitContext');
const { clientCreateSchema, clientUpdateSchema } = require('../validators/clientSchema');

// -----------------------------
// Todas as rotas protegidas
// -----------------------------
router.use(auth);

// -----------------------------
// CRUD de Clientes
// -----------------------------
router.post('/', validate(clientCreateSchema), unitContext, ClientController.create);
router.get('/', unitContext, ClientController.list);
router.get('/:id', unitContext, ClientController.get);
router.put('/:id', validate(clientUpdateSchema), unitContext, ClientController.update);
router.delete('/:id', unitContext, ClientController.delete);

module.exports = router;
