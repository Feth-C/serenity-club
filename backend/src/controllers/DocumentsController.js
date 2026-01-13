// backend/src/controllers/DocumentsController.js

const Document = require('../models/Document');

// -----------------------------
// GET /documents
// -----------------------------
const getDocuments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 10;
    const status = req.query.status;

    // Busca todos os documentos, aplicando filtro de status
    let filters = {};
    if (status) filters.status = status;

    const allDocuments = await Document.findAll(filters);

    // Paginação manual
    const totalItems = allDocuments.length;
    const totalPages = Math.ceil(totalItems / perPage);
    const offset = (page - 1) * perPage;
    const items = allDocuments.slice(offset, offset + perPage);

    res.json({
      items,
      totalItems,
      totalPages,
      currentPage: page
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
    const { name, type, expiration_date, owner_type, owner_id, notes } = req.body;

    if (!name || !type || !owner_type || !owner_id || !req.file) {
      return res.status(400).json({ message: 'Todos os campos obrigatórios devem ser preenchidos' });
    }

    const file_path = req.file.path; // caminho absoluto do arquivo

    const result = await Document.create({
      name,
      type,
      expiration_date,
      owner_type,
      owner_id,
      file_path,
      notes
    });

    res.status(201).json({
      id: result.id,
      name,
      type,
      expiration_date,
      owner_type,
      owner_id,
      notes,
      file_path
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
    const { name, type, expiration_date, status, owner_type, owner_id, notes } = req.body;

    const data = {
      name,
      type,
      expiration_date,
      status,
      owner_type,
      owner_id,
      notes
    };

    if (req.file) {
      data.file_path = req.file.path;
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

    if (changes === 0) return res.status(404).json({ message: 'Documento não encontrado' });

    res.json({ message: 'Documento excluído com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao excluir documento' });
  }
};

module.exports = {
  getDocuments,
  getDocumentById,
  createDocument,
  updateDocument,
  deleteDocument
};
