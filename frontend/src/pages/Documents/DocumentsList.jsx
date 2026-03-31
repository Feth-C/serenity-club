// frontend/src/pages/Documents/DocumentsList.jsx

import { useNavigate } from 'react-router-dom';
import useFetchList from '../../hooks/useFetchList';
import Table from '../../components/ui/Table/Table';
import PageLayout from '../../components/layout/PageLayout/PageLayout';
import Button from '../../components/ui/Button/Button';
import Pagination from '../../components/ui/Pagination/Pagination';
import { documentTypeLabel, documentStatusLabel } from '../../utils/documentLabels';

const DocumentsList = () => {
  const navigate = useNavigate();

  const {
    items: documents,
    loading,
    error,
    page,
    totalPages,
    totalItems,
    filters,
    setPage,
    setFilters,
  } = useFetchList('/documents');

  return (
    <PageLayout
      title="📄 Documenti"
      subtitle="Gestione dei documenti"
      backButton={
        <Button variant="secondary" size="md" onClick={() => navigate(-1)}>
          ← Indietro
        </Button>
      }
      actions={
        <Button
          variant="primary"
          size="md"
          onClick={() => navigate('/documents/new')}
        >
          + Nuovo Documento
        </Button>
      }
      filters={
        <select
          className="form-select"
          value={filters.status || ""}
          onChange={(e) => {
            setFilters({ status: e.target.value });
          }}
        >
          <option value="">Tutti</option>
          <option value="valid">Valido</option>
          <option value="expiring">In scadenza</option>
          <option value="expired">Scaduto</option>
        </select>
      }
      pagination={
        !loading && !error && (
          <Pagination
            page={page}
            totalPages={totalPages}
            totalItems={totalItems}
            onPrev={() => setPage(page - 1)}
            onNext={() => setPage(page + 1)}
          />
        )
      }
    >
      {loading && <p>Caricamento...</p>}
      {!loading && error && <p className="text-error">{error}</p>}

      {!loading && !error && (
        <Table
          columns={[
            { key: "id", label: "ID" },
            { key: 'name', label: 'Nome' },
            { key: 'type', label: 'Tipo' },
            { key: 'expiration_date', label: 'Scadenza' },
            { key: 'status', label: 'Stato' },
            { key: 'actions', label: 'Azioni' }
          ]}
          data={
            documents.length
              ? documents.map((d) => ({
                ...d,
                type: documentTypeLabel[d.type] || d.type,
                status: documentStatusLabel[d.status] || d.status,
                owner: d.owner_name || `${d.owner_type} #${d.owner_id}`,
                notes: d.notes
                  ? d.notes.length > 50
                    ? d.notes.slice(0, 50) + '...'
                    : d.notes
                  : '',
                file: d.file_path ? (
                  <a href={d.file_path} target="_blank" rel="noreferrer">
                    Scarica
                  </a>
                ) : (
                  '—'
                ),
                actions: (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate(`/documents/edit/${d.id}`)}
                  >
                    Modifica
                  </Button>
                )
              }))
              : [
                {
                  id: '-',
                  name: 'Nessun dato trovato',
                  type: '',
                  expiration_date: '',
                  status: '',
                  owner: '',
                  notes: '',
                  file: '',
                  actions: ''
                }
              ]
          }
        />
      )}
    </PageLayout>
  );
};

export default DocumentsList;