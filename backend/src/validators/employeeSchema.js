// backend/src/validators/employeeSchema.js

const { z } = require('zod');

const employeeCreateSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Nome obbligatorio'),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    role: z.string().optional(),
    createUserAccount: z.boolean().optional()
  })
});

const employeeUpdateSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    role: z.string().optional()
  })
});

module.exports = {
  employeeCreateSchema,
  employeeUpdateSchema
};
