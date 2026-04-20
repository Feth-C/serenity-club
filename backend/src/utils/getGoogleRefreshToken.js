// backend/src/utils/getGoogleRefreshToken.js

const { google } = require('googleapis');
require('dotenv').config();

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Escopos necessários para Calendar
const SCOPES = [
  'https://www.googleapis.com/auth/calendar.events'
];

const url = oauth2Client.generateAuthUrl({
  access_type: 'offline',   // 🔹 ESSENCIAL para receber refresh token
  scope: SCOPES,
  prompt: 'consent'         // 🔹 Força o Google a sempre devolver refresh_token
});

console.log('\n👉 Abra este link no navegador:\n');
console.log(url);
