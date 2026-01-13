// backend/src/controllers/DocumentsController.js

const db = require('../database/db');
const path = require('path')

// GET /documents
const getDocuments = (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const perPage = parseInt(req.query.perPage) || 10;
  const status = req.query.status;

  const offset = (page - 1) * perPage;
  let sql = 'SELECT * FROM documents';
  const params = [];

  if (status) {
    sql += ' WHERE status = ?';
    params.push(status);
  }

  sql += ' ORDER BY id DESC LIMIT ? OFFSET ?';
  params.push(perPage, offset);

  db.all(sql, params, (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Erro inesperado' });
    }

    db.get('SELECT COUNT(*) as count FROM documents' + (status ? ' WHERE status = ?' : ''), status ? [status] : [], (err2, countResult) => {
      if (err2) {
        console.error(err2);
        return res.status(500).json({ message: 'Erro inesperado' });
      }

      const totalItems = countResult.count;
      const totalPages = Math.ceil(totalItems / perPage);

      res.json({
        items: rows,
        totalItems,
        totalPages,
        currentPage: page
      });
    });
  });
};

// GET /documents/:id
const getDocumentById = (req, res) => {
  const id = req.params.id;
  const sql = 'SELECT * FROM documents WHERE id = ?';
  db.get(sql, [id], (err, row) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Erro inesperado' });
    }
    if (!row) return res.status(404).json({ message: 'Documento não encontrado' });
    res.json(row);
  });
};

// POST /documents
const createDocument = (req, res) => {
  const { name, type, expiration_date, status = 'valid', owner_type, owner_id, notes } = req.body;

  if (!name || !type || !owner_type || !owner_id || !req.file) {
    return res.status(400).json({ message: 'Todos os campos obrigatórios devem ser preenchidos' });
  }

  // caminho do arquivo salvo
  const file_path = path.relative(__dirname, req.file.path); // ou apenas req.file.path absoluto

  const sql = `INSERT INTO documents (name, type, expiration_date, status, owner_type, owner_id, notes, file_path)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

  db.run(
    sql,
    [name, type, expiration_date, status, owner_type, owner_id, notes, file_path],
    function (err) {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Erro ao criar documento' });
      }
      res.status(201).json({
        id: this.lastID,
        name,
        type,
        expiration_date,
        status,
        owner_type,
        owner_id,
        notes,
        file_path
      });
    }
  );
};

// PUT /documents/:id
const updateDocument = (req, res) => {
  const id = req.params.id;
  const { name, type, expiration_date, status, owner_type, owner_id } = req.body;

  if (req.file) {
    file_path = path.relative(__dirname, req.file.path);
  }

  const sql = `UPDATE documents
               SET name = ?, type = ?, expiration_date = ?, status = ?, owner_type = ?, owner_id = ?
               WHERE id = ?`;

  db.run(sql, [name, type, expiration_date, status, owner_type, owner_id, id], function (err) {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Erro ao atualizar documento' });
    }
    if (this.changes === 0) return res.status(404).json({ message: 'Documento não encontrado' });

    res.json({ id, name, type, expiration_date, status, owner_type, owner_id });
  });
};

// DELETE /documents/:id
const deleteDocument = (req, res) => {
  const id = req.params.id;
  const sql = 'DELETE FROM documents WHERE id = ?';
  db.run(sql, [id], function (err) {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Erro ao excluir documento' });
    }
    if (this.changes === 0) return res.status(404).json({ message: 'Documento não encontrado' });

    res.json({ message: 'Documento excluído com sucesso' });
  });
};

module.exports = {
  getDocuments,
  getDocumentById,
  createDocument,
  updateDocument,
  deleteDocument
};
