import "dotenv/config";
import express from "express";
import { sequelize } from "./config/baseDatos.js";

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ mensaje: "API de Ventanas Roco", prueba: "/api/salud" });
});

// Ruta de salud: responde ok solo si el servidor y la base de datos funcionan
app.get("/api/salud", async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ estado: "ok", baseDatos: "conectada" });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ estado: "error", baseDatos: "sin conexión" });
  }
});

const PUERTO = process.env.PORT || 8080;

app.listen(PUERTO, () => {
  console.log(`Servidor en http://localhost:${PUERTO}`);
  console.log(`Prueba: http://localhost:${PUERTO}/api/salud`);
});