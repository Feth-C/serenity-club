// frontend/src/componentes/transactions/TransactionFilters.jsx

export default function TransactionFilters({ filters, setFilters, transactions = [] }) {

    // Categorias únicas existentes
    const categories = [
        ...new Set(
            transactions
                .map(t => t.category)
                .filter(Boolean)
        )
    ];

    const handleChange = (e) => {
        setFilters({
            ...filters,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">

            {/* Tipo */}
            <select
                name="type"
                value={filters.type}
                onChange={handleChange}
            >
                <option value="">Tutti i tipi</option>
                <option value="income">🟢 Entrate</option>
                <option value="expense">🔴 Spese</option>
            </select>

            {/* Categoria */}
            <select
                name="category"
                value={filters.category}
                onChange={handleChange}
            >
                <option value="">Tutte le categorie</option>
                {categories.map(cat => (
                    <option key={cat} value={cat}>
                        {cat}
                    </option>
                ))}
            </select>

            {/* Data inicial */}
            <input
                type="date"
                name="start_date"
                value={filters.start_date}
                onChange={handleChange}
            />

            {/* Data final */}
            <input
                type="date"
                name="end_date"
                value={filters.end_date}
                onChange={handleChange}
            />

            {/* Membro */}
            <input
                type="number"
                name="member_id"
                value={filters.member_id}
                onChange={handleChange}
                placeholder="ID membro"
            />
        </div>
    );
}
