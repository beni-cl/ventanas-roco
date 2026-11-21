import { prepararVentanas } from "../servicios/cotizacionVentanas.js";
import { guardarCotizacion } from "../servicios/cotizacionServicio.js";

// POST /api/cotizaciones  (rol Cliente, ya autenticado: req.usuario viene del token)
// Cuerpo esperado: { "ventanas": [ { anchoMm, altoMm, material, tipoPerfil, colorPerfil, tipoVidrio, cantidad } ] }
export async function crearCotizacionController(req, res) {
  let ventanas;
  try {
    ventanas = prepararVentanas(req.body?.ventanas);
  } catch (error) {
    // Datos mal enviados: el cliente puede corregirlos
    return res.status(400).json({ error: error.message });
  }

  try {
    const cotizacion = await guardarCotizacion(req.usuario.id, ventanas);
    return res.status(201).json(cotizacion);
  } catch (error) {
    // Falla nuestra (base de datos): no se le muestra el detalle al cliente
    console.error(error.message);
    return res.status(500).json({ error: "No se pudo guardar la cotizacion" });
  }
}
