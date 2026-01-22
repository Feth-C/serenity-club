// frontend/src/pages/Dashboard/FinanceDashboard.jsx

import { useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import useFetchList from '../../hooks/useFetchList';
import useFinanceSummary from '../../hooks/useFinanceSummary';

import BalanceOverview from '../../components/transactions/BalanceOverview';
import TransactionsDonut from '../../components/transactions/TransactionsDonut';
import TransactionTable from '../../components/transactions/TransactionTable';
import LogoutButton from '../../components/common/LogoutButton';

export default function FinanceDashboard() {
  const { user, activeUnit } = useContext(AuthContext);

  const unitParam = activeUnit?.id || undefined; // undefined = todas unidades
  const { items: transactions, loading, error } = useFetchList('/transactions', { unitId: unitParam });
  const { summary } = useFinanceSummary({ unitId: unitParam });

  const lastTransactions = [...transactions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  return (
    <div style={{ padding: '20px', fontFamily: 'trebuchet ms, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Cruscotto Finanziario</h1>
        <LogoutButton />
      </div>

      <p style={{ color: '#6b7280', marginBottom: '20px' }}>
        {activeUnit ? `Unità: ${activeUnit.name}` : 'Tutte le sedi'}
      </p>

      <BalanceOverview transactions={transactions} />
      <TransactionsDonut transactions={transactions} currency="" />

      <div style={{ marginTop: '30px' }}>
        <h2>Ultime transazioni</h2>
        <TransactionTable transactions={lastTransactions} loading={loading} />
        <div style={{ marginTop: '10px' }}>
          <Link to="/transactions">Vedi tutte le transazioni →</Link>
        </div>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}
