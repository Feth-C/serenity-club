// frontend/src/components/ui/Card/Card.jsx

import { Link } from "react-router-dom";
import "./card.css";

const Card = ({ title, value, link, children, className = "", headerBar = false }) => {
  return (
    <div className={`card ${className}`}>

      {(title || link) && (
        <div className={headerBar ? "card-header-bar" : "card-header"}>
          {title && <h3>{title}</h3>}

          {link && (
            <Link to={link} className="card-btn">
              +
            </Link>
          )}
        </div>
      )}

      {value && <div className="card-body">{value}</div>}

      {children && <div className="card-body">{children}</div>}

    </div>
  );
};

export default Card;