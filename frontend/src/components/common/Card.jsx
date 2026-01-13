// frontend/src/components/common/Card.jsx

import { Link } from 'react-router-dom';

const Card = ({ title, value, link }) => {
  return (
    <div
      style={{
        flex: 1,
        padding: '20px',
        background: '#338bfdff',
        borderRadius: '8px'
      }}
    >
      <h3>{title}</h3>

      <p style={{ fontSize: '24px' }}>{value}</p>

      {link && (
        <Link
          to={link}
          style={{
            textDecoration: 'none',
            color: '#ffffff',
            fontWeight: 'bold'
          }}
        >
          Visualizza tutti
        </Link>
      )}
    </div>
  );
};

export default Card;

