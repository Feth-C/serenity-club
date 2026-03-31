// backend/src/routes/reportRoutes.js

const express = require('express');
const auth = require('../middlewares/auth');
const unitContext = require('../middlewares/unitContext');
const ReportController = require('../controllers/ReportController');
const ReportExportController = require('../controllers/ReportExportController');

const router = express.Router();

router.use(auth);
router.use(unitContext);

// Apenas dados JSON
router.get('/:reportType', ReportController.fetchData);

// Exportar PDF/CSV
router.get('/:reportType/export', ReportExportController.export);

module.exports = router;
