// frontend/src/hooks/useSessions.js

import { useState, useCallback, useEffect } from 'react';
import {
  fetchOpenSessions,
  fetchSessionHistory,
  createSession,
  closeSession,
  cancelSession
} from '../api/sessions';

export default function useSessions() {
  const [sessions, setSessions] = useState([]);
  const [historySessions, setHistorySessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ----------------------------------
  // Buscar TUDO (abertas + histórico)
  // ----------------------------------
  const loadAllSessions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [open, history] = await Promise.all([
        fetchOpenSessions(),
        fetchSessionHistory()
      ]);

      setSessions(open || []);
      setHistorySessions(history || []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // ----------------------------------
  // Criar nova sessão
  // ----------------------------------
  const startSession = async (data) => {
    setError(null);

    try {
      await createSession(data);
      await loadAllSessions();
    } catch (err) {
      setError(err);
      throw err;
    }
  };

  // ----------------------------------
  // Fechar sessão
  // ----------------------------------
  const endSession = async (id, data) => {
    setError(null);

    try {
      await closeSession(id, data);
      await loadAllSessions();
    } catch (err) {
      setError(err);
      throw err;
    }
  };

  // ----------------------------------
  // Cancelar sessão
  // ----------------------------------
  const cancelSessionAction = async (id) => {
    setError(null);

    try {
      await cancelSession(id);
      await loadAllSessions();
    } catch (err) {
      setError(err);
      throw err;
    }
  };

  // ----------------------------------
  // Auto-load inicial
  // ----------------------------------
  useEffect(() => {
    loadAllSessions();
  }, [loadAllSessions]);

  return {
    sessions,
    historySessions,
    loading,
    error,
    refetch: loadAllSessions,
    startSession,
    endSession,
    cancelSession: cancelSessionAction
  };

}
