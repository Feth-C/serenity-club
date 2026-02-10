// backend/src/routes/clientRoutes.js

const express = require('express');
const router = express.Router();
const ClientController = require('../controllers/ClientController');
const unitContext = require('../middlewares/unitContext');
const auth = require('../middlewares/auth'); // seu middleware de auth

// Todas as rotas precisam do usuário autenticado e unidade ativa
router.use(auth);    // garante req.userId
router.use(unitContext);       // garante req.activeUnitId

router.get('/', ClientController.findAll);
router.get('/:id', ClientController.findById);
router.post('/', ClientController.create);
router.put('/:id', ClientController.update);
router.delete('/:id', ClientController.delete);

module.exports = router;
