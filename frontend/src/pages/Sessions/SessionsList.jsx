// frontend/src/pages/Sessions/SessionsList.jsx
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import useSessions from "../../hooks/useSessions";

import PageLayout from "../../components/layout/PageLayout/PageLayout";
import Card from "../../components/ui/Card/Card";
import Button from "../../components/ui/Button/Button";

import "./SessionsList.css";

const SessionsList = () => {
    const navigate = useNavigate();
    const [showAllHistory, setShowAllHistory] = useState(false);

    const {
        sessions: openSessions,
        historySessions = [],
        loading,
        error,
        refetch,
        cancelSession
    } = useSessions();

    const HISTORY_LIMIT = 10;
    const visibleHistory = showAllHistory ? historySessions : historySessions.slice(0, HISTORY_LIMIT);
    const hasMoreThanLimit = historySessions.length > HISTORY_LIMIT;

    const handleCancel = async (sessionId) => {
        const ok = window.confirm("Vuoi davvero annullare questa sessione?");
        if (!ok) return;

        try {
            await cancelSession(sessionId);
            refetch();
        } catch {
            alert("Errore nell’annullamento della sessione");
        }
    };

    const formatDateTime = (dateStr) => {
        if (!dateStr) return "-";
        const date = new Date(dateStr);
        return date.toLocaleString("it-IT", {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const formatTime = (dateStr) => {
        if (!dateStr) return "-";
        const date = new Date(dateStr);
        return date.toLocaleTimeString("it-IT", { hour: '2-digit', minute: '2-digit' });
    };

    const renderSessionCard = (session, isOpen = true) => (
        <div key={session.id} className="session-card">
            <div className="session-card-top">
                <div className="session-client">
                    #{session.id} | {session.member_name ? `${session.member_name} • ` : ""}
                    Utente {session.client_name || "Cliente"}
                </div>
                <div
                    className={`session-status ${isOpen
                            ? "session-status--active"
                            : session.status === "closed"
                                ? "session-status--closed"
                                : "session-status--cancelled"
                        }`}
                >
                    {isOpen ? "aperta" : session.status === "closed" ? "conclusa" : "annullata"}
                </div>
            </div>

            <div className="session-info">
                <div className="session-row">
                    <span className="session-label">Inizio</span>
                    <span className="session-value">{formatDateTime(session.start_time)}</span>
                    {isOpen && (
                        <div className="session-action">
                            <Button size="sm" variant="secondary" onClick={() => navigate(`/sessions/edit/${session.id}`)}>Modifica</Button>
                        </div>
                    )}
                </div>

                <div className="session-row">
                    <span className="session-label">Durata</span>
                    <span className="session-value">{session.planned_minutes} min</span>
                    {isOpen && (
                        <div className="session-action">
                            <Button size="sm" variant="secondary" onClick={() => handleCancel(session.id)}>Annulla</Button>
                        </div>
                    )}
                </div>

                <div className="session-row">
                    <span className="session-label">Fine prevista</span>
                    <span className="session-value">{formatDateTime(session.expected_end_time)}</span>
                </div>

                {isOpen && (
                    <div className="session-row">
                        <span className="session-label">Importo previsto</span>
                        <span className="session-value">{session.planned_amount ?? "-"} {session.currency}</span>
                        <div className="session-action">
                            <Button size="sm" variant="success" onClick={() => navigate(`/sessions/close/${session.id}`)}>Concludi</Button>
                        </div>
                    </div>
                )}

                {!isOpen && session.actual_end_time && (
                    <div className="session-row">
                        <span className="session-label">Fine reale</span>
                        <span className="session-value">{formatDateTime(session.actual_end_time)}</span>
                    </div>
                )}

                {!isOpen && (session.final_amount || session.status === "cancelled") && (
                    <div className="session-row">
                        <span className="session-label">Importo</span>
                        <span className="session-value">
                            {session.final_amount ?? session.planned_amount ?? "-"} {session.currency}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <PageLayout
            title="⌛ Sessioni"
            subtitle="Gestione delle sessioni del club"
            actions={
                <Button variant="primary" onClick={() => navigate("/sessions/new")}>+ Nuova sessione</Button>
            }
        >
            <Card title="🔓 Sessioni Aperte">
                {loading && <p>Caricamento...</p>}
                {error && <p className="text-error">Errore nel caricamento</p>}
                {!loading && openSessions.length === 0 && <p className="text-muted">Nessuna sessione aperta</p>}
                <div className="sessions-grid">{openSessions.map(s => renderSessionCard(s, true))}</div>
            </Card>

            <Card title="📋 Storico Sessioni">
                {historySessions.length === 0 && <p className="text-muted">Nessuna sessione nello storico</p>}
                <div className="sessions-grid">{visibleHistory.map(s => renderSessionCard(s, false))}</div>
                {hasMoreThanLimit && (
                    <div className="sessions-more">
                        <Button size="sm" variant="secondary" onClick={() => setShowAllHistory(prev => !prev)}>
                            {showAllHistory ? "Mostra meno" : `Vedi altre (${historySessions.length - HISTORY_LIMIT})`}
                        </Button>
                    </div>
                )}
            </Card>
        </PageLayout>
    );
};

export default SessionsList;