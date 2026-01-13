// backend/src/routes/reportRoutes.js

const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const role = require('../middlewares/role');
const ReportController = require('../controllers/ReportController');

router.use(auth);

router.get('/monthly', role(['admin', 'manager']), ReportController.monthly);

module.exports = router;
