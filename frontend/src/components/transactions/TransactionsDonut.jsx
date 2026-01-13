// frontend/src/components/transactions/TransactionsDonut.jsx

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#16a34a', '#dc2626']; // verde / vermelho

export default function TransactionsDonut({ transactions, summary }) {
  // ------------------------
  // Dashboard: versão summary
  // ------------------------
  if (summary) {
    const income = summary.byType?.income || 0;
    const expense = summary.byType?.expense || 0;
    const currency = summary.currency || 'EUR';
    const data = [
      { name: 'Entrate', value: income },
      { name: 'Spese', value: expense }
    ];

    return <PieChartDonut data={data} currency={currency} />;
  }

  // ------------------------
  // Páginas antigas: transactions
  // ------------------------
  if (!Array.isArray(transactions) || transactions.length === 0) {
    return <p>Nessuna transazione</p>;
  }

  const income = transactions.filter((t) => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0);
  const expense = transactions.filter((t) => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0);
  const data = [
    { name: 'Entrate', value: income },
    { name: 'Spese', value: expense }
  ];

  return <PieChartDonut data={data} currency="" />;
}

// -----------------------------
// Componente PieChart genérico
// -----------------------------
const PieChartDonut = ({ data, currency }) => {
  const formatValue = (value) => {
    if (!currency) return value.toLocaleString('it-IT');

    return value.toLocaleString(currency === 'CHF' ? 'de-CH' : 'it-IT', {
      style: 'currency',
      currency
    });
  };

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={4}>
            {data.map((_, index) => (
              <Cell key={index} fill={COLORS[index]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => formatValue(value)} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
