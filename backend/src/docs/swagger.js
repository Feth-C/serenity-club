const swaggerJSDoc = require('swagger-jsdoc');

// =============================
// Importar módulos de rotas/documentação
// =============================
const authSwagger = require('./authSwagger');
const usersSwagger = require('./usersSwagger');
const membersSwagger = require('./membersSwagger');
const employeesSwagger = require('./employeesSwagger');
const memberDocumentsSwagger = require('./memberDocumentsSwagger');
const reportsSwagger = require('./reportsSwagger');
const transactionsSwagger = require('./transactionsSwagger');

// =============================
// Components reutilizáveis
// =============================
const components = {
  securitySchemes: {
    bearerAuth: {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
    },
  },
  schemas: {
    // =============================
    // Base / Errors
    // =============================
    ErrorResponse: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        message: { type: 'string', example: 'Invalid credentials' },
      },
    },

    // =============================
    // Auth
    // =============================
    LoginRequest: {
      type: 'object',
      required: ['email', 'password'],
      properties: {
        email: { type: 'string', example: 'admin@club.com' },
        password: { type: 'string', example: 'Admin@123' },
      },
    },
    RegisterRequest: {
      type: 'object',
      required: ['name', 'email', 'password'],
      properties: {
        name: { type: 'string', example: 'Admin Club' },
        email: { type: 'string', example: 'admin@club.com' },
        password: { type: 'string', example: 'Admin@123' },
        role: { type: 'string', example: 'manager' },
      },
    },
    AuthResponse: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
            user: {
              type: 'object',
              properties: {
                id: { type: 'integer', example: 1 },
                role: { type: 'string', example: 'manager' },
              },
            },
          },
        },
      },
    },

    // =============================
    // Users
    // =============================
    UserResponse: {
      type: 'object',
      properties: {
        id: { type: 'integer', example: 1 },
        name: { type: 'string', example: 'Admin Club' },
        email: { type: 'string', example: 'admin@club.com' },
        role: { type: 'string', example: 'manager' },
        created_at: { type: 'string', example: '2025-12-17 10:00:00' },
      },
    },
    UserListResponse: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: { type: 'array', items: { $ref: '#/components/schemas/UserResponse' } },
      },
    },

    // =============================
    // Employees
    // =============================
    EmployeeCreateRequest: {
      type: 'object',
      required: ['name'],
      properties: {
        name: { type: 'string', example: 'Mario Rossi' },
        email: { type: 'string', example: 'mario@club.com' },
        phone: { type: 'string', example: '+39 333 1234567' },
        role: { type: 'string', example: 'employee' },
        createUserAccount: { type: 'boolean', example: true },
      },
    },
    EmployeeResponse: {
      type: 'object',
      properties: {
        id: { type: 'integer', example: 1 },
        name: { type: 'string', example: 'Mario Rossi' },
        email: { type: 'string', example: 'mario@club.com' },
        phone: { type: 'string', example: '+39 333 1234567' },
        role: { type: 'string', example: 'employee' },
        login_enabled: { type: 'boolean', example: false },
        created_at: { type: 'string', example: '2025-12-17 12:00:00' },
      },
    },

    // =============================
    // Members
    // =============================
    MemberCreateRequest: {
      type: 'object',
      required: ['name'],
      properties: {
        name: { type: 'string', example: 'John Doe' },
        email: { type: 'string', example: 'johndoe@example.com' },
        phone: { type: 'string', example: '+39 333 1234567' },
        passport_number: { type: 'string', example: 'AB1234567' },
        passport_expiration: { type: 'string', format: 'date', example: '2027-06-30' },
        police_clearance_expiration: { type: 'string', format: 'date', example: '2026-12-31' },
        notes: { type: 'string', example: 'Member VIP' },
        createUserAccount: { type: 'boolean', example: true },
      },
    },
    MemberResponse: {
      type: 'object',
      properties: {
        id: { type: 'integer', example: 1 },
        name: { type: 'string', example: 'John Doe' },
        email: { type: 'string', example: 'johndoe@example.com' },
        phone: { type: 'string', example: '+39 333 1234567' },
        passport_number: { type: 'string', example: 'AB1234567' },
        passport_expiration: { type: 'string', example: '2027-06-30' },
        police_clearance_expiration: { type: 'string', example: '2026-12-31' },
        notes: { type: 'string', example: 'Member VIP' },
        login_enabled: { type: 'boolean', example: false },
        created_at: { type: 'string', example: '2025-12-17 18:52:00' },
      },
    },

    // =============================
    // Transactions
    // =============================
    TransactionCreateRequest: {
      type: 'object',
      required: ['type', 'amount', 'date'],
      properties: {
        member_id: { type: 'integer', example: 1 },
        type: { type: 'string', example: 'income', description: 'income | expense' },
        category: { type: 'string', example: 'membership' },
        amount: { type: 'number', example: 150.5 },
        date: { type: 'string', format: 'date', example: '2026-01-04' },
        description: { type: 'string', example: 'Quota mensile' },
      },
    },

    TransactionUpdateRequest: {
      type: 'object',
      properties: {
        member_id: { type: 'integer', example: 1 },
        type: { type: 'string', example: 'expense', description: 'income | expense' },
        category: { type: 'string', example: 'purchase' },
        amount: { type: 'number', example: 50 },
        date: { type: 'string', format: 'date', example: '2026-01-04' },
        description: { type: 'string', example: 'Acquisto materiali' },
      },
    },

    TransactionResponse: {
      type: 'object',
      properties: {
        id: { type: 'integer', example: 1 },
        member_id: { type: 'integer', example: 1 },
        member_name: { type: 'string', example: 'John Doe' },
        type: { type: 'string', example: 'income' },
        category: { type: 'string', example: 'membership' },
        amount: { type: 'number', example: 150.5 },
        date: { type: 'string', format: 'date', example: '2026-01-04' },
        description: { type: 'string', example: 'Quota mensile' },
        created_by: { type: 'integer', example: 1 },
        created_by_name: { type: 'string', example: 'Admin Club' },
        created_at: { type: 'string', format: 'date-time', example: '2026-01-04 20:00:00' },
      },
    },

    TransactionFullResponse: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: { $ref: '#/components/schemas/TransactionResponse' },
        message: { type: 'string', example: 'Transação criada com sucesso.' },
      },
    },

    TransactionListResponse: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: { type: 'array', items: { $ref: '#/components/schemas/TransactionResponse' } },
        total: { type: 'integer', example: 3 },
      },
    },
  },
};

// =============================
// Merge Paths de todos os módulos
// =============================
const paths = {
  ...authSwagger,
  ...usersSwagger,
  ...membersSwagger,
  ...employeesSwagger,
  ...memberDocumentsSwagger,
  ...reportsSwagger,
  ...transactionsSwagger,
};

// =============================
// Options Swagger
// =============================
const options = {
  definition: {
    openapi: '3.0.0',
    info: { title: 'Serenity Club API', version: '1.0.0', description: 'API backend del sistema Serenity Club' },
    servers: [{ url: 'http://localhost:3000/api', description: 'Server locale' }],
    components,
    paths,
  },
  apis: [], // sem necessidade de apontar arquivos externos
};

// =============================
// Export
// =============================
module.exports = swaggerJSDoc(options);
