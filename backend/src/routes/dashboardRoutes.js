// backend/src/routes/dashboardRoutes.js

const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const role = require('../middlewares/role');
const DashboardController = require('../controllers/DashboardController');
const unitContext = require('../middlewares/unitContext');

// -----------------------------
// Middleware global
// -----------------------------
router.use(auth);

// Protegido por autenticação
router.get('/summary', role('admin'), unitContext, DashboardController.summary);

module.exports = router;
