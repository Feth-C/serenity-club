// frontend/src/App.jsx

import AppRoutes from './routes/AppRoutes';
import { useContext } from 'react';
import { AuthContext } from './contexts/AuthContext';
import MainLayout from './layouts/MainLayout';
import MemberLayout from './layouts/MemberLayout';
import "./styles/global.css";

function App() {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <AppRoutes />;
  }

  if (user.role === "member") {
    return (
      <MemberLayout user={user}>
        <AppRoutes />
      </MemberLayout>
    );
  }

  return (
    <MainLayout user={user}>
      <AppRoutes />
    </MainLayout>
  );
}

export default App;
