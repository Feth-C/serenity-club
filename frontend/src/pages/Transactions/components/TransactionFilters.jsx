// frontend/src/pages/transactions/components/TransactionFilters.jsx

import { useMemo } from "react";
import Button from "../../../components/ui/Button/Button"; // Importando seu componente de botão
import "./TransactionFilters.css";

export default function TransactionFilters({ filters, setFilters, transactions = [], onExport }) {

  const categories = useMemo(() => {
    return [...new Set(transactions.map(t => t.category).filter(Boolean))];
  }, [transactions]);

  const currencies = useMemo(() => {
    return [...new Set(transactions.map(t => t.currency).filter(Boolean))];
  }, [transactions]);

  const handleChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const handleReset = () => {
    setFilters({
      type: "",
      category: "",
      start_date: "",
      end_date: "",
      payer_name: "",
      member_id: "",
      currency: ""
    });
  };

  return (
    <div className="transaction-filters-container">
      <div className="transaction-filters-grid">
        {/* Tipo */}
        <div className="filter-item">
          <label>Tipo</label>
          <select name="type" value={filters.type} onChange={handleChange}>
            <option value="">Tutti i tipi</option>
            <option value="income">🟢 Entrate</option>
            <option value="expense">🔴 Spese</option>
          </select>
        </div>

        {/* Moeda */}
        <div className="filter-item">
          <label>Valuta</label>
          <select name="currency" value={filters.currency} onChange={handleChange}>
            <option value="">Tutte le valute</option>
            {currencies.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Data inicial */}
        <div className="filter-item">
          <label>Data Inizio</label>
          <input type="date" name="start_date" value={filters.start_date} onChange={handleChange} />
        </div>

        {/* Data final */}
        <div className="filter-item">
          <label>Data Fine</label>
          <input type="date" name="end_date" value={filters.end_date} onChange={handleChange} />
        </div>

        {/* Categoria */}
        <div className="filter-item">
          <label>Categoria</label>
          <select name="category" value={filters.category} onChange={handleChange}>
            <option value="">Tutte le categorie</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Pagador */}
        <div className="filter-item">
          <label>Pagatore</label>
          <input
            type="text"
            name="payer_name"
            value={filters.payer_name || ""}
            onChange={handleChange}
            placeholder="Nome"
          />
        </div>
      </div>

      {/* NOVA SEÇÃO DE AÇÕES DO FILTRO */}
      <div className="filter-actions">
        <div className="export-group">
          <Button variant="secondary" onClick={() => onExport('csv')}>
            📥 Export CSV
          </Button>
          <Button variant="secondary" onClick={() => onExport('pdf')}>
            📄 Export PDF
          </Button>
        </div>

        <button className="btn-reset-filters" onClick={handleReset}>
          Reset Filtri
        </button>
      </div>
    </div>
  );
}