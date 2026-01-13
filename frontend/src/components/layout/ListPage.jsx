// frontend/src/components/layout/ListPage.jsx

const ListPage = ({
  title,
  buttonLabel,
  onAdd,
  children
}) => {
  return (
    <div style={{ padding: '20px' }}>

      {/* HEADER */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}
      >
        <h1>{title}</h1>

        {buttonLabel && onAdd && (
          <button
            onClick={onAdd}
            style={{
              padding: '8px 14px',
              borderRadius: '6px',
              backgroundColor: '#2563eb',
              color: '#fff',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            {buttonLabel}
          </button>
        )}
      </div>

      {/* CONTENT */}
      {children}
    </div>
  );
};

export default ListPage;

