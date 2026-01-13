// backend/server.js

const app = require('./app');
const PORT = process.env.PORT || 3000;

// -----------------------------
// Inicializa o servidor
// -----------------------------
app.listen(PORT, () => {
  console.log(`Server in esecuzione sulla porta ${PORT}`);
});
