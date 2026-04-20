// backend/src/controllers/ReportExportController.js

const fs = require('fs');
const path = require('path');
const Report = require('../models/Report');
const AppError = require('../errors/AppError');
const { generatePDF, generateCSV } = require('../utils/reportExport');
const db = require('../database/db');

module.exports = {

    async export(req, res) {
        const { reportType } = req.params;
        const { startDate, endDate, exportFormat = 'pdf' } = req.query;
        const unitId = req.activeUnitId;
        const userId = req.user.id;

        if (!startDate || !endDate) throw new AppError('Datas obrigatórias', 400);
        if (!['pdf', 'csv'].includes(exportFormat)) throw new AppError('Formato inválido', 400);

        // Obter dados
        let rows;
        switch (reportType) {
            case 'sessions':
                rows = await Report.sessionsByPeriod({ unitId, startDate, endDate });
                break;
            case 'financial':
                rows = await Report.financialReport({ unitId, startDate, endDate });
                break;
            case 'operational':
                rows = await Report.operationalReport({ unitId, startDate, endDate });
                break;
            default:
                throw new AppError('Tipo de relatório inválido', 400);
        }

        if (!rows || rows.length === 0) return res.status(404).json({ message: "Nenhum dado encontrado" });

        // Criar pasta por tipo de relatório
        const exportDir = path.join(__dirname, '../../exports', reportType);
        if (!fs.existsSync(exportDir)) fs.mkdirSync(exportDir, { recursive: true });

        // Gerar nome do arquivo com versão
        const dateStr = new Date().toLocaleDateString('it-IT').replace(/\//g, '_');
        let baseName = `Relatorio_${reportType}_${dateStr}`;
        let version = 1;
        let filePath;
        do {
            const suffix = version > 1 ? `_V${version}` : '';
            filePath = path.join(exportDir, `${baseName}${suffix}.${exportFormat}`);
            version++;
        } while (fs.existsSync(filePath));

        // Gerar arquivo
        if (exportFormat === 'pdf') {
            await generatePDF(rows, filePath);
        } else {
            await generateCSV(rows, filePath);
        }

        // Registrar log
        const reportRow = await new Promise((resolve, reject) => {
            db.get(`SELECT id FROM reports WHERE slug = ?`, [reportType], (err, row) =>
                err ? reject(err) : resolve(row)
            );
        });

        if (!reportRow) throw new AppError(`Relatório '${reportType}' não cadastrado em reports`, 500);

        db.run(
            `INSERT INTO reports_log 
        (report_id, unit_id, generated_by, start_date, end_date, export_format, file_path)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [reportRow.id, unitId, userId, startDate, endDate, exportFormat, filePath]
        );

        // Retornar arquivo para download
        res.download(filePath);
    }
};
