// Lógica de contraseñas (BCrypt) y tokens (JWT).
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const VUELTAS_BCRYPT = 10;
export const DURACION_TOKEN = "8h";

export function hashearPassword(password) {
  return bcrypt.hash(password, VUELTAS_BCRYPT);
}

export function compararPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

// Hash de mentira: se usa cuando el correo no existe, para que el login
// tarde lo mismo y no se pueda adivinar qué correos están registrados.
export const HASH_FALSO = bcrypt.hashSync("no-es-una-clave-real-1", VUELTAS_BCRYPT);

function claveSecreta() {
  const clave = process.env.JWT_SECRET;
  if (!clave) throw new Error("Falta JWT_SECRET en las variables de entorno");
  return clave;
}

// El token lleva SOLO id, correo y rol. Nada privado.
export function crearToken(usuario) {
  return jwt.sign(
    { id: usuario.id_usuario, email: usuario.email, rol: usuario.rol },
    claveSecreta(),
    { expiresIn: DURACION_TOKEN, algorithm: "HS256" }
  );
}

// Lanza error si el token es falso o venció
export function leerToken(token) {
  return jwt.verify(token, claveSecreta(), { algorithms: ["HS256"] });
}
