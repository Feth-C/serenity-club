// frontend/src/components/layout/PageLayout/PageLayout.jsx

import "./pageLayout.css";

const PageLayout = ({ title, subtitle, actions, filters, children, backButton, pagination, maxWidth = "1440px", centered = true }) => {
  return (
    <div className={`page-layout ${centered ? "page-layout--centered" : ""}`} style={{ maxWidth }}>
      {backButton && <div className="page-layout__backButton">{backButton}</div>}

      <div className="page-layout__header">
        <div className="page-layout__title-group">
          <h1 className="page-layout__title">{title}</h1>
          {subtitle && <p className="page-layout__subtitle">{subtitle}</p>}
        </div>
        {actions && <div className="page-layout__actions">{actions}</div>}
      </div>

      {filters && <div className="page-layout__filters">{filters}</div>}
      <div className="page-layout__divider" />
      <div className="page-layout__content">{children}</div>
      {pagination && <div className="page-layout__pagination">{pagination}</div>}
    </div>
  );
};

export default PageLayout;