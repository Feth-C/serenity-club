// backend/src/controllers/DashboardController.js

const Member = require('../models/Member');
const MemberDocument = require('../models/MemberDocument');
const formatResponse = require('../utils/responseFormatter');
const AppError = require('../errors/AppError');

// Função auxiliar para determinar status do documento
function getDocumentStatus(expiration_date, days = 30) {
  if (!expiration_date) return 'valid';
  const today = new Date();
  const diff = Math.floor((new Date(expiration_date) - today) / (1000 * 60 * 60 * 24));
  if (diff < 0) return 'expired';
  if (diff <= days) return 'expiring';
  return 'valid';
}

module.exports = {

  // -----------------------------
  // GET /dashboard/summary
  // Retorna resumo de members e documents
  // -----------------------------
  async summary(req, res) {
    try {
      // -----------------------------
      // Members
      // -----------------------------
      let members = [];
      if (req.userRole === 'admin') {
        members = await Member.findAll(); // todos os membros
      } else if (req.userRole === 'manager') {
        members = await Member.findByManager(req.userId); // apenas próprios
      } else if (req.userRole === 'member') {
        const member = await Member.findByUserId(req.userId);
        if (member) members = [member];
      } else {
        throw new AppError('Accesso negato.', 403);
      }

      const membersSummary = {
        total: members.length,
        active: members.filter(m => m.status === 'active').length,
        inactive: members.filter(m => m.status === 'inactive').length
      };

      // -----------------------------
      // Documents
      // -----------------------------
      const memberIds = members.map(m => m.id);
      let documents = [];
      if (memberIds.length > 0) {
        documents = await MemberDocument.findByMembers(memberIds); // todos docs dos membros
      }

      const documentsSummary = {
        total: documents.length,
        valid: documents.filter(d => getDocumentStatus(d.expiration_date) === 'valid').length,
        expiring: documents.filter(d => getDocumentStatus(d.expiration_date) === 'expiring').length,
        expired: documents.filter(d => getDocumentStatus(d.expiration_date) === 'expired').length
      };

      res.json(formatResponse({
        members: membersSummary,
        documents: documentsSummary
      }));

    } catch (err) {
      console.error('Errore nel dashboard summary:', err);
      throw new AppError('Impossibile recuperare il riepilogo.', 500);
    }
  }

};
