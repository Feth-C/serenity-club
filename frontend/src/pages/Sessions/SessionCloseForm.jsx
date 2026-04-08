// src/pages/sessions/SessionCloseForm.jsx

import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import PageLayout from "../../components/layout/PageLayout/PageLayout";
import Form from "../../components/ui/form/form";
import FormGroup from "../../components/ui/form/form-group";
import FormLabel from "../../components/ui/form/form-label";
import FormInput from "../../components/ui/form/form-input";
import FormSelect from "../../components/ui/form/form-select";
import Button from "../../components/ui/Button/Button";

import { getSessionById, closeSession } from "../../api/sessions";

import { nowLocalDatetime, calculateMinutesBetween, toUTCISOString } from "../../utils/datetime";

const SessionCloseForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const [session, setSession] = useState(null);

    const [usedMinutes, setUsedMinutes] = useState("");
    const [finalAmount, setFinalAmount] = useState("");
    const [partialPayment, setPartialPayment] = useState(false);
    const [percentage, setPercentage] = useState("");
    const [paidAmount, setPaidAmount] = useState("");

    const [paymentMethod, setPaymentMethod] = useState("cash");
    const [endTime, setEndTime] = useState(nowLocalDatetime());
    const [notes, setNotes] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const currency = session?.currency || "EUR";

    // --------------------------
    // Carregar sessão
    // --------------------------
    useEffect(() => {
        const loadSession = async () => {
            try {
                const data = await getSessionById(id);
                setSession(data);

                setUsedMinutes(data.planned_minutes || "");
                setFinalAmount(data.planned_amount || "");
                setPaidAmount(data.planned_amount || "");
                setPercentage("100");
                setNotes(data.notes || "");
                setEndTime(nowLocalDatetime());
            } catch {
                setError("Errore nel caricamento della sessione");
            }
        };

        if (id) loadSession();
    }, [id]);

    // --------------------------
    // Partial Payment Handlers
    // --------------------------
    const handlePartialToggle = (checked) => {
        setPartialPayment(checked);
        if (!checked) {
            setPaidAmount(finalAmount);
            setPercentage("100");
        } else {
            setPaidAmount("");
            setPercentage("");
        }
    };

    const handlePercentageChange = (value) => {
        setPercentage(value);
        if (!finalAmount) return;
        const calc = (Number(finalAmount) * Number(value)) / 100;
        setPaidAmount(calc.toFixed(2));
    };

    const handlePaidAmountChange = (value) => {
        setPaidAmount(value);
        if (!finalAmount) return;
        const perc = (Number(value) / Number(finalAmount)) * 100;
        setPercentage(perc.toFixed(0));
    };

    const applyPercentage = (p) => {
        if (!finalAmount) return;
        setPercentage(p);
        const value = (Number(finalAmount) * p) / 100;
        setPaidAmount(value.toFixed(2));
    };

    const remaining = finalAmount && paidAmount
        ? (Number(finalAmount) - Number(paidAmount)).toFixed(2)
        : "0.00";

    // --------------------------
    // Submit Handler
    // --------------------------
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const payload = {
                payer_type: "client",
                payer_name: session.client_name,
                used_minutes: Number(usedMinutes),
                final_amount: Number(finalAmount),
                paid_amount: partialPayment ? Number(paidAmount) : Number(finalAmount),
                currency,
                payment_method: paymentMethod,
                actual_end_time: toUTCISOString(endTime),
                notes: notes || null,
            };

            await closeSession(id, payload);
            navigate("/sessions");
        } catch (err) {
            setError(err.response?.data?.message || "Errore durante la chiusura della sessione");
        } finally {
            setLoading(false);
        }
    };

    if (!session) return <p>Caricamento...</p>;

    return (
        <PageLayout
            title="Chiudi Sessione"
            backButton={<Button variant="secondary" onClick={() => navigate(-1)}>← Indietro</Button>}
            maxWidth="700px"
        >
            {/* --- SESSION SUMMARY --- */}
            <div className="session-summary">
                <h3>Informazioni sulla sessione</h3>
                <p><strong>Cliente:</strong> {session.client_name}</p>
                <p><strong>Inizio:</strong> {new Date(session.start_time).toLocaleString()}</p>
                <p><strong>Durata prevista:</strong> {session.planned_minutes} min</p>
                <p><strong>Fine prevista:</strong> {session.expected_end_time ? new Date(session.expected_end_time).toLocaleString() : "-"}</p>
                <p><strong>Importo previsto:</strong> {session.planned_amount ? `${Number(session.planned_amount).toFixed(2)} ${currency}` : "-"}</p>
                <p><strong>Note:</strong> {session.notes || "-"}</p>
            </div>

            {/* --- FORM --- */}
            <Form onSubmit={handleSubmit}>

                {/* Minuti e Importo */}
                <FormGroup>
                    <FormLabel>Minuti utilizzati</FormLabel>
                    <FormInput type="number" value={usedMinutes} onChange={(e) => setUsedMinutes(e.target.value)} required />
                </FormGroup>

                <FormGroup>
                    <FormLabel>Importo finale</FormLabel>
                    <FormInput type="number" step="0.01" value={finalAmount} onChange={(e) => setFinalAmount(e.target.value)} required />
                </FormGroup>

                {/* Valuta */}
                <FormGroup>
                    <FormLabel>Valuta</FormLabel>
                    <FormSelect
                        value={currency}
                        onChange={(e) => setSession({ ...session, currency: e.target.value })}
                        options={[
                            { value: "EUR", label: "EUR (€)" },
                            { value: "CHF", label: "CHF (CHF)" }
                        ]}
                    />
                </FormGroup>

                {/* Metodo pagamento */}
                <FormGroup>
                    <FormLabel>Metodo pagamento</FormLabel>
                    <FormSelect
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        options={[
                            { value: "cash", label: "💰 Contanti" },
                            { value: "card", label: "💳 Carta" },
                            { value: "transfer", label: "🏦 Bonifico" },
                            { value: "twint", label: "🌐 Twint" },
                        ]}
                    />
                </FormGroup>

                {/* Partial Payment */}
                <FormGroup>
                    <div className="checkbox-field">
                        <input id="partial-payment" type="checkbox" checked={partialPayment} onChange={(e) => handlePartialToggle(e.target.checked)} />
                        <FormLabel htmlFor="partial-payment">Pagamento parziale</FormLabel>
                    </div>
                </FormGroup>

                {partialPayment && (
                    <div className="session-close-partial">
                        <FormGroup>
                            <FormLabel>Percentuale</FormLabel>
                            <FormInput type="number" value={percentage} onChange={(e) => handlePercentageChange(e.target.value)} />
                            <div className="percentage-buttons">
                                {[25, 50, 75].map((p) => (
                                    <Button key={p} type="button" variant="secondary" onClick={() => applyPercentage(p)}>{p}%</Button>
                                ))}
                            </div>
                        </FormGroup>

                        <FormGroup>
                            <FormLabel>Importo pagato</FormLabel>
                            <div className="money-inline">
                                <FormInput type="number" step="0.01" value={paidAmount} onChange={(e) => handlePaidAmountChange(e.target.value)} required />
                                <span className="currency-label">{currency}</span>
                            </div>
                        </FormGroup>

                        <FormGroup>
                            <FormLabel>Saldo restante</FormLabel>
                            <div className={`payment-remaining ${Number(remaining) > 0 ? "payment-remaining--pending" : "payment-remaining--paid"}`}>
                                <strong>{remaining} {currency}</strong>
                            </div>
                        </FormGroup>
                    </div>
                )}

                {/* Fine sessione */}
                <FormGroup>
                    <FormLabel>Fine sessione</FormLabel>
                    <FormInput type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
                </FormGroup>

                {/* Note */}
                <FormGroup>
                    <FormLabel>Note</FormLabel>
                    <FormInput as="textarea" rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} />
                </FormGroup>

                {error && <p className="form-text form-text--error">{error}</p>}

                <div className="form-actions">
                    <Button type="submit" disabled={loading}>{loading ? "Salvataggio..." : "Chiudi Sessione"}</Button>
                    <Button variant="secondary" onClick={() => navigate(-1)}>Annulla</Button>
                </div>
            </Form>
        </PageLayout>
    );
};

export default SessionCloseForm;