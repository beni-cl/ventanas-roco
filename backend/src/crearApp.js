// Arma la aplicación Express (sin encenderla). Así las pruebas con Supertest
// pueden usarla sin abrir un puerto. El servidor se enciende en app.js.
import express from "express";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { sequelize } from "./config/baseDatos.js";
import { limitadorGeneral } from "./middleware/limitadores.js";
import { manejarErrores, rutaNoEncontrada } from "./middleware/errores.js";
import auth from "./controladores/auth.js";
import catalogo from "./controladores/catalogo.js";

const carpetaActual = path.dirname(fileURLToPath(import.meta.url));

// Dónde queda el React ya compilado (npm run build). Se puede cambiar con FRONTEND_DIST.
const carpetaFrontend =
  process.env.FRONTEND_DIST || path.join(carpetaActual, "..", "..", "frontend", "dist");

export function crearApp() {
  const app = express();

  // Detrás del proxy de la plataforma (Render, Railway...) la IP real viene en un encabezado
  app.set("trust proxy", 1);
  app.use(express.json({ limit: "100kb" }));
  app.use("/api", limitadorGeneral);

  app.get("/api/salud", async (req, res) => {
    try {
      await sequelize.authenticate();
      res.json({ estado: "ok", baseDatos: "conectada" });
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ estado: "error", baseDatos: "sin conexión" });
    }
  });

  app.use("/api/auth", auth);
  app.use("/api/catalogo", catalogo);

  // Cualquier /api desconocida responde JSON 404 (antes de las pantallas de React)
  app.use("/api", rutaNoEncontrada);

  // Si existe el React compilado, Express entrega las pantallas (un solo servicio)
  if (fs.existsSync(path.join(carpetaFrontend, "index.html"))) {
    app.use(express.static(carpetaFrontend));
    app.get("/{*ruta}", (req, res) => res.sendFile(path.join(carpetaFrontend, "index.html")));
  } else {
    app.get("/", (req, res) => {
      res.json({ mensaje: "API de Ventanas Roco", prueba: "/api/salud" });
    });
  }

  app.use(rutaNoEncontrada);
  app.use(manejarErrores);
  return app;
}
