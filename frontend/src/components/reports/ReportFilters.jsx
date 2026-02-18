// frontend/src/components/reports/ReportFilters.jsx

import React from "react";
import SessionFilters from "./SessionFilters";

const ReportFilters = ({
  reportType,
  setReportType,
  filters,
  setFilters,
  onApply
}) => {
  return (
    <div
      style={{
        background: "#867e61",
        padding: "20px",
        borderRadius: "8px",
        marginBottom: "10px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.08)"
      }}
    >
      {/* ========================= */}
      {/* REPORT TYPE              */}
      {/* ========================= */}

      <div style={{ marginBottom: "15px" }}>
        <label style={{ fontWeight: "600", marginRight: "10px" }}>
          Tipo di rapporto:
        </label>

        <select
          value={reportType}
          onChange={(e) => setReportType(e.target.value)}
          style={{ padding: "6px 10px" }}
        >
          <option value="sessions">Sessioni</option>
          <option value="financial">Finanziario</option>
          <option value="operational">Operativo</option>
        </select>
      </div>

      {/* ========================= */}
      {/* DYNAMIC FILTER AREA      */}
      {/* ========================= */}

      <div
        style={{
          display: "flex",
          gap: "20px",
          flexWrap: "wrap",
          alignItems: "flex-end"
        }}
      >
        {reportType === "sessions" && (
          <SessionFilters
            filters={filters}
            setFilters={setFilters}
          />
        )}

        {/* FUTURO:
            {reportType === "financial" && <FinancialFilters />}
            {reportType === "operational" && <OperationalFilters />}
        */}

        {/* APPLY BUTTON */}
        <div>
          <button
            onClick={onApply}
            style={{
              padding: "8px 16px",
              backgroundColor: "#000",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            Applica filtri
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportFilters;
