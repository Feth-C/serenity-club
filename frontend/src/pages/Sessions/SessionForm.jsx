// frontend/src/pages/Sessions/SessionForm.jsx

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createSession, getSessionById, updateSession } from '../../api/sessions';
import { getNextRoundedHour } from '../../hooks/useSessions';

const SessionForm = ({ mode = 'create' }) => {
  const navigate = useNavigate();
  const { id } = useParams();

  const isEdit = mode === 'edit';

  const [clientName, setClientName] = useState('');
  const [contact, setContact] = useState('');
  const [visitType, setVisitType] = useState('first');
  const [startTime, setStartTime] = useState(getNextRoundedHour());
  const [plannedMinutes, setPlannedMinutes] = useState(60);
  const [plannedAmount, setPlannedAmount] = useState(250);
  const [currency, setCurrency] = useState('EUR');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // -----------------------------
  // Carregar sessão para edição
  // -----------------------------
  useEffect(() => {
    if (!isEdit || !id) return;

    const loadSession = async () => {
      try {
        const res = await getSessionById(id);
        const s = res;

        setClientName(s.client_name || '');
        setContact(s.contact || '');
        setVisitType(s.visit_type);
        setStartTime(s.start_time.slice(0, 16)); // ISO → datetime-local
        setPlannedMinutes(s.planned_minutes);
        setPlannedAmount(s.planned_amount ?? '');
        setCurrency(s.currency);
        setNotes(s.notes || '');
      } catch (err) {
        setError('Errore nel caricamento della sessione');
      }
    };

    loadSession();
  }, [isEdit, id]);

  // -----------------------------
  // Submit
  // -----------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      setLoading(true);

      const payload = {
        client_name: clientName || undefined,
        contact: contact || undefined,
        visit_type: visitType,
        planned_minutes: Number(plannedMinutes),
        planned_amount: plannedAmount ? Number(plannedAmount) : undefined,
        currency,
        notes: notes || undefined
      };

      if (startTime) {
        payload.start_time = new Date(startTime).toISOString();
      }

      if (isEdit) {
        await updateSession(id, payload);
      } else {
        await createSession(payload);
      }

      navigate('/sessions');
    } catch (err) {
      console.error(err.response?.data || err);
      setError(err.response?.data?.message || 'Errore nel salvataggio');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 500 }}>
      <h1>{isEdit ? 'Modifica sessione' : 'Nuova sessione'}</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label>Cliente</label>
          <input
            type="text"
            value={clientName}
            onChange={e => setClientName(e.target.value)}
            placeholder="Nome cliente"
          />
        </div>

        <div>
          <label>Contato</label>
          <input
            type="text"
            value={contact}
            onChange={e => setContact(e.target.value)}
          />
        </div>

        <div>
          <label>Tipo visita</label>
          <select
            value={visitType}
            onChange={e => setVisitType(e.target.value)}
          >
            <option value="first">Prima volta</option>
            <option value="return">Ritorno</option>
          </select>
        </div>

        <div>
          <label>Inizio</label>
          <input
            type="datetime-local"
            value={startTime}
            onChange={e => setStartTime(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Minuti pianificati</label>
          <input
            type="number"
            value={plannedMinutes}
            onChange={e => setPlannedMinutes(e.target.value)}
            min="1"
            required
          />
        </div>

        <div>
          <label>Importo pianificato</label>
          <input
            type="number"
            step="0.01"
            value={plannedAmount}
            onChange={e => setPlannedAmount(e.target.value)}
          />
        </div>

        <div>
          <label>Valuta</label>
          <select
            value={currency}
            onChange={e => setCurrency(e.target.value)}
          >
            <option value="EUR">EUR (€)</option>
            <option value="CHF">CHF (CHF)</option>
          </select>
        </div>

        <div>
          <label>Note</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Salvataggio...' : 'Salva'}
        </button>
      </form>
    </div>
  );
};

export default SessionForm;
