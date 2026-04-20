// backend/src/validators/memberSchema.js

const { z } = require('zod');

const memberCreateSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Nome obbligatorio'),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    passport_number: z.string().optional(),
    passport_expiration: z.string().optional(),
    police_clearance_expiration: z.string().optional(),
    notes: z.string().optional(),
    createUserAccount: z.boolean().optional(),
  })
});

const memberUpdateSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    passport_number: z.string().optional(),
    passport_expiration: z.string().optional(),
    police_clearance_expiration: z.string().optional(),
    notes: z.string().optional(),
    createUserAccount: z.boolean().optional(),
  })
});

module.exports = {
  memberCreateSchema,
  memberUpdateSchema,
};
