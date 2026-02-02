// backend/src/controllers/SessionController.js

const Session = require('../models/Session');
const AppError = require('../errors/AppError');
const formatResponse = require('../utils/responseFormatter');

module.exports = {

  // --------------------------------------------------
  // Criar nova sessão
  // --------------------------------------------------
  async create(req, res) {
    const { userId, userRole, activeUnitId } = req;

    if (!activeUnitId) {
      throw new AppError('Unità attiva non definita.', 400);
    }

    if (!['admin', 'manager', 'employee'].includes(userRole)) {
      throw new AppError('Accesso negato.', 403);
    }

    const {
      client_name,
      contact,
      visit_type,
      start_time,
      planned_minutes,
      planned_amount,
      currency,
      notes
    } = req.body;

    if (!start_time || !planned_minutes) {
      throw new AppError('Orario iniziale e durata sono obbligatori.', 400);
    }

    const startTime = new Date(start_time);
    if (isNaN(startTime)) {
      throw new AppError('Formato data non valido.', 400);
    }

    const plannedMinutes = Number(planned_minutes);
    if (plannedMinutes <= 0) {
      throw new AppError('Durata non valida.', 400);
    }


    const session = await Session.create({
      unitId: activeUnitId,
      clientName: client_name,
      contact,
      visitType: visit_type || 'first',
      startTime: startTime.toISOString(),
      plannedMinutes,
      plannedAmount: planned_amount,
      currency,
      notes,
      createdBy: userId
    });

    res
      .status(201)
      .json(formatResponse(session, 'Sessione creata con successo.'));
  },

  // --------------------------------------------------
  // Listar sessões abertas
  // --------------------------------------------------
  async listOpen(req, res) {
    const { activeUnitId } = req;

    if (!activeUnitId) {
      throw new AppError('Unità attiva non definita.', 400);
    }

    const sessions = await Session.findOpenByUnit(activeUnitId);

    res.json(formatResponse(sessions));
  },

  // --------------------------------------------------
  // Buscar sessão por ID
  // --------------------------------------------------
  async get(req, res) {
    const { activeUnitId } = req;
    const id = Number(req.params.id);

    const session = await Session.getById(id);
    if (!session) {
      throw new AppError('Sessione non trovata.', 404);
    }

    if (session.unit_id !== activeUnitId) {
      throw new AppError('Accesso negato.', 403);
    }

    res.json(formatResponse(session));
  },

  // --------------------------------------------------
  // Atualizar sessão aberta (alterar cliente, data ou minutos)
  // --------------------------------------------------
  async update(req, res) {
    const { activeUnitId, userRole } = req;
    const id = Number(req.params.id);
    const {
      client_name,
      contact,
      visit_type,
      start_time,
      planned_minutes,
      planned_amount,
      currency,
      notes
    } = req.body;

    if (!['admin', 'manager'].includes(userRole)) {
      throw new AppError('Accesso negato.', 403);
    }

    if (
      client_name === undefined &&
      contact === undefined &&
      visit_type === undefined &&
      start_time === undefined &&
      planned_minutes === undefined &&
      planned_amount === undefined &&
      currency === undefined &&
      notes === undefined
    ) {
      throw new AppError('Nessun dato da aggiornare.', 400);
    }

    const session = await Session.getById(id);
    if (!session) throw new AppError('Sessione non trovata.', 404);
    if (session.unit_id !== activeUnitId) throw new AppError('Accesso negato.', 403);
    if (session.status !== 'open') throw new AppError('Sessione già chiusa.', 400);

    const updatedStart = start_time
      ? new Date(start_time).toISOString()
      : session.start_time;

    const updatedPlanned = planned_minutes !== undefined
      ? Number(planned_minutes)
      : session.planned_minutes;

    await Session.updateOpenSession(id, activeUnitId, {
      client_name,
      contact,
      visit_type,
      start_time: updatedStart,
      planned_minutes: updatedPlanned,
      planned_amount,
      currency,
      notes
    });

    const updated = await Session.getById(id);
    res.json(formatResponse(updated, 'Sessione aggiornata'));
  },

  // --------------------------------------------------
  // Fechamento manual da sessão
  // --------------------------------------------------
  async close(req, res) {
    const { activeUnitId, userRole } = req;
    const id = Number(req.params.id);

    if (!['admin', 'manager', 'employee'].includes(userRole)) {
      throw new AppError('Accesso negato.', 403);
    }

    const session = await Session.getById(id);
    if (!session) {
      throw new AppError('Sessione non trovata.', 404);
    }

    if (session.unit_id !== activeUnitId) {
      throw new AppError('Accesso negato.', 403);
    }

    if (session.status !== 'open') {
      throw new AppError('Sessione già chiusa.', 400);
    }

    const {
      final_amount,
      paid_amount,
      payment_method,
      notes
    } = req.body;

    const now = new Date();

    await Session.close({
      id,
      actualEndTime: now.toISOString(),
      finalAmount: final_amount,
      paidAmount: paid_amount,
      paymentMethod: payment_method,
      notes
    });

    res.json(formatResponse(null, 'Sessione chiusa con successo.'));
  }
};
