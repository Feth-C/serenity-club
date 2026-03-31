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
        status: "active",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!id) return;

        const fetchUser = async () => {
            try {
                const res = await api.get(`/users/${id}`);
                setUser(normalizeEntity(res));
            } catch (err) {
                console.error("Errore nel caricamento utente", err);
                setError("Non è stato possibile caricare l'utente");
            }
        };

        fetchUser();
    }, [id]);

    const handleChange = (field, value) => {
        setError("");
        setUser({ ...user, [field]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            if (isEdit) {
                await api.put(`/users/${id}`, user);
            } else {
                await api.post("/users", user);
            }

            navigate("/users");
        } catch (err) {
            console.error("Errore salvataggio utente", err);
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
                    <FormLabel htmlFor="name">Nome</FormLabel>
                    <FormInput
                        id="name"
                        value={user.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        required
                    />
                </FormGroup>

                <FormGroup>
                    <FormLabel htmlFor="email">Email</FormLabel>
                    <FormInput
                        id="email"
                        type="email"
                        value={user.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        required
                    />
                </FormGroup>

                <FormGroup>
                    <FormLabel htmlFor="status">Stato</FormLabel>
                    <FormSelect
                        id="status"
                        value={user.status}
                        onChange={(e) => handleChange("status", e.target.value)}
                        options={[
                            { value: "active", label: "Attivo" },
                            { value: "inactive", label: "Inattivo" },
                        ]}
                    />
                </FormGroup>

                {error && <p className="form-text form-text--error">{error}</p>}

                <div className="form-actions">
                    <Button type="submit" variant="primary" disabled={loading}>
                        {loading ? "Salvataggio..." : "Salva"}
                    </Button>
                </div>
            </Form>
        </PageLayout>
    );
};

export default UserForm;