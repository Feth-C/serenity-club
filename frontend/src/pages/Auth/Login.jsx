// frontend/src/pages/Auth/Login.jsx

import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { useEffect } from 'react';

const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useContext(AuthContext);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated()) navigate('/');
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Errore durante login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#1d1d1dff',
        padding: '20px',
        boxSizing: 'border-box'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '400px',
          minWidth: '300px',
          padding: '40px 25px',
          background: '#051427ff',
          borderRadius: '12px',
          boxShadow: '0 0 20px rgba(0,0,0,0.3)',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#ffffff' }}>Login</h2>
        <form style={{ display: 'flex', flexDirection: 'column', gap: '15px' }} onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ color: '#ffffff', marginBottom: '5px' }}>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '6px',
                border: 'none',
                boxSizing: 'border-box',
                fontSize: '16px'
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ color: '#ffffff', marginBottom: '5px' }}>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '6px',
                border: 'none',
                boxSizing: 'border-box',
                fontSize: '16px'
              }}
            />
          </div>

          {error && <p style={{ color: 'red', textAlign: 'center', marginTop: '5px' }}>{error}</p>}

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '14px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: '#045891ff',
              color: '#fff',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '16px',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = '#083a5cff')}
            onMouseLeave={(e) => (e.target.style.backgroundColor = '#045891ff')}
          >
            {loading ? 'Entrando...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
