// backend/src/docs/reportsSwagger.js

module.exports = {
  // =============================
  // Reports
  // =============================

  '/reports/documents': {
    get: {
      tags: ['Reports'],
      summary: 'Riepilogo documenti',
      description:
        'Restituisce un riepilogo dei documenti dei membri: validi, in scadenza e scaduti (solo manager)',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'days',
          in: 'query',
          required: false,
          schema: { type: 'integer', default: 30 },
          description: 'Numero di giorni prima della scadenza',
        },
        {
          name: 'type',
          in: 'query',
          required: false,
          schema: {
            type: 'string',
            example: 'passport',
            description: 'passport | id_card | police_clearance | other',
          },
        },
      ],
      responses: {
        200: {
          description: 'Riepilogo documenti restituito',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    $ref: '#/components/schemas/DocumentsSummaryResponse',
                  },
                },
              },
            },
          },
        },
        403: {
          description: 'Accesso negato',
        },
      },
    },
  },

  '/reports/documents/detailed': {
    get: {
      tags: ['Reports'],
      summary: 'Dettaglio documenti',
      description:
        'Restituisce il dettaglio completo dei documenti dei membri (solo manager)',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'days',
          in: 'query',
          required: false,
          schema: { type: 'integer', default: 30 },
          description: 'Numero di giorni prima della scadenza',
        },
        {
          name: 'type',
          in: 'query',
          required: false,
          schema: {
            type: 'string',
            example: 'passport',
            description: 'passport | id_card | police_clearance | other',
          },
        },
      ],
      responses: {
        200: {
          description: 'Dettaglio documenti restituito',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'array',
                    items: {
                      $ref: '#/components/schemas/MemberDocumentResponse',
                    },
                  },
                },
              },
            },
          },
        },
        403: {
          description: 'Accesso negato',
        },
      },
    },
  },

  '/reports/documents/by-type': {
    get: {
      tags: ['Reports'],
      summary: 'Documenti per tipo',
      description:
        'Restituisce un riepilogo dei documenti raggruppati per tipo (solo manager)',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'days',
          in: 'query',
          required: false,
          schema: { type: 'integer', default: 30 },
          description: 'Numero di giorni prima della scadenza',
        },
        {
          name: 'type',
          in: 'query',
          required: false,
          schema: {
            type: 'string',
            example: 'passport',
            description: 'passport | id_card | police_clearance | other',
          },
        },
      ],
      responses: {
        200: {
          description: 'Riepilogo documenti per tipo restituito',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'object',
                    additionalProperties: {
                      type: 'integer',
                      example: 5,
                    },
                  },
                },
              },
            },
          },
        },
        403: {
          description: 'Accesso negato',
        },
      },
    },
  },

  // =============================
  // Reports - Member (self)
  // =============================

  '/reports/me/summary': {
    get: {
      tags: ['Reports'],
      summary: 'Riepilogo documenti del membro',
      description:
        'Restituisce il riepilogo dei documenti del membro autenticato',
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: 'Riepilogo documenti del membro',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    $ref: '#/components/schemas/DocumentsSummaryResponse',
                  },
                },
              },
            },
          },
        },
        401: { description: 'Non autenticato' },
      },
    },
  },

  '/reports/me/documents': {
    get: {
      tags: ['Reports'],
      summary: 'Documenti del membro',
      description:
        'Restituisce tutti i documenti del membro autenticato',
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: 'Lista documenti del membro',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'array',
                    items: {
                      $ref: '#/components/schemas/MemberDocumentResponse',
                    },
                  },
                },
              },
            },
          },
        },
        401: { description: 'Non autenticato' },
      },
    },
  },

  '/reports/me/contract': {
    get: {
      tags: ['Reports'],
      summary: 'Contratto del membro',
      description:
        'Restituisce le informazioni contrattuali del membro autenticato',
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: 'Dati contratto',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'object',
                    properties: {
                      startDate: { type: 'string', format: 'date', example: '2025-01-10' },
                      endDate: { type: 'string', format: 'date', example: '2025-06-30' },
                      status: {
                        type: 'string',
                        example: 'active',
                        description: 'active | expiring | expired',
                      },
                    },
                  },
                },
              },
            },
          },
        },
        401: { description: 'Non autenticato' },
      },
    },
  },

  // =============================
  // Reports - Membro loggato
  // =============================
  '/reports/me/summary': {
    get: {
      tags: ['Reports'],
      summary: 'Riepilogo documenti membro',
      description: 'Restituisce il riepilogo dei documenti del membro loggato',
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: 'Riepilogo restituito',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/MemberSummaryResponse' },
            },
          },
        },
        401: { description: 'Non autenticato' },
      },
    },
  },

  '/reports/me/documents': {
    get: {
      tags: ['Reports'],
      summary: 'Lista documenti membro',
      description: 'Restituisce tutti i documenti del membro loggato',
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: 'Lista documenti',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: { $ref: '#/components/schemas/MemberDocumentResponse' },
              },
            },
          },
        },
        401: { description: 'Non autenticato' },
      },
    },
  },

  '/reports/me/contract': {
    get: {
      tags: ['Reports'],
      summary: 'Contratto membro',
      description: 'Restituisce le informazioni sul contratto del membro loggato',
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: 'Dati contratto',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/MemberContractResponse' },
            },
          },
        },
        401: { description: 'Non autenticato' },
      },
    },
  },

};
