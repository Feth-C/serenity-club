// frontend/src/components/transactions/BalanceOverview.jsx

export default function BalanceOverview({ transactions, summary }) {

    // -----------------------------
    // FORMATAÇÃO PADRÃO ÚNICA
    // -----------------------------
    const formatCurrency = (value, currency = 'EUR') => {
        const locale = currency === 'CHF' ? 'de-CH' : 'it-IT';

        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(value);
    };

    // -----------------------------
    // DASHBOARD (quando vem summary do backend)
    // -----------------------------
    if (summary) {
        const {
            totalIncome = 0,
            totalExpense = 0,
            balance = 0,
            currency = 'EUR'
        } = summary;

        return (
            <div style={cardContainer}>
                <Card title="🟢 Entrate" value={formatCurrency(totalIncome, currency)} />
                <Card title="🔴 Spese" value={formatCurrency(totalExpense, currency)} />
                <Card title="💲 Balance" value={formatCurrency(balance, currency)} />
            </div>
        );
    }

    // -----------------------------
    // PÁGINA ANTIGA (lista de transações)
    // -----------------------------
    if (!Array.isArray(transactions) || transactions.length === 0) {
        return <p>Nessuna transazione</p>;
    }

    const groupByCurrency = (type) =>
        transactions
            .filter(t => t.type === type)
            .reduce((acc, t) => {
                acc[t.currency] = (acc[t.currency] || 0) + Number(t.amount);
                return acc;
            }, {});

    const incomeByCurrency = groupByCurrency('income');
    const expenseByCurrency = groupByCurrency('expense');

    const currencies = Object.keys({
        ...incomeByCurrency,
        ...expenseByCurrency
    });

    return (
        <div style={cardContainer}>

            <Card
                title="🟢 Entrate"
                value={
                    currencies
                        .map(curr =>
                            formatCurrency(incomeByCurrency[curr] || 0, curr)
                        )
                        .join('  |  ')
                }
            />

            <Card
                title="🔴 Spese"
                value={
                    currencies
                        .map(curr =>
                            formatCurrency(expenseByCurrency[curr] || 0, curr)
                        )
                        .join('  |  ')
                }
            />

            <Card
                title="💲 Balance"
                value={
                    currencies
                        .map(curr => {
                            const balance =
                                (incomeByCurrency[curr] || 0) -
                                (expenseByCurrency[curr] || 0);
                            return formatCurrency(balance, curr);
                        })
                        .join('  |  ')
                }
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
    marginBottom: '30px',
    flexWrap: 'wrap'
};

const cardStyle = {
    padding: '15px',
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
    minWidth: '220px'
};
