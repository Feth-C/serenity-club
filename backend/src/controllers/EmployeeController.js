// backend/src/controllers/EmployeeController.js

const Employee = require('../models/Employee');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const AppError = require('../errors/AppError');
const formatResponse = require('../utils/responseFormatter');

function generatePassword(length = 8) {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';
    let pass = '';
    for (let i = 0; i < length; i++) {
        pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pass;
}

module.exports = {

    // -----------------------------
    // Criar dipendente
    // -----------------------------
    async create(req, res) {
        const { userId: manager_id, userRole, activeUnitId } = req;
        if (!activeUnitId) throw new AppError('Unità attiva non definita.', 400);

        const { name, email, phone, role, createUserAccount } = req.body;

        if (userRole !== 'manager' && userRole !== 'admin') {
            throw new AppError('Accesso negato.', 403);
        }

        let user_id = null;
        let generatedPassword = null;

        if (createUserAccount && email) {
            const existingUser = await User.findByEmail(email);
            if (existingUser) {
                throw new AppError('Questo utente esiste già con questo indirizzo email.', 409);
            }

            generatedPassword = generatePassword(10);
            const hash = await bcrypt.hash(generatedPassword, 10);
            const user = await User.create(name, email, hash, 'employee');
            user_id = user.id;
        }

        const employee = await Employee.create({
            manager_id,
            name,
            email,
            phone,
            role,
            user_id,
            unit_id: activeUnitId
        });

        res.status(201).json(formatResponse(
            {
                id: employee.id,
                ...(user_id ? { user: { id: user_id, email, password: generatedPassword } } : {})
            },
            'Dipendente creato con successo.'
        ));
    },

    // -----------------------------
    // Listar dipendenti
    // -----------------------------
    async list(req, res) {
        const { userId, userRole, activeUnitId } = req;
        if (!activeUnitId) throw new AppError('Unità attiva non definita.', 400);

        const { status, page = 1, perPage = 10 } = req.query;
        const offset = (page - 1) * perPage;
        const filters = {};

        if (userRole === 'manager') filters.manager_id = userId;

        if (status) filters.status = status;

        const result = await Employee.findAllPaginated(filters, activeUnitId, perPage, offset);

        const totalPages = Math.ceil(result.total / perPage);

        res.json({
            success: true,
            data: {
                items: result.rows,
                page: Number(page),
                totalPages,
                totalItems: result.total
            }
        });
    },

    // -----------------------------
    // Buscar dipendente pelo ID
    // -----------------------------
    async get(req, res) {
        const { userId, userRole, activeUnitId } = req;
        if (!activeUnitId) throw new AppError('Unità attiva non definita.', 400);

        const id = parseInt(req.params.id);
        const employee = await Employee.findById(id);

        if (!employee) throw new AppError('Dipendente non trovato.', 404);
        if (userRole === 'manager' && (employee.manager_id !== userId || employee.unit_id !== activeUnitId)) {
            throw new AppError('Accesso negato.', 403);
        }

        res.json(formatResponse(employee));
    },

    // -----------------------------
    // Atualizar dipendente
    // -----------------------------
    async update(req, res) {
        const { userId, userRole, activeUnitId } = req;
        if (!activeUnitId) throw new AppError('Unità attiva non definita.', 400);

        const id = parseInt(req.params.id);
        const employee = await Employee.findById(id);

        if (!employee) throw new AppError('Dipendente non trovato.', 404);
        if (userRole === 'manager' && (employee.manager_id !== userId || employee.unit_id !== activeUnitId)) {
            throw new AppError('Accesso negato.', 403);
        }

        await Employee.update(id, req.body);
        res.json(formatResponse(null, 'Dipendente aggiornato con successo.'));
    },

    // -----------------------------
    // Deletar dipendente
    // -----------------------------
    async delete(req, res) {
        const { userId, userRole, activeUnitId } = req;
        if (!activeUnitId) throw new AppError('Unità attiva non definita.', 400);

        const id = parseInt(req.params.id);
        const employee = await Employee.findById(id);

        if (!employee) throw new AppError('Dipendente non trovato.', 404);
        if (userRole === 'manager' && (employee.manager_id !== userId || employee.unit_id !== activeUnitId)) {
            throw new AppError('Accesso negato.', 403);
        }

        await Employee.delete(id);
        res.json(formatResponse(null, 'Dipendente eliminato con successo.'));
    },

    // -----------------------------
    // Criar login para dipendente existente
    // -----------------------------
    async enableLogin(req, res) {
        const { userId, userRole, activeUnitId } = req;
        if (!activeUnitId) throw new AppError('Unità attiva non definita.', 400);

        const id = parseInt(req.params.id);
        const employee = await Employee.findById(id);

        if (!employee) throw new AppError('Dipendente non trovato.', 404);
        if (userRole === 'manager' && (employee.manager_id !== userId || employee.unit_id !== activeUnitId)) {
            throw new AppError('Accesso negato.', 403);
        }

        if (employee.user_id) throw new AppError('Dipendente già ha login.', 400);
        if (!employee.email) throw new AppError('Email mancante, impossibile creare login.', 400);

        const existingUser = await User.findByEmail(employee.email);
        if (existingUser) throw new AppError('Questo utente esiste già con questo indirizzo email.', 409);

        const password = generatePassword(10);
        const hash = await bcrypt.hash(password, 10);
        const user = await User.create(employee.name, employee.email, hash, 'employee');

        await Employee.update(id, { user_id: user.id });

        res.json(formatResponse({ email: employee.email, password }, 'Login creato per il dipendente.'));
    }
};
