// frontend/src/pages/Transactions/TransactionForm.jsx

import { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import api from '../../api/api';
import { normalizeEntity } from '../../utils/normalizeEntity';
import { normalizeItems } from '../../utils/normalizeItems';

import { AuthContext } from '../../contexts/AuthContext';

import PageLayout from '../../components/layout/PageLayout/PageLayout';
import Form from '../../components/ui/form/form';
import FormGroup from '../../components/ui/form/form-group';
import FormLabel from '../../components/ui/form/form-label';
import FormInput from '../../components/ui/form/form-input';
import FormSelect from '../../components/ui/form/form-select';
import MoneyInput from '../../components/ui/form/money-input';
import Button from '../../components/ui/Button/Button';

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
        date: new Date().toISOString().slice(0, 16),
        description: ''
    });

    const [members, setMembers] = useState([]);
    const [clients, setClients] = useState([]);
    const [categories, setCategories] = useState([]);
    const [newCategory, setNewCategory] = useState(false);
    const [newPayer, setNewPayer] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // 🔹 Buscar membros, clientes e categorias
    useEffect(() => {
        const fetchLists = async () => {
            try {
                const resMembers = await api.get('/members');
                setMembers(normalizeItems(resMembers));

                const resClients = await api.get('/clients');
                setClients(normalizeItems(resClients));

                // Buscar categorias existentes de todas as transações
                const resTransactions = await api.get('/transactions?perPage=1000');
                const items = resTransactions.data?.items || [];

                const allCategories = items
                    .map(t => t.category)
                    .filter(Boolean);

                const uniqueCategories = [...new Set(allCategories)].sort();

                setCategories(uniqueCategories);

            } catch (err) {
                console.error('Erro ao carregar listas:', err);
                setError('Errore durante il caricamento di membri, clienti e categorie');
            }
        };

        fetchLists();
    }, []);

    // 🔹 Buscar transação para edição
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
            const exactDate = new Date();

            const payload = {
                type: form.type,
                category: form.category || '',         // substituir null por ''
                currency: form.currency,
                amount: form.amount ? Number(form.amount) : 0, // evitar null
                date: form.date ? new Date(form.date).toISOString() : new Date().toISOString(),
                description: form.description || '',   // substituir null por ''
                unit_id: activeUnit.id,
                payer_type: form.payer_type,
                member_id: form.payer_type === 'member' ? Number(form.payer_id) : null,
                client_id: form.payer_type === 'client' ? Number(form.payer_id) : null,
                custom_payer_name: form.payer_type === 'ad-hoc' ? form.custom_payer_name || '' : ''
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
        <PageLayout
            title={isEdit ? "💸 Modifica transazione" : "💸 Nuova transazione"}
            backButton={<Button variant="secondary" onClick={() => navigate(-1)}>← Indietro</Button>}
            maxWidth="700px"
        >
            <Form onSubmit={handleSubmit}>

                {/* Tipo pagatore */}
                <FormGroup>
                    <FormLabel>Tipo pagatore</FormLabel>
                    <FormSelect
                        name="payer_type"
                        value={form.payer_type}
                        onChange={(e) => {
                            const value = e.target.value;
                            setForm(prev => ({ ...prev, payer_type: value, payer_id: '', custom_payer_name: '' }));
                        }}
                        required
                        options={[
                            { value: '', label: 'Seleziona tipo pagatore' },
                            { value: 'member', label: 'Membro' },
                            { value: 'client', label: 'Cliente' },
                            { value: 'ad-hoc', label: 'Nuovo Pagatore' }
                        ]}
                    />
                </FormGroup>

                {/* Membro */}
                {form.payer_type === 'member' && (
                    <FormGroup>
                        <FormLabel>Membro</FormLabel>
                        <FormSelect
                            name="payer_id"
                            value={form.payer_id}
                            onChange={handleChange}
                            required
                            options={[
                                { value: '', label: 'Seleziona membro' },
                                ...members.map(m => ({ value: m.id, label: m.name }))
                            ]}
                        />
                    </FormGroup>
                )}

                {/* Cliente */}
                {form.payer_type === 'client' && (
                    <FormGroup>
                        <FormLabel>Cliente</FormLabel>
                        <FormSelect
                            name="payer_id"
                            value={form.payer_id}
                            onChange={handleChange}
                            required
                            options={[
                                { value: '', label: 'Seleziona cliente' },
                                ...clients.map(c => ({ value: c.id, label: c.name }))
                            ]}
                        />
                    </FormGroup>
                )}

                {/* Pagatore ad-hoc */}
                {form.payer_type === 'ad-hoc' && (
                    <FormGroup>
                        <FormLabel>Nome pagatore</FormLabel>
                        <FormInput
                            name="custom_payer_name"
                            value={form.custom_payer_name}
                            onChange={handleChange}
                            placeholder="Nome pagatore"
                            required
                        />
                    </FormGroup>
                )}

                {/* Tipo transazione */}
                <FormGroup>
                    <FormLabel>Tipo transazione</FormLabel>
                    <FormSelect
                        name="type"
                        value={form.type}
                        onChange={handleChange}
                        options={[
                            { value: 'income', label: '🟢 Entrate' },
                            { value: 'expense', label: '🔴 Spese' }
                        ]}
                    />
                </FormGroup>

                {/* Categoria */}
                <FormGroup>
                    <FormLabel>Categoria</FormLabel>

                    {!newCategory ? (
                        <FormSelect
                            name="category"
                            value={form.category}
                            onChange={(e) => {

                                if (e.target.value === "__new__") {
                                    setNewCategory(true);
                                    setForm(prev => ({ ...prev, category: "" }));
                                    return;
                                }

                                handleChange(e);
                            }}
                            options={[
                                { value: '', label: 'Seleziona categoria' },

                                ...categories.map(cat => ({
                                    value: cat,
                                    label: cat
                                })),

                                { value: "__new__", label: "➕ Nuova categoria" }
                            ]}
                        />
                    ) : (
                        <div className="form-inline">
                            <FormInput
                                name="category"
                                value={form.category}
                                onChange={handleChange}
                                placeholder="Nuova categoria"
                                required
                            />

                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => {
                                    setNewCategory(false);
                                    setForm(prev => ({ ...prev, category: "" }));
                                }}
                            >
                                Annulla
                            </Button>
                        </div>
                    )}

                </FormGroup>

                {/* Importo */}
                <FormGroup>
                    <FormLabel>Importo</FormLabel>
                    <MoneyInput
                        currency={form.currency}
                        amount={form.amount}
                        onCurrencyChange={(e) => setForm(prev => ({ ...prev, currency: e.target.value }))}
                        onAmountChange={(e) => setForm(prev => ({ ...prev, amount: e.target.value }))}
                        currencies={['EUR', 'CHF']}
                    />
                </FormGroup>

                {/* Data */}
                <FormGroup>
                    <FormLabel>Data</FormLabel>
                    <FormInput
                        type="datetime-local"
                        name="date"
                        value={form.date}
                        onChange={handleChange}
                        required
                    />
                </FormGroup>

                {/* Descrizione */}
                <FormGroup>
                    <FormLabel>Descrizione</FormLabel>
                    <FormInput
                        as="textarea"
                        rows={4}
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        placeholder="Descrizione"
                    />
                </FormGroup>

                {/* Submit */}
                <div className="form-actions">
                    <Button
                        type="submit"
                        variant="primary"
                        disabled={loading}
                    >
                        {loading ? 'Salvataggio...' : isEdit ? 'Aggiornare' : 'Creare'}
                    </Button>
                </div>

            </Form>
        </PageLayout>
    );
}