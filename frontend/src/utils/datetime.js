// frontend/src/utils/datetime.js

/**
 * Converte ISO UTC -> datetime-local (input HTML)
 */
export function toLocalDatetime(isoString) {
    if (!isoString) return "";

    const d = new Date(isoString);
    if (isNaN(d)) return "";

    const pad = (n) => String(n).padStart(2, "0");

    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
        d.getDate()
    )}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * Converte datetime-local -> ISO UTC
 */
export function toUTCISOString(localDatetime) {
    if (!localDatetime) return null;

    const d = new Date(localDatetime);
    if (isNaN(d)) return null;

    return d.toISOString();
}

/**
 * Agora em formato datetime-local
 */
export function nowLocalDatetime() {
    return toLocalDatetime(new Date().toISOString());
}

/**
 * Próxima hora cheia
 */
export function getNextRoundedHour(date = new Date()) {
    const d = new Date(date);

    d.setMinutes(0, 0, 0);
    d.setHours(d.getHours() + 1);

    return toLocalDatetime(d.toISOString());
}

/**
 * Calcula minutos entre duas datas
 */
export function calculateMinutesBetween(startISO, endISO) {
    if (!startISO || !endISO) return 0;

    const start = new Date(startISO);
    const end = new Date(endISO);

    if (isNaN(start) || isNaN(end)) return 0;

    const minutes = Math.round((end - start) / 60000);

    return minutes < 0 ? 0 : minutes;
}

/**
 * Calcula horário de término
 */
export function calculateExpectedEnd(startLocal, minutes) {
    if (!startLocal || !minutes) return "";

    const date = new Date(startLocal);
    date.setMinutes(date.getMinutes() + Number(minutes));

    const pad = (n) => String(n).padStart(2, "0");

    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
        date.getDate()
    )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}