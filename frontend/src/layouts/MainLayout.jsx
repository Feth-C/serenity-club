// frontend/src/layouts/MainLayout.jsx

import Sidebar from "../components/layout/Sidebar/Sidebar";
import "../styles/layout.css";

const MainLayout = ({ children, user }) => {
  return (
    <div className="layout">
      <Sidebar />

      <div className="layout__main">
        <main className="content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
