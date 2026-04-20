// backend/src/routes/financeRoutes.js

const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const role = require('../middlewares/role');
const FinanceController = require('../controllers/FinanceController');
const unitContext = require('../middlewares/unitContext');

router.use(auth);

router.get('/summary', role(['admin', 'manager']), unitContext, FinanceController.summary);
router.get('/monthly', role(['admin', 'manager']), unitContext, FinanceController.monthlySummary);

module.exports = router;
