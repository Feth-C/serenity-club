// backend/src/routes/reportRoutes.js

const express = require('express');
const router = express.Router();
const ReportController = require('../controllers/ReportController');

// GET /api/reports/monthly?month=YYYY-MM&currency=XXX
router.get('/monthly', ReportController.generateMonthly);

module.exports = router;
