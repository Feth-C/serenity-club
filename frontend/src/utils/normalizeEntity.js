// frontend/src/utils/normalizeEntity.js

export const normalizeEntity = (res) => {
    if (!res) return null;

    // Axios response
    if (res.data?.data) {
        return res.data.data;
    }

    // Já normalizado
    if (res.data) {
        return res.data;
    }

    return res;
};
