// frontend/src/api/reports.js

import api from './api';

// Buscar relatórios filtrados
export const fetchReports = async (filters = {}, page = 1, perPage = 10, sort = {}) => {
    const params = {
        ...filters,
        page,
        perPage,
        sortField: sort.field || 'date',
        sortOrder: sort.order || 'desc',
    };

    const response = await api.get('/reports', { params });
    return response;
};

// Exportar relatório em CSV
export const exportReportsCSV = async (filters) => {
    const params = new URLSearchParams(filters).toString();
    const response = await api.get(`/reports/sessions/export/csv?${params}`, {
        responseType: 'blob',
    });
    return response.data;
};

// Exportar relatório em PDF
export const exportReportsPDF = async (filters) => {
    const params = new URLSearchParams(filters).toString();
    const response = await api.get(`/reports/sessions/export/pdf?${params}`, {
        responseType: 'blob',
    });
    return response.data;
};
