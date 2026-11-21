// Guardia 1: ¿Traes pulsera?
// Revisa que la petición traiga un token válido y que no haya vencido.
// Si es válido, deja en req.usuario = { id, email, rol } para que la ruta lo use.
import { leerToken } from "../servicios/autenticacion.js";

export function verificarToken(req, res, next) {
  const encabezado = req.headers.authorization || "";
  const [tipo, token] = encabezado.split(" ");

  if (tipo !== "Bearer" || !token) {
    return res.status(401).json({ error: "Debes iniciar sesión" });
  }

  try {
    const datos = leerToken(token);
    req.usuario = { id: datos.id, email: datos.email, rol: datos.rol };
    next();
  } catch {
    // Token falso, alterado o vencido: mismo mensaje para todos los casos
    res.status(401).json({ error: "Sesión inválida o vencida" });
  }
}
