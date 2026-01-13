// frontend/src/pages/Reports/ReportsDetailed.jsx

import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../api/api';
import Table from '../../components/common/Table';
import BackButton from '../../components/common/BackButton';

const ReportsDetailed = () => {
  const [detailedData, setDetailedData] = useState({ valid: [], expiring: [], expired: [] });
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const statusParam = searchParams.get('status') || '';
  const typeParam = searchParams.get('type') || '';

  const fetchDetailed = async () => {
    try {
      setLoading(true);
      const res = await api.get('/reports/documents/detailed', { params: { days: 30, type: typeParam } });
      setDetailedData(res.data || { valid: [], expiring: [], expired: [] });
    } catch (err) {
      console.error('Errore nel caricamento del detailed', err);
      setDetailedData({ valid: [], expiring: [], expired: [] });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetailed();
  }, [typeParam]);

  const renderSection = (title, data, filterStatus = '') => {
    const filteredData = filterStatus ? data[filterStatus] : data[title.toLowerCase()];
    return (
      <div style={{ marginBottom: '30px' }}>
        <h2>{title}</h2>
        {filteredData.length === 0 ? (
          <p>Nessun documento in questa categoria.</p>
        ) : (
          <Table
            columns={[
              { key: 'member_name', label: 'Membro' },
              { key: 'type', label: 'Tipo Documento' },
              { key: 'expiration_date', label: 'Scadenza' }
            ]}
            data={filteredData}
          />
        )}
      </div>
    );
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'trebuchet ms, sans-serif' }}>
      <BackButton />
      <h1>Dettaglio Documenti</h1>

      {loading ? (
        <p>Caricamento...</p>
      ) : (
        <>
          {statusParam ? renderSection('', detailedData, statusParam) : (
            <>
              {renderSection('Validi', detailedData)}
              {renderSection('In Scadenza', detailedData)}
              {renderSection('Scaduti', detailedData)}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default ReportsDetailed;
