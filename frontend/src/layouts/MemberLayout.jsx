// frontend/src/layouts/MemberLayout.jsx

import "./memberLayout.css";

const MemberLayout = ({ children, user }) => {
  return (
    <div className="member-layout">
      <header className="member-header">
        <div className="member-header__logo">
          Serenity Club
        </div>

        <div className="member-header__user">
          {user?.name}
        </div>
      </header>

      <main className="member-content">
        {children}
      </main>
    </div>
  );
};

export default MemberLayout;
