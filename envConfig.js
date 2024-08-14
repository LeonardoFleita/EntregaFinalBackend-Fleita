// config.js
const path = require("path");
const dotenv = require("dotenv");

// Determina el archivo de entorno correcto
const envFile = path.resolve(
  __dirname,
  `.env.${process.env.NODE_ENV || "production"}`
);
dotenv.config({ path: envFile });
