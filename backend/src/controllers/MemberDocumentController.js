// backend/src/controllers/MemberDocumentController.js

const MemberDocument = require('../models/MemberDocument');
const Member = require('../models/Member');
const path = require('path');
const fs = require('fs');
const AppError = require('../errors/AppError');
const formatResponse = require('../utils/responseFormatter');

async function checkAccess(req, member_id) {
  const member = await Member.findById(member_id);
  if (!member) throw new AppError('Membro non trovato.', 404);

  if (req.userRole === 'admin') return member;
  if (req.userRole === 'manager' && member.manager_id === req.userId) return member;
  if (req.userRole === 'member' && member.user_id === req.userId) return member;

  throw new AppError('Accesso negato.', 403);
}

module.exports = {
  // -----------------------------
  // Criar documento para um membro
  // -----------------------------
  async create(req, res) {
    if (!req.file) throw new AppError('File richiesto.', 400);

    const member_id = parseInt(req.params.memberId);
    if (Number.isNaN(member_id)) throw new AppError('ID membro non valido.', 400);

    const member = await Member.findById(member_id);
    if (!member) throw new AppError('Membro non trovato.', 404);

    const isOwnerOrAdmin = req.userRole === 'admin' || member.manager_id === req.userId;
    if (!isOwnerOrAdmin) throw new AppError('Accesso negato.', 403);

    const relativePath = path.relative(path.join(__dirname, '../'), req.file.path);

    const doc = await MemberDocument.create({
      member_id,
      type: req.body.type,
      file_path: relativePath,
      expiration_date: req.body.expiration_date || null,
      notes: req.body.notes || null
    });

    res.status(201).json(formatResponse({ id: doc.id }, 'Documento creato con successo.'));
  },

  // -----------------------------
  // Listar documentos de um membro
  // -----------------------------
  async list(req, res) {
    const member_id = parseInt(req.params.memberId);
    await checkAccess(req, member_id);

    const { status, type } = req.query; // ADICIONADO junto com ",{ status, type });" abaixo

    const docs = await MemberDocument.findByMembers([member_id],{ status, type }
    );
    res.json(formatResponse(docs));
  },

  // -----------------------------
  // Listar documentos expirando
  // -----------------------------
  async listExpiring(req, res) {
    const days = Number(req.query.days || 30);
    const type = req.query.type || null;
    let docs;

    if (req.userRole === 'admin') docs = await MemberDocument.findAllExpiring(days, type);
    else if (req.userRole === 'manager') docs = await MemberDocument.findExpiringByManager(req.userId, days, type);
    else if (req.userRole === 'member') docs = await MemberDocument.findExpiringByMember(req.userId, days, type);
    else throw new AppError('Accesso negato.', 403);

    res.json(formatResponse(docs));
  },

  // -----------------------------
  // Obter documento pelo ID
  // -----------------------------
  async get(req, res) {
    const id = parseInt(req.params.id);
    const doc = await MemberDocument.findById(id);
    if (!doc) throw new AppError('Documento non trovato.', 404);

    await checkAccess(req, doc.member_id);

    res.json(formatResponse(doc));
  },

  // -----------------------------
  // Atualizar documento pelo ID
  // -----------------------------
  async update(req, res) {
    const id = parseInt(req.params.id);
    const existing = await MemberDocument.findById(id);
    if (!existing) throw new AppError('Documento non trovato.', 404);

    await checkAccess(req, existing.member_id);

    const { type, expiration_date, notes } = req.body;
    await MemberDocument.update(id, { type, expiration_date, notes });

    res.json(formatResponse(null, 'Documento aggiornato con successo.'));
  },

  // -----------------------------
  // Deletar documento pelo ID
  // -----------------------------
  async delete(req, res) {
    const id = parseInt(req.params.id);
    const doc = await MemberDocument.findById(id);
    if (!doc) throw new AppError('Documento non trovato.', 404);

    await checkAccess(req, doc.member_id);

    await MemberDocument.delete(id);
    res.json(formatResponse(null, 'Documento eliminato con successo.'));
  },

  // -----------------------------
  // Download de documento
  // -----------------------------
  async download(req, res) {
    const member_id = parseInt(req.params.memberId);
    const document_id = parseInt(req.params.id);

    const doc = await MemberDocument.findByIdAndMember(document_id, member_id);
    if (!doc) throw new AppError('Documento non trovato.', 404);

    await checkAccess(req, member_id);

    const absolutePath = path.resolve(path.join(__dirname, '../'), doc.file_path);
    if (!fs.existsSync(absolutePath)) throw new AppError('File non trovato sul server.', 404);

    res.download(absolutePath);
  }
};
