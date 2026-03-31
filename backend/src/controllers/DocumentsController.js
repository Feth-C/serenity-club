// backend/src/controllers/DocumentsController.js

const Document = require('../models/Document');

// -----------------------------
// GET /documents
// -----------------------------
const getDocuments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 10;

    const filters = {
      unit_id: req.query.unit_id,
      owner_type: req.query.owner_type,
      owner_id: req.query.owner_id,
      is_active: req.query.is_active,
      status: req.query.status // 🔹 agora podemos filtrar status diretamente
    };

    const result = await Document.findAllPaginated({ page, perPage, filters });

    res.json({
      success: true,
      data: {
        items: result.items,
        page: result.currentPage,
        totalPages: result.totalPages,
        totalItems: result.totalItems
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro inesperado' });
  }
};

// -----------------------------
// GET /documents/:id
// -----------------------------
const getDocumentById = async (req, res) => {
  try {
    const id = req.params.id;
    const document = await Document.findById(id);

    if (document.unit_id !== req.user.unit_id) {
      return res.status(403).json({ message: 'Accesso negato' });
    }

    if (!document) return res.status(404).json({ message: 'Documento não encontrado' });
    res.json(document);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro inesperado' });
  }
};

// -----------------------------
// POST /documents
// -----------------------------
const createDocument = async (req, res) => {
  try {

    const {
      unit_id,
      name,
      type,
      expiration_date,
      owner_type,
      owner_id,
      notes
    } = req.body;

    const created_by = req.user?.id || null;

    if (!name || !type || !owner_type || !owner_id || !req.file) {
      return res.status(400).json({
        message: 'Campos obrigatórios não preenchidos'
      });
    }

    const file_path = req.file.path;
    const file_name = req.file.filename;
    const mime_type = req.file.mimetype;
    const file_size = req.file.size;

    const result = await Document.create({
      unit_id,
      name,
      type,
      expiration_date,
      owner_type,
      owner_id,
      notes,
      file_path,
      file_name,
      mime_type,
      file_size,
      created_by
    });

    res.status(201).json({
      id: result.id,
      name,
      type,
      expiration_date,
      owner_type,
      owner_id,
      file_name,
      mime_type,
      file_size
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao criar documento' });
  }
};

// -----------------------------
// PUT /documents/:id
// -----------------------------
const updateDocument = async (req, res) => {
  try {
    const id = req.params.id;
    const { unit_id, name, type, expiration_date, owner_type, owner_id, notes, is_active, created_by } = req.body;

    const data = {
      unit_id,
      name,
      type,
      expiration_date,
      owner_type,
      owner_id,
      notes,
      is_active,
      created_by
    };

    if (req.file) {
      data.file_path = req.file.path;
      data.file_name = req.file.filename;
      data.mime_type = req.file.mimetype;
      data.file_size = req.file.size;
    }

    const changes = await Document.update(id, data);

    if (changes === 0) return res.status(404).json({ message: 'Documento não encontrado' });

    res.json({ id, ...data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao atualizar documento' });
  }
};

// -----------------------------
// DELETE /documents/:id
// -----------------------------
const deleteDocument = async (req, res) => {
  try {
    const id = req.params.id;
    const changes = await Document.delete(id);

    if (document.unit_id !== req.user.unit_id) {
      return res.status(403).json({ message: 'Accesso negato' });
    }

    if (changes === 0) return res.status(404).json({ message: 'Documento não encontrado' });

    res.json({ message: 'Documento excluído com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao excluir documento' });
  }
};

// -----------------------------
// PREVIEW /documents/:id
// -----------------------------
const previewDocument = async (req, res) => {
  try {
    const id = req.params.id;
    const document = await Document.findById(id);
    const path = require('path');

    if (document.unit_id !== req.user.unit_id) {
      return res.status(403).json({ message: 'Accesso negato' });
    }

    if (!document) {
      return res.status(404).json({ message: 'Documento não encontrado' });
    }

    res.setHeader('Content-Type', document.mime_type);
    res.sendFile(path.resolve(document.file_path));

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao visualizar documento' });
  }
};

// -----------------------------
// DOWNLOAD /documents/:id
// -----------------------------
const downloadDocument = async (req, res) => {
  try {
    const id = req.params.id;
    const document = await Document.findById(id);

    if (document.unit_id !== req.user.unit_id) {
      return res.status(403).json({ message: 'Accesso negato' });
    }

    if (!document) {
      return res.status(404).json({ message: 'Documento não encontrado' });
    }

    res.download(document.file_path, document.file_name);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao baixar documento' });
  }
};

module.exports = {
  getDocuments,
  getDocumentById,
  createDocument,
  updateDocument,
  deleteDocument,
  previewDocument,
  downloadDocument
};
