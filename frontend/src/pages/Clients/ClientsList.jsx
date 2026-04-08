// frontend/src/pages/Clients/ClientsList.jsx

import { useNavigate } from "react-router-dom";
import useFetchList from "../../hooks/useFetchList";
import { deleteClient } from "../../api/clients";

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
        setFilters,
        refetch
    } = useFetchList("/clients");

    const handleDelete = async (id) => {
        if (!window.confirm("Vuoi eliminare questo cliente?")) return;

        try {
            await deleteClient(id);
            refetch();
        } catch (err) {
            console.error("Errore eliminazione cliente:", err);
        }
    };

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

            {!loading && error && (
                <p className="text-error">Errore nel caricamento dei clienti</p>
            )}

            {!loading && !error && (
                <Table
                    columns={[
                        { key: "id", label: "#" },
                        { key: "name", label: "Nome" },
                        { key: "email", label: "Email" },
                        { key: "phone", label: "Telefono" },
                        { key: "status", label: "Stato" },
                        { key: "actions", label: "Azioni" }
                    ]}
                    data={
                        clients.length
                            ? clients.map((c) => ({
                                id: `#${c.id}`,
                                name: c.name,
                                email: c.email || "-",
                                phone: c.phone || "-",
                                status: c.status || "-",
                                actions: (
                                    <div style={{ display: "flex", gap: "8px" }}>
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={() =>
                                                navigate(`/clients/${c.id}`)
                                            }
                                        >
                                            Modifica
                                        </Button>

                                        <Button
                                            variant="danger"
                                            size="sm"
                                            onClick={() => handleDelete(c.id)}
                                        >
                                            Elimina
                                        </Button>
                                    </div>
                                )
                            }))
                            : [
                                {
                                    id: "-",
                                    name: "Nessun cliente trovato",
                                    email: "",
                                    phone: "",
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