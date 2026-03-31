// frontend/src/hooks/useFetchList.js

import { useEffect, useState, useCallback } from 'react';
import api from '../api/api';
import { normalizeItems } from '../utils/normalizeItems';

const useFetchList = (
  endpoint,
  { initialPage = 1, perPage = 10, initialFilters = {} } = {}
) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [filters, setFilters] = useState(initialFilters);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const params = { page, limit: perPage, ...filters };
      const res = await api.get(endpoint, { params });

      /**
       * 🔹 NOVO PADRÃO OFICIAL (Backend paginado)
       * {
       *   data: [...],
       *   page,
       *   totalPages,
       *   totalItems
       * }
       */
      if (Array.isArray(res.data?.data)) {
        setItems(res.data.data);
        setTotalPages(res.data.totalPages || 1);
        setTotalItems(res.data.totalItems || 0);
      } else {
        /**
         * 🔹 Compatibilidade com endpoints antigos
         */
        const normalized = normalizeItems(res);
        setItems(normalized);
        setTotalPages(res.data?.totalPages || 1);
        setTotalItems(res.data?.totalItems);
      }
    } catch (err) {
      console.error(`Errore nel caricamento ${endpoint}`, err);
      setError('Errore nel caricamento dei dati');
      setItems([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  }, [endpoint, page, perPage, filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 🔹 Quando filtros mudam, resetar a página para 1
  const updateFilters = (newFilters) => {
    setFilters(newFilters);
  };

  return {
    items,
    loading,
    error,
    page,
    totalPages,
    totalItems,
    filters,
    setPage,
    setFilters: updateFilters,
    refetch: fetchData
  };
};

export default useFetchList;