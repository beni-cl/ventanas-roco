import { Router } from "express";
import { verificarToken } from "../middleware/verificarToken.js";
import { verificarPermiso } from "../middleware/verificarPermiso.js";
import { crearCotizacionController } from "../controladores/cotizacionController.js";
import {
  misCotizacionesController,
  verCotizacionController,
  revisarCotizacionController,
} from "../controladores/cotizacionConsultaController.js";
import { enviarCotizacionController } from "../controladores/cotizacionRespuestaController.js";

const router = Router();

// Cliente: solicitar y ver las suyas
router.post("/", verificarToken, verificarPermiso("COTIZACION_SOLICITAR"), crearCotizacionController);
router.get("/mias", verificarToken, verificarPermiso("COTIZACION_VER_PROPIAS"), misCotizacionesController);

// Detalle: cualquier usuario con sesion; el servicio decide que parte ve segun su rol
// (debe ir DESPUES de /mias, si no "mias" se leeria como un id)
router.get("/:id", verificarToken, verCotizacionController);

// Fabricante: tomar una solicitud y luego enviar el precio
router.put("/:id/revisar", verificarToken, verificarPermiso("DESPIECE_VER"), revisarCotizacionController);
router.put(
  "/:id/enviar",
  verificarToken,
  verificarPermiso("COTIZACION_AJUSTAR_CONGELAR"),
  enviarCotizacionController
);

export default router;