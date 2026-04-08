// backend/src/validators/sessionSchema.js

const { z } = require('zod');

// -----------------------------
// CREATE SESSION
// -----------------------------
const sessionCreateSchema = z.object({
  body: z.object({
    member_id: z.number().nullable().optional(),
    client_name: z.string().min(1).optional().nullable(),
    contact: z.string().optional(),
    visit_type: z.enum(['first', 'return']).optional().default('first'),
    start_time: z.string().min(1, 'Orario iniziale obbligatorio'),
    planned_minutes: z.coerce
      .number({ invalid_type_error: 'Durata prevista deve essere un numero' })
      .int()
      .positive('Durata prevista deve essere maggiore di 0'),
    planned_amount: z.number().optional(),
    currency: z.string().optional().default('EUR'),
    notes: z.string().nullable().optional(),
  }),
});

// -----------------------------
// UPDATE SESSION
// -----------------------------
const sessionUpdateSchema = z.object({
  body: z.object({
    member_id: z.number().nullable().optional(),
    client_name: z.string().min(1).optional().nullable(),
    contact: z.string().optional(),
    visit_type: z.enum(['first', 'return']).optional(),
    start_time: z.string().optional(),
    planned_minutes: z.coerce
      .number({ invalid_type_error: 'Durata deve essere un numero' })
      .int()
      .positive('Durata deve essere maggiore di 0')
      .optional(),
    planned_amount: z.number().optional(),
    currency: z.string().optional(),
    notes: z.string().nullable().optional()
  }),
});

// -----------------------------
// CLOSE SESSION
// -----------------------------
const sessionCloseSchema = z.object({
  body: z.object({
    payer_type: z.enum(['client', 'member', 'ad-hoc']),
    payer_name: z.string().min(2),
    used_minutes: z.number().optional(),
    final_amount: z.number().optional(),
    paid_amount: z.number().optional(),
    currency: z.string().optional(),
    payment_method: z.enum(['cash', 'card', 'twint', 'transfer']).optional(),
    actual_end_time: z.string().optional(),
    notes: z.string().nullable().optional()
  }),
});

module.exports = {
  sessionCreateSchema,
  sessionUpdateSchema,
  sessionCloseSchema,
};