import {
  listarInventario,
  actualizarPrecio,
} from "../servicios/inventarioServicio.js";
import { responderError } from "../servicios/errorHttp.js";

export async function listarInventarioController(req, res) {
  try {
    res.json(await listarInventario());
  } catch (error) {
    responderError(res, error);
  }
}

export async function actualizarPrecioController(req, res) {
  try {
    res.json(
      await actualizarPrecio(req.params.id, req.usuario, req.body ?? {}, req.ip),
    );
  } catch (error) {
    responderError(res, error);
  }
}
