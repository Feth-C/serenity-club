// backend/src/docs/employeesSwagger.js

module.exports = {
  // =============================
  // Employees
  // =============================

  '/employees': {
    get: {
      tags: ['Employees'],
      summary: 'Lista dipendenti',
      description: 'Restituisce la lista di tutti i dipendenti (solo manager)',
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: 'Lista dipendenti',
        },
        403: {
          description: 'Accesso negato',
        },
      },
    },

    post: {
      tags: ['Employees'],
      summary: 'Crea dipendente',
      description: 'Crea un nuovo dipendente (solo manager)',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['name'],
              properties: {
                name: {
                  type: 'string',
                  example: 'Mario Rossi',
                },
                email: {
                  type: 'string',
                  example: 'mario@club.com',
                },
                phone: {
                  type: 'string',
                  example: '+39 333 1234567',
                },
                role: {
                  type: 'string',
                  example: 'employee',
                },
                createUserAccount: {
                  type: 'boolean',
                  example: true,
                  description:
                    'Se true, crea anche un account utente per il login',
                },
              },
            },
          },
        },
      },
      responses: {
        201: {
          description: 'Dipendente creato con successo',
        },
        400: {
          description: 'Dati non validi',
        },
        403: {
          description: 'Accesso negato',
        },
      },
    },
  },

  '/employees/{id}': {
    get: {
      tags: ['Employees'],
      summary: 'Dettaglio dipendente',
      description: 'Restituisce i dettagli di un dipendente (solo manager)',
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
        200: { description: 'Dipendente trovato' },
        404: { description: 'Dipendente non trovato' },
      },
    },

    put: {
      tags: ['Employees'],
      summary: 'Aggiorna dipendente',
      description: 'Aggiorna i dati di un dipendente (solo manager)',
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
                name: {
                  type: 'string',
                  example: 'Mario Rossi',
                },
                email: {
                  type: 'string',
                  example: 'mario.rossi@club.com',
                },
                phone: {
                  type: 'string',
                  example: '+39 333 999888',
                },
                role: {
                  type: 'string',
                  example: 'employee',
                },
              },
            },
          },
        },
      },
      responses: {
        200: { description: 'Dipendente aggiornato' },
        404: { description: 'Dipendente non trovato' },
      },
    },

    delete: {
      tags: ['Employees'],
      summary: 'Elimina dipendente',
      description: 'Elimina un dipendente (solo manager)',
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
        200: { description: 'Dipendente eliminato' },
        404: { description: 'Dipendente non trovato' },
      },
    },
  },

  '/employees/{id}/enable-login': {
    post: {
      tags: ['Employees'],
      summary: 'Abilita login dipendente',
      description:
        'Crea un account utente per il dipendente e abilita il login (solo manager)',
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
        200: {
          description: 'Login abilitato con successo',
        },
        400: {
          description: 'Account già esistente o errore di validazione',
        },
        404: {
          description: 'Dipendente non trovato',
        },
      },
    },
  },
};
