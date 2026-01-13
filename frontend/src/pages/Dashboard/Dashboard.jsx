// frontend/src/pages/Dashboard/Dashboard.jsx

import { useEffect, useState } from 'react';
import { normalizeItems } from '../../utils/normalizeItems';
import api from '../../api/api';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import DonutChart from '../../components/charts/DonutChart';
import LogoutButton from '../../components/common/LogoutButton';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [stats, setStats] = useState({ users: 0, members: 0, employees: 0, documents: 0 });
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentMembers, setRecentMembers] = useState([]);

  const [userChart, setUserChart] = useState({ labels: [], datasets: [] });
  const [memberChart, setMemberChart] = useState({ labels: [], datasets: [] });
  const [employeeChart, setEmployeeChart] = useState({ labels: [], datasets: [] });
  const [documentChart, setDocumentChart] = useState({ labels: [], datasets: [] });

  const [selectedStatus, setSelectedStatus] = useState(''); // filtro global
  const [clickedStatus, setClickedStatus] = useState(''); // filtro por clique no Donut

  // -----------------------------
  // Helper para construir gráficos
  // -----------------------------
  const buildChartData = (items, type = 'user') => {
    if (type === 'document') {
      const active = items.valid + items.expiring;
      const inactive = items.expired;
      return {
        labels: ['Attivi', 'Inattivi'],
        datasets: [{ data: [active, inactive], backgroundColor: ['#36A2EB', '#FF6384'] }],
      };
    } else {
      const active = items.active || 0;
      const inactive = items.inactive || 0;
      return {
        labels: ['Attivi', 'Inattivi'],
        datasets: [{ data: [active, inactive], backgroundColor: ['#36A2EB', '#FF6384'] }],
      };
    }
  };

  // -----------------------------
  // Fetch dos dados da dashboard
  // -----------------------------
  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');

    try {
      let statusParam;

      // converte filtro global para os valores do backend
      if (selectedStatus === 'active' || clickedStatus === 'active') {
        statusParam = ['valid', 'expiring'];
      } else if (selectedStatus === 'inactive' || clickedStatus === 'inactive') {
        statusParam = ['expired'];
      } else {
        statusParam = undefined; // todos
      }

      // -----------------------------
      // Fetch usuários, membros, empregados
      // -----------------------------
      const [resUsers, resMembers, resEmployees, resDocuments] = await Promise.all([
        api.get('/users', { params: { page: 1, perPage: 1000, ...(statusParam && { status: selectedStatus || clickedStatus }) } }),
        api.get('/members', { params: { page: 1, perPage: 1000, ...(statusParam && { status: selectedStatus || clickedStatus }) } }),
        api.get('/employees', { params: { page: 1, perPage: 1000, ...(statusParam && { status: selectedStatus || clickedStatus }) } }),
        api.get('/documents', { params: { page: 1, perPage: 1000 } }), // buscamos todos e filtramos aqui
      ]);

      const usersData = normalizeItems(resUsers);
      const membersData = normalizeItems(resMembers);
      const employeesData = normalizeItems(resEmployees);
      let documentsData = normalizeItems(resDocuments);

      // -----------------------------
      // Aplica filtro de documentos manualmente
      // -----------------------------
      if (statusParam) {
        documentsData = documentsData.filter(d => statusParam.includes(d.status));
      }

      // -----------------------------
      // Estatísticas
      // -----------------------------
      setStats({
        users: usersData.length,
        members: membersData.length,
        employees: employeesData.length,
        documents: documentsData.length
      });

      // -----------------------------
      // Gráficos
      // -----------------------------
      setUserChart(buildChartData({
        active: usersData.filter(u => u.status === 'active').length,
        inactive: usersData.filter(u => u.status === 'inactive').length
      }));
      setMemberChart(buildChartData({
        active: membersData.filter(m => m.status === 'active').length,
        inactive: membersData.filter(m => m.status === 'inactive').length
      }));
      setEmployeeChart(buildChartData({
        active: employeesData.filter(e => e.status === 'active').length,
        inactive: employeesData.filter(e => e.status === 'inactive').length
      }));

      const docChartData = {
        valid: documentsData.filter(d => d.status === 'valid').length,
        expiring: documentsData.filter(d => d.status === 'expiring').length,
        expired: documentsData.filter(d => d.status === 'expired').length
      };
      setDocumentChart(buildChartData(docChartData, 'document'));

      // -----------------------------
      // Últimos 5 registros
      // -----------------------------
      setRecentUsers(usersData.slice(0, 5));
      setRecentMembers(membersData.slice(0, 5));

    } catch (err) {
      console.error('Errore nel caricamento della dashboard', err);
      setError('Impossibile caricare i dati della dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [selectedStatus, clickedStatus]);

  if (loading) return <p>Caricamento...</p>;

  return (
    <div style={{ padding: '20px', fontFamily: 'trebuchet ms, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Dashboard</h1>
        <LogoutButton />
      </div>

      {/* Filtro global */}
      <div style={{ marginBottom: '20px' }}>
        <label>Filtra per stato:</label>
        <select
          value={selectedStatus}
          onChange={(e) => { setSelectedStatus(e.target.value); setClickedStatus(''); }}
          style={{ marginLeft: '10px', padding: '5px' }}
        >
          <option value="">Tutti</option>
          <option value="active">Attivi</option>
          <option value="inactive">Inattivi</option>
        </select>
      </div>

      {/* Cards de estatísticas */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', color: '#272727ff' }}>
        <Card title="Utenti" value={stats.users} link="/users" />
        <Card title="Membri" value={stats.members} link="/members" />
        <Card title="Dipendenti" value={stats.employees} link="/employees" />
        <Card title="Documenti" value={stats.documents} link="/documents" />
      </div>

      {/* Gráficos Donut */}
      <div style={{ display: 'flex', gap: '40px', marginBottom: '40px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, maxWidth: '150px' }}>
          <DonutChart title="Utenti" data={userChart} onClickSegment={setClickedStatus} />
        </div>
        <div style={{ flex: 1, maxWidth: '150px' }}>
          <DonutChart title="Membri" data={memberChart} onClickSegment={setClickedStatus} />
        </div>
        <div style={{ flex: 1, maxWidth: '150px' }}>
          <DonutChart title="Dipendenti" data={employeeChart} onClickSegment={setClickedStatus} />
        </div>
        <div style={{ flex: 1, maxWidth: '150px' }}>
          <DonutChart title="Documenti" data={documentChart} onClickSegment={setClickedStatus} />
        </div>
      </div>

      {/* Últimos membros e usuários */}
      <div style={{ display: 'flex', gap: '40px' }}>
        <div style={{ flex: 2 }}>
          <h2>Ultimi Utenti</h2>
          {recentUsers.length === 0 ? (
            <p>Nessun utente recente.</p>
          ) : (
            <Table columns={[
              { key: 'name', label: 'Nome' },
              { key: 'email', label: 'Email' },
              { key: 'status', label: 'Stato' }
            ]} data={recentUsers} />
          )}
        </div>

        <div style={{ flex: 2 }}>
          <h2>Ultimi Membri</h2>
          {recentMembers.length === 0 ? (
            <p>Nessun membro recente.</p>
          ) : (
            <Table columns={[
              { key: 'name', label: 'Nome' },
              { key: 'email', label: 'Email' },
              { key: 'status', label: 'Stato' }
            ]} data={recentMembers} />
          )}
        </div>
      </div>

      {error && <p style={{ color: 'red', marginTop: '20px' }}>{error}</p>}
    </div>
  );
};

export default Dashboard;
