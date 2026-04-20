// backend/src/utils/documentEngine.js

const getDocumentStatus = (expire_date) => {

  if (!expire_date) {
    return 'valid';
  }

  const today = new Date();
  const expire = new Date(expire_date);

  const diffDays = Math.ceil((expire - today) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return 'expired';
  }

  if (diffDays <= 30) {
    return 'expiring';
  }

  return 'valid';
};

module.exports = {
  getDocumentStatus
};