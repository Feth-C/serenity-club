// backend/src/controllers/ClientController.js

const Client = require('../models/Client');
const AppError = require('../errors/AppError');
const formatResponse = require('../utils/responseFormatter');

module.exports = {

  // -----------------------------
  // Criar cliente
  // -----------------------------
  async create(req, res) {
    const { userRole, activeUnitId } = req;
    if (!activeUnitId) throw new AppError('Unità attiva non definita.', 400);

    if (!['admin', 'manager'].includes(userRole)) {
      throw new AppError('Accesso negato.', 403);
    }

    const { name, email, phone } = req.body;
    if (!name) throw new AppError('Nome obbligatorio.', 400);

    const client = await Client.create(activeUnitId, name, email, phone);

    res
      .status(201)
      .json(formatResponse({ id: client.id }, 'Cliente creato con successo.'));
  },

  // -----------------------------
  // Listar clientes
  // -----------------------------
  async list(req, res) {
    const { userRole, activeUnitId } = req;
    if (!activeUnitId) throw new AppError('Unità attiva non definita.', 400);

    if (!['admin', 'manager'].includes(userRole)) {
      throw new AppError('Accesso negato.', 403);
    }

    const clients = await Client.findAll(activeUnitId);
    res.json(formatResponse(clients));
  },

  // -----------------------------
  // Buscar cliente pelo ID
  // -----------------------------
  async get(req, res) {
    const { userRole, activeUnitId } = req;
    if (!activeUnitId) throw new AppError('Unità attiva non definita.', 400);

    if (!['admin', 'manager'].includes(userRole)) {
      throw new AppError('Accesso negato.', 403);
    }

    const id = Number(req.params.id);
    const client = await Client.getById(id);

    if (!client || client.unit_id !== activeUnitId) {
      throw new AppError('Cliente non trovato.', 404);
    }

    res.json(formatResponse(client));
  },

  // -----------------------------
  // Atualizar cliente
  // -----------------------------
  async update(req, res) {
    const { userRole, activeUnitId } = req;
    if (!activeUnitId) throw new AppError('Unità attiva non definita.', 400);

    if (!['admin', 'manager'].includes(userRole)) {
      throw new AppError('Accesso negato.', 403);
    }

    const id = Number(req.params.id);
    const client = await Client.getById(id);

    if (!client || client.unit_id !== activeUnitId) {
      throw new AppError('Cliente non trovato.', 404);
    }

    await Client.update(id, req.body);
    res.json(formatResponse(null, 'Cliente aggiornato con successo.'));
  },

  // -----------------------------
  // Deletar cliente
  // -----------------------------
  async delete(req, res) {
    const { userRole, activeUnitId } = req;
    if (!activeUnitId) throw new AppError('Unità attiva non definita.', 400);

    if (userRole !== 'admin') {
      throw new AppError('Solo admin può eliminare clienti.', 403);
    }

    const id = Number(req.params.id);
    const client = await Client.getById(id);

    if (!client || client.unit_id !== activeUnitId) {
      throw new AppError('Cliente non trovato.', 404);
    }

    await Client.delete(id);
    res.json(formatResponse(null, 'Cliente eliminato con successo.'));
  }
};
