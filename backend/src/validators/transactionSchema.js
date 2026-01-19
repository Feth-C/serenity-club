// backend/src/validators/transactionSchema.js

const { z } = require('zod');

// -----------------------------
// CRIAR TRANSAÇÃO
// -----------------------------
const transactionCreateSchema = z.object({
    body: z.object({
        member_id: z.coerce.number().int().optional(),
        unit_id: z.coerce.number().int({ invalid_type_error: 'unit_id inválido' }),
        type: z.enum(['income', 'expense'], { message: 'Tipo inválido' }),
        category: z.string().optional(),
        amount: z.coerce.number().positive('Valor deve ser maior que 0'),
        currency: z.enum(['EUR', 'CHF']).default('EUR'),
        date: z.string().min(1, 'Data obrigatória'),
        description: z.string().optional()
    })
});

// -----------------------------
// ATUALIZAR TRANSAÇÃO
// -----------------------------
const transactionUpdateSchema = z.object({
    body: z.object({
        member_id: z.coerce.number().int().optional(),
        unit_id: z.coerce.number().int().optional(),
        type: z.enum(['income', 'expense']).optional(),
        category: z.string().optional(),
        amount: z.coerce.number().positive().optional(),
        currency: z.enum(['EUR', 'CHF']).default('EUR'),
        date: z.string().optional(),
        description: z.string().optional()
    })
});

module.exports = {
    transactionCreateSchema,
    transactionUpdateSchema
};
