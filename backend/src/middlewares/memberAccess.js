// backend/src/middlewares/memberAccess.js

const Member = require('../models/Member');

module.exports = async function memberAccess(req, res, next) {
  const memberId = Number(req.params.memberId);
  const member = await Member.findById(memberId);

  if (!member) {
    return res.status(404).json({ error: 'Membro non trovato.' });
  }

  // ------------------------------
  // Admin pode acessar qualquer membro
  // ------------------------------
  if (req.userRole === 'admin') {
    req.member = member;
    return next();
  }

  // ------------------------------
  // Manager pode acessar se for dono
  // ------------------------------
  if (req.userRole === 'manager' && member.manager_id === req.userId) {
    req.member = member;
    return next();
  }

  // ------------------------------
  // Member só se for o próprio
  // ------------------------------
  if (req.userRole === 'member' && member.user_id === req.userId) {
    req.member = member;
    return next();
  }

  return res.status(403).json({ error: 'Accesso negato.' });
};
