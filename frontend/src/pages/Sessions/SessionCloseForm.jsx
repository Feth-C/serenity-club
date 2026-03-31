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

const SessionCloseForm = () => {

    const navigate = useNavigate();
    const { id } = useParams();

    const [session, setSession] = useState(null);
    const [payerType, setPayerType] = useState("client");
    const [payerName, setPayerName] = useState("");
    const [usedMinutes, setUsedMinutes] = useState("");
    const [finalAmount, setFinalAmount] = useState("");

    const [partialPayment, setPartialPayment] = useState(false);
    const [percentage, setPercentage] = useState("");
    const [paidAmount, setPaidAmount] = useState("");

    const [paymentMethod, setPaymentMethod] = useState("cash");

    const [endTime, setEndTime] = useState("");
    const [notes, setNotes] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const currency = session?.currency || "EUR";

    const formatNow = () => {

        const now = new Date();
        const pad = (n) => String(n).padStart(2, "0");

        return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;

    };

    useEffect(() => {

        const loadSession = async () => {

            try {

                const data = await getSessionById(id);

                setSession(data);
                setPayerName(data.client_name || "");
                setPayerType("client");
                setUsedMinutes(data.planned_minutes || "");
                setFinalAmount(data.planned_amount || "");
                setNotes(data.notes || "");
                setEndTime(formatNow());


            } catch {

                setError("Errore nel caricamento della sessione");

            }

        };

        loadSession();

    }, [id]);


    const applyPercentage = (p) => {

        if (!finalAmount) return;

        const value = (Number(finalAmount) * p) / 100;

        setPercentage(p);
        setPaidAmount(value.toFixed(2));

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


    const handlePartialToggle = (checked) => {

        setPartialPayment(checked);

        if (!checked) {

            setPercentage("");
            setPaidAmount("");

        }

    };


    const remaining = finalAmount && paidAmount
        ? (Number(finalAmount) - Number(paidAmount)).toFixed(2)
        : null;


    const handleSubmit = async (e) => {

        e.preventDefault();

        setLoading(true);
        setError("");

        const paid = partialPayment ? paidAmount : finalAmount;

        try {

            await closeSession(id, {
                payer_type: payerType,
                payer_name: payerName,
                used_minutes: Number(usedMinutes),
                final_amount: Number(finalAmount),
                paid_amount: Number(paid),
                currency: currency,
                payment_method: paymentMethod,
                actual_end_time: new Date(endTime).toISOString(),
                notes: notes || null

            });

            navigate("/sessions");

        } catch (err) {

            setError(
                err.response?.data?.message ||
                "Errore durante la chiusura della sessione"
            );

        } finally {

            setLoading(false);

        }

    };


    if (!session) return null;


    return (

        <PageLayout
            title="Chiudi Sessione"
            backButton={
                <Button
                    variant="secondary"
                    onClick={() => navigate(-1)}
                >
                    ← Indietro
                </Button>
            }
            maxWidth="700px"
        >

            <Form onSubmit={handleSubmit}>

                {/* ========================= */}
                {/* SESSION SUMMARY           */}
                {/* ========================= */}

                <div className="session-summary">


                    <h3>Informazioni sulla programmazione</h3>

                    <p>
                        <strong>Cliente:</strong> {session.client_name}
                    </p>

                    <p>
                        <strong>Inizio:</strong>{" "}
                        {new Date(session.start_time).toLocaleString()}
                    </p>

                    <p>
                        <strong>Durata prevista:</strong>{" "}
                        {session.planned_minutes} min
                    </p>

                    <p>
                        <strong>Fine prevista:</strong>{" "}
                        {session.expected_end_time
                            ? new Date(session.expected_end_time).toLocaleString()
                            : "-"}
                    </p>

                    <p>
                        <strong>Importo previsto:</strong>{" "}
                        {session.planned_amount
                            ? `${Number(session.planned_amount).toFixed(2)} ${currency}`
                            : "-"}
                    </p>

                    <p>
                        <strong>Note:</strong>{" "}
                        {session.notes}
                    </p>

                </div>


                <div className="session-close-main">

                    <FormGroup>

                        <FormLabel>Minuti utilizzati</FormLabel>

                        <FormInput
                            type="number"
                            value={usedMinutes}
                            onChange={(e) => setUsedMinutes(e.target.value)}
                            required
                        />

                    </FormGroup>


                    <FormGroup>

                        <FormLabel>Importo finale</FormLabel>

                        <FormInput
                            type="number"
                            step="0.01"
                            value={finalAmount}
                            onChange={(e) => setFinalAmount(e.target.value)}
                            required
                        />

                    </FormGroup>


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

                </div>

                {/* ========================= */}
                {/* PAYMENT METHOD            */}
                {/* ========================= */}

                <FormGroup>

                    <FormLabel>Metodo pagamento</FormLabel>

                    <FormSelect
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        options={[
                            { value: "cash", label: "💰 Contanti" },
                            { value: "card", label: "💳 Carta" },
                            { value: "transfer", label: "🏦 Bonifico" },
                            { value: "twint", label: "🌐 Twint" }
                        ]}
                    />

                </FormGroup>


                {/* ========================= */}
                {/* PARTIAL PAYMENT TOGGLE    */}
                {/* ========================= */}

                <FormGroup>

                    <div className="checkbox-field">

                        <input
                            id="partial-payment"
                            type="checkbox"
                            checked={partialPayment}
                            onChange={(e) => handlePartialToggle(e.target.checked)}
                        />

                        <FormLabel htmlFor="partial-payment">
                            Pagamento parziale
                        </FormLabel>

                    </div>

                </FormGroup>


                {/* ========================= */}
                {/* PARTIAL PAYMENT UI        */}
                {/* ========================= */}

                {partialPayment && (

                    <div className="session-close-partial">

                        <FormGroup>

                            <FormLabel>Percentuale</FormLabel>

                            <FormInput
                                type="number"
                                value={percentage}
                                onChange={(e) => handlePercentageChange(e.target.value)}
                            />

                            <div className="percentage-buttons">

                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => applyPercentage(25)}
                                >
                                    25%
                                </Button>

                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => applyPercentage(50)}
                                >
                                    50%
                                </Button>

                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => applyPercentage(75)}
                                >
                                    75%
                                </Button>

                            </div>

                        </FormGroup>


                        <FormGroup>

                            <FormLabel>Importo pagato</FormLabel>

                            <div className="money-inline">

                                <FormInput
                                    type="number"
                                    step="0.01"
                                    value={paidAmount}
                                    onChange={(e) => handlePaidAmountChange(e.target.value)}
                                    required
                                />

                                <span className="currency-label">
                                    {currency}
                                </span>

                            </div>

                        </FormGroup>


                        <FormGroup>

                            <FormLabel>Saldo restante</FormLabel>

                            <div
                                className={`payment-remaining ${Number(remaining) > 0
                                    ? "payment-remaining--pending"
                                    : "payment-remaining--paid"
                                    }`}
                            >

                                <strong>
                                    {remaining || "0.00"} {currency}
                                </strong>

                            </div>

                        </FormGroup>

                    </div>

                )}

                {/* ========================= */}
                {/* END TIME                  */}
                {/* ========================= */}

                <FormGroup>

                    <FormLabel>Fine sessione</FormLabel>

                    <FormInput
                        type="datetime-local"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        required
                    />

                </FormGroup>


                {/* ========================= */}
                {/* NOTES                     */}
                {/* ========================= */}

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

                    <p className="form-text form-text--error">
                        {error}
                    </p>

                )}


                <div className="form-actions">

                    <Button
                        type="submit"
                        disabled={loading}
                    >
                        {loading
                            ? "Salvataggio..."
                            : "Chiudi Sessione"}
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

export default SessionCloseForm;