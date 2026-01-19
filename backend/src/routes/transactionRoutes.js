// backend/src/routes/transactionRoutes.js

const express = require('express');
const TransactionController = require('../controllers/TransactionController');
const auth = require('../middlewares/auth');
const role = require('../middlewares/role');
const validate = require('../middlewares/validate');
const { transactionCreateSchema, transactionUpdateSchema } = require('../validators/transactionSchema');

const router = express.Router();

// Todas as rotas protegidas, só usuários logados podem acessar
router.use(auth);

// Rotas CRUD
router.post('/', role(['admin', 'manager']), validate(transactionCreateSchema), TransactionController.create);
router.get('/', role(['admin', 'manager']), TransactionController.findAll);
router.get('/:id', role(['admin', 'manager']), TransactionController.findById);
router.put('/:id', role(['admin', 'manager']), validate(transactionUpdateSchema), TransactionController.update);
router.delete('/:id', role(['admin']), TransactionController.delete);

module.exports = router;
