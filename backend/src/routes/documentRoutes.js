// backend/src/routes/documentRoutes.js

const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const upload = require('../middlewares/upload');
const DocumentsController = require('../controllers/DocumentsController');
const unitContext = require('../middlewares/unitContext');

// -----------------------------
// Middleware global
// -----------------------------
router.use(auth);
router.use(unitContext);

// GET /documents
router.get('/', DocumentsController.getDocuments);

// GET /documents/:id
router.get('/:id', DocumentsController.getDocumentById);

// POST /documents (com upload)
router.post('/', upload.single('file'), DocumentsController.createDocument);

// PUT /documents/:id (com upload)
router.put('/:id', upload.single('file'), DocumentsController.updateDocument);

// DELETE /documents/:id
router.delete('/:id', DocumentsController.deleteDocument);

// PREVIEW /documents/:id
router.get('/:id/preview', DocumentsController.previewDocument);

// DOWNLOAD /documents/:id
router.get('/:id/download', DocumentsController.downloadDocument);

module.exports = router;
