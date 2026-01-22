const express = require('express');
const router = express.Router({ mergeParams: true });

const auth = require('../middlewares/auth');
const role = require('../middlewares/role');
const memberAccess = require('../middlewares/memberAccess');
const upload = require('../middlewares/upload');
const MemberDocumentController = require('../controllers/MemberDocumentController');
const unitContext = require('../middlewares/unitContext');

// -----------------------------
// Middleware global
// -----------------------------
router.use(auth);

// -----------------------------
// Criar documento para um membro
// POST /members/:memberId/documents
// Admin ou manager responsável
// -----------------------------
router.post('/', role(['admin', 'manager']), memberAccess, upload.single('file'), unitContext, MemberDocumentController.create);

// -----------------------------
// Listar documentos de um membro
// GET /members/:memberId/documents
// -----------------------------
router.get('/', memberAccess, unitContext, MemberDocumentController.list);

// -----------------------------
// Buscar documento por ID
// GET /members/:memberId/documents/:id
// -----------------------------
router.get('/:id', memberAccess, unitContext, MemberDocumentController.get);

// -----------------------------
// Atualizar documento
// PUT /members/:memberId/documents/:id
// -----------------------------
router.put('/:id', role(['admin', 'manager']), memberAccess, unitContext, MemberDocumentController.update);

// -----------------------------
// Deletar documento
// DELETE /members/:memberId/documents/:id
// -----------------------------
router.delete('/:id', role(['admin', 'manager']), memberAccess, unitContext, MemberDocumentController.delete);

// -----------------------------
// Download documento
// GET /members/:memberId/documents/:id/download
// -----------------------------
router.get('/:id/download', memberAccess, unitContext, MemberDocumentController.download);

module.exports = router;
