// frontend/src/hooks/useFetchList.js

import { useEffect, useState } from 'react';
import api from '../api/api';
import { normalizeItems } from '../utils/normalizeItems';

const useFetchList = (
    endpoint,
    {
        initialPage = 1,
        perPage = 10,
        initialStatusFilter = ''
    } = {}
) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [page, setPage] = useState(initialPage);
    const [totalPages, setTotalPages] = useState(1);
    const [statusFilter, setStatusFilter] = useState(initialStatusFilter);

    const fetchData = async () => {
        setLoading(true);
        setError('');

        try {
            const params = { page, perPage };
            if (statusFilter) params.status = statusFilter;

            const res = await api.get(endpoint, { params });

            setItems(normalizeItems(res));
            setTotalPages(res.data?.totalPages || 1);
        } catch (err) {
            console.error(`Errore nel caricamento ${endpoint}`, err);
            setError('Errore nel caricamento dei dati');
            setItems([]);
            setTotalPages(1);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [endpoint, page, statusFilter]);

    return {
        items,
        loading,
        error,
        page,
        totalPages,
        statusFilter,
        setPage,
        setStatusFilter,
        refetch: fetchData
    };
};

export default useFetchList;
