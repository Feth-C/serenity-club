// frontend/src/pages/Members/MembersForm.jsx

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { normalizeEntity } from '../../utils/normalizeEntity';
import api from '../../api/api';

const MemberForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [member, setMember] = useState({ name: '', email: '', status: 'active' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      const fetchMember = async () => {
        try {
          const res = await api.get(`/members/${id}`);
          setMember(normalizeEntity(res));
        } catch (err) {
          console.error('Errore durante il caricamento del membro', err);
          setError('Non è stato possibile caricare il membro');
        }
      };
      fetchMember();
    }
  }, [id]);

  const handleChange = (e) => {
    setError('');
    setMember({ ...member, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (id) {
        await api.put(`/members/${id}`, member);
      } else {
        await api.post('/members', member);
      }
      navigate('/members');
    } catch (err) {
      console.error('Errore durante il salvataggio del membro:', err);
      setError(err.response?.data?.message || 'Errore durante il salvataggio del membro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <button onClick={() => navigate(-1)} style={{ marginBottom: '10px' }}>
        ← Indietro
      </button>

      <h1>{id ? 'Modifica membro' : 'Nuovo membro'}</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <label>Nome:</label>
          <input
            type="text"
            name="name"
            value={member.name}
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
            value={member.email}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>Stato:</label>
          <select name="status" value={member.status} onChange={handleChange} style={{ width: '100%', padding: '8px' }}>
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

export default MemberForm;
