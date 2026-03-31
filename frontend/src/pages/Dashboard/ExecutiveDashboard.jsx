// frontend/src/pages/Dashboard/ExecutiveDashboard.jsx

import { useMemo } from "react";
import useFetchList from "../../hooks/useFetchList";
import useSessions from "../../hooks/useSessions";
import PageLayout from "../../components/layout/PageLayout/PageLayout";
import BalanceOverview from "../Transactions/components/BalanceOverview";
import Card from "../../components/ui/Card/Card";

import "./ExecutiveDashboard.css";

const ExecutiveDashboard = () => {
  const { items: transactions, loading } = useFetchList("/transactions");
  const { sessions } = useSessions();

  const getCurrencySymbol = (currency) => {
    const symbols = { EUR: "€", USD: "$", CHF: "CHF", GBP: "£" };
    return symbols[currency] || currency;
  };

  /* ===============================
     1️⃣ AGRUPAMENTO POR MOEDA (para donuts)
  =============================== */
  const groupedByCurrency = useMemo(() => {
    return transactions.reduce((acc, t) => {
      if (!acc[t.currency]) acc[t.currency] = { income: 0, expense: 0 };
      if (t.type === "income") acc[t.currency].income += Number(t.amount);
      else acc[t.currency].expense += Number(t.amount);
      return acc;
    }, {});
  }, [transactions]);

  /* ===============================
     2️⃣ PRÓXIMAS 3 SESSÕES
  =============================== */
  const upcomingSessions = useMemo(() => {
    if (!sessions) return [];
    return sessions
      .filter((s) => new Date(s.start_time) > new Date())
      .sort((a, b) => new Date(a.start_time) - new Date(b.start_time))
      .slice(0, 3);
  }, [sessions]);

  /* ===============================
     3️⃣ ÚLTIMAS 5 TRANSAÇÕES
  =============================== */
  const latestTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
  }, [transactions]);

  /* ===============================
     4️⃣ CONTAS EM ABERTO (SIMULAÇÃO)
  =============================== */
  const openBills = [
    { name: "Affitto Club", due: "2026-03-05", amount: 1200 },
    { name: "Luce", due: "2026-03-10", amount: 320 },
    { name: "Lavanderia", due: "2026-03-09", amount: 150 },
  ];

  const getBillStatus = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    if (due < today) return "scaduto";
    const diffDays = (due - today) / (1000 * 60 * 60 * 24);
    if (diffDays <= 3) return "prossimo";
    return "futuro";
  };

  return (
    <PageLayout
      title="🏢 Dashboard Esecutivo"
      subtitle="Controllo finanziario e operativo"
    >

      {loading && <p>Caricamento...</p>}

      {/* ================= KPI POR MOEDA (BalanceOverview) ================= */}
      <section className="executive-section">
        <BalanceOverview
          transactions={transactions}
          currencies={[...new Set(transactions.map((t) => t.currency))]}
        />
      </section>

      {/* ================= SESSÕES + TRANSAÇÕES ================= */}
      <section className="executive-section split-grid">
        <Card title="💸 Ultime Transazioni" link="/transactions">
          {latestTransactions.length === 0 && <p className="text-muted">Nessuna transazione.</p>}
          {latestTransactions.map((t) => (
            <div key={t.id} className="list-item">
              <div className="list-title">{t.category}</div>
              <div className="list-sub">{t.payer_name}</div>
              <div className={t.type === "income" ? "kpi-income" : "kpi-expense"}>
                {t.type === "income" ? "+" : "-"}
                {Number(t.amount).toFixed(2)} {getCurrencySymbol(t.currency)}
              </div>
            </div>
          ))}
        </Card>

        <Card title="🔓 Prossime Sessioni" link="/sessions">
          {upcomingSessions.length === 0 && <p className="text-muted">Nessuna sessione prevista.</p>}
          {upcomingSessions.map((session) => (
            <div key={session.id} className="list-item">
              <div className="list-title">{session.client_name || session.name}</div>
              <div className="list-sub">{new Date(session.start_time).toLocaleString("it-IT")}</div>
              <div className="list-sub">{session.planned_minutes} min</div>
            </div>
          ))}
        </Card>
      </section>

      {/* ================= CONTAS EM ABERTO ================= */}
      <section className="executive-section">
        <Card title="🧾 Conti da Pagare" link="/bills">
          <div className="bills-grid">
            {openBills.map((bill, index) => {
              const status = getBillStatus(bill.due);
              return (
                <div key={index} className="bill-card">
                  <div className="bill-card-top">
                    <div className="bill-title">{bill.name}</div>
                    <div className="bill-amount">€ {bill.amount.toFixed(2)}</div>
                  </div>
                  <div className="bill-card-bottom">
                    <div className="bill-due">{new Date(bill.due).toLocaleDateString("it-IT")}</div>
                    <div className={`bill-status bill-status--${status}`}>{status}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </section>

    </PageLayout >
  );
};

export default ExecutiveDashboard;