import { Router } from "express";
import { verificarToken } from "../middleware/verificarToken.js";
import { verificarPermiso } from "../middleware/verificarPermiso.js";
import { crearCotizacionController } from "../controladores/cotizacionController.js";

const router = Router();

// Solo un usuario con sesion iniciada (token) y permiso de Cliente puede solicitar cotizaciones
router.post(
  "/",
  verificarToken,
  verificarPermiso("COTIZACION_SOLICITAR"),
  crearCotizacionController,
);

export default router;
