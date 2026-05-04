// frontend/src/pages/Users/UserForm.jsx

import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/api";
import { normalizeEntity } from "../../utils/normalizeEntity";

import PageLayout from "../../components/layout/PageLayout/PageLayout";
import Form from "../../components/ui/form/form";
import FormGroup from "../../components/ui/form/form-group";
import FormLabel from "../../components/ui/form/form-label";
import FormInput from "../../components/ui/form/form-input";
import FormSelect from "../../components/ui/form/form-select";
import Button from "../../components/ui/Button/Button";

const UserForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = Boolean(id);

    const [user, setUser] = useState({
        name: "",
        email: "",
        password: "S123", // Nova senha
        role: "member", // Role padrão
        status: "active",
        unitIds: [], // Array para IDs das unidades vinculadas
    });

    const [availableUnits, setAvailableUnits] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Busca todas as unidades disponíveis para o dropdown
                const unitsRes = await api.get("/units");
                // Dependendo do seu backend, pode ser unitsRes.data ou unitsRes.data.items
                setAvailableUnits(unitsRes.data || []);

                // 2. Se for edição, busca os dados do usuário
                if (isEdit) {
                    const userRes = await api.get(`/users/${id}`);
                    const userData = normalizeEntity(userRes);

                    // Mapeia os IDs das unidades que o usuário já tem
                    const currentUnitIds = userData.units?.map(u => u.id) || [];

                    setUser({
                        ...userData,
                        password: "", // Senha sempre vazia na edição por segurança
                        unitIds: currentUnitIds
                    });
                }
            } catch (err) {
                console.error("Errore nel caricamento dati", err);
                setError("Impossibile caricare le informazioni necessarie");
            }
        };

        fetchData();
    }, [id, isEdit]);

    const handleChange = (field, value) => {
        setError("");
        setUser({ ...user, [field]: value });
    };

    // Função para lidar com seleção múltipla de unidades
    const handleUnitChange = (unitId) => {
        const numericId = Number(unitId);
        setUser(prev => {
            const isSelected = prev.unitIds.includes(numericId);
            const newIds = isSelected
                ? prev.unitIds.filter(id => id !== numericId)
                : [...prev.unitIds, numericId];
            return { ...prev, unitIds: newIds };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validação simples: senha obrigatória na criação
        if (!isEdit && !user.password) {
            setError("La password è obbligatoria per i nuovi utenti");
            return;
        }

        // Validação: pelo menos uma unidade selecionada
        if (user.unitIds.length === 0) {
            setError("Seleziona almeno un'unità per l'utente");
            return;
        }

        setLoading(true);
        setError("");

        try {
            // No backend, você deve tratar 'unitIds' para criar as relações na tabela pivo
            if (isEdit) {
                // Removemos a senha se ela não for preenchida (para não resetar para vazio)
                const payload = { ...user };
                if (!payload.password) delete payload.password;
                await api.put(`/users/${id}`, payload);
            } else {
                await api.post("/users", user);
            }
            navigate("/users");
        } catch (err) {
            setError(err.response?.data?.message || "Errore durante il salvataggio");
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageLayout
            title={isEdit ? "Modifica utente" : "Nuovo utente"}
            backButton={
                <Button variant="secondary" onClick={() => navigate(-1)}>
                    ← Indietro
                </Button>
            }
            maxWidth="700px"
        >
            <Form onSubmit={handleSubmit}>
                <FormGroup>
                    <FormLabel htmlFor="name">Nome Completo</FormLabel>
                    <FormInput
                        id="name"
                        value={user.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        required
                    />
                </FormGroup>

                <FormGroup>
                    <FormLabel htmlFor="email">Email (Login)</FormLabel>
                    <FormInput
                        id="email"
                        type="email"
                        value={user.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        required
                    />
                </FormGroup>

                <FormGroup>
                    <FormLabel htmlFor="password">
                        {isEdit ? "Nuova Password (opzionale)" : "Password Provvisoria"}
                    </FormLabel>
                    <FormInput
                        id="password"
                        type="password"
                        placeholder={isEdit ? "Lascia vuoto per non cambiare" : "Usando predefinita: Password123!"}
                        value={user.password}
                        onChange={(e) => handleChange("password", e.target.value)}
                    />
                    {!isEdit && (
                        <small style={{ color: 'var(--color-text-secondary)' }}>
                            L'utente potrà cambiare questa password al primo accesso.
                        </small>
                    )}
                </FormGroup>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <FormGroup>
                        <FormLabel htmlFor="role">Ruolo (Permessi)</FormLabel>
                        <FormSelect
                            id="role"
                            value={user.role}
                            onChange={(e) => handleChange("role", e.target.value)}
                            options={[
                                { value: "admin", label: "Amministratore" },
                                { value: "manager", label: "Gestore Sede" },
                                { value: "member", label: "Membro / Staff" },
                            ]}
                        />
                    </FormGroup>

                    <FormGroup>
                        <FormLabel htmlFor="status">Stato Account</FormLabel>
                        <FormSelect
                            id="status"
                            value={user.status}
                            onChange={(e) => handleChange("status", e.target.value)}
                            options={[
                                { value: "active", label: "Attivo" },
                                { value: "inactive", label: "Disabilitato" },
                            ]}
                        />
                    </FormGroup>
                </div>

                {/* SEÇÃO DE UNIDADES RELATIVAS */}
                <FormGroup>
                    <FormLabel>Unità di competenza (Sedi)</FormLabel>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '10px',
                        background: '#f9f9f9',
                        padding: '15px',
                        borderRadius: '8px',
                        border: '1px solid #eee'
                    }}>
                        {availableUnits.map(unit => (
                            <label key={unit.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px' }}>
                                <input
                                    type="checkbox"
                                    checked={user.unitIds.includes(unit.id)}
                                    onChange={() => handleUnitChange(unit.id)}
                                />
                                {unit.name}
                            </label>
                        ))}
                    </div>
                </FormGroup>

                {error && <p className="form-text form-text--error">{error}</p>}

                <div className="form-actions" style={{ marginTop: '30px' }}>
                    <Button type="submit" variant="primary" disabled={loading} style={{ width: '100%' }}>
                        {loading ? "Salvataggio..." : "Salva Utente"}
                    </Button>
                </div>
            </Form>
        </PageLayout>
    );
};

export default UserForm;