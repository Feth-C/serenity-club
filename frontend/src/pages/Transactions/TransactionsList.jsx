// frontend/src/pages/transactions/TransactionsList.jsx

import { useNavigate } from "react-router-dom";
import useFetchList from "../../hooks/useFetchList";

import PageLayout from "../../components/layout/PageLayout/PageLayout";
import Button from "../../components/ui/Button/Button";
import Pagination from "../../components/ui/Pagination/Pagination";
import Card from "../../components/ui/Card/Card";

import BalanceOverview from "./components/BalanceOverview";
import TransactionFilters from "./components/TransactionFilters";
import TransactionTable from "./components/TransactionTable";

const TransactionsList = () => {
    const navigate = useNavigate();

    const {
        items: transactions,
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

    // Lista de moedas únicas das transações atuais
    const currencies = [...new Set(transactions.map(t => t.currency).filter(Boolean))];

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
            {/* BALANCE OVERVIEW */}
            <BalanceOverview
                transactions={transactions}
                currencies={currencies}
            />

            {/* FILTRI */}
            <Card title="🔎 Filtri">
                <TransactionFilters
                    filters={filters}
                    setFilters={setFilters}
                    transactions={transactions}
                />
            </Card>

            {/* LISTA DE TRANSAÇÕES */}
            <Card>
                <TransactionTable
                    transactions={transactions}
                    loading={loading}
                />
                {error && (
                    <p className="text-error">{error}</p>
                )}
            </Card>

        </PageLayout>
    );
};

export default TransactionsList;