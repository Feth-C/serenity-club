// backend/src/controllers/TransactionController.js

const Transaction = require('../models/Transaction');
const formatResponse = require('../utils/responseFormatter');
const AppError = require('../errors/AppError');

module.exports = {

  // -----------------------------
  // Criar nova transação
  // -----------------------------
  async create(req, res) {
    const { userId, activeUnitId } = req;
    const { member_id, type, category, amount, currency, date, description } = req.body;

    if (!activeUnitId) {
      throw new AppError('Unità attiva non definita.', 400);
    }

    const transaction = await Transaction.create({
      member_id,
      unit_id: activeUnitId,
      type,
      category,
      amount,
      currency,
      date,
      description,
      created_by: userId
    });

    res.status(201).json(
      formatResponse(transaction, 'Transazione creata con successo.')
    );
  },

  // -----------------------------
  // Listar transações
  // -----------------------------
  async findAll(req, res) {
    const { userRole, userId, activeUnitId } = req;

    if (!activeUnitId) {
      throw new AppError('Unità attiva non definita.', 400);
    }

    let transactions = [];

    if (userRole === 'admin') {
      transactions = await Transaction.findAllByUnit(activeUnitId);

    } else if (userRole === 'manager') {
      transactions = await Transaction.findByManagerAndUnit(
        userId,
        activeUnitId
      );

    } else {
      throw new AppError('Accesso negato.', 403);
    }

    res.json(formatResponse(transactions));
  },

  // -----------------------------
  // Buscar transação por ID
  // -----------------------------
  async findById(req, res) {
    const { id } = req.params;
    const { userRole, userId, activeUnitId } = req;

    if (!activeUnitId) {
      throw new AppError('Unità attiva non definita.', 400);
    }

    const transaction = await Transaction.findByIdAndUnit(
      Number(id),
      activeUnitId
    );

    if (!transaction) {
      throw new AppError('Transazione non trovata.', 404);
    }

    // Manager só pode acessar transações dos próprios membros
    if (userRole === 'manager') {
      const list = await Transaction.findByManagerAndUnit(
        userId,
        activeUnitId
      );

      const allowed = list.some(t => t.id === transaction.id);
      if (!allowed) {
        throw new AppError('Accesso negato.', 403);
      }
    }

    res.json(formatResponse(transaction));
  },

  // -----------------------------
  // Atualizar transação
  // -----------------------------
  async update(req, res) {
    const { id } = req.params;
    const { userRole, userId, activeUnitId } = req;
    const { type, category, amount, currency, date, description } = req.body;

    if (!activeUnitId) {
      throw new AppError('Unità attiva non definita.', 400);
    }

    const transaction = await Transaction.findByIdAndUnit(
      Number(id),
      activeUnitId
    );

    if (!transaction) {
      throw new AppError('Transazione non trovata.', 404);
    }

    if (userRole === 'manager') {
      const list = await Transaction.findByManagerAndUnit(
        userId,
        activeUnitId
      );

      const allowed = list.some(t => t.id === transaction.id);
      if (!allowed) {
        throw new AppError('Accesso negato.', 403);
      }
    }

    await Transaction.update(Number(id), {
      type,
      category,
      amount,
      currency,
      date,
      description
    });

    res.json(
      formatResponse(null, 'Transazione aggiornata con successo.')
    );
  },

  // -----------------------------
  // Deletar transação
  // -----------------------------
  async delete(req, res) {
    const { id } = req.params;
    const { userRole, userId, activeUnitId } = req;

    if (!activeUnitId) {
      throw new AppError('Unità attiva non definita.', 400);
    }

    const transaction = await Transaction.findByIdAndUnit(
      Number(id),
      activeUnitId
    );

    if (!transaction) {
      throw new AppError('Transazione non trovata.', 404);
    }

    if (userRole === 'manager') {
      const list = await Transaction.findByManagerAndUnit(
        userId,
        activeUnitId
      );

      const allowed = list.some(t => t.id === transaction.id);
      if (!allowed) {
        throw new AppError('Accesso negato.', 403);
      }
    }

    await Transaction.delete(Number(id));

    res.json(
      formatResponse(null, 'Transazione eliminata con successo.')
    );
  }
};
