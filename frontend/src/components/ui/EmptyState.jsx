// frontend/src/components/ui/EmptyState/EmptyState.jsx

import "./EmptyState.css";

const EmptyState = ({
  title = "Nenhum dado encontrado",
  description,
  action,
  icon
}) => {
  return (
    <div className="empty-state">
      {icon && <div className="empty-state__icon">{icon}</div>}

      <h3 className="empty-state__title">{title}</h3>

      {description && (
        <p className="empty-state__description">
          {description}
        </p>
      )}

      {action && (
        <div className="empty-state__action">
          {action}
        </div>
      )}
    </div>
  );
};

export default EmptyState;