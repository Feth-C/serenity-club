// backend/src/routes/authRoutes.js

const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController'); // importando controller
const auth = require('../middlewares/auth'); // Valida il token di autenticazione
const validate = require('../middlewares/validate');
const { authRegisterSchema, authLoginSchema, } = require('../validators/authSchema');

// -----------------------------
// Rota de Registrar Admin
// -----------------------------
router.post('/setup-admin', validate(authRegisterSchema), AuthController.setupAdmin);

// -----------------------------
// Rota de Registrar novo usuário
// -----------------------------
router.post('/register', validate(authRegisterSchema), AuthController.register);

// -----------------------------
// Rota de Login
// -----------------------------
router.post('/login', validate(authLoginSchema), AuthController.login);

// -----------------------------
// Rota de dados do usuário autenticado
// -----------------------------
router.get('/me', auth, AuthController.me)

// -----------------------------
// Verifica se sistema precisa de setup inicial
// -----------------------------
router.get('/setup-check', AuthController.setupCheck);

// -----------------------------
// Rota de logout
// -----------------------------
router.post('/logout', auth, (req, res) => {
    res.json({ message: 'Disconnessione avvenuta con successo!' });
});


module.exports = router;
