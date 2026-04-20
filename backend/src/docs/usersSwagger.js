// backend/src/docs/usersSwagger.js

module.exports = {
  // =============================
  // Users (solo admin / manager)
  // =============================

  '/users': {
    get: {
      tags: ['Users'],
      summary: 'Lista utenti',
      description: 'Restituisce la lista di tutti gli utenti (solo admin/manager)',
      security: [{ bearerAuth: [] }],
      responses: {
        200: { description: 'Lista utenti' },
        401: { description: 'Token non fornito' },
        403: { description: 'Accesso negato' },
      },
    },
  },

  '/users/{id}': {
    get: {
      tags: ['Users'],
      summary: 'Dettaglio utente',
      description: 'Restituisce i dati di un utente specifico',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'integer' },
        },
      ],
      responses: {
        200: { description: 'Utente trovato' },
        404: { description: 'Utente non trovato' },
      },
    },

    put: {
      tags: ['Users'],
      summary: 'Aggiorna utente',
      description: 'Aggiorna i dati di un utente (solo admin)',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'integer' },
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                name: { type: 'string', example: 'Mario Rossi' },
                email: { type: 'string', example: 'mario@club.com' },
                role: { type: 'string', example: 'manager' },
                status: { type: 'string', example: 'active' },
              },
            },
          },
        },
      },
      responses: {
        200: { description: 'Utente aggiornato' },
        403: { description: 'Accesso negato' },
      },
    },

    delete: {
      tags: ['Users'],
      summary: 'Elimina utente',
      description: 'Elimina un utente (solo admin)',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'integer' },
        },
      ],
      responses: {
        200: { description: 'Utente eliminato' },
        403: { description: 'Accesso negato' },
      },
    },
  },
};
