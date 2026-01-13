// frontend/src/pages/Transactions/TransactionForm.jsx

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/api';
import BackButton from '../../components/common/BackButton';
import { normalizeEntity } from '../../utils/normalizeEntity';
import { normalizeItems } from '../../utils/normalizeItems';

export default function TransactionForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);

    const [form, setForm] = useState({
        member_id: '',
        type: 'income',
        category: '',
        currency: 'EUR',
        amount: '',
        date: '',
        description: ''
    });

    const [members, setMembers] = useState([]);   // ← FALTAVA
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // -----------------------------
    // Carregar membros
    // -----------------------------
    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const res = await api.get('/members');
                const list = normalizeItems(res);
                setMembers(list);
            } catch (err) {
                console.error(err);
                setError('Errore durante il caricamento dei membri');
            }
        };


        fetchMembers();
    }, []);

    // -----------------------------
    // Buscar transação (edição)
    // -----------------------------
    useEffect(() => {
        if (!isEdit) return;

        const fetchTransaction = async () => {
            setLoading(true);
            try {
                const res = await api.get(`/transactions/${id}`);
                const data = normalizeEntity(res);

                if (data) {
                    setForm({
                        ...data,
                        currency: data.currency || 'EUR'
                    });
                } else {
                    setError('Transazione non trovata.');
                }
            } catch (err) {
                console.error(err);
                setError('Errore durante il caricamento della transazione.');
            } finally {
                setLoading(false);
            }
        };

        fetchTransaction();
    }, [id, isEdit]);

    // -----------------------------
    // Handlers
    // -----------------------------
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isEdit) {
                await api.put(`/transactions/${id}`, form);
            } else {
                await api.post('/transactions', form);
            }
            navigate('/transactions');
        } catch (err) {
            console.error(err);
            setError('Errore durante il salvataggio della transazione.');
        } finally {
            setLoading(false);
        }
    };

    // -----------------------------
    // Erro
    // -----------------------------
    if (error) {
        return (
            <div style={{ padding: '30px' }}>
                <p style={{ color: 'red', marginBottom: '20px' }}>{error}</p>
                <button onClick={() => navigate('/transactions')}>
                    Indietro
                </button>
            </div>
        );
    }

    // -----------------------------
    // Render
    // -----------------------------
    return (
        <div style={{ padding: '30px' }}>
            <BackButton />

            <h1 style={{ marginBottom: '20px' }}>
                {isEdit ? 'Modificare' : 'Nuova'} Transazione
            </h1>

            <form
                onSubmit={handleSubmit}
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '15px',
                    maxWidth: '400px'
                }}
            >
                {/* MEMBRO */}
                <select
                    name="member_id"
                    value={form.member_id}
                    onChange={handleChange}
                    style={inputStyle}
                    required
                >
                    <option value="">Seleziona membro</option>
                    {members.map(m => (
                        <option key={m.id} value={m.id}>
                            {m.name}
                        </option>
                    ))}
                </select>

                {/* TIPO */}
                <select
                    name="type"
                    value={form.type}
                    onChange={handleChange}
                    style={inputStyle}
                >
                    <option value="income">🟢 Entrate</option>
                    <option value="expense">🔴 Spese</option>
                </select>

                {/* CATEGORIA */}
                <input
                    type="text"
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    placeholder="Categoria"
                    style={inputStyle}
                />

                {/* MOEDA */}
                <select
                    name="currency"
                    value={form.currency}
                    onChange={handleChange}
                    style={inputStyle}
                >
                    <option value="EUR">EUR (€)</option>
                    <option value="CHF">CHF (CHF)</option>
                </select>

                {/* VALOR */}
                <input
                    type="number"
                    name="amount"
                    value={form.amount}
                    onChange={handleChange}
                    placeholder="Valore"
                    required
                    style={inputStyle}
                />

                {/* DATA */}
                <input
                    type="date"
                    name="date"
                    value={form.date}
                    onChange={handleChange}
                    required
                    style={inputStyle}
                />

                {/* DESCRIÇÃO */}
                <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Descrizione"
                    rows={4}
                    style={inputStyle}
                />

                <button
                    type="submit"
                    disabled={loading}
                    style={buttonStyle}
                >
                    {loading
                        ? 'Salvataggio...'
                        : isEdit
                            ? 'Aggiornare'
                            : 'Creare'}
                </button>
            </form>
        </div>
    );
}

// -----------------------------
// Estilos reutilizáveis
// -----------------------------
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
