// backend/src/routes/memberRoutes.js

const express = require('express');
const router = express.Router();
const MemberController = require('../controllers/MemberController');
const validate = require('../middlewares/validate');
const auth = require('../middlewares/auth');
const role = require('../middlewares/role');

const { memberCreateSchema, memberUpdateSchema } = require('../validators/memberSchema');

router.use(auth);

// GET /members
router.get('/', role(['admin', 'manager', 'member']), MemberController.list);

// GET /members/me
router.get('/me', role(['member']), MemberController.getMe);

// POST /members
router.post('/', role(['admin', 'manager']), validate(memberCreateSchema), MemberController.create);

// PUT /members/:id
router.put('/:id', role(['admin', 'manager']), validate(memberUpdateSchema), MemberController.update);

// DELETE /members/:id
router.delete('/:id', role(['admin', 'manager']), MemberController.delete);

// GET /members/:id
router.get('/:id', role(['admin', 'manager', 'member']), MemberController.get);

module.exports = router;

