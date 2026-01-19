// frontend/src/pages/Dashboard/FinanceDashboard

import { useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import useFetchList from '../../hooks/useFetchList';
import useFinanceSummary from '../../hooks/useFinanceSummary';

import BalanceOverview from '../../components/transactions/BalanceOverview';
import TransactionsDonut from '../../components/transactions/TransactionsDonut';
import TransactionTable from '../../components/transactions/TransactionTable';
import LogoutButton from '../../components/common/LogoutButton'

export default function FinanceDashboard() {
    const { user, activeUnit, setActiveUnit } = useContext(AuthContext);

    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const { items: transactions, loading, error } = useFetchList('/transactions', { unitId: activeUnit?.id });

    const { summary } = useFinanceSummary({ monthly: true, month, unitId: activeUnit?.id });

    const lastTransactions = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
    const monthLabel = new Date(`${month}-01`).toLocaleDateString('it-IT', { month: 'long', year: 'numeric' });

    return (
        <div style={{ padding: '20px', fontFamily: 'trebuchet ms, sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1>Cruscotto Finanziario</h1>
                <LogoutButton />
            </div>

            {/* Unidade ativa */}
            {user?.units?.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <label>Unità:</label>
                <select
                  value={activeUnit?.id || ''}
                  onChange={e => {
                    const selected = user.units.find(u => u.id === Number(e.target.value));
                    setActiveUnit(selected);
                    localStorage.setItem('activeUnitId', selected.id);
                  }}
                  style={{ marginLeft: '10px', padding: '5px' }}
                >
                  {user.units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
            )}

            <p style={{ color: '#6b7280', marginBottom: '20px' }}>Situazione di {monthLabel}</p>
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
