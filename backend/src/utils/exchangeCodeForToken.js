// backend/src/utils/exchangeCodeForToken.js

const { google } = require('googleapis');
require('dotenv').config();

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

const CODE = process.argv[2]; // vamos passar o código por parâmetro

async function getToken() {
  const { tokens } = await oauth2Client.getToken(CODE);

  console.log('\n✅ REFRESH TOKEN GERADO:\n');
  console.log(tokens.refresh_token);

  console.log('\n👉 Copie isso e cole no .env como:');
  console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`);
}

getToken();


// node src/utils/exchangeCodeForToken.js "SEU_CODIGO_AQUI - depois de rodar o getGoogleRefreshToken.js"
//http://localhost:3000/auth/google/callback?code="----CODIGO PARA RODAR----"&scope=https://www.googleapis.com/auth/calendar.events