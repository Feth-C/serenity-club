// backend/src/services/GoogleCalendarService.js

const { google } = require('googleapis');
const Session = require('../models/Session');

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN
});

const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

const TIMEZONE = 'Europe/Zurich';


// ---------------------------------------------------
// Helpers
// ---------------------------------------------------

function calculateEnd(session) {
  const start = new Date(session.start_time);
  return new Date(start.getTime() + session.planned_minutes * 60000);
}

function buildDescription(session, extra = '') {

  let desc = `Cliente: ${session.client_name}
Início: ${new Date(session.start_time).toLocaleString()}
Fim previsto: ${calculateEnd(session).toLocaleString()}
ID sessão: ${session.id}`;

  if (session.notes) desc += `\nNota: ${session.notes}`;
  if (extra) desc += `\n${extra}`;

  return desc;
}

function buildEvent(session, extra = '') {

  const start = new Date(session.start_time);
  const end = calculateEnd(session);

  return {
    summary: `${session.member_name ? session.member_name + ' • ' : ''}Sessione — ${session.client_name}`,
    description: buildDescription(session, extra),
    start: {
      dateTime: start.toISOString(),
      timeZone: TIMEZONE
    },
    end: {
      dateTime: end.toISOString(),
      timeZone: TIMEZONE
    }
  };
}


// ---------------------------------------------------
// CREATE
// ---------------------------------------------------

async function createSessionEvent(session) {

  try {

    const event = buildEvent(session);

    const res = await calendar.events.insert({
      calendarId: 'primary',
      resource: event
    });

    await Session.updateGoogleEventId(session.id, res.data.id);

    return res.data.id;

  } catch (error) {

    console.error("Erro Google Calendar (create):", error?.response?.data || error.message);

  }
}


// ---------------------------------------------------
// UPDATE
// ---------------------------------------------------

async function updateSessionEvent(session) {

  if (!session.google_event_id) return;

  try {

    const event = buildEvent(session);

    await calendar.events.update({
      calendarId: 'primary',
      eventId: session.google_event_id,
      resource: event
    });

  } catch (error) {

    const code = error?.response?.status;

    // se evento foi apagado manualmente no Google
    if (code === 404) {

      console.warn("Evento Google não encontrado, recriando...");

      return createSessionEvent(session);
    }

    console.error("Erro Google Calendar (update):", error?.response?.data || error.message);

  }
}


// ---------------------------------------------------
// DELETE (melhor que cancelar)
// ---------------------------------------------------

async function deleteSessionEvent(session) {
  if (!session?.google_event_id) return;

  try {
    await calendar.events.delete({
      calendarId: 'primary',
      eventId: session.google_event_id
    });

  } catch (error) {

    // evento não encontrado → ignora
    if (error?.response?.status === 404) {
      console.log("Evento Google não encontrado, ignorando.");
      return;
    }

    // recurso já deletado → ignora
    if (error?.response?.data?.error?.code === 410) {
      console.log("Evento já removido do Google Calendar");
      return;
    }

    // qualquer outro erro → log
    console.error("Erro Google Calendar (delete):", error?.response?.data || error.message);
  }
}

module.exports = {
  createSessionEvent,
  updateSessionEvent,
  deleteSessionEvent
};