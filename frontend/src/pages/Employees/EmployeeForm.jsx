// frontend/src/pages/Employees/EmployeesForm.jsx

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

const EmployeeForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const isEdit = Boolean(id);

  const [employee, setEmployee] = useState({
    name: "",
    email: "",
    role: "",
    status: "active",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    const fetchEmployee = async () => {
      try {
        const res = await api.get(`/employees/${id}`);
        setEmployee(normalizeEntity(res));
      } catch (err) {
        console.error("Errore nel caricamento del dipendente", err);
        setError("Non è stato possibile caricare il dipendente");
      }
    };

    fetchEmployee();
  }, [id]);

  const handleChange = (field, value) => {
    setError("");
    setEmployee((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      if (isEdit) {
        await api.put(`/employees/${id}`, employee);
      } else {
        await api.post("/employees", employee);
      }

      navigate("/employees");
    } catch (err) {
      console.error("Errore durante il salvataggio", err);
      setError(
        err.response?.data?.message ||
        "Errore durante il salvataggio del dipendente"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout
      title={isEdit ? "Modifica dipendente" : "Nuovo dipendente"}
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
            value={employee.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="Inserisci il nome"
          />
        </FormGroup>

        <FormGroup>
          <FormLabel htmlFor="email">Email</FormLabel>
          <FormInput
            id="email"
            type="email"
            value={employee.email}
            onChange={(e) => handleChange("email", e.target.value)}
            placeholder="Inserisci l'email"
          />
        </FormGroup>

        <FormGroup>
          <FormLabel htmlFor="role">Ruolo</FormLabel>
          <FormInput
            id="role"
            value={employee.role}
            onChange={(e) => handleChange("role", e.target.value)}
            placeholder="Inserisci il ruolo"
          />
        </FormGroup>

        <FormGroup>
          <FormLabel htmlFor="status">Stato</FormLabel>
          <FormSelect
            id="status"
            value={employee.status}
            onChange={(e) => handleChange("status", e.target.value)}
            options={[
              { value: "active", label: "Attivo" },
              { value: "inactive", label: "Inattivo" },
            ]}
          />
        </FormGroup>

        {error && <p className="form-text form-text--error">{error}</p>}

        <div className="form-actions">
          <Button type="submit" disabled={loading}>
            {loading ? "Salvataggio..." : "Salva"}
          </Button>

          <Button variant="secondary" onClick={() => navigate(-1)}>
            Annulla
          </Button>
        </div>
      </Form>
    </PageLayout>
  );
};

export default EmployeeForm;