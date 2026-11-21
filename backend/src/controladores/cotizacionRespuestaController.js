import { enviarRespuesta } from "../servicios/cotizacionRespuestaServicio.js";
import { responderError } from "../servicios/errorHttp.js";

// Cuerpo esperado: { "margen_aplicado": 30, "mano_obra": 50000, "instalacion": 30000 }
export async function enviarCotizacionController(req, res) {
  try {
    res.json(await enviarRespuesta(req.params.id, req.usuario, req.body ?? {}, req.ip));
  } catch (error) {
    responderError(res, error);
  }
}