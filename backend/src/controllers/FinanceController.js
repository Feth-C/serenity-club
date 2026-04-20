// backend/src/controllers/FinanceController.js

const Transaction = require('../models/Transaction');

function parseMonthRange(month) {
  // month = "2026-01"
  const start = new Date(`${month}-01`);
  const end = new Date(start);
  end.setMonth(end.getMonth() + 1);
  return { start, end };
}

const FinanceController = {
  // -----------------------------
  // Resumo geral (todas as transações da unidade)
  // -----------------------------
  async summary(req, res) {
    try {
      const { userId, userRole, activeUnitId } = req;
      if (!activeUnitId) return res.status(400).json({ error: 'Unità attiva non definita.' });

      let transactions = [];
      if (userRole === 'admin') {
        transactions = await Transaction.findAllByUnit(activeUnitId);
      } else if (userRole === 'manager') {
        transactions = await Transaction.findByManagerAndUnit(userId, activeUnitId);
      } else {
        return res.status(403).json({ error: 'Accesso negato.' });
      }

      const byType = { income: {}, expense: {} };
      const byCategory = {};
      let totalIncome = 0;
      let totalExpense = 0;

      transactions.forEach(tx => {
        const amount = Number(tx.amount);

        if (!byType[tx.type][tx.currency]) byType[tx.type][tx.currency] = 0;
        byType[tx.type][tx.currency] += amount;

        if (tx.type === 'income') totalIncome += amount;
        else totalExpense += amount;

        if (!byCategory[tx.category]) byCategory[tx.category] = 0;
        byCategory[tx.category] += amount;
      });

      return res.json({
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense,
        byType,
        byCategory,
        transactionsCount: transactions.length
      });

    } catch (error) {
      console.error('Errore nel riepilogo finanziario:', error);
      return res.status(500).json({ error: 'Errore nel riepilogo finanziario' });
    }
  },

  // -----------------------------
  // Resumo mensal
  // /finance/monthly?month=2026-01
  // -----------------------------
  async monthlySummary(req, res) {
    try {
      const { userId, userRole, activeUnitId } = req;
      if (!activeUnitId) return res.status(400).json({ error: 'Unità attiva non definita.' });

      const { month } = req.query;
      if (!month) return res.status(400).json({ error: 'Il mese (AAAA-MM) è obbligatorio.' });

      const { start, end } = parseMonthRange(month);

      let transactions = [];
      if (userRole === 'admin') {
        transactions = await Transaction.findAllByUnit(activeUnitId);
      } else if (userRole === 'manager') {
        transactions = await Transaction.findByManagerAndUnit(userId, activeUnitId);
      } else {
        return res.status(403).json({ error: 'Accesso negato.' });
      }

      const monthlyTx = transactions.filter(tx => {
        const txDate = new Date(tx.date);
        return txDate >= start && txDate < end;
      });

      const byType = { income: {}, expense: {} };
      let totalIncome = 0;
      let totalExpense = 0;

      monthlyTx.forEach(tx => {
        const amount = Number(tx.amount);
        if (!byType[tx.type][tx.currency]) byType[tx.type][tx.currency] = 0;
        byType[tx.type][tx.currency] += amount;

        if (tx.type === 'income') totalIncome += amount;
        else totalExpense += amount;
      });

      return res.json({
        month,
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense,
        byType,
        transactionsCount: monthlyTx.length
      });

    } catch (error) {
      console.error('Errore nel riepilogo finanziario mensile.:', error);
      return res.status(500).json({ error: 'Errore nel riepilogo mensile' });
    }
  }
};

module.exports = FinanceController;
