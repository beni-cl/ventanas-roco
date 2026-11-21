import { Router } from "express";
import { verificarToken } from "../middleware/verificarToken.js";
import { verificarPermiso } from "../middleware/verificarPermiso.js";
import {
  listarInventarioController,
  actualizarPrecioController,
} from "../controladores/inventarioController.js";

const router = Router();

router.get(
  "/",
  verificarToken,
  verificarPermiso("COSTOS_VER"),
  listarInventarioController,
);
router.put(
  "/:id",
  verificarToken,
  verificarPermiso("INVENTARIO_EDITAR"),
  actualizarPrecioController,
);

export default router;
