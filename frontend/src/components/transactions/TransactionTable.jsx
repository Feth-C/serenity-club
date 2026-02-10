// frontend/src/components/transactions/TransactionTable.jsx

import Table from '../common/Table';
import { Link } from 'react-router-dom';

export default function TransactionTable({ transactions, loading, onDelete }) {

    // Mapeamento dos tipos para italiano
    const typeLabels = {
        income: 'Entrate',
        expense: 'Spese'
    };

    const columns = [
        { key: 'id', label: 'ID' },
        { key: 'type', label: 'Tipo' },
        { key: 'amount', label: 'Valore' },
        { key: 'payer_name', label: 'Pagatore' },
        { key: 'category', label: 'Categoria' },
        { key: 'date', label: 'Data' },
        { key: 'actions', label: 'Azioni' }
    ];

    if (loading) {
        return <p style={{ color: '#666' }}>Caricamento delle transazioni...</p>;
    }

    const dataWithActions = transactions.map(t => {
        const formatCurrency = (value, currency) => {
            const locale = currency === 'CHF' ? 'de-CH' : 'it-IT';
            return new Intl.NumberFormat(locale, {
                style: 'currency',
                currency,
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(value);
        };

        return {
            ...t,
            type: typeLabels[t.type] || t.type,
            amount: formatCurrency(Number(t.amount), t.currency),
            actions: (
                <div style={{ display: 'flex', gap: '8px' }}>
                    <Link
                        to={`/transactions/${t.id}`}
                        style={{
                            padding: '4px 8px',
                            backgroundColor: '#1a347a',
                            color: '#fff',
                            borderRadius: '4px',
                            textDecoration: 'none'
                        }}
                    >
                        Modificare
                    </Link>
                    
                    {onDelete && (
                        <button
                            onClick={() => onDelete(t.id)}
                            style={{
                                padding: '4px 8px',
                                backgroundColor: '#ef4444',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                        >
                            Eliminare
                        </button>
                    )}
                </div>
            )
        };
    });

    return (
        <Table
            columns={columns}
            data={dataWithActions}
        />
    );
}
