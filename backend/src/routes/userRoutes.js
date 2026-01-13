// backend/src/routes/userRoutes.js

const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');
const auth = require('../middlewares/auth'); // Protege as rotas
const validate = require('../middlewares/validate');
const { userUpdateSchema } = require('../validators/userSchema');

// -----------------------------
// Rotas protegidas
// -----------------------------
router.use(auth);

// -----------------------------
// CRUD de usuários
// -----------------------------
router.get('/', UserController.list);
router.get('/me', UserController.getMe);
router.get('/:id', UserController.get);
router.put('/:id', validate(userUpdateSchema), UserController.update);
router.delete('/:id', UserController.delete);

module.exports = router;
