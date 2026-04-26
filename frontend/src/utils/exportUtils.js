// frontend/src/pages/transactions/utils/exportUtils.js

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export const exportToCSV = (data, fileName) => {
    if (!data || !data.length) return;

    const headers = ["Data", "Descrizione", "Categoria", "Tipo", "Payer", "Valuta", "Importo"];

    const rows = data.map(t => {
        const escape = (val) => `"${String(val ?? "").replace(/"/g, '""')}"`;
        return [
            escape(new Date(t.date).toLocaleDateString('it-IT')),
            escape(t.description),
            escape(t.category),
            escape(t.type === 'income' ? 'Entrata' : 'Uscita'),
            escape(t.payer_name || t.member_name || '-'),
            escape(t.currency),
            escape(t.amount)
        ].join(";");
    });

    // Para evitar o "ï»¿", removemos o BOM e mantemos apenas o sep=;
    // O Excel moderno reconhece UTF-8 se o arquivo começar com sep=;
    const csvContent = "sep=;\n" + [headers.join(";"), ...rows].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${fileName}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

export const exportToPDF = (data, title) => {
    try {
        const doc = new jsPDF();
        const dateStr = new Date().toLocaleString('it-IT');

        // --- CONFIGURAÇÃO DE CORES (Personalize aqui) ---
        const primaryColor = [26, 52, 122]; // Azul Escuro (RGB)
        const accentColor = [41, 128, 185];  // Azul Claro

        // 1. Adicionar Logotipo (Opcional)
        // Se tiver uma URL de imagem ou Base64:
        // doc.addImage(imgData, 'PNG', 14, 10, 30, 30); 

        // 2. Cabeçalho do PDF
        doc.setFontSize(20);
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.text("FAMILY BANK", 14, 20); // Nome da sua App/Sistema

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(title, 14, 28);
        doc.text(`Data report: ${dateStr}`, 14, 34);

        // Linha divisória
        doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.line(14, 38, 196, 38);

        // 3. Preparação da Tabela
        const tableColumn = ["Data", "Descrizione", "Categoria", "Membro", "Val.", "Importo"];
        const tableRows = data.map(t => [
            new Date(t.date).toLocaleDateString('it-IT'),
            t.description,
            t.category,
            t.member_name || t.payer_name || '-',
            t.currency,
            {
                content: `${t.type === 'income' ? '+' : '-'}${Number(t.amount).toFixed(2)}`,
                styles: { textColor: t.type === 'income' ? [39, 174, 96] : [192, 57, 43] } // Verde ou Vermelho
            }
        ]);

        autoTable(doc, {
            startY: 45,
            head: [tableColumn],
            body: tableRows,
            theme: 'striped', // 'grid', 'striped', 'plain'
            headStyles: {
                fillColor: primaryColor,
                fontSize: 10,
                halign: 'center'
            },
            columnStyles: {
                0: { cellWidth: 25 }, // Data
                1: { cellWidth: 'auto' }, // Descrição
                2: { cellWidth: 30 }, // Categoria
                4: { cellWidth: 15, halign: 'center' }, // Moeda
                5: { cellWidth: 30, halign: 'right', fontStyle: 'bold' } // Importo
            },
            styles: {
                fontSize: 9,
                cellPadding: 3,
                valign: 'middle'
            },
            alternateRowStyles: {
                fillColor: [245, 245, 245]
            }
        });

        // 4. Rodapé com numeração de página
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150);
            doc.text(`Pagina ${i} di ${pageCount}`, doc.internal.pageSize.width / 2, 285, { align: 'center' });
        }

        doc.save(`report_${new Date().getTime()}.pdf`);
    } catch (error) {
        console.error("Errore PDF:", error);
        alert("Errore generazione PDF");
    }
};