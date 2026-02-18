// frontend/src/hooks/useReports.js

import { useState, useCallback } from "react";
import api from "../api/api";
import { normalizeItems } from "../utils/normalizeItems";

// Configuração das colunas por tipo de relatório
export const reportColumnsConfig = {
  sessions: [
    "Cliente", "Contatto", "Email", "Tipo di visita",
    "Inizio", "Fine prevista", "Fine effettiva",
    "Stato", "Minuti pianificati", "Importo previsto (€)",
    "Importo finale (€)", "Pagato", "Metodo pagamento", "Note"
  ],
  financial: [
    "Stato", "Totale sessioni", "Ricavo totale (€)", "Pagato (€)"
  ],
  operational: [
    "Stato", "Totale", "Durata media (minuti)"
  ]
};

// Função para formatar os dados
const formatReportRows = (reportType, rows) => {
  switch (reportType) {
    case "sessions":
      return rows.map(r => ({
        Cliente: r.client_name || '—',
        Contatto: r.contact || '—',
        Email: r.email || '—',
        "Tipo di visita": r.visit_type === 'first' ? 'Prima visita' : 'Ritorno',
        Inizio: r.start_time ? new Date(r.start_time).toLocaleString('it-IT', { dateStyle: 'short', timeStyle: 'short' }) : '—',
        "Fine prevista": r.expected_end_time ? new Date(r.expected_end_time).toLocaleString('it-IT', { dateStyle: 'short', timeStyle: 'short' }) : '—',
        "Fine effettiva": r.actual_end_time ? new Date(r.actual_end_time).toLocaleString('it-IT', { dateStyle: 'short', timeStyle: 'short' }) : '—',
        Stato: r.status === 'open' ? 'Aperta' : r.status === 'closed' ? 'Chiusa' : 'Annullata',
        "Minuti pianificati": r.planned_minutes ?? '—',
        "Importo previsto (€)": r.planned_amount != null ? `€ ${r.planned_amount.toFixed(2)}` : '—',
        "Importo finale (€)": r.final_amount != null ? `€ ${r.final_amount.toFixed(2)}` : '—',
        Pagato: r.paid_amount != null ? `€ ${r.paid_amount.toFixed(2)}` : '—',
        "Metodo pagamento": r.payment_method || '—',
        Note: r.notes || '—'
      }));
    case "financial":
      return rows.map(r => ({
        Stato: r.status || '—',
        "Totale sessioni": r.total_sessions ?? 0,
        "Ricavo totale (€)": r.total_revenue != null ? `€ ${r.total_revenue.toFixed(2)}` : '—',
        "Pagato (€)": r.total_paid != null ? `€ ${r.total_paid.toFixed(2)}` : '—'
      }));
    case "operational":
      return rows.map(r => ({
        Stato: r.status || '—',
        Totale: r.total ?? 0,
        "Durata media (minuti)": r.avg_duration != null ? r.avg_duration.toFixed(1) : '—'
      }));
    default:
      return rows;
  }
};

export default function useReports() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchReport = useCallback(async (reportType, filters = {}) => {
    setLoading(true);
    setError("");

    try {
      const res = await api.get(`/reports/${reportType}`, { params: filters });
      const items = normalizeItems(res);
      const formatted = formatReportRows(reportType, items);
      setRows(formatted);
      return formatted;
    } catch (err) {
      console.error("Erro ao buscar relatório:", err);
      setError("Erro ao carregar relatório");
      setRows([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    rows,
    loading,
    error,
    fetchReport,
  };
}
