// frontend/src/pages/Clients/ClientForm.jsx

import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import api from "../../api/api";

import PageLayout from "../../components/layout/PageLayout/PageLayout";

import Form from "../../components/ui/form/form";
import FormGroup from "../../components/ui/form/form-group";
import FormLabel from "../../components/ui/form/form-label";
import FormInput from "../../components/ui/form/form-input";
import FormSelect from "../../components/ui/form/form-select";

import Button from "../../components/ui/Button/Button";

const ClientForm = () => {

  const navigate = useNavigate();
  const { id } = useParams();

  const isEdit = Boolean(id);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

  const [status, setStatus] = useState("active");

  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // =========================
  // CARREGAR CLIENTE (EDIT)
  // =========================

  useEffect(() => {

    if (!isEdit) return;

    const loadClient = async () => {

      try {

        const res = await api.get(`/clients/${id}`);

        const c = res.data;

        setName(c.name || "");
        setPhone(c.phone || "");
        setEmail(c.email || "");
        setAddress(c.address || "");
        setStatus(c.status || "active");
        setNotes(c.notes || "");

      } catch {

        setError("Errore nel caricamento del cliente");

      }

    };

    loadClient();

  }, [id, isEdit]);

  // =========================
  // SUBMIT
  // =========================

  const handleSubmit = async (e) => {

    e.preventDefault();

    setLoading(true);
    setError("");

    try {

      const payload = {

        name,
        phone: phone || undefined,
        email: email || undefined,
        address: address || undefined,
        status,
        notes: notes || undefined,

      };

      if (isEdit) {

        await api.put(`/clients/${id}`, payload);

      } else {

        await api.post("/clients", payload);

      }

      navigate("/clients");

    } catch (err) {

      setError(err.response?.data?.message || "Errore nel salvataggio");

    } finally {

      setLoading(false);

    }

  };

  // =========================
  // UI
  // =========================

  return (

    <PageLayout
      title={isEdit ? "Modifica cliente" : "Nuovo cliente"}
      maxWidth="700px"
      backButton={
        <Button variant="secondary" onClick={() => navigate(-1)}>
          ← Indietro
        </Button>
      }
    >

      <Form onSubmit={handleSubmit}>

        <FormGroup>

          <FormLabel>Nome cliente</FormLabel>

          <FormInput
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

        </FormGroup>

        <FormGroup>

          <FormLabel>Telefono</FormLabel>

          <FormInput
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

        </FormGroup>

        <FormGroup>

          <FormLabel>Email</FormLabel>

          <FormInput
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

        </FormGroup>

        <FormGroup>

          <FormLabel>Indirizzo</FormLabel>

          <FormInput
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />

        </FormGroup>

        <FormGroup>

          <FormLabel>Stato</FormLabel>

          <FormSelect
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={[
              { value: "active", label: "Attivo" },
              { value: "inactive", label: "Inattivo" }
            ]}
          />

        </FormGroup>

        <FormGroup>

          <FormLabel>Note</FormLabel>

          <FormInput
            as="textarea"
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

        </FormGroup>

        {error && (
          <p className="form-text form-text--error">{error}</p>
        )}

        <div className="form-actions">

          <Button type="submit" disabled={loading}>
            {loading ? "Salvataggio..." : "Salva"}
          </Button>

          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate(-1)}
          >
            Annulla
          </Button>

        </div>

      </Form>

    </PageLayout>

  );

};

export default ClientForm;