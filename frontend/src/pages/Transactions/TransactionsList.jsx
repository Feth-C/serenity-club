// frontend/src/pages/transactions/TransactionsList.jsx

import { useNavigate } from "react-router-dom";
import useFetchList from "../../hooks/useFetchList";
import api from "../../api/api"; 

import PageLayout from "../../components/layout/PageLayout/PageLayout";
import Button from "../../components/ui/Button/Button";
import Pagination from "../../components/ui/Pagination/Pagination";
import Card from "../../components/ui/Card/Card";

import BalanceOverview from "./components/BalanceOverview";
import TransactionFilters from "./components/TransactionFilters";
import TransactionTable from "./components/TransactionTable";

import { exportToCSV, exportToPDF } from "../../utils/exportUtils";

// IMPORTAÇÃO DO CSS
import "./transactionsLayout.css";

const TransactionsList = () => {
    const navigate = useNavigate();

    const {
        items: transactions,
        extraData: stats,
        loading,
        error,
        page,
        totalPages,
        totalItems,
        filters,
        setPage,
        setFilters
    } = useFetchList("/transactions", {
        initialPage: 1,
        perPage: 10,
        initialFilters: {
            type: "",
            category: "",
            start_date: "",
            end_date: "",
            payer_name: "",
            member_id: "",
            currency: ""
        }
    });

    const handleExport = async (type) => {
        try {
            // IMPORTANTE: Garantimos que pegamos os mesmos filtros da tela
            const params = { ...filters, limit: 1000 }; // Aumentamos o limite para exportar tudo
            const res = await api.get("/transactions", { params });

            // Verifique se o caminho dos dados está correto (data.items ou data.data.items)
            const allData = res.data?.items || res.data?.data?.items || [];

            if (allData.length === 0) {
                alert("Nessun dato trovato per os filtros aplicados.");
                return;
            }

            const fileName = `report_transazioni_${new Date().getTime()}`;

            if (type === 'csv') {
                exportToCSV(allData, fileName);
            } else if (type === 'pdf') {
                exportToPDF(allData, "Report Transazioni");
            }
        } catch (err) {
            console.error("Export error:", err);
        }
    };

    return (
        <PageLayout
            title="💳 Transazioni"
            subtitle="Gestione completa delle entrate e delle spese"

            backButton={
                <Button variant="secondary" onClick={() => navigate(-1)}>
                    ← Indietro
                </Button>
            }

            actions={
                <Button variant="primary" onClick={() => navigate("/transactions/new")}>
                    + Nuova transazione
                </Button>
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
            <div className="transactions-grid">
                {/* 1. Resumo de Saldo (Ocupa 100%) */}
                <BalanceOverview
                    globalStats={stats}
                    transactions={transactions}
                />

                {/* 2. Filtros + Botões de Exportação (Ocupa 100%) */}
                <div className="transactions-filters-area">
                    <TransactionFilters
                        filters={filters}
                        setFilters={setFilters}
                        transactions={transactions}
                        onExport={handleExport} // Passando a função de exportar para dentro do filtro
                    />
                </div>

                {/* 3. Tabela de Dados (Ocupa 100%) */}
                <div className="transactions-table-area">
                    <Card>
                        <TransactionTable
                            transactions={transactions}
                            loading={loading}
                        />
                        {error && <p className="text-error">{error}</p>}
                    </Card>
                </div>
            </div>
        </PageLayout>
    );
};

export default TransactionsList;