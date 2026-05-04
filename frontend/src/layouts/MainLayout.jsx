// frontend/src/layouts/MainLayout.jsx

import Sidebar from "../components/layout/Sidebar/Sidebar";
import WindowControls from "../components/layout/WindowControls/WindowControls"; // Importe aqui
import "../styles/layout.css";

const MainLayout = ({ children, user }) => {
  return (
    <div className="layout">
      {/* Os controles ficam aqui, no topo de tudo */}
      <WindowControls />

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