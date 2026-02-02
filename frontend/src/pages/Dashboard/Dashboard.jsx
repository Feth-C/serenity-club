// frontend/src/pages/Dashboard/Dashboard.jsx

import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { normalizeItems } from '../../utils/normalizeItems';
import api from '../../api/api';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import DonutChart from '../../components/charts/DonutChart';
import LogoutButton from '../../components/common/LogoutButton';

const Dashboard = () => {
  const { user, activeUnit, changeUnit, loading: authLoading } = useContext(AuthContext);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({ users: 0, members: 0, employees: 0, documents: 0 });
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentMembers, setRecentMembers] = useState([]);

  const [userChart, setUserChart] = useState({ labels: [], datasets: [] });
  const [memberChart, setMemberChart] = useState({ labels: [], datasets: [] });
  const [employeeChart, setEmployeeChart] = useState({ labels: [], datasets: [] });
  const [documentChart, setDocumentChart] = useState({ labels: [], datasets: [] });

  const [selectedStatus, setSelectedStatus] = useState('');
  const [clickedStatus, setClickedStatus] = useState('');

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
    if (!activeUnit) return;
    console.log('[Dashboard] Fetching dashboard data for unit:', activeUnit);

    setLoading(true);
    setError('');
    try {
      let statusParam;
      if (selectedStatus === 'active' || clickedStatus === 'active') statusParam = ['valid', 'expiring'];
      else if (selectedStatus === 'inactive' || clickedStatus === 'inactive') statusParam = ['expired'];

      const [resUsers, resMembers, resEmployees, resDocuments] = await Promise.all([
        api.get('/users', { params: { unitId: activeUnit.id, ...(statusParam && { status: selectedStatus || clickedStatus }) } }),
        api.get('/members', { params: { unitId: activeUnit.id, ...(statusParam && { status: selectedStatus || clickedStatus }) } }),
        api.get('/employees', { params: { unitId: activeUnit.id, ...(statusParam && { status: selectedStatus || clickedStatus }) } }),
        api.get('/documents', { params: { unitId: activeUnit.id } }),
      ]);
      console.log('[Dashboard] resUsers:', resUsers);
      console.log('[Dashboard] resMembers:', resMembers);
      console.log('[Dashboard] resEmployees:', resEmployees);
      console.log('[Dashboard] resDocuments:', resDocuments);
      const usersData = normalizeItems(resUsers);
      const membersData = normalizeItems(resMembers);
      const employeesData = normalizeItems(resEmployees);
      let documentsData = normalizeItems(resDocuments);

      if (statusParam) documentsData = documentsData.filter(d => statusParam.includes(d.status));

      setStats({
        users: usersData.length,
        members: membersData.length,
        employees: employeesData.length,
        documents: documentsData.length,
      });

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

      setRecentUsers(usersData.slice(0, 5));
      setRecentMembers(membersData.slice(0, 5));

    } catch (err) {
      console.error(err);
      setError('Impossibile caricare i dati della dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!activeUnit || authLoading) return;
    fetchDashboardData();
  }, [selectedStatus, clickedStatus, activeUnit?.id, authLoading]);

  if (authLoading || loading) return <p>Caricamento...</p>;

  return (
    <div style={{ padding: '20px', fontFamily: 'trebuchet ms, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Cruscotto Aministrativo</h1>
        <LogoutButton />
      </div>

      {/* Unidade ativa */}
      {user?.units?.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <label>Unità:</label>
          <select
            value={activeUnit?.id || ''}
            onChange={e => {
              const selected = user.units.find(u => u.id === Number(e.target.value));
              
              changeUnit(selected);
            }}
            style={{ marginLeft: '10px', padding: '5px' }}
          >
            {user.units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
        </div>
      )}

      {/* Filtro global */}
      <div style={{ marginBottom: '20px' }}>
        <label>Filtra per stato:</label>
        <select
          value={selectedStatus}
          onChange={e => { setSelectedStatus(e.target.value); setClickedStatus(''); }}
          style={{ marginLeft: '10px', padding: '5px' }}
        >
          <option value="">Tutti</option>
          <option value="active">Attivi</option>
          <option value="inactive">Inattivi</option>
        </select>
      </div>

      {/* Cards */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', color: '#272727ff' }}>
        <Card title="Utenti" value={stats.users} link="/users" />
        <Card title="Membri" value={stats.members} link="/members" />
        <Card title="Dipendenti" value={stats.employees} link="/employees" />
        <Card title="Documenti" value={stats.documents} link="/documents" />
      </div>

      {/* Donuts */}
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

      {/* Últimos registros */}
      <div style={{ display: 'flex', gap: '40px' }}>
        <div style={{ flex: 2 }}>
          <h2>Ultimi Utenti</h2>
          {recentUsers.length === 0 ? <p>Nessun utente recente.</p> :
            <Table columns={[{ key: 'name', label: 'Nome' }, { key: 'email', label: 'Email' }, { key: 'status', label: 'Stato' }]} data={recentUsers} />}
        </div>

        <div style={{ flex: 2 }}>
          <h2>Ultimi Membri</h2>
          {recentMembers.length === 0 ? <p>Nessun membro recente.</p> :
            <Table columns={[{ key: 'name', label: 'Nome' }, { key: 'email', label: 'Email' }, { key: 'status', label: 'Stato' }]} data={recentMembers} />}
        </div>
      </div>

      {error && <p style={{ color: 'red', marginTop: '20px' }}>{error}</p>}
    </div>
  );
};

export default Dashboard;

