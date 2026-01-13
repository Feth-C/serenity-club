// backend/src/routes/documentRoutes.js

const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const upload = require('../middlewares/upload');
const DocumentsController = require('../controllers/DocumentsController');

// -----------------------------
// Middleware global
// -----------------------------
router.use(auth);

// -----------------------------
// GET /documents
// -----------------------------
// router.get('/', DocumentsController.list);

// GET /documents
router.get('/', DocumentsController.getDocuments);

// GET /documents/:id
router.get('/:id', DocumentsController.getDocumentById);

// POST /documents (com upload)
router.post('/', upload.single('file'),   // aqui indica que o campo do formData é 'file'
    DocumentsController.createDocument
);

// POST /documents
router.post('/', DocumentsController.createDocument);

// PUT /documents/:id (com upload)
router.put('/:id', upload.single('file'),
    DocumentsController.updateDocument
);

// PUT /documents/:id
router.put('/:id', DocumentsController.updateDocument);

// DELETE /documents/:id
router.delete('/:id', DocumentsController.deleteDocument);

module.exports = router;
