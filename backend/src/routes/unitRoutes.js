// backend/src/routes/unitRoutes.js

const express = require('express');
const router = express.Router();
const UnitController = require('../controllers/UnitController');
const auth = require('../middlewares/auth');

router.use(auth);

router.get('/', UnitController.list);
router.post('/', UnitController.create);

module.exports = router;