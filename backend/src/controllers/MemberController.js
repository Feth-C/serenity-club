// backend/src/controllers/MemberController.js

const Member = require('../models/Member');
const AppError = require('../errors/AppError');
const formatResponse = require('../utils/responseFormatter');

module.exports = {

  // -----------------------------
  // Listar membros por unidade (paginado)
  // -----------------------------
  async list(req, res) {
    const { status } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { userRole, userId, activeUnitId } = req;

    if (!activeUnitId) throw new AppError('Unità attiva non definita.', 400);

    let result;

    if (userRole === 'admin') {
      result = await Member.findAllByUnit(
        activeUnitId,
        status,
        limit,
        offset
      );

    } else if (userRole === 'manager') {
      result = await Member.findByManagerAndUnit(
        userId,
        activeUnitId,
        status,
        limit,
        offset
      );

    } else if (userRole === 'member') {
      const member = await Member.findByUserAndUnit(userId, activeUnitId);
      const rows = member ? [member] : [];

      return res.json({
        data: rows,
        page: 1,
        totalPages: 1,
        totalItems: rows.length
      });

    } else {
      throw new AppError('Accesso negato.', 403);
    }

    const totalPages = Math.ceil(result.total / limit);

    res.json({
            success: true,
            data: {
                items: result.rows,
                page,
                totalPages,
                totalItems: result.total
            }
        });
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
