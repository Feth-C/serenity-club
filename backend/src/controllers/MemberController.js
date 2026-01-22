// backend/src/controllers/MemberController.js

const Member = require('../models/Member');
const AppError = require('../errors/AppError');
const formatResponse = require('../utils/responseFormatter');

module.exports = {

  // -----------------------------
  // Listar membros por unidade
  // -----------------------------
  async list(req, res) {
    const { status } = req.query;
    const { userRole, userId, activeUnitId } = req;

    if (!activeUnitId) throw new AppError('Unità attiva non definita.', 400);

    let members;

    if (userRole === 'admin') {
      members = await Member.findAllByUnit(activeUnitId, status);

    } else if (userRole === 'manager') {
      members = await Member.findByManagerAndUnit(userId, activeUnitId, status);

    } else if (userRole === 'member') {
      const member = await Member.findByUserAndUnit(userId, activeUnitId);
      members = member ? [member] : [];

    } else {
      throw new AppError('Accesso negato.', 403);
    }

    res.json(formatResponse(members));
  },

  // -----------------------------
  // Buscar membro pelo ID
  // -----------------------------
  async get(req, res) {
    const id = parseInt(req.params.id);
    const { userRole, userId, activeUnitId } = req;

    if (!activeUnitId) throw new AppError('Unità attiva non definita.', 400);

    const member = await Member.findByIdAndUnit(id, activeUnitId);
    if (!member) throw new AppError('Membro non trovato nella unità corrente.', 404);

    const isOwnerOrAdmin = userRole === 'admin' || member.manager_id === userId;
    if (!isOwnerOrAdmin) throw new AppError('Accesso negato.', 403);

    res.json(formatResponse(member));
  },

  // -----------------------------
  // Buscar membro /me
  // -----------------------------
  async getMe(req, res) {
    const { userId, userRole, activeUnitId } = req;

    if (!activeUnitId) throw new AppError('Unità attiva non definita.', 400);
    if (userRole !== 'member') throw new AppError('Accesso negato.', 403);

    const member = await Member.findByUserAndUnit(userId, activeUnitId);
    if (!member) throw new AppError('Membro non trovato nella unità corrente.', 404);

    res.json(formatResponse(member));
  },

  // -----------------------------
  // Criar novo membro
  // -----------------------------
  async create(req, res) {
    const { userRole, userId, activeUnitId } = req;
    if (!activeUnitId) throw new AppError('Unità attiva non definita.', 400);

    const data = { ...req.body, unit_id: activeUnitId };

    if (userRole === 'manager') {
      data.manager_id = userId;
    } else if (userRole === 'admin') {
      data.manager_id = data.manager_id || null;
    } else {
      throw new AppError('Accesso negato.', 403);
    }

    const member = await Member.create(data);
    res.status(201).json(formatResponse(member, 'Membro creato con successo.'));
  },

  // -----------------------------
  // Atualizar membro
  // -----------------------------
  async update(req, res) {
    const id = parseInt(req.params.id);
    const { userRole, userId, activeUnitId } = req;

    if (!activeUnitId) throw new AppError('Unità attiva non definita.', 400);

    const member = await Member.findByIdAndUnit(id, activeUnitId);
    if (!member) throw new AppError('Membro non trovato nella unità corrente.', 404);

    const isOwnerOrAdmin = userRole === 'admin' || member.manager_id === userId;
    if (!isOwnerOrAdmin) throw new AppError('Accesso negato.', 403);

    const data = { ...req.body };
    if (userRole === 'manager') delete data.manager_id;

    await Member.update(id, data);
    res.json(formatResponse(null, 'Membro aggiornato con successo.'));
  },

  // -----------------------------
  // Deletar membro
  // -----------------------------
  async delete(req, res) {
    const id = parseInt(req.params.id);
    const { userRole, userId, activeUnitId } = req;

    if (!activeUnitId) throw new AppError('Unità attiva non definita.', 400);

    const member = await Member.findByIdAndUnit(id, activeUnitId);
    if (!member) throw new AppError('Membro non trovato nella unità corrente.', 404);

    const isOwnerOrAdmin = userRole === 'admin' || member.manager_id === userId;
    if (!isOwnerOrAdmin) throw new AppError('Accesso negato.', 403);

    await Member.delete(id);
    res.json(formatResponse(null, 'Membro eliminato con successo.'));
  }

};
