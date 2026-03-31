// frontend/src/routes/AppRoutes.jsx

import { Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

import Login from '../pages/Auth/Login';
import AdminDashboard from '../pages/Dashboard/AdminDashboard';
import ExecutiveDashboard from '../pages/Dashboard/ExecutiveDashboard';
import UsersList from '../pages/Users/UsersList';
import UserForm from '../pages/Users/UserForm';
import MembersList from '../pages/Members/MembersList';
import MemberForm from '../pages/Members/MemberForm';
import ClientsList from "../pages/Clients/ClientsList";
import ClientForm from "../pages/Clients/ClientForm";
import EmployeesList from '../pages/Employees/EmployeesList';
import EmployeeForm from '../pages/Employees/EmployeeForm';
import DocumentsList from '../pages/Documents/DocumentsList';
import DocumentForm from '../pages/Documents/DocumentForm';
import MemberHome from '../pages/Members/MemberHome';
import TransactionsList from '../pages/Transactions/TransactionsList';
import TransactionForm from '../pages/Transactions/TransactionForm';
import ReportsHub from '../pages/Reports/ReportsHub';
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
      <Route path="/" element={!user ? (<Navigate to="/login" />) : user.role === 'admin' ? (<AdminDashboard />) : user.role === 'manager' ? (<ExecutiveDashboard />) : user.role === 'member' ? (<Navigate to="/member" />) : (<Navigate to="/login" />)} />

      {/* Finance Dashboard */}
      <Route path="/dashboard/finance" element={user && ['admin', 'manager'].includes(user.role) ? <ExecutiveDashboard /> : <Navigate to="/login" />} />

      {/* Users */}
      <Route path="/users" element={user ? <UsersList /> : <Navigate to="/login" />} />
      <Route path="/users/new" element={user ? <UserForm /> : <Navigate to="/login" />} />
      <Route path="/users/edit/:id" element={user ? <UserForm /> : <Navigate to="/login" />} />

      {/* Members */}
      <Route path="/members" element={user ? <MembersList /> : <Navigate to="/login" />} />
      <Route path="/members/new" element={user ? <MemberForm /> : <Navigate to="/login" />} />
      <Route path="/members/edit/:id" element={user ? <MemberForm /> : <Navigate to="/login" />} />
      <Route path="/member" element={user && user.role === 'member' ? <MemberHome /> : <Navigate to="/login" />} />

      {/* Clients */}
      <Route path="/clients" element={user ? <ClientsList /> : <Navigate to="/login" />} />
      <Route path="/clients/new" element={user ? <ClientForm /> : <Navigate to="/login" />} />
      <Route path="/clients/edit/:id" element={user ? <ClientForm /> : <Navigate to="/login" />} />

      {/* Employees */}
      <Route path="/employees" element={user ? <EmployeesList /> : <Navigate to="/login" />} />
      <Route path="/employees/new" element={user ? <EmployeeForm /> : <Navigate to="/login" />} />
      <Route path="/employees/edit/:id" element={user ? <EmployeeForm /> : <Navigate to="/login" />} />

      {/* Documents */}
      <Route path="/documents" element={user ? <DocumentsList /> : <Navigate to="/login" />} />
      <Route path="/documents/new" element={user ? <DocumentForm /> : <Navigate to="/login" />} />
      <Route path="/documents/edit/:id" element={user ? <DocumentForm /> : <Navigate to="/login" />} />

      {/* Transactions */}
      <Route path="/transactions" element={user ? <TransactionsList /> : <Navigate to="/login" />} />
      <Route path="/transactions/new" element={user ? <TransactionForm /> : <Navigate to="/login" />} />
      <Route path="/transactions/:id" element={user ? <TransactionForm /> : <Navigate to="/login" />} />

      {/* Sessions */}
      <Route path="/sessions" element={user ? <SessionsList /> : <Navigate to="/login" />} />
      <Route path="/sessions/new" element={user ? <SessionForm mode="create" /> : <Navigate to="/login" />} />
      <Route path="/sessions/edit/:id" element={user ? <SessionForm mode="edit" /> : <Navigate to="/login" />} />
      <Route path="/sessions/close/:id" element={user ? <SessionCloseForm mode="close" /> : <Navigate to="/login" />} />

      {/* Clients */}
      <Route path="/clients" element={user ? <ClientsList /> : <Navigate to="/login" />} />
      <Route path="/clients/new" element={user ? <ClientForm /> : <Navigate to="/login" />} />
      <Route path="/clients/:id" element={user ? <ClientForm /> : <Navigate to="/login" />} />
      {/* Reports */}
      <Route
        path="/reports"
        element={user && ['admin', 'manager'].includes(user.role) ? <ReportsHub /> : <Navigate to="/login" />}
      />

    </Routes>
  );
};

export default AppRoutes;
