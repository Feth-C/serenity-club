// backend/src/controllers/MemberController.js

const Member = require('../models/Member');
const AppError = require('../errors/AppError');
const formatResponse = require('../utils/responseFormatter');

module.exports = {

  // -----------------------------
  // Listar todos os membros
  // -----------------------------
  async list(req, res) {
    const { status } = req.query;
    let members;

    if (req.userRole === 'admin') {
      members = await Member.findAll(status);
    }
    else if (req.userRole === 'manager') {
      members = await Member.findByManager(req.userId, status);
    }
    else if (req.userRole === 'member') {
      const member = await Member.findByUserId(req.userId);
      members = member ? [member] : [];
    }
    else {
      throw new AppError('Accesso negato.', 403);
    }

    res.json(formatResponse(members));
  },

  // -----------------------------
  // Buscar membro pelo ID
  // -----------------------------
  async get(req, res) {
    const id = parseInt(req.params.id);
    const member = await Member.findById(id);

    if (!member) throw new AppError('Membro non trovato.', 404);

    // Admin ou manager dono
    const isOwnerOrAdmin = req.userRole === 'admin' || member.manager_id === req.userId;
    if (!isOwnerOrAdmin) throw new AppError('Accesso negato.', 403);

    res.json(formatResponse(member));
  },

  // -----------------------------
  // Buscar membro pelo /me
  // -----------------------------
  async getMe(req, res) {
    if (req.userRole !== 'member') {
      throw new AppError('Accesso negato.', 403);
    }

    const member = await Member.findByUserId(req.userId);

    if (!member) {
      throw new AppError('Membro non trovato.', 404);
    }

    res.json(formatResponse(member));
  },

  // -----------------------------
  // Criar novo membro
  // -----------------------------
  async create(req, res) {
    const data = req.body;

    // Definir manager_id
    if (req.userRole === 'manager') {
      data.manager_id = req.userId; // manager cria apenas para si
    } else if (req.userRole === 'admin') {
      // admin pode escolher qualquer manager ou deixar null
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
    const member = await Member.findById(id);

    if (!member) throw new AppError('Membro non trovato.', 404);

    const isOwnerOrAdmin = req.userRole === 'admin' || member.manager_id === req.userId;
    if (!isOwnerOrAdmin) throw new AppError('Accesso negato.', 403);

    const data = req.body;

    // Manager não pode alterar manager_id
    if (req.userRole === 'manager') delete data.manager_id;

    await Member.update(id, data);
    res.json(formatResponse(null, 'Membro aggiornato con successo.'));
  },

  // -----------------------------
  // Deletar membro
  // -----------------------------
  async delete(req, res) {
    const id = parseInt(req.params.id);
    const member = await Member.findById(id);

    if (!member) throw new AppError('Membro non trovato.', 404);

    const isOwnerOrAdmin = req.userRole === 'admin' || member.manager_id === req.userId;
    if (!isOwnerOrAdmin) throw new AppError('Accesso negato.', 403);

    await Member.delete(id);
    res.json(formatResponse(null, 'Membro eliminato con successo.'));
  }

};
