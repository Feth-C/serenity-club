// frontend/src/pages/Members/MemberForm.jsx

import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/api";
import { normalizeEntity } from "../../utils/normalizeEntity";
import PageLayout from "../../components/layout/PageLayout/PageLayout";

// Components do Form Global
import Form from "../../components/ui/form/form";
import FormGroup from "../../components/ui/form/form-group";
import FormLabel from "../../components/ui/form/form-label";
import FormInput from "../../components/ui/form/form-input";
import FormSelect from "../../components/ui/form/form-select";
import Button from "../../components/ui/Button/Button";

const MemberForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const isEdit = Boolean(id);

  const [member, setMember] = useState({
    name: "",
    email: "",
    status: "active",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch do membro caso seja edição
  useEffect(() => {
    if (!id) return;
    const fetchMember = async () => {
      try {
        const res = await api.get(`/members/${id}`);
        setMember(normalizeEntity(res) || {
          name: "",
          email: "",
          status: "active"
        });
      } catch (err) {
        console.error("Errore durante il caricamento del membro", err);
        setError("Non è stato possibile caricare il membro");
      }
    };
    fetchMember();
  }, [id]);

  // Handle change dos inputs
  const handleChange = (field, value) => {
    setError("");
    setMember({ ...member, [field]: value });
  };

  // Submit do form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isEdit) {
        await api.put(`/members/${id}`, member);
      } else {
        await api.post("/members", member);
      }
      navigate("/members");
    } catch (err) {
      console.error("Errore durante il salvataggio del membro:", err);
      setError(err.response?.data?.message || "Errore durante il salvataggio del membro");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout
      title={isEdit ? "Modifica membro" : "Nuovo membro"}
      backButton={
        <Button variant="secondary" onClick={() => navigate(-1)}>
          ← Indietro
        </Button>
      }
      maxWidth="700px"
    >
      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <FormLabel htmlFor="name">Nome:</FormLabel>
          <FormInput
            id="name"
            value={member.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="Inserisci il nome"
            required
          />
        </FormGroup>

        <FormGroup>
          <FormLabel htmlFor="email">Email:</FormLabel>
          <FormInput
            id="email"
            type="email"
            value={member.email}
            onChange={(e) => handleChange("email", e.target.value)}
            placeholder="Inserisci l'email"
          />
        </FormGroup>

        <FormGroup>
          <FormLabel htmlFor="phone">Telefono:</FormLabel>
          <FormInput
            id="phone"
            type="phone"
            value={member.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            placeholder="Inserisci il Telefono"
          />
        </FormGroup>

        <FormGroup>
          <FormLabel htmlFor="status">Stato:</FormLabel>
          <FormSelect
            id="status"
            value={member.status}
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

export default MemberForm;