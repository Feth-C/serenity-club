// backend/src/routes/financeRoutes.js

const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const role = require('../middlewares/role');
const FinanceController = require('../controllers/FinanceController');

router.use(auth);

router.get('/summary', role(['admin', 'manager']), FinanceController.summary);
router.get('/monthly', role(['admin', 'manager']), FinanceController.monthlySummary);

module.exports = router;
