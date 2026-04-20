// backend/src/routes/transactionRoutes.js

const express = require('express');
const TransactionController = require('../controllers/TransactionController');
const auth = require('../middlewares/auth');
const role = require('../middlewares/role');
const validate = require('../middlewares/validate');
const unitContext = require('../middlewares/unitContext');
const { transactionCreateSchema, transactionUpdateSchema } = require('../validators/transactionSchema');

const router = express.Router();

// Todas as rotas protegidas, só usuários logados podem acessar
router.use(auth);

// Rotas CRUD
router.post('/', role(['admin', 'manager']), validate(transactionCreateSchema), unitContext, TransactionController.create);
router.get('/', role(['admin', 'manager']), unitContext, TransactionController.findAll);
router.get('/:id', role(['admin', 'manager']), unitContext, TransactionController.findById);
router.put('/:id', role(['admin', 'manager']), validate(transactionUpdateSchema), unitContext, TransactionController.update);
router.delete('/:id', role(['admin']), unitContext, TransactionController.delete);

module.exports = router;
