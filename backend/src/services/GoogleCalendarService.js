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

// ---------------------------------------------------
// Helper para descrição
// ---------------------------------------------------
function buildDescription(session, extra = '') {
  let desc = `Cliente: ${session.client_name}
Início: ${new Date(session.start_time).toLocaleString()}
Fim previsto: ${new Date(new Date(session.start_time).getTime() + session.planned_minutes*60000).toLocaleString()}
ID sessão: ${session.id}`;

  if (session.notes) desc += `\nNota: ${session.notes}`;
  if (extra) desc += `\n${extra}`;

  return desc;
}

// ---------------------------------------------------
// CREATE
// ---------------------------------------------------
module.exports = {
  async createSessionEvent(session) {
    const start = new Date(session.start_time);
    const end = new Date(start.getTime() + session.planned_minutes * 60000);

    const event = {
      summary: `Sessão — ${session.client_name}`,
      description: buildDescription(session),
      start: { dateTime: start.toISOString(), timeZone: 'Europe/Zurich' },
      end: { dateTime: end.toISOString(), timeZone: 'Europe/Zurich' }
    };

    const res = await calendar.events.insert({
      calendarId: 'primary',
      resource: event
    });

    await Session.updateGoogleEventId(session.id, res.data.id);
    return res.data.id;
  },

  // ---------------------------------------------------
  // UPDATE
  // ---------------------------------------------------
  async updateSessionEvent(session) {
    if (!session.google_event_id) return;

    const start = new Date(session.start_time);
    const end = new Date(start.getTime() + session.planned_minutes * 60000);

    const event = {
      summary: `Sessão — ${session.client_name}`,
      description: buildDescription(session),
      start: { dateTime: start.toISOString(), timeZone: 'Europe/Zurich' },
      end: { dateTime: end.toISOString(), timeZone: 'Europe/Zurich' }
    };

    await calendar.events.update({
      calendarId: 'primary',
      eventId: session.google_event_id,
      resource: event
    });
  },

  // ---------------------------------------------------
  // CANCEL
  // ---------------------------------------------------
  async cancelSessionEvent(session, userId) {
    if (!session.google_event_id) return;

    const start = new Date(session.start_time);
    const end = new Date(start.getTime() + session.planned_minutes * 60000);

    const event = {
      summary: `❌ ANNULLATA — Sessione — ${session.client_name}`,
      description: buildDescription(session, `Cancelado pelo usuário ID: ${userId}`),
      start: { dateTime: start.toISOString(), timeZone: 'Europe/Zurich' },
      end: { dateTime: end.toISOString(), timeZone: 'Europe/Zurich' }
    };

    await calendar.events.update({
      calendarId: 'primary',
      eventId: session.google_event_id,
      resource: event
    });
  }
};
