// frontend/src/pages/Units/UnitsList.jsx

import { useNavigate } from "react-router-dom";
import useFetchList from "../../hooks/useFetchList";

import Table from "../../components/ui/Table/Table";
import PageLayout from "../../components/layout/PageLayout/PageLayout";
import Button from "../../components/ui/Button/Button";
import Pagination from "../../components/ui/Pagination/Pagination";

const UnitsList = () => {
    const navigate = useNavigate();

    const {
        items: units,
        loading,
        error,
        page,
        totalPages,
        totalItems,
        filters,
        setPage,
        setFilters,
        refetch
    } = useFetchList("/units");

    const handleDelete = async (id) => {
        if (!window.confirm("Vuoi eliminare questa unità?")) return;

        try {
            await api.delete(`/units/${id}`);
            refetch();
        } catch (err) {
            console.error("Errore eliminazione unità:", err);
        }
    };

    return (
        <PageLayout
            title="🏢 Unità"
            subtitle="Gestione delle sedi e unità operative"
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
                    onClick={() => navigate("/units/new")}
                >
                    + Nuova Unità
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
                <p className="text-error">Errore nel caricamento delle unità</p>
            )}

            {!loading && !error && (
                <Table
                    columns={[
                        { key: "name", label: "Nome Unità" },
                        { key: "type", label: "Tipo" },
                        { key: "status", label: "Stato" },
                        { key: "actions", label: "Azioni" }
                    ]}
                    data={
                        units.length
                            ? units.map((c) => ({
                                name: c.name,
                                type: c.type || "-",
                                status: c.status || "-",
                                actions: (
                                    <div style={{ display: "flex", gap: "8px" }}>
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={() =>
                                                navigate(`/units/${c.id}`)
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
                                    name: "Nessun unità trovato",
                                    type: "",
                                    actions: ""
                                }
                            ]
                    }
                />
            )}
        </PageLayout>
    );
};

export default UnitsList;