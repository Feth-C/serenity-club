// backend/src/controllers/UserController.js

const bcrypt = require('bcrypt');
const User = require('../models/User');
const AppError = require('../errors/AppError');
const formatResponse = require('../utils/responseFormatter');

module.exports = {

    // -----------------------------
    // Criar usuário interno apenas admin
    // -----------------------------
    async createByAdmin(req, res) {
        const { name, email, role, status } = req.body;

        const existingUser = await User.findByEmail(email);
        if (existingUser) throw new AppError('Utente già esistente.', 409);

        const password = Math.random().toString(36).slice(-10);
        const passwordHash = await bcrypt.hash(password, 10);

        const user = await User.create(name, email, passwordHash, role, status || 'active');

        res.status(201).json(formatResponse(
            { id: user.id, email, role, password },
            'Utente creato con successo da admin.'
        ));
    },

    // -----------------------------
    // Listar usuários com paginação
    // -----------------------------
    async list(req, res) {
        if (req.userRole !== 'admin') {
            throw new AppError('Accesso negato.', 403);
        }

        const { status } = req.query;
        const unitId = req.headers['x-unit-id'] || null;

        const page = parseInt(req.query.page) || 1;
        const perPage = parseInt(req.query.perPage) || 10;

        const offset = (page - 1) * perPage;

        const result = await User.findAllPaginated({
            status,
            unitId: unitId ? Number(unitId) : null,
            limit: perPage,
            offset
        });

        const totalPages = Math.ceil(result.total / perPage);

        res.json({
            success: true,
            data: {
                items: result.items,
                page,
                totalPages,
                totalItems: result.total
            }
        });
    },

    // -----------------------------
    // Retorna o usuário pelo ID
    // -----------------------------
    async get(req, res) {
        if (req.userRole !== 'admin') throw new AppError('Accesso negato.', 403);

        const id = parseInt(req.params.id);
        const user = await User.getById(id);
        if (!user) throw new AppError('Utente non trovato.', 404);

        res.json(formatResponse(user));
    },

    // -----------------------------
    // Retorna o próprio usuário autenticado
    // -----------------------------
    async getMe(req, res) {
        const user = await User.getById(req.userId);
        if (!user) throw new AppError('Utente non trovato.', 404);

        res.json(formatResponse(user));
    },

    // -----------------------------
    // Atualiza um usuário
    // -----------------------------
    async update(req, res) {
        const id = parseInt(req.params.id);

        if (req.userRole !== 'admin' && req.userId !== id) {
            throw new AppError('Accesso negato.', 403);
        }

        const updated = await User.update(id, req.body);
        if (!updated) throw new AppError('Utente non trovato.', 404);

        res.json(formatResponse(null, 'Utente aggiornato con successo.'));
    },

    // -----------------------------
    // Deleta um usuário
    // -----------------------------
    async delete(req, res) {
        const id = parseInt(req.params.id);

        if (req.userRole !== 'admin') throw new AppError('Accesso negato.', 403);

        const deleted = await User.delete(id);
        if (!deleted) throw new AppError('Utente non trovato.', 404);

        res.json(formatResponse(null, 'Utente eliminato con successo.'));
    },
};
