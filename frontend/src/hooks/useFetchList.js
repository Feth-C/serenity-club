// frontend/src/hooks/useFetchList.js

import { useEffect, useState, useCallback } from 'react';
import api from '../api/api';
import { normalizeItems } from '../utils/normalizeItems';
import { normalizeEntity } from '../utils/normalizeEntity'; // 👈 ADICIONE ESTA LINHA

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
  const [extraData, setExtraData] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const params = { page, limit: perPage, ...filters };
      const res = await api.get(endpoint, { params });

      // 1. Usamos o seu normalizeEntity para pegar a raiz dos dados (o objeto 'data' da resposta)
      // Isso vai retornar { items, stats, totalPages, totalItems } se vier do novo Controller
      const rootData = normalizeEntity(res);

      if (rootData) {
        // 2. Extraímos os itens usando sua lógica de array
        // Passamos rootData envolto em um objeto para o normalizeItems entender o contexto
        const itemsArray = normalizeItems({ data: rootData });
        setItems(itemsArray);

        // 3. Pegamos os metadados de paginação que agora estão no rootData
        setTotalPages(rootData.totalPages || 1);
        setTotalItems(rootData.totalItems || 0);

        // 4. Capturamos o extraData (stats)
        setExtraData(rootData.stats || null);
      }
    } catch (err) {
      console.error(`Errore nel caricamento ${endpoint}`, err);
      setError('Errore nel caricamento dei dati');
      setItems([]);
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
    extraData,
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