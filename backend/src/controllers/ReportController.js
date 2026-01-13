// backend/src/controllers/ReportController.js

const Transaction = require('../models/Transaction');

const ReportController = {
  // 📊 Relatório mensal
  async monthly(req, res) {
    try {
      const { month } = req.query; // YYYY-MM
      if (!month) {
        return res.status(400).json({ error: 'O mês (AAAA-MM) é obrigatório' });
      }

      let transactions = await Transaction.findAll(); // Filtro por mês se informado 
      if (month) { transactions = transactions.filter(tx => tx.date.startsWith(month) ); }

      const report = {}; 
    
      transactions.forEach(tx => {
        const currency = tx.currency || 'EUR';

        if (!report[currency]) {
          report[currency] = { income: 0, expense: 0, balance: 0 };
        }

        if (tx.type === 'income') report[currency].income += amount;
        if (tx.type === 'expense') report[currency].expense += amount;
      });

      // Calcula saldo por moeda
      Object.keys(report).forEach(currency => {
        report[currency].balance = report[currency].income - report[currency].expense;
      });

      return res.json({
        month,
        report,
        transactionsCount: transactions.length
      });

    } catch (error) {
      console.error('Errore nel report mensile:', error);
      return res.status(500).json({ error: 'Errore nel report mensile' });
    }
  }
};

module.exports = ReportController;
