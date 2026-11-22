import { Router } from "express";
import { verificarToken } from "../middleware/verificarToken.js";
import { verificarPermiso } from "../middleware/verificarPermiso.js";
import { solicitudesController } from "../controladores/cotizacionConsultaController.js";

const router = Router();

router.get("/solicitudes", verificarToken, verificarPermiso("DESPIECE_VER"), solicitudesController);

export default router;