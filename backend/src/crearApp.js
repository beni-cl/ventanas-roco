import express from "express";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { sequelize } from "./config/baseDatos.js";
import { limitadorGeneral } from "./middleware/limitadores.js";
import { manejarErrores, rutaNoEncontrada } from "./middleware/errores.js";
import auth from "./controladores/auth.js";
import catalogo from "./controladores/catalogo.js";
import calculoRutas from "./rutas/calculoRutas.js";
import cotizacionRutas from "./rutas/cotizacionRutas.js";
import fabricanteRutas from "./rutas/fabricanteRutas.js";

const carpetaActual = path.dirname(fileURLToPath(import.meta.url));

const carpetaFrontend =
  process.env.FRONTEND_DIST ||
  path.join(carpetaActual, "..", "..", "frontend", "dist");

export function crearApp() {
  const app = express();

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
  app.use("/api/despiece", calculoRutas);
  app.use("/api/cotizaciones", cotizacionRutas);
  app.use("/api/fabricante", fabricanteRutas);

  app.use("/api", rutaNoEncontrada);

  if (fs.existsSync(path.join(carpetaFrontend, "index.html"))) {
    app.use(express.static(carpetaFrontend));
    app.get("/{*ruta}", (req, res) =>
      res.sendFile(path.join(carpetaFrontend, "index.html")),
    );
  } else {
    app.get("/", (req, res) => {
      res.json({ mensaje: "API de Ventanas Roco", prueba: "/api/salud" });
    });
  }

  app.use(rutaNoEncontrada);
  app.use(manejarErrores);
  return app;
}
