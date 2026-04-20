// backend/src/controllers/TransactionController.js

const Transaction = require('../models/Transaction');
const Session = require('../models/Session');
const formatResponse = require('../utils/responseFormatter');
const AppError = require('../errors/AppError');

module.exports = {

  // -----------------------------
  // Criar nova transação
  // -----------------------------
  async create(req, res) {
    const { userId, activeUnitId } = req;
    const {
      payer_type,
      member_id,
      client_id,
      custom_payer_name,
      type,
      category,
      amount,
      currency,
      date,
      description
    } = req.body;

    if (!activeUnitId)
      throw new AppError('Unità attiva non definita.', 400);

    const transaction = await Transaction.create({
      payer_type,
      member_id: member_id ?? null,
      client_id: client_id ?? null,
      custom_payer_name: payer_type === 'ad-hoc' ? custom_payer_name ?? null : null,
      unit_id: activeUnitId,
      type,
      category,
      amount,
      currency,
      date,
      description,
      created_by: userId
    });

    res.status(201).json(formatResponse(transaction, 'Transazione creata con successo.'));
  },

  // -----------------------------
  // Criar transação a partir da sessão
  // -----------------------------
  async createFromSession(req, res) {
    const { userId, activeUnitId } = req;
    const { session_id, amount, type, category, currency, date, description } = req.body;

    if (!activeUnitId)
      throw new AppError('Unità attiva non definita.', 400);

    const session = await Session.findById(session_id);
    if (!session) throw new AppError('Sessione non trovata.', 404);

    const payer_type = session.client_id ? 'client' : (session.member_id ? 'member' : 'ad-hoc');
    const member_id = session.member_id ?? null;
    const client_id = session.client_id ?? null;
    const custom_payer_name = (!session.member_id && !session.client_id && session.client_name) ? session.client_name : null;

    const transaction = await Transaction.create({
      payer_type,
      member_id,
      client_id,
      custom_payer_name,
      unit_id: activeUnitId,
      type,
      category,
      amount,
      currency,
      date,
      description,
      created_by: userId
    });

    res.status(201).json(formatResponse(transaction, 'Transazione creata con successo dalla sessione.'));
  },

  // -----------------------------
  // Listar transações (PAGINADO + FILTROS)
  // -----------------------------
  async findAll(req, res) {
    const { userRole, userId, activeUnitId } = req;
    if (!activeUnitId) throw new AppError('Unità attiva non definita.', 400);

    const page = Number(req.query.page) || 1;
    const perPage = Number(req.query.limit) || 10;

    const filters = {
      type: req.query.type,
      category: req.query.category,
      currency: req.query.currency,
      payer_name: req.query.payer_name,
      member_id: req.query.member_id,
      start_date: req.query.start_date,
      end_date: req.query.end_date
    };

    let result;
    if (userRole === 'admin') {
      result = await Transaction.findAllByUnit(activeUnitId, { page, perPage, ...filters });
    } else if (userRole === 'manager') {
      result = await Transaction.findByManagerAndUnit(userId, activeUnitId, { page, perPage, ...filters });
    } else {
      throw new AppError('Accesso negato.', 403);
    }

    res.json({
      success: true,
      data: result
    });
  },

  // -----------------------------
  // Buscar transação por ID
  // -----------------------------
  async findById(req, res) {
    const { id } = req.params;
    const { userRole, userId, activeUnitId } = req;
    if (!activeUnitId) throw new AppError('Unità attiva non definita.', 400);

    const transaction = await Transaction.findByIdAndUnit(Number(id), activeUnitId);
    if (!transaction) throw new AppError('Transazione non trovata.', 404);

    if (userRole === 'manager') {
      const list = await Transaction.findByManagerAndUnit(userId, activeUnitId, { page: 1, perPage: 1000 });
      if (!list.items?.some(t => t.id === transaction.id))
        throw new AppError('Accesso negato.', 403);
    }

    res.json(formatResponse(transaction));
  },

  // -----------------------------
  // Atualizar transação
  // -----------------------------
  async update(req, res) {
    const { id } = req.params;
    const { userRole, userId, activeUnitId } = req;

    const {
      payer_type,
      member_id,
      client_id,
      custom_payer_name,
      type,
      category,
      amount,
      currency,
      date,
      description
    } = req.body;

    if (!activeUnitId) throw new AppError('Unità attiva non definita.', 400);

    const transaction = await Transaction.findByIdAndUnit(Number(id), activeUnitId);
    if (!transaction) throw new AppError('Transazione non trovata.', 404);

    if (userRole === 'manager') {
      const list = await Transaction.findByManagerAndUnit(userId, activeUnitId, { page: 1, perPage: 1000 });
      if (!list.items?.some(t => t.id === transaction.id))
        throw new AppError('Accesso negato.', 403);
    }

    await Transaction.update(Number(id), {
      payer_type,
      member_id: member_id ?? null,
      client_id: client_id ?? null,
      custom_payer_name: payer_type === 'ad-hoc' ? custom_payer_name ?? null : null,
      type,
      category,
      amount,
      currency,
      date,
      description
    });

    res.json(formatResponse(null, 'Transazione aggiornata con successo.'));
  },

  // -----------------------------
  // Deletar transação
  // -----------------------------
  async delete(req, res) {
    const { id } = req.params;
    const { userRole, userId, activeUnitId } = req;
    if (!activeUnitId) throw new AppError('Unità attiva non definita.', 400);

    const transaction = await Transaction.findByIdAndUnit(Number(id), activeUnitId);
    if (!transaction) throw new AppError('Transazione non trovata.', 404);

    if (userRole === 'manager') {
      const list = await Transaction.findByManagerAndUnit(userId, activeUnitId, { page: 1, perPage: 1000 });
      if (!list.items?.some(t => t.id === transaction.id))
        throw new AppError('Accesso negato.', 403);
    }

    await Transaction.delete(Number(id));

    res.json(formatResponse(null, 'Transazione eliminata con successo.'));
  }
};