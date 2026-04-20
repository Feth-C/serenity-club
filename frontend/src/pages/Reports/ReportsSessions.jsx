// frontend/src/pages/Reports/ReportsSessions.jsx

import React, { useState } from "react";
import useReports, { reportColumnsConfig } from "../../hooks/useReports";
import ReportFilters from "./components/ReportFilters";
import ReportTable from "./components/ReportTable";
import ExportButtons from "./components/ExportButtons";

const ReportsSessions = () => {
  const [filters, setFilters] = useState({});
  const [reportType, setReportType] = useState("sessions");
  const { rows, loading, error, fetchReport } = useReports();

  const handleApplyFilters = async () => {
    await fetchReport(reportType, filters);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Rapporto di sessione</h2>
      <p>Modulo dedicato al ciclo delle sessioni.</p>

      <ReportFilters
        reportType={reportType}
        setReportType={setReportType}
        filters={filters}
        setFilters={setFilters}
        onApply={handleApplyFilters}
      />

      {/* ✅ EXPORT NO TOPO */}
      <ExportButtons reportType={reportType} filters={filters} />

      {error && <p style={{ color: "red" }}>{error}</p>}

      {loading ? (
        <p>Caricamento...</p>
      ) : (
        <ReportTable
          rows={rows}
          columns={reportColumnsConfig[reportType]}
        />
      )}
    </div>
  );
};

export default ReportsSessions;
