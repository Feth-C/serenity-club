// frontend/src/components/common/Table.jsx

const Table = ({ columns = [], data = [] }) => {
  if (!Array.isArray(data)) {
    console.error('Table received invalid data:', data);
    return <p>Dati non disponibili</p>;
  }

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          {columns.map(col => (
            <th
              key={col.key}
              style={{ borderBottom: '2px solid #ccc', textAlign: 'left', padding: '10px 20px' }}
            >
              {col.label}
            </th>
          ))}
        </tr>
      </thead>

      <tbody>
        {data.length === 0 ? (
          <tr>
            <td colSpan={columns.length} style={{ padding: '20px', textAlign: 'center' }}>
              Nessun dato trovato
            </td>
          </tr>
        ) : (
          data.map(row => (
            <tr key={row.id}>
              {columns.map(col => (
                <td key={col.key} style={{ padding: '10px 20px' }}>
                  {row[col.key] ?? '-'}
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
};

export default Table;

