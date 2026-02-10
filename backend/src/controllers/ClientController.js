// backend/src/controllers/ClientController.js

const Client = require('../models/Client');
const formatResponse = require('../utils/responseFormatter');
const AppError = require('../errors/AppError');

module.exports = {

  // -----------------------------
  // Listar todos os clientes da unidade ativa
  // -----------------------------
  async findAll(req, res) {
    try {
      const activeUnitId = req.activeUnitId;

      if (!activeUnitId) {
        throw new AppError('Unidade ativa não definida', 400);
      }

      const clients = await Client.findAll(activeUnitId);
      res.json(formatResponse(clients));
    } catch (err) {
      console.error(err);
      throw new AppError(err.message || 'Erro ao listar clientes', err.statusCode || 500);
    }
  },

  // -----------------------------
  // Buscar cliente por ID (garantindo mesma unidade)
  // -----------------------------
  async findById(req, res) {
    try {
      const activeUnitId = req.activeUnitId;
      const clientId = Number(req.params.id);

      if (!activeUnitId) {
        throw new AppError('Unidade ativa não definida', 400);
      }

      const client = await Client.findById(clientId);

      if (!client || client.unit_id !== activeUnitId) {
        throw new AppError('Cliente não encontrado nesta unidade', 404);
      }

      res.json(formatResponse(client));
    } catch (err) {
      console.error(err);
      throw new AppError(err.message || 'Erro ao buscar cliente', err.statusCode || 500);
    }
  },

  // -----------------------------
  // Criar cliente (vinculado à unidade ativa)
  // -----------------------------
  async create(req, res) {
    try {
      const activeUnitId = req.activeUnitId;
      const createdBy = req.userId;

      if (!activeUnitId) {
        throw new AppError('Unidade ativa não definida', 400);
      }

      if (!createdBy) {
        throw new AppError('Usuário não autenticado', 401);
      }

      const client = await Client.create({
        ...req.body,
        unitId: activeUnitId,
        createdBy
      });

      res.status(201).json(
        formatResponse(client, 'Cliente criado com sucesso')
      );
    } catch (err) {
      console.error(err);

      // erro comum: nome duplicado por unidade
      if (err.code === 'SQLITE_CONSTRAINT') {
        throw new AppError('Já existe um cliente com este nome nesta unidade', 409);
      }

      throw new AppError(err.message || 'Erro ao criar cliente', err.statusCode || 500);
    }
  },

  // -----------------------------
  // Atualizar cliente
  // -----------------------------
  async update(req, res) {
    try {
      const activeUnitId = req.activeUnitId;
      const clientId = Number(req.params.id);

      if (!activeUnitId) {
        throw new AppError('Unidade ativa não definida', 400);
      }

      const client = await Client.findById(clientId);

      if (!client || client.unit_id !== activeUnitId) {
        throw new AppError('Cliente não encontrado nesta unidade', 404);
      }

      await Client.update(clientId, req.body);

      res.json(formatResponse(null, 'Cliente atualizado com sucesso'));
    } catch (err) {
      console.error(err);
      throw new AppError(err.message || 'Erro ao atualizar cliente', err.statusCode || 500);
    }
  },

  // -----------------------------
  // Deletar cliente
  // -----------------------------
  async delete(req, res) {
    try {
      const activeUnitId = req.activeUnitId;
      const clientId = Number(req.params.id);

      if (!activeUnitId) {
        throw new AppError('Unidade ativa não definida', 400);
      }

      const client = await Client.findById(clientId);

      if (!client || client.unit_id !== activeUnitId) {
        throw new AppError('Cliente não encontrado nesta unidade', 404);
      }

      await Client.delete(clientId);

      res.json(formatResponse(null, 'Cliente deletado com sucesso'));
    } catch (err) {
      console.error(err);
      throw new AppError(err.message || 'Erro ao deletar cliente', err.statusCode || 500);
    }
  }
};
