// backend/src/routes/reportRoutes.js

const express = require('express');
const router = express.Router();
const ReportController = require('../controllers/ReportController');
const unitContext = require('../middlewares/unitContext');

// GET /api/reports/monthly?month=YYYY-MM&currency=XXX
router.get('/monthly', unitContext, ReportController.generateMonthly);

module.exports = router;
