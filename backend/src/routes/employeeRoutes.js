// backend/src/routes/employeeRoutes.js

const express = require('express');
const router = express.Router();
const EmployeeController = require('../controllers/EmployeeController');
const auth = require('../middlewares/auth');
const role = require('../middlewares/role');
const validate = require('../middlewares/validate');
const unitContext = require('../middlewares/unitContext');
const { employeeCreateSchema, employeeUpdateSchema } = require('../validators/employeeSchema');

// -----------------------------
// Middleware global - protege todas as rotas
// -----------------------------
router.use(auth);

// -----------------------------
// Apenas manager pode criar, listar, atualizar e deletar employees
// -----------------------------
router.get('/', role(['admin', 'manager']), unitContext, EmployeeController.list);
router.post('/', role(['admin', 'manager']), validate(employeeCreateSchema), unitContext, EmployeeController.create);
router.get('/:id', role(['admin', 'manager']), unitContext, EmployeeController.get);
router.put('/:id', role(['admin', 'manager']), validate(employeeUpdateSchema), unitContext, EmployeeController.update);
router.delete('/:id', role(['admin', 'manager']), unitContext, EmployeeController.delete);
router.post('/:id/enable-login', role(['admin', 'manager']), unitContext, EmployeeController.enableLogin);

module.exports = router;
