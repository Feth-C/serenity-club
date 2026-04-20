// backend/src/controllers/ReportController.js

// backend/src/controllers/ReportController.js
const Report = require('../models/Report');
const AppError = require('../errors/AppError');
const formatResponse = require('../utils/responseFormatter');

module.exports = {

  async fetchData(req, res) {
    const { reportType } = req.params;
    const { startDate, endDate } = req.query;
    const unitId = req.activeUnitId;

    if (!startDate || !endDate) throw new AppError('Datas obrigatórias', 400);

    let rows;
    switch (reportType) {
      case 'sessions':
        rows = await Report.sessionsByPeriod({ unitId, startDate, endDate });
        break;
      case 'financial':
        rows = await Report.financialReport({ unitId, startDate, endDate });
        break;
      case 'operational':
        rows = await Report.operationalReport({ unitId, startDate, endDate });
        break;
      default:
        throw new AppError('Tipo de relatório inválido', 400);
    }

    res.json(formatResponse(rows));
  }
};
