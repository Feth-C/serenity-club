// frontend/src/pages/Units/UnitForm.jsx

import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/api"; // Ajustado para o caminho correto que os outros usam

import PageLayout from "../../components/layout/PageLayout/PageLayout";
import Form from "../../components/ui/form/form";
import FormGroup from "../../components/ui/form/form-group";
import FormLabel from "../../components/ui/form/form-label";
import FormInput from "../../components/ui/form/form-input";
import FormSelect from "../../components/ui/form/form-select";
import Button from "../../components/ui/Button/Button";

const UnitForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [unit, setUnit] = useState({
    name: "",
    type: "club",
    description: "",
    status: "active"
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    const loadUnit = async () => {
      try {
        const res = await api.get(`/units/${id}`);
        setUnit(res.data);
      } catch (err) {
        setError("Errore nel caricamento dell'unità");
      }
    };
    loadUnit();
  }, [id]);

  const handleChange = (field, value) => {
    setUnit({ ...unit, [field]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEdit) {
        await api.put(`/units/${id}`, unit);
      } else {
        await api.post("/units", unit);
      }
      navigate("/units");
    } catch (err) {
      setError(err.response?.data?.message || "Errore nel salvataggio");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout
      title={isEdit ? "Modifica Unità" : "Nuova Unità"}
      backButton={<Button variant="secondary" onClick={() => navigate(-1)}>← Indietro</Button>}
      maxWidth="700px"
    >
      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <FormLabel>Nome Unità</FormLabel>
          <FormInput
            value={unit.name}
            onChange={(e) => handleChange("name", e.target.value)}
            required
          />
        </FormGroup>

        <FormGroup>
          <FormLabel>Tipo</FormLabel>
          <FormSelect
            value={unit.type}
            onChange={(e) => handleChange("type", e.target.value)}
            options={[
              { value: "club", label: "Club" },
              { value: "personal", label: "Personal" },
              { value: "rental", label: "Affitto" },
              { value: "other", label: "Altro" }
            ]}
          />
        </FormGroup>

        <FormGroup>
          <FormLabel>Descrizione</FormLabel>
          <FormInput
            as="textarea"
            rows={4}
            value={unit.description}
            onChange={(e) => handleChange("description", e.target.value)}
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

export default UnitForm;