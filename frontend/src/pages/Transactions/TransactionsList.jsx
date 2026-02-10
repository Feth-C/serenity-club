// frontend/src/pages/Transactions/TransactionsList.jsx

import { useState } from 'react';
import { Link } from 'react-router-dom';
import useFetchList from '../../hooks/useFetchList';
import BackButton from '../../components/common/BackButton';

import BalanceOverview from '../../components/transactions/BalanceOverview';
import TransactionFilters from '../../components/transactions/TransactionFilters';
import TransactionTable from '../../components/transactions/TransactionTable';
import TransactionsDonut from '../../components/transactions/TransactionsDonut';

const TransactionsList = () => {
    const [currency, setCurrency] = useState('EUR');
    const [filters, setFilters] = useState({
        type: '',
        category: '',
        start_date: '',
        end_date: '',
        payer_name: ''
    });

    const {
        items: transactions,
        loading,
        error,
        page,
        totalPages,
        setPage,
        refetch
    } = useFetchList('/transactions');

    // Aplicando filtros localmente
    const filteredTransactions = transactions.filter(t => {
        const matchesCurrency = !currency || t.currency === currency;
        const matchesType = !filters.type || t.type === filters.type;
        const matchesCategory = !filters.category || t.category === filters.category;

        // Filtra qualquer pagador (member, client ou ad-hoc)
        const matchesPayer = !filters.payer_name ||
            (t.payer_name && t.payer_name.toLowerCase().includes(filters.payer_name.toLowerCase()));

        const matchesStart = !filters.start_date || new Date(t.date) >= new Date(filters.start_date);
        const matchesEnd = !filters.end_date || new Date(t.date) <= new Date(filters.end_date);

        return matchesCurrency && matchesType && matchesCategory && matchesPayer && matchesStart && matchesEnd;
    });

    return (
        <div style={{ padding: '20px' }}>
            {/* BOTÃO VOLTAR */}
            <BackButton />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1>Transazioni</h1>
                <Link to="/transactions/new" >+ Nuova transazione</Link>
            </div>

            {/* BALANCE OVERVIEW */}
            <BalanceOverview transactions={filteredTransactions} />

            {/* RESUMO GRÁFICO */}
            <TransactionsDonut
                transactions={filteredTransactions}
                currency={currency}
            />

            {/* SELETOR DE MOEDAS */}
            <select value={currency} onChange={e => setCurrency(e.target.value)}>
                <option value="">Tutte le Valute</option>
                <option value="EUR">EUR (€)</option>
                <option value="CHF">CHF (CHF)</option>
            </select>

            {/* FILTROS */}
            <TransactionFilters
                filters={filters}
                setFilters={setFilters}
                transactions={transactions}
            />

            {/* TABELA */}
            <TransactionTable
                transactions={filteredTransactions}
                loading={loading}
            />

            {/* PAGINAÇÃO */}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px', gap: '20px' }}>
                <button disabled={page <= 1} onClick={() => setPage(page - 1)}>Precedente</button>
                <span>Pagina {page} di {totalPages}</span>
                <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Successiva</button>
            </div>

            {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
        </div>
    );
};

export default TransactionsList;
