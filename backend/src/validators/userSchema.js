// backend/src/validators/userSchema.js

const { z } = require('zod');

const userCreateSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Nome obbligatorio'),
    email: z.string().email('Email non valida'),
    role: z.enum(['admin', 'manager', 'employee', 'member'], 'Role non valida'),
    status: z.enum(['active', 'inactive']).optional()
  })
});

const userUpdateSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    email: z.string().email().optional()
  })
});

module.exports = {
  userCreateSchema,
  userUpdateSchema
};

