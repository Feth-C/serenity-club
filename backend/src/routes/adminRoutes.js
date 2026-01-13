// backend/src/routes/adminRoutes.js

const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');
const auth = require('../middlewares/auth');
const role = require('../middlewares/role');
const validate = require('../middlewares/validate');
const { userCreateSchema } = require('../validators/userSchema');

// -----------------------------
// Apenas admin pode acessar
// -----------------------------
router.use(auth);      // Verifica JWT
router.use(role('admin')); // Apenas admin

// -----------------------------
// Criar usuário interno
// -----------------------------
router.post('/users', validate(userCreateSchema), UserController.createByAdmin);

module.exports = router;
