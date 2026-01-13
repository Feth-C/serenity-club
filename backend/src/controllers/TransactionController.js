// backend/src/controllers/TransactionController.js

const Transaction = require('../models/Transaction');
const AppError = require('../errors/AppError');
const formatResponse = require('../utils/responseFormatter');

module.exports = {

    // -----------------------------
    // POST /transactions
    // Criar nova transação
    // -----------------------------
    async create(req, res) {
        try {
            const { member_id, type, category, amount, currency, date, description } = req.body;
            const created_by = req.userId;

            // Cria a transação
            const result = await Transaction.create({ member_id, type, category, amount, currency, date, description, created_by });

            // Buscar a transação recém-criada
            const transaction = await Transaction.findById(result.id);

            res.status(201).json(formatResponse(transaction, 'Transação criada com sucesso.'));
        } catch (err) {
            console.error(err);
            if (err instanceof AppError) {
                res.status(err.statusCode).json({ status: 'error', message: err.message });
            } else {
                res.status(500).json({ status: 'error', message: 'Erro interno' });
            }
        }
    },

    // -----------------------------
    // GET /transactions
    // Listar todas as transações
    // -----------------------------
    async list(req, res) {
        try {
            const transactions = await Transaction.findAll(); // sempre retorna array
            res.json(formatResponse(transactions));
        } catch (err) {
            console.error(err);
            res.status(500).json({ status: 'error', message: 'Erro ao buscar transações' });
        }
    },

    // -----------------------------
    // GET /transactions/:id
    // Detalhe de uma transação
    // -----------------------------
    async get(req, res) {
        try {
            const id = parseInt(req.params.id);
            const transaction = await Transaction.findById(id);

            if (!transaction) throw new AppError('Transação não encontrada.', 404);

            res.json(formatResponse(transaction));
        } catch (err) {
            console.error(err);
            if (err instanceof AppError) {
                res.status(err.statusCode).json({ status: 'error', message: err.message });
            } else {
                res.status(500).json({ status: 'error', message: 'Erro interno' });
            }
        }
    },

    // -----------------------------
    // PUT /transactions/:id
    // Atualizar transação
    // -----------------------------
    async update(req, res) {
        try {
            const id = parseInt(req.params.id);
            const { type, category, amount, currency, date, description } = req.body;

            const existing = await Transaction.findById(id);
            if (!existing) throw new AppError('Transação não encontrada.', 404);

            await Transaction.update(id, {
                type: type ?? existing.type,
                category: category ?? existing.category,
                amount: amount ?? existing.amount,
                currency: currency ?? existing.currency,
                date: date ?? existing.date,
                description: description ?? existing.description
            });

            const updatedTransaction = await Transaction.findById(id);

            res.json(formatResponse(updatedTransaction, 'Transação atualizada com sucesso.'));
        } catch (err) {
            console.error(err);
            if (err instanceof AppError) {
                res.status(err.statusCode).json({ status: 'error', message: err.message });
            } else {
                res.status(500).json({ status: 'error', message: 'Erro interno' });
            }
        }
    },

    // -----------------------------
    // DELETE /transactions/:id
    // Remover transação
    // -----------------------------
    async delete(req, res) {
        try {
            const id = parseInt(req.params.id);
            const existing = await Transaction.findById(id);
            if (!existing) throw new AppError('Transação não encontrada.', 404);

            await Transaction.delete(id);

            res.json(formatResponse(null, 'Transação eliminada com sucesso.'));
        } catch (err) {
            console.error(err);
            if (err instanceof AppError) {
                res.status(err.statusCode).json({ status: 'error', message: err.message });
            } else {
                res.status(500).json({ status: 'error', message: 'Erro interno' });
            }
        }
    }
};
