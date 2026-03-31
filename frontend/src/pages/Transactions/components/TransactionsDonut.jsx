// frontend/src/pages/transactions/components/TransactionsDonut.jsx

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import "./TransactionsDonut.css";

export default function TransactionsDonut({ transactions, currency }) {
  if (!transactions?.length) return null;

  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const expense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const total = income + expense;

  const incomePercent = total ? (income / total) * 100 : 0;
  const expensePercent = total ? (expense / total) * 100 : 0;

  const data = [
    {
      name: "Entrate",
      value: income,
      percent: incomePercent,
      color: "var(--color-success)",
    },
    {
      name: "Uscite",
      value: expense,
      percent: expensePercent,
      color: "var(--color-danger)",
    },
  ];

  const formatCurrency = (value) =>
    new Intl.NumberFormat("it-IT", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
    }).format(value);

  return (
    <div className="donut-chart">
      <div className="donut-visual">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              innerRadius={75}
              outerRadius={100}
              paddingAngle={3}
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>

            <Tooltip
              formatter={(value) => formatCurrency(value)}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="donut-legend">
        {data.map((item, i) => (
          <div key={i} className="legend-item">
            <span
              className="legend-color"
              style={{ background: item.color }}
            />
            <span className="legend-label">{item.name}</span>
            <span className="legend-value">
              {item.percent.toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}