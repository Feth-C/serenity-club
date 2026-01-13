// backend/src/utils/statusHelper.js

module.exports = {
    computeDocumentStatus(expiration_date, days = 30) {
        if (!expiration_date) return 'valid';
        const today = new Date();
        const diff = Math.floor((new Date(expiration_date) - today) / (1000 * 60 * 60 * 24));
        if (diff < 0) return 'expired';
        if (diff <= days) return 'expiring';
        return 'valid';
    }
};
