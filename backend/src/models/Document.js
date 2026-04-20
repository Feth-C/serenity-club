// backend/src/models/Document.js

const db = require('../database/db');
const { getDocumentStatus } = require('../utils/documentEngine');

module.exports = {

  // -----------------------------
  // Criar documento
  // -----------------------------
  create({
    unit_id,
    name,
    type,
    expiration_date,
    owner_type,
    owner_id,
    file_path,
    notes = null,
    is_active = 1,
    created_by = null
  }) {
    return new Promise((resolve, reject) => {

      const query = `
      INSERT INTO documents
      (
        unit_id,
        name,
        type,
        expiration_date,
        owner_type,
        owner_id,
        file_path,
        notes,
        is_active,
        created_by
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

      db.run(
        query,
        [
          unit_id,
          name,
          type,
          expiration_date,
          owner_type,
          owner_id,
          file_path,
          notes,
          is_active,
          created_by
        ],
        function (err) {
          if (err) return reject(err);
          resolve({ id: this.lastID });
        }
      );
    });
  },

  // -----------------------------
  // Listar documentos (com filtros e paginação)
  // -----------------------------
  findAllPaginated({ page = 1, perPage = 10, filters = {} }) {
    return new Promise((resolve, reject) => {

      let baseQuery = `SELECT * FROM documents WHERE 1=1`;
      const params = [];

      // -----------------------------
      // Filtros base
      // -----------------------------
      if (filters.unit_id) {
        baseQuery += ` AND unit_id = ?`;
        params.push(filters.unit_id);
      }

      if (filters.owner_type) {
        baseQuery += ` AND owner_type = ?`;
        params.push(filters.owner_type);
      }

      if (filters.owner_id) {
        baseQuery += ` AND owner_id = ?`;
        params.push(filters.owner_id);
      }

      if (filters.is_active !== undefined) {
        baseQuery += ` AND is_active = ?`;
        params.push(filters.is_active);
      }

      // -----------------------------
      // Buscar todos os documentos para aplicar status virtual
      // -----------------------------
      db.all(baseQuery, params, (err, rows) => {
        if (err) return reject(err);

        // Aplicar DocumentEngine (status virtual)
        let items = rows.map(doc => ({
          ...doc,
          status: getDocumentStatus(doc.expiration_date)
        }));

        // Filtro por status (virtual)
        if (filters.status) {
          items = items.filter(doc => doc.status === filters.status);
        }

        // -----------------------------
        // Paginação
        // -----------------------------
        const totalItems = items.length;
        const totalPages = Math.ceil(totalItems / perPage);
        const offset = (page - 1) * perPage;
        const paginatedItems = items.slice(offset, offset + perPage);

        resolve({
          items: paginatedItems,
          totalItems,
          totalPages,
          currentPage: page
        });

      });
    });
  },

  // -----------------------------
  // Buscar documento por ID
  // -----------------------------
  findById(id) {
    return new Promise((resolve, reject) => {

      db.get(
        `SELECT * FROM documents WHERE id = ?`,
        [id],
        (err, row) => {

          if (err) return reject(err);

          if (!row) return resolve(null);

          const document = {
            ...row,
            status: getDocumentStatus(row.expiration_date)
          };

          resolve(document);

        }
      );

    });
  },

  // -----------------------------
  // Atualizar documento (parcial)
  // -----------------------------
  update(id, data) {
    return new Promise((resolve, reject) => {
      const allowed = [
        'name',
        'type',
        'expiration_date',
        'owner_type',
        'owner_id',
        'file_path',
        'notes',
        'is_active'
      ];

      const entries = Object.entries(data).filter(
        ([key, val]) => allowed.includes(key) && val !== undefined
      );

      if (!entries.length) return resolve(0);

      const fields = entries.map(([key]) => `${key} = ?`).join(', ');
      const values = entries.map(([, val]) => val);

      const query = `UPDATE documents SET ${fields} WHERE id = ?`;

      db.run(query, [...values, id], function (err) {
        if (err) return reject(err);
        resolve(this.changes);
      });
    });
  },

  // -----------------------------
  // Deletar documento
  // -----------------------------
  delete(id) {
    return new Promise((resolve, reject) => {
      db.run(
        `DELETE FROM documents WHERE id = ?`,
        [id],
        function (err) {
          if (err) return reject(err);
          resolve(this.changes);
        }
      );
    });
  }
};
