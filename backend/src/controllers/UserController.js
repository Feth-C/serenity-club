// backend/src/controllers/UserController.js

const bcrypt = require('bcrypt');
const User = require('../models/User');
const AppError = require('../errors/AppError');
const formatResponse = require('../utils/responseFormatter');

module.exports = {

    async createByAdmin(req, res) { // Criar usuário interno apenas admin
        const { name, email, role, status } = req.body;

        // Verificar se email já existe
        const existingUser = await User.findByEmail(email);
        if (existingUser) throw new AppError('Utente già esistente.', 409);

        // Gerar senha aleatória
        const password = Math.random().toString(36).slice(-10);
        const passwordHash = await bcrypt.hash(password, 10);

        // Criar usuário
        const user = await User.create(name, email, passwordHash, role, status || 'active');

        res.status(201).json(formatResponse(
            { id: user.id, email, role, password },
            'Utente creato con successo da admin.'
        ));
    },

    async list(req, res) { // Lista o usuário autenticado
        if (req.userRole !== 'admin') {
            throw new AppError('Accesso negato.', 403);
        }

        const { status } = req.query;
        const users = await User.findAll(status || null);

        res.json({
            success: true,
            data: {
                items: users,
                total: users.length
            }
        });

        //res.json(formatResponse(users));
    },

    async get(req, res) { // Retorna o usuário pelo ID
        if (req.userRole !== 'admin') {
            throw new AppError('Accesso negato.', 403);
        }

        const id = parseInt(req.params.id);
        const user = await User.getById(id);
        if (!user) throw new AppError('Utente non trovato.', 404);

        res.json(formatResponse(user));
    },

    async getMe(req, res) { // Retorna o próprio usuário autenticado
        const user = await User.getById(req.userId);
        if (!user) throw new AppError('Utente non trovato.', 404);

        res.json(formatResponse(user));
    },

    async update(req, res) { // Atualiza um usuário
        const id = parseInt(req.params.id);

        if (req.userRole !== 'admin' && req.userId !== id) {
            throw new AppError('Accesso negato.', 403);
        }

        const updated = await User.update(id, req.body);
        if (!updated) throw new AppError('Utente non trovato.', 404);

        res.json(formatResponse(null, 'Utente aggiornato con successo.'));
    },

    async delete(req, res) { // Deleta um usuário
        const id = parseInt(req.params.id);

        if (req.userRole !== 'admin') {
            throw new AppError('Accesso negato.', 403);
        }

        const deleted = await User.delete(id);
        if (!deleted) throw new AppError('Utente non trovato.', 404);

        res.json(formatResponse(null, 'Utente eliminato con successo.'));
    },
};
