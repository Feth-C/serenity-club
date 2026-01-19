// backend/src/controllers/TransactionController.js

const Transaction = require('../models/Transaction');
const formatResponse = require('../utils/responseFormatter');
const AppError = require('../errors/AppError');

module.exports = {
  // -----------------------------
  // Criar nova transação
  // -----------------------------
  async create(req, res, next) {
    try {
      const user_id = req.userId;
      const { member_id, unit_id, type, category, amount, currency, date, description } = req.body;

      const result = await Transaction.create({ member_id, unit_id, type, category, amount, currency, date, description, created_by: user_id });
      res.status(201).json(formatResponse(result, 'Transação criada com sucesso'));
    } catch (err) {
      next(err);
    }
  },

  // -----------------------------
  // Listar transações
  // -----------------------------
  async findAll(req, res, next) {
    try {
      const user_id = req.userId;
      const { unit_id, member_id } = req.query;

      const transactions = await Transaction.findAll({ user_id, unit_id, member_id });
      res.json(formatResponse(transactions));
    } catch (err) {
      next(err);
    }
  },

  // -----------------------------
  // Buscar transação por ID
  // -----------------------------
  async findById(req, res, next) {
    try {
      const user_id = req.userId;
      const { id } = req.params;

      const transaction = await Transaction.findById(Number(id), user_id);
      if (!transaction) throw new AppError('Transação não encontrada ou acesso negado', 404);

      res.json(formatResponse(transaction));
    } catch (err) {
      next(err);
    }
  },

  // -----------------------------
  // Atualizar transação
  // -----------------------------
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const { type, category, amount, currency, date, description, member_id, unit_id } = req.body;

      // ⚠️ Para segurança, podemos buscar antes e garantir acesso
      const existing = await Transaction.findById(Number(id), req.userId);
      if (!existing) throw new AppError('Transação não encontrada ou acesso negado', 404);

      const changes = await Transaction.update(Number(id), { type, category, amount, currency, date, description, member_id, unit_id });
      res.json(formatResponse({ changes }, 'Transação atualizada'));
    } catch (err) {
      next(err);
    }
  },

  // -----------------------------
  // Deletar transação
  // -----------------------------
  async delete(req, res, next) {
    try {
      const { id } = req.params;

      const existing = await Transaction.findById(Number(id), req.userId);
      if (!existing) throw new AppError('Transação não encontrada ou acesso negado', 404);

      const deleted = await Transaction.delete(Number(id));
      res.json(formatResponse({ deleted }, 'Transação deletada'));
    } catch (err) {
      next(err);
    }
  }
};
