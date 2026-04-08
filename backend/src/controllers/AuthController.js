// backend/src/controllers/AuthController.js

const db = require('../database/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../errors/AppError');
const formatResponse = require('../utils/responseFormatter');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('JWT_SECRET non definito nel file .env');

module.exports = {
  // -----------------------------
  // POST /auth/login
  // -----------------------------
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      const user = await User.findByEmail(email);
      if (!user) throw new AppError('Utente non trovato.', 401);

      const match = await bcrypt.compare(password, user.password_hash);
      if (!match) throw new AppError('Password errata.', 401);

      const units = await User.getUnits(user.id);
      if (!units?.length) throw new AppError('Utente senza unità associata.', 500);

      const activeUnitId = units[0].id; // unidade ativa default
      const token = jwt.sign(
        { id: user.id, role: user.role, activeUnitId },
        JWT_SECRET,
        { expiresIn: '1d' }
      );

      res.json(formatResponse({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
          activeUnitId,
          units
        }
      }, 'Accesso autorizzato!'));

    } catch (err) {
      next(err);
    }
  },

  // -----------------------------
  // GET /auth/me
  // -----------------------------
  async me(req, res, next) {
    try {
      const user = await User.getById(req.userId);
      if (!user) throw new AppError('Utente non trovato.', 404);

      const units = await User.getUnits(user.id);
      if (!units?.length) throw new AppError('Utente senza unità associata.', 500);

      const activeUnitId = units[0].id;

      res.json(formatResponse({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
          activeUnitId,
          units
        }
      }));

    } catch (err) {
      next(err);
    }
  },

  // -----------------------------
  // GET /auth/setup-check
  // -----------------------------
  async setupCheck(req, res, next) {
    try {

      const hasUsers = await User.existsAnyUser();

      res.json({
        setupMode: !hasUsers
      });

    } catch (err) {
      next(err);
    }
  },

  // -----------------------------
  // POST /auth/register (opcional)
  // -----------------------------
  async register(req, res, next) {
    try {
      const { name, email, password, role } = req.body;

      const existingUser = await User.findByEmail(email);
      if (existingUser) throw new AppError('Email già registrata.', 409);

      const passwordHash = await bcrypt.hash(password, 10);
      const userRole = role || 'member';

      const newUser = await User.create(name, email, passwordHash, userRole);

      // vincular automaticamente à unidade default
      await User.linkToDefaultUnit(newUser.id, userRole);

      res.status(201).json(formatResponse({ id: newUser.id }, 'Utente registrato con successo!'));

    } catch (err) {
      next(err);
    }
  },

  async setupAdmin(req, res, next) {
    try {
      const { name, email, password } = req.body;

      // Verifica se já existe usuário
      const exists = await User.existsAnyUser();
      if (exists) {
        throw new AppError('Setup già completato.', 403);
      }

      // Cria hash da senha
      const passwordHash = await bcrypt.hash(password, 10);

      // Cria o admin
      const user = await User.create(name, email, passwordHash, 'admin', 'active');

      // Pega a unidade principal
      const unit = await new Promise((resolve, reject) => {
        const query = `SELECT id FROM units WHERE is_active = 1 ORDER BY id ASC LIMIT 1`;
        db.get(query, [], (err, row) => err ? reject(err) : resolve(row));
      });

      if (!unit) throw new AppError('Unidade principal não encontrada.', 500);

      // Vincula o admin à unidade principal
      await new Promise((resolve, reject) => {
        const query = `
          INSERT INTO user_units (user_id, unit_id, role, is_active)
          VALUES (?, ?, 'admin', 1)
        `;
        db.run(query, [user.id, unit.id], function (err) {
          if (err) return reject(err);
          resolve();
        });
      });

      res.status(201).json({
        success: true,
        message: 'Admin creato con successo e vinculado alla unità principale.',
        data: { id: user.id, email, role: 'admin', unitId: unit.id }
      });

    } catch (err) {
      next(err);
    }
  },

  async setupCheck(req, res, next) {
    try {
      const exists = await User.existsAnyUser();
      res.json({ setupMode: !exists });
    } catch (err) {
      next(err);
    }
  }
};
