// frontend/src/pages/Employees/EmployeesList.jsx

import { Link } from 'react-router-dom';
import useFetchList from '../../hooks/useFetchList';
import BackButton from '../../components/common/BackButton';
import Table from '../../components/common/Table';

const EmployeesList = () => {
  const {
    items: employees,
    loading,
    error,
    page,
    totalPages,
    statusFilter,
    setPage,
    setStatusFilter,
  } = useFetchList('/employees');

  return (
    <div style={{ padding: '20px' }}>
      {/* BOTÃO VOLTAR */}
      <BackButton />
      <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>Dipendenti</h1>

      {/* FILTRO + BOTÃO NUOVO DIPENDENTE */}
      <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Tutti</option>
            <option value="active">Attivo</option>
            <option value="inactive">Inattivo</option>
          </select>
        </div>

        <div>
          <Link to="/employees/new">
            + Nuovo Dipendente
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
              { key: 'email', label: 'Email' },
              { key: 'role', label: 'Ruolo' },
              { key: 'status', label: 'Stato' },
              { key: 'actions', label: 'Azioni' }
            ]}
            data={employees.length
              ? employees.map(e => ({ ...e, actions: <Link to={`/employees/edit/${e.id}`}>Modifica</Link> }))
              : [{ id: 'empty', name: 'Nessun dato trovato', email: '', role: '', status: '', actions: '' }]
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

export default EmployeesList;
