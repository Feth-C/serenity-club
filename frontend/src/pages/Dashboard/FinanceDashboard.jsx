import { Link } from 'react-router-dom';
import useFetchList from '../../hooks/useFetchList';
import useFinanceSummary from '../../hooks/useFinanceSummary';

import BalanceOverview from '../../components/transactions/BalanceOverview';
import TransactionsDonut from '../../components/transactions/TransactionsDonut';
import TransactionTable from '../../components/transactions/TransactionTable';

export default function FinanceDashboard() {
    // -----------------------------
    // Mês atual automático (YYYY-MM)
    // -----------------------------
    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    // -----------------------------
    // Todas as transações (fonte de verdade)
    // -----------------------------
    const {
        items: transactions,
        loading,
        error
    } = useFetchList('/transactions');

    // -----------------------------
    // Resumo mensal (somente para título / contexto)
    // -----------------------------
    const { summary } = useFinanceSummary({
        monthly: true,
        month
    });

    // -----------------------------
    // Últimas 5 transações
    // -----------------------------
    const lastTransactions = [...transactions]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);

    // -----------------------------
    // Nome do mês (italiano)
    // -----------------------------
    const monthLabel = new Date(`${month}-01`).toLocaleDateString('it-IT', {
        month: 'long',
        year: 'numeric'
    });

    return (
        <div style={{ padding: '20px' }}>
            <h1>Cruscotto Finanziario</h1>
            <p style={{ color: '#6b7280', marginBottom: '20px' }}>
                Situazione di {monthLabel}
            </p>

            {/* RESUMO FINANCEIRO (multi-moeda) */}
            <BalanceOverview transactions={transactions} />

            {/* DONUT (multi-moeda somado) */}
            <TransactionsDonut
                transactions={transactions}
                currency=""   // vazio = mostra números quando há várias moedas
            />

            {/* ÚLTIMAS TRANSAÇÕES */}
            <div style={{ marginTop: '30px' }}>
                <h2>Ultime transazioni</h2>

                <TransactionTable
                    transactions={lastTransactions}
                    loading={loading}
                />

                <div style={{ marginTop: '10px' }}>
                    <Link to="/transactions">
                        Vedi tutte le transazioni →
                    </Link>
                </div>
            </div>

            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
}
