// src/pages/sessions/SessionForm.jsx

import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import api from "../../api/api";
import { getNextRoundedHour } from "../../hooks/useSessions";

import PageLayout from "../../components/layout/PageLayout/PageLayout";

import Form from "../../components/ui/form/form";
import FormGroup from "../../components/ui/form/form-group";
import FormLabel from "../../components/ui/form/form-label";
import FormInput from "../../components/ui/form/form-input";
import FormSelect from "../../components/ui/form/form-select";

import Button from "../../components/ui/Button/Button";

const SessionForm = ({ mode = "create" }) => {

  const navigate = useNavigate();
  const { id } = useParams();

  const isEdit = mode === "edit";

  const [visitType, setVisitType] = useState("first");
  const [members, setMembers] = useState([])
  const [clients, setClients] = useState([]);

  const [selectedMemberId, setSelectedMemberId] = useState("")
  const [selectedMemberName, setSelectedMemberName] = useState("")
  const [selectedClientId, setSelectedClientId] = useState("");
  const [selectedClientName, setSelectedClientName] = useState("");

  const [clientName, setClientName] = useState("");
  const [contact, setContact] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

  const [notes, setNotes] = useState("");

  const [startTime, setStartTime] = useState(getNextRoundedHour());

  const [plannedMinutes, setPlannedMinutes] = useState(60);

  const [expectedEndTime, setExpectedEndTime] = useState("");

  const [plannedAmount, setPlannedAmount] = useState(250);

  const [currency, setCurrency] = useState("EUR");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const applyQuickDuration = (minutes) => {
    setPlannedMinutes(minutes);
  };

  // =========================
  // LISTAR MEMBROS
  // =========================
  useEffect(() => {

    const fetchMembers = async () => {

      try {

        const res = await api.get("/members");

        console.log("MEMBERS API:", res.data);

        setMembers(res.data.items || []);

      } catch (err) {

        console.error(err);

      }

    };

    fetchMembers();

  }, []);

  // =========================
  // CALCULAR FIM ESPERADO
  // =========================

  const calculateExpectedEnd = (start, minutes) => {

    if (!start || !minutes) return "";

    const date = new Date(start);

    date.setMinutes(date.getMinutes() + Number(minutes));

    const pad = (n) => String(n).padStart(2, "0");

    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;

  };

  // recalcula quando muda inicio ou duração

  useEffect(() => {

    const end = calculateExpectedEnd(startTime, plannedMinutes);

    setExpectedEndTime(end);

  }, [startTime, plannedMinutes]);

  // =========================
  // CARREGAR SESSÃO (EDIT)
  // =========================

  useEffect(() => {

    if (!isEdit || !id) return;

    const loadSession = async () => {

      try {

        const res = await api.get(`/sessions/${id}`);

        const s = res.data;

        setVisitType(s.visit_type);

        if (s.client_id) setSelectedClientId(s.client_id);

        setClientName(s.client_name || "");
        setContact(s.contact || "");
        setEmail(s.email || "");
        setAddress(s.address || "");

        setNotes(s.notes || "");

        setStartTime(s.start_time.slice(0, 16));

        setPlannedMinutes(s.planned_minutes);

        setExpectedEndTime(
          s.expected_end_time ? s.expected_end_time.slice(0, 16) : ""
        );

        setPlannedAmount(s.planned_amount ?? "");

        setCurrency(s.currency);

      } catch {

        setError("Errore nel caricamento della sessione");

      }

    };

    loadSession();

  }, [isEdit, id]);

  // =========================
  // CARREGAR CLIENTES
  // =========================

  useEffect(() => {

    if (visitType !== "return") return;

    const fetchClients = async () => {

      try {

        const res = await api.get("/clients?active=true");

        setClients(res.data || []);

      } catch (err) {

        console.error(err);

      }

    };

    fetchClients();

  }, [visitType]);

  // =========================
  // SUBMIT
  // =========================

  const handleSubmit = async (e) => {

    e.preventDefault();

    setLoading(true);

    setError("");

    try {

      const payload = {

        member_id: selectedMemberId ? Number(selectedMemberId) : null,

        visit_type: visitType,

        planned_minutes: Number(plannedMinutes),

        planned_amount: plannedAmount ? Number(plannedAmount) : undefined,

        currency,

        notes: notes || undefined,

        start_time: startTime
          ? new Date(startTime).toISOString()
          : undefined,

      };

      if (visitType === "first") {

        payload.client_name = clientName;
        payload.contact = contact || undefined;
        payload.email = email || undefined;
        payload.address = address || undefined;

      }

      if (visitType === "return") {

        payload.client_id = selectedClientId;
        payload.client_name = selectedClientName || undefined;

      }

      if (isEdit) {

        await api.put(`/sessions/${id}`, payload);

      } else {

        await api.post("/sessions", payload);

      }

      navigate("/sessions");

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
      title={isEdit ? "Modifica sessione" : "Nuova sessione"}
      backButton={
        <Button variant="secondary" onClick={() => navigate(-1)}>
          ← Indietro
        </Button>
      }
      maxWidth="700px"
    >

      <Form onSubmit={handleSubmit}>

        {/* Membro */}
        <FormGroup>
          <FormLabel>Membro</FormLabel>

          <FormSelect
            value={selectedMemberId}
            onChange={(e) => {

              const id = e.target.value;

              setSelectedMemberId(id);

              const member = members.find(
                c => String(c.id) === String(id)
              );

              setSelectedMemberName(member ? member.name : "");

            }}
            options={[
              { value: "", label: "Seleziona membro" },
              ...members.map(m => ({
                value: m.id,
                label: m.name
              }))
            ]}
            required
          />
        </FormGroup>

        {/* Tipo visita */}

        <FormGroup>

          <FormLabel>Tipo visita</FormLabel>

          <FormSelect
            value={visitType}
            onChange={(e) => {
              setVisitType(e.target.value);
              setSelectedClientId("");
            }}
            options={[
              { value: "first", label: "Prima volta" },
              { value: "return", label: "Ritorno" }
            ]}
          />

        </FormGroup>

        {/* Cliente novo */}

        {visitType === "first" && (

          <>

            <FormGroup>
              <FormLabel>Nome cliente</FormLabel>
              <FormInput
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                required
              />
            </FormGroup>

            <FormGroup>
              <FormLabel>Telefono</FormLabel>
              <FormInput
                value={contact}
                onChange={(e) => setContact(e.target.value)}
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

          </>

        )}

        {/* Cliente existente */}

        {visitType === "return" && (

          <FormGroup>

            <FormLabel>Cliente</FormLabel>

            <FormSelect
              value={selectedClientId}
              onChange={(e) => {

                const id = e.target.value;

                setSelectedClientId(id);

                const client = clients.find(
                  c => String(c.id) === String(id)
                );

                setSelectedClientName(client ? client.name : "");

              }}
              options={[
                { value: "", label: "Seleziona cliente" },
                ...clients.map(c => ({
                  value: c.id,
                  label: c.name
                }))
              ]}
            />

          </FormGroup>

        )}

        <FormGroup>

          <FormLabel>Inizio</FormLabel>

          <FormInput
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
          />

        </FormGroup>

        <FormGroup>

          <FormLabel>Durata pianificata (minuti)</FormLabel>

          <FormInput
            type="number"
            value={plannedMinutes}
            onChange={(e) => setPlannedMinutes(e.target.value)}
            required
          />

          <div className="duration-quick-buttons">

            <Button
              type="button"
              variant="secondary"
              onClick={() => applyQuickDuration(30)}
            >
              30 min
            </Button>

            <Button
              type="button"
              variant="secondary"
              onClick={() => applyQuickDuration(60)}
            >
              60 min
            </Button>

            <Button
              type="button"
              variant="secondary"
              onClick={() => applyQuickDuration(90)}
            >
              90 min
            </Button>

            <Button
              type="button"
              variant="secondary"
              onClick={() => applyQuickDuration(120)}
            >
              120 min
            </Button>

          </div>

        </FormGroup>

        <FormGroup>

          <FormLabel>Fine prevista</FormLabel>

          <FormInput
            type="datetime-local"
            value={expectedEndTime}
            disabled
          />

        </FormGroup>

        <FormGroup>

          <FormLabel>Importo pianificato</FormLabel>

          <FormInput
            type="number"
            step="0.01"
            value={plannedAmount}
            onChange={(e) => setPlannedAmount(e.target.value)}
          />

        </FormGroup>

        <FormGroup>

          <FormLabel>Valuta</FormLabel>

          <FormSelect
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            options={[
              { value: "EUR", label: "EUR (€)" },
              { value: "CHF", label: "CHF (CHF)" }
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

export default SessionForm;