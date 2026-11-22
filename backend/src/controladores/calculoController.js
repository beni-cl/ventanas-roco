import { calcularDespiece } from "../servicios/motorDespieceAlgoritmo.js";

export function calcularDespieceController(req, res) {
  try {
    const { anchoMm, altoMm, material } = req.body;
    const resultado = calcularDespiece(anchoMm, altoMm, material);
    res.status(200).json(resultado);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}
