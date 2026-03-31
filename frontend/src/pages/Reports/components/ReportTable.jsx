// frontend/src/pages/reports/components/ReportTable.jsx

import React from "react";

const ReportTable = ({ rows, columns }) => {
    if (!rows || rows.length === 0)
        return <p style={{ padding: '20px', textAlign: 'center', fontStyle: 'italic' }}>Nessun dato disponibile per il periodo selezionato.</p>;

    return (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'Trebuchet MS, sans-serif', color: '#000' }}>
            <thead style={{ backgroundColor: '#f2f2f2' }}>
                <tr>
                    {columns.map(col => (
                        <th key={col} style={{ padding: '10px 15px', borderBottom: '2px solid #ccc', textAlign: 'left' }}>
                            {col}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {rows.map((row, idx) => (
                    <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? '#fff' : '#fafafa' }}>
                        {columns.map(col => (
                            <td key={col} style={{ padding: '8px 10px', borderBottom: '1px solid #eee' }}>
                                {row[col] ?? '—'}
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default ReportTable;
