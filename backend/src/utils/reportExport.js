// backend/src/utils/reportExport.js

const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const EXPORT_DIR = path.join(__dirname, '..', '..', 'exports');

// 🔹 Garante que a pasta exista antes de gerar arquivos
function ensureExportDir() {
  if (!fs.existsSync(EXPORT_DIR)) {
    fs.mkdirSync(EXPORT_DIR, { recursive: true });
  }
}

async function generatePDF(rows, reportName) {
  ensureExportDir();

  const filePath = path.join(
    EXPORT_DIR,
    `${reportName}_${Date.now()}.pdf`
  );

  const doc = new PDFDocument();
  doc.pipe(fs.createWriteStream(filePath));

  doc.fontSize(16).text(`Relatório: ${reportName}`, { underline: true });
  doc.moveDown();

  rows.forEach(row => {
    doc.fontSize(12).text(JSON.stringify(row));
  });

  doc.end();
  return filePath;
}

async function generateCSV(rows, reportName) {
  ensureExportDir();

  const filePath = path.join(
    EXPORT_DIR,
    `${reportName}_${Date.now()}.csv`
  );

  const header = Object.keys(rows[0] || {}).join(',') + '\n';
  const data = rows.map(r => Object.values(r).join(',')).join('\n');

  fs.writeFileSync(filePath, header + data);
  return filePath;
}

module.exports = { generatePDF, generateCSV };
