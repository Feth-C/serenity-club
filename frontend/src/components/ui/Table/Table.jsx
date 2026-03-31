// frontend/src/components/ui/Table/Table.jsx

import "./table.css";
import "../Status/status.css";

const getStatusClass = (value) => {
  if (!value) return "";

  const v = String(value).toLowerCase();

  if (["attivo", "active", "valido", "valid"].includes(v)) return "status-success";
  if (["in scadenza", "expiring"].includes(v)) return "status-warning";
  if (["scaduto", "expired", "inattivo", "inactive"].includes(v)) return "status-danger";

  return "";
};

const Table = ({ columns = [], data = [] }) => {
  if (!Array.isArray(data)) {
    return <p>Dati non disponibili</p>;
  }

  return (
    <div className="table-container">
      <table className="table">
        <thead className="table-head">
          <tr className="table-row">
            {columns.map((col) => (
              <th key={col.key} className="table-cell">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.length === 0 ? (
            <tr className="table-row">
              <td colSpan={columns.length} className="table-empty">
                Nessun dato trovato
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr key={row.id} className="table-row">
                {columns.map((col) => {
                  const value = row[col.key];
                  const statusClass = col.key === "status" ? getStatusClass(value) : "";

                  return (
                    <td key={col.key} className={`table-cell ${statusClass}`}>
                      {value ?? "-"}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;