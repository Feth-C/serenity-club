// frontend/src/pages/Employees/EmployeesForm.jsx

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { normalizeEntity } from '../../utils/normalizeEntity';
import api from '../../api/api';

const EmployeeForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [employee, setEmployee] = useState({ name: '', email: '', role: '', status: 'active' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      const fetchEmployee = async () => {
        try {
          const res = await api.get(`/employees/${id}`);
          setEmployee(normalizeEntity(res));
        } catch (err) {
          console.error('Errore nel caricamento del dipendente', err);
          setError('Non è stato possibile caricare il dipendente');
        }
      };
      fetchEmployee();
    }
  }, [id]);

  const handleChange = (e) => {
    setError('');
    setEmployee({ ...employee, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (id) {
        await api.put(`/employees/${id}`, employee);
      } else {
        await api.post('/employees', employee);
      }
      navigate('/employees');
    } catch (err) {
      console.error('Errore durante il salvataggio', err);
      setError(err.response?.data?.message || 'Errore durante il salvataggio del dipendente');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <button onClick={() => navigate(-1)} style={{ marginBottom: '10px' }}>
        ← Indietro
      </button>

      <h1>{id ? 'Modifica Dipendente' : 'Nuovo Dipendente'}</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <label>Nome:</label>
          <input
            type="text"
            name="name"
            value={employee.name}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={employee.email}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>Ruolo:</label>
          <input
            type="text"
            name="role"
            value={employee.role}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>Stato:</label>
          <select
            name="status"
            value={employee.status}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px' }}
          >
            <option value="active">Attivo</option>
            <option value="inactive">Inattivo</option>
          </select>
        </div>

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <button type="submit" disabled={loading} style={{ padding: '10px', width: '100%' }}>
          {loading ? 'Salvataggio...' : 'Salva'}
        </button>
      </form>
    </div>
  );
};

export default EmployeeForm;
