// frontend/src/components/transactions/BalanceOverview.jsx

export default function BalanceOverview({ transactions, summary }) {
    // ------------------------
    // Dashboard: versão summary
    // ------------------------
    if (summary) {
        const { totalIncome = 0, totalExpense = 0, balance = 0, currency = 'EUR' } = summary;

        const formatCurrency = (value) =>
            value.toLocaleString(currency === 'CHF' ? 'de-CH' : 'it-IT', {
                style: 'currency',
                currency
            });

        return (
            <div style={cardContainer}>
                <Card title="🟢 Entrate" value={formatCurrency(totalIncome)} />
                <Card title="🔴 Spese" value={formatCurrency(totalExpense)} />
                <Card title="💲 Balance" value={formatCurrency(balance)} />
            </div>
        );
    }

    // ------------------------
    // Páginas antigas: transactions
    // ------------------------
    if (!Array.isArray(transactions) || transactions.length === 0) {
        return <p>Nessuna transazione</p>;
    }

    const groupByCurrency = (type) => {
        return transactions
            .filter((t) => t.type === type)
            .reduce((acc, t) => {
                acc[t.currency] = (acc[t.currency] || 0) + Number(t.amount);
                return acc;
            }, {});
    };

    const incomeByCurrency = groupByCurrency('income');
    const expenseByCurrency = groupByCurrency('expense');

    const formatCurrency = (value, currency) =>
        value.toLocaleString(currency === 'CHF' ? 'de-CH' : 'it-IT', {
            style: 'currency',
            currency
        });

    const currencies = Object.keys({ ...incomeByCurrency, ...expenseByCurrency });

    return (
        <div style={cardContainer}>
            <Card
                title="🟢 Entrate"
                value={currencies.map((curr) => formatCurrency(incomeByCurrency[curr] || 0, curr)).join(' | ')}
            />
            <Card
                title="🔴 Spese"
                value={currencies.map((curr) => formatCurrency(expenseByCurrency[curr] || 0, curr)).join(' | ')}
            />
            <Card
                title="💲 Balance"
                value={currencies
                    .map((curr) => {
                        const balance = (incomeByCurrency[curr] || 0) - (expenseByCurrency[curr] || 0);
                        return formatCurrency(balance, curr);
                    })
                    .join(' | ')}
            />
        </div>
    );
}

// -----------------------------
// Componentes auxiliares
// -----------------------------
const Card = ({ title, value }) => (
    <div style={cardStyle}>
        <p>{title}</p>
        <strong>{value}</strong>
    </div>
);

const cardContainer = {
    display: 'flex',
    gap: '20px',
    marginBottom: '30px'
};

const cardStyle = {
    padding: '15px',
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
    minWidth: '200px'
};
