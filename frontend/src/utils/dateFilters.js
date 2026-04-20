// frontend/src/utils/dateFilters.js

export function getToday() {
    return new Date().toISOString().split("T")[0];
}

export function getFirstDayOfMonth() {
    const now = new Date();
    const first = new Date(now.getFullYear(), now.getMonth(), 1);
    return first.toISOString().split("T")[0];
}

export function getFirstDayOfYear() {
    const now = new Date();
    const first = new Date(now.getFullYear(), 0, 1);
    return first.toISOString().split("T")[0];
}