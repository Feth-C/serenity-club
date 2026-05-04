// backend/src/controllers/UnitController.js

const Unit = require('../models/Unit');
const User = require('../models/User');
const AppError = require('../errors/AppError');
const formatResponse = require('../utils/responseFormatter');

module.exports = {
    async create(req, res) {
        if (req.userRole !== 'admin') throw new AppError('Accesso negato.', 403);

        const { name, type, description } = req.body;
        if (!name || !type) throw new AppError('Nome e tipo obbligatori.', 400);

        const unit = await Unit.create(name, type, description);

        // Opcional: Vincular o admin criador automaticamente a essa nova unidade
        await User.linkToUnit(req.userId, unit.id, 'admin');

        res.status(201).json(formatResponse(unit, 'Unità creata con successo.'));
    },

    async list(req, res) {
        // Admins veem todas, outros veem apenas as que pertencem
        // Por simplicidade para o Admin:
        const units = await Unit.findAll();
        res.json(formatResponse(units));
    }
};