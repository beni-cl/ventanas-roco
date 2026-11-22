import { prepararVentanas } from "../servicios/cotizacionVentanas.js";
import { guardarCotizacion } from "../servicios/cotizacionServicio.js";

export async function crearCotizacionController(req, res) {
  let ventanas;
  try {
    ventanas = prepararVentanas(req.body?.ventanas);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }

  try {
    const cotizacion = await guardarCotizacion(req.usuario.id, ventanas);
    return res.status(201).json(cotizacion);
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ error: "No se pudo guardar la cotizacion" });
  }
}
