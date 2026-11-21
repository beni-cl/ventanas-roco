// Manejo de errores: el usuario ve un mensaje simple; el detalle solo sale en la terminal.

export function rutaNoEncontrada(req, res) {
  res.status(404).json({ error: "Ruta no encontrada" });
}

// Express 5 envía aquí también los errores de funciones async
// eslint-disable-next-line no-unused-vars
export function manejarErrores(error, req, res, next) {
  // JSON mal escrito en el cuerpo de la petición
  if (error.type === "entity.parse.failed") {
    return res.status(400).json({ error: "El cuerpo de la petición no es un JSON válido" });
  }
  if (error.type === "entity.too.large") {
    return res.status(400).json({ error: "La petición es demasiado grande" });
  }

  if (process.env.NODE_ENV !== "test") console.error(error);
  res.status(500).json({ error: "Ocurrió un error en el servidor. Inténtalo más tarde" });
}
