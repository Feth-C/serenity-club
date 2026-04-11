// backend/app.js

const path = require('path');
require('dotenv').config({
  path: path.resolve(__dirname, '.env')
});

const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./src/docs/swagger');
const routes = require('./src/routes');
const errorHandler = require('./src/middlewares/errorHandler');

const app = express();

// -----------------------------
// CORS
// -----------------------------
app.use(cors({
  origin: true,
  credentials: true
}));

// -----------------------------
// Middlewares globais
// -----------------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// -----------------------------
// Healthcheck
// -----------------------------
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// -----------------------------
// Rotas da API
// -----------------------------
app.use('/api', routes);

// -----------------------------
// Swagger UI
// -----------------------------
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));

// -----------------------------
// Error Handler (sempre por último)
// -----------------------------
app.use(errorHandler);

module.exports = app;