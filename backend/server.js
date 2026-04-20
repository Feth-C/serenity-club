// backend/server.js

const app = require('./app');
const { migrate } = require('./src/database/migrateDb');

const PORT = process.env.PORT || 3000;

async function start() {

  try {

    await migrate();

    app.listen(PORT, () => {
      console.log(`Server in esecuzione sulla porta ${PORT}`);
    });

  } catch (err) {

    console.error("Erro ao iniciar servidor:", err);
    process.exit(1);

  }

}

start();