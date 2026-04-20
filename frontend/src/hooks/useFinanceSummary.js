// frontend/src/hooks/useFinanceSummary.js

import { useState, useEffect } from 'react';
import api from '../api/api';

export default function useFinanceSummary({ monthly = false, month } = {}) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true);
      setError('');

      try {
        const url = monthly
          ? `/finance/monthly?month=${month}`
          : `/finance/summary`;

        const res = await api.get(url);
        setSummary(res);
      } catch (err) {
        console.error('Errore durante la cerca del riepilogo.:', err);
        setError('Errore durante il caricamento del riepilogo finanziario.');
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [monthly, month]);

  return { summary, loading, error };
}
