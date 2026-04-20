// backend/app.js

const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config({
  path: path.join(__dirname, ".env")
});

const routes = require("./src/routes");
const errorHandler = require("./src/middlewares/errorHandler");

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.use("/api", routes);

app.use(errorHandler);

module.exports = app;