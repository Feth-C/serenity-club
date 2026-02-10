// frontend/src/routes/AppRoutes.jsx

import { Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

import Login from '../pages/Auth/Login';
import Dashboard from '../pages/Dashboard/Dashboard';
import UsersList from '../pages/Users/UsersList';
import UserForm from '../pages/Users/UserForm';
import MembersList from '../pages/Members/MembersList';
import MemberForm from '../pages/Members/MemberForm';
import EmployeesList from '../pages/Employees/EmployeesList';
import EmployeeForm from '../pages/Employees/EmployeeForm';
import DocumentsList from '../pages/Documents/DocumentsList';
import DocumentForm from '../pages/Documents/DocumentForm';
import ReportsMonthly from '../pages/Reports/ReportsMonthly';
// import ReportsDetailed from '../pages/Reports/ReportsDetailed'; - DESATIVADO
import MemberHome from '../pages/Members/MemberHome';
import TransactionsList from '../pages/Transactions/TransactionsList';
import TransactionForm from '../pages/Transactions/TransactionForm';
import FinanceDashboard from '../pages/Dashboard/FinanceDashboard';
import SessionForm from '../pages/Sessions/SessionForm';
import SessionsList from '../pages/Sessions/SessionsList';
import SessionCloseForm from '../pages/Sessions/SessionCloseForm';

const AppRoutes = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <p>Caricamento...</p>;

  return (
    <Routes>
      {/* Login */}
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
      <Route path="/" element={!user ? (<Navigate to="/login" />) : user.role === 'admin' ? (<Dashboard />) : user.role === 'manager' ? (<FinanceDashboard />) : user.role === 'member' ? (<Navigate to="/member" />) : (<Navigate to="/login" />)} />

      {/* Users */}
      <Route path="/users" element={user ? <UsersList /> : <Navigate to="/login" />} />
      <Route path="/users/new" element={user ? <UserForm /> : <Navigate to="/login" />} />
      <Route path="/users/edit/:id" element={user ? <UserForm /> : <Navigate to="/login" />} />

      {/* Members */}
      <Route path="/members" element={user ? <MembersList /> : <Navigate to="/login" />} />
      <Route path="/members/new" element={user ? <MemberForm /> : <Navigate to="/login" />} />
      <Route path="/members/edit/:id" element={user ? <MemberForm /> : <Navigate to="/login" />} />
      <Route path="/member" element={user && user.role === 'member' ? <MemberHome /> : <Navigate to="/login" />} />

      {/* Employees */}
      <Route path="/employees" element={user ? <EmployeesList /> : <Navigate to="/login" />} />
      <Route path="/employees/new" element={user ? <EmployeeForm /> : <Navigate to="/login" />} />
      <Route path="/employees/edit/:id" element={user ? <EmployeeForm /> : <Navigate to="/login" />} />

      {/* Documents */}
      <Route path="/documents" element={user ? <DocumentsList /> : <Navigate to="/login" />} />
      <Route path="/documents/new" element={user ? <DocumentForm /> : <Navigate to="/login" />} />
      <Route path="/documents/edit/:id" element={user ? <DocumentForm /> : <Navigate to="/login" />} />

      {/* Reports */}
      {<Route path="/reports" element={user ? <ReportsMonthly /> : <Navigate to="/login" />} />}
      {/*<Route path="/reports/dettagliati" element={user ? <ReportsDetailed /> : <Navigate to="/login" />} />  - DESATIVADO*/}

      {/* Transactions */}
      <Route path="/transactions" element={user ? <TransactionsList /> : <Navigate to="/login" />} />
      <Route path="/transactions/new" element={user ? <TransactionForm /> : <Navigate to="/login" />} />
      <Route path="/transactions/:id" element={user ? <TransactionForm /> : <Navigate to="/login" />} />

      {/* Finance Dashboard */}
      <Route path="/dashboard/finance" element={user && ['admin', 'manager'].includes(user.role) ? <FinanceDashboard /> : <Navigate to="/login" />} />

      {/* Sessions */}
      <Route path="/sessions" element={user ? <SessionsList /> : <Navigate to="/login" />} />
      <Route path="/sessions/new" element={user ? <SessionForm mode="create" /> : <Navigate to="/login" />} />
      <Route path="/sessions/edit/:id" element={user ? <SessionForm mode="edit" /> : <Navigate to="/login" />} />
      <Route path="/sessions/close/:id" element={user ? <SessionCloseForm mode="close" /> : <Navigate to="/login" />} />
      
    </Routes>
  );
};

export default AppRoutes;
