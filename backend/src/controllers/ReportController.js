// backend/src/controllers/ReportController.js

const Transaction = require('../models/Transaction');

const generateMonthly = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    console.log('=== ReportController Monthly ===');
    console.log('Period:', start_date || 'início', '→', end_date || 'fim');

    const transactions = await Transaction.findAll({
      start_date,
      end_date
    });

    // Agrupamento por moeda
    const currencies = {};
    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach(t => {
      if (!currencies[t.currency]) {
        currencies[t.currency] = {
          income: 0,
          expense: 0,
          balance: 0,
          transactionsCount: 0
        };
      }

      if (t.type === 'income') {
        currencies[t.currency].income += t.amount;
        totalIncome += t.amount;
      } else if (t.type === 'expense') {
        currencies[t.currency].expense += t.amount;
        totalExpense += t.amount;
      }

      currencies[t.currency].transactionsCount += 1;
      currencies[t.currency].balance = currencies[t.currency].income - currencies[t.currency].expense;
    });

    const totalBalance = totalIncome - totalExpense;

    console.log('=== Monthly Report ===');
    console.log('Currencies:', currencies);
    console.log('Transactions:', transactions);
    console.log('Total Income:', totalIncome);
    console.log('Total Expense:', totalExpense);
    console.log('Total Balance:', totalBalance);

    res.json({
      currencies,
      transactions,
      totalIncome,
      totalExpense,
      totalBalance
    });
  } catch (err) {
    console.error('Erro no monthly report:', err);
    res.status(500).json({ message: 'Erro inesperado' });
  }
};

module.exports = {
  generateMonthly
};
