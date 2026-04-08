// frontend/src/hooks/useDelete.js

import api from "../api/api";

const useDelete = (endpoint, refetch) => {
    const handleDelete = async (id, label = "elemento") => {
        if (!window.confirm(`Vuoi eliminare questo ${label}?`)) return;

        try {
            await api.delete(`${endpoint}/${id}`);
            refetch();
        } catch (err) {
            console.error(`Errore eliminazione ${label}:`, err);
        }
    };

    return handleDelete;
};

export default useDelete;