import { enviarRespuesta } from "../servicios/cotizacionRespuestaServicio.js";
import { responderError } from "../servicios/errorHttp.js";

export async function enviarCotizacionController(req, res) {
  try {
    res.json(
      await enviarRespuesta(req.params.id, req.usuario, req.body ?? {}, req.ip),
    );
  } catch (error) {
    responderError(res, error);
  }
}
