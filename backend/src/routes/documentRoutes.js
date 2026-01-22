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

// -----------------------------
// GET /documents
// -----------------------------
// router.get('/', DocumentsController.list);

// GET /documents
router.get('/', unitContext, DocumentsController.getDocuments);

// GET /documents/:id
router.get('/:id', unitContext, DocumentsController.getDocumentById);

// POST /documents (com upload)
router.post('/', unitContext, upload.single('file'),   // aqui indica que o campo do formData é 'file'
    DocumentsController.createDocument
);

// POST /documents
router.post('/', unitContext, DocumentsController.createDocument);

// PUT /documents/:id (com upload)
router.put('/:id', unitContext, upload.single('file'),
    DocumentsController.updateDocument
);

// PUT /documents/:id
router.put('/:id', unitContext, DocumentsController.updateDocument);

// DELETE /documents/:id
router.delete('/:id', unitContext, DocumentsController.deleteDocument);

module.exports = router;
