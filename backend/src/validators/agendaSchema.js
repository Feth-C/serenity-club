// backend/src/validators/agendaSchema.js

const { z } = require('zod');

const agendaCreateSchema = z.object({
  body: z.object({
    clientId: z.number().int('ID do cliente inválido'),
    startTime: z.string().min(1, 'Data/hora de início obrigatória'),
    endTime: z.string().min(1, 'Data/hora de fim obrigatória'),
    notes: z.string().optional()
  })
});

const agendaUpdateSchema = z.object({
  body: z.object({
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    status: z.enum(['scheduled','checked_in','checked_out','canceled']).optional(),
    notes: z.string().optional()
  })
});

module.exports = {
  agendaCreateSchema,
  agendaUpdateSchema
};
