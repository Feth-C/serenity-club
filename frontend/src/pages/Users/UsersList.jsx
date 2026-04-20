// frontend/src/pages/Users/UsersList.jsx

import { useNavigate } from "react-router-dom";
import useFetchList from "../../hooks/useFetchList";
import Table from "../../components/ui/Table/Table";
import PageLayout from "../../components/layout/PageLayout/PageLayout";
import Button from "../../components/ui/Button/Button";
import Pagination from "../../components/ui/Pagination/Pagination";

const UsersList = () => {
  const navigate = useNavigate();

  const {
    items: users,
    loading,
    error,
    page,
    totalPages,
    totalItems,
    filters,
    setPage,
    setFilters
  } = useFetchList("/users");

  // Configuração de colunas para o Table global
  const columns = [
    { key: "id", label: "ID" },
    { key: "name", label: "Nome" },
    { key: "email", label: "Email" },
    { key: "role", label: "Ruolo" },
    { key: "status", label: "Stato" },
    { key: "actions", label: "Azioni" }
  ];

  // Adiciona a coluna de ações de forma padronizada
  const data = users.length
    ? users.map((u) => ({
      ...u,
      actions: (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate(`/users/edit/${u.id}`)}
        >
          Modifica
        </Button>
      )
    }))
    : [
      {
        id: "-",
        name: "Nessun dato trovato",
        email: "",
        role: "",
        status: "",
        actions: ""
      }
    ];

  return (
    <PageLayout
      title="👤 Utenti"
      subtitle="Gestione dei utenti"
      backButton={
        <Button
          variant="secondary"
          size="md"
          onClick={() => navigate(-1)}
        >
          ← Indietro
        </Button>
      }
      actions={
        <Button
          variant="primary"
          size="md"
          onClick={() => navigate("/users/new")}
        >
          + Nuovo Utente
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
          <option value="active">Attivo</option>
          <option value="inactive">Inattivo</option>
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
        <Table columns={columns} data={data} />
      )}
    </PageLayout>
  );
};

export default UsersList;