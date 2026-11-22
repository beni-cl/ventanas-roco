import { calcularDespieceController } from "../controladores/calculoController.js";
import { Router } from "express";

const router = Router();

router.post("/calcular", calcularDespieceController);

export default router;
