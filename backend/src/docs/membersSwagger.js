// backend/src/docs/membersSwagger.js

module.exports = {
  // =============================
  // Members
  // =============================

  '/members': {
    get: {
      tags: ['Members'],
      summary: 'Lista membri',
      security: [{ bearerAuth: [] }],
      responses: {
        200: { description: 'Lista membri' },
        401: { description: 'Token non fornito' },
        403: { description: 'Accesso negato' }
      }
    },

    post: {
      tags: ['Members'],
      summary: 'Crea membro',
      description: 'Crea un nuovo membro (solo manager o admin)',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['name'],
              properties: {
                name: { type: 'string', example: 'John Doe' },
                email: { type: 'string', example: 'john@example.com' },
                phone: { type: 'string', example: '+39 333 1234567' },
                passport_number: { type: 'string', example: 'AB1234567' },
                passport_expiration: { type: 'string', format: 'date', example: '2027-06-30' },
                police_clearance_expiration: { type: 'string', format: 'date', example: '2026-12-31' },
                notes: { type: 'string', example: 'Membro VIP' },
                createUserAccount: { type: 'boolean', example: true },
              },
            },
          },
        },
      },
      responses: {
        201: { description: 'Membro creato con successo' },
        403: { description: 'Accesso negato' },
      },
    },
  },

  '/members/{id}': {
    get: {
      tags: ['Members'],
      summary: 'Dettaglio membro',
      description: 'Restituisce i dati di un membro (manager, admin o membro stesso)',
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
        200: { description: 'Membro trovato' },
        404: { description: 'Membro non trovato' },
        403: { description: 'Accesso negato' },
      },
    },

    put: {
      tags: ['Members'],
      summary: 'Aggiorna membro',
      description: 'Aggiorna i dati di un membro (solo manager o admin)',
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                email: { type: 'string' },
                phone: { type: 'string' },
                notes: { type: 'string' },
                login_enabled: { type: 'boolean', example: true },
              },
            },
          },
        },
      },
      responses: {
        200: { description: 'Membro aggiornato con successo' },
        403: { description: 'Accesso negato' },
        404: { description: 'Membro non trovato' },
      },
    },

    delete: {
      tags: ['Members'],
      summary: 'Elimina membro',
      description: 'Elimina un membro (solo manager o admin)',
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
      ],
      responses: {
        200: { description: 'Membro eliminato con successo' },
        403: { description: 'Accesso negato' },
        404: { description: 'Membro non trovato' },
      },
    },
  },

  '/members/me': {
    get: {
      tags: ['Members'],
      summary: 'Dati utente loggato',
      description: 'Restituisce i dati del membro loggato',
      security: [{ bearerAuth: [] }],
      responses: {
        200: { description: 'Membro trovato' },
        403: { description: 'Accesso negato' },
        404: { description: 'Membro non trovato' },
      },
    },
  },

  '/members/{id}/enable-login': {
    post: {
      tags: ['Members'],
      summary: 'Abilita login membro',
      description:
        'Crea un account utente per il membro e abilita il login (solo manager o admin)',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'integer' },
          description: 'ID del membro da abilitare',
        },
      ],
      responses: {
        200: {
          description: 'Login abilitato con successo',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: { $ref: '#/components/schemas/MemberResponse' },
                  message: { type: 'string', example: 'Login abilitato con successo.' },
                },
              },
            },
          },
        },
        400: { description: 'Account già esistente o errore di validazione' },
        404: { description: 'Membro non trovato' },
      },
    },
  },
};
