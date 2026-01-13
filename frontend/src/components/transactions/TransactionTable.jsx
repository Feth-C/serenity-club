// frontend/src/components/transactions/TransactionTable.jsx

import Table from '../common/Table';
import { Link } from 'react-router-dom';

export default function TransactionTable({ transactions, loading, onDelete }) {

    const columns = [
        { key: 'id', label: 'ID' },
        { key: 'date', label: 'Data' },
        { key: 'type', label: 'Tipo' },
        { key: 'category', label: 'Categoria' },
        { key: 'currency', label: 'Valuta' },
        { key: 'amount', label: 'Valore' },
        { key: 'member_name', label: 'Pagatore' },
        { key: 'created_by_name', label: 'Creatore' },
        { key: 'actions', label: 'Azioni' }
    ];

    if (loading) {
        return <p className="text-gray-500">Caricamento delle transazioni...</p>;
    }

    // Adiciona coluna de ações para cada transação
    const dataWithActions = transactions.map(t => ({
        ...t,
        actions: (
            <div className="flex gap-2">
                <Link to={`/transactions/${t.id}`} className="px-2 py-1 bg-yellow-500 text-white rounded">Modificare</Link>

                {onDelete && (
                    <button
                        onClick={() => onDelete(t.id)}
                        className="px-2 py-1 bg-red-500 text-white rounded"
                    >
                        Eliminare
                    </button>
                )}
            </div>
        )
    }));

    return (
        <Table
            columns={columns}
            data={dataWithActions}
        />
    );
}
