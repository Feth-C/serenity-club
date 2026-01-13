// frontend/src/hooks/useReportsMonthly.js

import { useState, useEffect, useCallback } from 'react';
import api from '../api/api';

export default function useReportsMonthly({ startDate = '', endDate = '' } = {}) {
  const [data, setData] = useState({
    currencies: {},
    transactions: [],
    totalIncome: 0,
    totalExpense: 0,
    totalBalance: 0,
    loading: true,
    error: null,
  });

  const fetchReports = useCallback(async () => {
    setData(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Formata datas para YYYY-MM-DD
      const formatDateForBackend = (dateStr) => {
        if (!dateStr) return '';
        const [year, month, day] = dateStr.includes('-') ? dateStr.split('-') : dateStr.split('/');
        return dateStr.includes('-') ? dateStr : `${year}-${month}-${day}`;
      };

      const params = {
        start_date: formatDateForBackend(startDate),
        end_date: formatDateForBackend(endDate)
      };

      const response = await api.get('/reports/monthly', { params });
      const { currencies, transactions, totalIncome, totalExpense, totalBalance } = response.data;

      setData({
        currencies,
        transactions: transactions.sort((a, b) => new Date(b.date) - new Date(a.date)),
        totalIncome,
        totalExpense,
        totalBalance,
        loading: false,
        error: null,
      });
    } catch (err) {
      console.error('Erro ao carregar relatório mensal:', err);
      setData(prev => ({ ...prev, loading: false, error: 'Erro ao carregar relatório mensal.' }));
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  return { ...data, refetch: fetchReports };
}
