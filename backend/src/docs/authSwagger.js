// backend/src/docs/authSwagger.js

module.exports = {

  // =============================
  // Auth
  // =============================

  '/auth/login': {
    post: {
      tags: ['Auth'],
      summary: 'Login utente',
      description: 'Autentica un utente e restituisce un token JWT',
      security: [],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['email', 'password'],
              properties: {
                email: { type: 'string', example: 'admin@club.com' },
                password: { type: 'string', example: 'Admin@123' },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Login effettuato con successo',
        },
        401: {
          description: 'Credenziali non valide',
        },
      },
    },
  },

  '/auth/register': {
    post: {
      tags: ['Auth'],
      summary: 'Registrazione nuovo utente',
      description: 'Crea un nuovo utente (default role: member)',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['name', 'email', 'password'],
              properties: {
                name: { type: 'string', example: 'Charles' },
                email: { type: 'string', example: 'charles@club.com' },
                password: { type: 'string', example: 'charles123' },
                role: { type: 'string', example: 'member' },
              },
            },
          },
        },
      },
      responses: {
        201: { description: 'Utente registrato con successo' },
        409: { description: 'Email già registrata' },
      },
    },
  },

  '/auth/me': {
    get: {
      tags: ['Auth'],
      summary: 'Dati utente autenticato',
      description: 'Restituisce i dati dell’utente loggato',
      security: [{ bearerAuth: [] }],
      responses: {
        200: { description: 'Utente autenticato' },
        401: { description: 'Token non fornito o non valido' }
      }
    }
  },

  '/auth/logout': {
    post: {
      tags: ['Auth'],
      summary: 'Logout',
      description:
        'Logout lato client. Il token JWT deve essere eliminato dal frontend.',
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: 'Logout completato (client-side)',
        },
      },
    },
  },

};
