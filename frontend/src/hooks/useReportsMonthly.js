// frontend/src/hooks/useReportsMonthly.js

import { useEffect, useState } from 'react';
import api from '../api/api';

export default function useReportsMonthly(month) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchReport = async () => {
            try {
                setLoading(true);
                const res = await api.get(`/reports/monthly?month=${month}`);
                setData(res.data);
            } catch (err) {
                console.error(err);
                setError('Errore durante il caricamento del report');
            } finally {
                setLoading(false);
            }
        };

        fetchReport();
    }, [month]);

    return { data, loading, error };
}
