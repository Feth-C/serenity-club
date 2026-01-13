// backend/src/routes/employeeRoutes.js

const express = require('express');
const router = express.Router();
const EmployeeController = require('../controllers/EmployeeController');
const auth = require('../middlewares/auth');
const role = require('../middlewares/role');
const validate = require('../middlewares/validate');
const { employeeCreateSchema, employeeUpdateSchema } = require('../validators/employeeSchema');

// -----------------------------
// Middleware global - protege todas as rotas
// -----------------------------
router.use(auth);

// -----------------------------
// Apenas manager pode criar, listar, atualizar e deletar employees
// -----------------------------
router.get('/', role(['admin', 'manager']), EmployeeController.list);
router.post('/', role(['admin', 'manager']), validate(employeeCreateSchema), EmployeeController.create);
router.get('/:id', role(['admin', 'manager']), EmployeeController.get);
router.put('/:id', role(['admin', 'manager']), validate(employeeUpdateSchema), EmployeeController.update);
router.delete('/:id', role(['admin', 'manager']), EmployeeController.delete);
router.post('/:id/enable-login', role(['admin', 'manager']), EmployeeController.enableLogin);

module.exports = router;
