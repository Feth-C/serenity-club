// frontend/src/pages/Sessions/SessionsList.jsx

import { useNavigate } from 'react-router-dom';
import useSessions from '../../hooks/useSessions';

const SessionsList = () => {
    const navigate = useNavigate();

    const {
        sessions,
        loading,
        error,
        refetch
    } = useSessions();

    if (loading) return <p>Caricamento sessioni...</p>;
    if (error) return <p style={{ color: 'red' }}>Errore nel caricamento</p>;

    return (
        <div style={{ padding: 20 }}>
            <h1>Sessioni aperte</h1>

            {/* Ações principais */}
            <div style={{ marginBottom: 20 }}>
                <button onClick={() => navigate('/sessions/new')}>
                    + Nuova sessione
                </button>

                <button
                    onClick={refetch}
                    style={{ marginLeft: 10 }}
                >
                    Aggiorna
                </button>
            </div>

            {/* Lista */}
            {sessions.length === 0 ? (
                <p>Nessuna sessione aperta</p>
            ) : (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    {sessions.map(session => (
                        <li
                            key={session.id}
                            style={{
                                border: '1px solid #ccc',
                                padding: 15,
                                marginBottom: 15,
                                borderRadius: 6
                            }}
                        >
                            <div>
                                <strong>Cliente:</strong>{' '}
                                {session.client_name || '—'}
                            </div>

                            <div>
                                <strong>Inizio:</strong>{' '}
                                {new Date(session.start_time).toLocaleString()}
                            </div>

                            <div>
                                <strong>Minuti pianificati:</strong>{' '}
                                {session.planned_minutes}
                            </div>

                            <div>
                                <strong>Fine prevista:</strong>{' '}
                                {new Date(session.expected_end_time).toLocaleString()}
                            </div>

                            {/* Ações */}
                            <div style={{ marginTop: 10 }}>
                                <button
                                    onClick={() =>
                                        navigate(`/sessions/close/${session.id}`)
                                    }
                                >
                                    Chiudi sessione
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default SessionsList;
