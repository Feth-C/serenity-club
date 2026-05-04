// frontend/src/components/layout/Sidebar.jsx

import { NavLink } from "react-router-dom";
import { useContext, useState, useEffect, useRef } from "react";
import { AuthContext } from "../../../contexts/AuthContext";
import Icone from "../../../assets/brand/Serenity_Icone.svg";
import Logotipo from "../../../assets/brand/Serenity_Logotipo.svg";
import "./sidebar.css";

const Sidebar = () => {
  const { user, logout, activeUnit, changeUnit } = useContext(AuthContext);
  const [expanded, setExpanded] = useState(true);
  const [openUserMenu, setOpenUserMenu] = useState(false);
  const [openUnitDropdown, setOpenUnitDropdown] = useState(false);
  const userMenuRef = useRef(null);
  const unitDropdownRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  const menu = {
    admin: [
      { label: "Dashboard", path: "/", icon: "📊" },
      { label: "Finanza", path: "/dashboard/finance", icon: "🏢" },
      { label: "Sessioni", path: "/sessions", icon: "⌛" },
      { label: "Transazioni", path: "/transactions", icon: "💸" },
      { label: "Report", path: "/reports", icon: "📈" },
      { label: "Utenti", path: "/users", icon: "👤" },
      { label: "Membri", path: "/members", icon: "🧑‍🤝‍🧑" },
      { label: "Dipendenti", path: "/employees", icon: "🧑‍💼" },
      { label: "Documenti", path: "/documents", icon: "📄" },
    ],
    manager: [
      { label: "Dashboard Finanza", path: "/", icon: "📊" },
      { label: "Sessioni", path: "/sessions", icon: "📅" },
      { label: "Transazioni", path: "/transactions", icon: "💸" },
      { label: "Report", path: "/reports", icon: "📈" },
      { label: "Membri", path: "/members", icon: "🧑‍🤝‍🧑" },
    ],
    member: [{ label: "La Mia Area", path: "/member", icon: "🔐" }],
  };

  const items = menu[user?.role] || [];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setOpenUserMenu(false);
      if (unitDropdownRef.current && !unitDropdownRef.current.contains(e.target)) setOpenUnitDropdown(false);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  useEffect(() => {
    if (expanded && !isHovered && !openUserMenu && !openUnitDropdown) { // Só fecha se o usuário não estiver com o mouse lá
      const timer = setTimeout(() => {
        setExpanded(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [expanded, isHovered, openUserMenu, openUnitDropdown]);

  return (
    <aside className={`sidebar ${expanded ? "sidebar--expanded" : ""}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="sidebar__logo app-drag">
        {expanded ?
          <img src={Logotipo} alt="Serenity Club" className="app-no-drag" /> :
          <img src={Icone} alt="Serenity" className="app-no-drag" />
        }
      </div>

      <div className="sidebar__top">
        <button className="sidebar__toggle" onClick={() => setExpanded(!expanded)}>
          <span className={`sidebar__chevron ${expanded ? "rotated" : ""}`}>›</span>
        </button>
      </div>

      <nav className="sidebar__nav">
        {items.map((item) => (
          <NavLink key={item.path} to={item.path} className="sidebar__link">
            <span className="sidebar__icon">{item.icon}</span>
            {expanded && <span className="sidebar__label">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar__user" ref={userMenuRef}>
        <button
          className="sidebar__user-trigger"
          onClick={() => setOpenUserMenu(!openUserMenu)}
          title={!expanded ? user?.name : ""}
        >
          <span className="sidebar__user-avatar">{user?.name?.charAt(0).toUpperCase()}</span>
          {expanded && <span className="sidebar__user-name">{user?.name}</span>}
        </button>

        {openUserMenu && (
          <div className="sidebar__user-menu">
            <div className="sidebar__user-info">
              <strong>{user?.name}</strong>
              <span>{user?.role}</span>
            </div>

            <hr className="sidebar__menu-divider" />

            {user?.units?.length > 1 && (
              <div className="sidebar__user-units" ref={unitDropdownRef}>
                {/* ADICIONADO O ONCLICK AQUI */}
                <button
                  className="sidebar__user-units-trigger"
                  onClick={(e) => {
                    e.stopPropagation(); // Evita fechar o menu pai
                    setOpenUnitDropdown(!openUnitDropdown);
                  }}
                >
                  <span className="sidebar__unit-label">📍 Cambia Unità</span>
                  <span className={`sidebar__chevron-mini ${openUnitDropdown ? "rotated" : ""}`}>›</span>
                </button>

                {openUnitDropdown && (
                  <div className="sidebar__user-units-list">
                    {user.units.map((unit) => (
                      <button
                        key={unit.id}
                        className={`sidebar__unit-option ${unit.id === activeUnit?.id ? "active" : ""}`}
                        onClick={() => {
                          changeUnit(unit);
                          setOpenUnitDropdown(false);
                          setOpenUserMenu(false);
                        }}
                      >
                        <span className="unit-dot"></span>
                        {unit.name}
                        {unit.id === activeUnit?.id && <span className="check-icon">✔</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <button className="sidebar__logout-btn" onClick={logout}>
              🚪 Logout
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;