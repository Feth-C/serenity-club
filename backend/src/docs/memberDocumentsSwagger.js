// backend/src/docs/memberDocumentsSwagger.js

module.exports = {
  // =============================
  // Documenti generali (scadenze)
  // GET /documents/expiring?days=30
  // Solo manager
  // =============================
  '/documents/expiring': {
    get: {
      tags: ['Documents'],
      summary: 'Documenti in scadenza',
      description: 'Restituisce la lista dei documenti prossimi alla scadenza (solo manager)',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'days',
          in: 'query',
          required: false,
          schema: { type: 'integer', default: 30 },
          description: 'Numero di giorni prima della scadenza',
        },
      ],
      responses: {
        200: { description: 'Lista documenti in scadenza' },
        403: { description: 'Accesso negato' },
      },
    },
  },

  // =============================
  // Member Documents (CRUD)
  // =============================
  '/members/{memberId}/documents': {
    post: {
      tags: ['Member Documents'],
      summary: 'Carica documento membro',
      description: 'Carica un documento per un membro (solo manager)',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'memberId',
          in: 'path',
          required: true,
          schema: { type: 'integer' },
        },
      ],
      requestBody: {
        required: true,
        content: {
          'multipart/form-data': {
            schema: {
              type: 'object',
              required: ['file', 'type'],
              properties: {
                file: { type: 'string', format: 'binary' },
                type: {
                  type: 'string',
                  example: 'passport',
                  description: 'passport | id_card | police_clearance | other',
                },
                expiration_date: { type: 'string', format: 'date', example: '2027-06-30' },
                notes: { type: 'string', example: 'Documento aggiornato' },
              },
            },
          },
        },
      },
      responses: {
        201: { description: 'Documento caricato con successo' },
        403: { description: 'Accesso negato' },
      },
    },

    get: {
      tags: ['Member Documents'],
      summary: 'Lista documenti membro',
      description: 'Restituisce tutti i documenti di un membro',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'memberId',
          in: 'path',
          required: true,
          schema: { type: 'integer' },
        },
      ],
      responses: {
        200: { description: 'Lista documenti' },
      },
    },
  },

  '/members/{memberId}/documents/{id}': {
    get: {
      tags: ['Member Documents'],
      summary: 'Dettaglio documento',
      description: 'Restituisce un documento specifico di un membro',
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'memberId', in: 'path', required: true, schema: { type: 'integer' } },
        { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
      ],
      responses: {
        200: { description: 'Documento trovato' },
        404: { description: 'Documento non trovato' },
      },
    },

    put: {
      tags: ['Member Documents'],
      summary: 'Aggiorna documento',
      description: 'Aggiorna i metadati di un documento (solo manager)',
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'memberId', in: 'path', required: true, schema: { type: 'integer' } },
        { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                expiration_date: { type: 'string', format: 'date', example: '2028-01-01' },
                notes: { type: 'string', example: 'Documento rinnovato' },
              },
            },
          },
        },
      },
      responses: {
        200: { description: 'Documento aggiornato' },
      },
    },

    delete: {
      tags: ['Member Documents'],
      summary: 'Elimina documento',
      description: 'Elimina un documento (solo manager)',
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'memberId', in: 'path', required: true, schema: { type: 'integer' } },
        { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
      ],
      responses: {
        200: { description: 'Documento eliminato' },
      },
    },
  },

  '/members/{memberId}/documents/{id}/download': {
    get: {
      tags: ['Member Documents'],
      summary: 'Download documento',
      description: 'Scarica il file del documento',
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'memberId', in: 'path', required: true, schema: { type: 'integer' } },
        { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
      ],
      responses: {
        200: {
          description: 'File del documento',
          content: { 'application/octet-stream': {} },
        },
      },
    },
  },
};
