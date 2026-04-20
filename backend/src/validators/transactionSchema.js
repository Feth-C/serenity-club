// backend/src/validators/transactionSchema.js

const { z } = require('zod');

// -----------------------------
// CRIAR TRANSAÇÃO
// -----------------------------
const transactionCreateSchema = z.object({
  body: z.object({
    payer_type: z.enum(['member', 'client', 'ad-hoc']),
    payer_id: z.number().int().nullable().optional(),
    member_id: z.number().int().nullable().optional(),
    client_id: z.number().int().nullable().optional(),
    custom_payer_name: z.string().nullable().optional(),
    type: z.enum(['income', 'expense']),
    category: z.string().optional(),
    amount: z.number().positive(),
    currency: z.enum(['EUR', 'CHF']).default('EUR'),
    date: z.string(),
    description: z.string().optional(),
    //unit_id: z.number().int() // obrigatório
  }).refine((data) => {
    if (data.payer_type === 'member') return !!data.member_id;
    if (data.payer_type === 'client') return !!data.client_id;
    if (data.payer_type === 'ad-hoc') return !!data.custom_payer_name;
    return false;
  }, {
    message: "Pagador inválido para o tipo selecionado",
    path: ['payer_type']
  })
});

// -----------------------------
// ATUALIZAR TRANSAÇÃO
// -----------------------------
const transactionUpdateSchema = z.object({
  body: z.object({
    payer_type: z.enum(['member', 'client', 'ad-hoc']).optional(),
    payer_id: z.number().int().nullable().optional(),
    member_id: z.number().int().nullable().optional(),
    client_id: z.number().int().nullable().optional(),
    custom_payer_name: z.string().nullable().optional(),
    type: z.enum(['income', 'expense']).optional(),
    category: z.string().optional(),
    amount: z.number().positive().optional(),
    currency: z.enum(['EUR', 'CHF']).optional(),
    date: z.string().optional(),
    description: z.string().optional()
  }).refine((data) => {
    if (data.payer_type === 'member') return data.member_id !== null && data.member_id !== undefined;
    if (data.payer_type === 'client') return data.client_id !== null && data.client_id !== undefined;
    if (data.payer_type === 'ad-hoc') return !!data.custom_payer_name;
    return true;
  }, {
    message: "Pagador inválido para o tipo selecionado",
    path: ['payer_type']
  })
});

module.exports = {
  transactionCreateSchema,
  transactionUpdateSchema
};
