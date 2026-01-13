// backend/src/controllers/AuthController.js

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../errors/AppError');
const formatResponse = require('../utils/responseFormatter');


const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET non definito nel file .env');
}

module.exports = {

  // -----------------------------
  // POST /auth/register
  // Registrar novo usuário
  // -----------------------------

  async register(req, res) {

    const { name, email, password, role } = req.body;

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      throw new AppError('Email già registrata.', 409);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userRole = role || 'member';

    const user = await User.create(name, email, passwordHash, userRole);

    res.status(201).json(formatResponse({ id: user.id }, 'Utente registrato con successo!'));
  },

  // -----------------------------
  // POST /auth/login
  // Autenticar usuário e gerar token
  // -----------------------------

  async login(req, res) {

    const { email, password } = req.body;

    // Buscar usuário via model
    const user = await User.findByEmail(email);
    if (!user) {
      throw new AppError('Utente non trovato.', 401);
    }

    // Comparar senha com hash
    const match = await bcrypt.compare(password, user.password_hash);

    if (!match) {
      throw new AppError('Password errata.', 401);
    }

    // Gerar token JWT
    const token = jwt.sign(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: "1d" } // expira em 1 dia
    );

    res.json(formatResponse({ token, user: { id: user.id, role: user.role } }, 'Accesso autorizzato!'));
  },

  // -----------------------------
  // GET /auth/me
  // Retorna o usuário autenticado
  // -----------------------------
  async me(req, res) {
    const user = await User.getById(req.userId);

    if (!user) {
      throw new AppError('Utente non trovato.', 404);
    }

    res.json(formatResponse({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status
    }));
  }

};

