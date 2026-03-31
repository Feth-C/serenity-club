// frontend/src/pages/Documents/DocumentForm.jsx

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/api";

import PageLayout from "../../components/layout/PageLayout/PageLayout";
import Form from "../../components/ui/form/form";
import FormGroup from "../../components/ui/form/form-group";
import FormLabel from "../../components/ui/form/form-label";
import FormInput from "../../components/ui/form/form-input";
import FormSelect from "../../components/ui/form/form-select";
import Button from "../../components/ui/Button/Button";

import { normalizeItems } from "../../utils/normalizeItems";
import { normalizeEntity } from "../../utils/normalizeEntity";

const DocumentForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [ownerType, setOwnerType] = useState("");
  const [ownerId, setOwnerId] = useState("");
  const [owners, setOwners] = useState([]);
  const [file, setFile] = useState(null);

  const [form, setForm] = useState({
    name: "",
    type: "",
    expiration_date: "",
    status: "valid",
    notes: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isEdit) return;

    const fetchDocument = async () => {
      setLoading(true);

      try {
        const res = await api.get(`/documents/${id}`);
        const data = normalizeEntity(res);

        setForm({
          name: data.name || "",
          type: data.type || "",
          expiration_date: data.expiration_date || "",
          status: data.status || "valid",
          notes: data.notes || "",
        });

        setOwnerType(data.owner_type || "");
        setOwnerId(data.owner_id || "");
      } catch (err) {
        console.warn("Documento non trovato", err);
        setError("Documento non disponibile");
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [id, isEdit]);

  useEffect(() => {
    if (!ownerType) {
      setOwners([]);
      setOwnerId("");
      return;
    }

    const endpoint = ownerType === "member" ? "/members" : "/employees";

    const fetchOwners = async () => {
      try {
        const res = await api.get(endpoint, { params: { perPage: 1000 } });
        setOwners(normalizeItems(res));
      } catch {
        setOwners([]);
      }
    };

    fetchOwners();
  }, [ownerType]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const payload = new FormData();

      Object.entries(form).forEach(([k, v]) => payload.append(k, v));

      payload.append("owner_type", ownerType);
      payload.append("owner_id", ownerId);

      if (file) payload.append("file", file);

      if (isEdit) {
        await api.put(`/documents/${id}`, payload);
      } else {
        await api.post("/documents", payload);
      }

      navigate("/documents");
    } catch (err) {
      console.error(err);
      setError("Errore durante il salvataggio");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout
      title={isEdit ? "Modifica documento" : "Nuovo documento"}
      backButton={
        <Button variant="secondary" onClick={() => navigate(-1)}>
          ← Indietro
        </Button>
      }
      maxWidth="720px"
    >
      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <FormLabel htmlFor="name">Nome</FormLabel>
          <FormInput
            id="name"
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
          />
        </FormGroup>

        <FormGroup>
          <FormLabel htmlFor="type">Tipo</FormLabel>
          <FormSelect
            id="type"
            value={form.type}
            onChange={(e) =>
              setForm({ ...form, type: e.target.value })
            }
            options={[
              { value: "", label: "Seleziona" },
              { value: "contract", label: "Contratto" },
              { value: "identity", label: "Documento identità" },
              { value: "certificate", label: "Certificato" },
              { value: "other", label: "Altro" },
            ]}
          />
        </FormGroup>

        <FormGroup>
          <FormLabel>Data di scadenza</FormLabel>
          <FormInput
            type="date"
            value={form.expiration_date}
            onChange={(e) =>
              setForm({ ...form, expiration_date: e.target.value })
            }
          />
        </FormGroup>

        <FormGroup>
          <FormLabel>Stato</FormLabel>
          <FormSelect
            value={form.status}
            onChange={(e) =>
              setForm({ ...form, status: e.target.value })
            }
            options={[
              { value: "valid", label: "Valido" },
              { value: "expiring", label: "In scadenza" },
              { value: "expired", label: "Scaduto" },
            ]}
          />
        </FormGroup>

        <FormGroup>
          <FormLabel>Responsabile</FormLabel>
          <FormSelect
            value={ownerType}
            onChange={(e) => setOwnerType(e.target.value)}
            options={[
              { value: "", label: "Seleziona" },
              { value: "member", label: "Membro" },
              { value: "employee", label: "Dipendente" },
            ]}
          />
        </FormGroup>

        {ownerType && (
          <FormGroup>
            <FormLabel>
              {ownerType === "member" ? "Membro" : "Dipendente"}
            </FormLabel>

            <FormSelect
              value={ownerId}
              onChange={(e) => setOwnerId(e.target.value)}
              options={[
                { value: "", label: "Seleziona" },
                ...owners.map((o) => ({
                  value: o.id,
                  label: o.name || o.full_name || o.email,
                })),
              ]}
            />
          </FormGroup>
        )}

        <FormGroup>
          <FormLabel>Note</FormLabel>
          <textarea
            className="form-textarea"
            rows={4}
            value={form.notes}
            onChange={(e) =>
              setForm({ ...form, notes: e.target.value })
            }
          />
        </FormGroup>

        <FormGroup>
          <FormLabel>File</FormLabel>
          <input type="file" onChange={(e) => setFile(e.target.files[0])} />
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

export default DocumentForm;