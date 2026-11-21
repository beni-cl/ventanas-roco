// Guardia 2: ¿Tu rol puede entrar aquí?
// Uso en una ruta (siempre DESPUÉS de verificarToken):
//   router.get("/algo", verificarToken, verificarPermiso("COSTOS_VER"), manejador);
import { sequelize } from "../config/baseDatos.js";

export function verificarPermiso(codigoPermiso) {
  return async (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({ error: "Debes iniciar sesión" });
    }

    // ¿Hay una fila en rol_permiso que una el rol del usuario con este permiso?
    const [filas] = await sequelize.query(
      `SELECT 1
         FROM rol_permiso rp
         JOIN roles r    ON r.id_rol = rp.id_rol
         JOIN permisos p ON p.id_permiso = rp.id_permiso
        WHERE r.nombre = :rol AND p.codigo = :codigo
        LIMIT 1`,
      { replacements: { rol: req.usuario.rol, codigo: codigoPermiso } }
    );

    if (filas.length === 0) {
      return res.status(403).json({ error: "No tienes permiso para esta acción" });
    }
    next();
  };
}
