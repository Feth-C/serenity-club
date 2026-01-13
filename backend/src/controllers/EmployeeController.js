// backend/src/controllers/EmployeeController.js

const Employee = require('../models/Employee');
const User = require('../models/User');
const bcrypt = require('bcrypt');
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
        const manager_id = req.userId;
        const { name, email, phone, role, createUserAccount } = req.body;


        let user_id = null;
        let generatedPassword = null;

        if (createUserAccount && email) { // Criar login opcional
            const existingUser = await User.findByEmail(email);
            if (existingUser) {
                throw new AppError('Questo utente esiste già con questo indirizzo email.', 409);
            }

            generatedPassword = generatePassword(10);
            const hash = await bcrypt.hash(generatedPassword, 10);
            const user = await User.create(name, email, hash, 'employee');
            user_id = user.id;
        }

        const employee = await Employee.create({ manager_id, name, email, phone, role, user_id }); // Criar dipendente

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
        const { status } = req.query;
        const filters = {};

        if (req.userRole === 'manager') {
            filters.manager_id = req.userId;
        }

        if (status) filters.status = status;

        const employees = await Employee.findAll(filters);

        res.json(formatResponse(employees));
    },

    // -----------------------------
    // Buscar dipendente pelo ID
    // -----------------------------
    async get(req, res) {
        const id = parseInt(req.params.id);

        const employee = await Employee.findById(id);
        if (!employee || employee.manager_id !== req.userId) {
            throw new AppError('Dipendente non trovato o non autorizzato.', 404);
        }

        res.json(formatResponse(employee));
    },

    // -----------------------------
    // Atualizar dipendente
    // -----------------------------
    async update(req, res) {
        const id = parseInt(req.params.id);

        const employee = await Employee.findById(id);
        if (!employee || employee.manager_id !== req.userId) {
            throw new AppError('Dipendente non trovato o non autorizzato.', 404);
        }

        await Employee.update(id, req.body);
        res.json(formatResponse(null, 'Dipendente aggiornato con successo.'));
    },

    // -----------------------------
    // Deletar dipendente
    // -----------------------------
    async delete(req, res) {
        const id = parseInt(req.params.id);

        const employee = await Employee.findById(id);
        if (!employee || employee.manager_id !== req.userId) {
            throw new AppError('Dipendente non trovato o non autorizzato.', 404);
        }

        await Employee.delete(id);

        res.json(formatResponse(null, 'Dipendente eliminato con successo.'));
    },

    // -----------------------------
    // Criar login para dipendente existente
    // -----------------------------
    async enableLogin(req, res) {
        const id = parseInt(req.params.id);


        const employee = await Employee.findById(id);
        if (!employee || employee.manager_id !== req.userId) {
            throw new AppError('Dipendente non trovato o non autorizzato.', 404);
        }

        if (employee.user_id) {
            throw new AppError('Dipendente già ha login.', 400);
        } if (!employee.email) {
            throw new AppError('Email mancante, non è possibile creare login.', 400);
        }
        const existingUser = await User.findByEmail(employee.email);
        if (existingUser) {
            throw new AppError('Questo utente esiste già con questo indirizzo email.', 409);
        }

        const password = generatePassword(10);
        const hash = await bcrypt.hash(password, 10);
        const user = await User.create(employee.name, employee.email, hash, 'employee');

        await Employee.update(id, { user_id: user.id });

        res.json(formatResponse({ email: employee.email, password }, 'Login creato per il dipendente.'));

    }

};
