// backend/src/routes/memberRoutes.js

const express = require('express');
const router = express.Router();
const MemberController = require('../controllers/MemberController');
const validate = require('../middlewares/validate');
const auth = require('../middlewares/auth');
const role = require('../middlewares/role');
const unitContext = require('../middlewares/unitContext');

const { memberCreateSchema, memberUpdateSchema } = require('../validators/memberSchema');

router.use(auth);

// GET /members
router.get('/', role(['admin', 'manager', 'member']), unitContext, MemberController.list);

// GET /members/me
router.get('/me', role(['member']), unitContext, MemberController.getMe);

// POST /members
router.post('/', role(['admin', 'manager']), validate(memberCreateSchema), unitContext, MemberController.create);

// PUT /members/:id
router.put('/:id', role(['admin', 'manager']), validate(memberUpdateSchema), unitContext, MemberController.update);

// DELETE /members/:id
router.delete('/:id', role(['admin', 'manager']), unitContext, MemberController.delete);

// GET /members/:id
router.get('/:id', role(['admin', 'manager', 'member']), unitContext, MemberController.get);

module.exports = router;

