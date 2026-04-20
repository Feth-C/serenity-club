// frontend/src/components/layout/Sidebar.jsx

import { NavLink } from "react-router-dom";
import { useContext, useState, useEffect, useRef } from "react";
import { AuthContext } from "../../../contexts/AuthContext";
import Icone from "../../../assets/brand/Serenity_Icone.svg";
import Logotipo from "../../../assets/brand/Serenity_Logotipo.svg";
import "./sidebar.css";

const Sidebar = () => {
  const { user, logout, activeUnit, changeUnit } = useContext(AuthContext);
  const [expanded, setExpanded] = useState(false);
  const [openUserMenu, setOpenUserMenu] = useState(false);
  const [openUnitDropdown, setOpenUnitDropdown] = useState(false);
  const userMenuRef = useRef(null);
  const unitDropdownRef = useRef(null);

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

  return (
    <aside className={`sidebar ${expanded ? "sidebar--expanded" : ""}`}>
      <div className="sidebar__logo">
        {expanded ? <img src={Logotipo} alt="Serenity Club" /> : <img src={Icone} alt="Serenity" />}
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
        <button className="sidebar__user-trigger" onClick={() => setOpenUserMenu(!openUserMenu)}>
          <span className="sidebar__user-avatar">{user?.name?.charAt(0).toUpperCase()}</span>
          {expanded && <span className="sidebar__user-name">{user?.name}</span>}
        </button>

        {openUserMenu && (
          <div className="sidebar__user-menu">
            <div className="sidebar__user-info">
              <strong>{user?.name}</strong>
              <span>{user?.role}</span>
            </div>

            {user?.units?.length > 1 && (
              <div className="sidebar__user-units" ref={unitDropdownRef}>
                <button className="sidebar__user-units-trigger">
                  Unità {!openUnitDropdown && <span className="sidebar__user-active-unit">{activeUnit?.name}</span>}
                </button>
                {openUnitDropdown && (
                  <div className="sidebar__user-units-list">
                    {user.units.map((unit) => (
                      <button
                        key={unit.id}
                        onClick={() => {
                          changeUnit(unit);
                          setOpenUnitDropdown(false);
                          setOpenUserMenu(false);
                        }}
                        className={unit.id === activeUnit?.id ? "active" : ""}
                      >
                        {unit.name} {unit.id === activeUnit?.id && "✔"}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <button onClick={logout}>Logout</button>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;