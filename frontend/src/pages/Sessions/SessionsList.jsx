// frontend/src/pages/Sessions/SessionsList.jsx

import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import useSessions from '../../hooks/useSessions';

const SessionsList = () => {
    const navigate = useNavigate();
    const [showAllHistory, setShowAllHistory] = useState(false);

    const {
        sessions: openSessions,   // abertas
        historySessions = [],     // histórico
        loading,
        error,
        refetch,
        cancelSession
    } = useSessions();

    if (loading) return <p>Caricamento sessioni...</p>;
    if (error) return <p style={{ color: 'red' }}>Errore nel caricamento</p>;

    const cardStyle = {
        border: '1px solid #ccc',
        padding: 15,
        marginBottom: 15,
        borderRadius: 6
    };

    // ====== LÓGICA DO "VER MAIS / VER MENOS" ======
    const HISTORY_LIMIT = 5;

    const visibleHistory = showAllHistory
        ? historySessions
        : historySessions.slice(0, HISTORY_LIMIT);

    const hasMoreThanLimit = historySessions.length > HISTORY_LIMIT;
    // ==============================================

    return (
        <div style={{ padding: 20 }}>

            {/* ============================= */}
            {/* SESSÕES ABERTAS (PRINCIPAL)  */}
            {/* ============================= */}

            <h1>🔓 Sessioni aperte</h1>

            <div style={{ marginBottom: 20 }}>
                <button onClick={() => navigate('/sessions/new')}>
                    + Nuova sessione
                </button>
            </div>

            {openSessions.length === 0 ? (
                <p>Nessuna sessione aperta</p>
            ) : (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    {openSessions.map(session => (
                        <li key={session.id} style={cardStyle}>

                            <div>
                                <strong>📋 Cliente:</strong>{' '}
                                {session.client_name || '—'}
                            </div>

                            <div>
                                <strong>📅 Inizio:</strong>{' '}
                                {new Date(session.start_time).toLocaleString()}
                            </div>

                            <div>
                                <strong>⏳ Minuti pianificati:</strong>{' '}
                                {session.planned_minutes}
                            </div>

                            <div>
                                <strong>☑️ Fine prevista:</strong>{' '}
                                {new Date(session.expected_end_time).toLocaleString()}
                            </div>

                            <div style={{ marginTop: 10, display: 'flex', gap: 10 }}>

                                <button
                                    onClick={() =>
                                        navigate(`/sessions/close/${session.id}`)
                                    }
                                >
                                    Concludi sessione
                                </button>

                                <button
                                    onClick={() =>
                                        navigate(`/sessions/edit/${session.id}`)
                                    }
                                >
                                    Modifica
                                </button>

                                <button
                                    style={{ backgroundColor: '#5c2222', color: 'white' }}
                                    onClick={async () => {
                                        const ok = window.confirm(
                                            'Vuoi davvero annullare questa sessione?'
                                        );

                                        if (!ok) return;

                                        try {
                                            await cancelSession(session.id);
                                            refetch();
                                        } catch (err) {
                                            alert('Errore nell’annullamento della sessione');
                                            console.error(err);
                                        }
                                    }}
                                >
                                    Annulla
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {/* ============================= */}
            {/* HISTÓRICO (SECUNDÁRIO)       */}
            {/* ============================= */}

            <h2 style={{ marginTop: 100 }}>🗂️ Storico sessioni</h2>

            <p style={{ color: '#777', marginBottom: 10 }}>
                Solo consultazione — le sessioni chiuse o annullate non possono essere modificate.
            </p>

            {historySessions.length === 0 ? (
                <p>Nessuna sessione nello storico</p>
            ) : (
                <>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {visibleHistory.map(session => (
                            <li key={session.id} style={cardStyle}>

                                <div>
                                    <strong>📋 Cliente:</strong>{' '}
                                    {session.client_name || '—'}
                                </div>

                                <div>
                                    <strong>📅 Inizio:</strong>{' '}
                                    {new Date(session.start_time).toLocaleString()}
                                </div>

                                <div>
                                    <strong>⏳ Durata pianificata:</strong>{' '}
                                    {session.planned_minutes} min
                                </div>

                                <div>
                                    <strong>Status:</strong>{' '}
                                    {session.status === 'closed'
                                        ? '✅ Conclusa'
                                        : '❌ Annullata'}
                                </div>

                                {session.actual_end_time && (
                                    <div>
                                        <strong>☑️ Fine reale:</strong>{' '}
                                        {new Date(session.actual_end_time).toLocaleString()}
                                    </div>
                                )}

                                {session.final_amount && (
                                    <div>
                                        <strong>🪙 Importo finale:</strong>{' '}
                                        {session.final_amount} {session.currency}
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>

                    {/* BOTÃO VER MAIS / VER MENOS */}
                    {hasMoreThanLimit && (
                        <button
                            style={{ marginTop: 10 }}
                            onClick={() => setShowAllHistory(prev => !prev)}
                        >
                            {showAllHistory
                                ? 'Mostra meno'
                                : `Vedi altre (${historySessions.length - HISTORY_LIMIT})`}
                        </button>
                    )}
                </>
            )}
        </div>
    );
};

export default SessionsList;
