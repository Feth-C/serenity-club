// frontend/src/components/reports/SessionFilters.jsx

import React, { useState } from "react";

const SessionFilters = ({ filters, setFilters }) => {
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const handleChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <>
      {/* ============================= */}
      {/* LINHA PRINCIPAL (COMPACTA)  */}
      {/* ============================= */}
      <div>
        <label>Data inizio</label>
        <input
          type="datetime-local"
          value={filters.startDate || ""}
          onChange={(e) => handleChange("startDate", e.target.value)}
        />
      </div>

      <div>
        <label>Data fine</label>
        <input
          type="datetime-local"
          value={filters.endDate || ""}
          onChange={(e) => handleChange("endDate", e.target.value)}
        />
      </div>

      <div>
        <label>Stato</label>
        <select
          value={filters.status || ""}
          onChange={(e) => handleChange("status", e.target.value)}
        >
          <option value="">Tutti</option>
          <option value="open">Open</option>
          <option value="closed">Closed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* BOTÃO AVANÇADO */}
      <div>
        <button
          type="button"
          onClick={() => setAdvancedOpen(!advancedOpen)}
          style={{
            padding: "6px 12px",
            background: "#ddd",
            border: "1px solid #ccc",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          {advancedOpen ? "Avanzato ▲" : "Avanzato ▼"}
        </button>
      </div>

      {/* ============================= */}
      {/* FILTROS AVANÇADOS           */}
      {/* ============================= */}
      {advancedOpen && (
        <>
          <div>
            <label>ID</label>
            <input
              type="number"
              value={filters.id || ""}
              onChange={(e) => handleChange("id", e.target.value)}
            />
          </div>

          <div>
            <label>Client Name</label>
            <input
              type="text"
              value={filters.client_name || ""}
              onChange={(e) => handleChange("client_name", e.target.value)}
            />
          </div>

          <div>
            <label>Client ID</label>
            <input
              type="number"
              value={filters.client_id || ""}
              onChange={(e) => handleChange("client_id", e.target.value)}
            />
          </div>

          <div>
            <label>Planned Minutes</label>
            <input
              type="number"
              value={filters.planned_minutes || ""}
              onChange={(e) =>
                handleChange("planned_minutes", e.target.value)
              }
            />
          </div>

          <div>
            <label>Planned Amount</label>
            <input
              type="number"
              value={filters.planned_amount || ""}
              onChange={(e) =>
                handleChange("planned_amount", e.target.value)
              }
            />
          </div>

          <div>
            <label>Paid Amount</label>
            <input
              type="number"
              value={filters.paid_amount || ""}
              onChange={(e) =>
                handleChange("paid_amount", e.target.value)
              }
            />
          </div>

          <div>
            <label>Created By</label>
            <input
              type="text"
              value={filters.created_by || ""}
              onChange={(e) => handleChange("created_by", e.target.value)}
            />
          </div>

          <div>
            <label>Visit Type</label>
            <select
              value={filters.visit_type || ""}
              onChange={(e) => handleChange("visit_type", e.target.value)}
            >
              <option value="">Tutti</option>
              <option value="first">First</option>
              <option value="return">Return</option>
            </select>
          </div>

          <div>
            <label>Payment Method</label>
            <input
              type="text"
              value={filters.payment_method || ""}
              onChange={(e) =>
                handleChange("payment_method", e.target.value)
              }
            />
          </div>

          <div>
            <label>Expected End From</label>
            <input
              type="datetime-local"
              value={filters.expected_end_from || ""}
              onChange={(e) =>
                handleChange("expected_end_from", e.target.value)
              }
            />
          </div>

          <div>
            <label>Expected End To</label>
            <input
              type="datetime-local"
              value={filters.expected_end_to || ""}
              onChange={(e) =>
                handleChange("expected_end_to", e.target.value)
              }
            />
          </div>
        </>
      )}
    </>
  );
};

export default SessionFilters;
