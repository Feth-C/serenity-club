// frontend/src/utils/normalizeItems.js

export const normalizeItems = (response) => {
    if (!response) return [];

    // Axios padrão → dados em response.data
    const data = response.data ?? response;

    // Padrão paginado mais comum
    if (Array.isArray(data?.items)) return data.items;

    // Alguns backends usam "data"
    if (Array.isArray(data?.data)) return data.data;

    // Array direto
    if (Array.isArray(data)) return data;

    // Fallback seguro
    return [];
};
