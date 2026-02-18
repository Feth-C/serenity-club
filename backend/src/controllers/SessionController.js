// backend/src/controllers/SessionController.js

const Session = require('../models/Session');
const Client = require('../models/Client');
const SessionService = require('../services/SessionService');
const GoogleCalendarService = require('../services/GoogleCalendarService'); // 🔹 NOVO
const AppError = require('../errors/AppError');
const formatResponse = require('../utils/responseFormatter');

module.exports = {

  // ------------------------------
  // CREATE — agora cria evento no Google Calendar
  // ------------------------------
  async create(req, res) {
    const { userId, userRole, activeUnitId } = req;

    if (!activeUnitId) throw new AppError('Unità attiva non definita.', 400);
    if (!['admin', 'manager', 'employee'].includes(userRole))
      throw new AppError('Accesso negato.', 403);

    let {
      visit_type,
      client_id,
      client_name,
      contact,
      email,
      address,
      start_time,
      planned_minutes,
      planned_amount,
      currency,
      notes
    } = req.body;

    if (!visit_type || !start_time || !planned_minutes)
      throw new AppError(
        'Tipo visita, orario iniziale e durata sono obbligatori.',
        400
      );

    const startTime = new Date(start_time);
    if (isNaN(startTime)) throw new AppError('Formato data non valido.', 400);

    const plannedMinutes = Number(planned_minutes);
    if (plannedMinutes <= 0)
      throw new AppError('Durata non valida.', 400);

    // ------------------------------
    // Resolver cliente (SUA LÓGICA ORIGINAL)
    // ------------------------------
    let finalClientId = client_id || null;

    if (visit_type === 'first') {
      if (!client_name)
        throw new AppError(
          'Nome cliente obbligatorio per prima visita.',
          400
        );

      const existingClient = await Client.findByNameInUnit(
        client_name,
        activeUnitId
      );

      if (existingClient) {
        finalClientId = existingClient.id;
      } else {
        const client = await Client.create({
          unitId: activeUnitId,
          name: client_name,
          contact,
          email,
          address,
          notes,
          createdBy: userId
        });
        finalClientId = client.id;
      }
    }

    if (visit_type === 'return' && !finalClientId)
      throw new AppError(
        'Cliente deve ser selecionado para visita de retorno.',
        400
      );

    // ------------------------------
    // Garantir nome do cliente no RETURN
    // ------------------------------
    let finalClientName = client_name;

    if (visit_type === 'return') {
      const client = await Client.findById(finalClientId);
      if (!client) throw new AppError('Cliente não encontrado.', 404);
      finalClientName = client.name;
    }

    // ------------------------------
    // Criar sessão (BANCO)
    // ------------------------------
    const session = await Session.create({
      unitId: activeUnitId,
      clientId: finalClientId,
      clientName: finalClientName,
      contact,
      email,
      address,
      visitType: visit_type,
      startTime: startTime.toISOString(),
      plannedMinutes,
      plannedAmount: planned_amount,
      currency,
      notes,
      createdBy: userId
    });

    // ------------------------------
    // 🔹 CRIAR EVENTO NO GOOGLE
    // ------------------------------
    const fullSession = await Session.getById(session.id);

    try {
      const eventId =
        await GoogleCalendarService.createSessionEvent(fullSession);

      // já foi salvo no model Session.updateGoogleEventId
      console.log('Google Event criado:', eventId);
    } catch (err) {
      console.error('Erro Google Calendar:', err);
      // NÃO quebra o fluxo do sistema — sessão já foi criada
    }

    res
      .status(201)
      .json(formatResponse(session, 'Sessione creata con successo.'));
  },

  // ------------------------------
  // LIST OPEN — INALTERADO
  // ------------------------------
  async listOpen(req, res) {
    const { activeUnitId } = req;

    if (!activeUnitId)
      throw new AppError('Unità attiva non definita.', 400);

    const sessions = await Session.findOpenByUnit(activeUnitId);
    res.json(formatResponse(sessions));
  },

  // ------------------------------
  // LIST HISTORY — NOVO
  // ------------------------------
  async listHistory(req, res) {
    const { activeUnitId } = req;

    if (!activeUnitId)
      throw new AppError('Unità attiva non definita.', 400);

    const sessions = await Session.findHistoryByUnit(activeUnitId);

    res.json(formatResponse(sessions));
  },

  // ------------------------------
  // GET — INALTERADO
  // ------------------------------
  async get(req, res) {
    const { activeUnitId } = req;
    const id = Number(req.params.id);

    const session = await Session.getById(id);
    if (!session)
      throw new AppError('Sessione non trovata.', 404);

    if (session.unit_id !== activeUnitId)
      throw new AppError('Accesso negato.', 403);

    res.json(formatResponse(session));
  },

  // ------------------------------
  // UPDATE — agora também atualiza Google Calendar
  // ------------------------------
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

    if (!['admin', 'manager'].includes(userRole))
      throw new AppError('Accesso negato.', 403);

    const session = await Session.getById(id);
    if (!session)
      throw new AppError('Sessione non trovata.', 404);

    if (session.unit_id !== activeUnitId)
      throw new AppError('Accesso negato.', 403);

    if (session.status !== 'open')
      throw new AppError('Sessione già chiusa.', 400);

    const updatedStart = start_time
      ? new Date(start_time).toISOString()
      : session.start_time;

    const updatedPlanned =
      planned_minutes !== undefined
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

    // ------------------------------
    // 🔹 ATUALIZAR GOOGLE CALENDAR
    // ------------------------------
    try {
      await GoogleCalendarService.updateSessionEvent(updated);
      console.log('Google Event atualizado');
    } catch (err) {
      console.error('Erro ao atualizar Google Calendar:', err);
    }

    res.json(formatResponse(updated, 'Sessione aggiornata'));
  },

  // ------------------------------
  // CLOSE — você já tem via SessionService (MANTIDO)
  // ------------------------------
  async close(req, res) {
    const { activeUnitId, userRole, userId } = req;
    const id = Number(req.params.id);

    if (!['admin', 'manager', 'employee'].includes(userRole)) {
      throw new AppError('Accesso negato.', 403);
    }

    let {
      payer_type,
      payer_name,
      final_amount,
      paid_amount,
      payment_method,
      notes
    } = req.body;

    const closedSession = await SessionService.closeSession({
      sessionId: id,
      unitId: activeUnitId,
      userId,
      payload: {
        actualEndTime: new Date().toISOString(),
        payerType: payer_type,
        payerName: payer_name,
        finalAmount: Number(final_amount),
        paidAmount: Number(paid_amount),
        paymentMethod: payment_method,
        notes
      }
    });

    res.json(
      formatResponse(closedSession, 'Sessione chiusa con successo.')
    );
  },

  // ------------------------------
  // 🔹 NOVO: CANCEL — atualiza Google Calendar
  // ------------------------------
  async cancel(req, res) {
    const { activeUnitId, userId, userRole } = req;
    const id = Number(req.params.id);

    if (!['admin', 'manager'].includes(userRole)) {
      throw new AppError('Accesso negato.', 403);
    }

    const session = await Session.getById(id);
    if (!session)
      throw new AppError('Sessione non trovata.', 404);

    if (session.unit_id !== activeUnitId)
      throw new AppError('Accesso negato.', 403);

    // marcar como cancelada no banco
    await Session.updateStatus(id, 'cancelled');

    // recarregar
    const updated = await Session.getById(id);

    // ------------------------------
    // 🔹 Atualizar evento no Google como CANCELADO
    // ------------------------------
    try {
      await GoogleCalendarService.cancelSessionEvent(
        updated,
        userId
      );
      console.log('Evento Google marcado como cancelado');
    } catch (err) {
      console.error('Erro Google Calendar (cancel):', err);
    }

    res.json(
      formatResponse(updated, 'Sessione annullata con successo.')
    );
  }
};
