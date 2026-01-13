// frontend/src/pages/Documents/DocumentsList.jsx

import { Link } from 'react-router-dom';
import useFetchList from '../../hooks/useFetchList';
import BackButton from '../../components/common/BackButton';
import Table from '../../components/common/Table';
import { documentTypeLabel, documentStatusLabel } from '../../utils/documentLabels';

const DocumentsList = () => {
  const {
    items: documents,
    loading,
    error,
    page,
    totalPages,
    statusFilter,
    setPage,
    setStatusFilter,
  } = useFetchList('/documents');

  return (
    <div style={{ padding: '20px' }}>
      {/* BOTÃO VOLTAR */}
      <BackButton />
      <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>
        Documenti
      </h1>

      {/* FILTRO + BOTÃO NUOVO DOCUMENTO */}
      <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            style={{ padding: '5px' }}
          >
            <option value="">Tutti</option>
            <option value="valid">Valido</option>
            <option value="expiring">In scadenza</option>
            <option value="expired">Scaduto</option>
          </select>
        </div>

        <div>
          <Link to="/documents/new">
            + Nuovo Documento
          </Link>
        </div>
      </div>

      {loading && <p>Caricamento...</p>}
      {!loading && error && <p style={{ color: 'red' }}>{error}</p>}

      {!loading && !error && (
        <>
          <Table
            columns={[
              { key: 'name', label: 'Nome' },
              { key: 'type', label: 'Tipo' },
              { key: 'expiration_date', label: 'Data di scadenza' },
              { key: 'status', label: 'Stato' },
              { key: 'owner', label: 'Proprietario' },
              { key: 'notes', label: 'Note' },
              { key: 'file', label: 'File' },
              { key: 'actions', label: 'Azioni' }
            ]}
            data={documents.length
              ? documents.map(d => ({
                ...d,
                type: documentTypeLabel[d.type] || d.type,
                status: documentStatusLabel[d.status] || d.status,
                owner: d.owner_name || `${d.owner_type} #${d.owner_id}`,
                notes: d.notes ? (d.notes.length > 50 ? d.notes.slice(0, 50) + '...' : d.notes) : '',
                file: d.file_path ? (
                  <a href={d.file_path} target="_blank" rel="noreferrer">Scarica</a>
                ) : '—',
                actions: (
                  <Link to={`/documents/edit/${d.id}`}>
                    Modifica
                  </Link>
                )
              }))
              : [{ id: 'empty', name: 'Nessun dato trovato', type: '', expiration_date: '', status: '', owner: '', notes: '', file: '', actions: '' }]
            }
          />

          {/* PAGINAZIONE */}
          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px' }}>
            <button disabled={page <= 1} onClick={() => setPage(page - 1)}>Precedente</button>
            <span>Pagina {page} di {totalPages}</span>
            <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Successiva</button>
          </div>
        </>
      )}
    </div>
  );
};

export default DocumentsList;
