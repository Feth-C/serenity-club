// frontend/src/pages/Reports/ReportsMonthly.jsx

import { useState } from 'react';
import useFinanceSummary from '../../hooks/useFinanceSummary';

export default function ReportsMonthly() {
  const [month, setMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );

  const { summary, loading, error } = useFinanceSummary({
    monthly: true,
    month
  });

  if (loading) return <p>Caricamento...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!summary) return null;

  const { byType, transactionsCount } = summary;

  // Organiza por moeda
  const currencies = new Set([
    ...Object.keys(byType.income || {}),
    ...Object.keys(byType.expense || {})
  ]);

  return (
    <div style={{ padding: 20 }}>
      <h1>📊 Rapporto mensile</h1>

      <div style={{ marginBottom: 20 }}>
        <label>Mese:</label>
        <input
          type="month"
          value={month}
          onChange={e => setMonth(e.target.value)}
          style={{ marginLeft: 10 }}
        />
      </div>

      <div style={{ display: 'flex', gap: 20 }}>
        {[...currencies].map(currency => {
          const income = byType.income?.[currency] || 0;
          const expense = byType.expense?.[currency] || 0;
          const balance = income - expense;

          return (
            <div key={currency} style={card}>
              <h3>{currency}</h3>
              <p>🟢 Entrate: {format(income, currency)}</p>
              <p>🔴 Spese: {format(expense, currency)}</p>
              <hr />
              <p><strong>💰 Balance: {format(balance, currency)}</strong></p>
            </div>
          );
        })}
      </div>

      <p style={{ marginTop: 20 }}>
        Totale movimenti: {transactionsCount}
      </p>
    </div>
  );
}

function format(value, currency) {
  return value.toLocaleString(
    currency === 'CHF' ? 'de-CH' : 'it-IT',
    { style: 'currency', currency }
  );
}

const card = {
  border: '1px solid #e5e7eb',
  padding: 15,
  borderRadius: 8,
  minWidth: 200
};
