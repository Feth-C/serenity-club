// backend/src/validators/clientSchema.js

const { z } = require('zod');

const clientCreateSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Nome obrigatório'),
    email: z.string().email().optional(),
    phone: z.string().optional()
  })
});

const clientUpdateSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    email: z.string().email().optional(),
    phone: z.string().optional()
  })
});

module.exports = {
  clientCreateSchema,
  clientUpdateSchema
};
