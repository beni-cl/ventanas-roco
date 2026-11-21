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

export const HASH_FALSO = bcrypt.hashSync(
  "no-es-una-clave-real-1",
  VUELTAS_BCRYPT,
);

function claveSecreta() {
  const clave = process.env.JWT_SECRET;
  if (!clave) throw new Error("Falta JWT_SECRET en las variables de entorno");
  return clave;
}

export function crearToken(usuario) {
  return jwt.sign(
    { id: usuario.id_usuario, email: usuario.email, rol: usuario.rol },
    claveSecreta(),
    { expiresIn: DURACION_TOKEN, algorithm: "HS256" },
  );
}

export function leerToken(token) {
  return jwt.verify(token, claveSecreta(), { algorithms: ["HS256"] });
}
