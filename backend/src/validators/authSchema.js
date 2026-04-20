// backend/src/validators/authSchema.js

const { z } = require('zod');

// -----------------------------
// REGISTER
// -----------------------------
const authRegisterSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Nome obbligatorio'),
    email: z.string().email('Email non valida'),
    password: z.string().min(6, 'Password deve avere almeno 6 caratteri'),
    role: z.enum(['admin','manager', 'member', 'employee']).optional(),

  }),
});

// -----------------------------
// LOGIN
// -----------------------------
const authLoginSchema = z.object({
  body: z.object({
    email: z.string().email('Email non valida'),
    password: z.string().min(1, 'Password obbligatoria'),
  }),
});

module.exports = {
  authRegisterSchema,
  authLoginSchema,
};
