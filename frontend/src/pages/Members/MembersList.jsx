// frontend/src/pages/Members/MembersList.jsx

import { useNavigate } from "react-router-dom";
import useFetchList from "../../hooks/useFetchList";
import Table from "../../components/ui/Table/Table";
import PageLayout from "../../components/layout/PageLayout/PageLayout";
import Button from "../../components/ui/Button/Button";
import Pagination from "../../components/ui/Pagination/Pagination";
import useToggleStatus from "../../hooks/useToggleStatus";

const MembersList = () => {
  const navigate = useNavigate();

  const {
    items: members,
    loading,
    error,
    page,
    totalPages,
    totalItems,
    filters,
    setPage,
    setFilters,
    refetch
  } = useFetchList("/members");

  const toggleMemberStatus = useToggleStatus("/members", refetch);

  return (
    <PageLayout
      title="👥 Membri"
      subtitle="Gestione dei membri e delle relazioni"
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
          onClick={() => navigate("/members/new")}
        >
          + Nuovo Membro
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
          <option value="active">Attivi</option>
          <option value="inactive">Inattivi</option>
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
            { key: "id", label: "Id" },
            { key: "name", label: "Nome" },
            { key: "email", label: "Email" },
            { key: "phone", label: "Telefono" },
            { key: "status", label: "Stato" },
            { key: "actions", label: "Azioni" }
          ]}
          data={
            members.length
              ? members.map((m) => ({
                ...m,
                actions: (
                  <>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => navigate(`/members/edit/${m.id}`)}
                    >
                      Modifica
                    </Button>

                    {m.status === "active" ? (
                      <Button
                        variant="warning"
                        size="sm"
                        onClick={() => toggleMemberStatus(m.id, m.status, "membro")}
                      >
                        Disattiva
                      </Button>
                    ) : (
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => toggleMemberStatus(m.id, m.status, "membro")}
                      >
                        Riattiva
                      </Button>
                    )}
                  </>
                )
              }))
              : [
                {
                  id: "-",
                  name: "Nessun dato trovato",
                  email: "",
                  phone: "",
                  status: "",
                  actions: ""
                }
              ]
          }
        />
      )}
    </PageLayout>
  );
};

export default MembersList;