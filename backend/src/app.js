import "dotenv/config";
import express from "express";

const app = express();
app.use(express.json());

// Raíz: indica que es la API y dónde probarla
app.get("/", (req, res) => {
  res.json({ mensaje: "API de Ventanas Roco", prueba: "/api/salud" });
});

// Ruta de prueba: confirma que el servidor está vivo
app.get("/api/salud", (req, res) => {
  res.json({ estado: "ok", sistema: "Ventanas Roco" });
});

const PUERTO = process.env.PORT || 8080;

app.listen(PUERTO, () => {
  console.log(`Servidor en http://localhost:${PUERTO}`);
  console.log(`Prueba: http://localhost:${PUERTO}/api/salud`);
});
