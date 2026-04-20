// backend/src/validators/reportSchema.js

const { z } = require('zod');

const dateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de data deve ser YYYY-MM-DD');

const exportFormat = z
  .string()
  .optional()
  .refine(val => !val || ['pdf', 'csv'].includes(val), 'Formato deve ser pdf ou csv');

const reportSchema = z.object({
  query: z.object({
    startDate: dateString,
    endDate: dateString,
    exportFormat: exportFormat
  })
});

module.exports = reportSchema;
