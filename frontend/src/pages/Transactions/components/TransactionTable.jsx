// frontend/src/pages/transactions/components/TransactionTable.jsx

import Table from '../../../components/ui/Table/Table';
import { Link } from 'react-router-dom';
import Button from '../../../components/ui/Button/Button';

export default function TransactionTable({ transactions, loading, onDelete }) {

    if (loading) {
        return <p style={{ color: '#666', textAlign: 'center', margin: '20px 0' }}>Caricamento delle transazioni...</p>;
    }

    const typeLabels = {
        income: { label: 'Entrate', color: 'var(--color-success)' },
        expense: { label: 'Spese', color: 'var(--color-danger)' }
    };

    const columns = [
        { key: 'id', label: 'ID' },
        { key: 'type', label: 'Tipo' },
        { key: 'amount', label: 'Valore' },
        { key: 'currency', label: 'Valuta' },
        { key: 'payer_name', label: 'Pagatore' },
        { key: 'category', label: 'Categoria' },
        { key: 'date', label: 'Data' },
        { key: 'actions', label: 'Azioni' }
    ];

    const formatCurrency = (value, currency) => {
        const locale = currency === 'CHF' ? 'de-CH' : 'it-IT';
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(value);
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const getCategoryColor = (category) => {
        // Pequena lógica para cores consistentes por categoria
        const colors = ['#FFB547', '#6FCF97', '#56CCF2', '#BB6BD9', '#F2994A', '#2D9CDB'];
        let hash = 0;
        for (let i = 0; i < category.length; i++) hash += category.charCodeAt(i);
        return colors[hash % colors.length];
    };

    const dataWithActions = transactions.map(t => ({
        ...t,
        type: (
            <span style={{ color: typeLabels[t.type]?.color || '#000', fontWeight: '600' }}>
                {typeLabels[t.type]?.label || t.type}
            </span>
        ),
        amount: (
            <span style={{ color: t.type === 'income' ? 'var(--color-success)' : 'var(--color-danger)', fontWeight: '600' }}>
                {formatCurrency(Number(t.amount), t.currency)}
            </span>
        ),
        category: (
            <span
                style={{
                    display: 'inline-block',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    backgroundColor: getCategoryColor(t.category),
                    color: '#fff',
                    fontSize: '0.75rem',
                    fontWeight: '600'
                }}
            >
                {t.category}
            </span>
        ),
        date: formatDate(t.date),
        actions: (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <Link to={`/transactions/${t.id}`}>
                    <Button size="sm" variant="secondary">Modificare</Button>
                </Link>
                {onDelete && (
                    <Button
                        size="sm"
                        variant="danger"
                        onClick={() => onDelete(t.id)}
                    >
                        Eliminare
                    </Button>
                )}
            </div>
        )
    }));

    return (
        <Table
            columns={columns}
            data={dataWithActions}
            responsive
            striped
            hover
        />
    );
}