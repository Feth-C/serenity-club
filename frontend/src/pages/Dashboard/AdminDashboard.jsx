// frontend/src/pages/Dashboard/AdminDashboard.jsx

import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import { normalizeItems } from "../../utils/normalizeItems";
import api from "../../api/api";

import PageLayout from "../../components/layout/PageLayout/PageLayout";
import Card from "../../components/ui/Card/Card";
import Table from "../../components/ui/Table/Table";
import DonutChart from "../../components/ui/DonutChart/DonutChart";
import EmptyState from "../../components/ui/EmptyState";
import Button from "../../components/ui/Button/Button";

import "./AdminDashboard.css";

const AdminDashboard = () => {
  const { user, activeUnit, changeUnit, loading: authLoading } = useContext(AuthContext);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [stats, setStats] = useState({
    users: 0,
    members: 0,
    clients: 0,
    employees: 0,
    documents: 0,
  });

  const [recentDocuments, setRecentDocuments] = useState([]);
  const [recentMembers, setRecentMembers] = useState([]);
  const [recentClients, setRecentClients] = useState([]);

  const [userChart, setUserChart] = useState({ labels: [], datasets: [] });
  const [memberChart, setMemberChart] = useState({ labels: [], datasets: [] });
  const [clientChart, setClientChart] = useState({ labels: [], datasets: [] });
  const [employeeChart, setEmployeeChart] = useState({ labels: [], datasets: [] });
  const [documentChart, setDocumentChart] = useState({ labels: [], datasets: [] });

  const [selectedStatus, setSelectedStatus] = useState("");
  const [clickedStatus, setClickedStatus] = useState("");

  const buildChartData = (items, type = "user") => {
    if (type === "document") {
      const active = items.valid + items.expiring;
      const inactive = items.expired;

      return {
        labels: ["Attivi", "Inattivi"],
        datasets: [
          {
            data: [active, inactive],
            backgroundColor: ["#36A2EB", "#FF6384"],
          },
        ],
      };
    }

    const active = items.active || 0;
    const inactive = items.inactive || 0;

    return {
      labels: ["Attivi", "Inattivi"],
      datasets: [
        {
          data: [active, inactive],
          backgroundColor: ["#36A2EB", "#FF6384"],
        },
      ],
    };
  };

  const fetchDashboardData = async () => {
    if (!activeUnit) return;

    setLoading(true);
    setError("");

    try {
      let statusParam;

      if (selectedStatus === "active" || clickedStatus === "active")
        statusParam = ["valid", "expiring"];
      else if (selectedStatus === "inactive" || clickedStatus === "inactive")
        statusParam = ["expired"];

      const [resUsers, resMembers, resClients, resEmployees, resDocuments] =
        await Promise.all([
          api.get("/users", {
            params: {
              unitId: activeUnit.id,
              ...(statusParam && { status: selectedStatus || clickedStatus }),
            },
          }),
          api.get("/members", {
            params: {
              unitId: activeUnit.id,
              ...(statusParam && { status: selectedStatus || clickedStatus }),
            },
          }),
          api.get("/clients", {
            params: {
              unitId: activeUnit.id,
              ...(statusParam && { status: selectedStatus || clickedStatus }),
            },
          }),
          api.get("/employees", {
            params: {
              unitId: activeUnit.id,
              ...(statusParam && { status: selectedStatus || clickedStatus }),
            },
          }),
          api.get("/documents", {
            params: { unitId: activeUnit.id },
          }),
        ]);

      const usersData = normalizeItems(resUsers);
      const membersData = normalizeItems(resMembers);
      const clientsData = normalizeItems(resClients);
      const employeesData = normalizeItems(resEmployees);
      let documentsData = normalizeItems(resDocuments);

      if (statusParam)
        documentsData = documentsData.filter((d) =>
          statusParam.includes(d.status)
        );

      setStats({
        users: usersData.length,
        members: membersData.length,
        clients: clientsData.length,
        employees: employeesData.length,
        documents: documentsData.length,
      });

      setUserChart(
        buildChartData({
          active: usersData.filter((u) => u.status === "active").length,
          inactive: usersData.filter((u) => u.status === "inactive").length,
        })
      );

      setMemberChart(
        buildChartData({
          active: membersData.filter((m) => m.status === "active").length,
          inactive: membersData.filter((m) => m.status === "inactive").length,
        })
      );

      setClientChart(
        buildChartData({
          active: clientsData.filter((c) => c.status === "active").length,
          inactive: clientsData.filter((c) => c.status === "inactive").length,
        })
      );

      setEmployeeChart(
        buildChartData({
          active: employeesData.filter((e) => e.status === "active").length,
          inactive: employeesData.filter((e) => e.status === "inactive").length,
        })
      );

      const docChartData = {
        valid: documentsData.filter((d) => d.status === "valid").length,
        expiring: documentsData.filter((d) => d.status === "expiring").length,
        expired: documentsData.filter((d) => d.status === "expired").length,
      };

      setDocumentChart(buildChartData(docChartData, "document"));

      setRecentDocuments(documentsData.slice(0, 5));
      setRecentMembers(membersData.slice(0, 5));
      setRecentClients(clientsData.slice(0, 5));

    } catch (err) {
      console.error(err);
      setError("Impossibile caricare i dati della dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!activeUnit || authLoading) return;

    fetchDashboardData();
  }, [selectedStatus, clickedStatus, activeUnit?.id, authLoading]);

  if (authLoading || loading) return <p>Caricamento...</p>;

  const filters = (
    <div className="dashboard-filters">

      {user?.units?.length > 0 && (
        <select
          className="form-select"
          value={activeUnit?.id || ""}
          onChange={(e) => {
            const selected = user.units.find(
              (u) => u.id === Number(e.target.value)
            );
            changeUnit(selected);
          }}
        >
          {user.units.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>
      )}

      <select
        className="form-select"
        value={selectedStatus}
        onChange={(e) => {
          setSelectedStatus(e.target.value);
          setClickedStatus("");
        }}
      >
        <option value="">Tutti</option>
        <option value="active">Attivi</option>
        <option value="inactive">Inattivi</option>
      </select>

      {selectedStatus && (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            setSelectedStatus("");
            setClickedStatus("");
          }}
        >
          Reset filtro
        </Button>
      )}

    </div>
  );

  return (
    <PageLayout
      title="📊 Dashboard Amministrativo"
      subtitle="Controllo generale degli accessi alla piattaforma"
      filters={filters}
    >
      <div className="dashboard-kpi-grid">

        <Card title="Utenti" link="/users">
          <div className="kpi-value">{stats.users} risultati</div>
          <DonutChart data={userChart} />
        </Card>

        <Card title="Membri" link="/members">
          <div className="kpi-value">{stats.members} risultati</div>
          <DonutChart data={memberChart} />
        </Card>

        <Card title="Clienti" link="/clients">
          <div className="kpi-value">{stats.clients} risultati</div>
          <DonutChart data={clientChart} />
        </Card>

        <Card title="Dipendenti" link="/employees">
          <div className="kpi-value">{stats.employees} risultati</div>
          <DonutChart data={employeeChart} />
        </Card>

        <Card title="Documenti" link="/documents">
          <div className="kpi-value">{stats.documents} risultati</div>
          <DonutChart data={documentChart} />
        </Card>

      </div>

      <div className="dashboard-tables">

        <Card title="Ultimi Membri">
          {recentMembers.length === 0 ? (
            <EmptyState />
          ) : (
            <Table
              columns={[
                { key: "name", label: "Nome" },
                { key: "email", label: "Email" },
                { key: "status", label: "Stato" },
              ]}
              data={recentMembers}
            />
          )}
        </Card>

        <Card title="Ultimi Clienti">
          {recentClients.length === 0 ? (
            <EmptyState />
          ) : (
            <Table
              columns={[
                { key: "name", label: "Nome" },
                { key: "email", label: "Email" },
                { key: "phone", label: "Telefono" },
                { key: "status", label: "Stato" },
              ]}
              data={recentClients}
            />
          )}
        </Card>

        <Card title="Ultimi Documenti">
          {recentDocuments.length === 0 ? (
            <EmptyState />
          ) : (
            <Table
              columns={[
                { key: "owner_id", label: "Responsabile" },
                { key: "name", label: "Nome" },
                { key: "expiration_date", label: "scadenza" },
                { key: "status", label: "Stato" },
              ]}
              data={recentDocuments}
            />
          )}
        </Card>

      </div>

      {error && <p className="dashboard-error">{error}</p>}
    </PageLayout>
  );
};

export default AdminDashboard;