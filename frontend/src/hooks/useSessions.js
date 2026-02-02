// frontend/src/hooks/useSessions.js

import { useState, useCallback, useEffect } from 'react';
import {
  fetchOpenSessions,
  createSession,
  closeSession
} from '../api/sessions';

/**
 * Retorna a próxima hora cheia como string no formato 'YYYY-MM-DDTHH:mm'
 * Ideal para pré-preencher campos datetime-local
 */
export function getNextRoundedHour() {
  const now = new Date();
  const d = new Date(now);

  d.setMinutes(0, 0, 0); // minutos, segundos e milissegundos zerados
  if (now > d) {
    d.setHours(d.getHours() + 2);
  }

  return d.toISOString().slice(0, 16);
}

export default function useSessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ----------------------------------
  // Buscar sessões abertas
  // ----------------------------------
  const loadOpenSessions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchOpenSessions();
      setSessions(response || []);
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
      await loadOpenSessions();
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
      await loadOpenSessions();
    } catch (err) {
      setError(err);
      throw err;
    }
  };

  // ----------------------------------
  // Auto-load inicial
  // ----------------------------------
  useEffect(() => {
    loadOpenSessions();
  }, [loadOpenSessions]);

  return {
    sessions,
    loading,
    error,
    refetch: loadOpenSessions,
    startSession,
    endSession
  };
}
