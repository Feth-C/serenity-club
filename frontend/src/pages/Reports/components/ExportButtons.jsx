// frontend/src/pages/reports/components/ExportButtons.jsx

import api from "../../../api/api";

const ExportButtons = ({ reportType, filters }) => {
  const downloadFile = async (format) => {
    try {
      // Requisita o backend para gerar o arquivo no formato correto (pdf ou csv)
      const res = await api.get(`/reports/${reportType}`, {
        params: { ...filters, exportFormat: format },
        responseType: "blob", // importante para arquivos binários
      });

      // Define MIME type correto
      const mimeType =
        format === "pdf" ? "application/pdf" : "text/csv;charset=utf-8";

      const blob = new Blob([res], { type: mimeType });

      const now = new Date();
      const datePart = `${now.getDate().toString().padStart(2, "0")}_${(
        now.getMonth() + 1
      )
        .toString()
        .padStart(2, "0")}_${now.getFullYear()}`;
      const timePart = `${now.getHours().toString().padStart(2, "0")}_${now
        .getMinutes()
        .toString()
        .padStart(2, "0")}`;

      const filename = `Relatorio_${reportType}_${datePart}-${timePart}-Serenity_Club.${format}`;

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Erro ao baixar relatório:", err);
      alert("Erro ao gerar arquivo per il download.");
    }
  };

  return (
    <div
      style={{
        marginTop: "10px",
        marginBottom: "10px",
        display: "flex",
        gap: "10px",
      }}
    >
      <button onClick={() => downloadFile("pdf")}>Baixar PDF</button>
      <button onClick={() => downloadFile("csv")}>Baixar CSV</button>
    </div>
  );
};

export default ExportButtons;
