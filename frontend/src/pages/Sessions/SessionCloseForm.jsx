// frontend/src/pages/Sessions/SessionCloseForm.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/api';
import { closeSession } from '../../api/sessions';

const SessionCloseForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const [session, setSession] = useState(null);
    const [usedMinutes, setUsedMinutes] = useState('');
    const [finalAmount, setFinalAmount] = useState('');
    const [paidAmount, setPaidAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [notes, setNotes] = useState('');

    // NOVOS CAMPOS
    const [payerType, setPayerType] = useState('client');
    const [payerName, setPayerName] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSession = async () => {
            try {
                const res = await api.get(`/sessions/${id}`);
                const s = res.data;

                setSession(s);
                setUsedMinutes(s.planned_minutes);
                setFinalAmount(s.planned_amount ?? '');
                setPaidAmount(s.planned_amount ?? '');
                setNotes(s.notes || '');

                // padrão: pagador = cliente da sessão
                setPayerName(s.client_name || '');
            } catch (err) {
                setError('Impossibile caricare la sessione');
            }
        };
        fetchSession();
    }, [id]);

    useEffect(() => {
        if (finalAmount !== '') {
            setPaidAmount(finalAmount);
        }
    }, [finalAmount]);

    const handleClose = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            await closeSession(id, {
                used_minutes: Number(usedMinutes),
                final_amount: Number(finalAmount),
                paid_amount: Number(paidAmount),
                payment_method: paymentMethod,
                payer_type: payerType,
                payer_name: payerName,
                notes: notes || undefined,
            });

            navigate('/sessions');
        } catch (err) {
            console.error(err.response?.data || err);
            setError(err.response?.data?.message || 'Errore durante la chiusura');
        } finally {
            setLoading(false);
        }
    };

    if (!session) return <p>Caricamento sessione...</p>;

    return (
        <div style={{ padding: 20, maxWidth: 500 }}>
            <h1>Chiudi sessione</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>}

            <p>
                <strong>Cliente:</strong> {session.client_name || '-'} <br />
                <strong>Inizio:</strong> {new Date(session.start_time).toLocaleString()} <br />
                <strong>Visita:</strong> {session.visit_type === 'first' ? 'Prima volta' : 'Ritorno'} <br />
                <strong>Minuti pianificati:</strong> {session.planned_minutes} <br />
                <strong>Importo pianificato:</strong> {session.planned_amount || '-'} {session.currency}
            </p>

            <form onSubmit={handleClose} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

                <div>
                    <label>Tipo pagador</label>
                    <select value={payerType} onChange={e => setPayerType(e.target.value)}>
                        <option value="client">Cliente</option>
                        <option value="member">Membro</option>
                        <option value="ad-hoc">Outro pagador</option>
                    </select>
                </div>

                <div>
                    <label>Nome do pagador</label>
                    <input
                        type="text"
                        value={payerName}
                        onChange={e => setPayerName(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label>Minuti Usati</label>
                    <input type="number" value={usedMinutes} onChange={e => setUsedMinutes(e.target.value)} min="1" required />
                </div>

                <div>
                    <label>Importo finale</label>
                    <input type="number" step="0.01" value={finalAmount} onChange={e => setFinalAmount(e.target.value)} required />
                </div>

                <div>
                    <label>Pagato</label>
                    <input type="number" step="0.01" value={paidAmount} onChange={e => setPaidAmount(e.target.value)} required />
                </div>

                <div>
                    <label>Metodo pagamento</label>
                    <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
                        <option value="transfer">Bonifico / SEPA</option>
                        <option value="cash">Contanti</option>
                        <option value="card">Carta</option>
                        <option value="twin">Twint</option>
                    </select>
                </div>

                <div>
                    <label>Note</label>
                    <textarea value={notes} onChange={e => setNotes(e.target.value)} />
                </div>

                <button type="submit" disabled={loading}>
                    {loading ? 'Salvataggio...' : 'Chiudi sessione'}
                </button>
            </form>
        </div>
    );
};

export default SessionCloseForm;
