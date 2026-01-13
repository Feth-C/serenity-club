// frontend/src/pages/Documents/DocumentForm.jsx

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { normalizeItems } from '../../utils/normalizeItems';
import { normalizeEntity } from '../../utils/normalizeEntity';
import api from '../../api/api';

const DocumentForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [ownerType, setOwnerType] = useState('');
  const [ownerId, setOwnerId] = useState('');
  const [owners, setOwners] = useState([]);
  const [file, setFile] = useState(null);

  const [form, setForm] = useState({
    name: '',
    type: '',
    expiration_date: '',
    status: 'valid',
    notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isEdit) return;

    const fetchDocument = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/documents/${id}`);
        const data = normalizeEntity(res);

        setForm({
          name: data.name || '',
          type: data.type || '',
          expiration_date: data.expiration_date || '',
          status: data.status || 'valid',
          notes: data.notes || ''
        });

        setOwnerType(data.owner_type || '');
        setOwnerId(data.owner_id || '');
      } catch (err) {
        console.warn('Documento non trovato', err);
        setError('Documento non disponibile');
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [id, isEdit]);

  useEffect(() => {
    if (!ownerType) {
      setOwners([]);
      setOwnerId('');
      return;
    }

    const endpoint = ownerType === 'member' ? '/members' : '/employees';

    const fetchOwners = async () => {
      try {
        const res = await api.get(endpoint, { params: { perPage: 1000 } });
        setOwners(normalizeItems(res));
      } catch (err) {
        console.warn('Errore caricamento proprietari', err);
        setOwners([]);
      }
    };

    fetchOwners();
  }, [ownerType]);

  const handleChange = (e) => {
    setError('');
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = new FormData();
      payload.append('name', form.name);
      payload.append('type', form.type);
      payload.append('expiration_date', form.expiration_date);
      payload.append('status', form.status);
      payload.append('notes', form.notes);
      payload.append('owner_type', ownerType);
      payload.append('owner_id', ownerId);
      if (file) payload.append('file', file);

      if (isEdit) {
        await api.put(`/documents/${id}`, payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await api.post('/documents', payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      navigate('/documents');
    } catch (err) {
      console.error('Errore salvataggio documento', err);
      setError('Errore durante il salvataggio');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <button onClick={() => navigate(-1)} style={{ marginBottom: '10px' }}>
        ← Indietro
      </button>

      <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>
        {isEdit ? 'Modifica Documento' : 'Nuovo Documento'}
      </h1>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div style={{ marginBottom: '15px' }}>
          <label>Nome</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Tipo</label>
          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px' }}
          >
            <option value="">Seleziona</option>
            <option value="contract">Contratto</option>
            <option value="identity">Documento Identità</option>
            <option value="certificate">Certificato</option>
            <option value="other">Altro</option>
          </select>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Data di scadenza</label>
          <input
            type="date"
            name="expiration_date"
            value={form.expiration_date}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Stato</label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px' }}
          >
            <option value="valid">Valido</option>
            <option value="expiring">In scadenza</option>
            <option value="expired">Scaduto</option>
          </select>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Responsabile</label>
          <select
            value={ownerType}
            onChange={(e) => { setOwnerType(e.target.value); setOwnerId(''); }}
            style={{ width: '100%', padding: '8px' }}
          >
            <option value="">Seleziona</option>
            <option value="member">Membro</option>
            <option value="employee">Dipendente</option>
          </select>
        </div>

        {ownerType && (
          <div style={{ marginBottom: '15px' }}>
            <label>{ownerType === 'member' ? 'Membro' : 'Dipendente'}</label>
            <select
              value={ownerId}
              onChange={(e) => setOwnerId(e.target.value)}
              required
              style={{ width: '100%', padding: '8px' }}
            >
              <option value="">Seleziona</option>
              {owners.map(o => (
                <option key={o.id} value={o.id}>
                  {o.name || o.full_name || o.email}
                </option>
              ))}
            </select>
          </div>
        )}

        <div style={{ marginBottom: '15px' }}>
          <label>Note</label>
          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            rows={4}
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>File</label>
          <input type="file" onChange={handleFileChange} />
          {isEdit && form.file_path && (
            <p>
              <a href={form.file_path} target="_blank" rel="noreferrer">Scarica file attuale</a>
            </p>
          )}
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Salvataggio...' : 'Salva'}
        </button>
      </form>
    </div>
  );
};

export default DocumentForm;
