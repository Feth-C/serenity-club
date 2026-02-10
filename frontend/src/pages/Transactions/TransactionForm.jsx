// frontend/src/pages/Transactions/TransactionForm.jsx

import { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/api';
import BackButton from '../../components/common/BackButton';
import { normalizeEntity } from '../../utils/normalizeEntity';
import { normalizeItems } from '../../utils/normalizeItems';
import { AuthContext } from '../../contexts/AuthContext';

export default function TransactionForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { activeUnit } = useContext(AuthContext);
    const isEdit = Boolean(id);

    const [form, setForm] = useState({
        payer_type: '',
        payer_id: '',
        custom_payer_name: '',
        type: 'income',
        category: '',
        currency: 'EUR',
        amount: '',
        date: new Date().toISOString().slice(0, 16), // mostra até minutos no input
        description: ''
    });

    const [members, setMembers] = useState([]);
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Buscar membros e clientes
    useEffect(() => {
        const fetchLists = async () => {
            try {
                const resMembers = await api.get('/members');
                setMembers(normalizeItems(resMembers));

                const resClients = await api.get('/clients');
                setClients(normalizeItems(resClients));
            } catch (err) {
                console.error('Erro ao carregar listas:', err);
                setError('Errore durante il caricamento di membri e clienti');
            }
        };
        fetchLists();
    }, []);

    // Buscar transação para edição
    useEffect(() => {
        if (!isEdit) return;

        const fetchTransaction = async () => {
            setLoading(true);
            try {
                const res = await api.get(`/transactions/${id}`);
                const data = normalizeEntity(res);

                if (!data) {
                    setError('Transazione non trovata.');
                    return;
                }

                setForm({
                    payer_type: data.member_id
                        ? 'member'
                        : data.client_id
                            ? 'client'
                            : 'ad-hoc',
                    payer_id: data.member_id || data.client_id || '',
                    custom_payer_name: data.custom_payer_name || '',
                    type: data.type || 'income',
                    category: data.category || '',
                    currency: data.currency || 'EUR',
                    amount: data.amount ?? '',
                    date: data.date ? data.date.slice(0, 16) : '',
                    description: data.description || ''
                });
            } catch (err) {
                console.error('Erro ao buscar transação:', err);
                setError('Errore durante il caricamento della transazione.');
            } finally {
                setLoading(false);
            }
        };

        fetchTransaction();
    }, [id, isEdit]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!activeUnit) {
            setError('Unità attiva non definita.');
            setLoading(false);
            return;
        }

        try {
            // 🔹 Criar Date exato do momento do submit
            const exactDate = new Date();

            // 🔹 Preparar payload com data exata (segundos/milisegundos reais)
            const payload = {
                type: form.type,
                category: form.category || null,
                currency: form.currency,
                amount: form.amount ? Number(form.amount) : null,
                date: exactDate.toISOString(), // envia com precisão total
                description: form.description || null,
                unit_id: activeUnit.id,
                payer_type: form.payer_type,
                member_id: form.payer_type === 'member' ? Number(form.payer_id) : null,
                client_id: form.payer_type === 'client' ? Number(form.payer_id) : null,
                custom_payer_name: form.payer_type === 'ad-hoc' ? form.custom_payer_name || null : null
            };

            if (isEdit) {
                await api.put(`/transactions/${id}`, payload);
            } else {
                await api.post('/transactions', payload);
            }

            navigate('/transactions');
        } catch (err) {
            console.error('Erro no submit:', err.response?.data || err);
            setError(err?.response?.data?.message || 'Errore durante il salvataggio della transazione.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '30px' }}>
            <BackButton />
            <h1 style={{ marginBottom: '20px' }}>
                {isEdit ? 'Modificare' : 'Nuova'} Transazione
            </h1>

            {error && <p style={{ color: 'red', marginBottom: '20px' }}>{error}</p>}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '400px' }}>
                <select
                    name="payer_type"
                    value={form.payer_type}
                    onChange={(e) => {
                        const value = e.target.value;
                        setForm(prev => ({
                            ...prev,
                            payer_type: value,
                            payer_id: '',
                            custom_payer_name: ''
                        }));
                    }}
                    style={inputStyle}
                    required
                >
                    <option value="">Seleziona tipo pagatore</option>
                    <option value="member">Membro</option>
                    <option value="client">Cliente</option>
                    <option value="ad-hoc">Nuovo Pagatore</option>
                </select>

                {form.payer_type === 'member' && (
                    <select name="payer_id" value={form.payer_id} onChange={handleChange} style={inputStyle} required>
                        <option value="">Seleziona membro</option>
                        {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                )}

                {form.payer_type === 'client' && (
                    <select name="payer_id" value={form.payer_id} onChange={handleChange} style={inputStyle} required>
                        <option value="">Seleziona cliente</option>
                        {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                )}

                {form.payer_type === 'ad-hoc' && (
                    <input type="text" name="custom_payer_name" value={form.custom_payer_name} onChange={handleChange} placeholder="Nome pagatore" style={inputStyle} required />
                )}

                <select name="type" value={form.type} onChange={handleChange} style={inputStyle}>
                    <option value="income">🟢 Entrate</option>
                    <option value="expense">🔴 Spese</option>
                </select>

                <input type="text" name="category" value={form.category} onChange={handleChange} placeholder="Categoria" style={inputStyle} />
                <select name="currency" value={form.currency} onChange={handleChange} style={inputStyle}>
                    <option value="EUR">EUR (€)</option>
                    <option value="CHF">CHF (CHF)</option>
                </select>
                <input type="number" name="amount" value={form.amount} onChange={handleChange} placeholder="Valore" required style={inputStyle} />
                <input type="datetime-local" name="date" value={form.date} onChange={handleChange} required style={inputStyle} />
                <textarea name="description" value={form.description} onChange={handleChange} placeholder="Descrizione" rows={4} style={inputStyle} />

                <button type="submit" disabled={loading} style={buttonStyle}>
                    {loading ? 'Salvataggio...' : isEdit ? 'Aggiornare' : 'Creare'}
                </button>
            </form>
        </div>
    );
}

const inputStyle = {
    padding: '10px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontSize: '14px'
};

const buttonStyle = {
    padding: '10px',
    backgroundColor: '#2563eb',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
};
