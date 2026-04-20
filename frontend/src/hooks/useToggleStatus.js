// frontend/src/hooks/useToggleStatus.js

import api from "../api/api";

const useToggleStatus = (endpoint, refetch) => {

    const toggleStatus = async (id, currentStatus, label = "elemento") => {

        const newStatus = currentStatus === "active" ? "inactive" : "active";

        const action =
            newStatus === "inactive" ? "disattivare" : "riattivare";

        if (
            !window.confirm(`Vuoi ${action} questo ${label}?`)
        )
            return;

        try {

            await api.put(`${endpoint}/${id}`, {
                status: newStatus
            });

            if (refetch) refetch();

        } catch (err) {

            console.error(`Errore cambio stato ${label}:`, err);

        }
    };

    return toggleStatus;
};

export default useToggleStatus;