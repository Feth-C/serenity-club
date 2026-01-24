// backend/src/controllers/AgendaController.js

const Agenda = require('../models/Agenda');
const AppError = require('../errors/AppError');
const formatResponse = require('../utils/responseFormatter');

module.exports = {

  // -----------------------------
  // Criar agenda
  // -----------------------------
  async create(req, res) {
    const { userId, userRole, activeUnitId } = req;
    if (!activeUnitId) throw new AppError('Unità attiva non definita.', 400);

    if (!['admin', 'manager'].includes(userRole)) {
      throw new AppError('Accesso negato.', 403);
    }

    const data = { ...req.body, manager_id: userRole === 'manager' ? userId : null, unit_id: activeUnitId };
    const agenda = await Agenda.create(data);

    res.status(201).json(formatResponse({ id: agenda.id }, 'Agenda creata con successo.'));
  },

  // -----------------------------
  // Listar agendas
  // -----------------------------
  async list(req, res) {
    const { userId, userRole, activeUnitId } = req;
    if (!activeUnitId) throw new AppError('Unità attiva non definita.', 400);

    const { status } = req.query;
    let agendas = [];

    if (userRole === 'admin') {
      agendas = await Agenda.findAllByUnit(activeUnitId, status);
    } else if (userRole === 'manager') {
      agendas = await Agenda.findByManagerAndUnit(userId, activeUnitId, status);
    } else {
      throw new AppError('Accesso negato.', 403);
    }

    res.json(formatResponse(agendas));
  },

  // -----------------------------
  // Buscar agenda pelo ID
  // -----------------------------
  async get(req, res) {
    const { userId, userRole, activeUnitId } = req;
    if (!activeUnitId) throw new AppError('Unità attiva non definita.', 400);

    const id = parseInt(req.params.id);
    const agenda = await Agenda.findByIdAndUnit(id, activeUnitId);

    if (!agenda) throw new AppError('Agenda non trovata.', 404);
    if (userRole === 'manager' && agenda.manager_id !== userId) {
      throw new AppError('Accesso negato.', 403);
    }

    res.json(formatResponse(agenda));
  },

  // -----------------------------
  // Atualizar agenda
  // -----------------------------
  async update(req, res) {
    const { userId, userRole, activeUnitId } = req;
    if (!activeUnitId) throw new AppError('Unità attiva non definita.', 400);

    const id = parseInt(req.params.id);
    const agenda = await Agenda.findByIdAndUnit(id, activeUnitId);

    if (!agenda) throw new AppError('Agenda non trovata.', 404);
    if (userRole === 'manager' && agenda.manager_id !== userId) {
      throw new AppError('Accesso negato.', 403);
    }

    await Agenda.update(id, req.body);
    res.json(formatResponse(null, 'Agenda aggiornata con successo.'));
  },

  // -----------------------------
  // Deletar agenda
  // -----------------------------
  async delete(req, res) {
    const { userId, userRole, activeUnitId } = req;
    if (!activeUnitId) throw new AppError('Unità attiva non definita.', 400);

    const id = parseInt(req.params.id);
    const agenda = await Agenda.findByIdAndUnit(id, activeUnitId);

    if (!agenda) throw new AppError('Agenda non trovata.', 404);
    if (userRole === 'manager' && agenda.manager_id !== userId) {
      throw new AppError('Accesso negato.', 403);
    }

    await Agenda.delete(id);
    res.json(formatResponse(null, 'Agenda eliminata con successo.'));
  }
};
