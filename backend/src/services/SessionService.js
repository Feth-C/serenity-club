// backend/src/services/SessionService.js

const Session = require('../models/Session');
const Transaction = require('../models/Transaction');
const AppError = require('../errors/AppError');

async function closeSession({ sessionId, unitId, userId, payload }) {

  const session = await Session.getById(sessionId);

  if (!session) throw new AppError('Sessione non trovata.', 404);
  if (session.unit_id !== unitId) throw new AppError('Accesso negato.', 403);
  if (session.status !== 'open') throw new AppError('Sessione già chiusa.', 400);

  await Session.close({
    id: sessionId,
    actualEndTime: payload.actualEndTime,
    finalAmount: payload.finalAmount,
    paidAmount: payload.paidAmount,
    paymentMethod: payload.paymentMethod,
    notes: payload.notes
  });

  const closedSession = await Session.getById(sessionId);

  // 🔹 CRIA TRANSAÇÃO AUTOMÁTICA CORRETA
  await Transaction.create({
    unit_id: unitId,
    payer_type: payload.payerType,
    custom_payer_name: payload.payerType === 'ad-hoc' ? payload.payerName : null,
    client_id: payload.payerType === 'client' ? closedSession.client_id : null,
    member_id: payload.payerType === 'member' ? null : null, // você pode mapear depois
    type: 'income',
    category: 'Chiusura della sessione',
    amount: closedSession.final_amount,
    currency: closedSession.currency || 'EUR',
    date: payload.actualEndTime,
    description: `Entrata generata dalla chiusura della sessione #${sessionId}`,
    created_by: userId
  });

  return closedSession;
}

module.exports = { closeSession };
