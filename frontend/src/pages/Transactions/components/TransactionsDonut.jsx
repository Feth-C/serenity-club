// frontend/src/pages/transactions/components/TransactionsDonut.jsx

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import "./TransactionsDonut.css";

export default function TransactionsDonut({ stats, currency }) {
  // Agora recebemos 'stats' em vez de 'transactions'
  if (!stats) return null;

  const income = Number(stats.total_income || 0);
  const expense = Number(stats.total_expense || 0);
  const total = income + expense;

  if (total === 0) return <p className="text-muted text-center">Nessun dato</p>;

  const data = [
    {
      name: "Entrate",
      value: income,
      percent: (income / total) * 100,
      color: "var(--color-success)",
    },
    {
      name: "Uscite",
      value: expense,
      percent: (expense / total) * 100,
      color: "var(--color-danger)",
    },
  ];

  const formatCurrency = (value) =>
    new Intl.NumberFormat("it-IT", {
      style: "currency",
      currency: currency,
    }).format(value);

  return (
    <div className="donut-chart">
      <div className="donut-visual">
        <ResponsiveContainer width="100%" height={150}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              innerRadius={50}
              outerRadius={70}
              paddingAngle={5}
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => formatCurrency(value)} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="donut-legend">
        {data.map((item, i) => (
          <div key={i} className="legend-item">
            <span className="legend-color" style={{ background: item.color }} />
            <span className="legend-label">{item.name}</span>
            <span className="legend-value">{item.percent.toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}