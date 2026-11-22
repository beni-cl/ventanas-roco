import {
  listarMias,
  obtenerCotizacion,
  listarSolicitudes,
  iniciarRevision,
} from "../servicios/cotizacionConsultaServicio.js";
import { responderError } from "../servicios/errorHttp.js";

export async function misCotizacionesController(req, res) {
  try {
    res.json(await listarMias(req.usuario.id));
  } catch (error) {
    responderError(res, error);
  }
}

export async function verCotizacionController(req, res) {
  try {
    res.json(await obtenerCotizacion(req.params.id, req.usuario));
  } catch (error) {
    responderError(res, error);
  }
}

export async function solicitudesController(req, res) {
  try {
    res.json(await listarSolicitudes(req.query.estado));
  } catch (error) {
    responderError(res, error);
  }
}

export async function revisarCotizacionController(req, res) {
  try {
    res.json(await iniciarRevision(req.params.id, req.usuario));
  } catch (error) {
    responderError(res, error);
  }
}
