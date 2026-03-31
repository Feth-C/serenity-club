// frontend/src/pages/Clients/ClientsList.jsx

import { useNavigate } from "react-router-dom";
import useFetchList from "../../hooks/useFetchList";
import Table from "../../components/ui/Table/Table";
import PageLayout from "../../components/layout/PageLayout/PageLayout";
import Button from "../../components/ui/Button/Button";
import Pagination from "../../components/ui/Pagination/Pagination";

const ClientsList = () => {
    const navigate = useNavigate();

    const {
        items: clients,
        loading,
        error,
        page,
        totalPages,
        totalItems,
        filters,
        setPage,
        setFilters
    } = useFetchList("/clients");

    return (
        <PageLayout
            title="🧑‍💼 Clienti"
            subtitle="Gestione dei clienti"
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
                    onClick={() => navigate("/clients/new")}
                >
                    + Nuovo Cliente
                </Button>
            }
            filters={
                <select
                    className="form-select"
                    value={filters.status || ""}
                    onChange={(e) => {
                        setFilters({ ...filters, status: e.target.value });
                        setPage(1); // resetar página quando muda filtro
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
                        clients.length
                            ? [...clients]
                                .sort((a, b) => b.id - a.id)
                                .map((c) => ({
                                    ...c,
                                    actions: (
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => navigate(`/clients/edit/${c.id}`)}
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

export default ClientsList;