import { useState } from 'react';
import useReportsMonthly from '../../hooks/useReportsMonthly';
import TransactionsDonut from '../../components/transactions/TransactionsDonut';
import BalanceOverview from '../../components/transactions/BalanceOverview';

export default function ReportsMonthly() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const {
    currencies,
    transactions,
    totalIncome,
    totalExpense,
    totalBalance,
    loading,
    error,
    refetch
  } = useReportsMonthly({ startDate, endDate });

  return (
    <div style={{ padding: '20px' }}>
      <h1>Relatório Mensal</h1>

      {/* Filtro de datas */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input
          type="date"
          value={startDate}
          onChange={e => setStartDate(e.target.value)}
        />
        <input
          type="date"
          value={endDate}
          onChange={e => setEndDate(e.target.value)}
        />
        <button onClick={refetch}>Filtrar</button>
      </div>

      {loading && <p>Carregando...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!loading && !error && (
        <>
          {/* Overview */}
          <BalanceOverview
            transactions={transactions}
            totalIncome={totalIncome}
            totalExpense={totalExpense}
            totalBalance={totalBalance}
          />

          {/* Donut */}
          <TransactionsDonut
            transactions={transactions}
          />

          {/* Resumo por moeda */}
          <div style={{ marginTop: '20px' }}>
            <h2>Resumo por Moeda</h2>
            <ul>
              {Object.entries(currencies).map(([currency, data]) => (
                <li key={currency}>
                  <strong>{currency}:</strong> Income: {data.income.toFixed(2)}, Expense: {data.expense.toFixed(2)}, Balance: {data.balance.toFixed(2)}, Transações: {data.transactionsCount}
                </li>
              ))}
            </ul>
          </div>

          {/* Lista de transações */}
          <table style={{ width: '100%', marginTop: '20px', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Membro</th>
                <th>Tipo</th>
                <th>Categoria</th>
                <th>Moeda</th>
                <th>Valor</th>
                <th>Data</th>
                <th>Descrição</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(t => (
                <tr key={t.id}>
                  <td>{t.id}</td>
                  <td>{t.member_name}</td>
                  <td>{t.type}</td>
                  <td>{t.category}</td>
                  <td>{t.currency}</td>
                  <td>{t.amount.toFixed(2)}</td>
                  <td>{t.date}</td>
                  <td>{t.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
