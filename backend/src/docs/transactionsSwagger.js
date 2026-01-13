// backend/src/docs/transactionsSwagger.js

module.exports = {
    '/transactions': {
        get: {
            tags: ['Transactions'],
            summary: 'Lista transazioni',
            description: 'Restituisce la lista di tutte le transazioni (solo admin/manager)',
            security: [{ bearerAuth: [] }],
            responses: {
                200: {
                    description: 'Lista transazioni',
                    content: {
                        'application/json': { schema: { $ref: '#/components/schemas/TransactionListResponse' } },
                    },
                },
                403: { description: 'Accesso negato' },
            },
        },
        post: {
            tags: ['Transactions'],
            summary: 'Crea transazione',
            description: 'Crea una nuova transazione (solo admin/manager)',
            security: [{ bearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    'application/json': { schema: { $ref: '#/components/schemas/TransactionCreateRequest' } },
                },
            },
            responses: {
                201: {
                    description: 'Transazione creata con successo',
                    content: {
                        'application/json': { schema: { $ref: '#/components/schemas/TransactionFullResponse' } },
                    },
                },
                400: { description: 'Dati non validi' },
                403: { description: 'Accesso negato' },
            },
        },
    },

    '/transactions/{id}': {
        get: {
            tags: ['Transactions'],
            summary: 'Dettaglio transazione',
            description: 'Restituisce i dettagli di una transazione specifica',
            security: [{ bearerAuth: [] }],
            parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
            responses: {
                200: { description: 'Transazione trovata', content: { 'application/json': { schema: { $ref: '#/components/schemas/TransactionFullResponse' } } } },
                404: { description: 'Transazione non trovata' },
            },
        },
        put: {
            tags: ['Transactions'],
            summary: 'Aggiorna transazione',
            description: 'Aggiorna i dati di una transazione (solo admin/manager)',
            security: [{ bearerAuth: [] }],
            parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
            requestBody: {
                required: true,
                content: { 'application/json': { schema: { $ref: '#/components/schemas/TransactionUpdateRequest' } } },
            },
            responses: {
                200: { description: 'Transazione aggiornata', content: { 'application/json': { schema: { $ref: '#/components/schemas/TransactionFullResponse' } } } },
                404: { description: 'Transazione non trovata' },
            },
        },
        delete: {
            tags: ['Transactions'],
            summary: 'Elimina transazione',
            description: 'Elimina una transazione (solo admin/manager)',
            security: [{ bearerAuth: [] }],
            parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
            responses: {
                200: {
                    description: 'Transazione eliminata',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: { type: 'boolean', example: true },
                                    message: { type: 'string', example: 'Transação eliminada com sucesso.' },
                                },
                            },
                        },
                    },
                },
                404: { description: 'Transazione non trovata' },
            },
        },
    },
};

