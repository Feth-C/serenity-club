// frontend/src/pages/Sessions/SessionForm.jsx

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/api';
import { getNextRoundedHour } from '../../hooks/useSessions';

const SessionForm = ({ mode = 'create' }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = mode === 'edit';

  // -----------------------------
  // Estados principais
  // -----------------------------
  const [visitType, setVisitType] = useState('first');
  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedClientName, setSelectedClientName] = useState('');
  const [clientName, setClientName] = useState('');
  const [contact, setContact] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [startTime, setStartTime] = useState(getNextRoundedHour());
  const [plannedMinutes, setPlannedMinutes] = useState(60);
  const [plannedAmount, setPlannedAmount] = useState(250);
  const [currency, setCurrency] = useState('EUR');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // -----------------------------
  // Carregar sessão para edição
  // -----------------------------
  useEffect(() => {
    if (!isEdit || !id) return;

    const loadSession = async () => {
      try {
        const res = await api.get(`/sessions/${id}`);
        const s = res.data;

        setVisitType(s.visit_type);
        if (s.client_id) setSelectedClientId(s.client_id);
        setClientName(s.client_name || '');
        setContact(s.contact || '');
        setEmail(s.email || '');
        setAddress(s.address || '');
        setNotes(s.notes || '');
        setStartTime(s.start_time.slice(0, 16));
        setPlannedMinutes(s.planned_minutes);
        setPlannedAmount(s.planned_amount ?? '');
        setCurrency(s.currency);
      } catch (err) {
        setError('Errore nel caricamento della sessione');
      }
    };

    loadSession();
  }, [isEdit, id]);

  // -----------------------------
  // Carregar clientes para "return"
  // -----------------------------
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await api.get('/clients?active=true');
        setClients(res.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    if (visitType === 'return') fetchClients();
  }, [visitType]);

  // -----------------------------
  // Submit
  // -----------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload = {
        visit_type: visitType,
        planned_minutes: Number(plannedMinutes),
        planned_amount: plannedAmount ? Number(plannedAmount) : undefined,
        currency,
        notes: notes || undefined,
        start_time: startTime ? new Date(startTime).toISOString() : undefined,
      };

      // "First" -> criar cliente se necessário
      if (visitType === 'first') {
        if (!clientName) throw new Error('Nome do cliente é obrigatório.');
        payload.client_name = clientName;
        payload.contact = contact || undefined;
        payload.email = email || undefined;
        payload.address = address || undefined;
      }

      // "Return" → só manda client_id
      if (visitType === 'return') {
        if (!selectedClientId) throw new Error('Selecione um cliente existente.');

        payload.client_id = selectedClientId;
        payload.client_name = selectedClientName || undefined;
      }


      // Criar ou atualizar sessão
      if (isEdit) {
        await api.put(`/sessions/${id}`, payload);
      } else {
        await api.post('/sessions', payload);
      }

      navigate('/sessions');
    } catch (err) {
      console.error(err.response?.data || err);
      setError(err.response?.data?.message || err.message || 'Errore nel salvataggio');
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // Render
  // -----------------------------
  return (
    <div style={{ padding: 20, maxWidth: 500 }}>
      <h1>{isEdit ? 'Modifica sessione' : 'Nuova sessione'}</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Tipo visita */}
        <div>
          <label>Tipo visita</label>
          <select
            value={visitType}
            onChange={(e) => { setVisitType(e.target.value); setSelectedClientId(''); }}
            required
          >
            <option value="first">Prima volta</option>
            <option value="return">Ritorno</option>
          </select>
        </div>

        {/* Cliente */}
        {visitType === 'first' && (
          <>
            <div>
              <label>Nome Cliente</label>
              <input type="text" value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Nome cliente" required />
            </div>
            <div>
              <label>Contato / Telefone</label>
              <input type="text" value={contact} onChange={(e) => setContact(e.target.value)} />
            </div>
            <div>
              <label>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <label>Endereço</label>
              <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>
          </>
        )}
        {visitType === 'return' && (
          <div>
            <label>Cliente</label>
            <select
              value={selectedClientId}
              onChange={(e) => {
                const id = e.target.value;
                setSelectedClientId(id);

                const client = clients.find(c => String(c.id) === String(id));
                setSelectedClientName(client ? client.name : '');
              }}
              required
            >
              <option value="">Seleziona cliente</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

          </div>
        )}

        {/* Restante formulário */}
        <div>
          <label>Inizio</label>
          <input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
        </div>
        <div>
          <label>Minuti pianificati</label>
          <input type="number" value={plannedMinutes} onChange={(e) => setPlannedMinutes(e.target.value)} min="1" required />
        </div>
        <div>
          <label>Importo pianificato</label>
          <input type="number" step="0.01" value={plannedAmount} onChange={(e) => setPlannedAmount(e.target.value)} />
        </div>
        <div>
          <label>Valuta</label>
          <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
            <option value="EUR">EUR (€)</option>
            <option value="CHF">CHF (CHF)</option>
          </select>
        </div>
        <div>
          <label>Note</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Salvataggio...' : 'Salva'}
        </button>
      </form>
    </div>
  );
};

export default SessionForm;
