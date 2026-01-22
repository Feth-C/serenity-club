// backend/src/controllers/DashboardController.js

const Member = require('../models/Member');
const MemberDocument = require('../models/MemberDocument');
const formatResponse = require('../utils/responseFormatter');
const { computeDocumentStatus } = require('../utils/statusHelper');
const AppError = require('../errors/AppError');

module.exports = {
  // -----------------------------
  // GET /dashboard/summary
  // -----------------------------
  async summary(req, res) {
    try {
      const { userId, userRole, activeUnitId } = req;

      if (!activeUnitId) {
        throw new AppError('Unità attiva non definita.', 400);
      }

      // -----------------------------
      // MEMBERS
      // -----------------------------
      let members = [];

      if (userRole === 'admin') {
        members = await Member.findAllByUnit(activeUnitId);

      } else if (userRole === 'manager') {
        members = await Member.findByManagerAndUnit(userId, activeUnitId);

      } else if (userRole === 'member') {
        const member = await Member.findByUserAndUnit(userId, activeUnitId);
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
      // DOCUMENTS
      // -----------------------------
      const memberIds = members.map(m => m.id);
      let documents = [];

      if (memberIds.length > 0) {
        documents = await MemberDocument.findByMembersAndUnit(memberIds, activeUnitId);
      }

      const documentsSummary = {
        total: documents.length,
        valid: documents.filter(d => computeDocumentStatus(d.expiration_date) === 'valid').length,
        expiring: documents.filter(d => computeDocumentStatus(d.expiration_date) === 'expiring').length,
        expired: documents.filter(d => computeDocumentStatus(d.expiration_date) === 'expired').length
      };

      return res.json(formatResponse({
        members: membersSummary,
        documents: documentsSummary
      }));

    } catch (err) {
      console.error('[DashboardController] summary error:', err);
      throw new AppError('Impossibile recuperare il riepilogo.', 500);
    }
  }
};
