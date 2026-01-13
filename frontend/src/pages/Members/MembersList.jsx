// frontend/src/pages/Members/MembersList.jsx

import { Link } from 'react-router-dom';
import useFetchList from '../../hooks/useFetchList';
import BackButton from '../../components/common/BackButton';
import Table from '../../components/common/Table';

const MembersList = () => {
  const {
    items: members,
    loading,
    error,
    page,
    totalPages,
    statusFilter,
    setPage,
    setStatusFilter,
  } = useFetchList('/members');

  return (
    <div style={{ padding: '20px' }}>
      {/* BOTÃO VOLTAR */}
      <BackButton />
      <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>Membri</h1>

      {/* Filtro + botão */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '15px',
        }}
      >
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">Tutti</option>
          <option value="active">Attivi</option>
          <option value="inactive">Inattivi</option>
        </select>

        <Link to="/members/new">+ Nuovo Membro</Link>
      </div>

      {/* Conteúdo */}
      {loading ? (
        <p>Caricamento...</p>
      ) : error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : (
        <Table
          columns={[
            { key: 'name', label: 'Nome' },
            { key: 'email', label: 'Email' },
            { key: 'status', label: 'Stato' },
            { key: 'actions', label: 'Azioni' },
          ]}
          data={members.map(m => ({
            ...m,
            actions: (
              <Link to={`/members/edit/${m.id}`}>Modifica</Link>
            ),
          }))}
        />
      )}

      {/* Paginação */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '15px' }}>
        <button disabled={page === 1} onClick={() => setPage(page - 1)}>
          Precedente
        </button>

        <span style={{ margin: '0 10px' }}>
          Pagina {page} di {totalPages}
        </span>

        <button disabled={page === totalPages} onClick={() => setPage(page + 1)}>
          Successiva
        </button>
      </div>
    </div>
  );
};

export default MembersList;
